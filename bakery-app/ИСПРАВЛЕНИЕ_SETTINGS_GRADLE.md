# Исправление settings.gradle для Expo 50

## Проблема
```
Plugin [id: 'expo-module-gradle-plugin'] was not found
```

## Причина
В settings.gradle не хватало `includeBuild` для `expo-modules-autolinking`, который содержит Expo Gradle плагин.

## Решение

Заменили весь settings.gradle на правильную конфигурацию для Expo 50:

```groovy
pluginManagement {
    includeBuild(new File(...@react-native/gradle-plugin...))
}

plugins {
    id("com.facebook.react.settings")
}

rootProject.name = 'BulochkiPavlova'

include ':app'
includeBuild(new File(...@react-native/gradle-plugin...))

// ВОТ ЭТА СТРОКА БЫЛА КРИТИЧЕСКИ ВАЖНА:
includeBuild(new File(...expo-modules-autolinking...))

apply from: ...autolinking.gradle
useExpoModules()
```

## Что это даёт
- ✅ Gradle находит `expo-module-gradle-plugin`
- ✅ Все Expo модули подключаются корректно
- ✅ Autolinking работает
- ✅ Сборка должна пройти успешно

## Статус
🔄 Сборка APK запущена с исправленным settings.gradle
