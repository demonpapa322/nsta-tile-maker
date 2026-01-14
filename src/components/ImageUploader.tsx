import { useCallback, useState, forwardRef, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  onImageUpload: (file: File, preview: string) => void;
  uploadedImage: string | null;
  onClear: () => void;
}

export const ImageUploader = memo(forwardRef<HTMLDivElement, ImageUploaderProps>(function ImageUploader({ 
  onImageUpload, 
  uploadedImage, 
  onClear 
}, ref) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Use createObjectURL instead of FileReader - much faster, no base64 encoding
      const preview = URL.createObjectURL(file);
      onImageUpload(file, preview);
    }
    setIsDragging(false);
  }, [onImageUpload]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    noClick: !!uploadedImage,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  }, [onClear]);

  const handleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    open();
  }, [open]);

  return (
    <div className="w-full">
      <div
        ref={ref}
        {...getRootProps()}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden",
          isDragging
            ? "border-primary bg-primary/5"
            : uploadedImage
            ? "border-border bg-card"
            : "border-muted-foreground/30 hover:border-primary/50 bg-card/50"
        )}
      >
        <input {...getInputProps()} aria-label="Upload image file" />
        
        {uploadedImage ? (
          <div className="relative aspect-video max-h-[400px] w-full flex items-center justify-center bg-muted/20 overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded preview"
              className="max-w-full max-h-[400px] object-contain transform-gpu"
              loading="eager"
              decoding="sync"
            />
            <button
              onClick={handleClear}
              className="absolute top-3 right-3 p-2 rounded-full bg-background/90 border border-border hover:bg-destructive hover:border-destructive transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpen}
              className="absolute bottom-3 right-3"
            >
              Change Image
            </Button>
          </div>
        ) : (
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
              {isDragging ? "Drop your image" : "Upload your image"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to browse. PNG, JPG, WebP.
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-1.5 mt-3" title="Your images stay on your device — nothing is uploaded or stored">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span className="text-xs text-muted-foreground">Your images stay private</span>
      </div>
    </div>
  );
}));
