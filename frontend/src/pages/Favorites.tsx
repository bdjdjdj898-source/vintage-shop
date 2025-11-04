import React, { useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Heart } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';

const Favorites: React.FC = () => {
  const { favoriteProducts, isLoadingFavorites, errorFavorites, fetchFavorites, removeFavoriteFromCache } = useProducts();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteRemoved = (productId: number) => {
    // Remove product from cache when unfavorited
    removeFavoriteFromCache(productId);
  };

  if (isLoadingFavorites) {
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (errorFavorites) {
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
            <div className="text-center text-sm mt-4" style={{ color: 'var(--color-error)' }}>{errorFavorites}</div>
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
        {!favoriteProducts || favoriteProducts.length === 0 ? (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
            {favoriteProducts.map((product) => (
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
