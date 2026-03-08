const SUPABASE_URL = 'https://qdqihlxlgzomnqkxbjij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcWlobHhsZ3pvbW5xa3hiamlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4MzksImV4cCI6MjA4NTY5NzgzOX0.eHlmX9hrya9q9EMzsap148Mkm4G3R9p5qYft9X1AmAE';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface StreamCallbacks {
  onDelta: (text: string) => void;
  onToolCall: (toolCall: ToolCall) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  messages: Message[],
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';
    
    // Accumulate tool call data across chunks
    const toolCallAccumulator: Record<number, { id: string; name: string; args: string }> = {};

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
          // Emit any accumulated tool calls
          for (const key of Object.keys(toolCallAccumulator)) {
            const tc = toolCallAccumulator[Number(key)];
            callbacks.onToolCall({
              id: tc.id,
              function: { name: tc.name, arguments: tc.args }
            });
          }
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;
          
          // Handle text content
          if (delta?.content) {
            callbacks.onDelta(delta.content);
          }
          
          // Handle tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCallAccumulator[idx]) {
                toolCallAccumulator[idx] = { 
                  id: tc.id || `tool_${idx}`, 
                  name: tc.function?.name || '', 
                  args: '' 
                };
              }
              if (tc.id) toolCallAccumulator[idx].id = tc.id;
              if (tc.function?.name) toolCallAccumulator[idx].name = tc.function.name;
              if (tc.function?.arguments) toolCallAccumulator[idx].args += tc.function.arguments;
            }
          }
        } catch {
          // Partial JSON, continue
        }
      }
    }

    // Emit any accumulated tool calls at stream end
    for (const key of Object.keys(toolCallAccumulator)) {
      const tc = toolCallAccumulator[Number(key)];
      callbacks.onToolCall({
        id: tc.id,
        function: { name: tc.name, arguments: tc.args }
      });
    }
    
    callbacks.onDone();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}
