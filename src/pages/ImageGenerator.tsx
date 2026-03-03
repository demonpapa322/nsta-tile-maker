import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
const SUPABASE_URL = 'https://qdqihlxlgzomnqkxbjij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcWlobHhsZ3pvbW5xa3hiamlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4MzksImV4cCI6MjA4NTY5NzgzOX0.eHlmX9hrya9q9EMzsap148Mkm4G3R9p5qYft9X1AmAE';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Loader2,
  Wand2,
  RefreshCw,
  Image as ImageIcon,
  Trash2,
  Clock,
  X,
} from 'lucide-react';

const STYLES = [
  { id: 'photorealistic', label: 'Photorealistic', emoji: '📷' },
  { id: 'illustration', label: 'Illustration', emoji: '🎨' },
  { id: '3d-render', label: '3D Render', emoji: '🧊' },
  { id: 'watercolor', label: 'Watercolor', emoji: '💧' },
  { id: 'pixel-art', label: 'Pixel Art', emoji: '👾' },
  { id: 'oil-painting', label: 'Oil Painting', emoji: '🖼️' },
  { id: 'anime', label: 'Anime', emoji: '✨' },
  { id: 'minimalist', label: 'Minimalist', emoji: '◻️' },
];

const SUGGESTIONS = [
  'A magical forest at sunset with glowing fireflies',
  'Futuristic city skyline with neon lights at night',
  'A cozy coffee shop on a rainy day',
  'Underwater coral reef with colorful fish',
  'Mountain landscape with northern lights',
  'Abstract geometric pattern in vibrant colors',
];

interface GalleryItem {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;      // compressed thumbnail (persisted in localStorage)
  fullImageUrl?: string;  // full-res base64 kept in memory only (not persisted)
  createdAt: string;
}

const GALLERY_KEY = 'socialtool-image-gallery';
const MAX_GALLERY_ITEMS = 20;
const THUMB_MAX_SIZE = 256; // px – keeps each item under ~50KB

function compressToThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(THUMB_MAX_SIZE / img.width, THUMB_MAX_SIZE / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl); // fallback
    img.src = dataUrl;
  });
}

function loadGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGallery(items: GalleryItem[]) {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items.slice(0, MAX_GALLERY_ITEMS)));
  } catch (e) {
    // If still too large, trim older items
    const trimmed = items.slice(0, Math.max(1, items.length - 2));
    try { localStorage.setItem(GALLERY_KEY, JSON.stringify(trimmed)); } catch { /* give up */ }
  }
}

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [gallery, setGallery] = useState<GalleryItem[]>(loadGallery);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const { toast } = useToast();

  // Persist gallery changes
  useEffect(() => {
    saveGallery(gallery);
  }, [gallery]);

  const addToGallery = useCallback(async (imageUrl: string, usedPrompt: string, usedStyle: string) => {
    const thumbnail = await compressToThumbnail(imageUrl);
    const item: GalleryItem = {
      id: Date.now().toString(),
      prompt: usedPrompt,
      style: usedStyle,
      imageUrl: thumbnail,
      fullImageUrl: imageUrl,
      createdAt: new Date().toISOString(),
    };
    setGallery(prev => [item, ...prev].slice(0, MAX_GALLERY_ITEMS));
  }, []);

  const removeFromGallery = useCallback((id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
    if (selectedGalleryItem?.id === id) setSelectedGalleryItem(null);
    toast({ title: 'Image removed from gallery' });
  }, [selectedGalleryItem, toast]);

  const clearGallery = useCallback(() => {
    setGallery([]);
    setSelectedGalleryItem(null);
    toast({ title: 'Gallery cleared' });
  }, [toast]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    const currentPrompt = prompt.trim();
    const currentStyle = selectedStyle;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: currentPrompt, style: currentStyle }),
      });

      const data = await response.json();

      if (!response.ok || data?.error) {
        throw new Error(data?.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      setImageDescription(data.description || '');
      addToGallery(data.imageUrl, currentPrompt, currentStyle);
      toast({ title: 'Image generated & saved to gallery!' });
    } catch (err) {
      console.error('Generation error:', err);
      toast({
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedStyle, toast, addToGallery]);

  const handleDownload = useCallback((imageUrl?: string, downloadPrompt?: string) => {
    const url = imageUrl || generatedImage;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `socialtool-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Image downloaded!' });
  }, [generatedImage, toast]);

  const handleSuggestion = useCallback((text: string) => {
    setPrompt(text);
  }, []);

  const styleLabelMap = Object.fromEntries(STYLES.map(s => [s.id, `${s.emoji} ${s.label}`]));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Image Generator - SocialTool</title>
        <meta
          name="description"
          content="Generate stunning images with AI for your social media posts. Free AI image generator powered by Google Gemini."
        />
      </Helmet>

      {/* Header */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Tools</span>
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {/* Gallery Toggle */}
        <button
          onClick={() => setShowGallery(prev => !prev)}
          className={`relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors border ${
            showGallery
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border/50 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Gallery</span>
          {gallery.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {gallery.length}
            </span>
          )}
        </button>
        <ThemeToggle />
      </div>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5" />

      <div className="relative z-10 container max-w-6xl py-20 px-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Powered by AI</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-2"
          >
            AI Image{' '}
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              Generator
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-md mx-auto"
          >
            Describe what you want and let AI create it for you
          </motion.p>
        </div>

        {/* Gallery Panel */}
        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Generated Images ({gallery.length})
                  </h2>
                  {gallery.length > 0 && (
                    <button
                      onClick={clearGallery}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>

                {gallery.length === 0 ? (
                  <div className="py-8 text-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No images yet. Generate your first image!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {gallery.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative rounded-xl overflow-hidden border border-border/50 bg-muted/20 cursor-pointer hover:border-primary/40 transition-colors"
                        onClick={() => setSelectedGalleryItem(item)}
                      >
                        <div className="aspect-square">
                          <img
                            src={item.imageUrl}
                            alt={item.prompt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
                          <p className="text-[10px] text-foreground text-center line-clamp-3 font-medium">
                            {item.prompt}
                          </p>
                          <span className="text-[9px] text-muted-foreground">
                            {styleLabelMap[item.style] || item.style}
                          </span>
                        </div>
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromGallery(item.id);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Item Lightbox */}
        <AnimatePresence>
          {selectedGalleryItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedGalleryItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-2xl w-full rounded-2xl border border-border bg-card overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedGalleryItem.fullImageUrl || selectedGalleryItem.imageUrl}
                  alt={selectedGalleryItem.prompt}
                  className="w-full object-contain max-h-[60vh]"
                />
                <div className="p-4 space-y-3">
                  <p className="text-sm text-foreground font-medium">{selectedGalleryItem.prompt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded-full bg-muted/50 border border-border">
                      {styleLabelMap[selectedGalleryItem.style] || selectedGalleryItem.style}
                    </span>
                    <span>{new Date(selectedGalleryItem.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(selectedGalleryItem.fullImageUrl || selectedGalleryItem.imageUrl)}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => {
                        setPrompt(selectedGalleryItem.prompt);
                        setSelectedStyle(selectedGalleryItem.style);
                        setSelectedGalleryItem(null);
                        setShowGallery(false);
                      }}
                      variant="outline"
                      className="flex-1 rounded-xl"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Use prompt
                    </Button>
                    <Button
                      onClick={() => removeFromGallery(selectedGalleryItem.id)}
                      variant="outline"
                      className="rounded-xl text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGalleryItem(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left – Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Prompt Input */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <label className="text-sm font-medium text-foreground">
                Describe your image
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A magical forest at sunset with glowing fireflies..."
                className="min-h-[120px] resize-none rounded-xl border-border/50 bg-background/50 focus:border-primary/40"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{prompt.length}/500</span>
                <button
                  onClick={() => setPrompt('')}
                  className="hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Style Selector */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <label className="text-sm font-medium text-foreground">
                Art Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-border/50 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <span>{style.emoji}</span>
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <label className="text-sm font-medium text-foreground">
                Need inspiration?
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    onClick={() => handleSuggestion(text)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-rose-600 text-white border-0 shadow-lg shadow-fuchsia-500/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </motion.div>

          {/* Right – Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-2xl border border-border bg-card overflow-hidden sticky top-24">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square flex flex-col items-center justify-center gap-4 p-8"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <Wand2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Creating your masterpiece...
                    </p>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <img
                      src={generatedImage}
                      alt={prompt}
                      className="w-full object-contain"
                    />
                    {/* Action bar */}
                    <div className="p-4 flex items-center gap-3 border-t border-border">
                      <Button
                        onClick={() => handleDownload()}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                    {imageDescription && (
                      <div className="px-4 pb-4">
                        <p className="text-xs text-muted-foreground">
                          {imageDescription}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="aspect-square flex flex-col items-center justify-center gap-4 p-8"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Your creation will appear here
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Enter a prompt and choose a style to get started
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
