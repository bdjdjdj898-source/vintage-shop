"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const requireAdmin_1 = require("../middleware/requireAdmin");
const validateRequest_1 = require("../middleware/validateRequest");
const optionalAuth_1 = require("../middleware/optionalAuth");
const responses_1 = require("../utils/responses");
const normalize_1 = require("../utils/normalize");
const products_1 = require("../utils/products");
const logger_1 = __importDefault(require("../lib/logger"));
const router = (0, express_1.Router)();
router.get('/', optionalAuth_1.optionalAuth, [
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
    (0, express_validator_1.query)('includeInactive').optional().isBoolean(),
    (0, express_validator_1.query)('search').optional().isString(),
    (0, express_validator_1.query)('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'brand_asc']),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const { category, brand, size, color, minCondition, maxCondition, minPrice, maxPrice, page = 1, limit = 20, includeInactive, search, sort } = req.query;
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
            search: undefined,
            includeInactive
        }, {
            isAdmin: req.user?.role === 'admin'
        });
        let orderBy = { createdAt: 'desc' };
        if (sort === 'newest') {
            orderBy = { createdAt: 'desc' };
        }
        else if (sort === 'price_asc') {
            orderBy = { price: 'asc' };
        }
        else if (sort === 'price_desc') {
            orderBy = { price: 'desc' };
        }
        else if (sort === 'brand_asc') {
            orderBy = { brand: 'asc' };
        }
        let products;
        let totalCount;
        if (search && typeof search === 'string') {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } }
            ];
        }
        [products, totalCount] = await Promise.all([
            prisma_1.prisma.product.findMany({
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
                    quantity: true,
                    discount: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        const productsWithImages = products.map((product) => ({
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
        logger_1.default.error('Error fetching products', {
            reqId: req.requestId,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при получении товаров');
    }
});
router.get('/:id', optionalAuth_1.optionalAuth, [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).toInt(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.role === 'admin';
        const product = await prisma_1.prisma.product.findFirst({
            where: {
                id: Number(id),
                ...(isAdmin ? {} : { isActive: true })
            }
        });
        if (!product) {
            return responses_1.ApiResponse.notFound(res, 'Товар не найден');
        }
        const productWithImages = {
            ...product,
            images: (0, normalize_1.toStringArray)(product.images)
        };
        return responses_1.ApiResponse.success(res, productWithImages);
    }
    catch (error) {
        logger_1.default.error('Error fetching product', {
            reqId: req.requestId,
            productId: req.params.id,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при получении товара');
    }
});
router.post('/', requireAdmin_1.requireAdmin, [
    (0, express_validator_1.body)('title').isString().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('brand').isString().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('category').isIn(['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры']),
    (0, express_validator_1.body)('size').isString().isLength({ min: 1, max: 20 }),
    (0, express_validator_1.body)('color').isString().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('condition').isInt({ min: 1, max: 10 }),
    (0, express_validator_1.body)('description').isString().isLength({ min: 1, max: 2000 }),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('images').isArray({ min: 1, max: 10 }).withMessage('Количество изображений должно быть от 1 до 10'),
    (0, express_validator_1.body)('images.*').isURL(),
    (0, express_validator_1.body)('quantity').isInt({ min: 0 }).withMessage('Количество должно быть >= 0'),
    (0, express_validator_1.body)('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Скидка должна быть от 0 до 100%'),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const { title, brand, category, size, color, condition, description, price, images, quantity, discount } = req.body;
        const uniqueImages = [...new Set(images)];
        const product = await prisma_1.prisma.product.create({
            data: {
                title,
                brand,
                category,
                size,
                color,
                condition,
                description,
                price,
                images: (0, normalize_1.stringifyJson)(uniqueImages),
                isActive: true,
                quantity,
                discount: discount || null
            }
        });
        const productWithImages = {
            ...product,
            images: (0, normalize_1.toStringArray)(product.images)
        };
        return responses_1.ApiResponse.success(res, productWithImages, 201);
    }
    catch (error) {
        console.error('Error creating product:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка при создании товара');
    }
});
router.put('/:id', requireAdmin_1.requireAdmin, [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).toInt(),
    (0, express_validator_1.body)('title').optional().isString().isLength({ min: 1, max: 255 }),
    (0, express_validator_1.body)('brand').optional().isString().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('category').optional().isIn(['Куртки', 'Толстовки', 'Джинсы', 'Аксессуары', 'Обувь', 'Свитеры']),
    (0, express_validator_1.body)('size').optional().isString().isLength({ min: 1, max: 20 }),
    (0, express_validator_1.body)('color').optional().isString().isLength({ min: 1, max: 50 }),
    (0, express_validator_1.body)('condition').optional().isInt({ min: 1, max: 10 }),
    (0, express_validator_1.body)('description').optional().isString().isLength({ min: 1, max: 2000 }),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('images').optional().isArray({ min: 1, max: 10 }).withMessage('Количество изображений должно быть от 1 до 10'),
    (0, express_validator_1.body)('images.*').optional().isURL(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 0 }).withMessage('Количество должно быть >= 0'),
    (0, express_validator_1.body)('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Скидка должна быть от 0 до 100%'),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const existingProduct = await prisma_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!existingProduct) {
            return responses_1.ApiResponse.notFound(res, 'Товар не найден');
        }
        const updateData = {};
        const allowedFields = [
            'title', 'brand', 'category', 'size', 'color',
            'condition', 'description', 'price', 'isActive', 'quantity', 'discount'
        ];
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }
        if (req.body.images !== undefined) {
            const uniqueImages = [...new Set(req.body.images)];
            updateData.images = (0, normalize_1.stringifyJson)(uniqueImages);
        }
        if (Object.keys(updateData).length === 0) {
            return responses_1.ApiResponse.validationError(res, 'Не предоставлены поля для обновления');
        }
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id: productId },
            data: updateData
        });
        const productWithImages = {
            ...updatedProduct,
            images: (0, normalize_1.toStringArray)(updatedProduct.images)
        };
        return responses_1.ApiResponse.success(res, productWithImages);
    }
    catch (error) {
        console.error('Error updating product:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка при обновлении товара');
    }
});
router.delete('/:id', requireAdmin_1.requireAdmin, [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).toInt(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const existingProduct = await prisma_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!existingProduct) {
            return responses_1.ApiResponse.notFound(res, 'Товар не найден');
        }
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id: productId },
            data: { isActive: false }
        });
        return responses_1.ApiResponse.success(res, updatedProduct);
    }
    catch (error) {
        console.error('Error deleting product:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка при удалении товара');
    }
});
exports.default = router;
