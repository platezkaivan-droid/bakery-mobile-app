import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Этот экран показывается для любых неизвестных роутов
// Просто редиректим на главную без проверок
export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Сразу редиректим на tabs - там уже разберутся с авторизацией
    const timer = setTimeout(() => {
      if (__DEV__) console.log('🏠 Not found: force redirect to tabs');
      router.replace('/(tabs)');
    }, 300);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B35" />
      <Text style={styles.text}>Загрузка...</Text>
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
    fontSize: 16,
    color: '#888',
  },
});
