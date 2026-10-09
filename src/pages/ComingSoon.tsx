import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="min-h-screen bg-background flex flex-col">
    <Helmet>
      <title>{`${title} - Coming Soon | SocialTool`}</title>
    </Helmet>
    <nav className="flex items-center justify-between px-5 py-4">
      <Link to="/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Tools
      </Link>
      <ThemeToggle />
    </nav>
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <Sparkles className="w-8 h-8 text-primary mb-4" />
      <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-sm">This tool is coming soon. In the meantime, try our other free tools.</p>
      <Link to="/tools" className="mt-6 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
        Browse tools
      </Link>
    </main>
  </div>
);

export default ComingSoon;
