
-- Chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Permissive policies (no auth, filter by device_id in app)
CREATE POLICY "Allow all access to chats" ON public.chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Index for fast lookup
CREATE INDEX idx_chats_device_id ON public.chats(device_id);
CREATE INDEX idx_chats_created_at ON public.chats(created_at);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);

-- Function to clean up old chats (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_chats()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.chats WHERE created_at < now() - interval '7 days';
$$;

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule daily cleanup at midnight
SELECT cron.schedule(
  'cleanup-old-chats',
  '0 0 * * *',
  'SELECT public.cleanup_old_chats()'
);
