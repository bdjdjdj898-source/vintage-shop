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
    <article className="rounded-xl overflow-hidden bg-card border border-border">
      <div
        className="relative w-full overflow-hidden touch-pan-y"
        style={{ aspectRatio: '4 / 5' }}
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

        {/* Dots indicator */}
        {images.length > 1 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-3 px-2 py-1 rounded-full flex items-center gap-2"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(4px)' }}
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(ev) => {
                  ev.stopPropagation();
                  setIndex(i);
                }}
                aria-label={`Изображение ${i + 1}`}
                className={`rounded-full transition-all duration-150 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none ${
                  i === index
                    ? 'w-2.5 h-2.5 bg-white'
                    : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-3">
        {brand && <div className="text-xs text-muted mb-1">{brand}</div>}
        <h3 className="text-sm font-semibold text-text line-clamp-2 leading-tight mb-1">
          {title}
        </h3>
        <div className="text-sm font-semibold text-text">{formatCurrency(price)}</div>
      </div>
    </article>
  );
};

export default ProductCard;
