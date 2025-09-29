"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const telegramAuth_1 = require("../telegramAuth");
const telegram_1 = require("../../utils/telegram");
const prisma_1 = require("../../lib/prisma");
const setup_1 = require("../../__tests__/setup");
vitest_1.vi.mock('../../utils/telegram');
vitest_1.vi.mock('../../lib/prisma', () => ({
    prisma: {
        user: {
            upsert: vitest_1.vi.fn(),
        },
    },
}));
const mockValidateTelegramInitData = vitest_1.vi.mocked(telegram_1.validateTelegramInitData);
const mockParseTelegramInitData = vitest_1.vi.mocked(telegram_1.parseTelegramInitData);
const mockPrismaUser = vitest_1.vi.mocked(prisma_1.prisma.user);
(0, vitest_1.describe)('telegramAuth middleware', () => {
    let req;
    let res;
    let next;
    (0, vitest_1.beforeEach)(() => {
        req = {
            headers: {},
        };
        res = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
        next = vitest_1.vi.fn();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('requireAuth', () => {
        (0, vitest_1.it)('should return 401 when no x-telegram-init-data header is present', async () => {
            await (0, telegramAuth_1.requireAuth)(req, res, next);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Требуется аутентификация через Telegram WebApp',
                },
                timestamp: vitest_1.expect.any(String),
            });
            (0, vitest_1.expect)(next).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should return 401 when telegram data validation fails', async () => {
            const initData = (0, setup_1.buildTelegramInitData)({});
            req.headers = { 'x-telegram-init-data': initData };
            mockValidateTelegramInitData.mockReturnValue(false);
            await (0, telegramAuth_1.requireAuth)(req, res, next);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Недействительные данные аутентификации Telegram',
                },
                timestamp: vitest_1.expect.any(String),
            });
        });
        (0, vitest_1.it)('should return 401 when auth_date is expired (TTL exceeded)', async () => {
            const expiredInitData = (0, setup_1.buildExpiredTelegramInitData)({});
            req.headers = { 'x-telegram-init-data': expiredInitData };
            mockValidateTelegramInitData.mockReturnValue(true);
            await (0, telegramAuth_1.requireAuth)(req, res, next);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: 'Просроченные данные аутентификации Telegram',
                },
                timestamp: vitest_1.expect.any(String),
            });
        });
        (0, vitest_1.it)('should return 403 when user is banned', async () => {
            const telegramUser = { id: 123, first_name: 'Test', username: 'testuser' };
            const initData = (0, setup_1.buildTelegramInitData)({ user: telegramUser });
            req.headers = { 'x-telegram-init-data': initData };
            mockValidateTelegramInitData.mockReturnValue(true);
            mockParseTelegramInitData.mockReturnValue(telegramUser);
            mockPrismaUser.upsert.mockResolvedValue({
                id: 1,
                telegramId: '123',
                username: 'testuser',
                firstName: 'Test',
                lastName: null,
                avatarUrl: null,
                role: 'user',
                isBanned: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await (0, telegramAuth_1.requireAuth)(req, res, next);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(403);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Аккаунт заблокирован. Обратитесь к администрации.',
                },
                timestamp: vitest_1.expect.any(String),
            });
        });
        (0, vitest_1.it)('should upsert user and call next when telegram data is valid', async () => {
            const telegramUser = { id: 123, first_name: 'Test', username: 'testuser' };
            const initData = (0, setup_1.buildTelegramInitData)({ user: telegramUser });
            const upsertedUser = {
                id: 1,
                telegramId: '123',
                username: 'testuser',
                firstName: 'Test',
                lastName: null,
                avatarUrl: null,
                role: 'user',
                isBanned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            req.headers = { 'x-telegram-init-data': initData };
            mockValidateTelegramInitData.mockReturnValue(true);
            mockParseTelegramInitData.mockReturnValue(telegramUser);
            mockPrismaUser.upsert.mockResolvedValue(upsertedUser);
            await (0, telegramAuth_1.requireAuth)(req, res, next);
            (0, vitest_1.expect)(mockPrismaUser.upsert).toHaveBeenCalledWith({
                where: { telegramId: '123' },
                update: {
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: undefined,
                    avatarUrl: undefined,
                    role: 'user',
                    updatedAt: vitest_1.expect.any(Date),
                },
                create: {
                    telegramId: '123',
                    username: 'testuser',
                    firstName: 'Test',
                    lastName: undefined,
                    avatarUrl: undefined,
                    role: 'user',
                },
            });
            (0, vitest_1.expect)(req.user).toEqual({
                id: 1,
                telegramId: '123',
                username: 'testuser',
                firstName: 'Test',
                lastName: undefined,
                avatarUrl: undefined,
                role: 'user',
            });
            (0, vitest_1.expect)(next).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle database errors gracefully', async () => {
            const telegramUser = { id: 123, first_name: 'Test', username: 'testuser' };
            const initData = (0, setup_1.buildTelegramInitData)({ user: telegramUser });
            req.headers = { 'x-telegram-init-data': initData };
            mockValidateTelegramInitData.mockReturnValue(true);
            mockParseTelegramInitData.mockReturnValue(telegramUser);
            mockPrismaUser.upsert.mockRejectedValue(new Error('Database error'));
            await (0, telegramAuth_1.requireAuth)(req, res, next);
            (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
            (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Ошибка сервера при аутентификации',
                },
                timestamp: vitest_1.expect.any(String),
            });
        });
    });
});
