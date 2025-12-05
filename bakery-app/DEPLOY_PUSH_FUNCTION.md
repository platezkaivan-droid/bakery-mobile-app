# 🚀 Деплой Supabase Edge Function для Push уведомлений

## Шаг 1: Установи Supabase CLI

```bash
npm install -g supabase
```

## Шаг 2: Войди в Supabase

```bash
supabase login
```

Откроется браузер - авторизуйся через GitHub.

## Шаг 3: Свяжи проект

```bash
cd bakery-app
supabase link --project-ref qkyhwdmhkoizxjazwnti
```

## Шаг 4: Задеплой функцию

```bash
supabase functions deploy send-push
```

## Шаг 5: Проверь что функция работает

После деплоя функция будет доступна по адресу:
```
https://qkyhwdmhkoizxjazwnti.supabase.co/functions/v1/send-push
```

## Тестирование

Можно протестировать через curl:
```bash
curl -X POST https://qkyhwdmhkoizxjazwnti.supabase.co/functions/v1/send-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreWh3ZG1oa29penhqYXp3bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODg5MTEsImV4cCI6MjA4MDE2NDkxMX0.UsxL1RFnwavruSKkB5KeVDhMfZk_rUJxyaBsuttu9qA" \
  -d '{"user_id": "test-user-id", "title": "Тест", "body": "Тестовое сообщение"}'
```

## Альтернатива: Без деплоя

Если не хочешь деплоить функцию, push-уведомления можно отправлять:
1. Через Firebase Console → Messaging → New campaign
2. Через Firebase Admin SDK на своём сервере

## Готово! ✅

После деплоя админ-панель будет автоматически отправлять push-уведомления при ответе на сообщения пользователей.
