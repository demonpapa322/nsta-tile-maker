import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

const feedbackSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
  message: z.string().trim().min(10, { message: "Message must be at least 10 characters" }).max(1000),
});

export const FeedbackWidget = memo(function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setErrors({});
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = feedbackSchema.safeParse({ email, message });
    
    if (!result.success) {
      const fieldErrors: { email?: string; message?: string } = {};
      result.error.errors.forEach(err => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'message') fieldErrors.message = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Build mailto URL - opens native Gmail app on mobile, mail client on desktop
    const recipient = 'nunchuckspro123@gmail.com';
    const subject = encodeURIComponent('Feedback from SocialTools User');
    const body = encodeURIComponent(`From: ${email}\n\n${message}`);
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Open native email app (Gmail on mobile if set as default)
    window.location.href = mailtoUrl;

    // Reset form
    setTimeout(() => {
      setEmail('');
      setMessage('');
      setIsOpen(false);
      setIsSubmitting(false);
    }, 500);
  }, [email, message]);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary via-primary to-accent shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open feedback"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Feedback panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]"
          >
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Send Feedback</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  We'd love to hear from you!
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="feedback-email" className="text-xs font-medium text-muted-foreground">
                    Your Email
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think..."
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/50"
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11 rounded-xl font-semibold gap-2"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Opening Gmail...' : 'Send via Gmail'}
                </Button>

                <p className="text-[10px] text-center text-muted-foreground/70">
                  Opens Gmail to send your feedback
                </p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
