import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const { user, telegramUser } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Панель администратора</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Управление товарами</h3>
            <p className="text-gray-600 text-sm mb-4">
              Добавление, редактирование и удаление товаров
            </p>
            <Link
              to="/admin/products"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Открыть
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Управление заказами</h3>
            <p className="text-gray-600 text-sm mb-4">
              Просмотр и изменение статусов заказов
            </p>
            <Link
              to="/admin/orders"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Открыть
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Аналитика</h3>
            <p className="text-gray-600 text-sm mb-4">
              Статистика продаж и пользователей
            </p>
            <button
              disabled
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Скоро
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Добро пожаловать в админ-панель, {user?.firstName || telegramUser?.first_name}!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Выберите раздел для управления системой.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;