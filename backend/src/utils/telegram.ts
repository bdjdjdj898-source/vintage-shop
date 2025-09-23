import crypto from 'crypto';

/**
 * Интерфейс пользователя Telegram
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Валидация данных Telegram WebApp с помощью HMAC
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return false;
    }

    urlParams.delete('hash');
    
    // Создаём строку для проверки подписи
    const dataCheckString = [...urlParams.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаём секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Проверяем подпись
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Ошибка валидации Telegram initData:', error);
    return false;
  }
}

/**
 * Парсинг данных пользователя из initData
 */
export function parseTelegramInitData(initData: string): TelegramUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) {
      return null;
    }

    const user = JSON.parse(decodeURIComponent(userParam)) as TelegramUser;
    
    // Валидация обязательных полей
    if (!user.id || !user.first_name) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Ошибка парсинга Telegram user data:', error);
    return null;
  }
}

/**
 * Проверка, что пользователь является админом по Telegram ID
 */
export function isAdminTelegramId(telegramId: string): boolean {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];
  return adminIds.includes(telegramId);
}

/**
 * Получение имени пользователя для отображения
 */
export function getUserDisplayName(user: TelegramUser): string {
  if (user.username) {
    return `@${user.username}`;
  }
  
  return [user.first_name, user.last_name].filter(Boolean).join(' ');
}