import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface ChatRecord {
  id: string;
  title: string;
  created_at: string;
}

function getDeviceId(): string {
  let id = localStorage.getItem('st_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('st_device_id', id);
  }
  return id;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function getDeviceScopedClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { 'x-device-id': getDeviceId() } },
  });
}

export function useChatHistory() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const deviceId = getDeviceId();
  const db = getDeviceScopedClient();

  const fetchChats = useCallback(async () => {
    const { data: chatData } = await db
      .from('chats')
      .select('id, title, created_at')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false });
    if (chatData) setChats(chatData);
  }, [deviceId]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  const createChat = useCallback(async (firstMessage: string): Promise<string> => {
    const title = firstMessage.slice(0, 60) || 'New Chat';
    const { data } = await db
      .from('chats')
      .insert({ device_id: deviceId, title })
      .select('id')
      .single();
    const chatId = data!.id;
    setActiveChatId(chatId);
    await fetchChats();
    return chatId;
  }, [deviceId, fetchChats]);

  const deleteChat = useCallback(async (chatId: string) => {
    await db.from('chats').delete().eq('id', chatId);
    if (activeChatId === chatId) setActiveChatId(null);
    setChats(prev => prev.filter(c => c.id !== chatId));
  }, [activeChatId]);

  const saveMessage = useCallback(async (chatId: string, role: 'user' | 'assistant', content: string) => {
    await db.from('chat_messages').insert({ chat_id: chatId, role, content });
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    const { data } = await db
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    return data || [];
  }, []);

  const startNewChat = useCallback(() => {
    setActiveChatId(null);
  }, []);

  return {
    chats,
    activeChatId,
    setActiveChatId,
    createChat,
    deleteChat,
    saveMessage,
    loadMessages,
    startNewChat,
    fetchChats,
  };
}
