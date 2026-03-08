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
import type { Conversation } from '@/hooks/useChatStorage';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNewChat: () => void;
  onFeedback?: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ChatSidebar({ 
  isOpen, onClose, onToggle, onNewChat, 
  conversations, activeConversationId, onSelectConversation, onDeleteConversation 
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
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

          {/* Chat History - Real conversations */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-none">
            {filteredConversations.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-xs text-muted-foreground/50">No conversations yet</p>
                <p className="text-xs text-muted-foreground/40 mt-1">Chats auto-delete after 7 days</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredConversations.map((convo) => (
                  <div
                    key={convo.id}
                    className={cn(
                      "w-full flex items-center justify-between gap-1 px-3 py-2 rounded-lg transition-colors text-sm text-left group cursor-pointer",
                      convo.id === activeConversationId
                        ? "bg-muted/80 text-foreground"
                        : "hover:bg-muted/60 text-foreground/70"
                    )}
                    onClick={() => onSelectConversation(convo.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-[13px]">{convo.title}</span>
                      <span className="block text-[10px] text-muted-foreground/50 mt-0.5">
                        {timeAgo(convo.updatedAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(convo.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme */}
          <div className="p-2 border-t border-border/40 space-y-0.5">
            <ThemePicker />
          </div>
        </div>
      </motion.aside>

      {/* Floating open button */}
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
