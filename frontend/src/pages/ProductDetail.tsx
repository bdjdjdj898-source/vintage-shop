import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { useSwipe } from '../hooks/useSwipe';
import Header from '../components/Header';
import { Product } from '../types/api';
import { formatCurrency } from '../utils/format';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuantityControls, setShowQuantityControls] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await apiFetch(`/api/products/${id}`);
        if (response.success) {
          setProduct(response.data);
        } else {
          setError('Товар не найден');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Ошибка загрузки товара');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    // If quantity controls not shown, show them first
    if (!showQuantityControls) {
      setShowQuantityControls(true);
      return;
    }

    // Otherwise, add to cart
    try {
      console.log('🔵 Кнопка добавления в корзину нажата, товар:', product.id, 'количество:', quantity);
      setIsAddingToCart(true);
      await addItem(product.id, quantity);
      console.log('✅ Товар добавлен, переходим в корзину через 500мс');
      // Show success feedback
      setTimeout(() => {
        navigate('/cart');
      }, 500);
    } catch (err) {
      console.error('❌ Ошибка при добавлении в корзину:', err);
      setIsAddingToCart(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images) return;

    const totalImages = product.images.length;
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }
  };

  const getConditionText = (condition: number) => {
    if (condition >= 9) return 'Отлично';
    if (condition >= 7) return 'Хорошо';
    if (condition >= 5) return 'Средне';
    return 'Требует внимания';
  };

  const getConditionColor = (condition: number) => {
    if (condition >= 9) return { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' };
    if (condition >= 7) return { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' };
    if (condition >= 5) return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' };
    return { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' };
  };

  // Swipe handlers for image navigation
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => handleImageNavigation('next'),
    onSwipeRight: () => handleImageNavigation('prev'),
  }, {
    threshold: 50,
    preventDefaultTouchmoveEvent: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header hideSearch />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-accent)' }}></div>
            <p style={{ color: 'var(--color-text)' }}>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-bg">
        <Header hideSearch />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-lg mb-4" style={{ color: 'var(--color-error)' }}>
              {error || 'Товар не найден'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-accent)', color: '#ffffff' }}
            >
              Вернуться к каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  const conditionColors = getConditionColor(product.condition);

  return (
    <div className="min-h-screen bg-bg" style={{ paddingBottom: '160px' }}>
      <Header hideSearch showBack />

      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div
              className="relative rounded-xl overflow-hidden mb-3"
              style={{ backgroundColor: 'var(--color-surface)', aspectRatio: '3/4' }}
              {...swipeHandlers}
            >
              <img
                src={product.images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop&auto=format';
                }}
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#ffffff' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#ffffff' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {product.images.length > 1 && (
                <div
                  className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#ffffff' }}
                >
                  {currentImageIndex + 1} / {product.images.length}
                </div>
              )}

              {/* Condition Badge */}
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                style={{ backgroundColor: conditionColors.bg, color: conditionColors.text }}
              >
                {getConditionText(product.condition)}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className="flex-shrink-0 rounded-lg overflow-hidden transition-all"
                    style={{
                      width: '80px',
                      height: '100px',
                      border: index === currentImageIndex ? '2px solid var(--color-accent)' : '2px solid transparent',
                      opacity: index === currentImageIndex ? 1 : 0.6
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Brand */}
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
              {product.brand}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
              {product.title}
            </h1>

            {/* Price */}
            <div className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              {formatCurrency(product.price)}
            </div>

            {/* Details Grid */}
            <div
              className="rounded-lg p-4 mb-4"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Размер
                  </div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {product.size}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Цвет
                  </div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {product.color}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Категория
                  </div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {product.category}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Состояние
                  </div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {product.condition}/10
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Описание
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '12px 16px 12px 16px',
          backgroundColor: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 40
        }}
      >
        {!showQuantityControls ? (
          /* Simple Add to Cart Button */
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              cursor: isAddingToCart ? 'not-allowed' : 'pointer',
              opacity: isAddingToCart ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {isAddingToCart ? 'Добавление...' : 'Добавить в корзину'}
          </button>
        ) : (
          /* Button with Quantity Controls (like pablomsk) */
          <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
            {/* White Quantity Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isAddingToCart}
                style={{
                  padding: '0 16px',
                  height: '50px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: quantity <= 1 ? '#d1d5db' : '#111827',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: (quantity <= 1 || isAddingToCart) ? 'not-allowed' : 'pointer'
                }}
              >
                −
              </button>
              <div
                style={{
                  padding: '0 16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  minWidth: '40px',
                  textAlign: 'center'
                }}
              >
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isAddingToCart}
                style={{
                  padding: '0 16px',
                  height: '50px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: isAddingToCart ? 'not-allowed' : 'pointer'
                }}
              >
                +
              </button>
            </div>

            {/* Blue Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                opacity: isAddingToCart ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {isAddingToCart ? 'Добавление...' : 'Перейти в корзину'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
