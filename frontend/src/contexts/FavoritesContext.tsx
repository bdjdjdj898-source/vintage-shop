import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: Set<number>;
  isLoading: boolean;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch('/api/favorites');
      if (response.success) {
        const ids = response.data.map((item: any) => item.id);
        setFavoriteIds(new Set(ids));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = useCallback((productId: number) => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  const toggleFavorite = useCallback(async (productId: number) => {
    if (!user) {
      throw new Error('Необходима авторизация');
    }

    const wasFavorite = favoriteIds.has(productId);

    try {
      // Оптимистичное обновление UI
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (wasFavorite) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });

      if (wasFavorite) {
        // Remove from favorites
        await apiFetch(`/api/favorites/${productId}`, {
          method: 'DELETE'
        });
      } else {
        // Add to favorites
        await apiFetch(`/api/favorites/${productId}`, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Откатываем оптимистичное обновление при ошибке
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (wasFavorite) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      throw error;
    }
  }, [user, favoriteIds]);

  const value = {
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    refreshFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
