import { defineMcp } from "@lovable.dev/mcp-js";
import getPlatformDimensions from "./tools/get-platform-dimensions";
import listPlatformPresets from "./tools/list-platform-presets";
import generateHashtags from "./tools/generate-hashtags";
import generateCaptions from "./tools/generate-captions";

export default defineMcp({
  name: "socialtool-mcp",
  title: "SocialTool",
  version: "0.1.0",
  instructions:
    "Tools from SocialTool, an AI social-media suite. Use `list_platform_presets` and `get_platform_dimensions` for social media image sizes (Instagram, TikTok, LinkedIn, YouTube, etc.). Use `generate_captions` to draft 3 caption variations from a description. Use `generate_hashtags` to produce relevant hashtags for a topic and platform.",
  tools: [
    listPlatformPresets,
    getPlatformDimensions,
    generateCaptions,
    generateHashtags,
  ],
});
