# 🔨 Собрать новый APK с GitHub Pages ссылкой

## ✅ Что уже сделано

- ✅ Код обновлен (emailRedirectTo изменен на GitHub Pages)
- ✅ Файл загружен на GitHub
- ✅ Supabase настроен
- ⏳ Осталось только собрать новый APK

---

## 🚀 Запусти сборку СЕЙЧАС

Открой терминал в папке проекта и выполни:

```bash
cd bakery-app/bakery-mobile-app/bakery-app
npx eas-cli build --platform android --profile preview
```

Или если есть EAS CLI глобально:

```bash
cd bakery-app/bakery-mobile-app/bakery-app
eas build --platform android --profile preview
```

---

## ⏱️ Сколько ждать?

- Сборка займет **10-15 минут**
- Прогресс можно смотреть на https://expo.dev
- После завершения получишь ссылку на скачивание APK

---

## 📱 После сборки

1. Скачай новый APK
2. Установи на телефон
3. Протестируй:
   - Регистрацию с email
   - Google OAuth
   - Подтверждение email должно открывать приложение!

---

## 🎯 Что изменилось в новом APK

**Старая версия:**
```typescript
emailRedirectTo: 'bakery-app://auth-callback'
```

**Новая версия:**
```typescript
emailRedirectTo: 'https://platezkaivan-droid.github.io/bakery-email-redirect/'
```

Теперь email-подтверждения будут:
1. Открывать GitHub Pages
2. Автоматически перенаправлять в приложение
3. Работать вечно (не исчезнут через 24 часа)

---

## 🔗 Полезные ссылки

- EAS Build Dashboard: https://expo.dev/accounts/platezkaivan-droid/projects/bakery-app/builds
- GitHub Pages: https://platezkaivan-droid.github.io/bakery-email-redirect/
- Supabase Dashboard: https://supabase.com/dashboard
