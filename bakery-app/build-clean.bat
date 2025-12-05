@echo off
echo ========================================
echo   CLEAN BUILD - Bakery App
echo ========================================
echo.
echo Clearing cache...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache cleared!
echo.
echo Starting EAS Build...
echo.
npx eas-cli build --platform android --profile preview --clear-cache
pause
