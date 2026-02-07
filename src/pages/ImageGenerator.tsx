import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Loader2,
  Wand2,
  RefreshCw,
  Image as ImageIcon,
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

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a prompt', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: prompt.trim(), style: selectedStyle }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImage(data.imageUrl);
      setImageDescription(data.description || '');
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
  }, [prompt, selectedStyle, toast]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `socialtool-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Image downloaded!' });
  }, [generatedImage, toast]);

  const handleSuggestion = useCallback((text: string) => {
    setPrompt(text);
  }, []);

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
      <div className="fixed top-4 right-4 z-50">
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
                        onClick={handleDownload}
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
