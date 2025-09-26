import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';

interface AnalyticsOverview {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
}

interface TopProduct {
  product: {
    id: number;
    title: string;
    brand: string;
    price: number;
    images: string[];
  };
  totalSold: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  topProducts: TopProduct[];
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
  error?: string;
}

const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
          <Link
            to="/admin"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться в админ-панель
          </Link>
        </div>
      </div>
    );
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch('/api/admin/analytics') as AnalyticsResponse;

      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError('Ошибка загрузки аналитики');
      }
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err);
      setError('Ошибка сервера при загрузке аналитики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
            <div className="text-lg">Загрузка аналитики...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Данные аналитики не найдены</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Аналитика</h1>
            <p className="text-gray-600 mt-1">Статистика и показатели эффективности</p>
          </div>
          <Link
            to="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Назад в админ-панель
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📦</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего заказов</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.overview.totalOrders)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общая выручка</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Пользователей</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.overview.totalUsers)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-lg">👕</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активных товаров</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(analytics.overview.totalProducts)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Топ товаров по продажам</h2>
            <p className="text-sm text-gray-500 mt-1">Самые популярные товары по количеству проданных единиц</p>
          </div>

          {analytics.topProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Данные о продажах не найдены
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {analytics.topProducts.map((item, index) => (
                <div key={item.product.id} className="p-6 flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {item.product.images.length > 0 && (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.product.brand}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Продано: {formatNumber(item.totalSold)}
                    </p>
                    <p className="text-sm text-gray-500">
                      на {formatCurrency(item.product.price * item.totalSold)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Обновление...' : 'Обновить данные'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;