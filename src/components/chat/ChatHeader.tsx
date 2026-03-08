import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface ChatHeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function ChatHeader({ onMenuToggle, isSidebarOpen }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-12 px-3">
        {/* Left — brand only when sidebar closed */}
        <div className="flex items-center gap-1">
          {!isSidebarOpen && (
            <Link 
              to="/"
              className="text-sm font-semibold hover:opacity-80 transition-opacity ml-10"
              draggable="true"
            >
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">SocialTool</span>
            </Link>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
