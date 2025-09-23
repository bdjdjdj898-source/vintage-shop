import { Router, Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/telegramAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { prisma } from '../lib/prisma';
import { ApiResponse, ErrorCode } from '../utils/responses';
import { telegramBot } from '../services/telegramBot';
import { parseJsonArray } from '../utils/json';

const router = Router();

// Все роуты заказов требуют аутентификации
router.use(requireAuth);

// GET /api/orders - получить заказы пользователя
router.get('/', [
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {
      userId: req.user!.id
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.order.count({ where });

    // Parse images field for all order items
    const ordersWithParsedImages = orders.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: parseJsonArray(item.product.images)
        }
      }))
    }));

    return ApiResponse.paginated(res, ordersWithParsedImages, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении заказов');
  }
});

// POST /api/orders - создать заказ
router.post('/', [
  body('shippingInfo').isObject(),
  body('shippingInfo.name').isString().isLength({ min: 2, max: 100 }).withMessage('Имя должно содержать от 2 до 100 символов'),
  body('shippingInfo.phone').matches(/^(\+7|8)[\d\s\-\(\)]{10,}$/).withMessage('Введите корректный российский номер телефона'),
  body('shippingInfo.address').isString().isLength({ min: 10, max: 500 }).withMessage('Адрес должен содержать от 10 до 500 символов'),
  body('shippingInfo.email').optional().isEmail().withMessage('Введите корректный email'),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { shippingInfo } = req.body;

    // Используем транзакцию для создания заказа
    const result = await prisma.$transaction(async (prisma) => {
      // Получаем корзину пользователя с товарами
      const cart = await prisma.cart.findUnique({
        where: { userId: req.user!.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('CART_EMPTY');
      }

      // Вычисляем общую сумму заказа
      const totalAmount = cart.items.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      // Создаем заказ
      const order = await prisma.order.create({
        data: {
          userId: req.user!.id,
          totalAmount,
          shippingInfo: JSON.stringify(shippingInfo),
          status: 'pending'
        }
      });

      // Создаем элементы заказа
      const orderItems = await Promise.all(
        cart.items.map(item =>
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price // Сохраняем цену на момент заказа
            }
          })
        )
      );

      // Очищаем корзину
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      // Возвращаем созданный заказ с элементами
      return await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    // Parse images field for the created order
    const resultWithParsedImages = {
      ...result,
      items: result!.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: parseJsonArray(item.product.images)
        }
      }))
    };

    // Send notification to admins
    try {
      if (req.user) {
        const telegramUser = {
          id: Number(req.user.telegramId),
          username: req.user.username,
          first_name: req.user.firstName ?? '',
          last_name: req.user.lastName ?? '',
          photo_url: req.user.avatarUrl
        };

        const notificationMessage = telegramBot.formatOrderNotification(
          result!.id,
          telegramUser,
          result!.items.length,
          result!.totalAmount
        );
        await telegramBot.notifyAdmins(notificationMessage);
      }
    } catch (notificationError) {
      console.error('Ошибка отправки уведомления:', notificationError);
      // Не прерываем выполнение, если уведомление не отправилось
    }

    return ApiResponse.success(res, resultWithParsedImages, 201);
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    if (error instanceof Error && error.message === 'CART_EMPTY') {
      return ApiResponse.businessError(res, ErrorCode.CART_EMPTY, 'Корзина пуста');
    }
    return ApiResponse.internalError(res, 'Ошибка сервера при создании заказа');
  }
});

// GET /api/orders/:id - получить заказ по ID
router.get('/:id', [
  param('id').isInt({ min: 1 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user!.id // Проверяем, что заказ принадлежит пользователю
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return ApiResponse.notFound(res, 'Заказ не найден');
    }

    // Parse images field for the order
    const orderWithParsedImages = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: parseJsonArray(item.product.images)
        }
      }))
    };

    return ApiResponse.success(res, orderWithParsedImages);
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении заказа');
  }
});

// PUT /api/orders/:id/status - изменить статус заказа (только админ)
router.put('/:id/status', requireAdmin, [
  param('id').isInt({ min: 1 }),
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      return ApiResponse.notFound(res, 'Заказ не найден');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Parse images field for the updated order
    const orderWithParsedImages = {
      ...updatedOrder,
      items: updatedOrder.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: parseJsonArray(item.product.images)
        }
      }))
    };

    return ApiResponse.success(res, orderWithParsedImages);
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при обновлении статуса заказа');
  }
});

export default router;