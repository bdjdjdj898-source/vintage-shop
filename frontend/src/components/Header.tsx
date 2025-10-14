import React from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';

const Header: React.FC = () => {
  const { searchQuery, setSearchQuery } = useSearch();

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
        padding: '8px 16px 12px 16px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          Vintage Shop
        </h1>

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
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#f3f4f6',
              fontSize: '15px',
              color: 'var(--text)',
              outline: 'none'
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
