import { useState, useCallback, useEffect } from 'react';

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'socialtool_conversations';
const EXPIRY_DAYS = 7;

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const convos: Conversation[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired conversations (7 days since last update)
    return convos.filter(c => {
      const updated = new Date(c.updatedAt).getTime();
      return now - updated < EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    });
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

export function useChatStorage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Sync to localStorage whenever conversations change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) ?? null;

  const createConversation = useCallback((): string => {
    const id = Date.now().toString();
    const convo: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [convo, ...prev]);
    setActiveConversationId(id);
    return id;
  }, []);

  const updateConversation = useCallback((id: string, messages: StoredMessage[]) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== id) return c;
      // Auto-title from first user message
      const firstUser = messages.find(m => m.role === 'user');
      const title = firstUser
        ? firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '…' : '')
        : c.title;
      return { ...c, title, messages, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    switchConversation,
    startNewChat,
  };
}
