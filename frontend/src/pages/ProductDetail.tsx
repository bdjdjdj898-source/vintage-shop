import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useCart } from '../contexts/CartContext';
import { useSwipe } from '../hooks/useSwipe';
import { useTelegramBackButton, useTelegramMainButton, useTelegramSettingsButton } from '../hooks/useTelegramUI';
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
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;

    // If quantity controls not shown, show them AND add to cart immediately
    if (!showQuantityControls) {
      setShowQuantityControls(true);
      // Сразу добавляем товар в корзину
      try {
        console.log('🔵 Первое нажатие: показываем регулятор И добавляем в корзину, товар:', product.id, 'количество:', quantity);
        setIsAddingToCart(true);
        await addItem(product.id, quantity);
        console.log('✅ Товар добавлен в корзину');
        setIsAddingToCart(false);
      } catch (err) {
        console.error('❌ Ошибка при добавлении в корзину:', err);
        setIsAddingToCart(false);
      }
      return;
    }

    // If quantity controls already shown, just navigate to cart
    console.log('🔵 Второе нажатие: переходим в корзину');
    navigate('/cart');
  };

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

  // Обновляем количество в корзине когда пользователь меняет регулятор
  useEffect(() => {
    if (showQuantityControls && product) {
      const updateQuantity = async () => {
        try {
          console.log('🔄 Обновляем количество в корзине:', product.id, 'новое количество:', quantity);
          await addItem(product.id, quantity);
        } catch (err) {
          console.error('❌ Ошибка при обновлении количества:', err);
        }
      };
      updateQuantity();
    }
  }, [quantity, showQuantityControls, product, addItem]);

  // Telegram UI кнопки
  useTelegramBackButton(() => navigate(-1));
  useTelegramSettingsButton(() => console.log('Settings clicked'));

  // Telegram Main Button для добавления в корзину
  useTelegramMainButton(
    !showQuantityControls
      ? 'Добавить в корзину'
      : `Перейти в корзину · ${formatCurrency((product?.price || 0) * quantity)}`,
    handleAddToCart,
    {
      color: '#3b82f6',
      textColor: '#ffffff',
      isActive: !isAddingToCart,
      isProgressVisible: isAddingToCart
    }
  );

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
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Header hideSearch />
        <div style={{ padding: '32px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '2px solid transparent', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: '#111827' }}>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Header hideSearch />
        <div style={{ padding: '32px 16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', marginBottom: '16px', color: '#ef4444' }}>
              {error || 'Товар не найден'}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '8px 24px', borderRadius: '8px', fontWeight: '500', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', cursor: 'pointer' }}
            >
              Вернуться к каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  const conditionColors = getConditionColor(product.condition);

  // Calculate visible progress bars (max 4 with sliding window)
  const maxVisibleBars = 4;
  const totalImages = product.images.length;
  let visibleBarStartIndex = 0;
  let visibleBarEndIndex = totalImages;

  if (totalImages > maxVisibleBars) {
    const halfWindow = Math.floor(maxVisibleBars / 2);
    visibleBarStartIndex = Math.max(0, currentImageIndex - halfWindow);
    visibleBarEndIndex = Math.min(totalImages, visibleBarStartIndex + maxVisibleBars);

    if (visibleBarEndIndex === totalImages) {
      visibleBarStartIndex = Math.max(0, totalImages - maxVisibleBars);
    }
  }

  const visibleProgressBars = product.images.slice(visibleBarStartIndex, visibleBarEndIndex);

  // DEBUG: Log to console
  console.log('🔍 Progress bars:', {
    totalImages,
    maxVisibleBars,
    visibleBarStartIndex,
    visibleBarEndIndex,
    visibleProgressBarsLength: visibleProgressBars.length,
    currentImageIndex
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#f5f5f5' }}>
      <Header hideSearch />

      <div style={{ maxWidth: '100%', padding: '16px' }}>
        {/* Main Image */}
        <div
          style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#e5e7eb', aspectRatio: '3/4', borderRadius: '12px', marginBottom: '16px' }}
          {...swipeHandlers}
        >
          {/* Progress bars at top (like pablomsk - max 4 visible with sliding window) */}
          {product.images.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                display: 'flex',
                gap: '4px',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
            >
              {visibleProgressBars.map((_, visibleIndex) => {
                const actualIndex = visibleBarStartIndex + visibleIndex;
                const isActive = actualIndex === currentImageIndex;
                const isPassed = actualIndex < currentImageIndex;

                return (
                  <div
                    key={actualIndex}
                    style={{
                      flex: 1,
                      height: '2px',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: isPassed ? '100%' : (isActive ? '100%' : '0%'),
                        height: '100%',
                        backgroundColor: '#ffffff',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <img
            src={product.images[currentImageIndex]}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop&auto=format';
            }}
          />

          {/* Condition Badge */}
          <div
            style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: conditionColors.bg, color: conditionColors.text }}
          >
            {getConditionText(product.condition)}
          </div>
        </div>

        {/* Title and Price Block */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0, marginBottom: '8px' }}>
            {product.title}
          </h1>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>
            {formatCurrency(product.price)}
          </div>
        </div>

        {/* Description Block */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '12px' }}>
            Описание товара
          </h2>
          <div
            style={{
              color: '#374151',
              lineHeight: '1.6',
              fontSize: '15px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {product.description.length > 150 ? (
              <>
                {product.description.substring(0, 150)}...
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => setShowDescriptionPopup(true)}
                    style={{
                      color: 'var(--tg-theme-link-color, #2481cc)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '15px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Читать дальше ▼
                  </button>
                </div>
              </>
            ) : (
              product.description
            )}
          </div>
        </div>

        {/* Product Details Block */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#6b7280', fontWeight: 'normal' }}>Размер</span>
              <span style={{ color: '#111827', fontWeight: 'normal' }}>{product.size}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#6b7280', fontWeight: 'normal' }}>Цвет</span>
              <span style={{ color: '#111827', fontWeight: 'normal' }}>{product.color}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#6b7280', fontWeight: 'normal' }}>Состояние</span>
              <span style={{ color: '#111827', fontWeight: 'normal' }}>{product.condition}/10</span>
            </div>
          </div>
        </div>

        {/* Support Contact Block */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, marginBottom: '12px' }}>
              Остались вопросы?
            </h3>
            <button
              onClick={() => {
                // Open Telegram support chat
                const tg = (window as any).Telegram?.WebApp;
                if (tg) {
                  tg.openTelegramLink('https://t.me/your_support_username');
                }
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--tg-theme-button-color, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Написать в поддержку
            </button>
          </div>
        </div>
      </div>

      {/* Quantity Controls - показываем только когда нужно */}
      {showQuantityControls && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: '70px',
            padding: '16px',
            backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
            borderTop: '1px solid var(--tg-theme-section-separator-color, #e5e7eb)',
            zIndex: 40,
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ marginBottom: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color, #6b7280)', fontWeight: '500' }}>
              Количество
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--tg-theme-section-bg-color, #f9fafb)',
              border: '1px solid var(--tg-theme-section-separator-color, #e5e7eb)',
              borderRadius: '12px',
              overflow: 'hidden',
              maxWidth: '180px',
              margin: '0 auto',
              height: '48px'
            }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              style={{
                flex: 1,
                height: '100%',
                fontSize: '20px',
                fontWeight: 'bold',
                color: quantity <= 1 ? 'var(--tg-theme-hint-color, #d1d5db)' : 'var(--tg-theme-button-color, #3b82f6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseDown={(e) => {
                if (quantity > 1) {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              −
            </button>
            <div
              style={{
                padding: '0 16px',
                fontSize: '17px',
                fontWeight: '600',
                color: 'var(--tg-theme-text-color, #111827)',
                minWidth: '50px',
                textAlign: 'center',
                borderLeft: '1px solid var(--tg-theme-section-separator-color, #e5e7eb)',
                borderRight: '1px solid var(--tg-theme-section-separator-color, #e5e7eb)'
              }}
            >
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                flex: 1,
                height: '100%',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'var(--tg-theme-button-color, #3b82f6)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Description Popup (like pablomsk) */}
      {showDescriptionPopup && (
        <div
          onClick={() => setShowDescriptionPopup(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-bg)',
              borderRadius: '16px 16px 0 0',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text)', margin: 0 }}>
                {product.title}
              </h2>
              <button
                onClick={() => setShowDescriptionPopup(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--color-text)',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                color: 'var(--color-text)',
                lineHeight: '1.6',
                fontSize: '15px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {product.description}
            </div>
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowDescriptionPopup(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--tg-theme-button-color, #3b82f6)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
