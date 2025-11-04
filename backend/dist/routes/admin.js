"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const requireAdmin_1 = require("../middleware/requireAdmin");
const prisma_1 = require("../lib/prisma");
const responses_1 = require("../utils/responses");
const normalize_1 = require("../utils/normalize");
const products_1 = require("../utils/products");
const crypto_1 = __importDefault(require("crypto"));
const cloudinary_1 = require("cloudinary");
const router = (0, express_1.Router)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
router.use(requireAdmin_1.requireAdmin);
router.get('/users', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    (0, express_validator_1.query)('search').optional().isString(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { username: { contains: search } },
                { telegramId: { contains: search } }
            ];
        }
        const users = await prisma_1.prisma.user.findMany({
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
        const total = await prisma_1.prisma.user.count({ where });
        return responses_1.ApiResponse.paginated(res, users, {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        console.error('Ошибка получения пользователей:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении пользователей');
    }
});
router.get('/orders', [
    (0, express_validator_1.query)('status').optional().isString(),
    (0, express_validator_1.query)('userId').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const userId = Number(req.query.userId);
        const skip = (page - 1) * limit;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (!isNaN(userId)) {
            where.userId = userId;
        }
        const orders = await prisma_1.prisma.order.findMany({
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
        const total = await prisma_1.prisma.order.count({ where });
        const ordersWithParsedImages = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: (0, normalize_1.toStringArray)(item.product.images)
                }
            }))
        }));
        return responses_1.ApiResponse.paginated(res, ordersWithParsedImages, {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        console.error('Ошибка получения заказов админом:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении заказов');
    }
});
router.get('/analytics', async (req, res) => {
    try {
        const [totalOrders, totalRevenue, totalUsers, totalProducts, topProducts] = await Promise.all([
            prisma_1.prisma.order.count(),
            prisma_1.prisma.order.aggregate({
                _sum: {
                    totalAmount: true
                }
            }),
            prisma_1.prisma.user.count(),
            prisma_1.prisma.product.count({
                where: { isActive: true }
            }),
            prisma_1.prisma.orderItem.groupBy({
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
        const topProductIds = topProducts.map((item) => item.productId);
        const productDetails = await prisma_1.prisma.product.findMany({
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
        const topProductsWithDetails = topProducts.map((item) => {
            const product = productDetails.find((p) => p.id === item.productId);
            return {
                product: product ? {
                    ...product,
                    images: (0, normalize_1.toStringArray)(product.images)
                } : {
                    id: item.productId,
                    title: 'Удалённый товар',
                    brand: '',
                    price: 0,
                    images: []
                },
                totalSold: item._sum.quantity ?? 0
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
        return responses_1.ApiResponse.success(res, analytics);
    }
    catch (error) {
        console.error('Ошибка получения аналитики:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении аналитики');
    }
});
router.put('/users/:id/ban', [
    (0, express_validator_1.param)('id').isInt({ min: 1 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            return responses_1.ApiResponse.notFound(res, 'Пользователь не найден');
        }
        if (existingUser.role === 'admin') {
            return responses_1.ApiResponse.businessError(res, 'INVALID_OPERATION', 'Нельзя заблокировать администратора');
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isBanned: true }
        });
        return responses_1.ApiResponse.success(res, {
            id: updatedUser.id,
            telegramId: updatedUser.telegramId,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
            isBanned: updatedUser.isBanned
        });
    }
    catch (error) {
        console.error('Ошибка блокировки пользователя:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при блокировке пользователя');
    }
});
router.put('/users/:id/unban', [
    (0, express_validator_1.param)('id').isInt({ min: 1 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            return responses_1.ApiResponse.notFound(res, 'Пользователь не найден');
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isBanned: false }
        });
        return responses_1.ApiResponse.success(res, {
            id: updatedUser.id,
            telegramId: updatedUser.telegramId,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
            isBanned: updatedUser.isBanned
        });
    }
    catch (error) {
        console.error('Ошибка разблокировки пользователя:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при разблокировке пользователя');
    }
});
router.post('/uploads/sign', [
    (0, express_validator_1.body)('filename').isString().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('contentType').isString().matches(/^image\/(jpeg|jpg|png|webp)$/),
    (0, express_validator_1.body)('size').isInt({ min: 1, max: 5 * 1024 * 1024 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const { filename, contentType, size } = req.body;
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const fileExtension = filename.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            return responses_1.ApiResponse.validationError(res, 'Недопустимый формат файла. Разрешены: JPG, PNG, WebP');
        }
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            return responses_1.ApiResponse.internalError(res, 'Cloudinary не настроен');
        }
        const publicId = `products/${crypto_1.default.randomUUID()}`;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId,
            folder: 'products',
            resource_type: 'image'
        };
        const signature = cloudinary_1.v2.utils.api_sign_request(uploadParams, process.env.CLOUDINARY_API_SECRET);
        return responses_1.ApiResponse.success(res, {
            signature,
            timestamp,
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            folder: 'products',
            resource_type: 'image'
        });
    }
    catch (error) {
        console.error('Ошибка генерации подписи Cloudinary:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при генерации подписи');
    }
});
router.post('/uploads', [
    (0, express_validator_1.body)('filename').isString().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('contentType').isString().matches(/^image\/(jpeg|jpg|png|webp)$/),
    (0, express_validator_1.body)('size').isInt({ min: 1, max: 5 * 1024 * 1024 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        return responses_1.ApiResponse.error(res, 'DEPRECATED', 'Используйте /api/admin/uploads/sign для загрузки изображений', 410);
    }
    catch (error) {
        console.error('Ошибка генерации URL для загрузки:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при генерации URL для загрузки');
    }
});
router.get('/products', [
    (0, express_validator_1.query)('category').optional().isString(),
    (0, express_validator_1.query)('brand').optional().isString(),
    (0, express_validator_1.query)('size').optional().isString(),
    (0, express_validator_1.query)('color').optional().isString(),
    (0, express_validator_1.query)('minCondition').optional().isInt({ min: 1, max: 10 }),
    (0, express_validator_1.query)('maxCondition').optional().isInt({ min: 1, max: 10 }),
    (0, express_validator_1.query)('minPrice').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('maxPrice').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    (0, express_validator_1.query)('search').optional().isString(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const { category, brand, size, color, minCondition, maxCondition, minPrice, maxPrice, page = 1, limit = 20, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = (0, products_1.buildProductWhere)({
            category,
            brand,
            size,
            color,
            minCondition,
            maxCondition,
            minPrice,
            maxPrice,
            search
        }, {
            isAdmin: true
        });
        const [products, totalCount] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
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
                    quantity: true,
                    discount: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        const productsWithImages = products.map(product => ({
            ...product,
            images: (0, normalize_1.toStringArray)(product.images)
        }));
        return responses_1.ApiResponse.paginated(res, productsWithImages, {
            page: Number(page),
            limit: Number(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / Number(limit))
        });
    }
    catch (error) {
        console.error('Ошибка получения товаров админом:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка при получении товаров');
    }
});
exports.default = router;
