import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Instagram,
  Twitter,
  Linkedin,
  X,
  ImageIcon,
  Hash,
  Smile,
  ChevronDown,
} from 'lucide-react';

const SUPABASE_URL = 'https://qdqihlxlgzomnqkxbjij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcWlobHhsZ3pvbW5xa3hiamlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4MzksImV4cCI6MjA4NTY5NzgzOX0.eHlmX9hrya9q9EMzsap148Mkm4G3R9p5qYft9X1AmAE';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'text-sky-500' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
  { id: 'tiktok', label: 'TikTok', icon: Sparkles, color: 'text-foreground' },
];

interface CaptionVariation {
  text: string;
  hashtags: string[];
}

interface CaptionsResult {
  image_description: string;
  captions: Record<string, CaptionVariation[]>;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CaptionGenerator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tone, setTone] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'twitter', 'linkedin', 'tiktok']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<CaptionsResult | null>(null);
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image must be under 10MB', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setResult(null);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const togglePlatform = useCallback((id: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least one
        const next = prev.filter(p => p !== id);
        if (activePlatform === id) setActivePlatform(next[0]);
        return next;
      }
      return [...prev, id];
    });
  }, [activePlatform]);

  const handleGenerate = useCallback(async () => {
    if (!imageFile) {
      toast({ title: 'Upload an image first', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    setResult(null);

    try {
      const base64 = await fileToBase64(imageFile);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-captions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          imageUrl: base64,
          tone: tone.trim(),
          platforms: selectedPlatforms,
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || 'Failed to generate captions');

      setResult(data);
      setActivePlatform(selectedPlatforms[0]);
      toast({ title: 'Captions generated!' });
    } catch (err) {
      console.error('Caption generation error:', err);
      toast({
        title: 'Generation failed',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [imageFile, tone, selectedPlatforms, toast]);

  const handleCopy = useCallback((text: string, hashtags: string[], id: string) => {
    const full = `${text}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Caption copied!' });
  }, [toast]);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Caption Generator - SocialTool</title>
        <meta name="description" content="Generate engaging social media captions from your images with AI. Supports Instagram, Twitter, LinkedIn, and TikTok." />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
        <Link to="/tools" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tools</span>
        </Link>
        <span className="text-sm font-semibold text-foreground hidden sm:block">AI Caption Generator</span>
        <ThemeToggle />
      </header>

      <main className="pt-14 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

          {/* Upload area */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all p-12 text-center ${
                  dragActive
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop your image here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — up to 10MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="relative group">
                  <img src={imagePreview} alt="Upload preview" className="w-full max-h-72 object-contain bg-muted/20" />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 border-t border-border flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{imageFile?.name}</span>
                  <button onClick={clearImage} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Change
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Controls row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
            {/* Tone input */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5" /> Tone / Style
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. witty and professional, casual & fun, inspirational..."
                maxLength={100}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-b border-border/50 pb-2"
              />
            </div>

            {/* Platform pills */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        active
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border/60 bg-background text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !imageFile}
              className="w-full rounded-xl h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-40"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing image & generating captions…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Captions
                </>
              )}
            </Button>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Crafting your captions…</p>
                  <p className="text-xs text-muted-foreground mt-1">Analyzing your image and writing platform-optimized copy</p>
                </div>
              </motion.div>
            )}

            {result && !isGenerating && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Image description */}
                {result.image_description && (
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">AI sees:</span> {result.image_description}
                    </p>
                  </div>
                )}

                {/* Platform tabs */}
                <div className="flex gap-1 border-b border-border overflow-x-auto pb-px scrollbar-none">
                  {selectedPlatforms.map((pId) => {
                    const p = PLATFORMS.find(pl => pl.id === pId);
                    if (!p) return null;
                    const Icon = p.icon;
                    return (
                      <button
                        key={pId}
                        onClick={() => setActivePlatform(pId)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                          activePlatform === pId
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Caption cards */}
                <div className="space-y-3">
                  {(result.captions[activePlatform] || []).map((caption, idx) => {
                    const copyId = `${activePlatform}-${idx}`;
                    return (
                      <motion.div
                        key={copyId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                            Variation {idx + 1}
                          </span>
                          <button
                            onClick={() => handleCopy(caption.text, caption.hashtags, copyId)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                          >
                            {copiedId === copyId ? (
                              <><Check className="w-3 h-3 text-green-500" /> Copied</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy</>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                          {caption.text}
                        </p>
                        {caption.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {caption.hashtags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[11px] text-primary/80 font-medium">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CaptionGenerator;
