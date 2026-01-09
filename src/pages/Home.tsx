import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Grid3X3, Hash, MessageSquare, Image } from 'lucide-react';

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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex items-center gap-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-500 to-orange-400" />
          </div>
          <span className="text-xl font-semibold tracking-tight">
            <span className="text-foreground/90">Social</span>
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">Tools</span>
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-3">
              Create better content, <span className="gradient-text">faster</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
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
