import { createClient } from '@supabase/supabase-js';

// Ваши данные из Supabase Dashboard
const SUPABASE_URL = 'https://qkyhwdmhkoizxjazwnti.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreWh3ZG1oa29penhqYXp3bnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODg5MTEsImV4cCI6MjA4MDE2NDkxMX0.UsxL1RFnwavruSKkB5KeVDhMfZk_rUJxyaBsuttu9qA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
