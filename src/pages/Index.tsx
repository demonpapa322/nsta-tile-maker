import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageCropper } from '@/components/ImageCropper';
import { GridSelector } from '@/components/GridSelector';
import { GridPreview } from '@/components/GridPreview';
import { DownloadSection } from '@/components/DownloadSection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sparkles } from 'lucide-react';

type Step = 'upload' | 'crop' | 'preview';

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedGrid, setSelectedGrid] = useState('3x3');
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  
  // Track URLs for cleanup
  const urlsToCleanupRef = useRef<Set<string>>(new Set());

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      urlsToCleanupRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleImageUpload = useCallback((file: File, preview: string) => {
    // Cleanup previous original image if it's a blob URL
    if (originalImage && originalImage.startsWith('blob:')) {
      URL.revokeObjectURL(originalImage);
      urlsToCleanupRef.current.delete(originalImage);
    }
    
    // Track new URL
    if (preview.startsWith('blob:')) {
      urlsToCleanupRef.current.add(preview);
    }
    
    setOriginalImage(preview);
    setCroppedImage(null);
    setCurrentStep('preview');
  }, [originalImage]);

  const handleClear = useCallback(() => {
    // Cleanup all blob URLs
    if (originalImage?.startsWith('blob:')) {
      URL.revokeObjectURL(originalImage);
      urlsToCleanupRef.current.delete(originalImage);
    }
    if (croppedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImage);
      urlsToCleanupRef.current.delete(croppedImage);
    }
    
    setOriginalImage(null);
    setCroppedImage(null);
    setCurrentStep('upload');
  }, [originalImage, croppedImage]);

  const handleGridSelect = useCallback((grid: string) => {
    setSelectedGrid(grid);
    // Clear cropped image when grid changes since it was cropped for a different aspect ratio
    if (croppedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImage);
      urlsToCleanupRef.current.delete(croppedImage);
    }
    setCroppedImage(null);
  }, [croppedImage]);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    // Cleanup previous cropped image
    if (croppedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImage);
      urlsToCleanupRef.current.delete(croppedImage);
    }
    
    // Track new URL
    if (croppedUrl.startsWith('blob:')) {
      urlsToCleanupRef.current.add(croppedUrl);
    }
    
    setCroppedImage(croppedUrl);
    setCurrentStep('preview');
  }, [croppedImage]);

  const handleBackToPreview = useCallback(() => {
    setCurrentStep('preview');
  }, []);

  const handleEditCrop = useCallback(() => {
    setCurrentStep('crop');
  }, []);

  const activeImage = croppedImage || originalImage;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        {/* Main Content */}
        <main className="container py-12 md:py-16">
          {/* Hero Section - Modern & Minimal */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Free & Private</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-foreground">
              Split Your Image Into
              <span className="gradient-text block mt-1">Beautiful Grid Posts</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              Create stunning Instagram grids in seconds
            </p>
          </div>

          {/* App Interface */}
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Step Indicator - only show Upload and Download */}
            {originalImage && (
              <div className="flex items-center justify-center gap-2 mb-4">
                {['Upload', 'Download'].map((label, i) => {
                  const isUpload = i === 0;
                  const isActive = (currentStep === 'upload' && isUpload) || 
                                   ((currentStep === 'preview' || currentStep === 'crop') && !isUpload);
                  const isPast = currentStep !== 'upload' && isUpload;
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isPast
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className={`text-xs ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {label}
                      </span>
                      {i < 1 && <div className="w-8 h-px bg-border" />}
                    </div>
                  );
                })}
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    uploadedImage={null}
                    onClear={handleClear}
                  />
                </motion.div>
              )}

              {currentStep === 'crop' && originalImage && (
                <motion.div
                  key="crop"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <GridSelector
                    selectedGrid={selectedGrid}
                    onGridSelect={handleGridSelect}
                  />
                  <ImageCropper
                    imageUrl={originalImage}
                    grid={selectedGrid}
                    onCropComplete={handleCropComplete}
                    onCancel={handleBackToPreview}
                  />
                </motion.div>
              )}

              {currentStep === 'preview' && activeImage && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <GridSelector
                    selectedGrid={selectedGrid}
                    onGridSelect={handleGridSelect}
                  />

                  <GridPreview
                    imageUrl={activeImage}
                    grid={selectedGrid}
                  />

                  <DownloadSection
                    imageUrl={activeImage}
                    grid={selectedGrid}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleEditCrop}
                      className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:bg-muted/50"
                    >
                      ✂️ Crop & Adjust
                    </button>
                    <button
                      onClick={handleClear}
                      className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:bg-muted/50"
                    >
                      Upload New Image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* How it works - Minimal */}
          {!originalImage && (
            <section className="mt-16 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-6 text-center">
                {[
                  { icon: '📤', title: 'Upload' },
                  { icon: '✂️', title: 'Crop' },
                  { icon: '⬇️', title: 'Download' },
                ].map((item, i) => (
                  <div key={item.title} className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-medium text-muted-foreground">{item.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="py-8 mt-12">
          <p className="text-center text-xs text-muted-foreground/70">
            Your images stay on your device
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
