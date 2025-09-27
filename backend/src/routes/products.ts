import { Router, Request, Response } from 'express';
import { param, query, body } from 'express-validator';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '../middleware/requireAdmin';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuth } from '../middleware/optionalAuth';
import { ApiResponse } from '../utils/responses';
import { toStringArray } from '../utils/normalize';
import { buildProductWhere } from '../utils/products';
import logger from '../lib/logger';

const router = Router();

// GET /api/products - получить список товаров с фильтрацией
router.get('/', optionalAuth, [
  query('category').optional().isString(),
  query('brand').optional().isString(),
  query('size').optional().isString(),
  query('color').optional().isString(),
  query('minCondition').optional().isInt({ min: 1, max: 10 }),
  query('maxCondition').optional().isInt({ min: 1, max: 10 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('includeInactive').optional().isBoolean(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'brand_asc']),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const {
      category,
      brand,
      size,
      color,
      minCondition,
      maxCondition,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      includeInactive,
      search,
      sort
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause using shared utility
    const where = buildProductWhere({
      category,
      brand,
      size,
      color,
      minCondition,
      maxCondition,
      minPrice,
      maxPrice,
      search,
      includeInactive
    }, {
      isAdmin: req.user?.role === 'admin'
    });

    // Compute orderBy based on sort parameter
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // default

    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'brand_asc') {
      orderBy = { brand: 'asc' };
    }

    // Запросы к БД
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
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
      }),
      prisma.product.count({ where })
    ]);

    // Normalize images to string array for API response
    const productsWithImages = products.map(product => ({
      ...product,
      images: toStringArray(product.images)
    }));

    return ApiResponse.paginated(res, productsWithImages, {
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
      pages: Math.ceil(totalCount / Number(limit))
    });
  } catch (error) {
    logger.error('Error fetching products', {
      reqId: req.requestId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при получении товаров');
  }
});

// GET /api/products/:id - получить товар по ID
router.get('/:id', optionalAuth, [
  param('id').isInt({ min: 1 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const isAdmin = req.user?.role === 'admin';
    const product = await prisma.product.findFirst({
      where: {
        id: Number(id),
        ...(isAdmin ? {} : { isActive: true })
      }
    });

    if (!product) {
      return ApiResponse.notFound(res, 'Товар не найден');
    }

    // Normalize images to string array for API response
    const productWithImages = {
      ...product,
      images: toStringArray(product.images)
    };

    return ApiResponse.success(res, productWithImages);
  } catch (error) {
    logger.error('Error fetching product', {
      reqId: req.requestId,
      productId: req.params.id,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    return ApiResponse.internalError(res, 'Ошибка при получении товара');
  }
});

// POST /api/products - создать товар (только админ)
router.post('/', requireAdmin, [
  body('title').isString().isLength({ min: 1, max: 255 }),
  body('brand').isString().isLength({ min: 1, max: 100 }),
  body('category').isIn(['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры']),
  body('size').isString().isLength({ min: 1, max: 20 }),
  body('color').isString().isLength({ min: 1, max: 50 }),
  body('condition').isInt({ min: 1, max: 10 }),
  body('description').isString().isLength({ min: 1, max: 2000 }),
  body('price').isFloat({ min: 0 }),
  body('images').isArray({ min: 1, max: 10 }).withMessage('Количество изображений должно быть от 1 до 10'),
  body('images.*').isURL(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const {
      title,
      brand,
      category,
      size,
      color,
      condition,
      description,
      price,
      images
    } = req.body;

    // Deduplicate image URLs
    const uniqueImages: Prisma.JsonArray = [...new Set(images as string[])];

    const product = await prisma.product.create({
      data: {
        title,
        brand,
        category,
        size,
        color,
        condition,
        description,
        price,
        images: uniqueImages,
        isActive: true
      }
    });

    return ApiResponse.success(res, product, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return ApiResponse.internalError(res, 'Ошибка при создании товара');
  }
});

// PUT /api/products/:id - обновить товар (только админ)
router.put('/:id', requireAdmin, [
  param('id').isInt({ min: 1 }).toInt(),
  body('title').optional().isString().isLength({ min: 1, max: 255 }),
  body('brand').optional().isString().isLength({ min: 1, max: 100 }),
  body('category').optional().isIn(['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры']),
  body('size').optional().isString().isLength({ min: 1, max: 20 }),
  body('color').optional().isString().isLength({ min: 1, max: 50 }),
  body('condition').optional().isInt({ min: 1, max: 10 }),
  body('description').optional().isString().isLength({ min: 1, max: 2000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('images').optional().isArray({ min: 1, max: 10 }).withMessage('Количество изображений должно быть от 1 до 10'),
  body('images.*').optional().isURL(),
  body('isActive').optional().isBoolean(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return ApiResponse.notFound(res, 'Товар не найден');
    }

    const updateData: any = {};
    const allowedFields = [
      'title', 'brand', 'category', 'size', 'color',
      'condition', 'description', 'price', 'isActive'
    ];

    // Only update provided fields
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Handle images array separately with deduplication
    if (req.body.images !== undefined) {
      const uniqueImages: Prisma.JsonArray = [...new Set(req.body.images as string[])];
      updateData.images = uniqueImages;
    }

    if (Object.keys(updateData).length === 0) {
      return ApiResponse.validationError(res, 'Не предоставлены поля для обновления');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    return ApiResponse.success(res, updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return ApiResponse.internalError(res, 'Ошибка при обновлении товара');
  }
});

// DELETE /api/products/:id - удалить товар (только админ) - мягкое удаление
router.delete('/:id', requireAdmin, [
  param('id').isInt({ min: 1 }).toInt(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return ApiResponse.notFound(res, 'Товар не найден');
    }

    // Soft delete by setting isActive to false
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false }
    });

    return ApiResponse.success(res, updatedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    return ApiResponse.internalError(res, 'Ошибка при удалении товара');
  }
});

export default router;