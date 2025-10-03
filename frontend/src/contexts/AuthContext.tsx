import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTelegramWebApp } from '../utils/telegram';
import { setTelegramInitData, apiFetch } from '../api/client';
import { User } from '../types/api';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
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
        const isMockMode = import.meta.env.VITE_MOCK_TELEGRAM === 'true';

        if (import.meta.env.DEV) {
          console.log('🚀 Начинаем инициализацию авторизации...');
          console.log('🎭 Mock режим:', isMockMode);
        }

        // Ждем немного чтобы Telegram SDK успел загрузиться (если не mock)
        if (!isMockMode) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Initialize Telegram WebApp
        const telegramData = initTelegramWebApp();
        if (import.meta.env.DEV) {
          console.log('📱 Результат инициализации Telegram:', telegramData);
        }

        if (telegramData?.initData && telegramData?.user) {
          if (import.meta.env.DEV) {
            console.log('✅ Telegram данные получены успешно');
          }
          setInitData(telegramData.initData);
          setTelegramUser(telegramData.user);
          setTelegramInitData(telegramData.initData);
          if (import.meta.env.DEV) {
            console.log('👤 Telegram пользователь:', telegramData.user);
          }

          // Fetch user profile from backend
          try {
            if (import.meta.env.DEV) {
              console.log('🌐 Загружаем профиль пользователя с сервера...');
            }
            const response = await apiFetch('/api/me');
            if (import.meta.env.DEV) {
              console.log('📥 Ответ сервера:', response);
            }

            if (response.success) {
              setUser(response.data);
              if (import.meta.env.DEV) {
                console.log('✅ Профиль пользователя загружен:', response.data);
              }
            } else {
              console.error('❌ Сервер вернул ошибку:', response);

              // В dev режиме с mock данными создаем fallback user
              if (isMockMode) {
                console.log('🎭 Dev режим: создаем fallback user из telegramUser');
                const fallbackUser: User = {
                  id: telegramData.user.id,
                  telegramId: telegramData.user.id,
                  firstName: telegramData.user.first_name,
                  lastName: telegramData.user.last_name || '',
                  username: telegramData.user.username || '',
                  role: 'user',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } as User;
                setUser(fallbackUser);
                console.log('✅ Fallback user создан:', fallbackUser);
              } else {
                setError('Ошибка загрузки профиля пользователя');
              }
            }
          } catch (apiError) {
            console.error('❌ Ошибка API запроса:', apiError);

            // В dev режиме с mock данными создаем fallback user
            if (isMockMode) {
              console.log('🎭 Dev режим: API недоступен, создаем fallback user');
              const fallbackUser: User = {
                id: telegramData.user.id,
                telegramId: telegramData.user.id,
                firstName: telegramData.user.first_name,
                lastName: telegramData.user.last_name || '',
                username: telegramData.user.username || '',
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              } as User;
              setUser(fallbackUser);
              console.log('✅ Fallback user создан:', fallbackUser);
            } else {
              setError('Ошибка загрузки профиля пользователя');
            }
          }
        } else {
          console.error('❌ Telegram данные недоступны:', telegramData);
          if (import.meta.env.DEV) {
            console.log('🌍 window.Telegram:', (window as any).Telegram);
            console.log('📱 window.Telegram?.WebApp:', (window as any).Telegram?.WebApp);
          }

          // В mock режиме не устанавливаем ошибку
          if (!isMockMode) {
            setError('Telegram WebApp недоступен. Откройте приложение через Telegram.');
          }
        }
      } catch (err) {
        console.error('💥 Критическая ошибка инициализации:', err);
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        console.error('Текст ошибки:', errorMessage);

        const isMockMode = import.meta.env.VITE_MOCK_TELEGRAM === 'true';

        // В mock режиме не устанавливаем ошибку
        if (!isMockMode) {
          setError(errorMessage);
        } else {
          console.log('🎭 Dev режим: игнорируем ошибку инициализации');
        }
      } finally {
        if (import.meta.env.DEV) {
          console.log('🏁 Инициализация завершена, isLoading = false');
        }
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