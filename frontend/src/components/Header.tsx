import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShoppingCart, User, Sun, Moon } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b dark:bg-neutral-900/90" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 py-2">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-bold text-text"
        >
          👜 Vintage Shop
        </button>

        <div className="flex items-center gap-2">
          {/* Cart - hidden on mobile, shown on desktop */}
          <button
            onClick={() => navigate('/cart')}
            className="hidden md:flex relative w-9 h-9 items-center justify-center rounded-full bg-surface border border-border hover:scale-105 transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Корзина"
          >
            <ShoppingCart className="w-5 h-5 text-muted" strokeWidth={1.5} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border hover:scale-105 transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Профиль"
          >
            <User className="w-5 h-5 text-muted" strokeWidth={1.5} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border hover:scale-105 transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            aria-label="Сменить тему"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-muted" strokeWidth={1.5} />
            ) : (
              <Sun className="w-5 h-5 text-muted" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
