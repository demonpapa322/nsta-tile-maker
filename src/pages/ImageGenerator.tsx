import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const ImageGenerator = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Image Generator - SocialTool</title>
        <meta name="description" content="Generate stunning images with AI for your social media posts. Free AI image generator powered by Perchance." />
      </Helmet>

      {/* ── Top bar ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Tools</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground hidden sm:block">AI Image Generator</span>
        </div>

        <ThemeToggle />
      </header>

      {/* ── Main content ── */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <iframe
              src="https://null.perchance.org"
              title="AI Image Generator"
              allow="clipboard-write"
              style={{ width: '100%', height: '800px', border: 'none' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImageGenerator;
