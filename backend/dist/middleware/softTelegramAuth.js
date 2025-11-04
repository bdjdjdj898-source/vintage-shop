"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softAuth = void 0;
const telegram_1 = require("../utils/telegram");
const prisma_1 = require("../lib/prisma");
const responses_1 = require("../utils/responses");
const softAuth = async (req, res, next) => {
    try {
        const initData = req.headers['x-telegram-init-data'];
        if (!initData) {
            return responses_1.ApiResponse.unauthorized(res, 'Требуется аутентификация через Telegram WebApp');
        }
        const telegramUser = (0, telegram_1.parseTelegramInitData)(initData);
        if (!telegramUser) {
            return responses_1.ApiResponse.unauthorized(res, 'Не удалось получить данные пользователя из Telegram');
        }
        const isAdmin = (0, telegram_1.isAdminTelegramId)(telegramUser.id.toString());
        const role = isAdmin ? 'admin' : 'user';
        const user = await prisma_1.prisma.user.upsert({
            where: { telegramId: telegramUser.id.toString() },
            update: {
                username: telegramUser.username,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
                avatarUrl: telegramUser.photo_url,
                role: role,
                updatedAt: new Date()
            },
            create: {
                telegramId: telegramUser.id.toString(),
                username: telegramUser.username,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
                avatarUrl: telegramUser.photo_url,
                role: role
            }
        });
        if (user.isBanned) {
            return responses_1.ApiResponse.forbidden(res, 'Аккаунт заблокирован. Обратитесь к администрации.');
        }
        req.user = {
            id: user.id,
            telegramId: user.telegramId,
            username: user.username || undefined,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            avatarUrl: user.avatarUrl || undefined,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Ошибка soft auth:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при аутентификации');
    }
};
exports.softAuth = softAuth;
