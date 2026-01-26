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
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

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
            <div className="bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient accent */}
              <div className="px-5 py-4 border-b border-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-rose-500/10" />
                <h3 className="relative text-base font-semibold text-foreground">Share your feedback</h3>
                <p className="relative text-xs text-muted-foreground mt-0.5">We'd love to hear from you</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
                    className="w-full px-4 py-2.5 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500/50 transition-all placeholder:text-muted-foreground/50"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1.5">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    id="feedback-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you think..."
                    rows={4}
                    className="w-full px-4 py-2.5 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500/50 transition-all resize-none placeholder:text-muted-foreground/50"
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive mt-1.5">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Opening...' : 'Send Feedback'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
