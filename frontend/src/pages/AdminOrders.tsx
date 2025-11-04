import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { Order, OrderStatus, ORDER_STATUS_META, User } from '../types/api';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegramBackButton } from '../hooks/useTelegramUI';

// Extended Order interface with user info for admin
interface AdminOrder extends Order {
  user: Pick<User, 'id' | 'telegramId' | 'firstName' | 'lastName' | 'username'>;
}

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Telegram Back Button
  useTelegramBackButton(() => navigate(-1));

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = statusFilter === 'all'
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${statusFilter}`;
      const response = await apiFetch(url);
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

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (response.success) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, status: newStatus }
              : order
          )
        );
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Ошибка обновления статуса заказа');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusInfo = (status: OrderStatus) => {
    return ORDER_STATUS_META[status] || ORDER_STATUS_META.pending;
  };

  const getUserDisplayName = (user: AdminOrder['user']) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || `User #${user.telegramId}`;
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        paddingBottom: '80px'
      }}>
        <Header hideSearch={true} showBack={true} />
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '256px'
          }}>
            <div style={{ fontSize: '18px', color: 'var(--text)' }}>
              Загрузка заказов...
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        paddingBottom: '80px'
      }}>
        <Header hideSearch={true} showBack={true} />
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '256px'
          }}>
            <div style={{ fontSize: '18px', color: '#ef4444' }}>
              {error}
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      paddingBottom: '80px'
    }}>
      <Header hideSearch={true} showBack={true} />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '16px',
          marginTop: 0
        }}>
          Управление заказами
        </h1>

        {/* Status Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '20px',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {(['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: statusFilter === status ? 'var(--text)' : 'var(--card)',
                color: statusFilter === status ? 'var(--bg)' : 'var(--text)',
                transition: 'all 0.2s'
              }}
            >
              {status === 'all' ? 'Все' : ORDER_STATUS_META[status].label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const shippingInfo = order.shippingInfo;

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--card)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Order Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      margin: '0 0 4px 0'
                    }}>
                      Заказ #{order.id}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      margin: 0
                    }}>
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'var(--text)',
                      margin: '0 0 4px 0'
                    }}>
                      {order.totalAmount.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div style={{
                  backgroundColor: 'var(--bg)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    margin: '0 0 8px 0'
                  }}>
                    Покупатель:
                  </h4>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Имя:</strong> {getUserDisplayName(order.user)}
                    </div>
                    {order.user.username && (
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Username:</strong> @{order.user.username}
                      </div>
                    )}
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Telegram ID:</strong> {order.user.telegramId}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    margin: '0 0 12px 0'
                  }}>
                    Товары:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                          backgroundColor: 'var(--bg)',
                          borderRadius: '8px'
                        }}
                      >
                        {item.product.images.length > 0 && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              flexShrink: 0
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'var(--text)',
                            margin: '0 0 4px 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.product.title}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            margin: 0
                          }}>
                            {item.product.brand} • {item.quantity} шт. • {item.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    margin: '0 0 8px 0'
                  }}>
                    Информация о доставке:
                  </h4>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {shippingInfo.name && (
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Имя:</strong> {shippingInfo.name}
                      </div>
                    )}
                    {shippingInfo.phone && (
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Телефон:</strong> {shippingInfo.phone}
                      </div>
                    )}
                    {shippingInfo.address && (
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Адрес:</strong> {shippingInfo.address}
                      </div>
                    )}
                    {shippingInfo.email && (
                      <div>
                        <strong style={{ color: 'var(--text)' }}>Email:</strong> {shippingInfo.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Selector */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '8px'
                  }}>
                    Статус заказа:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                    disabled={updatingOrderId === order.id}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: updatingOrderId === order.id ? 'not-allowed' : 'pointer',
                      opacity: updatingOrderId === order.id ? 0.6 : 1
                    }}
                  >
                    {Object.entries(ORDER_STATUS_META).map(([status, meta]) => (
                      <option key={status} value={status}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === order.id && (
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginTop: '4px',
                      marginBottom: 0
                    }}>
                      Обновление...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '12px',
            padding: '48px 32px',
            textAlign: 'center',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📦
            </div>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              {statusFilter === 'all' ? 'Заказов пока нет' : `Нет заказов со статусом "${ORDER_STATUS_META[statusFilter as OrderStatus]?.label}"`}
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AdminOrders;
