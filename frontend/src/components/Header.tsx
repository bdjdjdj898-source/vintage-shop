import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { cart } = useCart();

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm h-14"
      style={{
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 border-none bg-transparent transition-opacity hover:opacity-80"
          >
            <span className="text-2xl">🛍️</span>
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              Vintage Shop
            </h1>
          </button>

          {/* Navigation Icons */}
          <div className="flex items-center gap-1">
            {/* Cart Button */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                color: 'var(--color-text)',
                backgroundColor: 'transparent'
              }}
              aria-label="Корзина"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemsCount > 0 && (
                <span
                  className="absolute top-0 right-0 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: '#ffffff'
                  }}
                >
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Orders Button */}
            <button
              onClick={() => navigate('/orders')}
              className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                color: 'var(--color-text)',
                backgroundColor: 'transparent'
              }}
              aria-label="Заказы"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                color: 'var(--color-text)',
                backgroundColor: 'transparent'
              }}
              aria-label="Профиль"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{
                color: 'var(--color-accent)',
                backgroundColor: 'transparent'
              }}
              aria-label={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
