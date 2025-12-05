@echo off
cd /d "%~dp0"
echo Запуск Expo prebuild...
echo Текущая директория: %CD%
echo.
call npx expo prebuild --clean
echo.
echo Готово!
pause
