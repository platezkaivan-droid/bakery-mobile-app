# 🗄️ Настройка базы данных

## Шаг 1: Создание проекта в Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте аккаунт или войдите
3. Нажмите "New Project"
4. Заполните:
   - **Name**: bakery-app
   - **Database Password**: (придумайте надёжный пароль)
   - **Region**: выберите ближайший регион
5. Нажмите "Create new project"

## Шаг 2: Выполнение SQL скрипта

1. В панели Supabase откройте **SQL Editor** (слева в меню)
2. Нажмите "New query"
3. Скопируйте весь код из файла `supabase/schema.sql`
4. Вставьте в редактор
5. Нажмите "Run" или Ctrl+Enter

Это создаст:
- ✅ Таблицы (profiles, products, categories, favorites, orders и др.)
- ✅ Индексы для оптимизации
- ✅ RLS политики безопасности
- ✅ Триггеры для автоматизации
- ✅ Тестовые данные

## Шаг 3: Получение API ключей

1. Откройте **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **anon public** ключ

## Шаг 4: Настройка приложения

1. Откройте файл `src/lib/supabase.ts`
2. Замените значения:

```typescript
const supabaseUrl = 'ВАШ_PROJECT_URL';
const supabaseAnonKey = 'ВАШ_ANON_KEY';
```

## Шаг 5: Настройка аутентификации

1. В Supabase откройте **Authentication** → **Providers**
2. Включите **Email**:
   - ✅ Enable Email provider
   - ✅ Confirm email (опционально)
3. Настройте **Email Templates** (опционально):
   - Customize confirmation email
   - Customize reset password email

## Шаг 6: Настройка Storage (для загрузки изображений)

1. Откройте **Storage**
2. Создайте bucket с именем `products`
3. Настройте политики:
   - Public access для чтения
   - Authenticated access для загрузки

## Шаг 7: Тестирование

1. Запустите приложение: `npx expo start`
2. Зарегистрируйте тестового пользователя
3. Проверьте:
   - ✅ Регистрация работает
   - ✅ Вход работает
   - ✅ Профиль создаётся автоматически
   - ✅ Можно добавлять в избранное

## 📊 Структура базы данных

### Основные таблицы:

**profiles** - Профили пользователей
- id, email, full_name, phone
- avatar_url, bonus_points, loyalty_level

**products** - Товары
- name, description, price, old_price
- image_url, rating, reviews_count
- is_new, is_hot, discount_percent

**categories** - Категории товаров
- name, description, icon, color

**favorites** - Избранное пользователей
- user_id, product_id

**orders** - Заказы
- order_number, status, total_amount
- delivery_address, payment_method

**order_items** - Товары в заказе
- order_id, product_id, quantity, price

**reviews** - Отзывы
- user_id, product_id, rating, comment

**addresses** - Адреса доставки
- user_id, address, is_default

**bonus_history** - История бонусов
- user_id, amount, type, description

## 🔐 Безопасность (RLS)

Все таблицы защищены Row Level Security:
- Пользователи видят только свои данные
- Товары и категории доступны всем для чтения
- Изменения только через авторизованные запросы

## 🚀 Дополнительные функции

### Добавление товаров через SQL:

```sql
INSERT INTO products (category_id, name, description, price, image_url, rating)
SELECT 
  c.id,
  'Название товара',
  'Описание',
  199,
  'https://example.com/image.jpg',
  4.5
FROM categories c WHERE c.name = 'Выпечка';
```

### Проверка избранного пользователя:

```sql
SELECT p.* 
FROM favorites f
JOIN products p ON p.id = f.product_id
WHERE f.user_id = 'USER_ID';
```

### Статистика заказов:

```sql
SELECT 
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order
FROM orders
WHERE user_id = 'USER_ID';
```

## 🐛 Решение проблем

### Ошибка "relation does not exist"
- Убедитесь, что SQL скрипт выполнен полностью
- Проверьте, что используете правильную схему (public)

### Ошибка "permission denied"
- Проверьте RLS политики
- Убедитесь, что пользователь авторизован

### Не создаётся профиль
- Проверьте, что триггер `on_auth_user_created` создан
- Проверьте логи в Supabase Dashboard

## 📚 Полезные ссылки

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
