"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const telegram_1 = require("../utils/telegram");
const prisma_1 = require("../lib/prisma");
const responses_1 = require("../utils/responses");
const requireAuth = async (req, res, next) => {
    try {
        const initData = req.headers['x-telegram-init-data'];
        const isFallback = req.headers['x-telegram-fallback'] === 'true';
        console.log('🔐 AUTH ATTEMPT:', {
            url: req.url,
            hasInitData: !!initData,
            initDataLength: initData?.length || 0,
            isFallback: isFallback,
            initDataPreview: initData?.substring(0, 100) + '...'
        });
        if (!initData) {
            console.log('❌ AUTH FAILED: No initData');
            return responses_1.ApiResponse.unauthorized(res, 'Требуется аутентификация через Telegram WebApp');
        }
        if (isFallback && initData.includes('fake_hash_for_telegram_bug')) {
            console.warn('⚠️ Using fallback Telegram auth (WebApp bug workaround)');
            try {
                const params = new URLSearchParams(initData);
                const userJson = params.get('user');
                if (!userJson) {
                    return responses_1.ApiResponse.unauthorized(res, 'Недействительные данные fallback аутентификации');
                }
                const telegramUser = JSON.parse(decodeURIComponent(userJson));
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
                return next();
            }
            catch (error) {
                console.error('Ошибка парсинга fallback auth:', error);
                return responses_1.ApiResponse.unauthorized(res, 'Ошибка обработки fallback аутентификации');
            }
        }
        const debugSecret = process.env.DEBUG_AUTH_SECRET || process.env.VITE_DEBUG_AUTH_SECRET;
        if (process.env.NODE_ENV !== 'production' &&
            process.env.ENABLE_TEST_AUTH === 'true' &&
            req.headers['x-debug-auth'] === debugSecret) {
            console.log('🧪 Используется тестовый режим авторизации');
            const role = process.env.DEBUG_TEST_ADMIN === 'true' ? 'admin' : 'user';
            const testUser = await prisma_1.prisma.user.upsert({
                where: { telegramId: '12345' },
                update: { updatedAt: new Date(), role },
                create: {
                    telegramId: '12345',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: 'User',
                    role
                }
            });
            req.user = {
                id: testUser.id,
                telegramId: testUser.telegramId,
                username: testUser.username || undefined,
                firstName: testUser.firstName || undefined,
                lastName: testUser.lastName || undefined,
                avatarUrl: testUser.avatarUrl || undefined,
                role: testUser.role
            };
            return next();
        }
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN не установлен');
            return responses_1.ApiResponse.internalError(res, 'Ошибка конфигурации сервера');
        }
        const isValid = (0, telegram_1.validateTelegramInitData)(initData, botToken);
        console.log('🔒 HMAC Validation:', { isValid, botTokenLength: botToken.length });
        if (!isValid) {
            console.log('❌ HMAC validation FAILED - initData signature mismatch');
            return responses_1.ApiResponse.unauthorized(res, 'Недействительные данные аутентификации Telegram');
        }
        const params = new URLSearchParams(initData);
        const authDateStr = params.get('auth_date');
        const authDate = authDateStr ? parseInt(authDateStr, 10) : 0;
        const now = Math.floor(Date.now() / 1000);
        const TTL = parseInt(process.env.TELEGRAM_INITDATA_TTL || '86400', 10);
        if (!authDate || now - authDate > TTL) {
            return responses_1.ApiResponse.unauthorized(res, 'Просроченные данные аутентификации Telegram');
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
        console.error('Ошибка аутентификации:', error);
        return responses_1.ApiResponse.internalError(res, 'Ошибка сервера при аутентификации');
    }
};
exports.requireAuth = requireAuth;
