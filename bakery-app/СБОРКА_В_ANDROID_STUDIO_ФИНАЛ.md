# 🚀 СБОРКА APK В ANDROID STUDIO - ФИНАЛЬНАЯ ИНСТРУКЦИЯ

## ✅ ЧТО ИСПРАВЛЕНО

1. **settings.gradle** - упрощён, убраны лишние includeBuild
2. **build.gradle** - заменены `reactAndroidLibs` на жёсткие версии (2.5.0)
3. **Firebase** - временно отключён (закомментирован)

## 📋 ШАГ ЗА ШАГОМ

### 1. Открой Android Studio
- Запусти Android Studio
- File → Open
- Выбери папку: `C:\Users\Administrator\Documents\bakery-app\bakery-mobile-app\bakery-app\android`

### 2. Дождись синхронизации Gradle
- Android Studio автоматически запустит Gradle Sync
- Подожди пока внизу появится "BUILD SUCCESSFUL" или "Gradle sync finished"
- Это займёт 2-5 минут

### 3. Очисти проект
- Build → Clean Project
- Подожди завершения

### 4. Собери APK
- Build → Build Bundle(s) / APK(s) → Build APK(s)
- Или используй меню: Build → Generate Signed Bundle / APK → APK → Next → Create new... (если нужен подписанный APK)

### 5. Найди APK
После успешной сборки APK будет здесь:
```
bakery-app/bakery-mobile-app/bakery-app/android/app/build/outputs/apk/release/app-release.apk
```

## ⚠️ ЕСЛИ ОШИБКИ

### Ошибка: "reactAndroidLibs"
Это значит Gradle кэшировал старую версию. Решение:
1. File → Invalidate Caches → Invalidate and Restart
2. Подожди перезапуска Android Studio
3. Попробуй снова

### Ошибка: "Plugin com.facebook.react.settings not found"
Это уже исправлено в settings.gradle. Если всё равно ошибка:
1. Закрой Android Studio
2. Удали папки:
   - `android/.gradle`
   - `android/app/build`
3. Открой Android Studio снова

### Ошибка: "google-services.json"
Firebase временно отключён. Если нужен Firebase:
1. Раскомментируй в `android/app/build.gradle`:
   ```groovy
   apply plugin: 'com.google.gms.google-services'
   ```
2. Раскомментируй в `android/build.gradle`:
   ```groovy
   classpath('com.google.gms:google-services:4.4.0')
   ```

## 🎯 АЛЬТЕРНАТИВА - КОМАНДНАЯ СТРОКА

Если Android Studio не работает, попробуй:

```cmd
cd bakery-app\bakery-mobile-app\bakery-app\android
rmdir /s /q .gradle
rmdir /s /q app\build
gradlew.bat clean
gradlew.bat assembleRelease
```

## ✨ ПОСЛЕ СБОРКИ

APK готов к установке на телефон!
Отправь его себе или установи через USB.

---
**Время сборки:** 5-10 минут  
**Размер APK:** ~50-80 MB
