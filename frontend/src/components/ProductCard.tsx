import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const navigate = useNavigate();
  const { images, brand, title, price, id } = product;
  const [index, setIndex] = useState(0);
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
  React.useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transform = `translateX(${-index * 100}%)`;
  }, [index]);

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
      </div>

      {/* Meta */}
      <div className="p-3 sm:p-4 flex flex-col gap-1">
        {brand && <span className="text-xs text-muted font-medium">{brand}</span>}
        <h3 className="text-sm font-semibold text-text line-clamp-2 leading-snug">
          {title}
        </h3>
        <span className="text-base font-semibold text-text mt-0.5">{formatCurrency(price)}</span>
      </div>
    </article>
  );
};

export default ProductCard;
