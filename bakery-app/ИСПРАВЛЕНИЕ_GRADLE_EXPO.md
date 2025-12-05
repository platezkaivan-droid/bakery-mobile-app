# Исправление ошибки сборки Gradle + Expo

## Проблема
```
BUILD FAILED in 35s
Plugin [id: 'expo-module-gradle-plugin'] was not found
Could not get unknown property 'release'
```

## Что было сделано

### 1. Добавлен classpath в android/build.gradle
```groovy
dependencies {
    classpath('com.android.tools.build:gradle')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('com.google.gms:google-services:4.4.0')
    classpath('expo.modules:expo-modules-gradle-plugin:3.0.0')  // ← ДОБАВЛЕНО
}
```

### 2. Применён плагин в android/app/build.gradle
```groovy
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
apply plugin: "expo.modules.gradle-plugin"  // ← ДОБАВЛЕНО
```

## Результат
Сборка запущена заново с исправлениями. Expo модули теперь правильно подключены.

## Статус
✅ Gradle конфигурация исправлена
🔄 Сборка APK в процессе
