import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTelegramWebApp } from '../utils/telegram';
import { setTelegramInitData, apiFetch } from '../api/client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface User {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  telegramUser: TelegramUser | null;
  initData: string | null;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize Telegram WebApp
        const telegramData = initTelegramWebApp();

        if (telegramData?.initData && telegramData?.user) {
          setInitData(telegramData.initData);
          setTelegramUser(telegramData.user);
          setTelegramInitData(telegramData.initData);
          console.log('Telegram auth initialized:', telegramData.user);

          // Fetch user profile from backend
          try {
            const response = await apiFetch('/api/me');
            if (response.success) {
              setUser(response.data);
              console.log('User profile loaded:', response.data);
            }
          } catch (apiError) {
            console.error('Error fetching user profile:', apiError);
            setError('Ошибка загрузки профиля пользователя');
          }
        } else {
          console.warn('Telegram WebApp not available or no user data');
          setError('Telegram WebApp недоступен. Откройте приложение через Telegram.');
        }
      } catch (err) {
        console.error('Error initializing Telegram auth:', err);
        setError('Ошибка инициализации Telegram WebApp');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    telegramUser,
    initData,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};