import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/telegramAuth';
import { ApiResponse } from '../utils/responses';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/me - получить профиль текущего пользователя
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    // Fetch full user data from database to match frontend User type
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isBanned: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return ApiResponse.notFound(res, 'Пользователь не найден');
    }

    return ApiResponse.success(res, user);
  } catch (error) {
    console.error('Ошибка получения профиля пользователя:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении профиля');
  }
});

export default router;