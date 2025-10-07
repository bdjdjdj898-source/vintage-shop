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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b dark:bg-neutral-900/90" style={{ borderColor: 'var(--color-border)' }}>
      <div className="max-w-screen-xl mx-auto flex justify-between items-center px-4 py-2">
        <button
          onClick={() => navigate('/')}
          className="text-lg font-bold"
          style={{ color: 'var(--color-text)' }}
        >
          👜 Vintage Shop
        </button>

        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-700 dark:text-gray-300"
            aria-label="Корзина"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-700 dark:text-gray-300"
            aria-label="Профиль"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition text-gray-700 dark:text-gray-300"
            aria-label="Сменить тему"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
