# 📱 Сборка Android APK приложения

## Способ 1: Быстрая сборка через EAS Build (Рекомендуется)

### Шаг 1: Установка EAS CLI
```bash
npm install -g eas-cli
```

### Шаг 2: Вход в Expo аккаунт
```bash
eas login
```

Если нет аккаунта:
```bash
eas register
```

### Шаг 3: Настройка проекта
```bash
cd bakery-app\bakery-mobile-app\bakery-app
eas build:configure
```

### Шаг 4: Сборка APK
```bash
eas build -p android --profile preview
```

**Результат:** Через 10-15 минут получишь ссылку на скачивание APK файла.

---

## Способ 2: Локальная сборка (Без Expo аккаунта)

### Требования:
- ✅ Android Studio установлен
- ✅ Java JDK 17+ установлен
- ✅ Android SDK настроен

### Шаг 1: Создание нативного проекта
```bash
cd bakery-app\bakery-mobile-app\bakery-app
npx expo prebuild --platform android
```

Это создаст папку `android/` с нативным Android проектом.

### Шаг 2: Открыть в Android Studio
1. Открой **Android Studio**
2. File → Open
3. Выбери папку: `bakery-app\bakery-mobile-app\bakery-app\android`
4. Дождись синхронизации Gradle

### Шаг 3: Сборка APK в Android Studio
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Дождись завершения сборки
3. APK будет в: `android\app\build\outputs\apk\debug\app-debug.apk`

### Шаг 4: Или через командную строку
```bash
cd android
gradlew assembleDebug
```

APK будет в: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Способ 3: Expo Go (Для тестирования)

### Быстрый тест без сборки:
1. Установи **Expo Go** на телефон из Google Play
2. Запусти проект:
   ```bash
   cd bakery-app\bakery-mobile-app\bakery-app
   npx expo start
   ```
3. Отсканируй QR-код в Expo Go

---

## Настройка приложения перед сборкой

### 1. Обновить app.json
```json
{
  "expo": {
    "name": "Sweet Bakery",
    "slug": "sweet-bakery",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FF6B35"
    },
    "android": {
      "package": "com.sweetbakery.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF6B35"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### 2. Создать иконки
Нужны файлы:
- `assets/icon.png` (1024x1024)
- `assets/splash.png` (1284x2778)
- `assets/adaptive-icon.png` (1024x1024)

Можно сгенерировать на: https://www.appicon.co/

---

## Production сборка (Для публикации)

### Создание подписанного APK

#### 1. Создать keystore
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

#### 2. Настроить gradle
Создай файл `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=твой_пароль
MYAPP_RELEASE_KEY_PASSWORD=твой_пароль
```

#### 3. Обновить android/app/build.gradle
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. Собрать release APK
```bash
cd android
gradlew assembleRelease
```

APK будет в: `android\app\build\outputs\apk\release\app-release.apk`

---

## Установка APK на телефон

### Способ 1: Через USB
1. Включи **Режим разработчика** на телефоне
2. Включи **Отладку по USB**
3. Подключи телефон к компьютеру
4. Запусти:
   ```bash
   adb install android\app\build\outputs\apk\debug\app-debug.apk
   ```

### Способ 2: Через файл
1. Скопируй APK на телефон
2. Открой файл на телефоне
3. Разреши установку из неизвестных источников
4. Установи

---

## Проблемы и решения

### Ошибка: "SDK location not found"
**Решение:**
Создай файл `android/local.properties`:
```properties
sdk.dir=C:\\Users\\ТвоёИмя\\AppData\\Local\\Android\\Sdk
```

### Ошибка: "Java version"
**Решение:**
Установи Java JDK 17:
```bash
choco install openjdk17
```

### Ошибка: "Gradle sync failed"
**Решение:**
```bash
cd android
gradlew clean
gradlew build
```

---

## Размер APK

### Debug APK: ~50-80 MB
### Release APK (минифицированный): ~30-50 MB

### Уменьшение размера:
1. Включи ProGuard (minifyEnabled true)
2. Используй App Bundle вместо APK
3. Удали неиспользуемые ресурсы

---

## Публикация в Google Play

### 1. Создать App Bundle
```bash
cd android
gradlew bundleRelease
```

### 2. Файл будет в:
`android\app\build\outputs\bundle\release\app-release.aab`

### 3. Загрузить в Google Play Console
1. Создай аккаунт разработчика ($25 один раз)
2. Создай новое приложение
3. Загрузи AAB файл
4. Заполни описание, скриншоты
5. Отправь на проверку

---

## Быстрый старт (Рекомендация)

Для начала используй **EAS Build** - это проще всего:

```bash
# 1. Установи EAS CLI
npm install -g eas-cli

# 2. Войди в аккаунт
eas login

# 3. Перейди в проект
cd bakery-app\bakery-mobile-app\bakery-app

# 4. Настрой проект
eas build:configure

# 5. Собери APK
eas build -p android --profile preview

# 6. Дождись ссылки на скачивание
```

**Время сборки:** 10-15 минут  
**Результат:** Готовый APK файл для установки

---

## Полезные команды

```bash
# Проверить подключенные устройства
adb devices

# Установить APK
adb install путь\к\файлу.apk

# Удалить приложение
adb uninstall com.sweetbakery.app

# Посмотреть логи
adb logcat

# Очистить кеш Gradle
cd android
gradlew clean

# Пересобрать проект
npx expo prebuild --clean
```

---

## Что дальше?

После сборки APK:
1. ✅ Протестируй на реальном устройстве
2. ✅ Проверь все функции (авторизация, корзина, заказы)
3. ✅ Оптимизируй размер APK
4. ✅ Создай подписанный release APK
5. ✅ Опубликуй в Google Play

Удачи! 🚀

