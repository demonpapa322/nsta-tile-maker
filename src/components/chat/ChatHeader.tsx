import { motion } from 'framer-motion';
import { PanelLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface ChatHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function ChatHeader({ onMenuToggle, isSidebarOpen }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-12 px-2">
        {/* Left Section */}
        <div className="flex items-center gap-1">
          {/* GPT-style sidebar toggle — panel icon */}
          <motion.button
            onClick={onMenuToggle}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted/70 transition-colors text-muted-foreground hover:text-foreground"
            whileTap={{ scale: 0.92 }}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <PanelLeft className="w-5 h-5" />
          </motion.button>
          
          {/* Brand - as draggable link */}
          <Link 
            to="/"
            className="hidden sm:inline text-sm font-semibold hover:opacity-80 transition-opacity ml-1"
            draggable="true"
          >
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">SocialTool</span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
