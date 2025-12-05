# 🔧 ИСПРАВЛЕНИЕ EMAIL DEEP LINKS

## 🚨 Проблема

При клике на ссылку из письма (подтверждение email):
- ❌ Открывается браузер с Supabase URL
- ❌ Не перенаправляет в приложение
- ❌ Показывает пустую страницу

## 🔍 Причина

Supabase отправляет ссылку на свой домен, а не Deep Link приложения. Нужно настроить **Custom SMTP** или **Email Redirect**.

---

## ✅ РЕШЕНИЕ 1: Настройка Email Redirect (БЫСТРО)

### Шаг 1: Создай страницу редиректа

Создай файл `email-redirect.html` и залей на хостинг (GitHub Pages, Vercel, Netlify):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Перенаправление...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #FF6B35;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .message {
      font-size: 18px;
      margin-top: 20px;
    }
    .fallback {
      margin-top: 30px;
      font-size: 14px;
      opacity: 0.8;
    }
    a {
      color: #FFD700;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍞 Булочки Павлова</h1>
    <div class="loader"></div>
    <div class="message" id="message">Открываем приложение...</div>
    <div class="fallback" id="fallback" style="display: none;">
      <p>Приложение не открылось?</p>
      <p><a href="#" id="manualLink">Нажмите здесь</a></p>
    </div>
  </div>

  <script>
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');
    const access_token = urlParams.get('access_token');
    const refresh_token = urlParams.get('refresh_token');

    // Формируем Deep Link
    let deepLink = 'bakery-app://auth-callback';
    
    if (access_token && refresh_token) {
      deepLink += `?access_token=${access_token}&refresh_token=${refresh_token}`;
    } else if (token) {
      deepLink += `?token=${token}&type=${type || 'signup'}`;
    }

    console.log('Deep Link:', deepLink);

    // Пытаемся открыть приложение
    window.location.href = deepLink;

    // Показываем fallback через 3 секунды
    setTimeout(() => {
      document.getElementById('message').textContent = 'Если приложение не открылось...';
      document.getElementById('fallback').style.display = 'block';
      document.getElementById('manualLink').href = deepLink;
    }, 3000);

    // Для iOS - пытаемся открыть через универсальные ссылки
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setTimeout(() => {
        window.location.href = deepLink;
      }, 25);
    }
  </script>
</body>
</html>
```

### Шаг 2: Настрой Supabase

1. Открой **Supabase Dashboard**
2. **Authentication** → **URL Configuration**
3. **Site URL**: `https://твой-домен.com/email-redirect.html`
4. **Redirect URLs**: Добавь:
   ```
   https://твой-домен.com/email-redirect.html
   bakery-app://auth-callback
   ```

### Шаг 3: Обнови Email Template

1. **Authentication** → **Email Templates**
2. **Confirm signup** → Edit
3. Замени `{{ .ConfirmationURL }}` на:
   ```
   https://твой-домен.com/email-redirect.html?token={{ .Token }}&type=signup
   ```

---

## ✅ РЕШЕНИЕ 2: Android App Links (ПРАВИЛЬНО)

Это позволит открывать HTTPS ссылки прямо в приложении!

### Шаг 1: Создай assetlinks.json

Создай файл и залей на `https://твой-домен.com/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.bakery.pavlova",
    "sha256_cert_fingerprints": [
      "ТВОЙ_SHA256_FINGERPRINT"
    ]
  }
}]
```

**Как получить SHA256:**
```bash
cd bakery-app/bakery-mobile-app/bakery-app/android
keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Шаг 2: Обнови AndroidManifest.xml

Добавь в `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  
  <!-- Deep Link -->
  <data android:scheme="bakery-app" android:host="auth-callback" />
  
  <!-- App Links (HTTPS) -->
  <data android:scheme="https" android:host="твой-домен.com" android:pathPrefix="/auth" />
</intent-filter>
```

### Шаг 3: Настрой Supabase

**Site URL**: `https://твой-домен.com/auth/callback`

---

## ✅ РЕШЕНИЕ 3: Без своего домена (ВРЕМЕННО)

Если нет домена, используй GitHub Pages:

### Шаг 1: Создай репозиторий

1. Создай новый репозиторий на GitHub: `bakery-email-redirect`
2. Создай файл `index.html` с кодом выше
3. Включи GitHub Pages в настройках

### Шаг 2: Используй GitHub Pages URL

```
https://твой-username.github.io/bakery-email-redirect/
```

### Шаг 3: Настрой Supabase

**Site URL**: `https://твой-username.github.io/bakery-email-redirect/`

---

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Проверь редирект страницу

Открой в браузере:
```
https://твой-домен.com/email-redirect.html?access_token=test&refresh_token=test
```

Должно попытаться открыть приложение!

### Тест 2: Проверь Deep Link

```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "bakery-app://auth-callback?token=test&type=signup" \
  com.bakery.pavlova
```

### Тест 3: Отправь тестовое письмо

1. Зарегистрируй нового пользователя
2. Проверь письмо
3. Кликни на ссылку
4. Должно открыть приложение!

---

## 📱 ОБНОВЛЕНИЕ КОДА

Обнови `AuthContext.tsx` для обработки token из email:

```typescript
const handleDeepLink = async (event: { url: string }) => {
  console.log('🔗 Deep link received:', event.url);
  
  if (event.url.includes('auth-callback')) {
    console.log('✅ OAuth callback detected');
    
    try {
      const url = new URL(event.url);
      
      // Проверяем разные типы токенов
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');
      
      if (access_token && refresh_token) {
        // OAuth токены
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token
        });
        
        if (error) throw error;
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          await loadProfile(data.session.user.id);
        }
      } else if (token && type) {
        // Email confirmation token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any
        });
        
        if (error) throw error;
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          await loadProfile(data.session.user.id);
        }
      }
    } catch (error) {
      console.error('❌ Error handling deep link:', error);
    }
  }
};
```

---

## ✅ ЧЕКЛИСТ

- [ ] Создана страница редиректа
- [ ] Залита на хостинг
- [ ] Настроен Site URL в Supabase
- [ ] Обновлён Email Template
- [ ] Код обновлён для обработки token
- [ ] Протестирована ссылка из письма

---

## 📞 Если не работает

1. **Проверь URL в письме** - должен вести на твою страницу редиректа
2. **Проверь консоль браузера** - смотри логи Deep Link
3. **Проверь, установлено ли приложение** - Deep Link работает только если приложение установлено
4. **Попробуй вручную** - скопируй Deep Link и открой через `adb shell`

---

## ✨ ГОТОВО!

Теперь ссылки из email будут открывать приложение!
