# 🔔 Настройка Push-уведомлений

## Текущий статус
- ✅ FCM токен сохраняется в Supabase при входе пользователя
- ✅ Foreground уведомления работают (когда приложение открыто)
- ✅ Realtime обновления чата работают
- ⚠️ Background push-уведомления требуют серверный компонент

## Что нужно для полной работы

### Вариант 1: Firebase Cloud Function (рекомендуется)

1. Установите Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
```

2. Инициализируйте Functions:
```bash
cd bakery-mobile-app/bakery-app
firebase init functions
```

3. Создайте функцию `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendPushNotification = functions.https.onRequest(async (req, res) => {
  const { token, title, body, data } = req.body;
  
  try {
    await admin.messaging().send({
      token: token,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'support_chat_channel',
          sound: 'default'
        }
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

4. Деплой:
```bash
firebase deploy --only functions
```

5. Обновите admin-chat.html с URL вашей функции

### Вариант 2: Supabase Edge Function

1. Создайте Edge Function в Supabase Dashboard
2. Используйте Firebase Admin SDK внутри функции

### Вариант 3: Собственный сервер

Создайте простой Node.js сервер с Firebase Admin SDK

## Проверка работы

1. Откройте приложение и войдите в аккаунт
2. Проверьте в Supabase таблицу `user_fcm_tokens` - там должен быть ваш токен
3. Откройте admin-chat.html и отправьте сообщение
4. Если приложение открыто - появится Alert
5. Для background уведомлений нужен серверный компонент

## SQL для Supabase

Выполните в Supabase SQL Editor:
```sql
-- Смотрите файл SUPABASE_TABLES.sql
```

## Тестирование FCM токена

В консоли Firebase (Firebase Console -> Cloud Messaging -> Send test message):
1. Скопируйте FCM токен из таблицы user_fcm_tokens
2. Отправьте тестовое сообщение на этот токен
3. Если уведомление пришло - FCM работает правильно
