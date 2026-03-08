import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are "Social AI", the intelligent assistant powering SocialTool — an all-in-one AI social media suite. You can autonomously execute tasks for users using the tools available to you.

**Your Capabilities:**
You have access to powerful tools that let you DO things, not just talk about them:
- Generate AI images from text prompts
- Generate captions for images across platforms (Instagram, X, LinkedIn, TikTok)
- Find trending topics and viral content ideas
- Resize images for any social media platform
- Split images into Instagram grid layouts

**Behavior Rules:**
1. When a user asks you to DO something (resize, generate, create, split, find trends, etc.) — USE THE APPROPRIATE TOOL immediately. Do NOT redirect them to another page.
2. When a user asks a QUESTION (how to, what is, tips, etc.) — answer conversationally with expert advice.
3. Always confirm what you're doing: "I'm resizing your image to Instagram Story dimensions (1080×1920)..."
4. After executing a tool, explain the result clearly.
5. If you need more information (like an image for resizing), ask for it specifically.

**Communication Style:**
- Concise, action-oriented, professional but friendly
- Use bullets and short paragraphs
- Platform-specific expertise for Instagram, X, LinkedIn, TikTok, YouTube, Pinterest, Facebook
- Include relevant tips alongside tool results

**Constraints:**
- Stay focused on social media content creation and optimization
- If uncertain, ask clarifying questions rather than guessing`;

const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "generate_image",
      description: "Generate an AI image from a text description. Use when the user wants to create, generate, or make an image/visual/graphic.",
      parameters: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Detailed image generation prompt" },
          style: { 
            type: "string", 
            enum: ["photorealistic", "illustration", "3d-render", "watercolor", "pixel-art", "oil-painting", "anime", "minimalist"],
            description: "Visual style for the image" 
          },
        },
        required: ["prompt"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_captions",
      description: "Generate social media captions for an image. Use when user wants captions, copy, or text for their posts.",
      parameters: {
        type: "object",
        properties: {
          imageDescription: { type: "string", description: "Description of the image to generate captions for" },
          tone: { type: "string", description: "Desired tone (e.g. professional, casual, funny, inspirational)" },
          platforms: { 
            type: "array", 
            items: { type: "string", enum: ["instagram", "twitter", "linkedin", "tiktok"] },
            description: "Target platforms" 
          },
        },
        required: ["imageDescription"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_trends",
      description: "Find current viral trends and content ideas for social media. Use when user asks about trends, what's viral, or content ideas.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Niche/category to focus on (e.g. tech, food, fitness, fashion)" },
          platform: { type: "string", enum: ["instagram", "twitter", "both"], description: "Platform to focus on" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "resize_image",
      description: "Resize an image for a specific social media platform or custom dimensions.",
      parameters: {
        type: "object",
        properties: {
          preset: { 
            type: "string", 
            enum: [
              "ig-square", "ig-portrait", "ig-landscape", "ig-story",
              "fb-post", "fb-cover", "tw-post", "tw-header",
              "yt-thumb", "yt-banner", "li-post", "li-cover",
              "pin-standard", "tt-video"
            ],
            description: "Platform preset to resize to" 
          },
          customWidth: { type: "number", description: "Custom width in pixels (if no preset)" },
          customHeight: { type: "number", description: "Custom height in pixels (if no preset)" },
          mode: { type: "string", enum: ["fill", "fit", "stretch"], description: "Resize mode" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "split_grid",
      description: "Split an image into a grid layout for Instagram.",
      parameters: {
        type: "object",
        properties: {
          rows: { type: "number", description: "Number of rows (1-4)" },
          columns: { type: "number", description: "Number of columns (1-4)" },
        },
        required: ["rows", "columns"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_hashtags",
      description: "Generate optimized hashtags for a post.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Post topic or description" },
          platform: { type: "string", enum: ["instagram", "twitter", "linkedin", "tiktok"], description: "Target platform" },
          count: { type: "number", description: "Number of hashtags to generate (default 20)" },
        },
        required: ["topic"],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DeepSeek API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        tools: AI_TOOLS,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI service error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' }
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
