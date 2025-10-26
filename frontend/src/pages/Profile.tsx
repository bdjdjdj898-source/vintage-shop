import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const Profile: React.FC = () => {
  const { user, telegramUser } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' г.';
  };

  const handleLogout = () => {
    // Telegram WebApp doesn't really need logout, but we can navigate to home
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      paddingBottom: '80px'
    }}>
      <Header hideSearch />

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        {/* User Profile Card */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '32px 16px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#4ade80',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {telegramUser?.first_name?.[0] || user?.firstName?.[0] || 'A'}
          </div>

          {/* Name */}
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            {user?.role === 'admin' ? 'Администратор' : (telegramUser?.first_name || user?.firstName || 'Пользователь')}
          </h2>

          {/* Username */}
          {(telegramUser?.username || user?.username) && (
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '0'
            }}>
              @{telegramUser?.username || user?.username}
            </p>
          )}
        </div>

        {/* Menu Items */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          {/* История заказов */}
          <button
            onClick={() => navigate('/orders')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: '1px solid var(--border)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>📦</span>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--text)',
                marginBottom: '2px'
              }}>
                История заказов
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4 }}>
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Связаться с поддержкой */}
          <button
            onClick={() => {
              if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.openTelegramLink('https://t.me/your_support_bot');
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: user?.role === 'admin' ? '1px solid var(--border)' : 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--text)',
                marginBottom: '2px'
              }}>
                Связаться с поддержкой
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4 }}>
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Админ панель - только для админов */}
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#e9d5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>⚙️</span>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: 'var(--text)',
                  marginBottom: '2px'
                }}>
                  Админ панель
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  Управление магазином
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4 }}>
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* User Info Card */}
        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{
                  padding: '12px 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)'
                }}>
                  Telegram ID
                </td>
                <td style={{
                  padding: '12px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text)',
                  textAlign: 'right',
                  borderBottom: '1px solid var(--border)'
                }}>
                  {telegramUser?.id || user?.telegramId || '—'}
                </td>
              </tr>
              {user?.createdAt && (
                <tr>
                  <td style={{
                    padding: '12px 0',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    Дата регистрации
                  </td>
                  <td style={{
                    padding: '12px 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text)',
                    textAlign: 'right',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              )}
              <tr>
                <td style={{
                  padding: '12px 0',
                  fontSize: '14px',
                  color: 'var(--text-secondary)'
                }}>
                  Роль
                </td>
                <td style={{
                  padding: '12px 0',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text)',
                  textAlign: 'right'
                }}>
                  {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
        >
          Выйти
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
