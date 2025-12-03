# История исправлений из Google Gemini

Этот документ содержит все решения проблем из истории переписки с Google Gemini.

---

## 🔐 Проблема 1: Авторизация слетает при обновлении страницы

### Симптомы:
- При обновлении страницы пользователь выходит из системы
- Функции приложения сбиваются
- Сессия не сохраняется

### Причина:
1. **Race Condition** - приложение рендерится быстрее, чем Supabase проверяет сессию
2. **Неправильное хранилище** - использовался `localStorage` вместо `AsyncStorage` для React Native

### Решение:

#### 1. Правильное хранилище (`src/lib/supabase.ts`)
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // ← КЛЮЧЕВОЙ МОМЕНТ
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Обновление токена при возврате из фона
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

#### 2. Состояние загрузки (`src/context/AuthContext.tsx`)
```typescript
const [loading, setLoading] = useState(true); // ← Важно!

useEffect(() => {
  const fetchSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    } catch (error) {
      console.error('Ошибка восстановления сессии:', error);
    } finally {
      setLoading(false); // ← Убираем загрузку только после проверки
    }
  };

  fetchSession();

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

#### 3. Защита роутов (`app/_layout.tsx`)
```typescript
const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || loading) return; // ← Ждём готовности

    const inAuthGroup = segments[0] === 'auth';
    
    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session) {
      if (inAuthGroup || segments.length === 0) {
        router.replace('/(tabs)');
      }
    }
  }, [session, loading, segments, navigationState?.key]);

  if (loading || !navigationState?.key) {
    return <ActivityIndicator />; // ← Показываем загрузку
  }

  return <Slot />;
};
```

---

## 🧭 Проблема 2: "Attempted to navigate before mounting"

### Симптомы:
- Ошибка при запуске приложения
- Навигация не работает
- Приложение зависает на загрузке

### Причина:
- Попытка навигации до того, как Expo Router полностью инициализировался
- Избыточная логика редиректа в нескольких местах

### Решение:

#### 1. Очистить `app/index.tsx`
```typescript
// ❌ УДАЛИТЬ ВСЕ useEffect с редиректами
// ✅ Оставить только UI с кнопками

export default function Index() {
  const { user, loading } = useAuth();

  // Простой редирект без useEffect
  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)/home');
    }
  }, [user, loading]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Link href="/auth/login">Войти</Link>
      <Link href="/auth/register">Регистрация</Link>
    </View>
  );
}
```

#### 2. Использовать `useRootNavigationState`
```typescript
const navigationState = useRootNavigationState();

useEffect(() => {
  if (!navigationState?.key) return; // ← Проверка готовности навигации
  
  // Теперь можно делать редиректы
}, [navigationState?.key]);
```

---

## 🖼️ Проблема 3: Картинки товаров не отображаются

### Симптомы:
- Все товары показывают одну и ту же картинку
- Картинки не загружаются из базы данных

### Причина:
- Товары в коде имели ID `'1', '2', '3'` (строки)
- База данных ожидала UUID
- Локальные `require()` не работают с динамическими путями

### Решение:

#### Создать словарь картинок (`app/(tabs)/home.tsx`)
```typescript
const PRODUCT_IMAGES: { [key: string]: any } = {
  croissant: require('../../assets/products/круассан с шоколадом.jpg'),
  cinnabon: require('../../assets/products/синнабон классический.jpg'),
  almondCroissant: require('../../assets/products/круасан с мендалём.jpg'),
  // ... остальные товары
};

// В массиве товаров использовать ключи:
const PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Круассан с шоколадом', 
    image: 'croissant', // ← Ключ из словаря
    // ...
  },
];

// При рендере:
<Image source={PRODUCT_IMAGES[product.image]} />
```

---

## 📸 Проблема 4: ERR_SSL_PROTOCOL_ERROR при загрузке аватарок

### Симптомы:
- Ошибка SSL при загрузке файлов в браузере
- "Failed to fetch" при отправке изображений
- Работает на телефоне, но не в браузере

### Причина:
- Антивирус (Kaspersky/ESET) блокирует отправку бинарных данных на localhost
- Конфликт между полифилом fetch и браузером
- Проблемы с FormData в React Native Web

### Решение:

#### Использовать Base64 вместо загрузки файлов
```typescript
const uploadAvatar = async () => {
  // 1. Получаем изображение как Base64
  const result = await ImagePicker.launchImageLibraryAsync({
    base64: true, // ← Важно!
    quality: 0.2, // Сжимаем для экономии места
  });

  const image = result.assets[0];
  
  // 2. Создаём Data URI
  const base64Image = `data:${image.mimeType};base64,${image.base64}`;

  // 3. Сохраняем СТРОКУ в базу (не файл!)
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: base64Image }) // ← Текстовое поле
    .eq('id', user.id);
};

// При отображении:
<Image source={{ uri: profile.avatar_url }} />
// React Native понимает Data URI
```

**Преимущества**:
- Нет загрузки файлов → нет SSL ошибок
- Работает везде (веб, iOS, Android)
- Не нужен Supabase Storage

**Недостатки**:
- Строка длинная (но для аватарки 200x200 это не критично)

---

## 🗄️ Проблема 5: "invalid input syntax for type uuid: '1'"

### Симптомы:
- Ошибка при добавлении товара в избранное
- PostgreSQL ругается на тип данных

### Причина:
- В таблице `favorites` колонка `product_id` имеет тип `uuid`
- Товары в коде имеют ID `'1', '2', '3'` (не UUID)

### Решение:

#### Вариант 1: Изменить тип колонки (быстро)
```sql
-- В Supabase SQL Editor
ALTER TABLE favorites 
ALTER COLUMN product_id TYPE int8;
```

#### Вариант 2: Использовать UUID в коде (правильно)
```sql
-- Добавить товары с UUID в базу
INSERT INTO products (id, name, price, ...) VALUES
('00000000-0000-0000-0000-000000000001', 'Круассан', 189, ...),
('00000000-0000-0000-0000-000000000002', 'Синнабон', 215, ...);
```

```typescript
// В коде использовать эти UUID
const PRODUCTS: Product[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Круассан', ... },
];
```

#### Вариант 3: Загружать товары из базы (лучший)
```typescript
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*');
    setProducts(data || []);
  };
  fetchProducts();
}, []);
```

---

## 🎯 Итоговая архитектура

### Авторизация
```
User → Login → Supabase Auth → Session → AsyncStorage
                                    ↓
                              AuthContext
                                    ↓
                          Protected Routes (Tabs)
```

### Навигация
```
app/
├── _layout.tsx          ← Корневой (провайдеры + защита)
├── index.tsx            ← Welcome screen
├── (tabs)/
│   ├── _layout.tsx      ← Табы (только UI)
│   ├── home.tsx         ← Главная
│   └── ...
└── auth/
    ├── login.tsx
    └── register.tsx
```

### Данные
```
Supabase (PostgreSQL)
├── profiles (user data + avatar_url as Base64)
├── products (UUID, name, price, image_url)
├── favorites (user_id, product_id)
└── orders (user_id, status, items)
```

---

## 📋 Чек-лист восстановления

- [x] Установить `@react-native-async-storage/async-storage`
- [x] Настроить Supabase Client с AsyncStorage
- [x] Добавить состояние `loading` в AuthContext
- [x] Реализовать защиту роутов в `_layout.tsx`
- [x] Убрать избыточные редиректы из `index.tsx`
- [x] Создать словарь `PRODUCT_IMAGES`
- [x] Реализовать загрузку аватарок через Base64
- [x] Настроить RLS политики в Supabase
- [x] Добавить товары в базу данных
- [x] Протестировать авторизацию
- [x] Протестировать навигацию
- [x] Протестировать корзину и избранное

---

## 🚀 Результат

Все проблемы из истории Google Gemini решены.  
Проект полностью восстановлен и готов к работе.

**Дата**: 3 декабря 2025  
**Статус**: ✅ Все работает
