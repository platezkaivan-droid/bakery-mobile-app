# Отладка краша при входе/регистрации

## Возможные причины краша

### 1. Проблема с Supabase подключением
- **Симптом:** Приложение крашится при попытке авторизации
- **Причина:** Supabase URL или ключ могут быть неверными, или сервер недоступен
- **Решение:** Проверить подключение к Supabase

### 2. Проблема с AsyncStorage
- **Симптом:** Краш при попытке сохранить сессию
- **Причина:** AsyncStorage может не работать в release сборке
- **Решение:** Проверить ProGuard правила

### 3. Проблема с react-native-reanimated
- **Симптом:** Краш при навигации
- **Причина:** Версия 2.17.0 использует fallback для RN 71, несовместима с RN 0.81.5
- **Решение:** Обновить React Native или откатить reanimated

### 4. Проблема с minification (R8/ProGuard)
- **Симптом:** Работает в debug, крашится в release
- **Причина:** R8 удаляет нужный код
- **Решение:** Добавить ProGuard правила

## Шаги отладки

### Шаг 1: Получить логи краша

```bash
# Подключить устройство и запустить logcat
adb logcat | grep -i "crash\|error\|exception\|fatal"

# Или сохранить в файл
adb logcat > crash_log.txt
```

### Шаг 2: Проверить ProGuard правила

Создать файл `android/app/proguard-rules.pro`:

```proguard
# Supabase
-keep class io.supabase.** { *; }
-keep class com.supabase.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Expo
-keep class expo.modules.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }
-keep class io.invertase.firebase.** { *; }

# Не обфусцировать имена классов для отладки
-keepattributes SourceFile,LineNumberTable
-keepattributes *Annotation*
```

### Шаг 3: Собрать debug APK для тестирования

```bash
cd android
./gradlew assembleDebug
```

Установить и проверить:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Шаг 4: Временно отключить minification

В `android/gradle.properties`:
```properties
android.enableMinifyInReleaseBuilds=false
android.enableShrinkResourcesInReleaseBuilds=false
```

Пересобрать:
```bash
./gradlew clean assembleRelease
```

### Шаг 5: Проверить Supabase подключение

Добавить в `AuthContext.tsx` больше логов:

```typescript
const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    console.log('✅ Sign in response:', { data, error });
    if (error) throw error;
  } catch (error) {
    console.error('❌ Sign in error:', error);
    throw error;
  }
};
```

### Шаг 6: Проверить react-native-reanimated

Временно удалить reanimated из babel.config.js:

```javascript
// Закомментировать эту строку
// 'react-native-reanimated/plugin',
```

## Быстрое решение (если краш из-за minification)

### Вариант 1: Отключить minification

```bash
cd bakery-mobile-app/bakery-app/android
```

Отредактировать `gradle.properties`:
```properties
android.enableMinifyInReleaseBuilds=false
android.enableShrinkResourcesInReleaseBuilds=false
```

Пересобрать:
```bash
./gradlew clean assembleRelease
```

### Вариант 2: Добавить ProGuard правила

Создать/обновить `android/app/proguard-rules.pro` с правилами выше.

## Проверка работы

1. Установить APK на устройство
2. Открыть приложение
3. Подключить adb logcat
4. Нажать "Войти" или "Создать аккаунт"
5. Смотреть логи в реальном времени

## Ожидаемые логи при успешной работе

```
AuthContext: Initializing...
AuthContext: Loading session...
Storage GET: supabase.auth.token Found/Not found
🔐 Attempting sign in for: user@example.com
✅ Sign in response: { data: {...}, error: null }
AuthContext: Auth state changed: SIGNED_IN
AuthContext: New session, loading profile...
```

## Если краш продолжается

1. Собрать debug APK и проверить работу
2. Если debug работает, а release нет - проблема в minification
3. Добавить ProGuard правила для всех используемых библиотек
4. Проверить логи через adb logcat
5. Отправить логи для анализа
