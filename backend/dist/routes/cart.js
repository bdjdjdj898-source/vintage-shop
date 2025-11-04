"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validateRequest_1 = require("../middleware/validateRequest");
const telegramAuth_1 = require("../middleware/telegramAuth");
const prisma_1 = require("../lib/prisma");
const responses_1 = require("../utils/responses");
const normalize_1 = require("../utils/normalize");
const auth_1 = require("../types/auth");
const router = (0, express_1.Router)();
router.use(telegramAuth_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        let cart = await prisma_1.prisma.cart.findUnique({
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
            cart = await prisma_1.prisma.cart.create({
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
        const cartWithParsedImages = {
            ...cart,
            items: cart.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    images: (0, normalize_1.toStringArray)(item.product.images)
                }
            }))
        };
        return responses_1.ApiResponse.success(res, cartWithParsedImages);
    }
    catch (error) {
        console.error('Ошибка получения корзины:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении корзины');
    }
});
router.post('/items', [
    (0, express_validator_1.body)('productId').isInt({ min: 1 }),
    (0, express_validator_1.body)('quantity').optional().isInt({ min: 1 }).default(1),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const { productId, quantity = 1 } = req.body;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: productId }
        });
        if (!product || !product.isActive) {
            return responses_1.ApiResponse.businessError(res, responses_1.ErrorCode.PRODUCT_UNAVAILABLE, 'Товар не найден или недоступен');
        }
        let cart = await prisma_1.prisma.cart.findUnique({
            where: { userId: user.id }
        });
        if (!cart) {
            cart = await prisma_1.prisma.cart.create({
                data: { userId: user.id }
            });
        }
        const existingItem = await prisma_1.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: productId
                }
            }
        });
        const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
        const newTotalQuantity = currentQuantityInCart + quantity;
        if (newTotalQuantity > product.quantity) {
            return responses_1.ApiResponse.businessError(res, responses_1.ErrorCode.PRODUCT_UNAVAILABLE, `В наличии только ${product.quantity} шт. В корзине уже ${currentQuantityInCart} шт.`);
        }
        let cartItem;
        if (existingItem) {
            cartItem = await prisma_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newTotalQuantity },
                include: { product: true }
            });
        }
        else {
            cartItem = await prisma_1.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity
                },
                include: { product: true }
            });
        }
        const cartItemWithParsedImages = {
            ...cartItem,
            product: {
                ...cartItem.product,
                images: (0, normalize_1.toStringArray)(cartItem.product.images)
            }
        };
        return responses_1.ApiResponse.success(res, cartItemWithParsedImages, 201);
    }
    catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при добавлении в корзину');
    }
});
router.put('/items/:id', [
    (0, express_validator_1.param)('id').isInt({ min: 1 }),
    (0, express_validator_1.body)('quantity').isInt({ min: 1 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const cartItemId = parseInt(req.params.id);
        const { quantity } = req.body;
        const cartItem = await prisma_1.prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cart: {
                    userId: user.id
                }
            },
            include: { product: true }
        });
        if (!cartItem) {
            return responses_1.ApiResponse.notFound(res, 'Элемент корзины не найден');
        }
        if (!cartItem.product.isActive) {
            return responses_1.ApiResponse.businessError(res, responses_1.ErrorCode.PRODUCT_UNAVAILABLE, 'Товар больше недоступен');
        }
        if (quantity > cartItem.product.quantity) {
            return responses_1.ApiResponse.businessError(res, responses_1.ErrorCode.PRODUCT_UNAVAILABLE, `В наличии только ${cartItem.product.quantity} шт.`);
        }
        const updatedItem = await prisma_1.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: { product: true }
        });
        const updatedItemWithParsedImages = {
            ...updatedItem,
            product: {
                ...updatedItem.product,
                images: (0, normalize_1.toStringArray)(updatedItem.product.images)
            }
        };
        return responses_1.ApiResponse.success(res, updatedItemWithParsedImages);
    }
    catch (error) {
        console.error('Ошибка обновления корзины:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при обновлении корзины');
    }
});
router.delete('/items/:id', [
    (0, express_validator_1.param)('id').isInt({ min: 1 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const cartItemId = parseInt(req.params.id);
        const cartItem = await prisma_1.prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cart: {
                    userId: user.id
                }
            }
        });
        if (!cartItem) {
            return responses_1.ApiResponse.notFound(res, 'Элемент корзины не найден');
        }
        await prisma_1.prisma.cartItem.delete({
            where: { id: cartItemId }
        });
        return responses_1.ApiResponse.success(res, { message: 'Товар удален из корзины' });
    }
    catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при удалении из корзины');
    }
});
exports.default = router;
