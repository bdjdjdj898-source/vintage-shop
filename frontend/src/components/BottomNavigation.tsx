import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user);
    }
  }, []);

  const tabs = [
    {
      id: 'home',
      label: 'Главная',
      icon: Home,
      path: '/'
    },
    {
      id: 'favorites',
      label: 'Избранное',
      icon: Heart,
      path: '/favorites'
    },
    {
      id: 'cart',
      label: 'Корзина',
      icon: ShoppingBag,
      path: '/cart'
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: User,
      path: '/profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--bg)',
      borderTop: '1px solid var(--border)',
      zIndex: 50,
      paddingTop: '12px',
      paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 4px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              {tab.id === 'profile' && telegramUser?.photo_url ? (
                <img
                  src={telegramUser.photo_url}
                  alt="Profile"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: active ? '2px solid var(--tg-theme-link-color, #2481cc)' : '2px solid transparent'
                  }}
                />
              ) : (
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  style={{
                    color: active ? 'var(--tg-theme-link-color, #2481cc)' : 'var(--text-secondary)',
                    transition: 'color 0.2s'
                  }}
                />
              )}
              <span style={{
                fontSize: '11px',
                fontWeight: active ? 500 : 400,
                color: active ? 'var(--tg-theme-link-color, #2481cc)' : 'var(--text-secondary)',
                transition: 'color 0.2s'
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
