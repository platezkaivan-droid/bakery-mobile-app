-- ============================================
-- ДОБАВЛЕНИЕ ПЕРЕВОДОВ ТОВАРОВ В БД
-- ============================================
-- Добавляем колонки для переводов названий и описаний товаров

-- Шаг 1: Добавляем колонки для английского языка
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Шаг 2: Добавляем колонки для казахского языка
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_kz TEXT,
ADD COLUMN IF NOT EXISTS description_kz TEXT;

-- Шаг 3: Добавляем колонки для татарского языка
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_tt TEXT,
ADD COLUMN IF NOT EXISTS description_tt TEXT;

-- Шаг 4: Добавляем колонки для узбекского языка
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_uz TEXT,
ADD COLUMN IF NOT EXISTS description_uz TEXT;

-- Шаг 5: Добавляем колонки для армянского языка
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_hy TEXT,
ADD COLUMN IF NOT EXISTS description_hy TEXT;

-- Проверяем структуру таблицы
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- ============================================
-- ПРИМЕРЫ ЗАПОЛНЕНИЯ ПЕРЕВОДОВ
-- ============================================

-- Круассан с шоколадом
UPDATE products SET 
  name_en = 'Chocolate Croissant',
  description_en = 'Tender puff pastry with Belgian chocolate',
  name_kz = 'Шоколадты круассан',
  description_kz = 'Бельгия шоколады бар нәзік қабатты қамыр'
WHERE name LIKE '%руассан%шоколад%';

-- Синнабон
UPDATE products SET 
  name_en = 'Classic Cinnabon',
  description_en = 'Fluffy cinnamon roll with cream cheese frosting',
  name_kz = 'Классикалық синнабон',
  description_kz = 'Кілегей кремі бар дәрілі орам'
WHERE name LIKE '%иннабон%';

-- Эклер
UPDATE products SET 
  name_en = 'Cream Eclair',
  description_en = 'Airy choux pastry with vanilla cream',
  name_kz = 'Кремді эклер',
  description_kz = 'Ваниль кремі бар ауа қамыры'
WHERE name LIKE '%клер%';

-- Штрудель
UPDATE products SET 
  name_en = 'Apple Strudel',
  description_en = 'Puff pastry with apples and cinnamon',
  name_kz = 'Алма штруделі',
  description_kz = 'Алма мен дәрі бар қабатты қамыр'
WHERE name LIKE '%трудель%';

-- Крем-брюле
UPDATE products SET 
  name_en = 'Creme Brulee',
  description_en = 'French dessert with caramel crust',
  name_kz = 'Крем-брюле',
  description_kz = 'Карамель қабығы бар француз десерті'
WHERE name LIKE '%рем%брюле%';

-- Медовик
UPDATE products SET 
  name_en = 'Honey Cake',
  description_en = 'Tender honey layers with sour cream',
  name_kz = 'Бал торты',
  description_kz = 'Қаймақ кремі бар нәзік бал қабаттары'
WHERE name LIKE '%едовик%';

-- Наполеон
UPDATE products SET 
  name_en = 'Napoleon Cake',
  description_en = 'Multi-layered cake with custard cream',
  name_kz = 'Наполеон торты',
  description_kz = 'Заварлы кремі бар көп қабатты торт'
WHERE name LIKE '%аполеон%';

-- Чизкейк
UPDATE products SET 
  name_en = 'New York Cheesecake',
  description_en = 'Classic American cheesecake',
  name_kz = 'Нью-Йорк чизкейгі',
  description_kz = 'Классикалық американдық чизкейк'
WHERE name LIKE '%изкейк%';

-- Тирамису
UPDATE products SET 
  name_en = 'Tiramisu',
  description_en = 'Italian dessert with coffee and mascarpone',
  name_kz = 'Тирамису',
  description_kz = 'Кофе мен маскарпоне бар итальян десерті'
WHERE name LIKE '%ирамису%';

-- Макаронс
UPDATE products SET 
  name_en = 'Macarons Assorted',
  description_en = 'Set of 6 French macarons',
  name_kz = 'Макаронс ассорті',
  description_kz = '6 француз макаронының жиынтығы'
WHERE name LIKE '%акарон%';

-- Багет
UPDATE products SET 
  name_en = 'French Baguette',
  description_en = 'Crispy crust, soft crumb',
  name_kz = 'Француз багеті',
  description_kz = 'Қытырлақ қабық, жұмсақ ішек'
WHERE name LIKE '%агет%';

-- Чиабатта
UPDATE products SET 
  name_en = 'Ciabatta',
  description_en = 'Italian bread with olive oil',
  name_kz = 'Чиабатта',
  description_kz = 'Зәйтүн майы бар итальян нан'
WHERE name LIKE '%иабатта%';

-- Проверяем результат
SELECT 
  name as name_ru,
  name_en,
  name_kz,
  description as description_ru,
  description_en,
  description_kz
FROM products
WHERE name_en IS NOT NULL
ORDER BY name;

-- Показываем товары без переводов
SELECT id, name, description
FROM products
WHERE name_en IS NULL OR name_en = ''
ORDER BY name;
