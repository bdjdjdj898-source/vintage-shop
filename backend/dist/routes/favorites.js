"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const softTelegramAuth_1 = require("../middleware/softTelegramAuth");
const validateRequest_1 = require("../middleware/validateRequest");
const responses_1 = require("../utils/responses");
const normalize_1 = require("../utils/normalize");
const auth_1 = require("../types/auth");
const logger_1 = __importDefault(require("../lib/logger"));
const router = (0, express_1.Router)();
router.get('/', softTelegramAuth_1.softAuth, async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const userId = user.id;
        const favorites = await prisma_1.prisma.favorite.findMany({
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
        const activeProducts = favorites
            .filter(fav => fav.product.isActive)
            .map(fav => ({
            ...fav.product,
            images: (0, normalize_1.toStringArray)(fav.product.images),
            favoriteId: fav.id,
            favoritedAt: fav.createdAt
        }));
        return responses_1.ApiResponse.success(res, activeProducts);
    }
    catch (error) {
        const user = req.user ? (0, auth_1.getAuthenticatedUser)(req.user) : null;
        logger_1.default.error('Error fetching favorites', {
            reqId: req.requestId,
            userId: user?.id,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при получении избранного');
    }
});
router.post('/:productId', softTelegramAuth_1.softAuth, [
    (0, express_validator_1.param)('productId').isInt({ min: 1 }).toInt(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const userId = user.id;
        const productId = Number(req.params.productId);
        const product = await prisma_1.prisma.product.findFirst({
            where: {
                id: productId,
                isActive: true
            }
        });
        if (!product) {
            return responses_1.ApiResponse.notFound(res, 'Товар не найден');
        }
        const existingFavorite = await prisma_1.prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        if (existingFavorite) {
            return responses_1.ApiResponse.validationError(res, 'Товар уже в избранном');
        }
        const favorite = await prisma_1.prisma.favorite.create({
            data: {
                userId,
                productId
            },
            include: {
                product: true
            }
        });
        return responses_1.ApiResponse.success(res, {
            ...favorite.product,
            images: (0, normalize_1.toStringArray)(favorite.product.images),
            favoriteId: favorite.id,
            favoritedAt: favorite.createdAt
        }, 201);
    }
    catch (error) {
        const user = req.user ? (0, auth_1.getAuthenticatedUser)(req.user) : null;
        logger_1.default.error('Error adding to favorites', {
            reqId: req.requestId,
            userId: user?.id,
            productId: req.params.productId,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при добавлении в избранное');
    }
});
router.delete('/:productId', softTelegramAuth_1.softAuth, [
    (0, express_validator_1.param)('productId').isInt({ min: 1 }).toInt(),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const userId = user.id;
        const productId = Number(req.params.productId);
        const favorite = await prisma_1.prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        if (!favorite) {
            return responses_1.ApiResponse.notFound(res, 'Товар не найден в избранном');
        }
        await prisma_1.prisma.favorite.delete({
            where: {
                id: favorite.id
            }
        });
        return responses_1.ApiResponse.success(res, { message: 'Товар удален из избранного' });
    }
    catch (error) {
        const user = req.user ? (0, auth_1.getAuthenticatedUser)(req.user) : null;
        logger_1.default.error('Error removing from favorites', {
            reqId: req.requestId,
            userId: user?.id,
            productId: req.params.productId,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при удалении из избранного');
    }
});
exports.default = router;
