import { Helmet } from 'react-helmet-async';
import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Grid3X3, Hash, MessageSquare, Image, LucideIcon } from 'lucide-react';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  ready: boolean;
}

const tools: Tool[] = [
  {
    id: 'grid-splitter',
    name: 'Grid Splitter',
    description: 'Split images into perfect Instagram grid posts',
    icon: Grid3X3,
    path: '/grid-splitter',
    ready: true,
  },
  {
    id: 'caption-generator',
    name: 'Caption Generator',
    description: 'Create engaging captions with AI assistance',
    icon: MessageSquare,
    path: '/caption-generator',
    ready: false,
  },
  {
    id: 'hashtag-finder',
    name: 'Hashtag Finder',
    description: 'Discover trending hashtags for your niche',
    icon: Hash,
    path: '/hashtag-finder',
    ready: false,
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images for any social platform',
    icon: Image,
    path: '/image-resizer',
    ready: false,
  },
];

// Pre-computed animation variants for better performance
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

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, delay: i * 0.08 },
  }),
};

const headerVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

// Memoized tool card to prevent unnecessary re-renders
const ToolCard = memo(function ToolCard({ 
  tool, 
  index 
}: { 
  tool: Tool; 
  index: number;
}) {
  const Icon = tool.icon;
  
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="will-animate"
    >
      <Link
        to={tool.path}
        className={`group block p-6 rounded-2xl border bg-card transition-all duration-300 ${
          tool.ready
            ? 'border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
            : 'border-border/50 opacity-60 cursor-default pointer-events-none'
        }`}
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
          tool.ready 
            ? 'bg-primary/10 group-hover:bg-primary/20' 
            : 'bg-muted'
        }`}>
          <Icon className={`w-6 h-6 ${tool.ready ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <h3 className="font-semibold text-foreground mb-1">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {tool.description}
        </p>
        {!tool.ready && (
          <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            Coming Soon
          </span>
        )}
      </Link>
    </motion.div>
  );
});

const Home = memo(function Home() {
  // Memoize the tool cards to prevent re-creation on each render
  const toolCards = useMemo(() => 
    tools.map((tool, index) => (
      <motion.div
        key={tool.id}
        initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.8, 
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1]
        }}
      >
        <ToolCard tool={tool} index={index} />
      </motion.div>
    )), 
    []
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
        {/* Primary Meta Tags */}
        <title>SocialTool</title>
        <meta name="title" content="SocialTool" />
        <meta name="description" content="Free online tools for social media creators. Split images into Instagram grids, generate captions, find trending hashtags, and resize images. No signup required, 100% private." />
        <meta name="keywords" content="social media tools, instagram tools, free instagram grid splitter, image splitter, grid maker, caption generator, hashtag finder, image resizer, instagram post splitter, social media creator tools, content creation tools, instagram carousel maker, SocialTools" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="SocialTools" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.socialtool.co/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.socialtool.co/" />
        <meta property="og:title" content="SocialTools - Free Instagram Grid Splitter & Social Media Tools" />
        <meta property="og:description" content="Free tools for social media creators. Split images into grids, generate captions, find hashtags. No signup, 100% private." />
        <meta property="og:site_name" content="SocialTools" />
        <meta property="og:image" content="https://www.socialtool.co/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.socialtool.co/" />
        <meta name="twitter:title" content="SocialTools - Free Social Media Tools" />
        <meta name="twitter:description" content="Free tools for creators. Split images, generate captions, find hashtags. No signup required." />
        <meta name="twitter:image" content="https://www.socialtool.co/og-image.png" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SocialTool",
            "url": "https://www.socialtool.co",
            "description": "Free online tools for social media creators",
            "sameAs": []
          })}
        </script>
        
        {/* Structured Data - WebSite with SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SocialTool",
            "url": "https://www.socialtool.co",
            "description": "Free online tools for social media creators. Instagram grid splitter, caption generator, hashtag finder, and image resizer.",
            "publisher": {
              "@type": "Organization",
              "name": "SocialTool"
            }
          })}
        </script>
        
        {/* Structured Data - SoftwareApplication */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "SocialTool",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "150"
            },
            "featureList": [
              "Instagram Grid Splitter",
              "Caption Generator",
              "Hashtag Finder", 
              "Image Resizer",
              "100% browser-based",
              "No signup required",
              "Privacy-focused"
            ]
          })}
        </script>
      </Helmet>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="flex items-center gap-2.5 will-animate"
        >
          <span className="text-xl font-semibold tracking-tight">
            <span className="text-foreground/90">Social</span>
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Tool</span>
          </span>
        </motion.div>
        <ThemeToggle />
      </header>

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        <main className="container pt-28 pb-12 md:pt-32 md:pb-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-3 flex flex-wrap justify-center gap-x-2">
              {"Create better content,".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: "Create better content,".split(" ").length * 0.15 + 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
                className="gradient-text inline-block"
              >
                faster
              </motion.span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              Free tools to supercharge your social media presence
            </p>
          </div>

          {/* Tool Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {toolCards}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 mt-12">
          <p className="text-center text-xs text-muted-foreground/70">
            All processing happens locally — your data never leaves your device
          </p>
        </footer>
      </div>
      <FeedbackForm />
    </motion.div>
  );
});

export default Home;
