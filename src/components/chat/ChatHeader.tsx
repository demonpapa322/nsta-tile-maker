import { motion } from 'framer-motion';
import { Menu, Sparkles, UserPlus, ScanLine } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function ChatHeader({ onMenuToggle, isSidebarOpen }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
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
          
          {/* Brand/Upgrade Button */}
          <motion.button
            className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full",
              "bg-gradient-to-r from-violet-400/10 via-fuchsia-400/10 to-rose-400/10",
              "border border-primary/20",
              "text-sm font-medium",
              "hover:border-primary/40 transition-colors"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              GridAI
            </span>
          </motion.button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Invite users"
          >
            <UserPlus className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Scan"
          >
            <ScanLine className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
