import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageUploader } from '@/components/ImageUploader';
import { GridSelector } from '@/components/GridSelector';
import { GridPreview } from '@/components/GridPreview';
import { DownloadSection } from '@/components/DownloadSection';
import { Zap } from 'lucide-react';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedGrid, setSelectedGrid] = useState('3x3');

  const handleImageUpload = useCallback((file: File, preview: string) => {
    setUploadedImage(preview);
  }, []);

  const handleClear = useCallback(() => {
    setUploadedImage(null);
  }, []);

  const handleGridSelect = useCallback((grid: string) => {
    setSelectedGrid(grid);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        {/* Main Content */}
        <main className="container py-12 md:py-16">
          {/* Hero Section - Simplified */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Free • Fast • No Sign-up</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              Split Images for Your
              <span className="gradient-text block mt-1">Instagram Grid</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Transform one image into a multi-post grid. Upload, split, and download.
            </p>
          </div>

          {/* App Interface */}
          <div className="max-w-3xl mx-auto space-y-6">
            <ImageUploader
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onClear={handleClear}
            />

            <AnimatePresence mode="wait">
              {uploadedImage && (
                <motion.div
                  key="tools"
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
                    imageUrl={uploadedImage}
                    grid={selectedGrid}
                  />

                  <DownloadSection
                    imageUrl={uploadedImage}
                    grid={selectedGrid}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* How it works - Simplified */}
          {!uploadedImage && (
            <section className="mt-16 max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-center mb-8">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: '1', title: 'Upload', desc: 'Drop or select your image' },
                  { step: '2', title: 'Choose Grid', desc: 'Pick 3×1, 3×2, 3×3, or 3×4' },
                  { step: '3', title: 'Download', desc: 'Get all tiles as a ZIP' },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex flex-col items-center p-6 rounded-xl bg-card border border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6 mt-12">
          <p className="text-center text-sm text-muted-foreground">
            100% client-side processing. Your images never leave your device.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
