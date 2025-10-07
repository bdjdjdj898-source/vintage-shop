import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface FloatingCartButtonProps {
  className?: string;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  const count = getTotalItems();

  const handleClick = () => {
    navigate('/cart');
  };

  const getCountLabel = (count: number): string => {
    if (count === 1) return 'товар';
    if (count >= 2 && count <= 4) return 'товара';
    return 'товаров';
  };

  return (
    <button
      aria-label={`Открыть корзину — ${count} ${getCountLabel(count)}`}
      onClick={handleClick}
      className={`fixed left-4 bottom-safe-bottom z-50
                  w-14 h-14 rounded-full flex items-center justify-center
                  bg-accent ring-1 ring-border shadow-xl transform transition-transform duration-150
                  hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${className ?? ''}`}
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Icon */}
      <ShoppingCart className="w-6 h-6 text-white" strokeWidth={2} aria-hidden="true" />

      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 text-[10px] rounded-full flex items-center justify-center bg-red-600 text-white font-semibold"
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;
