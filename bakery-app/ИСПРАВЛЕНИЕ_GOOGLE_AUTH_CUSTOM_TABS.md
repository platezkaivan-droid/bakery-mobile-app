# 🔧 ИСПРАВЛЕНИЕ GOOGLE AUTH - CUSTOM TABS

## 🚨 Проблема

Google Auth открывается в браузере и не возвращается в приложение. Приложение висит на загрузке.

## 🔍 Причина

По умолчанию Supabase открывает браузер для OAuth, но не использует Custom Tabs для Android. Нужно настроить **expo-web-browser** для правильной работы.

---

## ✅ РЕШЕНИЕ

### Шаг 1: Установи пакет

```bash
cd bakery-app/bakery-mobile-app/bakery-app
npx expo install expo-web-browser
```

### Шаг 2: Обнови supabase.ts

Добавь настройку для использования Custom Tabs:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import * as WebBrowser from 'expo-web-browser'; // ← ДОБАВЬ

// ← ДОБАВЬ ЭТО
WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = 'https://qkyhwdmhkoizxjazwnti.supabase.co';
const SUPABASE_ANON_KEY = 'твой_ключ';

// ... остальной код
```

### Шаг 3: Обнови AuthContext.tsx

Измени функцию `signInWithGoogle`:

```typescript
import * as WebBrowser from 'expo-web-browser'; // ← ДОБАВЬ В ИМПОРТЫ

const signInWithGoogle = async () => {
  try {
    // Открываем Custom Tab
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'bakery-app://auth-callback',
        skipBrowserRedirect: false,
      }
    });
    
    if (error) throw error;
    
    // Открываем URL в Custom Tab
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'bakery-app://auth-callback'
      );
      
      console.log('Auth result:', result);
      
      if (result.type === 'success') {
        // Обрабатываем успешный результат
        const url = result.url;
        // Supabase автоматически обработает callback
      }
    }
    
    return data;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};
```

### Шаг 4: Проверь AndroidManifest.xml

Убедись, что intent-filter настроен правильно:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="bakery-app" android:host="auth-callback" />
</intent-filter>
```

---

## 🎯 АЛЬТЕРНАТИВНОЕ РЕШЕНИЕ (ПРОЩЕ)

Если не хочешь устанавливать дополнительные пакеты, используй **Linking** из React Native:

### Обнови AuthContext.tsx:

```typescript
import { Linking } from 'react-native'; // ← ДОБАВЬ

const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'bakery-app://auth-callback',
        skipBrowserRedirect: false,
      }
    });
    
    if (error) throw error;
    
    // Открываем URL
    if (data?.url) {
      await Linking.openURL(data.url);
    }
    
    return data;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};
```

---

## 🔧 ПОЛНОЕ ИСПРАВЛЕНИЕ (РЕКОМЕНДУЕТСЯ)

Я создам исправленные файлы прямо сейчас!
