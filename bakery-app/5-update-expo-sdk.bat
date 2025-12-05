@echo off
cd /d "%~dp0"
echo ========================================
echo Обновление Expo SDK до версии 51
echo ========================================
echo Текущая директория: %CD%
echo.

echo Это обновит Expo и все зависимости до последних совместимых версий
echo.
pause

echo Обновление Expo...
call npx expo install expo@latest

echo.
echo Обновление всех зависимостей...
call npx expo install --fix

echo.
echo Готово! Теперь запусти 3-prebuild.bat
pause
