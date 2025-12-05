-- ============================================
-- НАСТРОЙКА PUSH-УВЕДОМЛЕНИЙ В SUPABASE
-- ============================================

-- 1. Создаём таблицу для хранения FCM токенов
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);

-- 2. Создаём индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);

-- 3. Включаем Row Level Security
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Создаём политики безопасности
DROP POLICY IF EXISTS "Users can insert their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can insert their own tokens"
  ON user_fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can update their own tokens"
  ON user_fcm_tokens FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can delete their own tokens"
  ON user_fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read their own tokens" ON user_fcm_tokens;
CREATE POLICY "Users can read their own tokens"
  ON user_fcm_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Создаём функцию для отправки push-уведомлений
CREATE OR REPLACE FUNCTION send_support_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_token RECORD;
BEGIN
  -- Только если сообщение от админа
  IF NEW.is_admin = true THEN
    -- Получаем все токены пользователя
    FOR v_token IN 
      SELECT fcm_token 
      FROM user_fcm_tokens 
      WHERE user_id = NEW.user_id
    LOOP
      -- Вызываем Edge Function для каждого токена
      PERFORM
        net.http_post(
          url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_ANON_KEY'
          ),
          body := jsonb_build_object(
            'fcmToken', v_token.fcm_token,
            'title', '💬 Новое сообщение от поддержки',
            'body', NEW.text,
            'data', jsonb_build_object('screen', 'support')
          )
        );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Создаём триггер на вставку нового сообщения
DROP TRIGGER IF EXISTS on_support_message_insert ON support_messages;
CREATE TRIGGER on_support_message_insert
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION send_support_push_notification();

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь нужно:
-- 1. Заменить YOUR_PROJECT_REF на свой Project Reference
-- 2. Заменить YOUR_ANON_KEY на свой Anon Key
-- 3. Создать Edge Function send-push-notification (см. PUSH_УВЕДОМЛЕНИЯ_ИНСТРУКЦИЯ.md)
