import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Pencil, Check, Hash, HelpCircle, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommentSuggestion {
  type: 'cta' | 'question' | 'hashtag';
  text: string;
  description: string;
}

interface FirstCommentGeneratorProps {
  comments: CommentSuggestion[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onEdit: (index: number, text: string) => void;
  autoPost: boolean;
  onAutoPostToggle: (val: boolean) => void;
  isLoading: boolean;
}

const typeIcons = {
  cta: Megaphone,
  question: HelpCircle,
  hashtag: Hash,
};

const typeLabels = {
  cta: 'Call to Action',
  question: 'Question',
  hashtag: 'Algorithm Boost',
};

export function FirstCommentGenerator({ 
  comments, selectedIndex, onSelect, onEdit, autoPost, onAutoPostToggle, isLoading 
}: FirstCommentGeneratorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditText(comments[i].text);
  };

  const saveEdit = (i: number) => {
    onEdit(i, editText);
    setEditingIndex(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!comments.length) return null;

  return (
    <div className="space-y-3">
      {comments.map((c, i) => {
        const Icon = typeIcons[c.type] || MessageSquare;
        const isSelected = selectedIndex === i;
        const isEditing = editingIndex === i;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-4 rounded-xl border transition-all",
              isSelected
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 bg-card hover:border-primary/40"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {typeLabels[c.type]}
                  </span>
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full min-h-[60px] p-2 rounded-lg bg-muted/50 border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(i)}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 mb-1">{c.text}</p>
                )}
                <p className="text-[11px] text-muted-foreground">{c.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!isEditing && (
                  <button
                    onClick={() => startEdit(i)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onSelect(i)}
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  title="Select this comment"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Auto-post toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground/80">Auto-post first comment</span>
        </div>
        <button
          onClick={() => onAutoPostToggle(!autoPost)}
          className={cn(
            "relative w-10 h-5 rounded-full transition-colors",
            autoPost ? "bg-primary" : "bg-muted"
          )}
        >
          <motion.div
            animate={{ x: autoPost ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          />
        </button>
      </div>
    </div>
  );
}
