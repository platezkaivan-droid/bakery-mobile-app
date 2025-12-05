@echo off
echo ============================================
echo УСТАНОВКА ПАКЕТОВ ДЛЯ PUSH-УВЕДОМЛЕНИЙ
echo ============================================

cd /d "%~dp0"

echo.
echo Устанавливаем expo-device и expo-application...
call npx expo install expo-device expo-application

echo.
echo ============================================
echo ГОТОВО! ✅
echo ============================================
echo.
echo Теперь нужно:
echo 1. Настроить Firebase (см. PUSH_УВЕДОМЛЕНИЯ_ИНСТРУКЦИЯ.md)
echo 2. Выполнить SQL в Supabase (НАСТРОЙКА_PUSH_БД.sql)
echo 3. Создать Edge Function (supabase-edge-function-send-push.ts)
echo.
pause
