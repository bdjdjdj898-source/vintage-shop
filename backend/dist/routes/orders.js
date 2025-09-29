"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const telegramAuth_1 = require("../middleware/telegramAuth");
const requireAdmin_1 = require("../middleware/requireAdmin");
const prisma_1 = require("../lib/prisma");
const responses_1 = require("../utils/responses");
const telegramBot_1 = require("../services/telegramBot");
const normalize_1 = require("../utils/normalize");
const auth_1 = require("../types/auth");
const router = (0, express_1.Router)();
router.use(telegramAuth_1.requireAuth);
router.get('/', [
    (0, express_validator_1.query)('status').optional().isString(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;
        const where = {
            userId: user.id
        };
        if (status) {
            where.status = status;
        }
        const orders = await prisma_1.prisma.order.findMany({
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
        console.error('Ошибка получения заказов:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении заказов');
    }
});
router.post('/', [
    (0, express_validator_1.body)('shippingInfo').isObject(),
    (0, express_validator_1.body)('shippingInfo.name').isString().isLength({ min: 2, max: 100 }).withMessage('Имя должно содержать от 2 до 100 символов'),
    (0, express_validator_1.body)('shippingInfo.phone').matches(/^(\+7|8)[\d\s\-\(\)]{10,}$/).withMessage('Введите корректный российский номер телефона'),
    (0, express_validator_1.body)('shippingInfo.address').isString().isLength({ min: 10, max: 500 }).withMessage('Адрес должен содержать от 10 до 500 символов'),
    (0, express_validator_1.body)('shippingInfo.email').optional().isEmail().withMessage('Введите корректный email'),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const { shippingInfo } = req.body;
        const result = await prisma_1.prisma.$transaction(async (prisma) => {
            const cart = await prisma.cart.findUnique({
                where: { userId: user.id },
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
            const unavailableProducts = cart.items.filter((item) => !item.product.isActive);
            if (unavailableProducts.length > 0) {
                throw new Error('PRODUCT_UNAVAILABLE');
            }
            const totalAmount = cart.items.reduce((sum, item) => {
                return sum + (item.product.price * item.quantity);
            }, 0);
            const telegramData = {
                telegramId: user.telegramId,
                username: user.username,
                first_name: user.firstName,
                last_name: user.lastName
            };
            const order = await prisma.order.create({
                data: {
                    userId: user.id,
                    totalAmount,
                    shippingInfo: (0, normalize_1.stringifyJson)(shippingInfo),
                    telegramData: (0, normalize_1.stringifyJson)(telegramData),
                    status: 'pending'
                }
            });
            const orderItems = await Promise.all(cart.items.map((item) => prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price
                }
            })));
            await Promise.all(cart.items.map((item) => prisma.product.update({
                where: { id: item.productId },
                data: { isActive: false }
            })));
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
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
        const resultWithParsedImages = {
            ...result,
            items: result.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: (0, normalize_1.toStringArray)(item.product.images)
                }
            }))
        };
        try {
            if (req.user) {
                const telegramUser = {
                    id: Number(req.user.telegramId),
                    username: req.user.username,
                    first_name: req.user.firstName ?? '',
                    last_name: req.user.lastName ?? '',
                    photo_url: req.user.avatarUrl
                };
                const notificationMessage = telegramBot_1.telegramBot.formatOrderNotification(result.id, telegramUser, result.items.length, result.totalAmount);
                await telegramBot_1.telegramBot.notifyAdmins(notificationMessage);
            }
        }
        catch (notificationError) {
            console.error('Ошибка отправки уведомления:', notificationError);
        }
        return responses_1.ApiResponse.success(res, resultWithParsedImages, 201);
    }
    catch (error) {
        console.error('Ошибка создания заказа:', error);
        if (error instanceof Error && error.message === 'CART_EMPTY') {
            return responses_1.ApiResponse.businessError(res, responses_1.ErrorCode.CART_EMPTY, 'Корзина пуста');
        }
        if (error instanceof Error && error.message === 'PRODUCT_UNAVAILABLE') {
            return responses_1.ApiResponse.businessError(res, responses_1.ErrorCode.PRODUCT_UNAVAILABLE, 'Товар больше недоступен');
        }
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при создании заказа');
    }
});
router.get('/:id', [
    (0, express_validator_1.param)('id').isInt({ min: 1 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const orderId = parseInt(req.params.id);
        const order = await prisma_1.prisma.order.findFirst({
            where: {
                id: orderId,
                userId: user.id
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
            return responses_1.ApiResponse.notFound(res, 'Заказ не найден');
        }
        const orderWithParsedImages = {
            ...order,
            items: order.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: (0, normalize_1.toStringArray)(item.product.images)
                }
            }))
        };
        return responses_1.ApiResponse.success(res, orderWithParsedImages);
    }
    catch (error) {
        console.error('Ошибка получения заказа:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении заказа');
    }
});
router.put('/:id/status', requireAdmin_1.requireAdmin, [
    (0, express_validator_1.param)('id').isInt({ min: 1 }),
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        const existingOrder = await prisma_1.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!existingOrder) {
            return responses_1.ApiResponse.notFound(res, 'Заказ не найден');
        }
        const updatedOrder = await prisma_1.prisma.order.update({
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
        const orderWithParsedImages = {
            ...updatedOrder,
            items: updatedOrder.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: (0, normalize_1.toStringArray)(item.product.images)
                }
            }))
        };
        return responses_1.ApiResponse.success(res, orderWithParsedImages);
    }
    catch (error) {
        console.error('Ошибка обновления статуса заказа:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при обновлении статуса заказа');
    }
});
exports.default = router;
