-- ============================================
-- ПОЛНОЕ ЗАПОЛНЕНИЕ ПЕРЕВОДОВ ВСЕХ ТОВАРОВ
-- ============================================
-- Выполните этот скрипт в Supabase SQL Editor
-- Это заполнит переводы для всех 24 товаров

-- 1. Круассан с шоколадом
UPDATE products SET 
  name_en = 'Chocolate Croissant',
  name_kz = 'Шоколадты круассан',
  name_tt = 'Шоколадлы круассан',
  name_uz = 'Shokoladli kruassan',
  name_hy = 'Շոկոլադե կրուասան',
  description_en = 'Tender puff pastry with Belgian chocolate',
  description_kz = 'Бельгиялық шоколадты нәзік қабатты қамыр',
  description_tt = 'Бельгия шоколады белән нәзек катламалы камыр',
  description_uz = 'Belgiya shokoladi bilan yumshoq qatlamli xamir',
  description_hy = 'Նուրբ շերտավոր խմոր բելգիական շոկոլադով'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 2. Синнабон классический
UPDATE products SET 
  name_en = 'Classic Cinnamon Roll',
  name_kz = 'Классикалық дарқұрама бұлкасы',
  name_tt = 'Классик дарчин булкасы',
  name_uz = 'Klassik doljin bulkasi',
  name_hy = 'Դասական դարչնով բուլկա',
  description_en = 'Fluffy cinnamon roll with cream cheese frosting',
  description_kz = 'Кілегей кремі бар дарқұрама бұлкасы',
  description_tt = 'Кремлы дарчин булкасы',
  description_uz = 'Kremli doljin bulkasi',
  description_hy = 'Փափուկ դարչնով բուլկա կրեմով'
WHERE id = '00000000-0000-0000-0000-000000000002';

-- 3. Круассан с миндалём
UPDATE products SET 
  name_en = 'Almond Croissant',
  name_kz = 'Бадамды круассан',
  name_tt = 'Бадам круассаны',
  name_uz = 'Bodomli kruassan',
  name_hy = 'Նուշով կրուասան',
  description_en = 'Crispy croissant with almond cream',
  description_kz = 'Бадам кремі бар қытырлақ круассан',
  description_tt = 'Бадам кремы белән хрустящий круассан',
  description_uz = 'Bodom kremi bilan qarsildoq kruassan',
  description_hy = 'Խրթխրթան կրուասան նշային կրեմով'
WHERE id = '00000000-0000-0000-0000-000000000003';

-- 4. Датская булочка
UPDATE products SET 
  name_en = 'Danish Pastry',
  name_kz = 'Дат тоқашы',
  name_tt = 'Дания булкасы',
  name_uz = 'Daniya bulkasi',
  name_hy = 'Դանիական բուլկա',
  description_en = 'Layered pastry with custard and berries',
  description_kz = 'Заварлы крем және жидектері бар қабатты тоқаш',
  description_tt = 'Крем һәм җиләкләр белән катламалы булка',
  description_uz = 'Krem va rezavorlar bilan qatlamli bulka',
  description_hy = 'Շերտավոր բուլկա կրեմով և հատապտուղներով'
WHERE id = '00000000-0000-0000-0000-000000000004';

-- 5. Пончик глазированный
UPDATE products SET 
  name_en = 'Glazed Donut',
  name_kz = 'Глазурьланған пончик',
  name_tt = 'Глазурьлы пончик',
  name_uz = 'Glazurli ponchik',
  name_hy = 'Գլազուրապատ պոնչիկ',
  description_en = 'Fluffy donut with chocolate glaze',
  description_kz = 'Шоколад глазурьмен әуе пончик',
  description_tt = 'Шоколад глазурь белән һава пончик',
  description_uz = 'Shokolad glazur bilan havo ponchik',
  description_hy = 'Օդային պոնչիկ շոկոլադե գլազուրով'
WHERE id = '00000000-0000-0000-0000-000000000005';

-- 6. Булочка с корицей
UPDATE products SET 
  name_en = 'Cinnamon Bun',
  name_kz = 'Дарқұрама бұлкасы',
  name_tt = 'Дарчин булкасы',
  name_uz = 'Doljinli bulka',
  name_hy = 'Դարչնով բուլկա',
  description_en = 'Aromatic bun with cinnamon and raisins',
  description_kz = 'Дарқұрама және кішміш бар хош иісті бұлка',
  description_tt = 'Дарчин һәм җөзем белән исле булка',
  description_uz = 'Doljin va mayiz bilan xushbo''y bulka',
  description_hy = 'Բուրավետ բուլկա դարչնով և չամիչով'
WHERE id = '00000000-0000-0000-0000-000000000006';

-- 7. Наполеон классический
UPDATE products SET 
  name_en = 'Napoleon Cake',
  name_kz = 'Классикалық Наполеон',
  name_tt = 'Классик Наполеон',
  name_uz = 'Klassik Napoleon',
  name_hy = 'Դասական Նապոլեոն',
  description_en = 'Multi-layered cake with custard cream',
  description_kz = 'Заварлы кремі бар көп қабатты торт',
  description_tt = 'Заварлы крем белән күп катламалы торт',
  description_uz = 'Zavarlangan krem bilan ko''p qatlamli tort',
  description_hy = 'Բազմաշերտ տորթ կաստարդային կրեմով'
WHERE id = '00000000-0000-0000-0000-000000000007';

-- 8. Медовик
UPDATE products SET 
  name_en = 'Honey Cake',
  name_kz = 'Балды торт',
  name_tt = 'Бал торты',
  name_uz = 'Asal torti',
  name_hy = 'Մեղրով տորթ',
  description_en = 'Tender honey layers with sour cream',
  description_kz = 'Қаймақ кремі бар нәзік балды қабаттар',
  description_tt = 'Каймак кремы белән нәзек бал катламнары',
  description_uz = 'Qaymoq kremi bilan yumshoq asal qatlamlari',
  description_hy = 'Նուրբ մեղրային շերտեր թթվասերով'
WHERE id = '00000000-0000-0000-0000-000000000008';

-- 9. Красный бархат
UPDATE products SET 
  name_en = 'Red Velvet Cake',
  name_kz = 'Қызыл бархат',
  name_tt = 'Кызыл бархат',
  name_uz = 'Qizil baxmal',
  name_hy = 'Կարմիր թավշ',
  description_en = 'Sponge cake with mascarpone cream',
  description_kz = 'Маскарпоне кремі бар бисквит',
  description_tt = 'Маскарпоне кремы белән бисквит',
  description_uz = 'Maskarpone kremi bilan biskvit',
  description_hy = 'Բիսկվիտ մասկարպոնե կրեմով'
WHERE id = '00000000-0000-0000-0000-000000000009';

-- 10. Чизкейк Нью-Йорк
UPDATE products SET 
  name_en = 'New York Cheesecake',
  name_kz = 'Нью-Йорк чизкейгі',
  name_tt = 'Нью-Йорк чизкейгы',
  name_uz = 'Nyu-York chizkeyki',
  name_hy = 'Նյու Յորք չիզքեյք',
  description_en = 'Classic American cheesecake',
  description_kz = 'Классикалық американдық чизкейк',
  description_tt = 'Классик америка чизкейгы',
  description_uz = 'Klassik amerika chizkeyki',
  description_hy = 'Դասական ամերիկյան չիզքեյք'
WHERE id = '00000000-0000-0000-0000-000000000010';

-- 11. Шоколадный торт
UPDATE products SET 
  name_en = 'Chocolate Cake',
  name_kz = 'Шоколадты торт',
  name_tt = 'Шоколадлы торт',
  name_uz = 'Shokoladli tort',
  name_hy = 'Շոկոլադե տորթ',
  description_en = 'Rich chocolate sponge with ganache',
  description_kz = 'Ганаш бар қанық шоколадты бисквит',
  description_tt = 'Ганаш белән туйган шоколадлы бисквит',
  description_uz = 'Ganash bilan to''yingan shokoladli biskvit',
  description_hy = 'Հագեցած շոկոլադե բիսկվիտ գանաշով'
WHERE id = '00000000-0000-0000-0000-000000000011';

-- 12. Эклер с кремом
UPDATE products SET 
  name_en = 'Cream Eclair',
  name_kz = 'Кремді эклер',
  name_tt = 'Кремлы эклер',
  name_uz = 'Kremli ekler',
  name_hy = 'Կրեմով էկլեր',
  description_en = 'Airy choux pastry with vanilla cream',
  description_kz = 'Ванильді кремі бар әуе заварлы қамыр',
  description_tt = 'Ваниль кремы белән һава заварлы камыр',
  description_uz = 'Vanil kremi bilan havo zavarlangan xamir',
  description_hy = 'Օդային խմոր վանիլային կրեմով'
WHERE id = '00000000-0000-0000-0000-000000000012';

-- 13. Макаронс ассорти
UPDATE products SET 
  name_en = 'Macarons Assorted',
  name_kz = 'Макарон әртүрлі',
  name_tt = 'Макарон төрле',
  name_uz = 'Makaron turli xil',
  name_hy = 'Մակարոն տարբեր',
  description_en = 'Set of 6 French macarons',
  description_kz = '6 француз макаронының жинағы',
  description_tt = '6 француз макароннары җыелмасы',
  description_uz = '6 ta frantsuz makaronlari to''plami',
  description_hy = '6 ֆրանսիական մակարոնների հավաքածու'
WHERE id = '00000000-0000-0000-0000-000000000013';

-- 14. Тирамису
UPDATE products SET 
  name_en = 'Tiramisu',
  name_kz = 'Тирамису',
  name_tt = 'Тирамису',
  name_uz = 'Tiramisu',
  name_hy = 'Տիրամիսու',
  description_en = 'Italian dessert with coffee and mascarpone',
  description_kz = 'Кофе және маскарпоне бар итальян десерті',
  description_tt = 'Кофе һәм маскарпоне белән итальян десерты',
  description_uz = 'Kofe va maskarpone bilan italyan deserti',
  description_hy = 'Իտալական դեսերտ սուրճով և մասկարպոնեով'
WHERE id = '00000000-0000-0000-0000-000000000014';

-- 15. Профитроли
UPDATE products SET 
  name_en = 'Profiteroles',
  name_kz = 'Профитроль',
  name_tt = 'Профитроль',
  name_uz = 'Profitrol',
  name_hy = 'Պրոֆիտրոլ',
  description_en = 'Choux balls with cream and chocolate',
  description_kz = 'Крем және шоколад бар заварлы шарлар',
  description_tt = 'Крем һәм шоколад белән заварлы шарлар',
  description_uz = 'Krem va shokolad bilan zavarlangan sharlar',
  description_hy = 'Խմորի գնդիկներ կրեմով և շոկոլադով'
WHERE id = '00000000-0000-0000-0000-000000000015';

-- 16. Капкейк шоколадный
UPDATE products SET 
  name_en = 'Chocolate Cupcake',
  name_kz = 'Шоколадты капкейк',
  name_tt = 'Шоколадлы капкейк',
  name_uz = 'Shokoladli kapkeyk',
  name_hy = 'Շոկոլադե քափքեյք',
  description_en = 'Mini cake with chocolate cream',
  description_kz = 'Шоколадты кремі бар мини-кекс',
  description_tt = 'Шоколадлы крем белән мини-кекс',
  description_uz = 'Shokoladli krem bilan mini-keks',
  description_hy = 'Մինի տորթիկ շոկոլադե կրեմով'
WHERE id = '00000000-0000-0000-0000-000000000016';

-- 17. Багет французский
UPDATE products SET 
  name_en = 'French Baguette',
  name_kz = 'Француз багеті',
  name_tt = 'Француз багеты',
  name_uz = 'Frantsuz bageti',
  name_hy = 'Ֆրանսիական բագետ',
  description_en = 'Crispy crust, soft crumb',
  description_kz = 'Қытырлақ қабығы, жұмсақ ішкі бөлігі',
  description_tt = 'Хрустящий кабыгы, йомшак эче',
  description_uz = 'Qarsildoq qobig''i, yumshoq ichi',
  description_hy = 'Խրթխրթան կեղև, փափուկ ներսը'
WHERE id = '00000000-0000-0000-0000-000000000017';

-- 18. Чиабатта
UPDATE products SET 
  name_en = 'Ciabatta',
  name_kz = 'Чиабатта',
  name_tt = 'Чиабатта',
  name_uz = 'Chiabatta',
  name_hy = 'Չիաբատտա',
  description_en = 'Italian bread with olive oil',
  description_kz = 'Зәйтүн майы бар итальян нан',
  description_tt = 'Зәйтүн мае белән итальян икмәге',
  description_uz = 'Zaytun moyi bilan italyan noni',
  description_hy = 'Իտալական հաց ձիթապտղի յուղով'
WHERE id = '00000000-0000-0000-0000-000000000018';

-- 19. Хлеб ржаной
UPDATE products SET 
  name_en = 'Rye Bread',
  name_kz = 'Қарабидай нан',
  name_tt = 'Арыш икмәге',
  name_uz = 'Javdar noni',
  name_hy = 'Գարեջրային հաց',
  description_en = 'Rye bread with coriander',
  description_kz = 'Кинза бар қарабидай нан',
  description_tt = 'Кинза белән арыш икмәге',
  description_uz = 'Kashnich bilan javdar noni',
  description_hy = 'Գարեջրային հաց համեմունքով'
WHERE id = '00000000-0000-0000-0000-000000000019';

-- 20. Фокачча с розмарином
UPDATE products SET 
  name_en = 'Rosemary Focaccia',
  name_kz = 'Розмаринді фокачча',
  name_tt = 'Розмарин белән фокачча',
  name_uz = 'Rozmarin bilan fokachcha',
  name_hy = 'Ֆոկաչչա ռոզմարինով',
  description_en = 'Italian flatbread with herbs',
  description_kz = 'Шөптері бар итальян лепешкасы',
  description_tt = 'Үләннәр белән итальян ипие',
  description_uz = 'O''tlar bilan italyan lepyoshkasi',
  description_hy = 'Իտալական լավաշ խոտաբույսերով'
WHERE id = '00000000-0000-0000-0000-000000000020';

-- 21. Тарт с ягодами
UPDATE products SET 
  name_en = 'Berry Tart',
  name_kz = 'Жидекті тарт',
  name_tt = 'Җиләкле тарт',
  name_uz = 'Rezavorli tart',
  name_hy = 'Հատապտղային տարտ',
  description_en = 'Shortcrust pastry with fresh berries',
  description_kz = 'Жаңа жидектері бар құмды қамыр',
  description_tt = 'Яңа җиләкләр белән комлы камыр',
  description_uz = 'Yangi rezavorlar bilan qumli xamir',
  description_hy = 'Ավազային խմոր թարմ հատապտուղներով'
WHERE id = '00000000-0000-0000-0000-000000000021';

-- 22. Панна котта
UPDATE products SET 
  name_en = 'Panna Cotta',
  name_kz = 'Панна котта',
  name_tt = 'Панна котта',
  name_uz = 'Panna kotta',
  name_hy = 'Պաննա կոտտա',
  description_en = 'Italian cream dessert',
  description_kz = 'Итальян кілегей десерті',
  description_tt = 'Итальян кремлы десерт',
  description_uz = 'Italyan kremli desert',
  description_hy = 'Իտալական կրեմային դեսերտ'
WHERE id = '00000000-0000-0000-0000-000000000022';

-- 23. Крем-брюле
UPDATE products SET 
  name_en = 'Creme Brulee',
  name_kz = 'Крем-брюле',
  name_tt = 'Крем-брюле',
  name_uz = 'Krem-bryule',
  name_hy = 'Կրեմ-բրյուլե',
  description_en = 'French dessert with caramel crust',
  description_kz = 'Карамельді қабығы бар француз десерті',
  description_tt = 'Карамель кабыгы белән француз десерты',
  description_uz = 'Karamel qobig''i bilan frantsuz deserti',
  description_hy = 'Ֆրանսիական դեսերտ կարամելային կեղևով'
WHERE id = '00000000-0000-0000-0000-000000000023';

-- 24. Штрудель яблочный
UPDATE products SET 
  name_en = 'Apple Strudel',
  name_kz = 'Алмалы штрудель',
  name_tt = 'Алма штруделе',
  name_uz = 'Olma shtrudeli',
  name_hy = 'Խնձորով շտրուդել',
  description_en = 'Puff pastry with apples and cinnamon',
  description_kz = 'Алма және дарқұрама бар қабатты қамыр',
  description_tt = 'Алма һәм дарчин белән катламалы камыр',
  description_uz = 'Olma va doljin bilan qatlamli xamir',
  description_hy = 'Շերտավոր խմոր խնձորով և դարչնով'
WHERE id = '00000000-0000-0000-0000-000000000024';

-- ============================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- ============================================
-- Выполните этот запрос, чтобы убедиться, что переводы добавлены:
SELECT 
  name as "Русский",
  name_en as "English",
  name_kz as "Қазақша"
FROM products
ORDER BY name
LIMIT 10;
