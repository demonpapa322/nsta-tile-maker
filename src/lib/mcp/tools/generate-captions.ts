import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "generate_captions",
  title: "Generate social media captions",
  description:
    "Generate 3 caption variations for a social media post from a text description. Supports different tones and target platforms (Instagram, Twitter/X, LinkedIn, TikTok).",
  inputSchema: {
    description: z.string().min(3).max(1000).describe("Description of the post/image/content."),
    tone: z
      .enum(["engaging", "professional", "casual", "funny", "inspirational"])
      .default("engaging")
      .describe("Desired tone of the captions."),
    platform: z
      .enum(["instagram", "twitter", "linkedin", "tiktok"])
      .default("instagram")
      .describe("Target platform — affects length and style."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ description, tone, platform }) => {
    const apiKey = (globalThis as any).Deno?.env?.get?.("OPENROUTER_API_KEY");
    if (!apiKey) {
      return {
        content: [{ type: "text", text: "Caption generation is not configured on this server." }],
        isError: true,
      };
    }

    const lengthGuide: Record<string, string> = {
      instagram: "1-3 sentences, can include emojis",
      twitter: "under 240 characters, punchy",
      linkedin: "2-4 sentences, professional",
      tiktok: "1-2 short lines, playful",
    };

    const prompt = `Write 3 distinct ${tone} captions for a ${platform} post about: "${description}".
Style: ${lengthGuide[platform]}.
Return ONLY the 3 captions, numbered 1., 2., 3., no other commentary.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        content: [{ type: "text", text: `Caption service error ${res.status}: ${errText.slice(0, 200)}` }],
        isError: true,
      };
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const captions = raw
      .split(/\n+/)
      .map((l) => l.replace(/^\s*\d+[\.\)]\s*/, "").trim())
      .filter((l) => l.length > 0)
      .slice(0, 3);

    return {
      content: [{ type: "text", text: captions.map((c, i) => `${i + 1}. ${c}`).join("\n\n") }],
      structuredContent: { platform, tone, captions },
    };
  },
});
