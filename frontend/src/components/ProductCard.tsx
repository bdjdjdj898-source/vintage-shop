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
      className="rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={product.images[0]}
        alt={product.title}
        className="aspect-square object-cover w-full"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop&auto=format';
        }}
        loading="lazy"
      />
      <div className="p-3">
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {product.brand}
        </div>
        <div className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--color-text)' }}>
          {product.title}
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>
          {formatCurrency(product.price)}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
