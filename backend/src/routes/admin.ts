import { Router, Request, Response } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { requireAdmin } from '../middleware/requireAdmin';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/responses';
import { parseJsonArray } from '../utils/json';

const router = Router();

// Все админ роуты требуют админ права
router.use(requireAdmin);

// GET /api/admin/users - список пользователей
router.get('/users', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { username: { contains: search } },
        { telegramId: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const total = await prisma.user.count({ where });

    return ApiResponse.paginated(res, users, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении пользователей');
  }
});

// GET /api/admin/orders - все заказы
router.get('/orders', [
  query('status').optional().isString(),
  query('userId').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            telegramId: true,
            firstName: true,
            lastName: true,
            username: true
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
    console.error('Ошибка получения заказов админом:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении заказов');
  }
});

// GET /api/admin/analytics - аналитика
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Get basic KPIs
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      topProducts
    ] = await Promise.all([
      // Total orders count
      prisma.order.count(),

      // Total revenue sum
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),

      // Total users count
      prisma.user.count(),

      // Total active products count
      prisma.product.count({
        where: { isActive: true }
      }),

      // Top 5 products by quantity sold
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      })
    ]);

    // Get product details for top products
    const topProductIds = topProducts.map(item => item.productId);
    const productDetails = await prisma.product.findMany({
      where: {
        id: { in: topProductIds }
      },
      select: {
        id: true,
        title: true,
        brand: true,
        price: true,
        images: true
      }
    });

    // Combine top products with their details and sales data
    const topProductsWithDetails = topProducts.map(item => {
      const product = productDetails.find(p => p.id === item.productId);
      return {
        product: {
          ...product,
          images: parseJsonArray(product?.images)
        },
        totalSold: item._sum.quantity
      };
    });

    const analytics = {
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalUsers,
        totalProducts
      },
      topProducts: topProductsWithDetails
    };

    return ApiResponse.success(res, analytics);
  } catch (error) {
    console.error('Ошибка получения аналитики:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при получении аналитики');
  }
});

export default router;