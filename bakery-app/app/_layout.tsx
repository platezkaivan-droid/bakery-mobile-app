import { Slot, useRouter, useSegments, useRootNavigationState, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { DemoBonusProvider } from '../src/context/DemoBonusContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { supabase } from '../src/lib/supabase';

// Запрос разрешения на уведомления
async function requestNotificationPermission() {
  try {
    // Проверяем, запрашивали ли уже
    const asked = await AsyncStorage.getItem('notification_permission_asked');
    if (asked === 'true') return;

    // Запрашиваем разрешение
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (__DEV__) console.log('🔔 Notification permission:', enabled ? 'granted' : 'denied');

    // Сохраняем что уже спрашивали
    await AsyncStorage.setItem('notification_permission_asked', 'true');
  } catch (error) {
    if (__DEV__) console.error('Error requesting notification permission:', error);
  }
}

// Компонент для логики навигации (внутри AuthProvider)
function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Запрашиваем разрешение на уведомления при первом запуске
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Обработка foreground уведомлений (когда приложение открыто)
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('💬 Новое сообщение (foreground):', remoteMessage);

      const title = remoteMessage.notification?.title || '';
      const body = remoteMessage.notification?.body || '';

      // Проверяем, что это сообщение от поддержки
      const isSupportMessage =
        title.toLowerCase().includes('админ') ||
        title.toLowerCase().includes('поддержка') ||
        title.toLowerCase().includes('support') ||
        remoteMessage.data?.type === 'support_chat';

      // Если мы уже в чате поддержки - не показываем уведомление
      if (pathname === '/support') {
        console.log('📍 Уже в чате, уведомление не нужно');
        return;
      }

      // Показываем уведомление только для сообщений поддержки
      if (isSupportMessage) {
        Alert.alert(
          '💬 Новое сообщение',
          'Администратор ответил вам в чате',
          [
            {
              text: 'Позже',
              style: 'cancel',
            },
            {
              text: 'Посмотреть',
              onPress: () => router.push('/support'),
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [pathname, router]);

  // Обработка Deep Links для email подтверждения
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      if (__DEV__) console.log('📱 Deep Link получен:', event.url);
      
      // Ссылка будет вида: bakery-app://auth-callback#access_token=...&refresh_token=...
      // Supabase автоматически обработает токены
      if (event.url.includes('auth-callback')) {
        if (__DEV__) console.log('✅ Email подтверждён! Обновляем сессию...');
        
        // Принудительно обновляем сессию
        await supabase.auth.startAutoRefresh();
        
        // Перенаправляем на главную
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      }
    };

    // Слушаем Deep Links когда приложение в фоне
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Проверяем Deep Link при запуске приложения
    Linking.getInitialURL().then((url) => {
      if (url) {
        if (__DEV__) console.log('📱 Приложение открыто по ссылке:', url);
        handleDeepLink({ url });
      }
    }).catch((err) => {
      if (__DEV__) console.error('Error getting initial URL:', err);
    });

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    // Ждем пока авторизация загрузится
    if (loading) {
      return;
    }

    // Ждем пока навигация будет готова
    if (!navigationState?.key) {
      if (__DEV__) console.log('Navigation not ready yet...');
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const isUnmatched = pathname === '/+not-found' || pathname === '' || pathname === '/' || !segments[0];

    if (__DEV__) console.log('🧭 Navigation:', { 
      session: !!session, 
      pathname,
      inAuthGroup, 
      inTabsGroup,
      isUnmatched,
      hasRedirected
    });

    // Предотвращаем множественные редиректы
    if (hasRedirected) return;

    // Если попали на несуществующий роут - редиректим
    if (isUnmatched) {
      setHasRedirected(true);
      if (session) {
        if (__DEV__) console.log('🏠 Unmatched -> tabs');
        router.replace('/(tabs)');
      } else {
        if (__DEV__) console.log('🔐 Unmatched -> login');
        router.replace('/auth/login');
      }
      setTimeout(() => setHasRedirected(false), 500);
      return;
    }

    // Нет сессии и мы не на логине -> иди логиниться
    if (!session && !inAuthGroup) {
      setHasRedirected(true);
      if (__DEV__) console.log('No session -> login');
      router.replace('/auth/login');
      setTimeout(() => setHasRedirected(false), 500);
    } 
    // Есть сессия но мы на экране логина -> иди в приложение
    else if (session && inAuthGroup) {
      setHasRedirected(true);
      if (__DEV__) console.log('Has session -> tabs');
      router.replace('/(tabs)');
      setTimeout(() => setHasRedirected(false), 500);
    }
  }, [session, loading, segments, navigationState, pathname, hasRedirected]);

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
