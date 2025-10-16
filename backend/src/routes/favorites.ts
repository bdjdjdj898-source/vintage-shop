import { Router, Request, Response } from 'express';
import { param } from 'express-validator';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/telegramAuth';
import { validateRequest } from '../middleware/validateRequest';
import { ApiResponse } from '../utils/responses';
import { toStringArray } from '../utils/normalize';
import { getAuthenticatedUser } from '../types/auth';
import logger from '../lib/logger';

const router = Router();

// GET /api/favorites - получить избранные товары пользователя
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);
    const userId = user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            brand: true,
            category: true,
            size: true,
            color: true,
            condition: true,
            description: true,
            price: true,
            images: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter out products that are no longer active
    const activeProducts = favorites
      .filter(fav => fav.product.isActive)
      .map(fav => ({
        ...fav.product,
        images: toStringArray(fav.product.images),
        favoriteId: fav.id,
        favoritedAt: fav.createdAt
      }));

    return ApiResponse.success(res, activeProducts);
  } catch (error) {
    logger.error('Error fetching favorites', {
      reqId: req.requestId,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при получении избранного');
  }
});

// POST /api/favorites/:productId - добавить товар в избранное
router.post('/:productId', requireAuth, [
  param('productId').isInt({ min: 1 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);
    const userId = user.id;
    const productId = Number(req.params.productId);

    // Check if product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      }
    });

    if (!product) {
      return ApiResponse.notFound(res, 'Товар не найден');
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingFavorite) {
      return ApiResponse.validationError(res, 'Товар уже в избранном');
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId
      },
      include: {
        product: true
      }
    });

    return ApiResponse.success(res, {
      ...favorite.product,
      images: toStringArray(favorite.product.images),
      favoriteId: favorite.id,
      favoritedAt: favorite.createdAt
    }, 201);
  } catch (error) {
    logger.error('Error adding to favorites', {
      reqId: req.requestId,
      userId: req.user?.id,
      productId: req.params.productId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при добавлении в избранное');
  }
});

// DELETE /api/favorites/:productId - удалить товар из избранного
router.delete('/:productId', requireAuth, [
  param('productId').isInt({ min: 1 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);
    const userId = user.id;
    const productId = Number(req.params.productId);

    // Check if exists in favorites
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (!favorite) {
      return ApiResponse.notFound(res, 'Товар не найден в избранном');
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    });

    return ApiResponse.success(res, { message: 'Товар удален из избранного' });
  } catch (error) {
    logger.error('Error removing from favorites', {
      reqId: req.requestId,
      userId: req.user?.id,
      productId: req.params.productId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при удалении из избранного');
  }
});

export default router;
