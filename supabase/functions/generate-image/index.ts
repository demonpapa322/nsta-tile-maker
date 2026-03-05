import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const styleMap: Record<string, string> = {
  photorealistic: "Ultra-realistic photograph, high detail, natural lighting,",
  illustration: "Beautiful digital illustration, vibrant colors, artistic style,",
  "3d-render": "Professional 3D render, smooth surfaces, dramatic lighting,",
  watercolor: "Delicate watercolor painting, soft edges, blended colors,",
  "pixel-art": "Retro pixel art style, 8-bit aesthetic, clean pixels,",
  "oil-painting": "Classical oil painting, rich textures, masterful brushwork,",
  anime: "High quality anime art style, expressive, clean lines,",
  minimalist: "Minimalist design, clean composition, limited palette,",
};

async function callImageModel(fullPrompt: string, apiKey: string, model: string): Promise<Response> {
  return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: fullPrompt }],
      modalities: ["image", "text"],
    }),
  });
}

function extractImageUrl(data: any): string | null {
  // Try the images array format first
  const fromImages = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (fromImages) return fromImages;

  // Try inline_data format (some models return this)
  const parts = data?.choices?.[0]?.message?.content;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part?.type === "image_url" && part?.image_url?.url) {
        return part.image_url.url;
      }
      if (part?.inline_data?.data) {
        const mime = part.inline_data.mime_type || "image/png";
        return `data:${mime};base64,${part.inline_data.data}`;
      }
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const { prompt, style } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "A prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stylePrefix = style && styleMap[style] ? styleMap[style] : "";
    const fullPrompt = `${stylePrefix} ${prompt.trim()}. High resolution.`.trim();

    console.log("Generating image with prompt:", fullPrompt.slice(0, 100));

    // Try primary model, fallback to secondary
    const models = ["google/gemini-2.5-flash-image", "google/gemini-3-pro-image-preview"];
    let lastError = "";

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        const response = await callImageModel(fullPrompt, LOVABLE_API_KEY, model);

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
          const errorText = await response.text();
          console.error(`Model ${model} error ${response.status}:`, errorText.slice(0, 300));
          lastError = `Model ${model} returned ${response.status}`;
          continue; // try next model
        }

        // Parse response safely
        const rawText = await response.text();
        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          console.error(`JSON parse error for ${model}:`, rawText.slice(0, 500));
          lastError = `Invalid JSON response from ${model}`;
          continue; // try next model
        }

        console.log(`${model} response keys:`, Object.keys(data));

        const imageUrl = extractImageUrl(data);
        const textContent = data?.choices?.[0]?.message?.content;
        const description = typeof textContent === "string" ? textContent : "";

        if (!imageUrl) {
          console.error(`No image found in ${model} response:`, JSON.stringify(data).slice(0, 500));
          lastError = `No image in ${model} response`;
          continue; // try next model
        }

        console.log(`Image generated successfully with ${model}`);
        return new Response(
          JSON.stringify({ imageUrl, description }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (modelErr) {
        console.error(`Exception with ${model}:`, modelErr);
        lastError = modelErr instanceof Error ? modelErr.message : `${model} failed`;
        continue;
      }
    }

    // All models failed
    return new Response(
      JSON.stringify({ error: `Image generation failed: ${lastError}. Please try again.` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-image fatal error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
