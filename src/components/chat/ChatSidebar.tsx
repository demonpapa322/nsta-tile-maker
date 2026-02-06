import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  PenSquare, 
  Wrench,
  Pin,
  MessageCircle
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

export function ChatSidebar({ isOpen, onClose, onNewChat, onFeedback }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = mockHistory.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 260 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          "relative h-full z-50 overflow-hidden",
          "bg-card border-r border-border",
          "flex flex-col",
        )}
      >
        <div className="w-[260px] flex flex-col h-full">
          {/* Header */}
          <div className="p-3 space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 transition-colors text-sm font-medium"
            >
              <PenSquare className="w-4 h-4" />
              New chat
            </button>
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
          <div className="mx-3 h-px bg-border" />

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <div className="space-y-0.5">
              {filteredHistory.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-muted/70 transition-colors text-sm text-left group"
                >
                  <span className="truncate flex-1">{item.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.pinned && <Pin className="w-3.5 h-3.5 text-muted-foreground" />}
                    {item.hasNotification && (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Button */}
          <div className="p-3 border-t border-border">
            <button 
              onClick={onFeedback}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
              <span>Send Feedback</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
