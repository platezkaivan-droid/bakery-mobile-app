# 🔧 ИСПРАВЛЕНИЕ OAUTH CALLBACK

## 🚨 Проблема

После авторизации через Google:
- ✅ Пользователь появляется в базе данных
- ❌ Приложение не получает сессию
- ❌ Остаётся на экране авторизации
- ❌ Не перенаправляет на главный экран

## 🔍 Причина

Deep Link возвращает токены в URL, но приложение не извлекает их и не устанавливает сессию.

---

## ✅ РЕШЕНИЕ

### Что было исправлено:

1. **Обработка Deep Link с извлечением токенов**
   - Парсинг URL для получения `access_token` и `refresh_token`
   - Установка сессии через `supabase.auth.setSession()`
   - Автоматическая загрузка профиля

2. **Улучшенное логирование**
   - Видно каждый шаг процесса
   - Легко найти проблему

---

## 🎯 ЧТО ДЕЛАТЬ СЕЙЧАС

### Шаг 1: Проверь Supabase Dashboard

1. Открой https://supabase.com/dashboard
2. Выбери свой проект
3. **Authentication** → **URL Configuration**
4. Проверь **Redirect URLs**:

```
bakery-app://auth-callback
```

Если нет - добавь!

### Шаг 2: Проверь Google Cloud Console

1. Открой https://console.cloud.google.com
2. Выбери проект
3. **APIs & Services** → **Credentials**
4. Открой OAuth 2.0 Client ID
5. **Authorized redirect URIs** должен содержать:

```
https://qkyhwdmhkoizxjazwnti.supabase.co/auth/v1/callback
```

### Шаг 3: Пересобери APK

```bash
cd bakery-app/bakery-mobile-app/bakery-app/android
./gradlew clean
./gradlew assembleRelease
```

### Шаг 4: Тестируй!

1. Установи новый APK
2. Нажми "Войти через Google"
3. Авторизуйся
4. Смотри логи в консоли

---

## 🔍 ЛОГИ ДЛЯ ОТЛАДКИ

### Правильные логи (всё работает):

```
🔐 Starting Google Sign In...
✅ OAuth data received: { url: '...' }
📱 Opening URL in browser: https://...
✅ URL opened successfully
🔗 Deep link received: bakery-app://auth-callback?access_token=...
✅ OAuth callback detected
🔑 Tokens found: { hasAccessToken: true, hasRefreshToken: true }
✅ Session set successfully!
AuthContext: New session, loading profile...
```

### Проблемные логи:

```
🔗 Deep link received: bakery-app://auth-callback
✅ OAuth callback detected
⚠️ No tokens in URL, trying to get existing session...
```

Это значит, что токены не пришли в URL. Проблема в настройках Supabase или Google.

---

## 🧪 ТЕСТ DEEP LINK

Проверь, работает ли Deep Link:

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "bakery-app://auth-callback?access_token=test&refresh_token=test" \
  com.bakery.pavlova
```

Если приложение открылось - Deep Link работает!

---

## 🔧 АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ

Если токены не приходят в URL, можно использовать **PKCE flow**:

### Обнови signInWithGoogle:

```typescript
const signInWithGoogle = async () => {
  try {
    console.log('🔐 Starting Google Sign In with PKCE...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'bakery-app://auth-callback',
        skipBrowserRedirect: Platform.OS !== 'web',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    
    if (error) throw error;
    
    if (Platform.OS !== 'web' && data?.url) {
      await Linking.openURL(data.url);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Google sign in error:', error);
    throw error;
  }
};
```

---

## 📱 ПРОВЕРКА В SUPABASE

### Посмотри, создался ли пользователь:

1. Supabase Dashboard → **Authentication** → **Users**
2. Найди пользователя по email
3. Проверь:
   - ✅ User ID есть
   - ✅ Email подтверждён
   - ✅ Provider: google

### Посмотри, создался ли профиль:

1. Supabase Dashboard → **Table Editor** → **profiles**
2. Найди запись с user_id
3. Если нет - проблема в триггере создания профиля

---

## 🔐 ПРОВЕРКА ТРИГГЕРА ПРОФИЛЯ

Выполни в SQL Editor:

```sql
-- Проверь, есть ли триггер
SELECT * FROM pg_trigger WHERE tgname LIKE '%profile%';

-- Если нет, создай:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создай триггер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## ✅ ЧЕКЛИСТ

- [ ] Redirect URL добавлен в Supabase
- [ ] Redirect URI добавлен в Google Cloud Console
- [ ] Код обновлён (AuthContext.tsx)
- [ ] APK пересобран
- [ ] Deep Link тестирован
- [ ] Триггер профиля работает
- [ ] Логи показывают токены

---

## 📞 Если всё равно не работает

### 1. Проверь формат URL в логах:

Должно быть:
```
bakery-app://auth-callback?access_token=...&refresh_token=...
```

Если нет токенов - проблема в Supabase настройках.

### 2. Попробуй другой redirect URL:

В Supabase добавь:
```
exp://localhost:8081/--/auth-callback
```

И в коде измени на:
```typescript
redirectTo: 'exp://localhost:8081/--/auth-callback'
```

### 3. Используй Expo AuthSession:

```bash
npx expo install expo-auth-session expo-crypto
```

Это более надёжный способ для OAuth в Expo.

---

## ✨ ГОТОВО!

После этих исправлений OAuth должен работать правильно!
