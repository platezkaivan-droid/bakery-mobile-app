import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, Alert, PermissionsAndroid } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import messaging from '@react-native-firebase/messaging';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { DemoBonusProvider } from '../src/context/DemoBonusContext';
import { SettingsProvider } from '../src/context/SettingsContext';

// Предотвращаем автоматическое скрытие нативного сплэша
SplashScreen.preventAutoHideAsync().catch(() => {});

// ============================================
// ГЛОБАЛЬНАЯ НАСТРОЙКА PUSH-УВЕДОМЛЕНИЙ
// ============================================
async function requestNotificationPermission() {
  try {
    console.log('🔔 Запрос разрешения на уведомления...');
    
    // Android 13+ (API 33+) требует явного запроса разрешения POST_NOTIFICATIONS
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      console.log('📱 Android 13+ detected, requesting POST_NOTIFICATIONS...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Разрешение на уведомления',
          message: 'Приложение хочет отправлять вам уведомления о новых сообщениях от поддержки',
          buttonNeutral: 'Спросить позже',
          buttonNegative: 'Отмена',
          buttonPositive: 'Разрешить',
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ POST_NOTIFICATIONS разрешено');
      } else {
        console.log('❌ POST_NOTIFICATIONS отклонено:', granted);
      }
    }
    
    // Запрашиваем разрешение через Firebase Messaging
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Уведомления разрешены:', authStatus);
      
      // Получаем FCM токен
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token?.substring(0, 40) + '...');
    } else {
      console.log('❌ Уведомления запрещены');
    }
  } catch (error) {
    console.error('❌ Ошибка запроса разрешений:', error);
  }
}

// Обработка уведомлений когда приложение в фоне/закрыто
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background message:', remoteMessage);
});


const InitialLayout = () => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  
  // ВАЖНО: Проверяем, готова ли навигация
  const navigationState = useRootNavigationState();

  // ============================================
  // ЗАПРОС РАЗРЕШЕНИЙ НА УВЕДОМЛЕНИЯ ПРИ ЗАПУСКЕ
  // ============================================
  useEffect(() => {
    requestNotificationPermission();

    // Обработка уведомлений когда приложение открыто (foreground)
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground message:', remoteMessage);
      
      // Показываем Alert с уведомлением
      Alert.alert(
        remoteMessage.notification?.title || '💬 Новое сообщение',
        remoteMessage.notification?.body || '',
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Открыть чат', 
            onPress: () => router.push('/support'),
            style: 'default'
          }
        ]
      );
    });

    // Обработка нажатия на уведомление (когда приложение было в фоне)
    const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('📩 Notification opened app:', remoteMessage);
      // Переходим в чат поддержки
      if (remoteMessage.data?.type === 'support_chat') {
        router.push('/support');
      }
    });

    // Проверяем, было ли приложение открыто через уведомление (cold start)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📩 App opened from notification:', remoteMessage);
          if (remoteMessage.data?.type === 'support_chat') {
            // Небольшая задержка чтобы навигация успела инициализироваться
            setTimeout(() => router.push('/support'), 1000);
          }
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, []);

  useEffect(() => {
    console.log('🧭 InitialLayout:', {
      loading,
      session: !!session,
      navReady: !!navigationState?.key,
      segments
    });

    // Если навигация не готова или идет загрузка — ждем
    if (!navigationState?.key || loading) {
      console.log('⏳ Waiting: navReady=', !!navigationState?.key, 'loading=', loading);
      return;
    }

    // Скрываем нативный сплэш, когда загрузка прошла
    SplashScreen.hideAsync().catch(() => {});

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const isIndex = segments.length === 0 || segments[0] === 'index';

    console.log('🧭 Navigation check:', { session: !!session, inAuthGroup, inTabsGroup, isIndex });

    if (session) {
      // Пользователь авторизован
      if (inAuthGroup || isIndex) {
        console.log('✅ User logged in, redirecting to tabs...');
        router.replace('/(tabs)/home');
      }
    } else {
      // Нет сессии
      if (!inAuthGroup) {
        console.log('🔐 No session, redirecting to login...');
        router.replace('/auth/login');
      }
    }
  }, [session, loading, segments, navigationState?.key]);

  // ЭКРАН ЗАГРУЗКИ С ОТЛАДКОЙ
  if (loading || !navigationState?.key) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A574" />
        <Text style={styles.debugText}>
          System Status:{'\n'}
          Loading: {String(loading)}{'\n'}
          Nav Ready: {String(!!navigationState?.key)}{'\n'}
          Session: {session ? 'Active' : 'None'}
        </Text>
      </View>
    );
  }

  return <Slot />;
};

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  debugText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
