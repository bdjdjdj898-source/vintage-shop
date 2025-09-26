import { Router, Request, Response } from 'express';
import { query, param, body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { requireAdmin } from '../middleware/requireAdmin';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/responses';
import { parseJsonArray } from '../utils/json';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        isBanned: true,
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
  query('userId').optional().isInt({ min: 1 }).toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const userId = Number(req.query.userId);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (!isNaN(userId)) {
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
        product: product ? {
          ...product,
          images: parseJsonArray(product.images)
        } : {
          id: item.productId,
          title: 'Удалённый товар',
          brand: '',
          price: 0,
          images: []
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

// PUT /api/admin/users/:id/ban - заблокировать пользователя
router.put('/users/:id/ban', [
  param('id').isInt({ min: 1 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return ApiResponse.notFound(res, 'Пользователь не найден');
    }

    // Prevent banning admin users
    if (existingUser.role === 'admin') {
      return ApiResponse.businessError(res, 'INVALID_OPERATION' as any, 'Нельзя заблокировать администратора');
    }

    // Ban user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true }
    });

    return ApiResponse.success(res, {
      id: updatedUser.id,
      telegramId: updatedUser.telegramId,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      isBanned: updatedUser.isBanned
    });
  } catch (error) {
    console.error('Ошибка блокировки пользователя:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при блокировке пользователя');
  }
});

// PUT /api/admin/users/:id/unban - разблокировать пользователя
router.put('/users/:id/unban', [
  param('id').isInt({ min: 1 }),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return ApiResponse.notFound(res, 'Пользователь не найден');
    }

    // Unban user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false }
    });

    return ApiResponse.success(res, {
      id: updatedUser.id,
      telegramId: updatedUser.telegramId,
      username: updatedUser.username,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      isBanned: updatedUser.isBanned
    });
  } catch (error) {
    console.error('Ошибка разблокировки пользователя:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при разблокировке пользователя');
  }
});

// POST /api/admin/uploads/sign - генерировать подпись для загрузки в Cloudinary
router.post('/uploads/sign', [
  body('filename').isString().isLength({ min: 1, max: 255 }),
  body('contentType').isString().matches(/^image\/(jpeg|jpg|png|webp)$/),
  body('size').isInt({ min: 1, max: 5 * 1024 * 1024 }), // Max 5MB
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { filename, contentType, size } = req.body;

    // Validate file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtension = filename.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return ApiResponse.validationError(res, 'Недопустимый формат файла. Разрешены: JPG, PNG, WebP');
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return ApiResponse.internalError(res, 'Cloudinary не настроен');
    }

    // Generate unique public_id for the image
    const publicId = `products/${crypto.randomUUID()}`;
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
      folder: 'products',
      resource_type: 'image' as const
    };

    // Generate signature for secure upload
    const signature = cloudinary.utils.api_sign_request(uploadParams, process.env.CLOUDINARY_API_SECRET!);

    return ApiResponse.success(res, {
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'products',
      resource_type: 'image'
    });
  } catch (error) {
    console.error('Ошибка генерации подписи Cloudinary:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при генерации подписи');
  }
});

// POST /api/admin/uploads - генерировать подписанные URL для загрузки (deprecated)
router.post('/uploads', [
  body('filename').isString().isLength({ min: 1, max: 255 }),
  body('contentType').isString().matches(/^image\/(jpeg|jpg|png|webp)$/),
  body('size').isInt({ min: 1, max: 5 * 1024 * 1024 }), // Max 5MB
  validateRequest
], async (req: Request, res: Response) => {
  try {
    // Redirect to new signing endpoint
    return ApiResponse.error(res, 'DEPRECATED' as any, 'Используйте /api/admin/uploads/sign для загрузки изображений', 410);
  } catch (error) {
    console.error('Ошибка генерации URL для загрузки:', error);
    return ApiResponse.internalError(res, 'Ошибка сервера при генерации URL для загрузки');
  }
});

export default router;