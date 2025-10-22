import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, Clock, Trash2 } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface SearchHistoryItem {
  id: number;
  query: string;
  createdAt: string;
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user } = useAuth();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    try {
      const response = await apiFetch('/api/search-history');
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Save to history if user is authenticated
    if (user) {
      try {
        await apiFetch('/api/search-history', {
          method: 'POST',
          body: JSON.stringify({ query: query.trim() })
        });
      } catch (error) {
        console.error('Error saving search history:', error);
      }
    }

    // Set search query and navigate to home
    setSearchQuery(query.trim());
    navigate('/');
  };

  const handleHistoryClick = (query: string) => {
    setLocalQuery(query);
    handleSearch(query);
  };

  const handleClearHistory = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await apiFetch('/api/search-history', {
        method: 'DELETE'
      });
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setLocalQuery('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Search input */}
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <SearchIcon
              size={20}
              strokeWidth={2}
              style={{
                position: 'absolute',
                left: '12px',
                color: '#9ca3af',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Поиск"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(localQuery);
                }
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '10px 40px 10px 40px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6',
                fontSize: '15px',
                color: '#111827',
                outline: 'none'
              }}
            />
            {localQuery && (
              <button
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '12px',
                  padding: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#9ca3af'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div style={{
        flex: 1,
        padding: '16px'
      }}>
        {user && history.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={16} />
                История поиска
              </div>
              <button
                onClick={handleClearHistory}
                disabled={isLoading}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  fontSize: '13px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                <Trash2 size={14} />
                Очистить историю
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item.query)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'var(--surface)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                  }}
                >
                  <Clock size={16} style={{ color: '#9ca3af', flexShrink: 0 }} />
                  <span style={{
                    fontSize: '15px',
                    color: 'var(--text)',
                    flex: 1
                  }}>
                    {item.query}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {user && history.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            История поиска пуста
          </div>
        )}

        {!user && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            Войдите, чтобы сохранять историю поиска
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
