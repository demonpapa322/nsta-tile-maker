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
    setImagePreview(URL.createObjectURL(file));
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
        if (prev.length === 1) return prev;
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
        body: JSON.stringify({ imageUrl: base64, tone: tone.trim(), platforms: selectedPlatforms }),
      });
      const data = await response.json();
      if (!response.ok || data?.error) throw new Error(data?.error || 'Failed to generate captions');
      setResult(data);
      setActivePlatform(selectedPlatforms[0]);
      toast({ title: 'Captions generated!' });
    } catch (err) {
      console.error('Caption generation error:', err);
      toast({ title: 'Generation failed', description: err instanceof Error ? err.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }, [imageFile, tone, selectedPlatforms, toast]);

  const handleCopy = useCallback((text: string, hashtags: string[], id: string) => {
    navigator.clipboard.writeText(`${text}\n\n${hashtags.join(' ')}`);
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
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Caption Generator - SocialTool</title>
        <meta name="description" content="Generate engaging social media captions from your images with AI. Supports Instagram, Twitter, LinkedIn, and TikTok." />
      </Helmet>

      {/* Header — no bottom border */}
      <header className="sticky top-0 z-50 h-12 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
        <Link to="/tools" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tools</span>
        </Link>
        <span className="text-sm font-semibold text-foreground">AI Caption Generator</span>
        <ThemeToggle />
      </header>

      {/* Two-column layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Upload + Controls */}
        <div className="lg:w-[380px] lg:min-w-[340px] lg:border-r border-border p-4 space-y-3 overflow-y-auto">
          {/* Upload */}
          {!imagePreview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl border-2 border-dashed cursor-pointer transition-all p-8 text-center ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'
              }`}
            >
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-foreground">Drop image or click to upload</p>
                <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP — up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="relative group">
                <img src={imagePreview} alt="Preview" className="w-full max-h-44 object-contain bg-muted/20" />
                <button onClick={clearImage} className="absolute top-2 right-2 p-1 rounded-md bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="px-3 py-2 border-t border-border flex items-center gap-2">
                <ImageIcon className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground truncate flex-1">{imageFile?.name}</span>
                <button onClick={clearImage} className="text-[11px] text-muted-foreground hover:text-foreground">Change</button>
              </div>
            </div>
          )}

          {/* Tone */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Smile className="w-3 h-3" /> Tone / Style
            </label>
            <input
              type="text"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. witty, casual, inspirational..."
              maxLength={100}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none border-b border-border/50 pb-1.5"
            />
          </div>

          {/* Platforms */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" /> Platforms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const active = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                      active ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 bg-background text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !imageFile}
            className="w-full rounded-xl h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Captions</>
            )}
          </Button>
        </div>

        {/* RIGHT: Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {!result && !isGenerating && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto opacity-30" />
                  <p className="text-sm">Upload an image and generate captions</p>
                </div>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="relative w-10 h-10 mx-auto">
                    <div className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                    <Sparkles className="w-3.5 h-3.5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Crafting captions…</p>
                  <p className="text-xs text-muted-foreground">Analyzing image & writing copy</p>
                </div>
              </motion.div>
            )}

            {result && !isGenerating && (
              <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* AI description */}
                {result.image_description && (
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">AI sees:</span> {result.image_description}
                    </p>
                  </div>
                )}

                {/* Platform tabs */}
                <div className="flex gap-0.5 border-b border-border overflow-x-auto scrollbar-none">
                  {selectedPlatforms.map((pId) => {
                    const p = PLATFORMS.find(pl => pl.id === pId);
                    if (!p) return null;
                    const Icon = p.icon;
                    return (
                      <button
                        key={pId}
                        onClick={() => setActivePlatform(pId)}
                        className={`inline-flex items-center gap-1 px-3 py-2 text-[11px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                          activePlatform === pId ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                {/* Caption cards */}
                <div className="space-y-2.5">
                  {(result.captions[activePlatform] || []).map((caption, idx) => {
                    const copyId = `${activePlatform}-${idx}`;
                    return (
                      <motion.div
                        key={copyId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border border-border bg-card p-3 space-y-2 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Variation {idx + 1}</span>
                          <button
                            onClick={() => handleCopy(caption.text, caption.hashtags, copyId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                          >
                            {copiedId === copyId ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">{caption.text}</p>
                        {caption.hashtags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
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
