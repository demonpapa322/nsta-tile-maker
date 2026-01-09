import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Grid3X3, Hash, MessageSquare, Image, Sparkles } from 'lucide-react';

const tools = [
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

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10">
        <main className="container py-12 md:py-20">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Free Tools</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
              Social<span className="gradient-text">Tools</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Free tools to supercharge your social media presence
            </p>
          </div>

          {/* Tool Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                    <tool.icon className={`w-6 h-6 ${tool.ready ? 'text-primary' : 'text-muted-foreground'}`} />
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
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 mt-12">
          <p className="text-center text-xs text-muted-foreground/70">
            All processing happens locally — your data never leaves your device
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
