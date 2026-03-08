import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Loader2 } from 'lucide-react';
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

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  function ChatMessage({ message }, ref) {
    const isUser = message.role === 'user';

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 max-w-3xl mx-auto px-4 py-4",
          isUser && "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUser 
              ? "bg-gradient-to-br from-violet-400 to-fuchsia-400" 
              : "bg-muted border border-border"
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-foreground" />
          )}
        </div>

        {/* Message Content */}
        <div className={cn("flex-1 space-y-2", isUser ? "ml-12" : "mr-12")}>
          {message.content && (
            <div
              className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                isUser 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          )}
          
          {/* Tool execution indicator */}
          {message.isExecutingTool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs font-medium">Working on it...</span>
            </motion.div>
          )}
          
          {/* Tool results */}
          {message.toolResults?.map((result, i) => (
            <ToolResultDisplay key={i} result={result} />
          ))}
        </div>
      </motion.div>
    );
  }
);
