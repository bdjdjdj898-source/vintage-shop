import { Router, Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/telegramAuth';
import { prisma } from '../lib/prisma';
import { ApiResponse, ErrorCode } from '../utils/responses';
import { toStringArray } from '../utils/normalize';
import { getAuthenticatedUser } from '../types/auth';

const router = Router();

// Все роуты корзины требуют аутентификации
router.use(requireAuth);

// GET /api/cart - получить корзину пользователя
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);

    // Найдем или создадим корзину пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart) {
      // Создаем новую корзину если её нет
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }

    // Parse images field for all cart items
    const cartWithParsedImages = {
      ...cart,
      items: cart.items.map((item: { product: { images: string } } & Record<string, unknown>) => ({
        ...item,
        product: {
          ...item.product,
          images: toStringArray(item.product.images)
        }
      }))
    };

    return ApiResponse.success(res, cartWithParsedImages);
  } catch (error) {
    console.error('Ошибка получения корзины:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении корзины');
  }
});

// POST /api/cart/items - добавить товар в корзину
router.post('/items', [
  body('productId').isInt({ min: 1 }),
  body('quantity').optional().isInt({ min: 1 }).default(1),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);
    const { productId, quantity = 1 } = req.body;

    // Проверяем, существует ли товар
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isActive) {
      return ApiResponse.businessError(res, ErrorCode.PRODUCT_UNAVAILABLE, 'Товар не найден или недоступен');
    }

    // Найдем или создадим корзину пользователя
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      });
    }

    // Проверяем, есть ли уже этот товар в корзине
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      // Увеличиваем количество
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true }
      });
    } else {
      // Создаем новый элемент корзины
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity
        },
        include: { product: true }
      });
    }

    // Parse images field for the product
    const cartItemWithParsedImages = {
      ...cartItem,
      product: {
        ...cartItem.product,
        images: toStringArray(cartItem.product.images)
      }
    };

    return ApiResponse.success(res, cartItemWithParsedImages, 201);
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при добавлении в корзину');
  }
});

// PUT /api/cart/items/:id - обновить количество товара в корзине
router.put('/items/:id', [
  param('id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    // Проверяем, принадлежит ли элемент корзины текущему пользователю
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: user.id
        }
      },
      include: { product: true }
    });

    if (!cartItem) {
      return ApiResponse.notFound(res, 'Элемент корзины не найден');
    }

    // Проверяем, активен ли товар
    if (!cartItem.product.isActive) {
      return ApiResponse.businessError(res, ErrorCode.PRODUCT_UNAVAILABLE, 'Товар больше недоступен');
    }

    // Обновляем количество
    const updatedItem = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: true }
    });

    // Parse images field for the product
    const updatedItemWithParsedImages = {
      ...updatedItem,
      product: {
        ...updatedItem.product,
        images: toStringArray(updatedItem.product.images)
      }
    };

    return ApiResponse.success(res, updatedItemWithParsedImages);
  } catch (error) {
    console.error('Ошибка обновления корзины:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при обновлении корзины');
  }
});

// DELETE /api/cart/items/:id - удалить товар из корзины
router.delete('/items/:id', [
  param('id').isInt({ min: 1 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req.user);
    const cartItemId = parseInt(req.params.id);

    // Проверяем, принадлежит ли элемент корзины текущему пользователю
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: user.id
        }
      }
    });

    if (!cartItem) {
      return ApiResponse.notFound(res, 'Элемент корзины не найден');
    }

    // Удаляем элемент из корзины
    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    return ApiResponse.success(res, { message: 'Товар удален из корзины' });
  } catch (error) {
    console.error('Ошибка удаления из корзины:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при удалении из корзины');
  }
});

export default router;