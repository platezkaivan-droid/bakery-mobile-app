@echo off
cd /d "%~dp0"

echo ========================================
echo Исправление Gradle Expo Modules
echo ========================================
echo Текущая директория: %CD%
echo.

echo Шаг 1: Установка зависимостей...
call npm install
if errorlevel 1 (
    echo ОШИБКА при установке зависимостей!
    pause
    exit /b 1
)

echo.
echo Шаг 2: Очистка Android кэша...
cd android
call gradlew.bat clean
cd ..

echo.
echo Шаг 3: Очистка Expo кэша...
call npx expo prebuild --clean

echo.
echo Шаг 4: Попытка сборки...
cd android
call gradlew.bat assembleRelease
cd ..

echo.
echo ========================================
echo Готово! Проверь результат выше
echo ========================================
pause
