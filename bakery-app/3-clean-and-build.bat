@echo off
echo Cleaning Android build...
cd android
call gradlew clean
cd ..

echo Running Expo prebuild...
call npx expo prebuild --clean

echo Building APK...
cd android
call gradlew assembleRelease
cd ..

echo Done! APK is in android\app\build\outputs\apk\release\
pause
