"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
const telegramAuth_1 = require("../middleware/telegramAuth");
const validateRequest_1 = require("../middleware/validateRequest");
const responses_1 = require("../utils/responses");
const auth_1 = require("../types/auth");
const logger_1 = __importDefault(require("../lib/logger"));
const router = (0, express_1.Router)();
const MAX_HISTORY_ITEMS = 15;
router.get('/', telegramAuth_1.requireAuth, async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const userId = user.id;
        const history = await prisma_1.prisma.searchHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: MAX_HISTORY_ITEMS,
            select: {
                id: true,
                query: true,
                createdAt: true
            }
        });
        return responses_1.ApiResponse.success(res, history);
    }
    catch (error) {
        const user = req.user ? (0, auth_1.getAuthenticatedUser)(req.user) : null;
        logger_1.default.error('Error fetching search history', {
            reqId: req.requestId,
            userId: user?.id,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при получении истории поиска');
    }
});
router.post('/', telegramAuth_1.requireAuth, [
    (0, express_validator_1.body)('query').isString().trim().isLength({ min: 1, max: 100 }),
    validateRequest_1.validateRequest
], async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const userId = user.id;
        const { query } = req.body;
        if (!query.trim()) {
            return responses_1.ApiResponse.validationError(res, 'Поисковый запрос не может быть пустым');
        }
        const existingQuery = await prisma_1.prisma.searchHistory.findFirst({
            where: {
                userId,
                query: query.trim()
            }
        });
        if (existingQuery) {
            await prisma_1.prisma.searchHistory.delete({
                where: { id: existingQuery.id }
            });
        }
        const searchHistory = await prisma_1.prisma.searchHistory.create({
            data: {
                userId,
                query: query.trim()
            }
        });
        const totalCount = await prisma_1.prisma.searchHistory.count({
            where: { userId }
        });
        if (totalCount > MAX_HISTORY_ITEMS) {
            const itemsToDelete = totalCount - MAX_HISTORY_ITEMS;
            const oldestItems = await prisma_1.prisma.searchHistory.findMany({
                where: { userId },
                orderBy: { createdAt: 'asc' },
                take: itemsToDelete,
                select: { id: true }
            });
            await prisma_1.prisma.searchHistory.deleteMany({
                where: {
                    id: {
                        in: oldestItems.map(item => item.id)
                    }
                }
            });
        }
        return responses_1.ApiResponse.success(res, searchHistory, 201);
    }
    catch (error) {
        const user = req.user ? (0, auth_1.getAuthenticatedUser)(req.user) : null;
        logger_1.default.error('Error saving search history', {
            reqId: req.requestId,
            userId: user?.id,
            query: req.body?.query,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при сохранении истории поиска');
    }
});
router.delete('/', telegramAuth_1.requireAuth, async (req, res) => {
    try {
        const user = (0, auth_1.getAuthenticatedUser)(req.user);
        const userId = user.id;
        await prisma_1.prisma.searchHistory.deleteMany({
            where: { userId }
        });
        return responses_1.ApiResponse.success(res, { message: 'История поиска очищена' });
    }
    catch (error) {
        const user = req.user ? (0, auth_1.getAuthenticatedUser)(req.user) : null;
        logger_1.default.error('Error clearing search history', {
            reqId: req.requestId,
            userId: user?.id,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        });
        return responses_1.ApiResponse.internalError(res, 'Ошибка при очистке истории поиска');
    }
});
exports.default = router;
