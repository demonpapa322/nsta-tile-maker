import { useState, useRef, KeyboardEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, ArrowUp, X, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string, image?: File) => void;
  onAttachment?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSend, 
  placeholder = "Ask about grid splitting...",
  disabled = false 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = () => {
    if ((message.trim() || image) && !disabled) {
      onSend(message.trim(), image || undefined);
      setMessage('');
      removeImage();
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
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      <motion.div 
        className={cn(
          "relative flex flex-col rounded-xl bg-muted/50 border shadow-sm transition-all",
          isDragging ? "border-primary/50 bg-primary/5" : "border-border/60"
        )}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image Preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pt-3"
            >
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Upload preview" 
                  className="h-16 w-auto rounded-xl object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
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
              className="absolute inset-0 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/50 flex items-center justify-center z-10"
            >
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <ImageIcon className="w-4 h-4" />
                Drop image here
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Row */}
        <div className="flex items-end gap-1 px-3 py-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            onClick={handleAttachClick}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/80 transition-colors"
            aria-label="Add image"
          >
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Text Input */}
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={image ? "Add a message..." : placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent border-0 text-sm leading-relaxed",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:ring-0",
              "min-h-[36px] max-h-[120px] py-2",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={(!message.trim() && !image) || disabled}
            className={cn(
              "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all",
              (message.trim() || image)
                ? "bg-foreground text-background" 
                : "bg-muted/70 text-muted-foreground/50"
            )}
            whileTap={{ scale: 0.92 }}
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
        All processing happens locally in your browser
      </p>
    </div>
  );
}
