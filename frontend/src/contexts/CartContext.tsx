import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  condition: number;
  description: string;
  price: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  product: Product;
}

interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  getCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/cart');
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Ошибка загрузки корзины');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId: number, quantity: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });

      if (response.success) {
        // Refresh cart after adding item
        await getCart();
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Ошибка добавления товара в корзину');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        // Refresh cart after removing item
        await getCart();
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Ошибка удаления товара из корзины');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      });

      if (response.success) {
        // Refresh cart after updating quantity
        await getCart();
      }
    } catch (err) {
      console.error('Error updating item quantity:', err);
      setError('Ошибка обновления количества товара');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalAmount = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Load cart on mount
  useEffect(() => {
    getCart();
  }, []);

  const value = {
    cart,
    isLoading,
    error,
    getCart,
    addItem,
    removeItem,
    updateQuantity,
    getTotalAmount,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};