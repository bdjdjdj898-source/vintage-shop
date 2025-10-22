import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';

interface HeaderProps {
  hideSearch?: boolean;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideSearch = false, showBack = false }) => {
  const navigate = useNavigate();
  const { searchQuery } = useSearch();

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
        paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))',
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingBottom: '12px',
        position: 'relative'
      }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              left: '16px',
              top: '8px',
              padding: '4px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text)',
              zIndex: 1
            }}
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 500,
          color: 'var(--text)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          marginBottom: hideSearch ? 0 : '8px',
          letterSpacing: '-0.5px',
          textAlign: 'center'
        }}>
          Vintage Shop
        </h1>

        {!hideSearch && (
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              strokeWidth={2}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onFocus={() => navigate('/search')}
              readOnly
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                fontSize: '15px',
                color: 'var(--text)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
