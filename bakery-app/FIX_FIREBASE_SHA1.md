# 🔥 Исправление Firebase SHA-1 для Google Sign-In

## ❌ Проблема найдена!

В `google-services.json` пустой массив `oauth_client: []` - это значит SHA-1 отпечаток НЕ добавлен в Firebase!

**Ваш SHA-1 отпечаток:**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

## ✅ Как исправить (5 минут)

### Шаг 1: Откройте Firebase Console

1. Перейдите на https://console.firebase.google.com/
2. Выберите проект **bakery-app-6452b**
3. Нажмите на шестеренку ⚙️ → **Project Settings** (Настройки проекта)

### Шаг 2: Добавьте SHA-1

1. Прокрутите вниз до раздела **Your apps** (Ваши приложения)
2. Найдите Android приложение с package name: `com.bakery.pavlova`
3. Нажмите **Add fingerprint** (Добавить отпечаток)
4. Вставьте SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
5. Нажмите **Save** (Сохранить)

### Шаг 3: Скачайте новый google-services.json

1. На той же странице нажмите **Download google-services.json**
2. Замените файл в проекте:
   ```
   bakery-mobile-app/bakery-app/android/app/google-services.json
   ```

### Шаг 4: Пересоберите APK

```bash
cd bakery-mobile-app/bakery-app/android
./gradlew clean
./gradlew assembleRelease
```

### Шаг 5: Установите новый APK

```bash
adb install app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

## 🎯 Что должно измениться в google-services.json

**Было:**
```json
"oauth_client": [],
```

**Станет:**
```json
"oauth_client": [
  {
    "client_id": "616728560840-xxxxxxxxxx.apps.googleusercontent.com",
    "client_type": 3
  }
],
```

## 🔍 Как проверить, что исправлено

1. Откройте приложение
2. Нажмите "Войти через Google"
3. Должен открыться браузер с Google авторизацией
4. После входа должно вернуться в приложение

## 📱 Если нужно получить логи краша

### Вариант 1: Через Android Studio
1. Откройте Android Studio
2. View → Tool Windows → Logcat
3. Выберите ваше устройство
4. Фильтр: `package:com.bakery.pavlova`

### Вариант 2: Через ADB (если установлен)
```bash
# Найти путь к adb
where adb

# Если не найден, добавить в PATH:
# C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools

# Получить логи
adb logcat *:E | findstr "bakery"
```

### Вариант 3: Через PowerShell (найти adb)
```powershell
# Найти Android SDK
Get-ChildItem -Path "C:\Users\Administrator\AppData\Local\Android\Sdk" -Filter "adb.exe" -Recurse -ErrorAction SilentlyContinue

# Запустить adb
& "C:\Users\Administrator\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat *:E
```

## 🐛 Другие возможные причины краша

### 1. Supabase URL неверный
Проверьте в `src/lib/supabase.ts`:
```typescript
const SUPABASE_URL = 'https://qkyhwdmhkoizxjazwnti.supabase.co';
```

### 2. AsyncStorage проблемы
Добавлено в ProGuard правила ✅

### 3. React Native Reanimated
Добавлено в ProGuard правила ✅

### 4. Minification отключен
Уже отключен ✅

## 📊 Статус исправлений

- ✅ ProGuard правила добавлены
- ✅ Minification отключен
- ✅ SHA-1 получен
- ❌ SHA-1 НЕ добавлен в Firebase (нужно сделать!)
- ❌ google-services.json НЕ обновлен (нужно сделать!)

## 🚀 После исправления

Приложение должно работать без крашей при:
- Входе через email/пароль
- Входе через Google
- Регистрации
- Навигации между экранами

## 💡 Важно!

Если вы создадите **production keystore** (не debug), нужно будет:
1. Получить SHA-1 от production keystore
2. Добавить его в Firebase Console
3. Скачать новый google-services.json
4. Пересобрать APK

Команда для получения SHA-1 от любого keystore:
```bash
keytool -list -v -keystore путь/к/keystore.jks -alias ваш_alias
```
