import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

export function ImageUploader({ onImageUpload, uploadedImage, onClear }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setIsDragging(false);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    noClick: !!uploadedImage,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : uploadedImage
            ? "border-border bg-card"
            : "border-muted-foreground/30 hover:border-primary/50 bg-card/50 hover:bg-card"
        )}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {uploadedImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative aspect-square max-h-[500px] w-full"
            >
              <img
                src={uploadedImage}
                alt="Uploaded preview"
                className="w-full h-full object-contain p-4"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:border-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-secondary/80 backdrop-blur-sm border border-border hover:bg-secondary transition-colors text-sm font-medium"
              >
                Change Image
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 px-8 text-center"
            >
              <motion.div
                animate={{ y: isDragging ? -5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                  isDragging ? "bg-primary/20" : "bg-muted"
                )}
              >
                {isDragging ? (
                  <ImageIcon className="w-10 h-10 text-primary" />
                ) : (
                  <Upload className="w-10 h-10 text-muted-foreground" />
                )}
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2">
                {isDragging ? "Drop your image here" : "Upload your image"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Drag and drop an image, or click to browse. Supports PNG, JPG, and WebP.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-medium shadow-glow"
              >
                Choose File
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
