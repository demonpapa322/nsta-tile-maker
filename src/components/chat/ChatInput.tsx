import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mic, Send, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onAttachment?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSend, 
  onAttachment, 
  placeholder = "Ask about grid splitting...",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <motion.div 
        className="relative flex items-end gap-2 p-2 rounded-2xl bg-muted/50 border border-border shadow-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Attachment Button */}
        <button
          onClick={onAttachment}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          aria-label="Add attachment"
        >
          <Plus className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Text Input */}
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent border-0 text-sm",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-0",
            "min-h-[36px] max-h-[150px] py-2",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Voice input"
          >
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <motion.button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-xl transition-all",
              message.trim() 
                ? "bg-foreground text-background hover:opacity-90" 
                : "bg-muted text-muted-foreground"
            )}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        AI can make mistakes. All image processing happens locally on your device.
      </p>
    </div>
  );
}
