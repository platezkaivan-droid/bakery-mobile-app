import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

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
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Загрузка профиля пользователя
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
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Initializing...');
    
    // Функция инициализации
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Loading session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error loading session:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthContext: Session found, loading profile...');
          // Запускаем загрузку профиля, но НЕ ЖДЕМ её (без await),
          // чтобы убрать спиннер сразу
          loadProfile(session.user.id).catch(console.error);
        } else {
          console.log('AuthContext: No session found');
        }
      } catch (error) {
        console.error('AuthContext: Error fetching session:', error);
      } finally {
        // ЭТО САМОЕ ГЛАВНОЕ: Убираем загрузку в любом случае!
        setLoading(false);
      }
    };

    initializeAuth();

    // Подписка на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthContext: Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('AuthContext: New session, loading profile...');
        loadProfile(session.user.id).catch(console.error);
      } else {
        console.log('AuthContext: Session cleared');
        setProfile(null);
      }
      
      // При смене стейта (например, логин) тоже гасим спиннер
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    // Регистрация
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim().toLowerCase(), 
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
        // ✨ МАГИЯ: После подтверждения email откроется приложение!
        emailRedirectTo: 'bakery-app://auth-callback',
      }
    });
    if (error) throw error;
    
    // Если session нет (email подтверждение включено), делаем автоматический вход
    if (!data.session) {
      console.log('No session after signup, attempting auto-login...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (signInError) {
        console.error('Auto-login failed:', signInError);
        // Не бросаем ошибку, так как регистрация прошла успешно
      }
    }
    
    // Профиль создастся автоматически через триггер в БД
    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    
    // Обновляем локальный профиль
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

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
