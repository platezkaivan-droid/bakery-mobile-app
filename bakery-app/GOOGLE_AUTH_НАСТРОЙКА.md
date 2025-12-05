# 🔐 Настройка Google Authentication

## ✅ Что уже сделано в коде:

1. ✅ Добавлена функция `signInWithGoogle()` в `AuthContext.tsx`
2. ✅ Кнопка "Войти через Google" работает на экранах входа и регистрации
3. ✅ Deep Links настроены для возврата в приложение

---

## 🎯 Что нужно настроить в Google Cloud Console:

### Шаг 1: Создайте проект в Google Cloud Console

1. Откройте: https://console.cloud.google.com/
2. Нажмите **"Select a project"** → **"New Project"**
3. Название проекта: `Bakery Pavlova App`
4. Нажмите **"Create"**

---

### Шаг 2: Включите Google+ API

1. В меню слева: **APIs & Services** → **Library**
2. Найдите: `Google+ API`
3. Нажмите **"Enable"**

---

### Шаг 3: Настройте OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. Выберите: **External** → **Create**
3. Заполните форму:
   - **App name:** Булочки Павлова
   - **User support email:** ваш email
   - **Developer contact:** ваш email
4. Нажмите **"Save and Continue"**
5. **Scopes:** пропустите (нажмите **"Save and Continue"**)
6. **Test users:** добавьте свой email для тестирования
7. Нажмите **"Save and Continue"**

---

### Шаг 4: Создайте OAuth 2.0 Client ID

#### A. Для Android:

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
2. **Application type:** Android
3. **Name:** Bakery App Android
4. **Package name:** `com.bakery.pavlova`
5. **SHA-1 certificate fingerprint:**

Получите SHA-1 командой:
```bash
cd bakery-app/bakery-mobile-app/bakery-app/android
./gradlew signingReport
```

Скопируйте SHA-1 из вывода (строка `SHA1:`)

6. Нажмите **"Create"**

#### B. Для Web (нужен для Supabase):

1. **Create Credentials** → **OAuth client ID**
2. **Application type:** Web application
3. **Name:** Bakery App Web
4. **Authorized redirect URIs:** добавьте:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   
   Замените `[YOUR-PROJECT-REF]` на ваш Supabase Project Reference ID
   (найдите в Supabase: Settings → API → Project URL)

5. Нажмите **"Create"**
6. **ВАЖНО:** Скопируйте **Client ID** и **Client Secret**

---

### Шаг 5: Настройте Supabase

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите ваш проект
3. **Authentication** → **Providers** → **Google**
4. Включите: ☑ **Enable Sign in with Google**
5. Вставьте:
   - **Client ID** (из шага 4B)
   - **Client Secret** (из шага 4B)
6. **Redirect URL:** уже заполнен автоматически
7. Нажмите **"Save"**

---

## 🧪 Тестирование:

### 1. Пересоберите APK:

```bash
cd bakery-app/bakery-mobile-app/bakery-app
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```

### 2. Установите APK на телефон

### 3. Протестируйте:

1. Откройте приложение
2. Нажмите **"Войти через Google"**
3. Выберите Google аккаунт
4. Разрешите доступ
5. Вы должны автоматически войти в приложение!

---

## 🔧 Troubleshooting:

### Ошибка: "Sign in with Google temporarily disabled"

**Решение:** Убедитесь, что:
- OAuth Consent Screen настроен
- Ваш email добавлен в Test Users
- Google Provider включен в Supabase

### Ошибка: "Invalid client"

**Решение:** Проверьте:
- Client ID и Secret правильно скопированы в Supabase
- Redirect URI совпадает с Supabase URL

### Ошибка: "Package name mismatch"

**Решение:** Убедитесь, что:
- Package name в Google Console: `com.bakery.pavlova`
- Package name в `app.json`: `com.bakery.pavlova`
- SHA-1 fingerprint правильный

---

## 📋 Чеклист:

- [ ] Создан проект в Google Cloud Console
- [ ] Включен Google+ API
- [ ] Настроен OAuth Consent Screen
- [ ] Создан Android OAuth Client ID
- [ ] Создан Web OAuth Client ID
- [ ] Google Provider настроен в Supabase
- [ ] APK пересобран
- [ ] Протестирован вход через Google

---

## 🎉 Готово!

После настройки пользователи смогут:
- Войти через Google одним кликом
- Не вводить email и пароль
- Автоматически создавать профиль

**Приложение:** Булочки Павлова 🍰  
**Статус:** ✅ Код готов, настройте Google Cloud Console!
