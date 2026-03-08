import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  PenSquare, 
  Wrench,
  Pin,
  MessageCircle,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistory {
  id: string;
  title: string;
  pinned?: boolean;
  hasNotification?: boolean;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNewChat: () => void;
  onFeedback?: () => void;
}

const mockHistory: ChatHistory[] = [
  { id: '1', title: 'Instagram Grid 3x3 Split', pinned: true },
  { id: '2', title: 'Profile Photo Resize' },
  { id: '3', title: 'Carousel Layout Design', hasNotification: true },
  { id: '4', title: 'Story Dimensions Help' },
  { id: '5', title: 'Feed Aesthetic Planning' },
];

export function ChatSidebar({ isOpen, onClose, onToggle, onNewChat, onFeedback }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = mockHistory.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 260 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ 
          width: { type: 'spring', stiffness: 400, damping: 35, mass: 0.8 },
          opacity: { duration: 0.15, ease: 'easeOut' }
        }}
        className={cn(
          "relative h-full z-50 overflow-hidden will-change-[width]",
          "bg-sidebar border-r border-border/50",
          "flex flex-col",
        )}
      >
        <div className="w-[260px] flex flex-col h-full">
          {/* Top row: sidebar brand + toggle */}
          <div className="flex items-center justify-between h-12 px-2">
            <Link 
              to="/"
              className="text-sm font-semibold hover:opacity-80 transition-opacity ml-1"
              draggable="true"
            >
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">SocialTool</span>
            </Link>

            {/* GPT-style collapse toggle — inside sidebar, top right */}
            <div className="flex items-center gap-0.5">
              <motion.button
                onClick={onNewChat}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="New chat"
                title="New chat"
              >
                <PenSquare className="w-[18px] h-[18px]" />
              </motion.button>
              <motion.button
                onClick={onToggle}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Close sidebar"
                title="Close sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/40 border-0 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Quick Access */}
          <div className="px-3 pb-2">
            <nav className="space-y-0.5">
              <Link 
                to="/tools"
                onClick={onClose}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-rose-500/10 border border-violet-500/20 hover:from-violet-500/20 hover:via-fuchsia-500/20 hover:to-rose-500/20 hover:border-violet-500/30 transition-all text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 flex items-center justify-center shadow-sm">
                  <Wrench className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                  Tools
                </span>
              </Link>
            </nav>
          </div>

          {/* Divider */}
          <div className="mx-3 h-px bg-border/40" />

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none">
            <div className="space-y-0.5">
              {filteredHistory.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-sm text-left group"
                >
                  <span className="truncate flex-1 text-foreground/80">{item.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.pinned && <Pin className="w-3 h-3 text-muted-foreground/60" />}
                    {item.hasNotification && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Button */}
          <div className="p-2 border-t border-border/40">
            <button 
              onClick={onFeedback}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors text-sm text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Feedback</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Floating open button — visible when sidebar is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onToggle}
            className="fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
