-- ЧАТ ПОДДЕРЖКИ - SQL скрипт для Supabase
-- Скопируй и выполни в SQL Editor в Supabase Dashboard

-- 1. Создаем таблицу сообщений
CREATE TABLE support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  text TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Включаем Realtime (чтобы сообщения прилетали мгновенно)
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- 3. Настраиваем безопасность (RLS)
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователь видит только свои сообщения
CREATE POLICY "User sees their own messages" 
ON support_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Политика: Пользователь может отправлять сообщения
CREATE POLICY "User can insert messages" 
ON support_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Создаем индекс для быстрого поиска
CREATE INDEX support_messages_user_id_idx ON support_messages(user_id);
CREATE INDEX support_messages_created_at_idx ON support_messages(created_at DESC);

-- ГОТОВО! Теперь можно использовать чат в приложении.
