
-- Drop existing restrictive RLS policies
DROP POLICY IF EXISTS "device_scoped_select_chats" ON public.chats;
DROP POLICY IF EXISTS "device_scoped_insert_chats" ON public.chats;
DROP POLICY IF EXISTS "device_scoped_delete_chats" ON public.chats;
DROP POLICY IF EXISTS "device_scoped_select_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "device_scoped_insert_messages" ON public.chat_messages;
DROP POLICY IF EXISTS "device_scoped_delete_messages" ON public.chat_messages;

-- Replace with open policies (no auth, device filtering done in queries)
CREATE POLICY "allow_all_select_chats" ON public.chats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "allow_all_insert_chats" ON public.chats FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "allow_all_delete_chats" ON public.chats FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "allow_all_select_messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "allow_all_insert_messages" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "allow_all_delete_messages" ON public.chat_messages FOR DELETE TO anon, authenticated USING (true);
