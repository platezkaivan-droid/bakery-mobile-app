-- 🔧 ИСПРАВЛЕНИЕ ДОСТУПА К ЧАТУ ДЛЯ АДМИНКИ
-- Выполни этот SQL в Supabase Dashboard → SQL Editor

-- ВАРИАНТ 1: Разрешить анонимный доступ для чтения (ПРОСТОЙ)
-- Это позволит админке видеть все сообщения без авторизации

-- Удаляем старую политику
DROP POLICY IF EXISTS "User sees their own messages" ON support_messages;

-- Создаём новую политику: все могут читать все сообщения
CREATE POLICY "Anyone can read messages" 
ON support_messages 
FOR SELECT 
USING (true);

-- Политика для вставки остаётся прежней (только свои сообщения)
-- Но добавим возможность вставлять от имени других (для админа)
DROP POLICY IF EXISTS "User can insert messages" ON support_messages;

CREATE POLICY "User can insert own messages" 
ON support_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- ГОТОВО! Теперь админка сможет видеть все сообщения

-- ============================================================
-- ВАРИАНТ 2: Создать роль админа (БЕЗОПАСНЫЙ)
-- Используй этот вариант для продакшена
-- ============================================================

/*
-- 1. Создаём таблицу ролей
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Включаем RLS для таблицы ролей
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Политика: все могут читать роли
CREATE POLICY "Anyone can read roles" 
ON user_roles 
FOR SELECT 
USING (true);

-- 4. Обновляем политики для support_messages
DROP POLICY IF EXISTS "User sees their own messages" ON support_messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON support_messages;

-- Админ видит все сообщения, пользователь только свои
CREATE POLICY "Admin or user sees messages" 
ON support_messages 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Админ может отправлять сообщения любому
DROP POLICY IF EXISTS "User can insert messages" ON support_messages;

CREATE POLICY "User or admin can insert messages" 
ON support_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- 5. Сделай себя админом (замени на свой user_id)
-- Найди свой user_id в Supabase Dashboard → Authentication → Users
INSERT INTO user_roles (user_id, is_admin)
VALUES ('ТВОЙ_USER_ID_ЗДЕСЬ', true)
ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
*/

-- ============================================================
-- ВАРИАНТ 3: Полностью отключить RLS (ТОЛЬКО ДЛЯ РАЗРАБОТКИ!)
-- ============================================================

/*
-- ВНИМАНИЕ! Это небезопасно для продакшена!
-- Используй только для тестирования

ALTER TABLE support_messages DISABLE ROW LEVEL SECURITY;
*/

-- ============================================================
-- ПРОВЕРКА
-- ============================================================

-- Проверь, что политики применились:
SELECT * FROM pg_policies WHERE tablename = 'support_messages';

-- Проверь, что есть сообщения:
SELECT COUNT(*) FROM support_messages;

-- Посмотри последние 10 сообщений:
SELECT * FROM support_messages ORDER BY created_at DESC LIMIT 10;
