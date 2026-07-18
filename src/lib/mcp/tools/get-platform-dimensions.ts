import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const PRESETS: Record<string, { platform: string; label: string; width: number; height: number }> = {
  "ig-square":    { platform: "Instagram",   label: "Square Post",    width: 1080, height: 1080 },
  "ig-portrait":  { platform: "Instagram",   label: "Portrait Post",  width: 1080, height: 1350 },
  "ig-landscape": { platform: "Instagram",   label: "Landscape Post", width: 1080, height: 566  },
  "ig-story":     { platform: "Instagram",   label: "Story / Reel",   width: 1080, height: 1920 },
  "fb-post":      { platform: "Facebook",    label: "Post",           width: 1200, height: 630  },
  "fb-cover":     { platform: "Facebook",    label: "Cover Photo",    width: 820,  height: 312  },
  "tw-post":      { platform: "Twitter / X", label: "Post Image",     width: 1600, height: 900  },
  "tw-header":    { platform: "Twitter / X", label: "Header",         width: 1500, height: 500  },
  "yt-thumb":     { platform: "YouTube",     label: "Thumbnail",      width: 1280, height: 720  },
  "yt-banner":    { platform: "YouTube",     label: "Channel Banner", width: 2560, height: 1440 },
  "li-post":      { platform: "LinkedIn",    label: "Post",           width: 1200, height: 627  },
  "li-cover":     { platform: "LinkedIn",    label: "Cover",          width: 1584, height: 396  },
  "pin-standard": { platform: "Pinterest",   label: "Standard Pin",   width: 1000, height: 1500 },
  "tt-video":     { platform: "TikTok",      label: "Video Cover",    width: 1080, height: 1920 },
};

export default defineTool({
  name: "get_platform_dimensions",
  title: "Get platform image dimensions",
  description:
    "Return the recommended pixel dimensions for a social media image preset (Instagram, Facebook, Twitter/X, YouTube, LinkedIn, Pinterest, TikTok). Use this to tell users what size an image should be for a given platform placement.",
  inputSchema: {
    preset: z
      .enum([
        "ig-square", "ig-portrait", "ig-landscape", "ig-story",
        "fb-post", "fb-cover",
        "tw-post", "tw-header",
        "yt-thumb", "yt-banner",
        "li-post", "li-cover",
        "pin-standard", "tt-video",
      ])
      .describe("Preset ID, e.g. 'ig-story' for Instagram Story/Reel (1080x1920)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ preset }) => {
    const p = PRESETS[preset];
    const text = `${p.platform} — ${p.label}: ${p.width}×${p.height}px`;
    return {
      content: [{ type: "text", text }],
      structuredContent: { preset, ...p },
    };
  },
});
