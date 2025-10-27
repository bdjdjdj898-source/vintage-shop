import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegramBackButton } from '../hooks/useTelegramUI';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
  };
  topProducts: {
    product: {
      id: number;
      title: string;
      brand: string;
      price: number;
      images: string[];
    };
    totalSold: number;
  }[];
}

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Telegram Back Button
  useTelegramBackButton(() => navigate(-1));

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch('/api/admin/analytics');

      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Не удалось загрузить аналитику');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        paddingBottom: '80px'
      }}>
        <Header hideSearch={true} />

        <div style={{
          padding: '16px',
          maxWidth: '640px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        paddingBottom: '80px'
      }}>
        <Header hideSearch={true} />

        <div style={{
          padding: '16px',
          maxWidth: '640px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>⚠️</div>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              {error || 'Ошибка загрузки данных'}
            </p>
            <button
              onClick={fetchAnalytics}
              style={{
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Повторить
            </button>
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
      <Header title="Аналитика" showBackButton />

      <div style={{
        padding: '16px',
        maxWidth: '640px',
        margin: '0 auto'
      }}>
        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {/* Total Revenue */}
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginRight: '8px'
              }}>
                💰
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Выручка
              </div>
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>
              {formatCurrency(analytics.overview.totalRevenue)}
            </div>
          </div>

          {/* Total Orders */}
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginRight: '8px'
              }}>
                📦
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Заказов
              </div>
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#10b981'
            }}>
              {analytics.overview.totalOrders}
            </div>
          </div>

          {/* Total Products */}
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginRight: '8px'
              }}>
                🛍️
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Товаров
              </div>
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#f59e0b'
            }}>
              {analytics.overview.totalProducts}
            </div>
          </div>

          {/* Total Users */}
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#e9d5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginRight: '8px'
              }}>
                👥
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '500'
              }}>
                Пользователей
              </div>
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#9333ea'
            }}>
              {analytics.overview.totalUsers}
            </div>
          </div>
        </div>

        {/* Top Products */}
        {analytics.topProducts && analytics.topProducts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--text)',
              marginBottom: '12px'
            }}>
              Топ товаров
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {analytics.topProducts.map((item, index) => (
                <div
                  key={item.product.id}
                  style={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '16px',
                    padding: '12px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: index === 0 ? '#fef3c7' : index === 1 ? '#e5e7eb' : '#fed7aa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: index === 0 ? '#f59e0b' : index === 1 ? '#6b7280' : '#f97316',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--border)'
                  }}>
                    {item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.product.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '4px'
                    }}>
                      {item.product.brand} • Продано: {item.totalSold} шт.
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {formatCurrency(item.product.price * item.totalSold)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!analytics.topProducts || analytics.topProducts.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>📊</div>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)'
            }}>
              Пока нет данных для отображения
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AdminAnalytics;
