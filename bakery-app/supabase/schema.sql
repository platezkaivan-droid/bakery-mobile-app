-- Создание таблиц для приложения булочной

-- Таблица пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bonus_points INTEGER DEFAULT 0,
  loyalty_level TEXT DEFAULT 'bronze' CHECK (loyalty_level IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица категорий
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  image_url TEXT,
  images TEXT[], -- массив дополнительных изображений
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  discount_percent INTEGER,
  calories INTEGER,
  weight INTEGER, -- вес в граммах
  ingredients TEXT,
  allergens TEXT[],
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица избранного
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Таблица адресов доставки
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, -- "Дом", "Работа" и т.д.
  address TEXT NOT NULL,
  apartment TEXT,
  entrance TEXT,
  floor TEXT,
  intercom TEXT,
  comment TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  bonus_used INTEGER DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  address_id UUID REFERENCES public.addresses(id),
  delivery_address TEXT,
  delivery_time TIMESTAMP WITH TIME ZONE,
  payment_method TEXT CHECK (payment_method IN ('card', 'cash', 'apple_pay', 'google_pay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  comment TEXT,
  courier_id UUID,
  courier_name TEXT,
  courier_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица товаров в заказе
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- Таблица промокодов
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица использования промокодов
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(promo_code_id, user_id)
);

-- Таблица истории бонусов
CREATE TABLE IF NOT EXISTS public.bonus_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- положительное для начисления, отрицательное для списания
  type TEXT CHECK (type IN ('earned', 'spent', 'expired', 'bonus')),
  description TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_rating ON public.products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS (Row Level Security) политики
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_history ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Пользователи могут видеть свой профиль" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Пользователи могут обновлять свой профиль" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политики для favorites
CREATE POLICY "Пользователи могут видеть своё избранное" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут добавлять в избранное" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять из избранного" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для addresses
CREATE POLICY "Пользователи могут видеть свои адреса" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать адреса" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои адреса" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои адреса" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для orders
CREATE POLICY "Пользователи могут видеть свои заказы" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут создавать заказы" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Политики для order_items
CREATE POLICY "Пользователи могут видеть товары своих заказов" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Политики для reviews
CREATE POLICY "Все могут видеть отзывы" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Пользователи могут создавать отзывы" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Пользователи могут обновлять свои отзывы" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Пользователи могут удалять свои отзывы" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для bonus_history
CREATE POLICY "Пользователи могут видеть свою историю бонусов" ON public.bonus_history
  FOR SELECT USING (auth.uid() = user_id);

-- Публичный доступ к категориям и товарам (чтение)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Все могут видеть категории" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Все могут видеть товары" ON public.products
  FOR SELECT USING (is_available = true);

-- Вставка тестовых данных
INSERT INTO public.categories (name, description, icon, color, sort_order) VALUES
  ('Выпечка', 'Свежая выпечка каждый день', '🥐', '#FFE4C4', 1),
  ('Торты', 'Праздничные и повседневные торты', '🎂', '#FFD1DC', 2),
  ('Пирожные', 'Изысканные пирожные', '🧁', '#E6E6FA', 3),
  ('Хлеб', 'Хлеб и батоны', '🍞', '#F5DEB3', 4),
  ('Десерты', 'Сладкие десерты', '🍰', '#FFDAB9', 5),
  ('Напитки', 'Кофе, чай и другие напитки', '☕', '#D2B48C', 6)
ON CONFLICT DO NOTHING;

-- Вставка тестовых товаров
INSERT INTO public.products (category_id, name, description, price, old_price, image_url, rating, reviews_count, is_hot, discount_percent, calories, weight) 
SELECT 
  c.id,
  'Круассан с шоколадом',
  'Нежное слоёное тесто с бельгийским шоколадом',
  189,
  249,
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  4.9,
  128,
  true,
  24,
  320,
  85
FROM public.categories c WHERE c.name = 'Выпечка'
ON CONFLICT DO NOTHING;
