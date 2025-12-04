-- ============================================
-- БЫСТРОЕ ИСПРАВЛЕНИЕ КАРТИНОК
-- ============================================
-- Простой скрипт без проверок - только UPDATE

-- ВЫПЕЧКА
UPDATE products SET image_url = 'croissant' WHERE name LIKE '%руассан%шоколад%' OR name LIKE '%Круассан%шоколад%';
UPDATE products SET image_url = 'cinnabon' WHERE name LIKE '%иннабон%' OR name LIKE '%Синнабон%';
UPDATE products SET image_url = 'almondCroissant' WHERE name LIKE '%руассан%миндал%' OR name LIKE '%Круассан%миндал%';
UPDATE products SET image_url = 'danish' WHERE name LIKE '%атская%булочка%' OR name LIKE '%Датская%булочка%';
UPDATE products SET image_url = 'donut' WHERE name LIKE '%ончик%' OR name LIKE '%Пончик%';
UPDATE products SET image_url = 'cinnamonBun' WHERE name LIKE '%улочка%кориц%' OR name LIKE '%Булочка%кориц%';

-- ТОРТЫ
UPDATE products SET image_url = 'napoleon' WHERE name LIKE '%аполеон%' OR name LIKE '%Наполеон%';
UPDATE products SET image_url = 'medovik' WHERE name LIKE '%едовик%' OR name LIKE '%Медовик%';
UPDATE products SET image_url = 'redVelvet' WHERE name LIKE '%расный%бархат%' OR name LIKE '%Красный%бархат%' OR name LIKE '%Red%Velvet%';
UPDATE products SET image_url = 'cheesecake' WHERE name LIKE '%изкейк%' OR name LIKE '%Чизкейк%';
UPDATE products SET image_url = 'chocolateCake' WHERE name LIKE '%околадный%торт%' OR name LIKE '%Шоколадный%торт%';

-- ПИРОЖНЫЕ
UPDATE products SET image_url = 'eclair' WHERE name LIKE '%клер%' OR name LIKE '%Эклер%';
UPDATE products SET image_url = 'macarons' WHERE name LIKE '%акарон%' OR name LIKE '%Макарон%';
UPDATE products SET image_url = 'tiramisu' WHERE name LIKE '%ирамису%' OR name LIKE '%Тирамису%';
UPDATE products SET image_url = 'profiterole' WHERE name LIKE '%рофитрол%' OR name LIKE '%Профитрол%';
UPDATE products SET image_url = 'cupcake' WHERE name LIKE '%апкейк%' OR name LIKE '%Капкейк%';

-- ХЛЕБ
UPDATE products SET image_url = 'baguette' WHERE name LIKE '%агет%' OR name LIKE '%Багет%';
UPDATE products SET image_url = 'ciabatta' WHERE name LIKE '%иабатта%' OR name LIKE '%Чиабатта%';
UPDATE products SET image_url = 'ryeBread' WHERE name LIKE '%жаной%хлеб%' OR name LIKE '%Ржаной%хлеб%' OR name LIKE '%Хлеб%жан%';
UPDATE products SET image_url = 'focaccia' WHERE name LIKE '%окачч%' OR name LIKE '%Фокачч%';

-- ДЕСЕРТЫ
UPDATE products SET image_url = 'berryTart' WHERE name LIKE '%арт%ягод%' OR name LIKE '%Тарт%ягод%';
UPDATE products SET image_url = 'pannaCotta' WHERE name LIKE '%анна%котта%' OR name LIKE '%Панна%котта%';
UPDATE products SET image_url = 'cremeBrulee' WHERE name LIKE '%рем%брюле%' OR name LIKE '%Крем%брюле%';
UPDATE products SET image_url = 'strudel' WHERE name LIKE '%трудель%' OR name LIKE '%Штрудель%';

-- Проверяем результат
SELECT id, name, image_url FROM products ORDER BY name;
