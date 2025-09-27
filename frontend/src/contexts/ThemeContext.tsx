import React, { createContext, useContext, useEffect, useState } from 'react';
import { initTelegramWebApp } from '../utils/telegram';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Initialize theme from Telegram colorScheme
    try {
      const telegramApp = initTelegramWebApp();
      const telegramTheme = telegramApp.colorScheme === 'dark' ? 'dark' : 'light';
      setTheme(telegramTheme);
      updateDocumentClass(telegramTheme);
    } catch (error) {
      console.warn('Could not get Telegram color scheme, using light theme:', error);
      setTheme('light');
      updateDocumentClass('light');
    }

    // Listen for Telegram theme changes if available
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.onEvent) {
      const handleThemeChanged = () => {
        const newTheme = tg.colorScheme === 'dark' ? 'dark' : 'light';
        setTheme(newTheme);
        updateDocumentClass(newTheme);
      };

      tg.onEvent('themeChanged', handleThemeChanged);

      return () => {
        if (tg.offEvent) {
          tg.offEvent('themeChanged', handleThemeChanged);
        }
      };
    }
  }, []);

  const updateDocumentClass = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateDocumentClass(newTheme);
  };

  const value = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};