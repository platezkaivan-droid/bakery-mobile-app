-- ============================================
-- ПОЛНЫЕ ПЕРЕВОДЫ ВСЕХ ТОВАРОВ НА ВСЕ ЯЗЫКИ
-- ============================================
-- Этот скрипт добавляет переводы для всех 24 товаров
-- на 5 языков: English, Қазақша, Татарча, O'zbek, Հայերեն

-- Шаг 1: Добавляем колонки (если их еще нет)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS name_kz TEXT,
ADD COLUMN IF NOT EXISTS description_kz TEXT,
ADD COLUMN IF NOT EXISTS name_tt TEXT,
ADD COLUMN IF NOT EXISTS description_tt TEXT,
ADD COLUMN IF NOT EXISTS name_uz TEXT,
ADD COLUMN IF NOT EXISTS description_uz TEXT,
ADD COLUMN IF NOT EXISTS name_hy TEXT,
ADD COLUMN IF NOT EXISTS description_hy TEXT;

-- ============================================
-- ВЫПЕЧКА (Bakery / Наубайхана)
-- ============================================

-- 1. Круассан с шоколадом
UPDATE products SET 
  name_en = 'Chocolate Croissant',
  description_en = 'Tender puff pastry with Belgian chocolate',
  name_kz = 'Шоколадты круассан',
  description_kz = 'Бельгия шоколады бар нәзік қабатты қамыр',
  name_tt = 'Шоколадлы круассан',
  description_tt = 'Бельгия шоколады белән нәзек катламалы камыр',
  name_uz = 'Shokoladli kruassan',
  description_uz = 'Belgiya shokoladi bilan yumshoq qatlamli xamir',
  name_hy = 'Շոկոլադե կրուասան',
  description_hy = 'Բելգիական շոկոլադով նուրբ թերթավոր խմոր'
WHERE name LIKE '%руассан%шоколад%';

-- 2. Синнабон классический
UPDATE products SET 
  name_en = 'Classic Cinnabon',
  description_en = 'Fluffy cinnamon roll with cream cheese frosting',
  name_kz = 'Классикалық синнабон',
  description_kz = 'Кілегей кремі бар дәрілі орам',
  name_tt = 'Классик синнабон',
  description_tt = 'Кремлы дарчин орамы',
  name_uz = 'Klassik sinnabon',
  description_uz = 'Kremli doljin ruleti',
  name_hy = 'Կլասիկ սինաբոն',
  description_hy = 'Կրեմով դարչինի ռուլետ'
WHERE name LIKE '%иннабон%';

-- 3. Круассан с миндалём
UPDATE products SET 
  name_en = 'Almond Croissant',
  description_en = 'Crispy croissant with almond cream',
  name_kz = 'Бадамды круассан',
  description_kz = 'Бадам кремі бар қытырлақ круассан',
  name_tt = 'Бадамлы круассан',
  description_tt = 'Бадам кремы белән хрустящий круассан',
  name_uz = 'Bodomli kruassan',
  description_uz = 'Bodom kremi bilan qarsildoq kruassan',
  name_hy = 'Նուշով կրուասան',
  description_hy = 'Նշային կրեմով խրթխրթան կրուասան'
WHERE name LIKE '%руассан%миндал%';

-- 4. Датская булочка
UPDATE products SET 
  name_en = 'Danish Pastry',
  description_en = 'Puff pastry with custard cream and berries',
  name_kz = 'Дат тоқашы',
  description_kz = 'Заварлы крем және жидектері бар қабатты тоқаш',
  name_tt = 'Дания булкасы',
  description_tt = 'Заварлы крем һәм җиләкләр белән катламалы булка',
  name_uz = 'Daniya bulkasi',
  description_uz = 'Zavarli krem va rezavorlar bilan qatlamli bulka',
  name_hy = 'Դանիական բուլկի',
  description_hy = 'Թերթավոր խմոր կաստարդով և հատապտուղներով'
WHERE name LIKE '%атская%булочка%';

-- 5. Пончик глазированный
UPDATE products SET 
  name_en = 'Glazed Donut',
  description_en = 'Fluffy donut with chocolate glaze',
  name_kz = 'Глазурьланған пончик',
  description_kz = 'Шоколад глазурьі бар ауа пончик',
  name_tt = 'Глазурьлы пончик',
  description_tt = 'Шоколад глазуре белән һавалы пончик',
  name_uz = 'Glazurli ponchik',
  description_uz = 'Shokolad glazuri bilan havo ponchik',
  name_hy = 'Գլազուրապատ պոնչիկ',
  description_hy = 'Շոկոլադե գլազուրով օդային պոնչիկ'
WHERE name LIKE '%ончик%';

-- 6. Булочка с корицей
UPDATE products SET 
  name_en = 'Cinnamon Bun',
  description_en = 'Aromatic bun with cinnamon and raisins',
  name_kz = 'Дәрілі тоқаш',
  description_kz = 'Дәрі және кішміш бар хош иісті тоқаш',
  name_tt = 'Дарчинлы булка',
  description_tt = 'Дарчин һәм җөзем белән ис булка',
  name_uz = 'Doljinli bulka',
  description_uz = 'Doljin va mayiz bilan xushbo''y bulka',
  name_hy = 'Դարչինով բուլկի',
  description_hy = 'Դարչինով և չամիչով բուրավետ բուլկի'
WHERE name LIKE '%улочка%кориц%';

-- ============================================
-- ТОРТЫ (Cakes / Торттар)
-- ============================================

-- 7. Наполеон классический
UPDATE products SET 
  name_en = 'Napoleon Cake',
  description_en = 'Multi-layered cake with custard cream',
  name_kz = 'Классикалық Наполеон',
  description_kz = 'Заварлы кремі бар көп қабатты торт',
  name_tt = 'Классик Наполеон',
  description_tt = 'Заварлы крем белән күп катламалы торт',
  name_uz = 'Klassik Napoleon',
  description_uz = 'Zavarli krem bilan ko''p qatlamli tort',
  name_hy = 'Կլասիկ Նապոլեոն',
  description_hy = 'Կաստարդով բազմաշերտ տորթ'
WHERE name LIKE '%аполеон%';

-- 8. Медовик
UPDATE products SET 
  name_en = 'Honey Cake',
  description_en = 'Tender honey layers with sour cream',
  name_kz = 'Бал торты',
  description_kz = 'Қаймақ кремі бар нәзік бал қабаттары',
  name_tt = 'Бал торты',
  description_tt = 'Каймак кремы белән нәзек бал катламнары',
  name_uz = 'Asal torti',
  description_uz = 'Qaymoq kremi bilan yumshoq asal qatlamlari',
  name_hy = 'Մեղրով տորթ',
  description_hy = 'Թթվասերով նուրբ մեղրային շերտեր'
WHERE name LIKE '%едовик%';

-- 9. Красный бархат
UPDATE products SET 
  name_en = 'Red Velvet',
  description_en = 'Sponge cake with mascarpone cream',
  name_kz = 'Қызыл бархат',
  description_kz = 'Маскарпоне кремі бар бисквит',
  name_tt = 'Кызыл бархат',
  description_tt = 'Маскарпоне кремы белән бисквит',
  name_uz = 'Qizil baxmal',
  description_uz = 'Maskarpone kremi bilan biskvit',
  name_hy = 'Կարմիր թավշ',
  description_hy = 'Մասկարպոնեով բիսկվիտ'
WHERE name LIKE '%расный%бархат%';

-- 10. Чизкейк Нью-Йорк
UPDATE products SET 
  name_en = 'New York Cheesecake',
  description_en = 'Classic American cheesecake',
  name_kz = 'Нью-Йорк чизкейгі',
  description_kz = 'Классикалық американдық чизкейк',
  name_tt = 'Нью-Йорк чизкейгы',
  description_tt = 'Классик америка чизкейгы',
  name_uz = 'Nyu-York chizkeygi',
  description_uz = 'Klassik amerika chizkeyki',
  name_hy = 'Նյու Յորք չիզքեյք',
  description_hy = 'Կլասիկ ամերիկյան չիզքեյք'
WHERE name LIKE '%изкейк%';

-- 11. Шоколадный торт
UPDATE products SET 
  name_en = 'Chocolate Cake',
  description_en = 'Rich chocolate sponge with ganache',
  name_kz = 'Шоколад торты',
  description_kz = 'Ганашпен қанық шоколад бисквиті',
  name_tt = 'Шоколад торты',
  description_tt = 'Ганаш белән туйган шоколад бисквиты',
  name_uz = 'Shokolad torti',
  description_uz = 'Ganash bilan to''yingan shokolad biski',
  name_hy = 'Շոկոլադե տորթ',
  description_hy = 'Գանաշով հագեցած շոկոլադե բիսկվիտ'
WHERE name LIKE '%околадный%торт%';

-- ============================================
-- ПИРОЖНЫЕ (Pastries / Пирожныйлар)
-- ============================================

-- 12. Эклер с кремом
UPDATE products SET 
  name_en = 'Cream Eclair',
  description_en = 'Airy choux pastry with vanilla cream',
  name_kz = 'Кремді эклер',
  description_kz = 'Ваниль кремі бар ауа қамыры',
  name_tt = 'Кремлы эклер',
  description_tt = 'Ваниль кремы белән һавалы камыр',
  name_uz = 'Kremli ekler',
  description_uz = 'Vanil kremi bilan havo xamiri',
  name_hy = 'Կրեմով էկլեր',
  description_hy = 'Վանիլային կրեմով օդային խմոր'
WHERE name LIKE '%клер%';

-- 13. Макаронс ассорти
UPDATE products SET 
  name_en = 'Macarons Assorted',
  description_en = 'Set of 6 French macarons',
  name_kz = 'Макаронс ассорті',
  description_kz = '6 француз макаронының жиынтығы',
  name_tt = 'Макаронс ассорти',
  description_tt = '6 француз макаронының җыелмасы',
  name_uz = 'Makarons assortimenti',
  description_uz = '6 ta fransuz makaronlari to''plami',
  name_hy = 'Մակարոն տեսականի',
  description_hy = '6 ֆրանսիական մակարոնների հավաքածու'
WHERE name LIKE '%акарон%';

-- 14. Тирамису
UPDATE products SET 
  name_en = 'Tiramisu',
  description_en = 'Italian dessert with coffee and mascarpone',
  name_kz = 'Тирамису',
  description_kz = 'Кофе және маскарпоне бар итальян десерті',
  name_tt = 'Тирамису',
  description_tt = 'Кофе һәм маскарпоне белән итальян десерты',
  name_uz = 'Tiramisu',
  description_uz = 'Kofe va maskarpone bilan italyan deserti',
  name_hy = 'Տիրամիսու',
  description_hy = 'Սուրճով և մասկարպոնեով իտալական դեսերտ'
WHERE name LIKE '%ирамису%';

-- 15. Профитроли
UPDATE products SET 
  name_en = 'Profiteroles',
  description_en = 'Choux balls with cream and chocolate',
  name_kz = 'Профитроль',
  description_kz = 'Крем және шоколад бар заварлы шарлар',
  name_tt = 'Профитроль',
  description_tt = 'Крем һәм шоколад белән заварлы шарлар',
  name_uz = 'Profitrol',
  description_uz = 'Krem va shokolad bilan zavarli sharlar',
  name_hy = 'Պրոֆիտրոլ',
  description_hy = 'Կրեմով և շոկոլադով խմորագնդիկներ'
WHERE name LIKE '%рофитрол%';

-- 16. Капкейк шоколадный
UPDATE products SET 
  name_en = 'Chocolate Cupcake',
  description_en = 'Mini cake with chocolate cream',
  name_kz = 'Шоколад капкейгі',
  description_kz = 'Шоколад кремі бар мини-торт',
  name_tt = 'Шоколад капкейгы',
  description_tt = 'Шоколад кремы белән мини-торт',
  name_uz = 'Shokolad kapkeygi',
  description_uz = 'Shokolad kremi bilan mini-tort',
  name_hy = 'Շոկոլադե քափքեյք',
  description_hy = 'Շոկոլադե կրեմով մինի տորթ'
WHERE name LIKE '%апкейк%';

-- ============================================
-- ХЛЕБ (Bread / Нан)
-- ============================================

-- 17. Багет французский
UPDATE products SET 
  name_en = 'French Baguette',
  description_en = 'Crispy crust, soft crumb',
  name_kz = 'Француз багеті',
  description_kz = 'Қытырлақ қабық, жұмсақ ішек',
  name_tt = 'Француз багеты',
  description_tt = 'Хрустящий кабык, йомшак эчтәлек',
  name_uz = 'Fransuz bageti',
  description_uz = 'Qarsildoq qobiq, yumshoq ichki',
  name_hy = 'Ֆրանսիական բագետ',
  description_hy = 'Խրթխրթան կեղև, փափուկ միջուկ'
WHERE name LIKE '%агет%';

-- 18. Чиабатта
UPDATE products SET 
  name_en = 'Ciabatta',
  description_en = 'Italian bread with olive oil',
  name_kz = 'Чиабатта',
  description_kz = 'Зәйтүн майы бар итальян нан',
  name_tt = 'Чиабатта',
  description_tt = 'Зәйтүн мае белән итальян икмәге',
  name_uz = 'Chiabatta',
  description_uz = 'Zaytun moyi bilan italyan noni',
  name_hy = 'Չիաբատտա',
  description_hy = 'Ձիթապտղի յուղով իտալական հաց'
WHERE name LIKE '%иабатта%';

-- 19. Хлеб ржаной
UPDATE products SET 
  name_en = 'Rye Bread',
  description_en = 'Rye bread with coriander',
  name_kz = 'Қара нан',
  description_kz = 'Кинза бар қара нан',
  name_tt = 'Арыш икмәге',
  description_tt = 'Кинза белән арыш икмәге',
  name_uz = 'Javdar noni',
  description_uz = 'Kinza bilan javdar noni',
  name_hy = 'Տարեկանի հաց',
  description_hy = 'Տարեկանի հաց հաղարդով'
WHERE name LIKE '%жаной%хлеб%' OR name LIKE '%Хлеб%жан%';

-- 20. Фокачча с розмарином
UPDATE products SET 
  name_en = 'Rosemary Focaccia',
  description_en = 'Italian flatbread with herbs',
  name_kz = 'Розмаринді фокачча',
  description_kz = 'Шөптермен итальян жалпақ нан',
  name_tt = 'Розмаринлы фокачча',
  description_tt = 'Үләннәр белән итальян ябык икмәк',
  name_uz = 'Rozmarin fokachcha',
  description_uz = 'O''tlar bilan italyan yassi non',
  name_hy = 'Ռոզմարինով ֆոկաչչա',
  description_hy = 'Խոտաբույսերով իտալական հարթ հաց'
WHERE name LIKE '%окачч%';

-- ============================================
-- ДЕСЕРТЫ (Desserts / Десерттер)
-- ============================================

-- 21. Тарт с ягодами
UPDATE products SET 
  name_en = 'Berry Tart',
  description_en = 'Shortcrust pastry with fresh berries',
  name_kz = 'Жидекті тарт',
  description_kz = 'Жаңа жидектері бар құмды қамыр',
  name_tt = 'Җиләкле тарт',
  description_tt = 'Яңа җиләкләр белән комлы камыр',
  name_uz = 'Rezavorli tart',
  description_uz = 'Yangi rezavorlar bilan qumli xamir',
  name_hy = 'Հատապտուղների տարտ',
  description_hy = 'Թարմ հատապտուղներով կարճ խմոր'
WHERE name LIKE '%арт%ягод%';

-- 22. Панна котта
UPDATE products SET 
  name_en = 'Panna Cotta',
  description_en = 'Italian cream dessert',
  name_kz = 'Панна котта',
  description_kz = 'Итальян кілегей десерті',
  name_tt = 'Панна котта',
  description_tt = 'Итальян кремлы десерт',
  name_uz = 'Panna kotta',
  description_uz = 'Italyan kremli desert',
  name_hy = 'Պաննա կոտտա',
  description_hy = 'Իտալական կրեմային դեսերտ'
WHERE name LIKE '%анна%котта%';

-- 23. Крем-брюле
UPDATE products SET 
  name_en = 'Creme Brulee',
  description_en = 'French dessert with caramel crust',
  name_kz = 'Крем-брюле',
  description_kz = 'Карамель қабығы бар француз десерті',
  name_tt = 'Крем-брюле',
  description_tt = 'Карамель кабыгы белән француз десерты',
  name_uz = 'Krem-bryule',
  description_uz = 'Karamel qobig''i bilan fransuz deserti',
  name_hy = 'Կրեմ-բրյուլե',
  description_hy = 'Կարամելային կեղևով ֆրանսիական դեսերտ'
WHERE name LIKE '%рем%брюле%';

-- 24. Штрудель яблочный
UPDATE products SET 
  name_en = 'Apple Strudel',
  description_en = 'Puff pastry with apples and cinnamon',
  name_kz = 'Алма штруделі',
  description_kz = 'Алма және дәрі бар қабатты қамыр',
  name_tt = 'Алма штруделе',
  description_tt = 'Алма һәм дарчин белән катламалы камыр',
  name_uz = 'Olma shtrudeli',
  description_uz = 'Olma va doljin bilan qatlamli xamir',
  name_hy = 'Խնձորով շտրուդել',
  description_hy = 'Խնձորով և դարչինով թերթավոր խմոր'
WHERE name LIKE '%трудель%';

-- ============================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================

-- Показываем все товары с переводами
SELECT 
  name as name_ru,
  name_en,
  name_kz,
  name_tt,
  name_uz,
  name_hy
FROM products
ORDER BY name;

-- Проверяем есть ли товары без переводов
SELECT 
  id, 
  name,
  CASE 
    WHEN name_en IS NULL OR name_en = '' THEN '❌ Нет EN'
    ELSE '✅ EN OK'
  END as status_en,
  CASE 
    WHEN name_kz IS NULL OR name_kz = '' THEN '❌ Нет KZ'
    ELSE '✅ KZ OK'
  END as status_kz
FROM products
ORDER BY name;
