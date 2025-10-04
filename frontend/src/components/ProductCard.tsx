import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const conditionText = (condition: number) => {
    if (condition >= 9) return 'Отлично';
    if (condition >= 7) return 'Хорошо';
    if (condition >= 5) return 'Средне';
    return 'Требует внимания';
  };

  const conditionColor = (condition: number) => {
    if (condition >= 9) return { bg: 'var(--color-success-bg)', text: 'var(--color-success-text)' };
    if (condition >= 7) return { bg: 'var(--color-info-bg)', text: 'var(--color-info-text)' };
    if (condition >= 5) return { bg: 'var(--color-warning-bg)', text: 'var(--color-warning-text)' };
    return { bg: 'var(--color-error-bg)', text: 'var(--color-error-text)' };
  };

  const colors = conditionColor(product.condition);

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full"
      onClick={handleClick}
      style={{
        backgroundColor: 'var(--color-card)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop&auto=format';
          }}
          loading="lazy"
        />

        {/* Condition Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium shadow-sm"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {conditionText(product.condition)}
        </div>

        {/* Multiple Images Indicator */}
        {product.images.length > 1 && (
          <div
            className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium shadow-sm backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', color: '#ffffff' }}
          >
            📷 {product.images.length}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-accent)' }}>
          {product.brand}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold mb-2 line-clamp-2 min-h-[2.5rem]" style={{ color: 'var(--color-text)' }}>
          {product.title}
        </h3>

        {/* Size and Color */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: 'var(--color-pill)', color: 'var(--color-muted)' }}
          >
            {product.size}
          </span>
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: 'var(--color-pill)', color: 'var(--color-muted)' }}
          >
            {product.color}
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {formatCurrency(product.price)}
            </p>
            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {product.condition}/10
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
