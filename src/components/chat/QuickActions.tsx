import { motion } from 'framer-motion';
import { Grid3X3, ImagePlus, Lightbulb, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'grid-split',
    label: 'Split Grid',
    icon: <Grid3X3 className="w-4 h-4" />,
    color: 'text-emerald-500',
    prompt: 'I want to split an image into a grid for Instagram'
  },
  {
    id: 'suggest',
    label: 'Suggest Layout',
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'text-amber-500',
    prompt: 'Suggest the best grid layout for my image'
  },
  {
    id: 'resize',
    label: 'Resize Image',
    icon: <Wand2 className="w-4 h-4" />,
    color: 'text-sky-500',
    prompt: 'Help me resize an image for social media'
  },
  {
    id: 'upload',
    label: 'Upload Image',
    icon: <ImagePlus className="w-4 h-4" />,
    color: 'text-violet-500',
    prompt: 'I want to upload an image to work with'
  },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <motion.div 
      className="flex flex-wrap justify-center gap-2 max-w-md mx-auto"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, staggerChildren: 0.05 }}
    >
      {quickActions.map((action, index) => (
        <motion.button
          key={action.id}
          onClick={() => onSelect(action.prompt)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full",
            "bg-card border border-border",
            "hover:bg-muted/70 hover:border-primary/30",
            "transition-all text-sm font-medium",
            "shadow-sm hover:shadow-md"
          )}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={action.color}>{action.icon}</span>
          <span>{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
