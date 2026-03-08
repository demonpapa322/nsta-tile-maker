import { useState, useRef, KeyboardEvent, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowUp, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  onAttachment?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSend, 
  placeholder = "Ask anything",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const removeImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSend = useCallback(() => {
    if ((message.trim() || image) && !disabled) {
      onSend(message.trim(), image || undefined);
      setMessage('');
      removeImage();
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  }, [message, image, disabled, onSend, removeImage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const canSend = (message.trim() || image) && !disabled;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 pointer-events-auto">
        {/* Fade gradient above input */}
        <div className="h-8 bg-gradient-to-t from-background to-transparent -mb-px" />
        
        <motion.div 
          className={cn(
            "relative flex flex-col rounded-[26px] border transition-all duration-200",
            "bg-card shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.3)]",
            isDragging 
              ? "border-primary/50 shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]" 
              : isFocused
                ? "border-border shadow-[0_2px_20px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_20px_-4px_rgba(0,0,0,0.4)]"
                : "border-border/50 hover:border-border/80"
          )}
          layout
          transition={{ layout: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image Preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="px-3 pt-3"
              >
                <div className="relative inline-block group">
                  <img 
                    src={imagePreview} 
                    alt="Upload preview" 
                    className="h-14 w-auto rounded-lg object-cover border border-border/30"
                  />
                  <motion.button
                    onClick={removeImage}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag overlay */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 rounded-[26px] bg-primary/5 border-2 border-dashed border-primary/40 flex items-center justify-center z-10 backdrop-blur-[1px]"
              >
                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                  <ImageIcon className="w-4 h-4" />
                  Drop image here
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end gap-1 px-2 py-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* GPT-style Plus Button */}
            <motion.button
              onClick={handleAttachClick}
              className={cn(
                "flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted/60"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Attach file"
            >
              <Plus className="w-5 h-5" />
            </motion.button>

            {/* Text Input */}
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={image ? "Add a message..." : placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent border-0 text-[15px] leading-relaxed",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:ring-0",
                "min-h-[36px] max-h-[200px] py-[7px] px-1",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            />

            {/* Send Button — GPT style */}
            <AnimatePresence mode="wait">
              <motion.button
                key={canSend ? 'active' : 'inactive'}
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-colors",
                  canSend
                    ? "bg-foreground text-background" 
                    : "bg-transparent text-muted-foreground/30 cursor-default"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                whileTap={canSend ? { scale: 0.85 } : undefined}
                whileHover={canSend ? { opacity: 0.85 } : undefined}
                aria-label="Send message"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </motion.button>
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground/35 text-center mt-2 pb-0.5">
          SocialTool can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
