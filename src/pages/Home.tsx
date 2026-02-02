import { Helmet } from 'react-helmet-async';
import { useState, useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatSidebar, 
  ChatInput, 
  ChatHeader, 
  ChatMessage, 
  QuickActions,
  type Message 
} from '@/components/chat';
import { FeedbackModal } from '@/components/FeedbackModal';
import { streamChat } from '@/lib/openrouter';
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const Home = memo(function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setIsSidebarOpen(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = useCallback((content: string, image?: File) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: image ? (content || 'Uploaded an image') : content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // If image is uploaded, navigate to grid splitter
    if (image) {
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Great image! Let me take you to the Grid Splitter where you can choose your grid layout and split this image for Instagram.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        scrollToBottom();
        setTimeout(() => navigate('/grid-splitter'), 1200);
      }, 500);
      return;
    }
    
    // Use AI for responses
    setIsLoading(true);
    const assistantId = (Date.now() + 1).toString();
    let assistantContent = '';

    // Add empty assistant message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    const chatHistory = [...messages, userMessage].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    streamChat(chatHistory, {
      onDelta: (text) => {
        assistantContent += text;
        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: assistantContent } : m
        ));
        scrollToBottom();
      },
      onDone: () => {
        setIsLoading(false);
        scrollToBottom();
        
        // Check if response suggests navigation
        const lowerContent = content.toLowerCase();
        if (lowerContent.includes('split') || lowerContent.includes('grid')) {
          setTimeout(() => navigate('/grid-splitter'), 2000);
        }
      },
      onError: (error) => {
        console.error('AI error:', error);
        setIsLoading(false);
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: "Sorry, I encountered an error. Please try again." } 
            : m
        ));
      }
    });
  }, [messages, navigate, scrollToBottom]);

  const handleQuickAction = useCallback((prompt: string) => {
    handleSendMessage(prompt);
  }, [handleSendMessage]);

  const hasMessages = messages.length > 0;

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="h-screen flex bg-background overflow-hidden"
    >
      <Helmet>
        <title>GridAI - AI-Powered Instagram Grid Splitter</title>
        <meta name="title" content="GridAI - AI-Powered Instagram Grid Splitter" />
        <meta name="description" content="Split images into perfect Instagram grid posts with AI assistance. Free, fast, and private - all processing happens in your browser." />
        <meta name="keywords" content="instagram grid splitter, AI image splitter, grid maker, instagram carousel, social media tools" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.socialtool.co/" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.socialtool.co/" />
        <meta property="og:title" content="GridAI - AI-Powered Instagram Grid Splitter" />
        <meta property="og:description" content="Split images into perfect Instagram grid posts with AI assistance. Free and private." />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GridAI - AI-Powered Instagram Grid Splitter" />
        <meta name="twitter:description" content="Split images into perfect Instagram grid posts with AI assistance." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "GridAI",
            "url": "https://www.socialtool.co",
            "description": "AI-powered Instagram grid splitter and social media tools",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>

      {/* Sidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        onFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader 
          onMenuToggle={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!hasMessages ? (
              /* Empty State - Welcome View */
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center px-4"
              >
                <div className="text-center mb-8">
                  <motion.h1 
                    className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    What can I help with?
                  </motion.h1>
                  <motion.p
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    AI-assisted grid splitting for Instagram
                  </motion.p>
                </div>

                <QuickActions onSelect={handleQuickAction} />
              </motion.div>
            ) : (
              /* Messages View */
              <motion.div 
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto"
              >
                <div className="py-4">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area - Always at bottom */}
          <div className="mt-auto">
            <ChatInput 
              onSend={handleSendMessage}
              placeholder="Ask about grid splitting..."
              disabled={isLoading}
            />
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </motion.div>
  );
});

export default Home;
