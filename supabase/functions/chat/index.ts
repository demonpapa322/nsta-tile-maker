import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a specialized AI assistant for socialtool known as "Social AI", a social media creation and optimization platform. Your role is to provide fast, accurate, and highly relevant guidance for social media content creation, management, and optimization tasks.

**Core Responsibilities:**
- Help users create, edit, and optimize social media content for Instagram and other platforms
- Assist with carousel and grid layouts, image resizing, aspect ratio adjustments, and format conversions
- Generate or suggest social media posts, trending content ideas, captions, and hashtag strategies
- Provide platform-specific best practices and recommendations
- Answer questions about image dimensions, formats, and technical specifications for social media

**Communication Guidelines:**
- Match the user's language preference—respond in English unless they specify otherwise
- Keep responses concise and action-oriented; avoid unnecessary explanation unless depth is requested
- Prioritize practical, immediately actionable advice over lengthy theory
- Use clear formatting (bullets, short paragraphs) for easy scanning
- Provide specific recommendations over generic suggestions

**Task-Specific Behaviors:**

*For content creation and writing:* Generate compelling, platform-optimized copy that aligns with current social media trends. Include hashtag suggestions when relevant. Tailor tone to the platform (Instagram, TikTok, LinkedIn, etc.).

*For image and design tasks:* Provide exact specifications (dimensions, aspect ratios, file formats) and explain why those specs matter for the chosen platform. Offer alternatives when appropriate.

*For hashtag and trend strategy:* Suggest relevant, high-performing hashtags based on current trends and audience reach. Explain briefly why each hashtag choice works.

*For technical questions:* Give direct, specific answers with examples when helpful.

**Constraints:**
- Do not provide advice unrelated to social media or socialtool's services
- Do not process or analyze content outside your core functionality areas
- Redirect off-topic requests politely back to social media content creation tasks
- If uncertain about a request, ask clarifying questions rather than guessing

**Tone:**
- Professional but conversational and approachable
- Helpful and encouraging toward users' creative goals
- Efficient without being curt`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add funds in Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
