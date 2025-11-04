import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '../types/api';
import { apiFetch } from '../api/client';

interface ProductsContextType {
  // All products cache
  allProducts: Product[] | null;
  isLoadingAll: boolean;
  errorAll: string | null;
  fetchAllProducts: () => Promise<void>;

  // Favorites cache
  favoriteProducts: Product[] | null;
  isLoadingFavorites: boolean;
  errorFavorites: string | null;
  fetchFavorites: () => Promise<void>;
  removeFavoriteFromCache: (productId: number) => void;

  // Clear cache
  clearCache: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // All products state
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState<string | null>(null);

  // Favorites state
  const [favoriteProducts, setFavoriteProducts] = useState<Product[] | null>(null);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [errorFavorites, setErrorFavorites] = useState<string | null>(null);

  const fetchAllProducts = useCallback(async () => {
    // If already cached, don't fetch again
    if (allProducts !== null) {
      console.log('✅ Using cached all products:', allProducts.length);
      return;
    }

    try {
      setIsLoadingAll(true);
      setErrorAll(null);

      console.log('🔍 Fetching all products from API...');
      const response = await apiFetch('/api/products');

      if (response.success) {
        console.log('✅ All products loaded and cached:', response.data.length);
        setAllProducts(response.data);
      }
    } catch (err) {
      console.error('❌ Error fetching all products:', err);
      setErrorAll(`Ошибка загрузки товаров: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingAll(false);
    }
  }, [allProducts]);

  const fetchFavorites = useCallback(async () => {
    // If already cached, don't fetch again
    if (favoriteProducts !== null) {
      console.log('✅ Using cached favorites:', favoriteProducts.length);
      return;
    }

    try {
      setIsLoadingFavorites(true);
      setErrorFavorites(null);

      console.log('🔍 Fetching favorites from API...');
      const response = await apiFetch('/api/favorites');

      if (response.success) {
        console.log('✅ Favorites loaded and cached:', response.data.length);
        setFavoriteProducts(response.data);
      }
    } catch (err) {
      console.error('❌ Error fetching favorites:', err);
      setErrorFavorites(`Ошибка загрузки избранного: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [favoriteProducts]);

  const removeFavoriteFromCache = useCallback((productId: number) => {
    setFavoriteProducts(prev => prev ? prev.filter(p => p.id !== productId) : null);
  }, []);

  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing products cache');
    setAllProducts(null);
    setFavoriteProducts(null);
    setErrorAll(null);
    setErrorFavorites(null);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        allProducts,
        isLoadingAll,
        errorAll,
        fetchAllProducts,
        favoriteProducts,
        isLoadingFavorites,
        errorFavorites,
        fetchFavorites,
        removeFavoriteFromCache,
        clearCache
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
