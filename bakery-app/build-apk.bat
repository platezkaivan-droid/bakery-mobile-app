@echo off
echo Starting EAS Build...
cd /d "%~dp0"
npx eas-cli build --platform android --profile preview
pause
