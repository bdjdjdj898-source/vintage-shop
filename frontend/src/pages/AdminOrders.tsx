import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderStatus, ORDER_STATUS_META } from '../types/api';

const AdminOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/admin/orders?limit=50');
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Ошибка загрузки заказов');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.success) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        ));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Ошибка обновления статуса заказа');
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    return ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;
  };

  const parseShippingInfo = (shippingInfoStr: string) => {
    try {
      return JSON.parse(shippingInfoStr);
    } catch {
      return {};
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Загрузка заказов...</div>
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
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Управление заказами</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const shippingInfo = parseShippingInfo(order.shippingInfo);

            return (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Заказ #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {order.totalAmount.toLocaleString('ru-RU')} ₽
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">Товары:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          {item.product.images.length > 0 && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.product.title}</p>
                            <p className="text-xs text-gray-600">
                              {item.product.brand} • {item.quantity} шт. • {item.price.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info & Actions */}
                  <div>
                    <h4 className="font-medium mb-3">Информация о доставке:</h4>
                    <div className="space-y-1 text-sm mb-4">
                      {shippingInfo.name && <p><strong>Имя:</strong> {shippingInfo.name}</p>}
                      {shippingInfo.phone && <p><strong>Телефон:</strong> {shippingInfo.phone}</p>}
                      {shippingInfo.address && <p><strong>Адрес:</strong> {shippingInfo.address}</p>}
                      {shippingInfo.email && <p><strong>Email:</strong> {shippingInfo.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Изменить статус:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(ORDER_STATUS_META).map(([value, meta]) => (
                          <option key={value} value={value}>
                            {meta.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Заказы не найдены
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;