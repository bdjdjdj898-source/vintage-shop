import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderStatus, ORDER_STATUS_META } from '../types/api';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
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
      const response = await apiFetch('/api/orders');
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

  const getStatusInfo = (status: OrderStatus) => {
    return ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
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
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Мои заказы</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const shippingInfo = order.shippingInfo;

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

                  {/* Shipping Info */}
                  <div>
                    <h4 className="font-medium mb-3">Информация о доставке:</h4>
                    <div className="space-y-1 text-sm">
                      {shippingInfo.name && <p><strong>Имя:</strong> {shippingInfo.name}</p>}
                      {shippingInfo.phone && <p><strong>Телефон:</strong> {shippingInfo.phone}</p>}
                      {shippingInfo.address && <p><strong>Адрес:</strong> {shippingInfo.address}</p>}
                      {shippingInfo.email && <p><strong>Email:</strong> {shippingInfo.email}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            У вас пока нет заказов
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;