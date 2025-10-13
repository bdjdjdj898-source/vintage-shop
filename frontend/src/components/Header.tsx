import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--bg)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          Vintage Shop
        </h1>

        <button
          onClick={() => navigate('/search')}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text)',
            transition: 'opacity 150ms'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          aria-label="Поиск"
        >
          <Search size={24} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

export default Header;
