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
    setCroppedImage(prev => {
      if (prev?.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
        urlsToCleanupRef.current.delete(prev);
      }
      return null;
    });
  }, []);

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

      <div className="relative z-10 h-screen flex flex-col">
        {/* Main Content - flex-1 to fill available space */}
        <main className={`flex-1 container ${originalImage ? 'py-4 lg:py-6' : 'py-8 md:py-12'}`}>
          {/* Hero Section - Ultra compact when editing */}
          {!originalImage ? (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Free & Private</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                Split Your Image Into
                <span className="gradient-text block mt-1">Beautiful Grid Posts</span>
              </h1>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                Create stunning Instagram grids in seconds
              </p>
            </div>
          ) : (
            <div className="text-center mb-3 lg:mb-4">
              <h1 className="text-lg font-semibold text-foreground">
                Customize & Export
              </h1>
            </div>
          )}

          {/* App Interface */}
          <div className="max-w-6xl mx-auto h-full">
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
                  
                  {/* How it works */}
                  <div className="mt-12 grid grid-cols-3 gap-6 text-center">
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
                  className="h-full"
                >
                  {/* Desktop: Enhanced side-by-side layout */}
                  <div className="hidden lg:flex lg:gap-6 lg:items-start lg:h-[calc(100vh-140px)]">
                    {/* Left: Large Preview - Takes remaining space */}
                    <div className="flex-1 min-w-0 h-full flex items-center justify-center">
                      <div className="w-full max-w-2xl">
                        <GridPreview
                          imageUrl={activeImage}
                          grid={selectedGrid}
                        />
                      </div>
                    </div>

                    {/* Right: Sleek Controls Panel */}
                    <div className="w-[320px] shrink-0 rounded-2xl bg-card/80 backdrop-blur-sm border border-border shadow-lg overflow-hidden">
                      {/* Panel Header */}
                      <div className="px-5 py-4 border-b border-border bg-muted/30">
                        <h2 className="font-semibold text-sm">Settings</h2>
                      </div>
                      
                      <div className="p-5 space-y-5">
                        {/* Grid Selection */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
                            Grid Layout
                          </label>
                          <GridSelector
                            selectedGrid={selectedGrid}
                            onGridSelect={handleGridSelect}
                          />
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleEditCrop}
                            className="group py-3 px-3 text-xs font-medium text-foreground transition-all border border-border rounded-xl hover:bg-primary/5 hover:border-primary/40 hover:text-primary flex items-center justify-center gap-2"
                          >
                            <span>✂️</span>
                            <span>Crop</span>
                          </button>
                          <button
                            onClick={handleClear}
                            className="group py-3 px-3 text-xs font-medium text-foreground transition-all border border-border rounded-xl hover:bg-primary/5 hover:border-primary/40 hover:text-primary flex items-center justify-center gap-2"
                          >
                            <span>📤</span>
                            <span>New Image</span>
                          </button>
                        </div>
                        
                        <div className="h-px bg-border" />
                        
                        {/* Export Section */}
                        <div>
                          <DownloadSection
                            imageUrl={activeImage}
                            grid={selectedGrid}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile/Tablet: Compact stacked layout */}
                  <div className="lg:hidden space-y-4 max-w-lg mx-auto pb-6">
                    {/* Inline grid + actions row */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <GridSelector
                          selectedGrid={selectedGrid}
                          onGridSelect={handleGridSelect}
                        />
                      </div>
                    </div>

                    {/* Preview */}
                    <GridPreview
                      imageUrl={activeImage}
                      grid={selectedGrid}
                    />

                    {/* Actions row */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditCrop}
                        className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-xl hover:bg-primary/5 hover:border-primary/40"
                      >
                        ✂️ Crop
                      </button>
                      <button
                        onClick={handleClear}
                        className="flex-1 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-xl hover:bg-primary/5 hover:border-primary/40"
                      >
                        📤 New
                      </button>
                    </div>

                    {/* Export */}
                    <DownloadSection
                      imageUrl={activeImage}
                      grid={selectedGrid}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Minimal Footer - Only on upload screen */}
        {!originalImage && (
          <footer className="py-4">
            <p className="text-center text-xs text-muted-foreground/60">
              Your images stay on your device
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Index;
