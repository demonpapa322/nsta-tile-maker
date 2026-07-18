import { defineTool } from "@lovable.dev/mcp-js";

const PRESETS = [
  { preset: "ig-square",    platform: "Instagram",   label: "Square Post",    width: 1080, height: 1080 },
  { preset: "ig-portrait",  platform: "Instagram",   label: "Portrait Post",  width: 1080, height: 1350 },
  { preset: "ig-landscape", platform: "Instagram",   label: "Landscape Post", width: 1080, height: 566  },
  { preset: "ig-story",     platform: "Instagram",   label: "Story / Reel",   width: 1080, height: 1920 },
  { preset: "fb-post",      platform: "Facebook",    label: "Post",           width: 1200, height: 630  },
  { preset: "fb-cover",     platform: "Facebook",    label: "Cover Photo",    width: 820,  height: 312  },
  { preset: "tw-post",      platform: "Twitter / X", label: "Post Image",     width: 1600, height: 900  },
  { preset: "tw-header",    platform: "Twitter / X", label: "Header",         width: 1500, height: 500  },
  { preset: "yt-thumb",     platform: "YouTube",     label: "Thumbnail",      width: 1280, height: 720  },
  { preset: "yt-banner",    platform: "YouTube",     label: "Channel Banner", width: 2560, height: 1440 },
  { preset: "li-post",      platform: "LinkedIn",    label: "Post",           width: 1200, height: 627  },
  { preset: "li-cover",     platform: "LinkedIn",    label: "Cover",          width: 1584, height: 396  },
  { preset: "pin-standard", platform: "Pinterest",   label: "Standard Pin",   width: 1000, height: 1500 },
  { preset: "tt-video",     platform: "TikTok",      label: "Video Cover",    width: 1080, height: 1920 },
];

export default defineTool({
  name: "list_platform_presets",
  title: "List platform image presets",
  description:
    "List every supported social media image preset with its platform, label, and pixel dimensions. Use this when the caller wants to browse available sizes or pick the right preset ID.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: PRESETS.map((p) => `${p.preset} — ${p.platform} ${p.label} (${p.width}×${p.height})`).join("\n"),
      },
    ],
    structuredContent: { presets: PRESETS },
  }),
});
