import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
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
  Dice5,
  ZoomIn,
  Copy,
  Check,
} from 'lucide-react';

/* ───── Constants ───── */

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

const RANDOM_PROMPTS = [
  'A magical forest at sunset with glowing fireflies',
  'Futuristic city skyline with neon lights at night',
  'A cozy coffee shop on a rainy day',
  'Underwater coral reef with colorful fish',
  'Mountain landscape with northern lights',
  'Abstract geometric pattern in vibrant colors',
  'A lone astronaut on Mars watching Earth rise',
  'Steampunk airship flying through thunderclouds',
  'Crystal cave with bioluminescent minerals',
  'Japanese zen garden in autumn with falling leaves',
  'Cyberpunk street market in the rain',
  'A majestic dragon perched on a cliff at dawn',
  'Vintage Parisian café with warm candlelight',
  'Surreal floating islands connected by waterfalls',
  'Arctic fox under the aurora borealis',
];

/* ───── Gallery persistence ───── */

interface GalleryItem {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;
  fullImageUrl?: string;
  createdAt: string;
}

const GALLERY_KEY = 'socialtool-image-gallery';
const MAX_GALLERY_ITEMS = 20;
const THUMB_MAX_SIZE = 256;

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
    img.onerror = () => resolve(dataUrl);
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
  } catch {
    const trimmed = items.slice(0, Math.max(1, items.length - 2));
    try { localStorage.setItem(GALLERY_KEY, JSON.stringify(trimmed)); } catch { /* give up */ }
  }
}

/* ───── Component ───── */

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [gallery, setGallery] = useState<GalleryItem[]>(loadGallery);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => { saveGallery(gallery); }, [gallery]);

  /* ── Gallery helpers ── */
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
    toast({ title: 'Image removed' });
  }, [selectedGalleryItem, toast]);

  const clearGallery = useCallback(() => {
    setGallery([]);
    setSelectedGalleryItem(null);
    toast({ title: 'Gallery cleared' });
  }, [toast]);

  /* ── Random prompt ── */
  const handleRandomPrompt = useCallback(() => {
    const filtered = RANDOM_PROMPTS.filter(p => p !== prompt);
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setPrompt(random);
    textareaRef.current?.focus();
  }, [prompt]);

  /* ── Generate ── */
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
      if (!response.ok || data?.error) throw new Error(data?.error || 'Failed to generate image');

      setGeneratedImage(data.imageUrl);
      setImageDescription(data.description || '');
      addToGallery(data.imageUrl, currentPrompt, currentStyle);
      toast({ title: 'Image generated!' });
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

  /* ── Download ── */
  const handleDownload = useCallback((imageUrl?: string) => {
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

  /* ── Copy prompt ── */
  const handleCopyPrompt = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1500);
  }, []);

  /* ── Keyboard shortcut ── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isGenerating && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate, isGenerating, prompt]);

  const styleLabelMap = Object.fromEntries(STYLES.map(s => [s.id, `${s.emoji} ${s.label}`]));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Image Generator - SocialTool</title>
        <meta name="description" content="Generate stunning images with AI for your social media posts. Free AI image generator powered by Google Gemini." />
      </Helmet>

      {/* ── Top bar ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tools</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground hidden sm:block">AI Image Generator</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGallery(prev => !prev)}
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
              showGallery
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {gallery.length > 0 && (
              <span className="ml-0.5 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {gallery.length}
              </span>
            )}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* ── Prompt bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
          >
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the image you want to create..."
                rows={3}
                maxLength={500}
                className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2 px-3 pb-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleRandomPrompt}
                  title="Random prompt"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Surprise me</span>
                </button>
                <span className="text-[10px] text-muted-foreground/50 tabular-nums ml-1">
                  {prompt.length}/500
                </span>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                size="sm"
                className="rounded-xl px-5 h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-40"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            <div className="px-4 pb-2">
              <p className="text-[10px] text-muted-foreground/40">
                Press <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 text-[9px] font-mono">⌘</kbd> + <kbd className="px-1 py-0.5 rounded border border-border bg-muted/50 text-[9px] font-mono">Enter</kbd> to generate
              </p>
            </div>
          </motion.div>

          {/* ── Style chips ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedStyle === style.id
                    ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105'
                    : 'border-border/60 bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <span>{style.emoji}</span>
                <span>{style.label}</span>
              </button>
            ))}
          </motion.div>

          {/* ── Preview area ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-[4/3] sm:aspect-video flex flex-col items-center justify-center gap-4 p-8"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                    <Wand2 className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">Creating your image…</p>
                    <p className="text-xs text-muted-foreground">This usually takes 10-20 seconds</p>
                  </div>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="relative group">
                    <img
                      src={generatedImage}
                      alt={prompt}
                      className="w-full object-contain max-h-[70vh]"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button onClick={() => handleDownload()} size="sm" variant="secondary" className="rounded-xl shadow-lg backdrop-blur-sm bg-card/90 border border-border">
                          <Download className="w-4 h-4 mr-1.5" /> Download
                        </Button>
                        <Button onClick={handleGenerate} size="sm" variant="secondary" className="rounded-xl shadow-lg backdrop-blur-sm bg-card/90 border border-border">
                          <RefreshCw className="w-4 h-4 mr-1.5" /> Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-border flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{prompt}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-0.5 inline-block">
                        {styleLabelMap[selectedStyle] || selectedStyle}
                      </span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyPrompt(prompt)}
                        title="Copy prompt"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        {copiedPrompt ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDownload()}
                        title="Download"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="aspect-[4/3] sm:aspect-video flex flex-col items-center justify-center gap-3 p-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Your image will appear here</p>
                    <p className="text-xs text-muted-foreground/60">Enter a prompt and click Generate</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Gallery ── */}
          <AnimatePresence>
            {showGallery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Gallery ({gallery.length})</h3>
                    {gallery.length > 0 && (
                      <button
                        onClick={clearGallery}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {gallery.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-6">No images yet. Generate some!</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {gallery.map((item) => (
                        <div
                          key={item.id}
                          className="relative group rounded-lg overflow-hidden border border-border aspect-square cursor-pointer hover:border-primary/50 transition-all"
                          onClick={() => setSelectedGalleryItem(item)}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.prompt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ZoomIn className="w-5 h-5 text-foreground" />
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromGallery(item.id); }}
                            className="absolute top-1 right-1 p-1 rounded-md bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selectedGalleryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedGalleryItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl w-full max-h-[90vh] flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{selectedGalleryItem.prompt}</p>
                  <span className="text-[10px] text-muted-foreground/60">
                    {styleLabelMap[selectedGalleryItem.style] || selectedGalleryItem.style} · {new Date(selectedGalleryItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGalleryItem(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center p-2">
                <img
                  src={selectedGalleryItem.fullImageUrl || selectedGalleryItem.imageUrl}
                  alt={selectedGalleryItem.prompt}
                  className="max-w-full max-h-[65vh] object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-center gap-2 p-3 border-t border-border">
                <Button
                  onClick={() => handleDownload(selectedGalleryItem.fullImageUrl || selectedGalleryItem.imageUrl)}
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download
                </Button>
                <Button
                  onClick={() => {
                    setPrompt(selectedGalleryItem.prompt);
                    setSelectedStyle(selectedGalleryItem.style);
                    setSelectedGalleryItem(null);
                    textareaRef.current?.focus();
                  }}
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Reuse prompt
                </Button>
                <Button
                  onClick={() => handleCopyPrompt(selectedGalleryItem.prompt)}
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                >
                  {copiedPrompt ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  Copy prompt
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGenerator;
