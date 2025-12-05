# 🔧 ЗАПУСТИ PREBUILD СЕЙЧАС

## Проблема:

Gradle 8.8 установлен, но Expo модули не настроены правильно:
- `expo-module-gradle-plugin` не найден
- ExpoModulesCorePlugin ищет несуществующий компонент 'release'

## Решение:

Нужно запустить Expo prebuild чтобы правильно сгенерировать Android конфигурацию.

## Команды:

### 1. Перейди в папку проекта:
```cmd
cd bakery-app\bakery-mobile-app\bakery-app
```

### 2. Запусти prebuild:
```cmd
npx expo prebuild --clean --platform android
```

Это:
- Удалит старую папку `android`
- Сгенерирует новую с правильной конфигурацией для Gradle 8.8
- Настроит все Expo модули

### 3. После prebuild открой в Android Studio:
```
File → Open → выбери папку android
```

### 4. Sync и Build:
```
File → Sync Project with Gradle Files
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## Важно:

После prebuild НЕ ТРОГАЙ файлы:
- `android/settings.gradle`
- `android/build.gradle`
- `android/app/build.gradle`

Expo сам всё настроит правильно!

## Если prebuild не работает:

Попробуй сначала:
```cmd
npm install
```

Потом снова prebuild.
