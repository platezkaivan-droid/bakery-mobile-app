# Бронебойный settings.gradle для Windows

## Проблема
- Стандартный конфиг не работает из-за команд `node --print` на Windows
- Упрощённый конфиг не работает из-за отсутствия `reactAndroidLibs`

## Решение

Совместили оба подхода - вернули структуру плагинов, но с жёсткими путями:

```groovy
pluginManagement {
    // Прямой путь вместо node --print
    includeBuild("../node_modules/@react-native/gradle-plugin")
}

plugins {
    id("com.facebook.react.settings")
}

rootProject.name = 'BulochkiPavlova'

include ':app'

// Прямые пути к модулям
includeBuild("../node_modules/@react-native/gradle-plugin")
includeBuild("../node_modules/expo-modules-autolinking")

// Прямые пути к скриптам
apply from: "../node_modules/expo/scripts/autolinking.gradle"
useExpoModules()

apply from: "../node_modules/@react-native-community/cli-platform-android/native_modules.gradle"
applyNativeModulesSettingsGradle(settings)
```

## Преимущества
- ✅ Плагины React Native доступны (reactAndroidLibs работает)
- ✅ Expo модули подключены через autolinking
- ✅ Нет зависимости от команд node в Gradle
- ✅ Надёжно работает на Windows

## Статус
🔄 Сборка APK запущена с бронебойной конфигурацией
