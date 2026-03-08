import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, MessageSquare, Bot, Send, 
  Sparkles, Calendar, Instagram, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { TimeSuggestions, type TimeSuggestion } from '@/components/scheduler/TimeSuggestions';
import { FirstCommentGenerator, type CommentSuggestion } from '@/components/scheduler/FirstCommentGenerator';
import { AutoModeToggle } from '@/components/scheduler/AutoModeToggle';

const SUPABASE_URL = 'https://qdqihlxlgzomnqkxbjij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkcWlobHhsZ3pvbW5xa3hiamlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE4MzksImV4cCI6MjA4NTY5NzgzOX0.eHlmX9hrya9q9EMzsap148Mkm4G3R9p5qYft9X1AmAE';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -10 },
};

export default function PostScheduler() {
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState('');
  const [timeSuggestions, setTimeSuggestions] = useState<TimeSuggestion[]>([]);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [comments, setComments] = useState<CommentSuggestion[]>([]);
  const [selectedComment, setSelectedComment] = useState<number | null>(null);
  const [autoPostComment, setAutoPostComment] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [customTime, setCustomTime] = useState('');

  const analyze = useCallback(async () => {
    if (!postContent.trim()) {
      toast.error('Please enter your post content first');
      return;
    }

    setIsLoadingTimes(true);
    setIsLoadingComments(true);
    setSelectedTime(null);
    setSelectedComment(null);

    // Fetch times and comments in parallel
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };

    try {
      const [timesRes, commentsRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/functions/v1/schedule-ai`, {
          method: 'POST', headers,
          body: JSON.stringify({ type: 'suggest_times', postContent, platform: 'instagram' }),
        }),
        fetch(`${SUPABASE_URL}/functions/v1/schedule-ai`, {
          method: 'POST', headers,
          body: JSON.stringify({ type: 'first_comments', postContent, platform: 'instagram' }),
        }),
      ]);

      if (timesRes.ok) {
        const data = await timesRes.json();
        setTimeSuggestions(data.suggestions || []);
        if (autoMode && data.suggestions?.length) setSelectedTime(0);
      } else {
        toast.error('Failed to get time suggestions');
      }
      setIsLoadingTimes(false);

      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.comments || []);
        if (autoMode && data.comments?.length) setSelectedComment(0);
      } else {
        toast.error('Failed to generate comments');
      }
      setIsLoadingComments(false);
    } catch (err) {
      console.error(err);
      toast.error('AI analysis failed. Please try again.');
      setIsLoadingTimes(false);
      setIsLoadingComments(false);
    }
  }, [postContent, autoMode]);

  const handleEditComment = useCallback((index: number, text: string) => {
    setComments(prev => prev.map((c, i) => i === index ? { ...c, text } : c));
  }, []);

  const handleSchedule = useCallback(() => {
    if (selectedTime === null && !customTime) {
      toast.error('Please select a posting time');
      return;
    }
    setIsScheduled(true);
    const time = customTime || `${timeSuggestions[selectedTime!]?.time} ${timeSuggestions[selectedTime!]?.day}`;
    toast.success(`Post scheduled for ${time}!`, {
      description: autoPostComment && selectedComment !== null 
        ? 'First comment will be auto-posted.' 
        : undefined,
    });
  }, [selectedTime, customTime, timeSuggestions, autoPostComment, selectedComment]);

  return (
    <motion.div
      initial="initial" animate="animate" exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-background"
    >
      <Helmet>
        <title>Post Scheduler - AI Auto-Scheduling | SocialTool</title>
        <meta name="description" content="AI-powered post scheduling with optimal timing predictions and engagement-boosting first comments for Instagram." />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Post Scheduler</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
            <Instagram className="w-3.5 h-3.5" /> Instagram
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Post Content Input */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card p-5"
        >
          <label className="text-sm font-medium text-foreground mb-2 block">Post Content</label>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Paste your caption or describe your post content..."
            className="w-full min-h-[100px] p-3 rounded-xl bg-muted/30 border border-border/40 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">{postContent.length} characters</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyze}
              disabled={isLoadingTimes || isLoadingComments}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoadingTimes ? 'Analyzing...' : 'Analyze with AI'}
            </motion.button>
          </div>
        </motion.section>

        {/* Two-column layout for suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: AI Suggested Times */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Optimal Posting Times</h2>
            </div>

            {timeSuggestions.length === 0 && !isLoadingTimes ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">AI will suggest optimal times after analysis</p>
              </div>
            ) : (
              <TimeSuggestions
                suggestions={timeSuggestions}
                selectedIndex={selectedTime}
                onSelect={setSelectedTime}
                isLoading={isLoadingTimes}
              />
            )}

            {/* Custom time override */}
            {timeSuggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <label className="text-xs text-muted-foreground mb-1.5 block">Or choose a custom time</label>
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => {
                    setCustomTime(e.target.value);
                    setSelectedTime(null);
                  }}
                  className="w-full h-9 px-3 rounded-lg bg-muted/30 border border-border/40 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            )}
          </motion.section>

          {/* Section 2: First Comment Generator */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">First Comment</h2>
            </div>

            {comments.length === 0 && !isLoadingComments ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">AI-generated comments will appear here</p>
              </div>
            ) : (
              <FirstCommentGenerator
                comments={comments}
                selectedIndex={selectedComment}
                onSelect={setSelectedComment}
                onEdit={handleEditComment}
                autoPost={autoPostComment}
                onAutoPostToggle={setAutoPostComment}
                isLoading={isLoadingComments}
              />
            )}
          </motion.section>
        </div>

        {/* Section 3: Auto Mode */}
        <AutoModeToggle enabled={autoMode} onToggle={setAutoMode} />

        {/* Schedule Button */}
        {(timeSuggestions.length > 0 || customTime) && !isScheduled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSchedule}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Send className="w-4 h-4" />
              Schedule Post
            </motion.button>
          </motion.div>
        )}

        {/* Scheduled confirmation */}
        {isScheduled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Post Scheduled!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {customTime 
                ? `Scheduled for ${new Date(customTime).toLocaleString()}`
                : selectedTime !== null 
                  ? `Scheduled for ${timeSuggestions[selectedTime]?.time} ${timeSuggestions[selectedTime]?.day}`
                  : ''
              }
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Connect your Instagram account to enable actual posting</span>
            </div>
          </motion.div>
        )}

        {/* Engagement Agent Teaser */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Engagement Agent</h2>
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground text-[10px] font-semibold uppercase">Coming Soon</span>
          </div>
          <p className="text-sm text-muted-foreground">
            After your post goes live, the AI agent will monitor comments and suggest smart replies 
            to maximize engagement in the critical first hour.
          </p>
        </motion.section>
      </main>
    </motion.div>
  );
}
