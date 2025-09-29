import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, parseTelegramInitData, isAdminTelegramId } from '../utils/telegram';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/responses';

// Request interface extension is in types/express.d.ts

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return ApiResponse.unauthorized(res, 'Требуется аутентификация через Telegram WebApp');
    }

    // TEST MODE - only in non-production with explicit flags
    const debugSecret = process.env.DEBUG_AUTH_SECRET || process.env.VITE_DEBUG_AUTH_SECRET;
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.ENABLE_TEST_AUTH === 'true' &&
      req.headers['x-debug-auth'] === debugSecret
    ) {
      console.log('🧪 Используется тестовый режим авторизации');

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
      return ApiResponse.internalError(res, 'Ошибка конфигурации сервера');
    }

    const isValid = validateTelegramInitData(initData, botToken);
    if (!isValid) {
      return ApiResponse.unauthorized(res, 'Недействительные данные аутентификации Telegram');
    }

    // Check auth_date freshness
    const params = new URLSearchParams(initData);
    const authDateStr = params.get('auth_date');
    const authDate = authDateStr ? parseInt(authDateStr, 10) : 0;
    const now = Math.floor(Date.now() / 1000);
    const TTL = parseInt(process.env.TELEGRAM_INITDATA_TTL || '86400', 10);

    if (!authDate || now - authDate > TTL) {
      return ApiResponse.unauthorized(res, 'Просроченные данные аутентификации Telegram');
    }

    // Парсим данные пользователя из initData
    const telegramUser = parseTelegramInitData(initData);
    if (!telegramUser) {
      return ApiResponse.unauthorized(res, 'Не удалось получить данные пользователя из Telegram');
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
      return ApiResponse.forbidden(res, 'Аккаунт заблокирован. Обратитесь к администрации.');
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
    console.error('Ошибка аутентификации:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при аутентификации');
  }
};