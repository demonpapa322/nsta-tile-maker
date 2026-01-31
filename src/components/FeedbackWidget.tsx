import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ArrowRight } from 'lucide-react';
import { z } from 'zod';

const feedbackSchema = z.object({
  email: z.string().trim().email({ message: "Valid email required" }).max(255),
  message: z.string().trim().min(10, { message: "Min 10 characters" }).max(1000),
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

    const recipient = 'nunchuckspro123@gmail.com';
    const subject = encodeURIComponent('Feedback from SocialTools User');
    const body = encodeURIComponent(`From: ${email}\n\n${message}`);
    
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Use mailto to open default mail app (Gmail app if set as default)
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    } else {
      // Desktop: Open Gmail compose in new tab
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
    }

    setTimeout(() => {
      setEmail('');
      setMessage('');
      setIsOpen(false);
      setIsSubmitting(false);
    }, 500);
  }, [email, message]);

  return (
    <>
      {/* Themed floating trigger with gradient */}
      <motion.button
        onClick={handleToggle}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/25 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close feedback" : "Send feedback"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Expanded themed panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            className="fixed bottom-20 right-5 z-50 w-80 sm:w-96"
          >
            <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div>
                  <label htmlFor="feedback-email" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Email
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/40 transition-all placeholder:text-muted-foreground/60"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Feedback
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we improve?"
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500/40 transition-all resize-none placeholder:text-muted-foreground/60"
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Opening...' : 'Send'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
