import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const SUPABASE_URL = 'https://qkyhwdmhkoizxjazwnti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreWh3ZG1oa29penhqYXp3bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODg5MTEsImV4cCI6MjA4MDE2NDkxMX0.UsxL1RFnwavruSKkB5KeVDhMfZk_rUJxyaBsuttu9qA';

// AsyncStorage для React Native с логированием
const customStorage = {
  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    console.log('Storage GET:', key, value ? 'Found' : 'Not found');
    return value;
  },
  setItem: async (key: string, value: string) => {
    console.log('Storage SET:', key);
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    console.log('Storage REMOVE:', key);
    await AsyncStorage.removeItem(key);
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
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

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
