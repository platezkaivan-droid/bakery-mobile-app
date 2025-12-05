# 🔧 Собери APK в Android Studio (Решение проблемы Gradle на Windows)

## Проблема:
Gradle на Windows не может выполнить команды `node` в settings.gradle из командной строки.

## Решение:
Используй Android Studio - там Gradle работает правильно с node командами.

## Шаги:

### 1. Открой проект в Android Studio
```
Файл → Open → Выбери папку:
C:\Users\Administrator\Documents\bakery-app\bakery-mobile-app\bakery-app\android
```

### 2. Дождись синхронизации Gradle
- Android Studio автоматически запустит Gradle Sync
- Подожди, пока внизу не появится "Gradle sync finished"
- Если будут ошибки - они покажутся в Build Output

### 3. Собери Release APK
```
Build → Select Build Variant → release
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### 4. Найди готовый APK
После успешной сборки APK будет здесь:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Что уже настроено:
✅ Firebase (google-services.json + Gradle plugins)
✅ Deep Links (bakery-app://auth-callback)
✅ Push уведомления (@react-native-firebase/messaging)
✅ Правильный package name (com.bulochkipavlova)

## Если Android Studio покажет ошибки:
Скопируй текст ошибки и покажи мне - исправим.
