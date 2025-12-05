@echo off
cd /d "%~dp0"
echo Установка зависимостей...
echo Текущая директория: %CD%
echo.
call npm install
echo.
echo Готово!
pause
