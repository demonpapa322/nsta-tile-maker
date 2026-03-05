import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageUrl, tone, platforms } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(
        JSON.stringify({ error: "An image is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformList = platforms?.length ? platforms : ["instagram", "twitter", "linkedin", "tiktok"];
    const toneInstruction = tone?.trim() ? `Use this tone/style: "${tone.trim()}".` : "Use a natural, engaging tone.";

    const systemPrompt = `You are an expert social media copywriter. Analyze the provided image and generate captions for the requested platforms.

${toneInstruction}

For EACH platform, generate exactly 3 caption variations. Each caption MUST include:
- Relevant emojis woven naturally into the text
- Platform-appropriate length and style
- 5-8 relevant hashtags at the end

Platform guidelines:
- instagram: Storytelling, emotional, 1-3 short paragraphs, generous emojis, up to 8 hashtags
- twitter: Punchy, under 280 chars including hashtags, witty
- linkedin: Professional but personable, thought-leadership angle, 2-3 sentences, fewer emojis
- tiktok: Trendy, casual, hook-driven, short, use trending hashtag styles

You MUST respond with ONLY valid JSON matching this exact structure, no markdown, no code fences:
{
  "image_description": "brief description of what's in the image",
  "captions": {
    "platform_name": [
      { "text": "caption text with emojis", "hashtags": ["#tag1", "#tag2"] },
      { "text": "caption text with emojis", "hashtags": ["#tag1", "#tag2"] },
      { "text": "caption text with emojis", "hashtags": ["#tag1", "#tag2"] }
    ]
  }
}

Only include platforms: ${platformList.join(", ")}`;

    console.log("Generating captions for platforms:", platformList.join(", "));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image and generate social media captions as specified." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText.slice(0, 300));
      return new Response(
        JSON.stringify({ error: "Caption generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawText = await response.text();
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("JSON parse error from AI gateway:", rawText.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Invalid response from AI. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content in response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "No captions generated. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the structured caption JSON from the model's content
    let captions: any;
    try {
      // Strip markdown code fences if present
      let cleaned = content.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      }
      captions = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse captions JSON:", content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse generated captions. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Captions generated successfully");
    return new Response(
      JSON.stringify(captions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-captions fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
