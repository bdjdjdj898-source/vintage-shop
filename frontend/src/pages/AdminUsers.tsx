import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { User } from '../types/api';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegramBackButton } from '../hooks/useTelegramUI';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Telegram Back Button
  useTelegramBackButton(() => {
    localStorage.removeItem('lastAdminTab');
    navigate(-1);
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiFetch('/api/admin/users');
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const username = (user.username || '').toLowerCase();
        const telegramId = user.telegramId.toLowerCase();
        return fullName.includes(query) || username.includes(query) || telegramId.includes(query);
      });
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => statusFilter === 'banned' ? user.isBanned : !user.isBanned);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const toggleUserBan = async (userId: number, currentBanStatus: boolean) => {
    try {
      setUpdatingUserId(userId);
      const response = await apiFetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ isBanned: !currentBanStatus })
      });

      if (response.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, isBanned: !currentBanStatus }
              : user
          )
        );
      }
    } catch (err) {
      console.error('Error updating user ban status:', err);
      alert('Ошибка обновления статуса пользователя');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const changeUserRole = async (userId: number, newRole: 'admin' | 'user') => {
    try {
      setUpdatingUserId(userId);
      const response = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });

      if (response.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, role: newRole }
              : user
          )
        );
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Ошибка обновления роли пользователя');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || `User #${user.telegramId}`;
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        paddingBottom: '80px'
      }}>
        <Header hideSearch={true} />
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '256px'
          }}>
            <div style={{ fontSize: '18px', color: 'var(--text)' }}>
              Загрузка пользователей...
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
        <Header hideSearch={true} />
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
      <Header hideSearch={true} />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px' }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'var(--text)',
          marginBottom: '16px',
          marginTop: 0
        }}>
          Управление пользователями
        </h1>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Поиск по имени, username или Telegram ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Role Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '12px',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {(['all', 'admin', 'user'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: roleFilter === role ? 'var(--text)' : 'var(--card)',
                color: roleFilter === role ? 'var(--bg)' : 'var(--text)',
                transition: 'all 0.2s'
              }}
            >
              {role === 'all' ? 'Все роли' : role === 'admin' ? 'Администраторы' : 'Пользователи'}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '20px',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {(['all', 'active', 'banned'] as const).map((status) => (
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
              {status === 'all' ? 'Все статусы' : status === 'active' ? 'Активные' : 'Заблокированные'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Найдено пользователей:
          </span>
          <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>
            {filteredUsers.length}
          </span>
        </div>

        {/* Users List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentUsers.map((user) => (
            <div
              key={user.id}
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border)'
              }}
            >
              {/* User Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    margin: '0 0 4px 0'
                  }}>
                    {getUserDisplayName(user)}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    margin: 0
                  }}>
                    {user.username ? `@${user.username}` : `ID: ${user.telegramId}`}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  alignItems: 'flex-end'
                }}>
                  {/* Role Badge */}
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                    color: user.role === 'admin' ? '#3b82f6' : '#6b7280'
                  }}>
                    {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                  </span>
                  {/* Ban Badge */}
                  {user.isBanned && (
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: '#fee2e2',
                      color: '#ef4444'
                    }}>
                      Заблокирован
                    </span>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div style={{
                backgroundColor: 'var(--bg)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>Telegram ID:</strong> {user.telegramId}
                  </div>
                  {user.username && (
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Username:</strong> @{user.username}
                    </div>
                  )}
                  {user.firstName && (
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Имя:</strong> {user.firstName}
                    </div>
                  )}
                  {user.lastName && (
                    <div>
                      <strong style={{ color: 'var(--text)' }}>Фамилия:</strong> {user.lastName}
                    </div>
                  )}
                  <div>
                    <strong style={{ color: 'var(--text)' }}>Зарегистрирован:</strong>{' '}
                    {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Role Selector */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '8px'
                  }}>
                    Роль:
                  </label>
                  <select
                    value={user.role}
                    onChange={(e) => changeUserRole(user.id, e.target.value as 'admin' | 'user')}
                    disabled={updatingUserId === user.id}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: updatingUserId === user.id ? 'not-allowed' : 'pointer',
                      opacity: updatingUserId === user.id ? 0.6 : 1
                    }}
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                {/* Ban/Unban Button */}
                <button
                  onClick={() => toggleUserBan(user.id, user.isBanned)}
                  disabled={updatingUserId === user.id}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: updatingUserId === user.id ? 'not-allowed' : 'pointer',
                    backgroundColor: user.isBanned ? '#10b981' : '#ef4444',
                    color: '#ffffff',
                    opacity: updatingUserId === user.id ? 0.6 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {updatingUserId === user.id
                    ? 'Обновление...'
                    : user.isBanned
                      ? 'Разблокировать пользователя'
                      : 'Заблокировать пользователя'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
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
              👥
            </div>
            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              {searchQuery
                ? 'Пользователи не найдены'
                : 'Пользователей пока нет'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              ← Назад
            </button>

            {/* Page Numbers */}
            <div style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  // Add ellipsis
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span style={{
                          padding: '8px 4px',
                          color: 'var(--text-secondary)',
                          fontSize: '14px'
                        }}>
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => paginate(page)}
                        style={{
                          minWidth: '36px',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: currentPage === page ? 'var(--text)' : 'var(--card)',
                          color: currentPage === page ? 'var(--bg)' : 'var(--text)',
                          fontSize: '14px',
                          fontWeight: currentPage === page ? '600' : '500',
                          cursor: 'pointer'
                        }}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--card)',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Вперед →
            </button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AdminUsers;
