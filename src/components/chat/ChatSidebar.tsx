import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  PenSquare, 
  Wrench,
  Trash2,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemePicker } from '@/components/ThemePicker';
import { MessageCircle } from 'lucide-react';
import type { ChatRecord } from '@/hooks/useChatHistory';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNewChat: () => void;
  onFeedback?: () => void;
  chats: ChatRecord[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  isMobile?: boolean;
}

export function ChatSidebar({ 
  isOpen, onClose, onToggle, onNewChat, onFeedback,
  chats, activeChatId, onSelectChat, onDeleteChat, isMobile 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 260 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ 
          width: { type: 'spring', stiffness: 300, damping: 30, mass: 0.9 },
          opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
        }}
        className={cn(
          "relative h-full z-50 overflow-hidden will-change-[width,opacity]",
          "bg-sidebar border-r border-border/50",
          "flex flex-col",
        )}
      >
        <div className="w-[260px] flex flex-col h-full">
          {/* Top row */}
          <div className="flex items-center justify-between h-12 px-2">
            <Link 
              to="/"
              className="text-sm font-semibold hover:opacity-80 transition-opacity ml-1"
            >
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">SocialTool</span>
            </Link>
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
            <nav className="space-y-1">
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
              <Link 
                to="/post-scheduler"
                onClick={onClose}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-all text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-foreground/80">
                  Post Scheduler
                </span>
              </Link>
            </nav>
          </div>

          {/* Divider */}
          <div className="mx-3 h-px bg-border/40" />

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none">
            {filteredChats.length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-6">
                No chats yet
              </p>
            ) : (
              <div className="space-y-0.5">
                {filteredChats.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "w-full flex items-center justify-between gap-1 px-3 py-2 rounded-lg transition-colors text-sm text-left group cursor-pointer",
                      activeChatId === item.id 
                        ? "bg-muted/80 text-foreground" 
                        : "hover:bg-muted/60 text-foreground/70"
                    )}
                    onClick={() => onSelectChat(item.id)}
                  >
                    <span className="truncate flex-1">{item.title}</span>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); onDeleteChat(item.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      whileTap={{ scale: 0.85 }}
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme & Feedback */}
          <div className="p-2 border-t border-border/40 space-y-0.5">
            <ThemePicker />
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

      {/* Floating open button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={onToggle}
            className="fixed top-3.5 left-3 z-50 w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
            whileTap={{ scale: 0.85 }}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
