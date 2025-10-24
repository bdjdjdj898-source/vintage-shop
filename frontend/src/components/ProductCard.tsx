import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/api';
import { addDebugLog } from './DebugLog';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onFavoriteChange?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onFavoriteChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { images, brand, title, price, id } = product;
  const [index, setIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dotsContainerRef = useRef<HTMLDivElement | null>(null);

  // Parallax indicators config
  const maxVisibleDots = 4;
  const totalImages = images.length;

  // Swipe state - DISCRETE MODEL (1 swipe = ±1 index)
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const gestureDetectedRef = useRef<'horizontal' | 'vertical' | null>(null);
  const widthRef = useRef<number>(0);
  const activePointerIdRef = useRef<number | null>(null);
  const suppressClickRef = useRef<boolean>(false);

  // Gesture detection thresholds
  const MIN_SWIPE_DISTANCE = 30; // px
  const HORIZONTAL_RATIO = 2.5; // |Δx| / |Δy|
  const SWIPE_DURATION = 250; // ms
  const PARALLAX_DURATION = 300; // ms (1.2x slower)
  const SPRING_EASING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Update visuals - GPU accelerated, discrete positioning
  const updateTransforms = (targetIndex: number, dragProgress: number = 0, animated: boolean = false) => {
    if (!trackRef.current || !dotsContainerRef.current) return;

    // Track: GPU-accelerated, always multiples of 100%
    const trackOffset = targetIndex * 100 + dragProgress;
    trackRef.current.style.transform = `translate3d(${-trackOffset}%, 0, 0)`;
    trackRef.current.style.transition = animated
      ? `transform ${SWIPE_DURATION}ms ${SPRING_EASING}`
      : 'none';

    // Effective progress for dots (includes drag)
    const effectiveProgress = targetIndex + (dragProgress / 100);

    // Parallax for indicators (4-dot window, 60% speed)
    const dotWidth = 14;
    const gapWidth = 4;
    const dotStep = dotWidth + gapWidth;
    let dotsOffset = 0;

    if (totalImages > maxVisibleDots) {
      const halfWindow = maxVisibleDots / 2;
      const windowStart = halfWindow - 0.5;
      const windowEnd = totalImages - halfWindow - 0.5;

      if (effectiveProgress > windowStart) {
        const scrollProgress = Math.min(effectiveProgress - windowStart, windowEnd - windowStart);
        dotsOffset = scrollProgress * dotStep * 0.6; // Parallax: 60% speed
      }

      const maxOffset = (totalImages - maxVisibleDots) * dotStep;
      dotsOffset = Math.max(0, Math.min(maxOffset, dotsOffset));
    }

    dotsContainerRef.current.style.transform = `translate3d(${-dotsOffset}px, 0, 0)`;
    dotsContainerRef.current.style.transition = animated
      ? `transform ${PARALLAX_DURATION}ms ${SPRING_EASING}`
      : 'none';
  };

  function handlePointerDown(e: React.PointerEvent) {
    if (!trackRef.current) return;

    // Multi-touch protection
    if (isDraggingRef.current && activePointerIdRef.current !== null) return;

    // Store width and positions
    widthRef.current = trackRef.current.clientWidth;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    currentXRef.current = e.clientX;
    currentYRef.current = e.clientY;
    isDraggingRef.current = true;
    gestureDetectedRef.current = null;
    activePointerIdRef.current = e.pointerId;

    // Cancel transitions immediately
    updateTransforms(index, 0, false);

    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current || !trackRef.current) return;
    if (e.pointerId !== activePointerIdRef.current) return;

    currentXRef.current = e.clientX;
    currentYRef.current = e.clientY;

    const deltaX = currentXRef.current - startXRef.current;
    const deltaY = currentYRef.current - startYRef.current;

    // Gesture detection - только один раз
    if (gestureDetectedRef.current === null) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > 10 || absDeltaY > 10) {
        // Horizontal if ratio > 2.5
        const ratio = absDeltaX / Math.max(absDeltaY, 1);
        gestureDetectedRef.current = ratio > HORIZONTAL_RATIO ? 'horizontal' : 'vertical';

        if (gestureDetectedRef.current === 'horizontal') {
          e.preventDefault();
          e.stopPropagation();
        }
      } else {
        return; // Not enough movement
      }
    }

    // Vertical - allow scroll
    if (gestureDetectedRef.current === 'vertical') {
      isDraggingRef.current = false;
      return;
    }

    // Horizontal - update visuals
    if (gestureDetectedRef.current === 'horizontal') {
      e.preventDefault();
      e.stopPropagation();

      // Drag as percentage (-100 to +100)
      const dragProgress = (-deltaX / widthRef.current) * 100;

      // Update immediately (no rAF needed)
      updateTransforms(index, dragProgress, false);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    if (e.pointerId !== activePointerIdRef.current) return;

    const deltaX = currentXRef.current - startXRef.current;
    const wasHorizontalGesture = gestureDetectedRef.current === 'horizontal';

    isDraggingRef.current = false;
    gestureDetectedRef.current = null;
    activePointerIdRef.current = null;

    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
    }

    // If not horizontal, treat as tap
    if (!wasHorizontalGesture) {
      if (Math.abs(deltaX) < 6) {
        suppressClickRef.current = false;
        if (onClick) {
          onClick(product);
        } else {
          navigate(`/product/${id}`);
        }
      }
      return;
    }

    // Suppress click if dragged
    if (Math.abs(deltaX) > 10) {
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 300);
    }

    // DISCRETE MODEL: >= 30px = change index
    const absDeltaX = Math.abs(deltaX);
    let targetIndex = index;

    if (absDeltaX >= MIN_SWIPE_DISTANCE) {
      if (deltaX < 0 && index < totalImages - 1) {
        // Swiped left → next
        targetIndex = index + 1;
      } else if (deltaX > 0 && index > 0) {
        // Swiped right → previous
        targetIndex = index - 1;
      }
    }

    // Update state if changed
    if (targetIndex !== index) {
      setIndex(targetIndex);
    }

    // Animate with spring easing
    updateTransforms(targetIndex, 0, true);
  }

  // Handle pointer cancel (incoming call, tab switch, OS gesture)
  function handlePointerCancel(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;
    if (e.pointerId !== activePointerIdRef.current) return;

    isDraggingRef.current = false;
    gestureDetectedRef.current = null;
    activePointerIdRef.current = null;

    // Return to current index (cancel gesture)
    updateTransforms(index, 0, true);
  }

  // Set initial position on mount
  useEffect(() => {
    if (trackRef.current) {
      updateTransforms(0, 0, false);
    }
  }, []);

  // Handle window resize / orientation change
  useEffect(() => {
    const handleResize = () => {
      if (!trackRef.current || isDraggingRef.current) return;
      widthRef.current = trackRef.current.clientWidth;
      updateTransforms(index, 0, false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [index]);

  // Check if product is in favorites
  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const response = await apiFetch('/api/favorites');
        if (response.success) {
          const favoriteIds = response.data.map((item: Product) => item.id);
          const isInFavorites = favoriteIds.includes(id);
          setIsFavorite(isInFavorites);
        }
      } catch (error: any) {
        addDebugLog(`❌ Проверка избранного: ${error.status || 'ошибка'}`, 'error');
      }
    };

    checkFavorite();
  }, [user, id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      addDebugLog('❌ Нет авторизации', 'error');
      navigate('/profile');
      return;
    }

    if (isFavoriteLoading) return;

    try {
      setIsFavoriteLoading(true);
      addDebugLog(`🔄 ${isFavorite ? 'Удаляем' : 'Добавляем'} из избранного...`, 'info');

      if (isFavorite) {
        await apiFetch(`/api/favorites/${id}`, {
          method: 'DELETE'
        });
        setIsFavorite(false);
        addDebugLog('✅ Удалено из избранного', 'success');
        if (onFavoriteChange) {
          onFavoriteChange(id);
        }
      } else {
        await apiFetch(`/api/favorites/${id}`, {
          method: 'POST'
        });
        setIsFavorite(true);
        addDebugLog('✅ Добавлено в избранное', 'success');
      }
    } catch (error: any) {
      if (error.status === 401) {
        addDebugLog('❌ Нет авторизации Telegram', 'error');
        navigate('/profile');
      } else if (error.status === 404) {
        addDebugLog('❌ Товар не найден', 'error');
      } else if (error.message) {
        addDebugLog(`❌ ${error.message}`, 'error');
      } else {
        addDebugLog(`❌ Ошибка ${error.status || 'неизвестная'}`, 'error');
      }
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const conditionColor = (condition: number) => {
    if (condition >= 9) return { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' };
    if (condition >= 7) return { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' };
    if (condition >= 5) return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' };
    return { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' };
  };

  return (
    <article
      className="overflow-hidden transition-all duration-150"
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '4 / 5', borderRadius: '12px', touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="flex h-full w-full"
          style={{
            willChange: 'transform'
          }}
        >
          {images.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-full">
              <img
                src={src}
                loading="lazy"
                decoding="async"
                alt={`${title} — ${i + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop&auto=format';
                }}
              />
            </div>
          ))}
        </div>

        {/* Parallax scrolling indicators - viewport window pattern */}
        {images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '8px',
              width: `${maxVisibleDots * 14}px`, // Fixed viewport window
              overflow: 'hidden',
            }}
          >
            {/* Container with all dots - moves inside viewport */}
            <div
              ref={dotsContainerRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                willChange: 'transform',
                transitionProperty: 'transform'
              }}
            >
              {images.map((_, i) => {
                const isActive = i === index;
                const isPassed = i < index;

                return (
                  <span
                    key={i}
                    style={{
                      width: isActive ? '8px' : '6px',
                      height: isActive ? '8px' : '6px',
                      backgroundColor: '#ffffff',
                      opacity: isPassed ? 0.8 : (isActive ? 1 : 0.5),
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      borderRadius: '50%',
                      flexShrink: 0,
                      transition: 'all 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          disabled={isFavoriteLoading}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isFavoriteLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            opacity: isFavoriteLoading ? 0.6 : 1,
            transition: 'transform 0.15s, opacity 0.15s'
          }}
          onMouseEnter={(e) => {
            if (!isFavoriteLoading) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Heart
            size={20}
            fill={isFavorite ? '#ef4444' : 'transparent'}
            stroke={isFavorite ? '#ef4444' : '#6b7280'}
            strokeWidth={2}
            style={{
              transition: 'all 0.2s'
            }}
          />
        </button>
      </div>

      {/* Meta */}
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center', minHeight: '110px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          {brand && <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{brand}</span>}
          <h3 className="line-clamp-2" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text)', lineHeight: '1.5', margin: 0 }}>
            {title}
          </h3>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(price)}</span>
      </div>
    </article>
  );
};

export default ProductCard;
