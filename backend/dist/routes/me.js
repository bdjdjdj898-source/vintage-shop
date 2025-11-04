"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const softTelegramAuth_1 = require("../middleware/softTelegramAuth");
const responses_1 = require("../utils/responses");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../types/auth");
const router = (0, express_1.Router)();
router.get('/', softTelegramAuth_1.softAuth, async (req, res) => {
    try {
        const authenticatedUser = (0, auth_1.getAuthenticatedUser)(req.user);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: authenticatedUser.id },
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
                updatedAt: true
            }
        });
        if (!user) {
            return responses_1.ApiResponse.notFound(res, 'Пользователь не найден');
        }
        return responses_1.ApiResponse.success(res, user);
    }
    catch (error) {
        console.error('Ошибка получения профиля пользователя:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при получении профиля');
    }
});
exports.default = router;
