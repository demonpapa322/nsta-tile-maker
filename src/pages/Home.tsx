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
import { streamChat, type ToolCall } from '@/lib/openrouter';
import { executeToolCall, type ToolResult } from '@/lib/toolExecutor';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const Home = memo(function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setUserImageUrl(null);
    setIsSidebarOpen(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleToolCalls = useCallback(async (
    toolCalls: ToolCall[], 
    assistantId: string,
    imageUrl: string | null
  ) => {
    // Show executing state
    setMessages(prev => prev.map(m => 
      m.id === assistantId ? { ...m, isExecutingTool: true } : m
    ));

    const results: ToolResult[] = [];
    
    for (const tc of toolCalls) {
      const result = await executeToolCall(tc, imageUrl);
      results.push(result);
    }

    // Update message with results
    setMessages(prev => prev.map(m => 
      m.id === assistantId 
        ? { ...m, isExecutingTool: false, toolResults: results } 
        : m
    ));
    
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSendMessage = useCallback((content: string, image?: File) => {
    // If user uploads an image, store it as a URL for tool use
    let currentImageUrl = userImageUrl;
    if (image) {
      const url = URL.createObjectURL(image);
      setUserImageUrl(url);
      currentImageUrl = url;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: image ? (content || 'Uploaded an image') : content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    const assistantId = (Date.now() + 1).toString();
    let assistantContent = '';
    const pendingToolCalls: ToolCall[] = [];

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
      onToolCall: (toolCall) => {
        pendingToolCalls.push(toolCall);
      },
      onDone: () => {
        setIsLoading(false);
        scrollToBottom();
        
        // Execute any tool calls
        if (pendingToolCalls.length > 0) {
          handleToolCalls(pendingToolCalls, assistantId, currentImageUrl);
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
  }, [messages, scrollToBottom, handleToolCalls, userImageUrl]);

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
        <title>SocialTool - AI-Powered Social Media Suite</title>
        <meta name="title" content="SocialTool - AI-Powered Social Media Suite" />
        <meta name="description" content="AI-powered social media toolkit. Generate images, write captions, find trends, resize photos, and split grids — all from one chat interface." />
        <meta name="keywords" content="social media tools, AI image generator, caption generator, hashtag finder, instagram grid splitter, image resizer" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.socialtool.co/" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.socialtool.co/" />
        <meta property="og:title" content="SocialTool - AI-Powered Social Media Suite" />
        <meta property="og:description" content="AI-powered social media toolkit. Generate, resize, caption, and optimize — all from chat." />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SocialTool - AI-Powered Social Media Suite" />
        <meta name="twitter:description" content="AI-powered social media toolkit for creators." />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SocialTool",
            "url": "https://www.socialtool.co",
            "description": "AI-powered social media suite for content creators",
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
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        onFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
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
                    Your AI social media assistant — generate, resize, caption, and more
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

          {/* Spacer for floating input */}
          <div className="h-32 shrink-0" />
        </main>

        {/* Floating Input */}
        <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="w-full max-w-3xl mx-auto pointer-events-auto">
            <ChatInput 
              onSend={handleSendMessage}
              placeholder="Ask anything — generate images, write captions, find trends..."
              disabled={isLoading}
            />
          </div>
        </div>
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
