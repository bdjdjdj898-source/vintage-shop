"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = void 0;
const telegram_1 = require("../utils/telegram");
const optionalAuth = async (req, res, next) => {
    try {
        const initData = req.headers['x-telegram-init-data'];
        if (!initData) {
            return next();
        }
        const debugSecret = process.env.DEBUG_AUTH_SECRET || process.env.VITE_DEBUG_AUTH_SECRET;
        if (process.env.NODE_ENV !== 'production' &&
            process.env.ENABLE_TEST_AUTH === 'true' &&
            req.headers['x-debug-auth'] === debugSecret) {
            console.log('🧪 Используется тестовый режим авторизации (optional)');
            const role = process.env.DEBUG_TEST_ADMIN === 'true' ? 'admin' : 'user';
            req.user = {
                telegramId: '12345',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                avatarUrl: undefined,
                role: role,
                isFromInitData: true
            };
            return next();
        }
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN не установлен');
            return next();
        }
        const isValid = (0, telegram_1.validateTelegramInitData)(initData, botToken);
        if (!isValid) {
            return next();
        }
        const params = new URLSearchParams(initData);
        const authDateStr = params.get('auth_date');
        const authDate = authDateStr ? parseInt(authDateStr, 10) : 0;
        const now = Math.floor(Date.now() / 1000);
        const TTL = parseInt(process.env.TELEGRAM_INITDATA_TTL || '86400', 10);
        if (!authDate || now - authDate > TTL) {
            return next();
        }
        const telegramUser = (0, telegram_1.parseTelegramInitData)(initData);
        if (!telegramUser) {
            return next();
        }
        const isAdmin = (0, telegram_1.isAdminTelegramId)(telegramUser.id.toString());
        const role = isAdmin ? 'admin' : 'user';
        req.user = {
            telegramId: telegramUser.id.toString(),
            username: telegramUser.username || undefined,
            firstName: telegramUser.first_name || undefined,
            lastName: telegramUser.last_name || undefined,
            avatarUrl: telegramUser.photo_url || undefined,
            role: role,
            isFromInitData: true
        };
        next();
    }
    catch (error) {
        console.error('Ошибка опциональной аутентификации:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
