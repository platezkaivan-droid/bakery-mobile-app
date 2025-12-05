# Исправление ошибки Gradle с Expo Modules

## Проблема
```
Could not get unknown property 'release' for SoftwareComponent container
```

## Что было сделано

### 1. Обновлён Android Gradle Plugin
- Обновлён до версии 8.1.1
- Добавлен Kotlin Gradle Plugin
- Раскомментирован Google Services classpath

### 2. Исправлен app/build.gradle
- Google Services плагин теперь применяется условно (только если файл существует)

### 3. Что нужно сделать СЕЙЧАС

Выполни эти команды в терминале:

```bash
cd bakery-app/bakery-mobile-app/bakery-app

# Очисти кэш Gradle
cd android
./gradlew clean
cd ..

# Удали node_modules и переустанови
rm -rf node_modules
npm install

# Запусти prebuild заново
npx expo prebuild --clean

# Попробуй собрать
cd android
./gradlew assembleRelease
```

## Альтернативное решение (если не поможет)

Если ошибка повторится, нужно обновить Expo SDK:

```bash
# Обнови Expo до SDK 51
npx expo install expo@latest

# Обнови все зависимости
npx expo install --fix
```

## Проверка в Android Studio

1. Открой проект в Android Studio
2. File → Invalidate Caches → Invalidate and Restart
3. Build → Clean Project
4. Build → Rebuild Project
5. Build → Build Bundle(s) / APK(s) → Build APK(s)

## Что исправлено в файлах

### android/build.gradle
- AGP: 8.1.1
- Kotlin: 1.9.0
- Google Services: 4.4.0

### android/app/build.gradle
- Условное применение Google Services плагина
