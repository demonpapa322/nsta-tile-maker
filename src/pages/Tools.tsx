import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Grid3X3, Image, Hash, MessageSquare, Wand2, Zap, ArrowUpRight, Sparkles, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  available: boolean;
  accent: string;
  featured?: boolean;
  tag?: string;
}

const tools: Tool[] = [
  {
    title: 'Grid Splitter',
    description: 'Split images into perfect Instagram grid layouts with precision control',
    icon: Grid3X3,
    href: '/grid-splitter',
    available: true,
    accent: 'from-violet-500/20 to-indigo-500/20 dark:from-violet-500/10 dark:to-indigo-500/10',
    featured: true,
    tag: 'Popular',
  },
  {
    title: 'AI Image Generator',
    description: 'Create stunning visuals from text descriptions powered by AI',
    icon: Wand2,
    href: '/image-generator',
    available: true,
    accent: 'from-fuchsia-500/20 to-pink-500/20 dark:from-fuchsia-500/10 dark:to-pink-500/10',
    featured: true,
    tag: 'AI Powered',
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
    title: 'Caption Generator',
    description: 'Write engaging, platform-optimized captions with AI assistance',
    icon: MessageSquare,
    href: '/caption-generator',
    available: true,
    accent: 'from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10',
    tag: 'AI Powered',
  },
  {
    title: 'Viral Trend Scout',
    description: 'Discover viral trends and get content ideas before they peak',
    icon: Zap,
    href: '/trend-scout',
    available: true,
    accent: 'from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10',
    tag: 'New',
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

const tagColors: Record<string, string> = {
  'Popular': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  'AI Powered': 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20',
  'New': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

function ScrollRevealCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.97 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

const Tools = () => {
  const featuredTools = tools.filter(t => t.featured);
  const regularTools = tools.filter(t => !t.featured);

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

      <div className="relative z-10 max-w-5xl mx-auto pt-28 pb-20 px-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-14"
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

        {/* Featured Tools — Large showcase cards */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-5"
          >
            <Star className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Featured</span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredTools.map((tool, i) => {
              const IconComponent = tool.icon;
              const colorClass = iconAccentMap[tool.title] || 'text-primary';

              return (
                <ScrollRevealCard key={tool.title} index={i}>
                  <Link
                    to={tool.href}
                    className={`group relative block rounded-2xl border border-border/60 bg-card overflow-hidden h-full transition-all duration-300 hover:border-border hover:shadow-elevated`}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative z-10 p-7 sm:p-8">
                      {/* Tag */}
                      {tool.tag && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-5 ${tagColors[tool.tag] || 'bg-muted text-muted-foreground border-border'}`}>
                          {tool.tag}
                        </span>
                      )}

                      {/* Icon */}
                      <div className="mb-5">
                        <div className="w-12 h-12 rounded-xl bg-background/80 dark:bg-background/50 border border-border/40 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          <IconComponent className={`w-6 h-6 ${colorClass} transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        {tool.title}
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                </ScrollRevealCard>
              );
            })}
          </div>
        </section>

        {/* All Tools */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-2 mb-5"
          >
            <Sparkles className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">All Tools</span>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {regularTools.map((tool, i) => {
              const IconComponent = tool.icon;
              const colorClass = iconAccentMap[tool.title] || 'text-primary';

              return (
                <ScrollRevealCard key={tool.title} index={i + featuredTools.length}>
                  <Link
                    to={tool.available ? tool.href : '#'}
                    className={`group relative block rounded-xl border border-border/50 bg-card p-5 h-full transition-all duration-300 ${
                      tool.available
                        ? 'hover:border-border hover:shadow-elevated cursor-pointer'
                        : 'opacity-50 cursor-default'
                    }`}
                  >
                    {/* Hover gradient */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <IconComponent className={`w-5 h-5 ${colorClass} transition-transform duration-300 group-hover:scale-110`} strokeWidth={1.5} />
                        {tool.tag && (
                          <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tagColors[tool.tag] || 'bg-muted text-muted-foreground border-border'}`}>
                            {tool.tag}
                          </span>
                        )}
                        {!tool.available && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
                            Soon
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                        {tool.title}
                        {tool.available && (
                          <ArrowUpRight className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300" />
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </Link>
                </ScrollRevealCard>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Tools;
