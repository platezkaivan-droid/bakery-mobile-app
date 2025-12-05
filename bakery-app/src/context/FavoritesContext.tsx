import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  rating: number;
  category_id?: string;
}

interface FavoritesContextType {
  favorites: Product[];
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  toggleFavorite: (product: Product) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Загрузка избранного из БД
  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      // Сначала получаем список product_id из favorites
      const { data: favoritesData, error: favError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (favError) {
        if (__DEV__) console.error('Error loading favorites:', favError);
        setFavorites([]);
        return;
      }

      if (!favoritesData || favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // Получаем product_id из результата
      const productIds = favoritesData.map(f => f.product_id);

      // Теперь загружаем сами продукты (включая переводы)
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select(`
          id, name, description, price, image_url, rating, category_id,
          name_en, description_en,
          name_kz, description_kz,
          name_tt, description_tt,
          name_uz, description_uz,
          name_hy, description_hy
        `)
        .in('id', productIds);

      if (prodError) {
        if (__DEV__) console.error('Error loading products:', prodError);
        setFavorites([]);
        return;
      }

      setFavorites(productsData || []);
      if (__DEV__) console.log('Loaded favorites from DB:', productsData?.length || 0);
    } catch (error) {
      if (__DEV__) console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFavorites().catch(err => {
        if (__DEV__) console.error('Failed to load favorites:', err);
      });
    } else {
      setFavorites([]);
    }
  }, [user]);

  const isFavorite = (productId: string): boolean => {
    return favorites.some(fav => fav.id === productId);
  };

  const addToFavorites = async (product: Product) => {
    if (!user) {
      throw new Error('Необходимо войти в аккаунт');
    }

    // Проверяем, не добавлен ли уже
    if (isFavorite(product.id)) {
      if (__DEV__) console.log('Product already in favorites');
      return;
    }

    try {
      // Добавляем в БД
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: product.id,
        });

      if (error) {
        // Если ошибка дубликата - игнорируем
        if (error.code === '23505') {
          if (__DEV__) console.log('Already in favorites (duplicate)');
          return;
        }
        
        if (__DEV__) console.error('Error adding to favorites:', error);
        throw error;
      }

      // Добавляем в локальное состояние
      setFavorites(prev => [...prev, product]);
      if (__DEV__) console.log('Added to favorites:', product.name);
    } catch (error) {
      if (__DEV__) console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (!user) {
      throw new Error('Необходимо войти в аккаунт');
    }

    try {
      // Удаляем из БД
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Удаляем из локального состояния
      setFavorites(prev => prev.filter(fav => fav.id !== productId));
      if (__DEV__) console.log('Removed from favorites:', productId);
    } catch (error) {
      if (__DEV__) console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const toggleFavorite = async (product: Product) => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      isFavorite,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      refreshFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
