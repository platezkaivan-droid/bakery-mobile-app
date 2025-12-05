# Финальное решение проблемы Gradle

## Проблема
```
Could not get unknown property 'release' for SoftwareComponent container
```

Это известная проблема с Expo SDK 50 + Android Gradle Plugin 8.x + expo-modules-core.

## Что я сделал

### 1. Убрал Firebase плагин из app.json
Firebase плагин конфликтует с Expo SDK 50. Мы используем Firebase напрямую через gradle.

### 2. Добавил явные версии SDK в expo-build-properties
```json
"compileSdkVersion": 34,
"targetSdkVersion": 34,
"buildToolsVersion": "34.0.0"
```

## Что делать СЕЙЧАС

### Вариант 1: Попробовать собрать с текущими изменениями

```bash
# Запусти prebuild заново
3-prebuild.bat

# Потом собери
4-build-apk.bat
```

### Вариант 2: Обновить до Expo SDK 51 (РЕКОМЕНДУЮ)

```bash
# Запусти скрипт обновления
5-update-expo-sdk.bat

# Потом prebuild
3-prebuild.bat

# И сборка
4-build-apk.bat
```

### Вариант 3: Собрать в Android Studio

1. Открой проект в Android Studio
2. File → Sync Project with Gradle Files
3. Build → Clean Project
4. Build → Rebuild Project
5. Build → Build Bundle(s) / APK(s) → Build APK(s)

## Почему это происходит?

Expo SDK 50 использует старую версию expo-modules-core, которая несовместима с Android Gradle Plugin 8.1+. 

ExpoModulesCorePlugin пытается получить доступ к компоненту 'release' в момент конфигурации, но этот компонент создаётся только после применения плагина com.android.application.

## Решения от сообщества

1. **Обновиться до Expo SDK 51** - там это исправлено
2. **Откатиться на AGP 7.4.2** - но тогда не будет работать с Gradle 8.8
3. **Использовать EAS Build** - облачная сборка Expo

## Мой совет

Запусти `5-update-expo-sdk.bat` - это обновит всё до SDK 51, где проблема исправлена.
