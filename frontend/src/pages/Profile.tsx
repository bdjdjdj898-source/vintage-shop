import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const Profile: React.FC = () => {
  const { user, telegramUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-gray-900" style={{ paddingBottom: '80px' }}>
      <Header hideSearch />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500 text-white text-center py-4 mb-4 text-2xl font-bold rounded-lg">
          ⚡ ОБНОВЛЕНО 10.10.2025 18:30 ⚡
        </div>
        <h1 className="text-3xl font-bold text-text dark:text-white mb-8">
          Личный кабинет
        </h1>

        {/* User Info Card */}
        <div className="bg-card dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-accent dark:bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {telegramUser?.first_name?.[0] || user?.firstName?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text dark:text-white">
                {telegramUser?.first_name || user?.firstName} {telegramUser?.last_name || user?.lastName}
              </h2>
              {(telegramUser?.username || user?.username) && (
                <p className="text-text-secondary dark:text-gray-400">
                  @{telegramUser?.username || user?.username}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-text-secondary dark:text-gray-400">Telegram ID</span>
              <span className="text-text dark:text-white font-medium">
                {telegramUser?.id || user?.telegramId}
              </span>
            </div>

            {user?.createdAt && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-text-secondary dark:text-gray-400">Дата регистрации</span>
                <span className="text-text dark:text-white font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-text-secondary dark:text-gray-400">Роль</span>
              <span className="text-text dark:text-white font-medium">
                {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>

            {telegramUser?.is_premium && (
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary dark:text-gray-400">Статус</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  ⭐ Telegram Premium
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Panel Button - Only for admins */}
        {user?.role === 'admin' && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg shadow-lg p-6 text-left transition-all transform hover:scale-[1.02]"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">⚡ Админ панель</h3>
                  <p className="text-sm text-white/80">Управление магазином</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="bg-card dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-accent-light dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text dark:text-white">Мои заказы</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">История покупок</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="bg-card dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text dark:text-white">Корзина</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">Товары в корзине</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-card dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg shadow-md p-6 text-left transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text dark:text-white">Каталог</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">Все товары</p>
              </div>
            </div>
          </button>
        </div>

        {/* Settings */}
        <div className="bg-card dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-text dark:text-white mb-4">Настройки</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-medium text-text dark:text-white">Тема оформления</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">
                  {theme === 'light' ? 'Светлая' : 'Темная'} тема
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Переключить тему"
              >
                {theme === 'light' ? (
                  <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;
