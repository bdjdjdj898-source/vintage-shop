import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { useTelegram } from '../hooks/useTelegram';
import BottomNavigation from '../components/BottomNavigation';

const Cart: React.FC = () => {
  const { user } = useAuth();
  const { cart, isLoading, error, removeItem, updateQuantity, getTotalAmount } = useCart();
  const navigate = useNavigate();
  const { showMainButton, hideMainButton, hapticFeedback } = useTelegram();
  const [unavailableProducts, setUnavailableProducts] = useState<number[]>([]);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  useEffect(() => {
    // Show main button if cart has items
    if (cart && cart.items.length > 0) {
      showMainButton('Оформить заказ', () => {
        hapticFeedback.impact('medium');
        navigate('/checkout');
      });
    } else {
      hideMainButton();
    }

    return () => {
      hideMainButton();
    };
  }, [cart, showMainButton, hideMainButton, hapticFeedback, navigate]);


  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        width: '100%',
        overflowX: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '100%',
          padding: '16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '256px'
          }}>
            <div style={{
              fontSize: '18px',
              color: 'var(--text)'
            }}>
              Загрузка корзины...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        width: '100%',
        overflowX: 'hidden',
        paddingBottom: '80px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '640px',
          margin: '0 auto',
          padding: '16px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--text)',
            marginBottom: '24px'
          }}>
            Корзина
          </h1>

          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🛒
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '8px'
            }}>
              {user ? 'Ошибка загрузки корзины' : 'Требуется авторизация'}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              {user ? error : 'Откройте приложение через Telegram для доступа к корзине'}
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Вернуться к покупкам
            </Link>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const handleRemoveItem = async (itemId: number) => {
    try {
      hapticFeedback.impact('light');
      await removeItem(itemId);
      hapticFeedback.notification('success');
    } catch (err) {
      console.error('Error removing item:', err);
      hapticFeedback.notification('error');
    }
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      setQuantityError(null);
      hapticFeedback.selection();
      await updateQuantity(itemId, quantity);
      hapticFeedback.notification('success');
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      hapticFeedback.notification('error');

      // Handle typed ApiError
      if (err instanceof ApiError) {
        if (err.code === 'PRODUCT_UNAVAILABLE') {
          const item = cart?.items.find(item => item.id === itemId);
          if (item) {
            setUnavailableProducts(prev => [...prev, item.product.id]);
            setQuantityError('Некоторые товары в корзине больше недоступны');
          }
        } else {
          setQuantityError(err.message);
        }
      } else {
        const errorMessage = err.message || 'Произошла ошибка при обновлении количества';
        setQuantityError(errorMessage);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      paddingBottom: '80px',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        padding: '16px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '24px'
        }}>
          Корзина
        </h1>

        {/* Error Banner */}
        {quantityError && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #f87171',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex'
            }}>
              <div style={{
                flex: '1'
              }}>
                <p>{quantityError}</p>
                {unavailableProducts.length > 0 && (
                  <p style={{
                    fontSize: '14px',
                    marginTop: '4px'
                  }}>
                    Товары, которые больше недоступны, помечены серым цветом.
                  </p>
                )}
              </div>
              <button
                onClick={() => setQuantityError(null)}
                style={{
                  marginLeft: '16px',
                  color: '#b91c1c',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  padding: '0',
                  lineHeight: '1'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#7f1d1d'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#b91c1c'}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            padding: '24px',
            textAlign: 'center'
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '16px'
            }}>
              Ваша корзина пуста
            </p>
            <Link
              to="/"
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '8px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {cart.items.map((item) => {
              const isUnavailable = !item.product.isActive || unavailableProducts.includes(item.product.id);
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'var(--card)',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    padding: '16px',
                    opacity: isUnavailable ? '0.6' : '1'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}>
                    {item.product.images.length > 0 && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          filter: isUnavailable ? 'grayscale(100%)' : 'none',
                          flexShrink: 0
                        }}
                      />
                    )}
                    <div style={{
                      flex: '1',
                      minWidth: '150px'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: isUnavailable ? '#9ca3af' : 'var(--text)',
                        marginBottom: '4px'
                      }}>
                        {item.product.title}
                        {isUnavailable && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '14px',
                            color: '#ef4444',
                            fontWeight: 'normal'
                          }}>
                            (Недоступен)
                          </span>
                        )}
                      </h3>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        {item.product.brand} • {item.product.size} • {item.product.color}
                      </p>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: isUnavailable ? '#9ca3af' : 'var(--text)'
                      }}>
                        {item.product.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUnavailable}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: (item.quantity <= 1 || isUnavailable) ? 'not-allowed' : 'pointer',
                          opacity: (item.quantity <= 1 || isUnavailable) ? '0.5' : '1',
                          fontSize: '18px',
                          color: '#374151'
                        }}
                      >
                        -
                      </button>
                      <span style={{
                        width: '32px',
                        textAlign: 'center',
                        color: 'var(--text)',
                        fontWeight: '500'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={isUnavailable}
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: isUnavailable ? 'not-allowed' : 'pointer',
                          opacity: isUnavailable ? '0.5' : '1',
                          fontSize: '18px',
                          color: '#374151'
                        }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      style={{
                        color: '#ef4444',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}

            <div style={{
              backgroundColor: 'var(--card)',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              padding: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                color: 'var(--text)'
              }}>
                <span>Итого:</span>
                <span>{getTotalAmount().toLocaleString('ru-RU')} ₽</span>
              </div>
              <Link
                to="/checkout"
                style={{
                  width: '100%',
                  marginTop: '16px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  display: 'block',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Оформить заказ
              </Link>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Cart;
