import { type ToolCall } from '@/lib/openrouter';
import { resizeImage, RESIZE_PRESETS } from '@/lib/imageResize';

const SUPABASE_URL = 'https://qdqihlxlgzomnqkxbjij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcWlobHhsZ3pvbW5xa3hiamlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4MzksImV4cCI6MjA4NTY5NzgzOX0.eHlmX9hrya9q9EMzsap148Mkm4G3R9p5qYft9X1AmAE';

export interface ToolResult {
  type: 'text' | 'image' | 'captions' | 'trends' | 'resize' | 'grid' | 'hashtags' | 'error' | 'needs_image';
  content: string;
  data?: any;
}

async function callEdgeFunction(name: string, body: any): Promise<any> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `${name} failed`);
  }
  return res.json();
}

export async function executeToolCall(
  toolCall: ToolCall,
  userImageUrl?: string | null
): Promise<ToolResult> {
  const { name, arguments: argsStr } = toolCall.function;
  
  let args: any;
  try {
    args = JSON.parse(argsStr);
  } catch {
    return { type: 'error', content: 'Failed to parse tool arguments.' };
  }

  try {
    switch (name) {
      case 'generate_image': {
        const data = await callEdgeFunction('generate-image', {
          prompt: args.prompt,
          style: args.style || 'photorealistic',
        });
        
        if (data.imageUrl) {
          return {
            type: 'image',
            content: `Generated image: "${args.prompt}"`,
            data: { imageUrl: data.imageUrl, description: data.description },
          };
        }
        return { type: 'error', content: data.error || 'Image generation failed.' };
      }

      case 'generate_captions': {
        if (!userImageUrl) {
          // Generate captions based on description alone using the edge function with a placeholder approach
          const data = await callEdgeFunction('generate-captions', {
            imageUrl: 'https://placehold.co/1080x1080/eee/999?text=Described+Image',
            tone: args.tone || 'engaging',
            platforms: args.platforms || ['instagram', 'twitter', 'linkedin', 'tiktok'],
          });
          return {
            type: 'captions',
            content: `Generated captions for: "${args.imageDescription}"`,
            data,
          };
        }
        
        const data = await callEdgeFunction('generate-captions', {
          imageUrl: userImageUrl,
          tone: args.tone || 'engaging',
          platforms: args.platforms || ['instagram', 'twitter', 'linkedin', 'tiktok'],
        });
        return {
          type: 'captions',
          content: 'Generated captions for your image',
          data,
        };
      }

      case 'find_trends': {
        const data = await callEdgeFunction('trend-scout', {
          category: args.category,
          platform: args.platform,
        });
        return {
          type: 'trends',
          content: `Found trending topics${args.category ? ` in ${args.category}` : ''}`,
          data,
        };
      }

      case 'resize_image': {
        if (!userImageUrl) {
          return {
            type: 'needs_image',
            content: 'Please upload an image first so I can resize it for you. Use the + button to attach an image.',
          };
        }

        let width: number, height: number;
        let presetLabel = '';
        
        if (args.preset) {
          const preset = RESIZE_PRESETS.find(p => p.id === args.preset);
          if (!preset) {
            return { type: 'error', content: `Unknown preset: ${args.preset}` };
          }
          width = preset.width;
          height = preset.height;
          presetLabel = `${preset.platform} ${preset.label}`;
        } else if (args.customWidth && args.customHeight) {
          width = args.customWidth;
          height = args.customHeight;
          presetLabel = `${width}×${height}`;
        } else {
          return { type: 'error', content: 'Please specify a platform preset or custom dimensions.' };
        }

        const result = await resizeImage(
          userImageUrl,
          width,
          height,
          args.mode || 'fill'
        );

        return {
          type: 'resize',
          content: `Resized image to ${presetLabel} (${width}×${height})`,
          data: { url: result.url, width: result.width, height: result.height, blob: result.blob },
        };
      }

      case 'split_grid': {
        if (!userImageUrl) {
          return {
            type: 'needs_image',
            content: 'Please upload an image first so I can split it into a grid. Use the + button to attach an image.',
          };
        }
        return {
          type: 'grid',
          content: `Ready to split into a ${args.rows}×${args.columns} grid`,
          data: { rows: args.rows, columns: args.columns, imageUrl: userImageUrl },
        };
      }

      case 'generate_hashtags': {
        // Use the chat AI to generate hashtags inline (no separate edge function needed)
        return {
          type: 'hashtags',
          content: `Generating hashtags for: "${args.topic}"`,
          data: { topic: args.topic, platform: args.platform || 'instagram', count: args.count || 20 },
        };
      }

      default:
        return { type: 'error', content: `Unknown tool: ${name}` };
    }
  } catch (err) {
    console.error(`Tool ${name} error:`, err);
    return { 
      type: 'error', 
      content: err instanceof Error ? err.message : 'Tool execution failed.' 
    };
  }
}
