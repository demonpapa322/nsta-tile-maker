 import { Helmet } from 'react-helmet-async';
 import { Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Grid3X3, Image, Hash, MessageSquare, Sparkles, Wand2 } from 'lucide-react';

const tools = [
  {
    title: 'Grid Splitter',
    description: 'Split images into perfect Instagram grid posts',
    icon: Grid3X3,
    href: '/grid-splitter',
    available: true,
  },
  {
    title: 'Image Resizer',
    description: 'Resize and optimize images for social media',
    icon: Image,
    href: '/image-resizer',
    available: true,
  },
  {
    title: 'AI Image Generator',
    description: 'Create stunning images from text with AI',
    icon: Wand2,
    href: '/image-generator',
    available: true,
  },
  {
    title: 'Caption Generator',
    description: 'Create engaging captions with AI assistance',
    icon: MessageSquare,
    href: '/caption-generator',
    available: false,
  },
  {
    title: 'Hashtag Finder',
    description: 'Discover trending hashtags for your content',
    icon: Hash,
    href: '/hashtag-finder',
    available: false,
  },
];
 
 const containerVariants = {
   hidden: { opacity: 0 },
   visible: {
     opacity: 1,
     transition: { staggerChildren: 0.1 },
   },
 };
 
 const itemVariants = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0 },
 };
 
 const Tools = () => {
   return (
     <div className="min-h-screen bg-background">
       <Helmet>
         <title>Tools - SocialTool</title>
         <meta name="description" content="Free social media tools - Instagram grid splitter, image resizer, caption generator, and hashtag finder." />
       </Helmet>
 
       {/* Header */}
       <div className="fixed top-4 left-4 z-50">
         <Link
           to="/"
           className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
         >
           <ArrowLeft className="w-4 h-4" />
           <span className="hidden sm:inline bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent font-semibold">SocialTool</span>
         </Link>
       </div>
       <div className="fixed top-4 right-4 z-50">
         <ThemeToggle />
       </div>
 
       {/* Background gradient */}
       <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
 
       <div className="relative z-10 container py-20 px-4">
         {/* Hero */}
         <div className="text-center mb-12">
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
           >
             <Sparkles className="w-3.5 h-3.5 text-primary" />
             <span className="text-xs font-medium text-primary">Free & Private</span>
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
           >
             Social Media
             <span className="block mt-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
               Tools Suite
             </span>
           </motion.h1>
           <motion.p
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-muted-foreground max-w-md mx-auto"
           >
             Everything you need to create stunning social media content
           </motion.p>
         </div>
 
         {/* Tools Grid */}
         <motion.div 
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
         >
           {tools.map((tool) => (
             <motion.div key={tool.title} variants={itemVariants}>
               <Link
                 to={tool.href}
                 className="group block p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
               >
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                   <tool.icon className="w-6 h-6 text-primary" />
                 </div>
                 <h3 className="font-semibold text-foreground mb-2">{tool.title}</h3>
                 <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                 {!tool.available && (
                   <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                     <Sparkles className="w-3 h-3" />
                     Coming Soon
                   </span>
                 )}
               </Link>
             </motion.div>
           ))}
         </motion.div>
       </div>
     </div>
   );
 };
 
 export default Tools;