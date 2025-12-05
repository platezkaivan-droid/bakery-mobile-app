import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔗 Auth callback screen opened');

    // Supabase автоматически обрабатывает токены из URL
    // Просто слушаем изменение состояния авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Успешный вход! Переходим на главную...');
        
        // Небольшая задержка чтобы сессия точно сохранилась
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 500);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Токен обновлён');
        router.replace('/(tabs)/home');
      }
    });

    // Проверяем текущую сессию (если уже залогинен)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('✅ Сессия уже есть, переходим на главную');
        router.replace('/(tabs)/home');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.text}>Авторизация...</Text>
      <Text style={styles.subtext}>Подождите немного</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});
