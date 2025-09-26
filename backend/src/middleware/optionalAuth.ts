import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, parseTelegramInitData, isAdminTelegramId } from '../utils/telegram';
import { prisma } from '../lib/prisma';

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

      // Создаем тестового пользователя
      const testUser = await prisma.user.upsert({
        where: { telegramId: '12345' },
        update: { updatedAt: new Date(), role },
        create: {
          telegramId: '12345',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          role
        }
      });

      req.user = {
        id: testUser.id,
        telegramId: testUser.telegramId,
        username: testUser.username || undefined,
        firstName: testUser.firstName || undefined,
        lastName: testUser.lastName || undefined,
        avatarUrl: testUser.avatarUrl || undefined,
        role: testUser.role
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

    // Находим или создаём пользователя в БД используя upsert
    const user = await prisma.user.upsert({
      where: { telegramId: telegramUser.id.toString() },
      update: {
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        avatarUrl: telegramUser.photo_url,
        role: role, // Обновляем роль при каждом входе
        updatedAt: new Date()
      },
      create: {
        telegramId: telegramUser.id.toString(),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        avatarUrl: telegramUser.photo_url,
        role: role
      }
    });

    // Check if user is banned
    if (user.isBanned) {
      // Banned user, continue without user
      return next();
    }

    // Добавляем пользователя в request
    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Ошибка опциональной аутентификации:', error);
    // On error, continue without user instead of failing
    next();
  }
};