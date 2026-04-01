
-- Create a function to extract device_id from request headers (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_request_device_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    current_setting('request.headers', true)::json->>'x-device-id',
    ''
  );
$$;

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow all access to chats" ON public.chats;
DROP POLICY IF EXISTS "Allow all access to chat_messages" ON public.chat_messages;

-- Chats: users can only access their own chats by device_id
CREATE POLICY "device_scoped_select_chats" ON public.chats
  FOR SELECT TO anon, authenticated
  USING (device_id = public.get_request_device_id());

CREATE POLICY "device_scoped_insert_chats" ON public.chats
  FOR INSERT TO anon, authenticated
  WITH CHECK (device_id = public.get_request_device_id());

CREATE POLICY "device_scoped_delete_chats" ON public.chats
  FOR DELETE TO anon, authenticated
  USING (device_id = public.get_request_device_id());

-- Chat messages: scoped through the parent chat's device_id
CREATE POLICY "device_scoped_select_messages" ON public.chat_messages
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.device_id = public.get_request_device_id()
    )
  );

CREATE POLICY "device_scoped_insert_messages" ON public.chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.device_id = public.get_request_device_id()
    )
  );

CREATE POLICY "device_scoped_delete_messages" ON public.chat_messages
  FOR DELETE TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = chat_messages.chat_id
      AND chats.device_id = public.get_request_device_id()
    )
  );
