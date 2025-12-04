-- Добавление колонки points_spent в таблицу orders
-- Эта колонка нужна для хранения количества потраченных бонусных баллов при оформлении заказа

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS points_spent INTEGER DEFAULT 0;

-- Проверка что колонка добавлена
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'points_spent';
