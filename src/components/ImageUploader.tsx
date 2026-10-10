import { useCallback, useState, forwardRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageUpload: (files: File[], preview: string) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export const ImageUploader = memo(forwardRef<HTMLDivElement, ImageUploaderProps>(function ImageUploader({ 
  onImageUpload,
  multiple = false,
  maxFiles = 1,
}, ref) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const files = multiple ? acceptedFiles.slice(0, maxFiles) : acceptedFiles.slice(0, 1);
    if (files.length > 0) {
      // Use createObjectURL instead of FileReader - much faster, no base64 encoding
      const preview = URL.createObjectURL(files[0]);
      onImageUpload(files, preview);
    }
    setIsDragging(false);
  }, [onImageUpload, multiple, maxFiles]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple,
    maxFiles: multiple ? maxFiles : 1,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  return (
    <div className="w-full">
      <div
        ref={ref}
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/30 hover:border-primary/50 bg-card/50"
        )}
      >
        <input {...getInputProps()} aria-label="Upload image file" />
        
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}
          >
            <Upload className={cn(
              "w-7 h-7 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <h2 className="text-lg font-semibold mb-1">
            {isDragging
              ? (multiple ? "Drop your images" : "Drop your image")
              : (multiple ? "Upload your images" : "Upload your image")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {multiple
              ? `Drag and drop or click to browse. Up to ${maxFiles} images — PNG, JPG, WebP.`
              : "Drag and drop or click to browse. PNG, JPG, WebP."}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-1.5 mt-3" title="Your images stay on your device — nothing is uploaded or stored">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-muted-foreground">Your images stay private</span>
      </div>
    </div>
  );
}));
