@echo off
echo ========================================
echo ИСПРАВЛЕНИЕ КРИТИЧЕСКИХ ОШИБОК
echo ========================================
echo.

echo Шаг 1: Установка недостающего пакета...
call npm install react-native-keyboard-controller
if %errorlevel% neq 0 (
    echo ОШИБКА при установке пакета!
    pause
    exit /b 1
)

echo.
echo Шаг 2: Чистка кэша...
call npx expo prebuild --clean
if %errorlevel% neq 0 (
    echo ОШИБКА при prebuild!
    pause
    exit /b 1
)

echo.
echo Шаг 3: Чистка Android...
cd android
call gradlew clean
cd ..

echo.
echo ========================================
echo ГОТОВО! Теперь собирай APK в Android Studio
echo ========================================
pause
