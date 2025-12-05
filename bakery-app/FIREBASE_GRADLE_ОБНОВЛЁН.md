# ✅ Firebase Gradle обновлён!

## 🎉 Что сделано

### 1. Обновлён `android/build.gradle`
Добавлен Firebase plugin:
```gradle
classpath('com.google.gms:google-services:4.4.0')
```

### 2. Обновлён `android/app/build.gradle`
Добавлен в конец файла:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## ⚠️ Что нужно сделать ТЕБЕ

### Скачай `google-services.json`

1. В Firebase Console нажми **"Download google-services.json"**
2. Положи файл в:
```
bakery-app/bakery-mobile-app/bakery-app/android/app/google-services.json
```

**Важно:** Файл должен быть именно в папке `android/app/`, не в корне!

---

## 📁 Структура должна быть такой:

```
bakery-app/bakery-mobile-app/bakery-app/
├── android/
│   ├── app/
│   │   ├── google-services.json  ← Положи сюда!
│   │   └── build.gradle  ← Обновлён ✅
│   └── build.gradle  ← Обновлён ✅
```

---

## 🧪 Проверка

После того как положишь `google-services.json`:

1. Попробуй собрать проект:
```bash
cd bakery-app/bakery-mobile-app/bakery-app/android
./gradlew assembleDebug
```

2. Если ошибок нет - Firebase настроен! ✅

---

## 🚀 Дальше

После добавления `google-services.json`:

1. Настрой Supabase БД (см. `НАСТРОЙКА_PUSH_БД.sql`)
2. Создай Edge Function (см. `supabase-edge-function-send-push.ts`)
3. Собери новый APK

Подробности в файле: **БЫСТРЫЙ_СТАРТ_PUSH.md**

---

## ✅ Готово!

Gradle файлы обновлены. Осталось только скачать и положить `google-services.json`! 🔥
