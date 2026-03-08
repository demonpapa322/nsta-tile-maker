import { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Image, Download, Copy, TrendingUp, Hash, 
  Grid3X3, Maximize, AlertCircle, ImagePlus 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolResult } from '@/lib/toolExecutor';

interface ToolResultDisplayProps {
  result: ToolResult;
}

export const ToolResultDisplay = memo(function ToolResultDisplay({ result }: ToolResultDisplayProps) {
  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  switch (result.type) {
    case 'image':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden border border-border/60 bg-card max-w-md"
        >
          {result.data?.imageUrl && (
            <img 
              src={result.data.imageUrl} 
              alt={result.content}
              className="w-full rounded-t-xl"
              loading="lazy"
            />
          )}
          <div className="p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate flex-1">{result.content}</span>
            {result.data?.imageUrl && (
              <button
                onClick={() => handleDownload(result.data.imageUrl, 'generated-image.png')}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      );

    case 'resize':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden border border-border/60 bg-card max-w-md"
        >
          {result.data?.url && (
            <img 
              src={result.data.url} 
              alt="Resized image"
              className="w-full rounded-t-xl"
              loading="lazy"
            />
          )}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Maximize className="w-3.5 h-3.5" />
              <span>{result.data?.width}×{result.data?.height}</span>
            </div>
            {result.data?.url && (
              <button
                onClick={() => handleDownload(result.data.url, `resized-${result.data.width}x${result.data.height}.png`)}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            )}
          </div>
        </motion.div>
      );

    case 'captions':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 max-w-lg"
        >
          {result.data?.captions && Object.entries(result.data.captions).map(([platform, captions]: [string, any]) => (
            <div key={platform} className="rounded-xl border border-border/60 bg-card p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                {platform}
              </div>
              {Array.isArray(captions) && captions.slice(0, 2).map((caption: any, i: number) => (
                <div key={i} className="mb-2 last:mb-0">
                  <p className="text-sm text-foreground/90 mb-1">{caption.text}</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(`${caption.text}\n${caption.hashtags?.join(' ') || ''}`)}
                      className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      );

    case 'trends':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 max-w-lg"
        >
          {result.data?.trends?.slice(0, 4).map((trend: any, i: number) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-foreground">{trend.title}</span>
                <span className="flex items-center gap-1 text-xs text-primary font-semibold">
                  <TrendingUp className="w-3 h-3" /> {trend.engagement_score}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">{trend.reason}</p>
              <div className="flex flex-wrap gap-1">
                {trend.hashtags?.slice(0, 5).map((tag: string, j: number) => (
                  <span key={j} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      );

    case 'needs_image':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 max-w-md flex items-start gap-3"
        >
          <ImagePlus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Image required</p>
            <p className="text-xs text-muted-foreground">{result.content}</p>
          </div>
        </motion.div>
      );

    case 'error':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 max-w-md flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">{result.content}</p>
        </motion.div>
      );

    default:
      return null;
  }
});
