import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface FloatingCartButtonProps {
  className?: string;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ className }) => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();

  const count = getTotalItems();

  // Скрываем кнопку если корзина пустая
  if (count === 0) {
    return null;
  }

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
      className={`fixed right-4 z-50
                  w-14 h-14 rounded-full flex items-center justify-center
                  bg-accent shadow-2xl transform transition-all duration-200
                  hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none ${className ?? ''}`}
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Shopping Bag Icon */}
      <ShoppingBag className="w-7 h-7 text-white" strokeWidth={2.5} aria-hidden="true" />

      {/* Badge with count */}
      <span
        className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] px-1.5 text-[11px] rounded-full flex items-center justify-center bg-white text-accent font-bold shadow-md"
        aria-hidden="true"
      >
        {count > 99 ? '99' : count}
      </span>
    </button>
  );
};

export default FloatingCartButton;
