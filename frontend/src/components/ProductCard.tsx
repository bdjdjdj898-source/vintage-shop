import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/api';

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

  // Swipe state with gesture detection and physics
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const gestureDetectedRef = useRef<'horizontal' | 'vertical' | null>(null);
  const widthRef = useRef<number>(0);
  const progressRef = useRef<number>(0); // Fractional progress (0-1) for smooth indicators

  function handlePointerDown(e: React.PointerEvent) {
    const el = trackRef.current;
    if (!el) return;

    widthRef.current = el.clientWidth;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    currentXRef.current = e.clientX;
    currentYRef.current = e.clientY;
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    isDraggingRef.current = true;
    gestureDetectedRef.current = null; // Reset gesture detection

    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current || !trackRef.current) return;

    currentXRef.current = e.clientX;
    currentYRef.current = e.clientY;

    const deltaX = currentXRef.current - startXRef.current;
    const deltaY = currentYRef.current - startYRef.current;

    // Gesture detection - only on first significant movement
    if (gestureDetectedRef.current === null) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Need at least 10px movement to detect
      if (absDeltaX > 10 || absDeltaY > 10) {
        // Require 3:1 ratio for horizontal gesture
        const ratio = absDeltaX / Math.max(absDeltaY, 1);
        gestureDetectedRef.current = ratio > 3 ? 'horizontal' : 'vertical';
      } else {
        // Not enough movement yet, wait
        return;
      }
    }

    // If vertical gesture detected - cancel drag, allow page scroll
    if (gestureDetectedRef.current === 'vertical') {
      isDraggingRef.current = false;
      return;
    }

    // If horizontal gesture - prevent scroll and update transform
    if (gestureDetectedRef.current === 'horizontal') {
      e.preventDefault();
      e.stopPropagation();

      // Calculate velocity for physics (pixels per millisecond)
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      if (dt > 0) {
        velocityRef.current = (currentXRef.current - lastXRef.current) / dt;
      }
      lastXRef.current = currentXRef.current;
      lastTimeRef.current = now;

      // Update fractional progress for smooth indicators
      progressRef.current = index + (-deltaX / widthRef.current);

      // Update transform - no state change, just visual
      requestAnimationFrame(() => {
        if (trackRef.current) {
          const percent = (deltaX / widthRef.current) * 100;
          trackRef.current.style.transform = `translateX(${-index * 100 + percent}%)`;
        }

        // Update parallax indicators position
        if (dotsContainerRef.current) {
          const dotWidth = 14; // 6-8px dot + 6px gap
          const progress = progressRef.current;
          const centerOffset = (maxVisibleDots / 2) - 0.5;

          let offset = (progress - centerOffset) * dotWidth;
          const minOffset = 0;
          const maxOffset = Math.max(0, (totalImages - maxVisibleDots) * dotWidth);
          offset = Math.max(minOffset, Math.min(maxOffset, offset));

          dotsContainerRef.current.style.transform = `translateX(${-offset}px)`;
          dotsContainerRef.current.style.transition = 'none';
        }
      });
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isDraggingRef.current) return;

    const deltaX = currentXRef.current - startXRef.current;
    const velocity = velocityRef.current;
    const wasHorizontalGesture = gestureDetectedRef.current === 'horizontal';

    isDraggingRef.current = false;
    gestureDetectedRef.current = null;

    // If no horizontal gesture detected, treat as tap
    if (!wasHorizontalGesture) {
      if (Math.abs(deltaX) < 6) {
        // Tap detected -> open product
        if (onClick) {
          onClick(product);
        } else {
          navigate(`/product/${id}`);
        }
      }
      return;
    }

    // Calculate target index based on distance + velocity (inertia)
    const threshold = widthRef.current * 0.18; // 18% threshold
    const velocityThreshold = 0.3; // pixels per ms (fast swipe)

    let targetIndex = index;

    // Strong velocity = instant swipe
    if (Math.abs(velocity) > velocityThreshold) {
      if (velocity < 0 && index < images.length - 1) {
        targetIndex = index + 1;
      } else if (velocity > 0 && index > 0) {
        targetIndex = index - 1;
      }
    }
    // Otherwise check distance threshold
    else if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && index < images.length - 1) {
        targetIndex = index + 1;
      } else if (deltaX > 0 && index > 0) {
        targetIndex = index - 1;
      }
    }

    // Apply spring animation with easing
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      trackRef.current.style.transform = `translateX(${-targetIndex * 100}%)`;

      setTimeout(() => {
        if (trackRef.current) {
          trackRef.current.style.transition = '';
        }
      }, 330);
    }

    // Animate indicators to final position
    if (dotsContainerRef.current) {
      const dotWidth = 14;
      const centerOffset = (maxVisibleDots / 2) - 0.5;
      let offset = (targetIndex - centerOffset) * dotWidth;
      const minOffset = 0;
      const maxOffset = Math.max(0, (totalImages - maxVisibleDots) * dotWidth);
      offset = Math.max(minOffset, Math.min(maxOffset, offset));

      dotsContainerRef.current.style.transition = 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      dotsContainerRef.current.style.transform = `translateX(${-offset}px)`;
    }

    // Update index state
    if (targetIndex !== index) {
      setIndex(targetIndex);
    }

    // Reset refs
    velocityRef.current = 0;
    progressRef.current = targetIndex;
  }

  // Update transform when index changes (non-drag)
  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translateX(${-index * 100}%)`;

    // Sync indicators position
    if (dotsContainerRef.current) {
      const dotWidth = 14;
      const centerOffset = (maxVisibleDots / 2) - 0.5;
      let offset = (index - centerOffset) * dotWidth;
      const minOffset = 0;
      const maxOffset = Math.max(0, (totalImages - maxVisibleDots) * dotWidth);
      offset = Math.max(minOffset, Math.min(maxOffset, offset));

      dotsContainerRef.current.style.transform = `translateX(${-offset}px)`;
    }

    progressRef.current = index;
  }, [index, maxVisibleDots, totalImages]);

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
          setIsFavorite(favoriteIds.includes(id));
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };

    checkFavorite();
  }, [user, id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      navigate('/profile');
      return;
    }

    if (isFavoriteLoading) return;

    try {
      setIsFavoriteLoading(true);

      if (isFavorite) {
        // Remove from favorites
        await apiFetch(`/api/favorites/${id}`, {
          method: 'DELETE'
        });
        setIsFavorite(false);
        if (onFavoriteChange) {
          onFavoriteChange(id);
        }
      } else {
        // Add to favorites
        await apiFetch(`/api/favorites/${id}`, {
          method: 'POST'
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
      className="overflow-hidden bg-card transition-all duration-150"
      style={{
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
        className="relative w-full overflow-hidden touch-pan-y"
        style={{ aspectRatio: '4 / 5', borderRadius: '12px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="flex h-full w-full"
          style={{ transform: `translateX(${-index * 100}%)` }}
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
          {brand && <span className="text-xs text-muted font-medium">{brand}</span>}
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
