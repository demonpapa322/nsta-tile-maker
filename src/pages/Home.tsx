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
import { useChatHistory } from '@/hooks/useChatHistory';

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
  const currentChatIdRef = useRef<string | null>(null);

  const {
    chats, activeChatId, setActiveChatId,
    createChat, deleteChat, saveMessage, loadMessages, startNewChat
  } = useChatHistory();

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setUserImageUrl(null);
    currentChatIdRef.current = null;
    startNewChat();
    setIsSidebarOpen(false);
  }, [startNewChat]);

  const handleSelectChat = useCallback(async (chatId: string) => {
    setActiveChatId(chatId);
    currentChatIdRef.current = chatId;
    const dbMessages = await loadMessages(chatId);
    setMessages(dbMessages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: new Date(m.created_at),
    })));
    setIsSidebarOpen(false);
  }, [setActiveChatId, loadMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleToolCalls = useCallback(async (
    toolCalls: ToolCall[], 
    assistantId: string,
    imageUrl: string | null
  ) => {
    setMessages(prev => prev.map(m => 
      m.id === assistantId ? { ...m, isExecutingTool: true } : m
    ));

    const results: ToolResult[] = [];
    for (const tc of toolCalls) {
      const result = await executeToolCall(tc, imageUrl);
      results.push(result);
    }

    setMessages(prev => prev.map(m => 
      m.id === assistantId 
        ? { ...m, isExecutingTool: false, toolResults: results } 
        : m
    ));
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSendMessage = useCallback(async (content: string, image?: File) => {
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

    // Create chat if first message
    let chatId = currentChatIdRef.current;
    if (!chatId) {
      chatId = await createChat(userMessage.content);
      currentChatIdRef.current = chatId;
    }
    await saveMessage(chatId, 'user', userMessage.content);
    
    const assistantId = (Date.now() + 1).toString();
    let assistantContent = '';
    const pendingToolCalls: ToolCall[] = [];

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
      onDone: async () => {
        setIsLoading(false);
        scrollToBottom();
        
        // Save assistant message
        if (chatId && assistantContent) {
          await saveMessage(chatId, 'assistant', assistantContent);
        }
        
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
  }, [messages, scrollToBottom, handleToolCalls, userImageUrl, createChat, saveMessage]);

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

      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
        onFeedback={() => setIsFeedbackOpen(true)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteChat}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatHeader 
          onMenuToggle={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!hasMessages ? (
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
          <div className="h-32 shrink-0" />
        </main>

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

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </motion.div>
  );
});

export default Home;
