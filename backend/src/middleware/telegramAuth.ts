import { Request, Response, NextFunction } from 'express';
import { validateTelegramInitData, parseTelegramInitData, isAdminTelegramId } from '../utils/telegram';
import { prisma } from '../lib/prisma';

// Расширяем Request интерфейс для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        telegramId: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
        role: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return res.status(401).json({
        error: 'Требуется аутентификация через Telegram WebApp'
      });
    }

    // ВРЕМЕННЫЙ РЕЖИМ - принимаем тестовые данные
    if (initData.includes('test_init_data') || initData.includes('fallback_init_data')) {
      console.log('🧪 Используется тестовый режим авторизации');

      // Создаем тестового пользователя
      const testUser = await prisma.user.upsert({
        where: { telegramId: '12345' },
        update: { updatedAt: new Date() },
        create: {
          telegramId: '12345',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          role: 'admin' // Делаем тестового пользователя админом
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
      return res.status(500).json({ error: 'Ошибка конфигурации сервера' });
    }

    const isValid = validateTelegramInitData(initData, botToken);
    if (!isValid) {
      return res.status(401).json({
        error: 'Недействительные данные аутентификации Telegram'
      });
    }

    // Парсим данные пользователя из initData
    const telegramUser = parseTelegramInitData(initData);
    if (!telegramUser) {
      return res.status(401).json({
        error: 'Не удалось получить данные пользователя из Telegram'
      });
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
    res.status(500).json({ error: 'Ошибка сервера при аутентификации' });
  }
};