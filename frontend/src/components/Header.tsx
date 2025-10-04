import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b dark:bg-neutral-900/90" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-screen-xl mx-auto flex justify-between items-center p-3">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          👜 Vintage Shop
        </button>

        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2"
            style={{ color: 'var(--color-text)' }}
            aria-label="Корзина"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center bg-black text-white dark:bg-white dark:text-black">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="p-2"
            style={{ color: 'var(--color-text)' }}
            aria-label="Профиль"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
