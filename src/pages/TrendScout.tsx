import { Helmet } from 'react-helmet-async';
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Instagram,
  Twitter,
  TrendingUp,
  Zap,
  RefreshCw,
  Wand2,
  Hash,
  Filter,
} from 'lucide-react';

const SUPABASE_URL = 'https://qdqihlxlgzomnqkxbjij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcWlobHhsZ3pvbW5xa3hiamlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4MzksImV4cCI6MjA4NTY5NzgzOX0.eHlmX9hrya9q9EMzsap148Mkm4G3R9p5qYft9X1AmAE';

const CATEGORIES = ['All', 'Lifestyle', 'Tech', 'Food', 'Fitness', 'Fashion', 'Travel', 'Business'];
const PLATFORM_FILTERS = [
  { id: 'all', label: 'All Platforms', icon: TrendingUp },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'twitter', label: 'X / Twitter', icon: Twitter },
];

interface Trend {
  title: string;
  platform: 'instagram' | 'twitter' | 'both';
  reason: string;
  hashtags: string[];
  image_prompt: string;
  engagement_score: number;
  category: string;
}

const TrendScout = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [hasScanned, setHasScanned] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleScan = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/trend-scout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          category: selectedCategory === 'All' ? '' : selectedCategory,
          platform: selectedPlatform === 'all' ? '' : selectedPlatform,
        }),
      });

      if (response.status === 429) {
        toast({ title: 'Rate limited', description: 'Please wait a moment and try again.', variant: 'destructive' });
        return;
      }
      if (response.status === 402) {
        toast({ title: 'Credits exhausted', description: 'Add credits in your workspace settings.', variant: 'destructive' });
        return;
      }

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Scan failed');

      setTrends(data.trends || []);
      setHasScanned(true);
      toast({ title: `Found ${data.trends?.length || 0} viral trends!` });
    } catch (err) {
      console.error('Trend scout error:', err);
      toast({ title: 'Scan failed', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedPlatform, toast]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied!' });
  }, [toast]);

  const handleUsePrompt = useCallback((prompt: string) => {
    // Navigate to image generator with prompt as URL param
    navigate(`/image-generator?prompt=${encodeURIComponent(prompt)}`);
  }, [navigate]);

  const getPlatformIcon = (platform: string) => {
    if (platform === 'instagram') return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
    if (platform === 'twitter') return <Twitter className="w-3.5 h-3.5 text-sky-500" />;
    return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
  };

  const getPlatformLabel = (platform: string) => {
    if (platform === 'instagram') return 'Instagram';
    if (platform === 'twitter') return 'X / Twitter';
    return 'Instagram & X';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
  };

  const filteredTrends = trends.filter(t => {
    if (selectedPlatform !== 'all' && t.platform !== selectedPlatform && t.platform !== 'both') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Viral Trend Scout - SocialTool</title>
        <meta name="description" content="AI-powered viral trend scanner for Instagram and X. Discover trending topics and get AI image prompts to create viral content." />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-50 h-12 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
        <Link to="/tools" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tools</span>
        </Link>
        <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          Viral Trend Scout
        </span>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Controls */}
        <div className="lg:w-[320px] lg:min-w-[280px] lg:border-r border-border p-4 space-y-3 overflow-y-auto">
          {/* Category filter */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                    selectedCategory === cat
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 bg-background text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Platform filter */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" /> Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORM_FILTERS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border ${
                      selectedPlatform === p.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 bg-background text-muted-foreground hover:border-primary/30'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scan button */}
          <Button
            onClick={handleScan}
            disabled={isLoading}
            className="w-full rounded-xl h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning trends…</>
            ) : hasScanned ? (
              <><RefreshCw className="w-4 h-4 mr-2" /> Rescan Trends</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Scan Viral Trends</>
            )}
          </Button>

          {hasScanned && !isLoading && (
            <p className="text-[11px] text-muted-foreground text-center">
              {filteredTrends.length} trend{filteredTrends.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* RIGHT: Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {!hasScanned && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Zap className="w-7 h-7 text-primary opacity-50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Discover What's Viral</p>
                    <p className="text-xs text-muted-foreground mt-1">Scan trending topics and get AI image prompts to ride the wave</p>
                  </div>
                </div>
              </motion.div>
            )}

            {isLoading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                    <Zap className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Scanning viral trends…</p>
                  <p className="text-xs text-muted-foreground">Analyzing Instagram & X for trending content</p>
                </div>
              </motion.div>
            )}

            {hasScanned && !isLoading && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {filteredTrends.map((trend, idx) => (
                  <motion.div
                    key={`${trend.title}-${idx}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-sm transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getPlatformIcon(trend.platform)}
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {getPlatformLabel(trend.platform)}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">•</span>
                          <span className="text-[10px] text-muted-foreground">{trend.category}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{trend.title}</h3>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${getScoreColor(trend.engagement_score)}`}>
                        <TrendingUp className="w-3 h-3" />
                        {trend.engagement_score}
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-muted-foreground leading-relaxed">{trend.reason}</p>

                    {/* Image prompt */}
                    <div className="rounded-lg bg-muted/30 border border-border/50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
                          <Wand2 className="w-3 h-3" /> Image Prompt
                        </span>
                        <button
                          onClick={() => handleCopy(trend.image_prompt, `prompt-${idx}`)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-muted-foreground hover:text-foreground transition-all"
                        >
                          {copiedId === `prompt-${idx}` ? <><Check className="w-3 h-3 text-green-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                        </button>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{trend.image_prompt}</p>
                    </div>

                    {/* Hashtags */}
                    {trend.hashtags?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="flex flex-wrap gap-1 flex-1">
                          {trend.hashtags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[11px] text-primary/80 font-medium">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleCopy(trend.hashtags.join(' '), `tags-${idx}`)}
                          className="text-[11px] text-muted-foreground hover:text-foreground transition-all shrink-0"
                        >
                          {copiedId === `tags-${idx}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}

                    {/* Action */}
                    <Button
                      onClick={() => handleUsePrompt(trend.image_prompt)}
                      variant="outline"
                      size="sm"
                      className="w-full rounded-lg text-xs h-8"
                    >
                      <Sparkles className="w-3 h-3 mr-1.5" />
                      Generate This Image
                    </Button>
                  </motion.div>
                ))}

                {filteredTrends.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No trends found for this filter. Try a different category or platform.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default TrendScout;
