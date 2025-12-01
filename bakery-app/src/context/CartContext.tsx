import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Локальный интерфейс для продукта (совместим с разными источниками)
interface CartProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  image_url?: string;
}

interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  // Callback для уведомлений
  onItemAdded?: (productName: string) => void;
  setOnItemAdded: (callback: (productName: string) => void) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [onItemAddedCallback, setOnItemAddedCallback] = useState<((name: string) => void) | null>(null);

  const addToCart = useCallback((product: CartProduct) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    // Вызываем callback для уведомления
    if (onItemAddedCallback) {
      onItemAddedCallback(product.name);
    }
  }, [onItemAddedCallback]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const setOnItemAdded = useCallback((callback: (productName: string) => void) => {
    setOnItemAddedCallback(() => callback);
  }, []);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      total, 
      itemCount,
      setOnItemAdded 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
