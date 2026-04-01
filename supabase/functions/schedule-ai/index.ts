import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: any;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { type, postContent } = body;

    // Validate type
    const allowedTypes = ["suggest_times", "first_comments", "reply_suggestions"];
    if (!type || !allowedTypes.includes(type)) {
      return new Response(JSON.stringify({ error: `Invalid type. Allowed: ${allowedTypes.join(", ")}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate postContent
    if (!postContent || typeof postContent !== "string" || postContent.length > 2000) {
      return new Response(JSON.stringify({ error: "postContent is required and must be under 2000 characters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate comment for reply_suggestions
    if (type === "reply_suggestions" && body.comment && (typeof body.comment !== "string" || body.comment.length > 1000)) {
      return new Response(JSON.stringify({ error: "Comment must be a string under 1000 characters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Sanitize inputs for prompt injection
    const safePostContent = postContent.replace(/[\"\\]/g, '').slice(0, 2000);
    const safeComment = body.comment ? String(body.comment).replace(/[\"\\]/g, '').slice(0, 1000) : 'Great post!';

    const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
    if (!DEEPSEEK_API_KEY) throw new Error("DeepSeek API key is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "suggest_times") {
      systemPrompt = `You are an Instagram engagement optimization AI. Analyze the post content and suggest optimal posting times. You must respond with ONLY valid JSON, no markdown.`;
      userPrompt = `For this Instagram post: "${safePostContent}"

Return a JSON object with this exact structure:
{
  "suggestions": [
    {
      "time": "HH:MM AM/PM",
      "day": "Today/Tomorrow/Day name",
      "engagementScore": 85,
      "reason": "Brief reason why this time is optimal"
    }
  ]
}

Provide exactly 3 suggestions ranked by predicted engagement score (0-100).`;
    } else if (type === "first_comments") {
      systemPrompt = `You are an Instagram engagement expert. Generate first comments that boost post visibility and engagement. You must respond with ONLY valid JSON, no markdown.`;
      userPrompt = `For this Instagram post: "${safePostContent}"

Return a JSON object with this exact structure:
{
  "comments": [
    {
      "type": "cta",
      "text": "The comment text",
      "description": "Why this comment works"
    }
  ]
}

Generate exactly 3 comments:
1. type "cta" - A call-to-action comment that drives saves/shares
2. type "question" - A question that encourages replies and discussion
3. type "hashtag" - An algorithm-boosting comment with relevant hashtags`;
    } else if (type === "reply_suggestions") {
      systemPrompt = `You are an Instagram engagement AI. Suggest replies to comments that maintain engagement momentum. You must respond with ONLY valid JSON, no markdown.`;
      userPrompt = `Original post: "${safePostContent}"
Comment to reply to: "${safeComment}"

Return a JSON object:
{
  "replies": [
    { "text": "Reply text", "tone": "friendly/professional/playful" }
  ]
}

Generate 3 reply options with different tones.`;
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("DeepSeek error:", response.status, t);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("schedule-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
