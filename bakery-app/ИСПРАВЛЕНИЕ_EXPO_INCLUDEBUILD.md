# Исправление Expo Module Gradle Plugin

## Проблема
```
Plugin [id: 'expo-module-gradle-plugin'] was not found
Could not get unknown property 'release'
```

## Причина
Expo модули требуют, чтобы их Gradle плагин был доступен через includeBuild в settings.gradle.

## Решение

Добавили includeBuild для expo-modules-core в `android/settings.gradle`:

```groovy
includeBuild(new File(["node", "--print", "require.resolve('expo-modules-core/package.json')"].execute(null, rootDir).text.trim(), "../android"))
```

Это позволяет Gradle найти плагин `expo-module-gradle-plugin` из локальных node_modules.

## Что теперь работает
- ✅ Expo модули подключаются через autolinking
- ✅ Expo Gradle плагин доступен для всех модулей
- ✅ Firebase плагин работает корректно
- 🔄 Сборка APK запущена

## Статус
Сборка в процессе...
