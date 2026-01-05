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
        <main className="container py-8 md:py-12 lg:py-8">
          {/* Hero Section - Compact on desktop when image is present */}
          <div className={`text-center transition-all duration-300 ${originalImage ? 'mb-6 lg:mb-4' : 'mb-12'}`}>
            {!originalImage && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Free & Private</span>
              </div>
            )}
            <h1 className={`font-bold tracking-tight text-foreground transition-all duration-300 ${
              originalImage 
                ? 'text-xl md:text-2xl lg:text-xl mb-2' 
                : 'text-3xl md:text-4xl lg:text-5xl mb-4'
            }`}>
              {originalImage ? (
                'Customize & Download'
              ) : (
                <>
                  Split Your Image Into
                  <span className="gradient-text block mt-1">Beautiful Grid Posts</span>
                </>
              )}
            </h1>
            {!originalImage && (
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                Create stunning Instagram grids in seconds
              </p>
            )}
          </div>

          {/* App Interface */}
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-xl mx-auto"
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
                  className="max-w-3xl mx-auto space-y-6"
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
                >
                  {/* Desktop: Side-by-side layout */}
                  <div className="hidden lg:grid lg:grid-cols-[1fr,360px] lg:gap-8 lg:items-start">
                    {/* Left: Large Preview */}
                    <div className="space-y-4">
                      <GridPreview
                        imageUrl={activeImage}
                        grid={selectedGrid}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditCrop}
                          className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:bg-muted/50"
                        >
                          ✂️ Crop & Adjust
                        </button>
                        <button
                          onClick={handleClear}
                          className="flex-1 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg hover:bg-muted/50"
                        >
                          Upload New
                        </button>
                      </div>
                    </div>

                    {/* Right: Controls Panel */}
                    <div className="sticky top-8 space-y-5 p-6 rounded-2xl bg-card border border-border shadow-sm">
                      <div>
                        <h3 className="text-sm font-medium text-foreground mb-3">Grid Layout</h3>
                        <GridSelector
                          selectedGrid={selectedGrid}
                          onGridSelect={handleGridSelect}
                        />
                      </div>
                      
                      <div className="h-px bg-border" />
                      
                      {/* Edit actions before download */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditCrop}
                          className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30"
                        >
                          ✂️ Crop
                        </button>
                        <button
                          onClick={handleClear}
                          className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30"
                        >
                          📤 New
                        </button>
                      </div>
                      
                      <div className="h-px bg-border" />
                      
                      <DownloadSection
                        imageUrl={activeImage}
                        grid={selectedGrid}
                      />
                    </div>
                  </div>

                  {/* Mobile/Tablet: Stacked layout */}
                  <div className="lg:hidden space-y-6 max-w-xl mx-auto">
                    <GridSelector
                      selectedGrid={selectedGrid}
                      onGridSelect={handleGridSelect}
                    />

                    <GridPreview
                      imageUrl={activeImage}
                      grid={selectedGrid}
                    />

                    {/* Edit actions before download */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditCrop}
                        className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30"
                      >
                        ✂️ Crop & Adjust
                      </button>
                      <button
                        onClick={handleClear}
                        className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30"
                      >
                        Upload New
                      </button>
                    </div>

                    <DownloadSection
                      imageUrl={activeImage}
                      grid={selectedGrid}
                    />
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
                ].map((item) => (
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
