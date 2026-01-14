import { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageCropper } from '@/components/ImageCropper';
import { GridSelector } from '@/components/GridSelector';
import { GridPreview } from '@/components/GridPreview';
import { DownloadSection } from '@/components/DownloadSection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Sparkles, Eye, EyeOff, Pencil } from 'lucide-react';

type Step = 'upload' | 'crop' | 'preview';

// Memoized header component
const Header = memo(function Header() {
  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">SocialTools</span>
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </>
  );
});

// Memoized how-it-works section
const HowItWorks = memo(function HowItWorks() {
  return (
    <section className="mt-16 max-w-2xl mx-auto">
      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">📤</span>
          <span className="text-sm font-medium text-muted-foreground">Upload</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">✏️</span>
          <span className="text-sm font-medium text-muted-foreground">Edit</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">⬇️</span>
          <span className="text-sm font-medium text-muted-foreground">Download</span>
        </div>
      </div>
    </section>
  );
});

// Memoized action buttons
const ActionButtons = memo(function ActionButtons({
  onEdit,
  onClear,
  isMobile = false,
}: {
  onEdit: () => void;
  onClear: () => void;
  isMobile?: boolean;
}) {
  const baseClass = isMobile 
    ? "flex-1 py-2.5 text-sm font-medium transition-colors border border-border rounded-xl hover:bg-muted/50 hover:border-primary/30 flex items-center justify-center"
    : "flex-1 py-2 text-sm font-medium transition-all border border-border rounded-xl hover:bg-muted/50 hover:border-primary/40 hover:shadow-sm flex items-center justify-center";

  return (
    <div className="flex gap-2">
      <button
        onClick={onEdit}
        className={`${baseClass} gap-1.5 text-foreground hover:text-primary`}
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>
      <button
        onClick={onClear}
        className={`${baseClass} gap-2 group`}
      >
        <span className="flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500" />
        </span>
        <span className="group-hover:text-primary transition-colors">
          {isMobile ? 'Change Photo' : 'Change'}
        </span>
      </button>
    </div>
  );
});

const pageVariants: any = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 30,
      mass: 1
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

const GridSplitter = memo(function GridSplitter() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [selectedGrid, setSelectedGrid] = useState('3x3');
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [showNumbers, setShowNumbers] = useState(true);
  
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
    if (originalImage && originalImage.startsWith('blob:')) {
      URL.revokeObjectURL(originalImage);
      urlsToCleanupRef.current.delete(originalImage);
    }
    
    if (preview.startsWith('blob:')) {
      urlsToCleanupRef.current.add(preview);
    }
    
    setOriginalImage(preview);
    setCroppedImage(null);
    setCurrentStep('preview');
  }, [originalImage]);

  const handleClear = useCallback(() => {
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
    if (croppedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImage);
      urlsToCleanupRef.current.delete(croppedImage);
    }
    setCroppedImage(null);
  }, [croppedImage]);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    if (croppedImage?.startsWith('blob:')) {
      URL.revokeObjectURL(croppedImage);
      urlsToCleanupRef.current.delete(croppedImage);
    }
    
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

  const toggleNumbers = useCallback(() => {
    setShowNumbers(prev => !prev);
  }, []);

  const activeImage = croppedImage || originalImage;

  // Memoize hero section class
  const heroClass = useMemo(() => 
    `text-center transition-all duration-300 ${originalImage ? 'mb-6 lg:mb-4' : 'mb-12'}`,
    [originalImage]
  );

  const titleClass = useMemo(() =>
    `font-bold tracking-tight text-foreground transition-all duration-300 ${
      originalImage 
        ? 'text-xl md:text-2xl lg:text-xl mb-2' 
        : 'text-3xl md:text-4xl lg:text-5xl mb-4'
    }`,
    [originalImage]
  );

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-background"
    >
      <Helmet>
        <title>Image Splitter & Grid Maker for Instagram - 100% Online</title>
        <meta name="description" content="Transform one image into a stunning multi-post Instagram grid. Free, fast, and works entirely in your browser." />
      </Helmet>
      <Header />

      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        <main className="container py-8 md:py-12 lg:py-8 pt-16">
          {/* Hero Section */}
          <div className={heroClass}>
            {!originalImage && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Free & Private</span>
              </div>
            )}
            <h1 className={titleClass}>
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
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="sync">
              {currentStep === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-xl mx-auto will-animate"
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-4xl mx-auto space-y-6 will-animate"
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
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.985 }}
                  transition={{ 
                    duration: 0.35, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="will-animate"
                >
                  {/* Desktop: Side-by-side layout */}
                  <div className="hidden lg:grid lg:grid-cols-[1fr,400px] lg:gap-8 lg:items-start">
                    <div className="flex-1">
                      <GridPreview
                        imageUrl={activeImage}
                        grid={selectedGrid}
                        showNumbers={showNumbers}
                      />
                    </div>

                    {/* Controls Panel */}
                    <div className="sticky top-20 space-y-3 p-4 rounded-2xl bg-card border border-border shadow-lg">
                      <button
                        onClick={toggleNumbers}
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
                      >
                        {showNumbers ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showNumbers ? 'Hide #' : 'Show #'}
                      </button>
                      
                      <GridSelector
                        selectedGrid={selectedGrid}
                        onGridSelect={handleGridSelect}
                      />
                      
                      <ActionButtons onEdit={handleEditCrop} onClear={handleClear} />
                      
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
                      showNumbers={showNumbers}
                    />

                    <ActionButtons onEdit={handleEditCrop} onClear={handleClear} isMobile />

                    <DownloadSection
                      imageUrl={activeImage}
                      grid={selectedGrid}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!originalImage && <HowItWorks />}
        </main>

        {/* Footer */}
        <footer className="py-8 mt-12">
          <p className="text-center text-xs text-muted-foreground/70">
            Your images stay on your device
          </p>
        </footer>
      </div>
    </motion.div>
  );
});

export default GridSplitter;
