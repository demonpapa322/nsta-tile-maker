import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface ChatHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function ChatHeader({ onMenuToggle, isSidebarOpen }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-14 px-3">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onMenuToggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="w-5 h-5" />
          </motion.button>
          
          {/* Brand - as draggable link */}
          <Link 
            to="/"
            className="hidden sm:inline text-base font-semibold hover:opacity-80 transition-opacity"
            draggable="true"
          >
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">SocialTool</span>
            <span className="text-muted-foreground font-normal"> - AI powered Social Media suite</span>
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
