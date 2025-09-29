import { useEffect, useState, useCallback, useRef } from 'react';
import WebApp from '@twa-dev/sdk';

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  expand: () => void;
  close: () => void;
  ready: () => void;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
}

interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: any;
  isReady: boolean;
  platform: string;
  colorScheme: 'light' | 'dark';
  // Main Button controls
  showMainButton: (text: string, callback: () => void) => void;
  hideMainButton: () => void;
  setMainButtonText: (text: string) => void;
  setMainButtonLoading: (loading: boolean) => void;
  enableMainButton: () => void;
  disableMainButton: () => void;
  // Back Button controls
  showBackButton: (callback: () => void) => void;
  hideBackButton: () => void;
  // Haptic Feedback
  hapticFeedback: {
    impact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notification: (type: 'error' | 'success' | 'warning') => void;
    selection: () => void;
  };
  // Utility functions
  expand: () => void;
  close: () => void;
  openLink: (url: string) => void;
}

export const useTelegram = (): UseTelegramReturn => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Handler references to properly remove event listeners
  const mainButtonHandlerRef = useRef<(() => void) | null>(null);
  const backButtonHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      // Initialize Telegram WebApp
      WebApp.ready();
      WebApp.expand();

      const tgWebApp = WebApp as unknown as TelegramWebApp;
      setWebApp(tgWebApp);
      setUser(tgWebApp.initDataUnsafe?.user || null);
      setIsReady(true);

      // Set theme colors
      if (tgWebApp.themeParams) {
        document.documentElement.style.setProperty('--tg-bg-color', tgWebApp.backgroundColor);
        document.documentElement.style.setProperty('--tg-header-color', tgWebApp.headerColor);
      }

    } catch (error) {
      console.warn('Telegram WebApp not available:', error);
      // Fallback for development/non-Telegram environment
      setWebApp(null);
      setIsReady(true);
    }
  }, []);

  // Main Button controls
  const showMainButton = useCallback((text: string, callback: () => void) => {
    if (webApp?.MainButton) {
      // Remove previous handler if it exists
      if (mainButtonHandlerRef.current) {
        webApp.MainButton.offClick(mainButtonHandlerRef.current);
      }

      // Store the new handler reference
      mainButtonHandlerRef.current = callback;

      webApp.MainButton.setText(text);
      webApp.MainButton.show();
      webApp.MainButton.enable();
      webApp.MainButton.onClick(callback);
    }
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      // Remove the stored handler before hiding
      if (mainButtonHandlerRef.current) {
        webApp.MainButton.offClick(mainButtonHandlerRef.current);
        mainButtonHandlerRef.current = null;
      }
      webApp.MainButton.hide();
    }
  }, [webApp]);

  const setMainButtonText = useCallback((text: string) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
    }
  }, [webApp]);

  const setMainButtonLoading = useCallback((loading: boolean) => {
    if (webApp?.MainButton) {
      if (loading) {
        webApp.MainButton.showProgress();
      } else {
        webApp.MainButton.hideProgress();
      }
    }
  }, [webApp]);

  const enableMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.enable();
    }
  }, [webApp]);

  const disableMainButton = useCallback(() => {
    if (webApp?.MainButton) {
      webApp.MainButton.disable();
    }
  }, [webApp]);

  // Back Button controls
  const showBackButton = useCallback((callback: () => void) => {
    if (webApp?.BackButton) {
      // Remove previous handler if it exists
      if (backButtonHandlerRef.current) {
        webApp.BackButton.offClick(backButtonHandlerRef.current);
      }

      // Store the new handler reference
      backButtonHandlerRef.current = callback;

      webApp.BackButton.show();
      webApp.BackButton.onClick(callback);
    }
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    if (webApp?.BackButton) {
      // Remove the stored handler before hiding
      if (backButtonHandlerRef.current) {
        webApp.BackButton.offClick(backButtonHandlerRef.current);
        backButtonHandlerRef.current = null;
      }
      webApp.BackButton.hide();
    }
  }, [webApp]);

  // Haptic Feedback
  const hapticFeedback = {
    impact: useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    }, [webApp]),

    notification: useCallback((type: 'error' | 'success' | 'warning') => {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    }, [webApp]),

    selection: useCallback(() => {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.selectionChanged();
      }
    }, [webApp])
  };

  // Utility functions
  const expand = useCallback(() => {
    if (webApp?.expand) {
      webApp.expand();
    }
  }, [webApp]);

  const close = useCallback(() => {
    if (webApp?.close) {
      webApp.close();
    }
  }, [webApp]);

  const openLink = useCallback((url: string) => {
    if (webApp?.openLink) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }, [webApp]);

  return {
    webApp,
    user,
    isReady,
    platform: webApp?.platform || 'unknown',
    colorScheme: webApp?.colorScheme || 'light',
    showMainButton,
    hideMainButton,
    setMainButtonText,
    setMainButtonLoading,
    enableMainButton,
    disableMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    expand,
    close,
    openLink
  };
};