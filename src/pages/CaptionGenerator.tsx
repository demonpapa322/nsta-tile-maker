import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';

const CaptionGenerator = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">SocialTools</span>
        </Link>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Caption Generator
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Create engaging, on-brand captions for your social media posts with AI assistance.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;
