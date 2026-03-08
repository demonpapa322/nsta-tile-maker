import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { category, platform } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key is not configured");

    const categoryContext = category
      ? `Focus specifically on the "${category}" niche/category.`
      : "Cover a broad range of popular niches (lifestyle, tech, food, fitness, fashion, travel, business).";

    const platformContext = platform
      ? `Focus only on ${platform}.`
      : "Cover both Instagram and X (Twitter).";

    const systemPrompt = `You are a Viral Trend Scout AI agent for social media creators. Your job is to identify what's currently trending and viral on Instagram and X (Twitter), then suggest specific AI image generation prompts that capitalize on those trends.

${categoryContext}
${platformContext}

For each trend you identify, provide:
1. The trend name/topic
2. Which platform(s) it's trending on
3. Why it's going viral (brief explanation)
4. Relevant hashtags creators should use
5. A specific, detailed image generation prompt that would create content aligned with this trend
6. An engagement score estimate (1-100)

Return EXACTLY 6 trends. Be specific and actionable.

You MUST respond with ONLY valid JSON matching this exact structure, no markdown, no code fences:
{
  "trends": [
    {
      "title": "Trend name",
      "platform": "instagram" or "twitter" or "both",
      "reason": "Why it's viral",
      "hashtags": ["#tag1", "#tag2"],
      "image_prompt": "Detailed AI image generation prompt",
      "engagement_score": 85,
      "category": "lifestyle"
    }
  ]
}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nsta-tile-maker.lovable.app",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Scan for the hottest viral trends right now on social media. What visual content styles, topics, and formats are getting the most engagement? Give me trend-based image prompts I can use immediately." },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("OpenRouter error:", response.status, text);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      parsed = JSON.parse(cleaned);
    } catch {
      // Try extracting JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { trends: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trend-scout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
