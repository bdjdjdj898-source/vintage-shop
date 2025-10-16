import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Product } from '../types/api';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiFetch('/api/favorites');
      console.log('📦 Favorites response:', response);

      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error('❌ Error fetching favorites:', err);
      setError(`Ошибка загрузки избранного: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteRemoved = (productId: number) => {
    // Remove product from list when unfavorited
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header hideSearch />
        <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            Избранное
          </h2>

          {/* Skeleton grid - 6 cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header hideSearch />
        <div className="max-w-screen-xl mx-auto px-4 py-8 pb-24">
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '16px'
          }}>
            Избранное
          </h2>
          <div className="flex justify-center items-center h-64">
            <div className="text-center text-sm mt-4" style={{ color: 'var(--color-error)' }}>{error}</div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Header hideSearch />
      <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '8px'
        }}>
          Избранное
        </h2>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '16px'
          }}>
            <Heart
              size={64}
              strokeWidth={1.5}
              style={{
                color: 'var(--text-secondary)',
                opacity: 0.3
              }}
            />
            <div style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '16px',
              fontWeight: 500
            }}>
              В избранном пока ничего нет
            </div>
            <div style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              opacity: 0.7
            }}>
              Добавляйте товары в избранное, нажимая на сердечко
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteChange={handleFavoriteRemoved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Favorites;
