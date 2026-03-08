import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ToolResultDisplay } from './ToolResultDisplay';
import type { ToolResult } from '@/lib/toolExecutor';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolResults?: ToolResult[];
  isExecutingTool?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

// ChatGPT-style bouncing dot loader
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-foreground/70"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  function ChatMessage({ message }, ref) {
    const isUser = message.role === 'user';
    const isEmpty = !message.content && !message.isExecutingTool && !message.toolResults?.length;

    if (isEmpty) return null;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "max-w-3xl mx-auto px-4 py-2",
          isUser ? "flex justify-end" : "flex justify-start"
        )}
      >
        {isUser ? (
          /* User message — ChatGPT style: right-aligned rounded bubble, no avatar */
          <div className="max-w-[85%] sm:max-w-[70%]">
            <div className="rounded-3xl bg-muted px-4 py-2.5 text-sm text-foreground">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ) : (
          /* Assistant message — ChatGPT style: left-aligned, no avatar, plain text */
          <div className="max-w-[85%] sm:max-w-[80%] space-y-2">
            {/* Show typing dots when content is empty (streaming hasn't started) */}
            {!message.content && !message.toolResults?.length && !message.isExecutingTool ? (
              <TypingDots />
            ) : message.content ? (
              <div className="text-sm text-foreground leading-relaxed">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ) : null}

            {/* Tool execution — typing dots */}
            {message.isExecutingTool && (
              <TypingDots />
            )}

            {/* Tool results */}
            {message.toolResults?.map((result, i) => (
              <ToolResultDisplay key={i} result={result} />
            ))}
          </div>
        )}
      </motion.div>
    );
  }
);
