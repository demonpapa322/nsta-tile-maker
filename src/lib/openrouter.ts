// WARNING: This API key is exposed in client-side code. For production, use a backend.
const OPENROUTER_API_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

const SYSTEM_PROMPT = `You are GridAI, a helpful assistant specialized in Instagram grid splitting and social media image preparation. You help users:
- Split images into perfect grid layouts for Instagram profiles
- Understand the best grid sizes (2x3, 3x3, etc.) for their content
- Optimize images for social media

Keep responses concise and helpful. When users want to split images, guide them to upload an image or use the grid splitter tool.`;

export async function streamChat(
  messages: Message[],
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'GridAI'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (!trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) callbacks.onDelta(content);
        } catch {
          // Partial JSON, continue
        }
      }
    }

    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}
