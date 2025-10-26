import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            Доступ запрещен
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '16px'
          }}>
            У вас нет прав для просмотра этой страницы
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: '📦',
      title: 'Управление товарами',
      subtitle: 'Просмотр каталога товаров',
      path: '/admin/products',
      bgColor: '#fef3c7'
    },
    {
      icon: '📋',
      title: 'Управление заказами',
      subtitle: 'Просмотр всех заказов',
      path: '/admin/orders',
      bgColor: '#fee2e2'
    },
    {
      icon: '👥',
      title: 'Управление пользователями',
      subtitle: 'Просмотр списка пользователей',
      path: '/admin/users',
      bgColor: '#dbeafe'
    },
    {
      icon: '📊',
      title: 'Аналитика',
      subtitle: 'Статистика продаж и пользователей',
      path: '/admin/analytics',
      bgColor: '#e9d5ff'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      paddingBottom: '80px'
    }}>
      <Header hideSearch />

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              marginLeft: '-8px',
              marginRight: '8px'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--text)',
            margin: 0
          }}>
            Панель администратора
          </h1>
        </div>

        {/* Menu Grid */}
        <div style={{
          display: 'grid',
          gap: '12px'
        }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                width: '100%',
                backgroundColor: 'var(--card)',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: item.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginBottom: '4px'
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  {item.subtitle}
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.4, flexShrink: 0 }}>
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Admin;
