import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Linking, Platform, PermissionsAndroid } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';
import { router } from 'expo-router';

// ============================================
// КОНФИГУРАЦИЯ
// ============================================
const GOOGLE_WEB_CLIENT_ID = '616728560840-895u526601h4u6s4d1acr85l3fm6603f.apps.googleusercontent.com';
const GITHUB_PAGES_URL = 'https://platezkaivan-droid.github.io/email-redirect';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bonus_points: number;
  loyalty_level: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // ЗАГРУЗКА ПРОФИЛЯ
  // ============================================
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      if (__DEV__) console.error('Error loading profile:', error);
    }
  };

  // ============================================
  // СОХРАНЕНИЕ FCM ТОКЕНА
  // ============================================
  const saveFcmToken = async (userId: string) => {
    // Запускаем в фоне с задержкой чтобы не блокировать UI
    setTimeout(async () => {
      try {
        if (__DEV__) console.log('🔔 Сохранение FCM токена для:', userId);
        
        // Запрашиваем разрешение на уведомления (Android 13+)
        if (Platform.OS === 'android') {
          try {
            const authStatus = await messaging().requestPermission();
            if (__DEV__) console.log('📱 FCM Permission:', authStatus);
          } catch (e) {
            if (__DEV__) console.log('⚠️ FCM permission error:', e);
          }
        }

        // Получаем FCM токен
        const fcmToken = await messaging().getToken();
        if (__DEV__) console.log('📱 FCM Token:', fcmToken?.substring(0, 40) + '...');

        if (!fcmToken) {
          if (__DEV__) console.log('❌ FCM токен пустой');
          return;
        }

        // Сохраняем в базу - простой upsert
        const { error } = await supabase
          .from('user_fcm_tokens')
          .upsert(
            {
              user_id: userId,
              fcm_token: fcmToken,
            },
            { onConflict: 'user_id' }
          );

        if (error) {
          if (__DEV__) console.error('❌ FCM save error:', error.message);
          
          // Пробуем альтернативный способ - delete + insert
          await supabase.from('user_fcm_tokens').delete().eq('user_id', userId);
          const { error: insertError } = await supabase
            .from('user_fcm_tokens')
            .insert({ user_id: userId, fcm_token: fcmToken });
          
          if (insertError) {
            if (__DEV__) console.error('❌ FCM insert error:', insertError.message);
          } else {
            if (__DEV__) console.log('✅ FCM токен сохранен (insert)');
          }
        } else {
          if (__DEV__) console.log('✅ FCM токен сохранен');
        }
      } catch (error: any) {
        if (__DEV__) console.error('❌ FCM error:', error?.message || error);
      }
    }, 2000); // Задержка 2 секунды
  };

  // ============================================
  // ИНИЦИАЛИЗАЦИЯ
  // ============================================
  useEffect(() => {
    let mounted = true;
    let loadingFinished = false;
    console.log('🚀 AuthContext: Initializing...');
    
    // Настройка Google Sign-In
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
      console.log('✅ Google Sign-In configured');
    } catch (e) {
      console.error('❌ Google Sign-In config error:', e);
    }

    const initializeAuth = async () => {
      try {
        console.log('🔐 AuthContext: Loading session...');
        
        // Таймаут на загрузку сессии - 2 секунды максимум
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session load timeout')), 2000)
        );
        
        let session = null;
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
          session = result?.data?.session;
        } catch (e) {
          console.warn('⚠️ AuthContext: Session load timeout or error:', e);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('✅ AuthContext: Session found for:', session.user.email);
            // Загружаем профиль в фоне, не блокируем
            loadProfile(session.user.id).catch(console.error);
            saveFcmToken(session.user.id);
          } else {
            console.log('⚠️ AuthContext: No session found');
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Error fetching session:', error);
      } finally {
        if (mounted) {
          console.log('✅ AuthContext: Loading finished');
          loadingFinished = true;
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // ============================================
    // 🛡️ ПРЕДОХРАНИТЕЛЬ: Принудительно выключаем loading через 5 секунд
    // ============================================
    const safetyTimeout = setTimeout(() => {
      if (mounted && !loadingFinished) {
        console.warn('⚠️ AuthContext: SAFETY TIMEOUT - Force stopping loading after 5s');
        setLoading(false);
      }
    }, 5000);

    // ============================================
    // ОБРАБОТКА DEEP LINKS
    // ============================================
    const handleDeepLink = async (event: { url: string }) => {
      if (__DEV__) console.log('🔗 Deep link received:', event.url);
      
      // Проверяем auth callback
      if (event.url.includes('auth-callback') || event.url.includes(GITHUB_PAGES_URL)) {
        if (__DEV__) console.log('✅ Auth callback detected');
        
        try {
          // Парсим URL
          let urlToParse = event.url;
          
          // Если это GitHub Pages redirect, извлекаем параметры из hash
          if (event.url.includes('#')) {
            // Преобразуем hash в query params для парсинга
            urlToParse = event.url.replace('#', '?');
          }
          
          const url = new URL(urlToParse);
          const params = new URLSearchParams(url.search || url.hash?.replace('#', ''));
          
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          const token = params.get('token');
          const type = params.get('type');
          const token_hash = params.get('token_hash');
          
          if (__DEV__) console.log('🔑 Parameters:', { 
            hasAccessToken: !!access_token, 
            hasRefreshToken: !!refresh_token,
            hasToken: !!token,
            hasTokenHash: !!token_hash,
            type
          });
          
          // Вариант 1: OAuth токены (Google Auth через браузер)
          if (access_token && refresh_token) {
            if (__DEV__) console.log('📱 Processing OAuth tokens...');
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            
            if (error) throw error;
            
            if (data.session) {
              if (__DEV__) console.log('✅ OAuth session set!');
              setSession(data.session);
              setUser(data.session.user);
              await loadProfile(data.session.user.id);
              await saveFcmToken(data.session.user.id);
            }
          } 
          // Вариант 2: Email confirmation (token_hash)
          else if (token_hash && type) {
            if (__DEV__) console.log('📧 Processing email confirmation (token_hash)...');
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash,
              type: type as any
            });
            
            if (error) throw error;
            
            if (data.session) {
              if (__DEV__) console.log('✅ Email confirmed!');
              setSession(data.session);
              setUser(data.session.user);
              await loadProfile(data.session.user.id);
              await saveFcmToken(data.session.user.id);
            }
          }
          // Вариант 3: Email confirmation (token)
          else if (token && type) {
            if (__DEV__) console.log('📧 Processing email confirmation (token)...');
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: type as any
            });
            
            if (error) throw error;
            
            if (data.session) {
              if (__DEV__) console.log('✅ Email confirmed!');
              setSession(data.session);
              setUser(data.session.user);
              await loadProfile(data.session.user.id);
              await saveFcmToken(data.session.user.id);
            }
          }
          // Вариант 4: Пробуем получить существующую сессию
          else {
            if (__DEV__) console.log('⚠️ No tokens in URL, checking existing session...');
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              if (__DEV__) console.log('✅ Existing session found!');
              setSession(session);
              setUser(session.user);
              await loadProfile(session.user.id);
              await saveFcmToken(session.user.id);
            }
          }
        } catch (error) {
          if (__DEV__) console.error('❌ Error handling deep link:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Подписка на Deep Links
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // Проверка начального URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        if (__DEV__) console.log('🔗 Initial URL:', url);
        handleDeepLink({ url });
      }
    }).catch(console.error);

    // ============================================
    // ПОДПИСКА НА ИЗМЕНЕНИЯ АВТОРИЗАЦИИ
    // ============================================
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (__DEV__) console.log('🔄 Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id).catch(console.error);
        saveFcmToken(session.user.id).catch(console.error);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      linkingSubscription.remove();
      clearTimeout(safetyTimeout);
    };
  }, []);

  // ============================================
  // ВХОД ПО EMAIL/PASSWORD
  // ============================================
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      if (error) throw error;
    } catch (error) {
      if (__DEV__) console.error('❌ SignIn error:', error);
      throw error;
    }
  };

  // ============================================
  // РЕГИСТРАЦИЯ
  // ============================================
  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
        // Redirect URL для подтверждения email
        emailRedirectTo: `${GITHUB_PAGES_URL}/auth-callback`,
      }
    });
    
    if (error) throw error;
    
    // Если email подтверждение отключено, сессия будет сразу
    if (data.session) {
      if (__DEV__) console.log('✅ Session created immediately');
    } else {
      if (__DEV__) console.log('📧 Email confirmation required');
      // Пробуем автоматический вход (если email подтверждение отключено в Supabase)
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        if (signInError && __DEV__) {
          console.log('⚠️ Auto-login failed (email confirmation may be required)');
        }
      } catch (e) {
        // Игнорируем ошибку
      }
    }
    
    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  // ============================================
  // ВЫХОД
  // ============================================
  const signOut = async () => {
    try {
      // Выход из Google
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Игнорируем, если не был залогинен через Google
      }
      
      // Выход из Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setProfile(null);
    } catch (error) {
      if (__DEV__) console.error('❌ SignOut error:', error);
      throw error;
    }
  };

  // ============================================
  // НАТИВНЫЙ GOOGLE SIGN-IN (БЕЗ БРАУЗЕРА!)
  // ============================================
  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Starting Native Google Sign In...');
      
      // 1. Проверяем наличие Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 2. ВАЖНО: Делаем выход, чтобы сбросить кеш аккаунта
      try {
        await GoogleSignin.signOut();
        console.log('✅ Previous Google session cleared');
      } catch (e) {
        // Игнорируем ошибку выхода
      }
      
      // 3. Открываем нативное окно выбора аккаунта
      console.log('📱 Opening Google Sign In dialog...');
      const userInfo = await GoogleSignin.signIn();
      
      console.log('✅ Google Sign In successful:', userInfo.data?.user?.email);
      
      // 4. Получаем ID token
      const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      
      if (!idToken) {
        throw new Error('Не удалось получить ID Token от Google');
      }
      
      console.log('🔑 Got ID token, sending to Supabase...');
      
      // 5. Отправляем токен в Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Supabase session created!');
      
      // 6. Явно устанавливаем сессию и пользователя
      if (data.session) {
        console.log('🔄 Setting session and user state...');
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false); // ВАЖНО: Явно выключаем loading
        loadProfile(data.session.user.id).catch(console.error);
        saveFcmToken(data.session.user.id);
        console.log('✅ Session set, loading=false, navigation should happen now');
      }
      
      return data;
      
    } catch (error: any) {
      console.error('❌ Google Sign In error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Вход отменен');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Вход уже выполняется');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services недоступны');
      } else if (error.code === 'DEVELOPER_ERROR' || error.message?.includes('DEVELOPER_ERROR')) {
        throw new Error('Ошибка конфигурации: проверьте SHA-1 в Firebase Console');
      } else {
        throw new Error(error.message || 'Неизвестная ошибка Google Sign In');
      }
    }
  };

  // ============================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  // ============================================
  // ОБНОВЛЕНИЕ ПРОФИЛЯ
  // ============================================
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      signInWithGoogle,
      updateProfile,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
