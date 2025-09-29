import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, parseTelegramInitData, isAdminTelegramId } from '../utils/telegram';
import { TelegramUserIdentity } from '../types/auth';

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      // No auth header, continue without user
      return next();
    }

    // TEST MODE - only in non-production with explicit flags
    const debugSecret = process.env.DEBUG_AUTH_SECRET || process.env.VITE_DEBUG_AUTH_SECRET;
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_TEST_AUTH === 'true' &&
      req.headers['x-debug-auth'] === debugSecret
    ) {
      console.log('🧪 Используется тестовый режим авторизации (optional)');

      // Default to user role, allow admin only with explicit flag
      const role = process.env.DEBUG_TEST_ADMIN === 'true' ? 'admin' : 'user';

      // Create minimal test user without DB write
      req.user = {
        telegramId: '12345',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        avatarUrl: undefined,
        role: role,
        isFromInitData: true
      };

      return next();
    }

    // Проверяем подпись данных Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN не установлен');
      // Continue without user instead of failing
      return next();
    }

    const isValid = validateTelegramInitData(initData, botToken);
    if (!isValid) {
      // Invalid signature, continue without user
      return next();
    }

    // Check auth_date freshness
    const params = new URLSearchParams(initData);
    const authDateStr = params.get('auth_date');
    const authDate = authDateStr ? parseInt(authDateStr, 10) : 0;
    const now = Math.floor(Date.now() / 1000);
    const TTL = parseInt(process.env.TELEGRAM_INITDATA_TTL || '86400', 10);

    if (!authDate || now - authDate > TTL) {
      // Expired auth data, continue without user
      return next();
    }

    // Парсим данные пользователя из initData
    const telegramUser = parseTelegramInitData(initData);
    if (!telegramUser) {
      // Can't parse user data, continue without user
      return next();
    }

    // Определяем роль пользователя на основе ADMIN_TELEGRAM_IDS
    const isAdmin = isAdminTelegramId(telegramUser.id.toString());
    const role = isAdmin ? 'admin' : 'user';

    // Create minimal user from initData without DB write
    req.user = {
      telegramId: telegramUser.id.toString(),
      username: telegramUser.username || undefined,
      firstName: telegramUser.first_name || undefined,
      lastName: telegramUser.last_name || undefined,
      avatarUrl: telegramUser.photo_url || undefined,
      role: role,
      isFromInitData: true
    };

    next();
  } catch (error) {
    console.error('Ошибка опциональной аутентификации:', error);
    // On error, continue without user instead of failing
    next();
  }
};