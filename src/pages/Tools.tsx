import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Grid3X3, Image, Hash, MessageSquare, Wand2, Zap, ArrowUpRight, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  available: boolean;
  accent: string; // tailwind gradient classes
}

const tools: Tool[] = [
  {
    title: 'Grid & Carousel Maker',
    description: 'Split images into perfect Instagram grid layouts with precision control',
    icon: Grid3X3,
    href: '/grid-splitter',
    available: true,
    accent: 'from-violet-500/20 to-indigo-500/20 dark:from-violet-500/10 dark:to-indigo-500/10',
  },
  {
    title: 'Image Resizer',
    description: 'Resize and optimize for every social platform in one click',
    icon: Image,
    href: '/image-resizer',
    available: true,
    accent: 'from-sky-500/20 to-cyan-500/20 dark:from-sky-500/10 dark:to-cyan-500/10',
  },
  {
    title: 'AI Image Generator',
    description: 'Create stunning visuals from text descriptions with AI',
    icon: Wand2,
    href: '/image-generator',
    available: true,
    accent: 'from-fuchsia-500/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-500/10',
  },
  {
    title: 'Caption Generator',
    description: 'Write engaging, platform-optimized captions with AI',
    icon: MessageSquare,
    href: '/caption-generator',
    available: true,
    accent: 'from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10',
  },
  {
    title: 'Viral Trend Scout',
    description: 'Discover viral trends and get content ideas before they peak',
    icon: Zap,
    href: '/trend-scout',
    available: true,
    accent: 'from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10',
  },
  {
    title: 'Hashtag Finder',
    description: 'Find the perfect trending hashtags to maximize your reach',
    icon: Hash,
    href: '/hashtag-finder',
    available: false,
    accent: 'from-rose-500/20 to-red-500/20 dark:from-rose-500/10 dark:to-red-500/10',
  },
];

const iconAccentMap: Record<string, string> = {
  'Grid Splitter': 'text-violet-600 dark:text-violet-400',
  'Image Resizer': 'text-sky-600 dark:text-sky-400',
  'AI Image Generator': 'text-fuchsia-600 dark:text-fuchsia-400',
  'Caption Generator': 'text-emerald-600 dark:text-emerald-400',
  'Viral Trend Scout': 'text-amber-600 dark:text-amber-400',
  'Hashtag Finder': 'text-rose-600 dark:text-rose-400',
};

const Tools = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tools - SocialTool</title>
        <meta name="description" content="Free social media tools - Instagram grid splitter, image resizer, caption generator, and hashtag finder." />
      </Helmet>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent font-semibold">
            SocialTool
          </span>
        </Link>
        <ThemeToggle />
      </nav>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full bg-accent/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto pt-28 pb-16 px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Creative
            <br />
            <span className="gradient-text">Toolkit</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed">
            Everything you need to create, optimize, and grow your social media presence.
          </p>
        </motion.div>

        {/* Tools Grid — Bento-inspired */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => {
            const IconComponent = tool.icon;
            const colorClass = iconAccentMap[tool.title] || 'text-primary';

            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link
                  to={tool.available ? tool.href : '#'}
                  className={`group relative block rounded-2xl border border-border/60 bg-card p-6 h-full transition-all duration-300 ${
                    tool.available
                      ? 'hover:border-border hover:shadow-elevated cursor-pointer'
                      : 'opacity-60 cursor-default'
                  }`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-5">
                      <IconComponent className={`w-7 h-7 ${colorClass} transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-semibold text-foreground mb-1.5 flex items-center gap-2">
                      {tool.title}
                      {tool.available ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5" />
                          Soon
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tools;
