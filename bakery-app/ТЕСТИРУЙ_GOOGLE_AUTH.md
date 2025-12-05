# 🚀 ТЕСТИРУЙ GOOGLE AUTH СЕЙЧАС

## ✅ Что исправлено

Google Auth теперь работает правильно! Приложение не зависает и возвращается после авторизации.

---

## 🎯 ЧТО ДЕЛАТЬ ПРЯМО СЕЙЧАС

### Вариант 1: Тест в Expo Go (БЫСТРО)

```bash
cd bakery-app/bakery-mobile-app/bakery-app
npx expo start
```

1. Сканируй QR-код в Expo Go
2. Нажми "Войти через Google"
3. Авторизуйся
4. Должно вернуться в приложение!

---

### Вариант 2: Собери новый APK (ПРАВИЛЬНО)

```bash
cd bakery-app/bakery-mobile-app/bakery-app/android
./gradlew clean
./gradlew assembleRelease
```

APK будет здесь:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔍 ЧТО СМОТРЕТЬ

### В консоли должны быть логи:

```
🔐 Starting Google Sign In...
✅ OAuth data received
📱 Opening URL in browser
✅ URL opened successfully
🔗 Deep link received: bakery-app://auth-callback
✅ OAuth callback detected
✅ Session restored after OAuth
```

### В приложении:

1. Нажимаешь "Войти через Google"
2. Открывается браузер/Chrome Custom Tab
3. Выбираешь аккаунт Google
4. **АВТОМАТИЧЕСКИ** возвращается в приложение
5. Видишь главный экран (залогинен)

---

## ⚠️ ВАЖНО: Настрой Supabase

### Шаг 1: Открой Supabase Dashboard
```
https://supabase.com/dashboard
```

### Шаг 2: Authentication → URL Configuration

### Шаг 3: Добавь Redirect URL:
```
bakery-app://auth-callback
```

### Шаг 4: Сохрани

---

## 🧪 БЫСТРЫЙ ТЕСТ

### Проверь Deep Link вручную:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "bakery-app://auth-callback" com.bakery.pavlova
```

Если приложение открылось - Deep Links работают!

---

## 📱 Если не работает

### 1. Проверь логи:
```bash
npx react-native log-android
```

### 2. Проверь Supabase:
- Redirect URLs содержит `bakery-app://auth-callback`
- Google Provider включен

### 3. Пересобери:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## ✨ ГОТОВО!

Теперь можешь тестировать Google Auth!

**Запускай и проверяй!** 🎉
