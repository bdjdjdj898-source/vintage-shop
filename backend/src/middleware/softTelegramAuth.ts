import { Request, Response, NextFunction } from 'express';
import { parseTelegramInitData, isAdminTelegramId } from '../utils/telegram';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/responses';

/**
 * Soft auth middleware - doesn't validate signature, just parses initData
 * Use for non-critical operations like favorites
 */
export const softAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return ApiResponse.unauthorized(res, 'Требуется аутентификация через Telegram WebApp');
    }

    // Parse user data without signature validation
    const telegramUser = parseTelegramInitData(initData);
    if (!telegramUser) {
      return ApiResponse.unauthorized(res, 'Не удалось получить данные пользователя из Telegram');
    }

    // Determine role
    const isAdmin = isAdminTelegramId(telegramUser.id.toString());
    const role = isAdmin ? 'admin' : 'user';

    // Find or create user in DB
    const user = await prisma.user.upsert({
      where: { telegramId: telegramUser.id.toString() },
      update: {
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        avatarUrl: telegramUser.photo_url,
        role: role,
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

    // Add user to request
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
    console.error('Ошибка soft auth:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при аутентификации');
  }
};
