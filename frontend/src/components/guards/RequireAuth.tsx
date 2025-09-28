import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="text-blue-500 text-xl mb-4">🔐</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 mb-4">
            Для доступа к этой странице необходимо войти через Telegram.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к каталогу
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;