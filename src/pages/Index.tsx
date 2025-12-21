import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from '@/components/ImageUploader';
import { GridSelector } from '@/components/GridSelector';
import { GridPreview } from '@/components/GridPreview';
import { DownloadSection } from '@/components/DownloadSection';
import { Grid3X3, Sparkles } from 'lucide-react';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedGrid, setSelectedGrid] = useState('3x3');

  const handleImageUpload = (file: File, preview: string) => {
    setImageFile(file);
    setUploadedImage(preview);
  };

  const handleClear = () => {
    setUploadedImage(null);
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/50">
          <div className="container py-4 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent via-primary to-orange-400 flex items-center justify-center">
                <Grid3X3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">GridSplit</span>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8 md:py-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Free & No Sign-up Required</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Split Images for Your
              <span className="gradient-text block mt-1">Instagram Grid</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform one image into a stunning multi-post grid. Upload, split, and download – all in your browser.
            </p>
          </motion.div>

          {/* App Interface */}
          <div className="max-w-4xl mx-auto space-y-8">
            <ImageUploader
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onClear={handleClear}
            />

            <AnimatePresence>
              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-8"
                >
                  <GridSelector
                    selectedGrid={selectedGrid}
                    onGridSelect={setSelectedGrid}
                  />

                  <GridPreview
                    imageUrl={uploadedImage}
                    grid={selectedGrid}
                  />

                  <DownloadSection
                    imageUrl={uploadedImage}
                    grid={selectedGrid}
                    onSplit={() => {}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* How it works */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Upload', desc: 'Drop or select your image' },
                { step: '2', title: 'Choose Grid', desc: 'Pick your preferred layout' },
                { step: '3', title: 'Download', desc: 'Get your tiles & post in order' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass rounded-2xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent via-primary to-orange-400 flex items-center justify-center text-xl font-bold text-primary-foreground mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-20">
          <div className="container py-6 text-center text-sm text-muted-foreground">
            <p>Made with care for content creators. All processing happens locally in your browser.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;