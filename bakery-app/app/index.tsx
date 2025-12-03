import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router, Link, useRootNavigationState } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/constants/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Проверяем, смонтирована ли навигация
    if (!rootNavigationState?.key) return;
    
    if (!loading && user) {
      // Если пользователь авторизован - перенаправляем на главную
      router.replace('/(tabs)/home');
    }
  }, [user, loading, rootNavigationState?.key]);

  // Пока навигация не готова, показываем загрузку
  if (!rootNavigationState?.key || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // Если не авторизован - показываем welcome screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🥐</Text>
          </View>
          <Text style={styles.appName}>Пекарня</Text>
          <Text style={styles.tagline}>Свежая выпечка каждый день</Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={{ uri: 'https://dummyimage.com/600x300/FF6B35/fff&text=Пекарня' }}
            style={styles.illustration}
            resizeMode="cover"
          />
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name="time-outline" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.featureText}>Быстрая доставка</Text>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name="star-outline" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.featureText}>Лучшее качество</Text>
          </View>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Ionicons name="gift-outline" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.featureText}>Бонусы и скидки</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Войти</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/auth/register" asChild>
            <TouchableOpacity style={styles.registerBtn}>
              <Text style={styles.registerBtnText}>Создать аккаунт</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    backgroundColor: Colors.background,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttons: {
    gap: 12,
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  registerBtn: {
    backgroundColor: Colors.surface,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  registerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accent,
  },
  guestBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
