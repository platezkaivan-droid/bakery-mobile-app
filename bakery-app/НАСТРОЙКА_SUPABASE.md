# Настройка Supabase для автоматического входа

## Проблема
После регистрации пользователь не входит автоматически в систему.

## Причина
По умолчанию Supabase требует подтверждение email перед входом.

## Решение

### 1. Отключить подтверждение email

1. Откройте https://supabase.com
2. Войдите в ваш проект: `qkyhwdmhkoizxjazwnti`
3. В левом меню выберите **Authentication** → **Providers**
4. Найдите провайдер **Email**
5. Нажмите на него для редактирования
6. **Снимите галочку** с опции **"Confirm email"**
7. Нажмите **Save**

### 2. Проверка настроек

После отключения подтверждения email:
- Пользователи смогут регистрироваться и сразу входить
- Не нужно будет подтверждать email
- `data.session` будет доступна сразу после регистрации

### 3. Альтернатива (если нужно подтверждение email)

Если вы хотите оставить подтверждение email, но автоматически логинить пользователя:

1. Оставьте "Confirm email" включенным
2. В коде после регистрации добавьте автоматический вход:

```typescript
const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
  // Регистрация
  const { data, error } = await supabase.auth.signUp({ 
    email: email.trim().toLowerCase(), 
    password,
    options: {
      data: { full_name: fullName, phone: phone }
    }
  });
  if (error) throw error;
  
  // Автоматический вход после регистрации
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (signInError) throw signInError;
};
```

## Текущие настройки

- **Supabase URL**: `https://qkyhwdmhkoizxjazwnti.supabase.co`
- **Anon Key**: настроен в `src/lib/supabase.ts`
- **Email подтверждение**: нужно отключить в Dashboard

## Проверка

После настройки:
1. Зарегистрируйте нового пользователя
2. После регистрации вы должны автоматически попасть на главную страницу
3. Имя пользователя должно отображаться вместо "Гость"
