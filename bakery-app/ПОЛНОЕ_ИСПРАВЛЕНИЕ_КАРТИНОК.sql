-- ============================================
-- ПОЛНОЕ ИСПРАВЛЕНИЕ КАРТИНОК В БАЗЕ ДАННЫХ
-- ============================================
-- Этот скрипт заменит все пути /products/XX.jpg на правильные ключи
-- которые соответствуют словарю PRODUCT_IMAGES в коде

-- Сначала посмотрим что есть сейчас
SELECT id, name, image_url FROM products ORDER BY name;

-- ============================================
-- ВЫПЕЧКА
-- ============================================

-- Круассан с шоколадом
UPDATE products SET image_url = 'croissant' 
WHERE name LIKE '%руассан%шоколад%' OR name LIKE '%Круассан%шоколад%';

-- Синнабон классический
UPDATE products SET image_url = 'cinnabon' 
WHERE name LIKE '%иннабон%' OR name LIKE '%Синнабон%';

-- Круассан с миндалём
UPDATE products SET image_url = 'almondCroissant' 
WHERE name LIKE '%руассан%миндал%' OR name LIKE '%Круассан%миндал%';

-- Датская булочка
UPDATE products SET image_url = 'danish' 
WHERE name LIKE '%атская%булочка%' OR name LIKE '%Датская%булочка%';

-- Пончик глазированный
UPDATE products SET image_url = 'donut' 
WHERE name LIKE '%ончик%' OR name LIKE '%Пончик%';

-- Булочка с корицей
UPDATE products SET image_url = 'cinnamonBun' 
WHERE name LIKE '%улочка%кориц%' OR name LIKE '%Булочка%кориц%';

-- ============================================
-- ТОРТЫ
-- ============================================

-- Наполеон классический
UPDATE products SET image_url = 'napoleon' 
WHERE name LIKE '%аполеон%' OR name LIKE '%Наполеон%';

-- Медовик
UPDATE products SET image_url = 'medovik' 
WHERE name LIKE '%едовик%' OR name LIKE '%Медовик%';

-- Красный бархат
UPDATE products SET image_url = 'redVelvet' 
WHERE name LIKE '%расный%бархат%' OR name LIKE '%Красный%бархат%' OR name LIKE '%Red%Velvet%';

-- Чизкейк Нью-Йорк
UPDATE products SET image_url = 'cheesecake' 
WHERE name LIKE '%изкейк%' OR name LIKE '%Чизкейк%';

-- Шоколадный торт
UPDATE products SET image_url = 'chocolateCake' 
WHERE name LIKE '%околадный%торт%' OR name LIKE '%Шоколадный%торт%';

-- ============================================
-- ПИРОЖНЫЕ
-- ============================================

-- Эклер с кремом
UPDATE products SET image_url = 'eclair' 
WHERE name LIKE '%клер%' OR name LIKE '%Эклер%';

-- Макаронс ассорти
UPDATE products SET image_url = 'macarons' 
WHERE name LIKE '%акарон%' OR name LIKE '%Макарон%';

-- Тирамису
UPDATE products SET image_url = 'tiramisu' 
WHERE name LIKE '%ирамису%' OR name LIKE '%Тирамису%';

-- Профитроли
UPDATE products SET image_url = 'profiterole' 
WHERE name LIKE '%рофитрол%' OR name LIKE '%Профитрол%';

-- Капкейк шоколадный
UPDATE products SET image_url = 'cupcake' 
WHERE name LIKE '%апкейк%' OR name LIKE '%Капкейк%';

-- ============================================
-- ХЛЕБ
-- ============================================

-- Багет французский
UPDATE products SET image_url = 'baguette' 
WHERE name LIKE '%агет%' OR name LIKE '%Багет%';

-- Чиабатта
UPDATE products SET image_url = 'ciabatta' 
WHERE name LIKE '%иабатта%' OR name LIKE '%Чиабатта%';

-- Хлеб ржаной
UPDATE products SET image_url = 'ryeBread' 
WHERE name LIKE '%жаной%хлеб%' OR name LIKE '%Ржаной%хлеб%' OR name LIKE '%Хлеб%жан%';

-- Фокачча с розмарином
UPDATE products SET image_url = 'focaccia' 
WHERE name LIKE '%окачч%' OR name LIKE '%Фокачч%';

-- ============================================
-- ДЕСЕРТЫ
-- ============================================

-- Тарт с ягодами
UPDATE products SET image_url = 'berryTart' 
WHERE name LIKE '%арт%ягод%' OR name LIKE '%Тарт%ягод%';

-- Панна котта
UPDATE products SET image_url = 'pannaCotta' 
WHERE name LIKE '%анна%котта%' OR name LIKE '%Панна%котта%';

-- Крем-брюле
UPDATE products SET image_url = 'cremeBrulee' 
WHERE name LIKE '%рем%брюле%' OR name LIKE '%Крем%брюле%';

-- Штрудель яблочный
UPDATE products SET image_url = 'strudel' 
WHERE name LIKE '%трудель%' OR name LIKE '%Штрудель%';

-- ============================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Смотрим что получилось
SELECT id, name, image_url FROM products ORDER BY name;

-- Проверяем есть ли товары без картинок или со старыми путями
SELECT id, name, image_url FROM products 
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url LIKE '/products/%'
   OR image_url LIKE '%/%';

-- Если нашлись товары со старыми путями - показываем их
SELECT 
  id, 
  name, 
  image_url as old_path,
  CASE 
    WHEN name LIKE '%руассан%шоколад%' THEN 'croissant'
    WHEN name LIKE '%иннабон%' THEN 'cinnabon'
    WHEN name LIKE '%клер%' THEN 'eclair'
    WHEN name LIKE '%трудель%' THEN 'strudel'
    WHEN name LIKE '%рем%брюле%' THEN 'cremeBrulee'
    ELSE 'NEED_MANUAL_FIX'
  END as should_be
FROM products 
WHERE image_url LIKE '/products/%' OR image_url LIKE '%/%';
