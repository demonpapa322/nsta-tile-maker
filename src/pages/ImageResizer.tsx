import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ImageUploader } from '@/components/ImageUploader';
import { RatioSelector } from '@/components/resizer/RatioSelector';
import { ResizePreview } from '@/components/resizer/ResizePreview';
import { ResizeControls } from '@/components/resizer/ResizeControls';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import { RESIZE_PRESETS, type ResizePreset, type ResizeMode, type CustomDimensions } from '@/lib/imageResize';

const Header = memo(function Header() {
  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent font-semibold">SocialTool</span>
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </>
  );
});

const pageVariants: any = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const ImageResizer = memo(function ImageResizer() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ResizePreset>(RESIZE_PRESETS[0]);
  const [customDimensions, setCustomDimensions] = useState<CustomDimensions>({ width: 1080, height: 1080 });
  const [isCustom, setIsCustom] = useState(false);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('fill');
  const [bgColor, setBgColor] = useState('#ffffff');
  const urlRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const targetWidth = isCustom ? customDimensions.width : selectedPreset.width;
  const targetHeight = isCustom ? customDimensions.height : selectedPreset.height;

  const handleImageUpload = useCallback((_file: File, preview: string) => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }
    if (preview.startsWith('blob:')) {
      urlRef.current = preview;
    }
    setOriginalImage(preview);
  }, []);

  const handleClear = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setOriginalImage(null);
  }, []);

  const handlePresetSelect = useCallback((preset: ResizePreset) => {
    setSelectedPreset(preset);
    setIsCustom(false);
  }, []);

  const handleUseCustom = useCallback(() => {
    setIsCustom(true);
  }, []);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-background"
    >
      <Helmet>
        <title>Free Image Resizer for Social Media | SocialTool</title>
        <meta name="description" content="Resize images for Instagram, Facebook, Twitter, YouTube and more. Smart crop, fit, or stretch — free, private, browser-based." />
        <meta name="keywords" content="image resizer, social media image resizer, instagram image size, facebook cover photo size, resize image online free" />
        <link rel="canonical" href="https://www.socialtool.co/image-resizer" />
        <meta property="og:title" content="Free Image Resizer for Social Media | SocialTool" />
        <meta property="og:description" content="Resize images to perfect social media dimensions. Free, private, no signup." />
        <meta property="og:url" content="https://www.socialtool.co/image-resizer" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Social Media Image Resizer",
            "url": "https://www.socialtool.co/image-resizer",
            "description": "Resize images for any social media platform with smart cropping",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })}
        </script>
      </Helmet>

      <Header />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        <main className="container py-8 md:py-12 pt-16">
          {/* Hero */}
          <div className={`text-center transition-all duration-300 ${originalImage ? 'mb-6' : 'mb-12'}`}>
            {!originalImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Free & Private</span>
              </motion.div>
            )}
            <h1 className={`font-bold tracking-tight text-foreground transition-all duration-300 ${
              originalImage ? 'text-xl md:text-2xl mb-2' : 'text-3xl md:text-4xl lg:text-5xl mb-4'
            }`}>
              {originalImage ? (
                'Resize & Download'
              ) : (
                <>
                  Resize Images For
                  <span className="gradient-text block mt-1">Every Platform</span>
                </>
              )}
            </h1>
            {!originalImage && (
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                Perfect dimensions for Instagram, Facebook, Twitter & more
              </p>
            )}
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="sync">
              {!originalImage ? (
                /* Upload State */
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-xl mx-auto"
                >
                  <ImageUploader onImageUpload={handleImageUpload} />

                  {/* How it works */}
                  <section className="mt-16 max-w-2xl mx-auto">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">📤</span>
                        <span className="text-sm font-medium text-muted-foreground">Upload</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">📐</span>
                        <span className="text-sm font-medium text-muted-foreground">Pick Size</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">⬇️</span>
                        <span className="text-sm font-medium text-muted-foreground">Download</span>
                      </div>
                    </div>
                  </section>
                </motion.div>
              ) : (
                /* Editor State */
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Desktop: side-by-side */}
                  <div className="hidden lg:grid lg:grid-cols-[280px,1fr,280px] lg:gap-6 lg:items-start">
                    {/* Left Panel - Ratio Selector */}
                    <div className="sticky top-20 p-4 rounded-2xl bg-card border border-border shadow-lg max-h-[calc(100vh-6rem)] overflow-y-auto">
                      <RatioSelector
                        selectedPreset={selectedPreset}
                        customDimensions={customDimensions}
                        onPresetSelect={handlePresetSelect}
                        onCustomChange={setCustomDimensions}
                        onUseCustom={handleUseCustom}
                        isCustom={isCustom}
                      />
                    </div>

                    {/* Center - Preview */}
                    <div className="flex flex-col items-center">
                      <ResizePreview
                        originalUrl={originalImage}
                        targetWidth={targetWidth}
                        targetHeight={targetHeight}
                        mode={resizeMode}
                        bgColor={bgColor}
                      />
                    </div>

                    {/* Right Panel - Controls */}
                    <div className="sticky top-20 p-4 rounded-2xl bg-card border border-border shadow-lg space-y-4">
                      <ResizeControls
                        originalUrl={originalImage}
                        targetWidth={targetWidth}
                        targetHeight={targetHeight}
                        mode={resizeMode}
                        onModeChange={setResizeMode}
                        bgColor={bgColor}
                        onBgColorChange={setBgColor}
                      />

                      <div className="h-px bg-border" />

                      <button
                        onClick={handleClear}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Change Image
                      </button>
                    </div>
                  </div>

                  {/* Mobile: stacked */}
                  <div className="lg:hidden space-y-6 max-w-xl mx-auto">
                    {/* Preview */}
                    <ResizePreview
                      originalUrl={originalImage}
                      targetWidth={targetWidth}
                      targetHeight={targetHeight}
                      mode={resizeMode}
                      bgColor={bgColor}
                    />

                    {/* Ratio Selector */}
                    <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                      <RatioSelector
                        selectedPreset={selectedPreset}
                        customDimensions={customDimensions}
                        onPresetSelect={handlePresetSelect}
                        onCustomChange={setCustomDimensions}
                        onUseCustom={handleUseCustom}
                        isCustom={isCustom}
                      />
                    </div>

                    {/* Controls */}
                    <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                      <ResizeControls
                        originalUrl={originalImage}
                        targetWidth={targetWidth}
                        targetHeight={targetHeight}
                        mode={resizeMode}
                        onModeChange={setResizeMode}
                        bgColor={bgColor}
                        onBgColorChange={setBgColor}
                      />
                    </div>

                    <button
                      onClick={handleClear}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Change Image
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="py-8 mt-12">
          <p className="text-center text-xs text-muted-foreground/70">
            Your images stay on your device
          </p>
        </footer>
      </div>
    </motion.div>
  );
});

export default ImageResizer;
