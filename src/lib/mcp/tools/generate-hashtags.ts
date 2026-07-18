import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "generate_hashtags",
  title: "Generate hashtags",
  description:
    "Generate a set of relevant, on-trend hashtags for a social media post given a topic/description and target platform. Mixes broad-reach and niche tags.",
  inputSchema: {
    topic: z.string().min(3).max(500).describe("Topic or post description to generate hashtags for."),
    platform: z
      .enum(["instagram", "twitter", "linkedin", "tiktok"])
      .default("instagram")
      .describe("Target platform. Instagram/TikTok use more hashtags; LinkedIn/Twitter use fewer."),
    count: z.number().int().min(3).max(30).default(15).describe("How many hashtags to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ topic, platform, count }) => {
    const apiKey = (globalThis as any).Deno?.env?.get?.("OPENROUTER_API_KEY");
    if (!apiKey) {
      return {
        content: [{ type: "text", text: "Hashtag generation is not configured on this server." }],
        isError: true,
      };
    }

    const prompt = `Generate exactly ${count} hashtags for a ${platform} post about: "${topic}".
Rules:
- Mix broad-reach and niche tags.
- No spaces, each starts with #.
- Return ONLY the hashtags separated by spaces, no commentary.`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        content: [{ type: "text", text: `Hashtag service error ${res.status}: ${errText.slice(0, 200)}` }],
        isError: true,
      };
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const tags = Array.from(raw.matchAll(/#[\w\u00C0-\uFFFF]+/g)).map((m) => m[0]).slice(0, count);

    return {
      content: [{ type: "text", text: tags.join(" ") }],
      structuredContent: { platform, count: tags.length, hashtags: tags },
    };
  },
});
