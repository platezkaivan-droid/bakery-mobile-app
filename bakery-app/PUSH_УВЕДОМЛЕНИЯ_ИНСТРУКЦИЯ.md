# 🔔 Push-уведомления для закрытого приложения

## Что нужно сделать

### 1. Установить Firebase в проект

```bash
cd bakery-app/bakery-mobile-app/bakery-app
npm install @react-native-firebase/app @react-native-firebase/messaging
npx expo install expo-device expo-application
```

### 2. Создать проект в Firebase Console

1. Зайди на https://console.firebase.google.com/
2. Создай новый проект или используй существующий
3. Добавь Android приложение с package name: `com.bakeryapp`
4. Скачай файл `google-services.json`
5. Положи его в `android/app/google-services.json`

### 3. Настроить Android для Firebase

Файл `android/build.gradle` - добавь в dependencies:
```gradle
classpath 'com.google.gms:google-services:4.4.0'
```

Файл `android/app/build.gradle` - добавь в конец:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 4. Получить Server Key из Firebase

1. В Firebase Console → Project Settings → Cloud Messaging
2. Скопируй **Server Key** (или создай новый)
3. Этот ключ нужен для отправки push с сервера

### 5. Создать таблицу для FCM токенов в Supabase

```sql
-- Таблица для хранения FCM токенов пользователей
CREATE TABLE user_fcm_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);

-- Индекс для быстрого поиска
CREATE INDEX idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);

-- RLS политики
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own tokens"
  ON user_fcm_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON user_fcm_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON user_fcm_tokens FOR DELETE
  USING (auth.uid() = user_id);
```

### 6. Создать Edge Function в Supabase для отправки push

В Supabase Dashboard → Edge Functions → Create new function:

Название: `send-push-notification`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const FIREBASE_SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY_HERE'

serve(async (req) => {
  try {
    const { userId, title, body, data } = await req.json()

    // Получаем FCM токены пользователя
    const { data: tokens, error } = await supabaseClient
      .from('user_fcm_tokens')
      .select('fcm_token')
      .eq('user_id', userId)

    if (error || !tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ error: 'No tokens found' }), {
        status: 404,
      })
    }

    // Отправляем push на все устройства пользователя
    const promises = tokens.map(({ fcm_token }) =>
      fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${FIREBASE_SERVER_KEY}`,
        },
        body: JSON.stringify({
          to: fcm_token,
          notification: {
            title,
            body,
            sound: 'default',
          },
          data,
          priority: 'high',
        }),
      })
    )

    await Promise.all(promises)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
})
```

### 7. Создать Database Trigger для автоматической отправки

```sql
-- Функция для отправки push при новом сообщении от админа
CREATE OR REPLACE FUNCTION send_support_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Только если сообщение от админа
  IF NEW.is_admin = true THEN
    -- Вызываем Edge Function
    PERFORM
      net.http_post(
        url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_ANON_KEY'
        ),
        body := jsonb_build_object(
          'userId', NEW.user_id,
          'title', '💬 Новое сообщение от поддержки',
          'body', NEW.text,
          'data', jsonb_build_object('screen', 'support')
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на вставку нового сообщения
CREATE TRIGGER on_support_message_insert
  AFTER INSERT ON support_messages
  FOR EACH ROW
  EXECUTE FUNCTION send_support_push_notification();
```

## Готово! 🎉

Теперь:
- Локальные уведомления работают когда приложение открыто
- Push-уведомления приходят когда приложение закрыто
- Всё автоматически через Database Trigger
