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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/70 transition-colors text-sm"
              >
                <Wrench className="w-4 h-4 text-primary" />
                Tools
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
