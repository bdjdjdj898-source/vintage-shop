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

  // Drag state
  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef<number>(0);
  const draggingRef = useRef(false);
  const WIDTH_REF = useRef<number>(0);

  function handlePointerDown(e: React.PointerEvent) {
    const el = trackRef.current;
    if (!el) return;
    WIDTH_REF.current = el.clientWidth;
    startXRef.current = e.clientX;
    deltaXRef.current = 0;
    draggingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || startXRef.current === null) return;
    deltaXRef.current = e.clientX - startXRef.current;

    // Prevent page scroll when swiping horizontally
    if (Math.abs(deltaXRef.current) > 5) {
      e.preventDefault();
    }

    // Update visual transform — no state change yet
    requestAnimationFrame(() => {
      if (trackRef.current) {
        const percent = (deltaXRef.current / WIDTH_REF.current) * 100;
        trackRef.current.style.transform = `translateX(${-index * 100 + percent}%)`;
      }
    });
  }

  function handlePointerUp(e: React.PointerEvent) {
    draggingRef.current = false;
    const delta = deltaXRef.current;
    const threshold = WIDTH_REF.current * 0.18; // 18% swipe threshold

    // Determine if it's a swipe or tap
    if (Math.abs(delta) > threshold) {
      // It's a swipe
      if (delta < 0 && index < images.length - 1) {
        setIndex(i => i + 1);
      } else if (delta > 0 && index > 0) {
        setIndex(i => i - 1);
      }
    } else if (Math.abs(delta) < 6) {
      // It's a tap (minimal movement) -> open product
      if (onClick) {
        onClick(product);
      } else {
        navigate(`/product/${id}`);
      }
    }

    // Reset transform with animation
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 220ms ease';
      trackRef.current.style.transform = `translateX(${-index * 100}%)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = '';
      }, 230);
    }

    startXRef.current = null;
    deltaXRef.current = 0;
  }

  // Update transform when index changes (non-drag)
  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translateX(${-index * 100}%)`;
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

        {/* Dots indicator - always visible */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {images.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === index ? '8px' : '6px',
                height: i === index ? '8px' : '6px',
                backgroundColor: '#ffffff',
                opacity: i === index ? 1 : 0.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                borderRadius: '50%',
                transition: 'all 150ms',
              }}
            />
          ))}
        </div>

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
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', textAlign: 'center' }}>
        {brand && <span className="text-xs text-muted font-medium">{brand}</span>}
        <h3 className="line-clamp-2" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text)', lineHeight: '1.5', margin: 0 }}>
          {title}
        </h3>
        <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>{formatCurrency(price)}</span>
      </div>
    </article>
  );
};

export default ProductCard;
