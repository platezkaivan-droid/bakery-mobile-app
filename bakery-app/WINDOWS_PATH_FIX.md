# Решение проблемы с длинными путями Windows

## Проблема

При сборке APK возникает ошибка:
```
ninja: error: mkdir(src/main/cpp/reanimated/CMakeFiles/reanimated.dir/C_/bakery-app/bakery-mobile-app/bakery-app/node_modules/react-native-reanimated/Common): No such file or directory
```

Это происходит из-за ограничения Windows MAX_PATH = 260 символов.

## Решение 1: Переместить проект в короткий путь (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Создать короткий путь
```powershell
mkdir C:\bak
```

### Шаг 2: Переместить проект
```powershell
# Закрыть все окна редактора и терминалы
# Переместить папку
Move-Item "C:\bakery-app\bakery-mobile-app\bakery-app" "C:\bak\app"
```

### Шаг 3: Открыть проект в новом месте
```powershell
cd C:\bak\app
```

### Шаг 4: Собрать APK
```powershell
cd android
./gradlew clean assembleRelease
```

## Решение 2: Включить длинные пути в Windows (требует прав администратора)

### Вариант A: Через реестр

1. Открыть редактор реестра (Win+R → regedit)
2. Перейти к: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem`
3. Найти `LongPathsEnabled` (или создать DWORD 32-bit)
4. Установить значение `1`
5. Перезагрузить компьютер

### Вариант B: Через PowerShell (от администратора)

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Перезагрузить компьютер.

### После включения длинных путей

```powershell
cd C:\bakery-app\bakery-mobile-app\bakery-app\android
./gradlew clean assembleRelease
```

## Решение 3: Использовать subst (временное решение)

Создать виртуальный диск с коротким путем:

```powershell
# Создать диск B: указывающий на проект
subst B: "C:\bakery-app\bakery-mobile-app\bakery-app"

# Перейти на диск B:
B:
cd android
./gradlew clean assembleRelease
```

После сборки удалить виртуальный диск:
```powershell
subst B: /D
```

## Проверка результата

После успешной сборки APK будет находиться в:
```
android/app/build/outputs/apk/release/app-release.apk
```

Или с splits:
```
android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
android/app/build/outputs/apk/release/app-armeabi-v7a-release.apk
android/app/build/outputs/apk/release/app-x86-release.apk
android/app/build/outputs/apk/release/app-x86_64-release.apk
```

## Установка APK

```powershell
adb install android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

## Что было исправлено

1. ✅ Удален несуществующий импорт `../utils/notifications` из AuthContext
2. ✅ Все console.log обернуты в `__DEV__` проверки
3. ✅ Firebase package name исправлен
4. ✅ Navigation routes исправлены
5. ✅ Minification отключен для отладки
6. ✅ ProGuard правила добавлены

## Следующие шаги

После успешной сборки и установки APK:

1. Протестировать вход/регистрацию
2. Проверить навигацию
3. Проверить Firebase OAuth (Google Sign In)
4. Если все работает - добавить SHA-1 в Firebase Console (см. CRASH_FIX_PRIORITY.md)
