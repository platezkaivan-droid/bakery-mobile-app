# 🔐 НАСТРОЙКА GOOGLE AUTH И ПОДТВЕРЖДЕНИЯ EMAIL

## Что нужно сделать:

1. ✅ Включить подтверждение email при регистрации
2. ✅ Добавить авторизацию через Google
3. ✅ Добавить кнопку "Войти через Google" на главный экран

---

## ЧАСТЬ 1: ВКЛЮЧЕНИЕ ПОДТВЕРЖДЕНИЯ EMAIL

### Шаг 1: Откройте Supabase Dashboard

1. Перейдите на https://supabase.com
2. Выберите ваш проект
3. В левом меню нажмите **Authentication**
4. Перейдите на вкладку **Providers**

### Шаг 2: Настройте Email Provider

1. Найдите **Email** в списке провайдеров
2. Нажмите на него
3. Включите опцию **"Confirm email"**
4. Нажмите **Save**

```
┌─────────────────────────────────────┐
│ Email Provider Settings             │
├─────────────────────────────────────┤
│ ☑ Enable Email Provider             │
│ ☑ Confirm email  ← ВКЛЮЧИТЕ ЭТО    │
│ ☐ Secure email change               │
│                                     │
│ [Save]                              │
└─────────────────────────────────────┘
```

### Шаг 3: Настройте Email Templates (опционально)

1. Перейдите на вкладку **Email Templates**
2. Выберите **Confirm signup**
3. Настройте текст письма на русском:

```html
<h2>Подтвердите ваш email</h2>
<p>Спасибо за регистрацию в Sweet Bakery!</p>
<p>Нажмите на кнопку ниже, чтобы подтвердить ваш email:</p>
<p><a href="{{ .ConfirmationURL }}">Подтвердить email</a></p>
```

---

## ЧАСТЬ 2: НАСТРОЙКА GOOGLE OAUTH

### Шаг 1: Создайте проект в Google Cloud Console

1. Перейдите на https://console.cloud.google.com
2. Создайте новый проект или выберите существующий
3. Название проекта: **Sweet Bakery App**

### Шаг 2: Включите Google+ API

1. В меню слева выберите **APIs & Services** → **Library**
2. Найдите **Google+ API**
3. Нажмите **Enable**

### Шаг 3: Создайте OAuth 2.0 Client ID

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Выберите тип: **Web application**
4. Название: **Sweet Bakery Web Client**

### Шаг 4: Настройте Redirect URIs

В поле **Authorized redirect URIs** добавьте:

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

**Где взять YOUR_PROJECT_REF:**
1. Откройте Supabase Dashboard
2. Settings → API
3. Скопируйте **Project URL**
4. Например: `https://abcdefghijklmnop.supabase.co`

### Шаг 5: Получите Client ID и Client Secret

После создания вы получите:
- **Client ID**: `123456789-abc...apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc...`

**Сохраните их!**

### Шаг 6: Настройте Google Provider в Supabase

1. Откройте Supabase Dashboard
2. **Authentication** → **Providers**
3. Найдите **Google**
4. Включите его
5. Вставьте:
   - **Client ID** (из шага 5)
   - **Client Secret** (из шага 5)
6. Нажмите **Save**

```
┌─────────────────────────────────────┐
│ Google Provider Settings            │
├─────────────────────────────────────┤
│ ☑ Enable Google Provider            │
│                                     │
│ Client ID:                          │
│ [123456789-abc...apps.google...]    │
│                                     │
│ Client Secret:                      │
│ [GOCSPX-abc...]                     │
│                                     │
│ [Save]                              │
└─────────────────────────────────────┘
```

---

## ЧАСТЬ 3: ДОБАВЛЕНИЕ КНОПКИ "ВОЙТИ ЧЕРЕЗ GOOGLE"

### Шаг 1: Установите зависимости

```bash
cd bakery-app/bakery-mobile-app/bakery-app
npm install @react-native-google-signin/google-signin
```

### Шаг 2: Настройте Google Sign-In для Android

1. Откройте Google Cloud Console
2. **APIs & Services** → **Credentials**
3. Создайте **OAuth client ID** для **Android**
4. Укажите:
   - **Package name**: `com.sweetbakery.app`
   - **SHA-1**: Получите командой:
     ```bash
     cd android
     ./gradlew signingReport
     ```

### Шаг 3: Обновите AuthContext

Добавьте функцию для Google Sign-In:

```typescript
// src/context/AuthContext.tsx

import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Настройка Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
});

// Функция входа через Google
const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken!,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    return { data: null, error };
  }
};
```

### Шаг 4: Добавьте кнопку на главный экран

Обновите `app/(tabs)/home.tsx`:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// В компоненте HomeScreen:
const handleGoogleSignIn = async () => {
  const { error } = await signInWithGoogle();
  if (error) {
    showNotification({ 
      type: 'error', 
      title: 'Ошибка', 
      message: 'Не удалось войти через Google' 
    });
  } else {
    showNotification({ 
      type: 'success', 
      title: 'Успешно', 
      message: 'Вы вошли через Google' 
    });
  }
};

// В JSX добавьте кнопку:
{!user && (
  <TouchableOpacity 
    style={styles.googleButton} 
    onPress={handleGoogleSignIn}
  >
    <Ionicons name="logo-google" size={20} color="#fff" />
    <Text style={styles.googleButtonText}>Войти через Google</Text>
  </TouchableOpacity>
)}

// Стили:
const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## ЧАСТЬ 4: ПРОВЕРКА РАБОТЫ

### Тест 1: Регистрация с подтверждением email

1. Откройте приложение
2. Нажмите "Регистрация"
3. Введите email и пароль
4. Нажмите "Зарегистрироваться"
5. **Проверьте почту** - должно прийти письмо с подтверждением
6. Нажмите на ссылку в письме
7. Email подтверждён!

### Тест 2: Вход через Google

1. Откройте приложение
2. Нажмите "Войти через Google"
3. Выберите аккаунт Google
4. Разрешите доступ
5. Вы вошли!

---

## ЧАСТЬ 5: НАСТРОЙКА REDIRECT URL

### Для мобильного приложения:

1. В Supabase Dashboard:
   - **Authentication** → **URL Configuration**
   - **Redirect URLs**: Добавьте:
     ```
     com.sweetbakery.app://
     exp://localhost:8081
     ```

2. В `app.json` добавьте:
```json
{
  "expo": {
    "scheme": "com.sweetbakery.app",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "com.sweetbakery.app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## ЧАСТЬ 6: ОБРАБОТКА ПОДТВЕРЖДЕНИЯ EMAIL

### Обновите AuthContext:

```typescript
// Проверка подтверждения email
useEffect(() => {
  if (user && !user.email_confirmed_at) {
    showNotification({
      type: 'warning',
      title: 'Подтвердите email',
      message: 'Проверьте почту и подтвердите email',
      duration: 5000,
    });
  }
}, [user]);
```

---

## 📋 ЧЕКЛИСТ НАСТРОЙКИ

### Supabase:
- [ ] Включено подтверждение email
- [ ] Настроен Email Provider
- [ ] Настроен Google Provider
- [ ] Добавлены Redirect URLs

### Google Cloud Console:
- [ ] Создан проект
- [ ] Включен Google+ API
- [ ] Создан Web OAuth Client
- [ ] Создан Android OAuth Client
- [ ] Получены Client ID и Secret

### Код:
- [ ] Установлен @react-native-google-signin
- [ ] Настроен GoogleSignin.configure()
- [ ] Добавлена функция signInWithGoogle()
- [ ] Добавлена кнопка "Войти через Google"
- [ ] Настроен app.json

---

## ⚠️ ВАЖНО!

### Для production:
1. Используйте свой домен для redirect URLs
2. Настройте OAuth Consent Screen в Google Cloud
3. Добавьте логотип приложения
4. Настройте Privacy Policy и Terms of Service

### Безопасность:
1. Никогда не коммитьте Client Secret в Git
2. Используйте переменные окружения
3. Включите 2FA для Google Cloud Console
4. Регулярно обновляйте ключи

---

## 🎯 РЕЗУЛЬТАТ

После настройки:
- ✅ При регистрации приходит письмо с подтверждением
- ✅ Пользователь может войти через Google
- ✅ Кнопка "Войти через Google" на главном экране
- ✅ Безопасная авторизация

---

**Время настройки:** 30-40 минут  
**Сложность:** Средняя  
**Статус:** 📝 Инструкция готова
