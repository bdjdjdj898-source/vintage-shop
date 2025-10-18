import { useEffect } from 'react';

interface TelegramWebApp {
  BackButton: {
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
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  SettingsButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegramBackButton = (onClick?: () => void) => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    tg.BackButton.onClick(handleClick);
    tg.BackButton.show();

    return () => {
      tg.BackButton.offClick(handleClick);
      tg.BackButton.hide();
    };
  }, [onClick]);
};

export const useTelegramMainButton = (
  text: string,
  onClick?: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isProgressVisible?: boolean;
  }
) => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    // Set button properties
    tg.MainButton.setText(text);
    if (options?.color) tg.MainButton.color = options.color;
    if (options?.textColor) tg.MainButton.textColor = options.textColor;

    // Set state
    if (options?.isActive !== false) {
      tg.MainButton.enable();
    } else {
      tg.MainButton.disable();
    }

    if (options?.isProgressVisible) {
      tg.MainButton.showProgress(false);
    } else {
      tg.MainButton.hideProgress();
    }

    tg.MainButton.onClick(handleClick);
    tg.MainButton.show();

    return () => {
      tg.MainButton.offClick(handleClick);
      tg.MainButton.hide();
    };
  }, [text, onClick, options]);
};

export const useTelegramSettingsButton = (onClick?: () => void) => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };

    tg.SettingsButton.onClick(handleClick);
    tg.SettingsButton.show();

    return () => {
      tg.SettingsButton.offClick(handleClick);
      tg.SettingsButton.hide();
    };
  }, [onClick]);
};
