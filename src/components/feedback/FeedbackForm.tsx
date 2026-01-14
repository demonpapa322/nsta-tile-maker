import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function FeedbackForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      message: formData.get('message'),
      _to: 'nunchuckspro123@gmail.com',
    };

    // Optimistic UI: Reset form and close immediately while sending in background
    setIsSubmitted(true);
    const formElement = e.currentTarget;

    try {
      const response = await fetch('https://formspree.io/f/xvgzlowz', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed');
      
      toast.success('Feedback sent!');
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
        formElement.reset();
      }, 1500);
    } catch (error) {
      setIsSubmitted(false);
      toast.error('Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mb-4 w-80 sm:w-96 bg-background/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Feedback</h3>
                  <p className="text-xs text-muted-foreground">Tell us how we can improve</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 hover:bg-muted"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">Thank You!</h4>
                  <p className="text-sm text-muted-foreground">Your feedback helps us make SocialTool better for everyone.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Alex"
                      required
                      className="rounded-2xl bg-muted/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Your Feedback
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="What's on your mind?"
                      required
                      className="min-h-[120px] rounded-2xl bg-muted/30 border-none resize-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Feedback
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${
          isOpen ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </motion.div>
      </Button>
    </div>
  );
}