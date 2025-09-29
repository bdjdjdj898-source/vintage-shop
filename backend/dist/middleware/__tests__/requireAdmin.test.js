"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const requireAdmin_1 = require("../requireAdmin");
(0, vitest_1.describe)('requireAdmin middleware', () => {
    let req;
    let res;
    let next;
    (0, vitest_1.beforeEach)(() => {
        req = {};
        res = {
            status: vitest_1.vi.fn().mockReturnThis(),
            json: vitest_1.vi.fn(),
        };
        next = vitest_1.vi.fn();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should return 401 when user is not authenticated', () => {
        (0, requireAdmin_1.requireAdmin)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(401);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'AUTH_REQUIRED',
                message: 'Требуется аутентификация',
            },
            timestamp: vitest_1.expect.any(String),
        });
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('should return 403 when user is not admin', () => {
        req.user = {
            id: 1,
            telegramId: '123',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        (0, requireAdmin_1.requireAdmin)(req, res, next);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(403);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'ACCESS_DENIED',
                message: 'Требуются права администратора',
            },
            timestamp: vitest_1.expect.any(String),
        });
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('should call next when user is admin', () => {
        req.user = {
            id: 1,
            telegramId: '123',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isBanned: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        (0, requireAdmin_1.requireAdmin)(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalled();
        (0, vitest_1.expect)(res.status).not.toHaveBeenCalled();
        (0, vitest_1.expect)(res.json).not.toHaveBeenCalled();
    });
});
