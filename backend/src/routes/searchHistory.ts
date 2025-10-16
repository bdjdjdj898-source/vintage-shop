import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/requireAuth';
import { validateRequest } from '../middleware/validateRequest';
import { ApiResponse } from '../utils/responses';
import logger from '../lib/logger';

const router = Router();

const MAX_HISTORY_ITEMS = 15;

// GET /api/search-history - получить историю поиска пользователя (последние 15)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const history = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_ITEMS,
      select: {
        id: true,
        query: true,
        createdAt: true
      }
    });

    return ApiResponse.success(res, history);
  } catch (error) {
    logger.error('Error fetching search history', {
      reqId: req.requestId,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при получении истории поиска');
  }
});

// POST /api/search-history - сохранить запрос в историю
router.post('/', requireAuth, [
  body('query').isString().trim().isLength({ min: 1, max: 100 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { query } = req.body;

    // Don't save empty or whitespace-only queries
    if (!query.trim()) {
      return ApiResponse.validationError(res, 'Поисковый запрос не может быть пустым');
    }

    // Check if this exact query already exists for this user
    const existingQuery = await prisma.searchHistory.findFirst({
      where: {
        userId,
        query: query.trim()
      }
    });

    // If query exists, delete it (we'll re-add it to make it the most recent)
    if (existingQuery) {
      await prisma.searchHistory.delete({
        where: { id: existingQuery.id }
      });
    }

    // Add new search query
    const searchHistory = await prisma.searchHistory.create({
      data: {
        userId,
        query: query.trim()
      }
    });

    // Get total count of history items for this user
    const totalCount = await prisma.searchHistory.count({
      where: { userId }
    });

    // If we have more than MAX_HISTORY_ITEMS, delete the oldest ones
    if (totalCount > MAX_HISTORY_ITEMS) {
      const itemsToDelete = totalCount - MAX_HISTORY_ITEMS;

      // Get IDs of oldest items
      const oldestItems = await prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: itemsToDelete,
        select: { id: true }
      });

      // Delete them
      await prisma.searchHistory.deleteMany({
        where: {
          id: {
            in: oldestItems.map(item => item.id)
          }
        }
      });
    }

    return ApiResponse.success(res, searchHistory, 201);
  } catch (error) {
    logger.error('Error saving search history', {
      reqId: req.requestId,
      userId: req.user?.id,
      query: req.body?.query,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при сохранении истории поиска');
  }
});

// DELETE /api/search-history - очистить всю историю поиска
router.delete('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await prisma.searchHistory.deleteMany({
      where: { userId }
    });

    return ApiResponse.success(res, { message: 'История поиска очищена' });
  } catch (error) {
    logger.error('Error clearing search history', {
      reqId: req.requestId,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при очистке истории поиска');
  }
});

export default router;
