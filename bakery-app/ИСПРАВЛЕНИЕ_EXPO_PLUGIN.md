# Исправление ошибки Expo Gradle Plugin

## Проблема
```
Could not find expo.modules:expo-modules-gradle-plugin:3.0.0
```

## Причина
Пытались загрузить Expo плагин из Maven репозитория, но он должен загружаться из node_modules через autolinking.

## Решение

### 1. Убрали неправильный classpath из android/build.gradle
```groovy
// УБРАЛИ ЭТУ СТРОКУ:
// classpath('expo.modules:expo-modules-gradle-plugin:3.0.0')
```

### 2. Убрали apply plugin из android/app/build.gradle
```groovy
// УБРАЛИ ЭТУ СТРОКУ:
// apply plugin: "expo.modules.gradle-plugin"
```

## Как работает правильно
Expo модули подключаются автоматически через:
- `settings.gradle` → `useExpoModules()`
- Autolinking скрипт из `expo/scripts/autolinking.gradle`

Firebase плагин остался и работает корректно через:
```groovy
apply plugin: 'com.google.gms.google-services'
```

## Статус
✅ Конфигурация исправлена
🔄 Сборка APK запущена заново
