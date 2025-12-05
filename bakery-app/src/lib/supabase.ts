import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import * as Linking from 'expo-linking';

const SUPABASE_URL = 'https://qkyhwdmhkoizxjazwnti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreWh3ZG1oa29penhqYXp3bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODg5MTEsImV4cCI6MjA4MDE2NDkxMX0.UsxL1RFnwavruSKkB5KeVDhMfZk_rUJxyaBsuttu9qA';

// AsyncStorage для React Native
const customStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      if (__DEV__) console.error('Storage GET error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      if (__DEV__) console.error('Storage SET error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      if (__DEV__) console.error('Storage REMOVE error:', error);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Автообновление токена при возврате приложения из фона
try {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
} catch (error) {
  if (__DEV__) console.error('AppState listener error:', error);
}

// Типы для базы данных
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  rating: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered';
  total: number;
  created_at: string;
  delivery_address: string;
  courier_lat?: number;
  courier_lng?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
