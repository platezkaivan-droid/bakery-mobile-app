# ✅ Файл загружен! Теперь включи GitHub Pages

## 🎯 Что делать ПРЯМО СЕЙЧАС (1 минута)

### Шаг 1: Включи GitHub Pages

1. Открой: https://github.com/platezkaivan-droid/bakery-email-redirect/settings/pages
2. В разделе **Branch** выбери `main`
3. Нажми **Save**
4. Подожди 1-2 минуты

### Шаг 2: Получи свою вечную ссылку

Обнови страницу через 1-2 минуты, и сверху появится:

```
Your site is live at https://platezkaivan-droid.github.io/bakery-email-redirect/
```

---

## 📋 После получения ссылки

### 1. В Supabase Dashboard

Открой: https://supabase.com/dashboard → твой проект → **Authentication** → **URL Configuration**

Вставь:
- **Site URL**: `https://platezkaivan-droid.github.io/bakery-email-redirect/`
- **Redirect URLs**: добавь эту же ссылку

### 2. В коде приложения

Открой файл: `src/context/AuthContext.tsx`

Найди строку с `emailRedirectTo` и замени на:

```typescript
emailRedirectTo: 'https://platezkaivan-droid.github.io/bakery-email-redirect/',
```

---

## 🎉 Готово!

После этого:
- ✅ Email-подтверждения будут открывать приложение
- ✅ Ссылка работает вечно
- ✅ Бесплатно
- ✅ Можно обновлять когда угодно

---

## 🔗 Твои ссылки

- Репозиторий: https://github.com/platezkaivan-droid/bakery-email-redirect
- Настройки Pages: https://github.com/platezkaivan-droid/bakery-email-redirect/settings/pages
- Живая ссылка (после включения): https://platezkaivan-droid.github.io/bakery-email-redirect/
