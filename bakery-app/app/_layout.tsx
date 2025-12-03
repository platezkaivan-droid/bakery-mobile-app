import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { DemoBonusProvider } from '../src/context/DemoBonusContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';

// Компонент для логики навигации (внутри AuthProvider)
function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Ждем пока авторизация загрузится
    if (loading) {
      return;
    }

    // Ждем пока навигация будет готова
    if (!navigationState?.key) {
      console.log('Navigation not ready yet...');
      return;
    }

    const inAuthGroup = segments[0] === 'auth';

    // Только редиректим если пользователь явно на неправильном экране
    if (!session && !inAuthGroup && segments.length > 0) {
      // Нет сессии и мы не на логине -> иди логиниться
      console.log('No session, redirecting to auth/login...');
      setTimeout(() => router.replace('/auth/login'), 100);
    } else if (session && inAuthGroup) {
      // Есть сессия но мы на экране логина -> иди в приложение
      console.log('Session exists, redirecting to home...');
      setTimeout(() => router.replace('/(tabs)'), 100);
    }
  }, [session, loading, segments, navigationState]);

  // Показываем загрузку только пока идет проверка авторизации
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <DemoBonusProvider>
          <FavoritesProvider>
            <CartProvider>
              <NotificationProvider>
                <InitialLayout />
              </NotificationProvider>
            </CartProvider>
          </FavoritesProvider>
        </DemoBonusProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
