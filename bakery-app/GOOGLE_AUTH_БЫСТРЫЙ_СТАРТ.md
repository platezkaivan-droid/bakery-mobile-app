# ⚡ Google Auth - Быстрый старт (10 минут)

## 🎯 Минимальная настройка для тестирования:

### 1. Google Cloud Console (5 минут)

```
1. https://console.cloud.google.com/
2. New Project → "Bakery Pavlova App"
3. APIs & Services → OAuth consent screen
   - External → Create
   - App name: Булочки Павлова
   - Email: ваш email
   - Test users: добавьте свой email
4. Credentials → Create OAuth Client ID
   - Type: Web application
   - Name: Bakery Web
   - Redirect URI: https://[YOUR-PROJECT].supabase.co/auth/v1/callback
   - Скопируйте Client ID и Secret
```

### 2. Supabase (2 минуты)

```
1. Authentication → Providers → Google
2. Enable Sign in with Google: ☑
3. Вставьте Client ID и Secret
4. Save
```

### 3. Тестирование (3 минуты)

```bash
# Пересоберите APK
cd bakery-app/bakery-mobile-app/bakery-app
npx expo prebuild --clean
cd android
./gradlew assembleRelease

# Установите и протестируйте
```

---

## 📱 Что работает:

✅ Вход через Google на экране Login  
✅ Регистрация через Google на экране Register  
✅ Автоматическое создание профиля  
✅ Возврат в приложение после авторизации  

---

## 🔧 Для production (позже):

- Получите SHA-1 fingerprint для Android
- Создайте Android OAuth Client ID
- Опубликуйте OAuth Consent Screen

**Подробная инструкция:** `GOOGLE_AUTH_НАСТРОЙКА.md`

---

**Статус:** ✅ Код готов, настройте за 10 минут!
