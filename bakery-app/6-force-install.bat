@echo off
cd /d "%~dp0"
echo ========================================
echo Принудительная установка зависимостей
echo ========================================
echo.

echo Удаление node_modules и package-lock.json...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo Установка с --legacy-peer-deps...
call npm install --legacy-peer-deps

echo.
echo Готово! Теперь запусти 3-prebuild.bat
pause
