@echo off
cd /d "%~dp0"
echo Очистка Gradle кэша...
echo Текущая директория: %CD%
echo.
cd android
call gradlew.bat clean
cd ..
echo.
echo Готово!
pause
