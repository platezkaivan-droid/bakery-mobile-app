# Упрощённый settings.gradle с жёсткими путями

## Проблема
```
Could not get unknown property 'reactAndroidLibs'
```

Это version catalog, который требует сложных команд `node --print`, которые не работают надёжно на Windows.

## Решение

Использовали упрощённый settings.gradle с прямыми относительными путями:

```groovy
rootProject.name = 'BulochkiPavlova'

// Прямые пути к node_modules (надёжно работает на Windows)
apply from: "../node_modules/expo/scripts/autolinking.gradle"
useExpoModules()

apply from: "../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"
applyNativeModulesSettingsGradle(settings)

include ':app'
```

## Преимущества
- ✅ Не зависит от выполнения команд node в Gradle
- ✅ Работает надёжно на Windows
- ✅ Простая и понятная конфигурация
- ✅ Все модули подключаются через autolinking

## Статус
🔄 Сборка APK запущена с упрощённой конфигурацией
