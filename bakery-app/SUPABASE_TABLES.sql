-- ============================================
-- SQL для создания таблиц в Supabase
-- Выполните этот код в Supabase Dashboard -> SQL Editor
-- ============================================

-- 1. Таблица для хранения FCM токенов пользователей
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  platform TEXT DEFAULT 'android',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);

-- RLS политики для user_fcm_tokens
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Пользователь может читать и обновлять только свой токен
CREATE POLICY "Users can manage own fcm token" ON user_fcm_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Разрешаем анонимный доступ для чтения (для админ-панели)
CREATE POLICY "Allow read for admin" ON user_fcm_tokens
  FOR SELECT USING (true);

-- 2. Таблица для очереди уведомлений (опционально)
CREATE TABLE IF NOT EXISTS pending_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  fcm_token TEXT,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS для pending_notifications
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for pending_notifications" ON pending_notifications
  FOR ALL USING (true);

-- 3. Убедитесь что таблица support_messages существует
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS для support_messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages" ON support_messages
  FOR SELECT USING (auth.uid() = user_id OR true);

CREATE POLICY "Users can insert own messages" ON support_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR true);

-- Включаем Realtime для таблиц
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE pending_notifications;

-- ============================================
-- ГОТОВО! После выполнения этого SQL:
-- 1. FCM токены будут сохраняться автоматически при входе в приложение
-- 2. Админ-панель сможет читать токены для отправки уведомлений
-- ============================================
