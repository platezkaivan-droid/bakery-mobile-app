import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  category_id: string;
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
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products (
            id,
            name,
            description,
            price,
            image_url,
            rating,
            category_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Преобразуем данные в нужный формат
      const favoriteProducts = data
        .map(item => item.products)
        .filter(Boolean) as Product[];

      setFavorites(favoriteProducts);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
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

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: product.id,
        });

      if (error) throw error;

      // Добавляем в локальное состояние
      setFavorites(prev => [...prev, product]);
    } catch (error: any) {
      if (error.code === '23505') {
        // Уже в избранном
        return;
      }
      throw error;
    }
  };

  const removeFromFavorites = async (productId: string) => {
    if (!user) {
      throw new Error('Необходимо войти в аккаунт');
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      // Удаляем из локального состояния
      setFavorites(prev => prev.filter(fav => fav.id !== productId));
    } catch (error) {
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
