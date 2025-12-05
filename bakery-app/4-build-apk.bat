@echo off
cd /d "%~dp0"
echo Сборка APK...
echo Текущая директория: %CD%
echo.
cd android
call gradlew.bat assembleRelease
cd ..
echo.
echo APK будет в: android\app\build\outputs\apk\release\
echo.
pause
