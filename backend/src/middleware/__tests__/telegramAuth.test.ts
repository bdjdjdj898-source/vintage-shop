import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../telegramAuth';
import { validateTelegramInitData, parseTelegramInitData } from '../../utils/telegram';
import { prisma } from '../../lib/prisma';
import { buildTelegramInitData, buildExpiredTelegramInitData } from '../../__tests__/setup';

// Mock dependencies
vi.mock('../../utils/telegram');
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
    },
  },
}));

const mockValidateTelegramInitData = vi.mocked(validateTelegramInitData);
const mockParseTelegramInitData = vi.mocked(parseTelegramInitData);
const mockPrismaUser = vi.mocked(prisma.user);

describe('telegramAuth middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return 401 when no x-telegram-init-data header is present', async () => {
      await requireAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Требуется аутентификация через Telegram WebApp',
        },
        timestamp: expect.any(String),
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when telegram data validation fails', async () => {
      const initData = buildTelegramInitData({});
      req.headers = { 'x-telegram-init-data': initData };
      mockValidateTelegramInitData.mockReturnValue(false);

      await requireAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Недействительные данные аутентификации Telegram',
        },
        timestamp: expect.any(String),
      });
    });

    it('should return 401 when auth_date is expired (TTL exceeded)', async () => {
      const expiredInitData = buildExpiredTelegramInitData({});
      req.headers = { 'x-telegram-init-data': expiredInitData };
      mockValidateTelegramInitData.mockReturnValue(true);

      await requireAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Просроченные данные аутентификации Telegram',
        },
        timestamp: expect.any(String),
      });
    });

    it('should return 403 when user is banned', async () => {
      const telegramUser = { id: 123, first_name: 'Test', username: 'testuser' };
      const initData = buildTelegramInitData({ user: telegramUser });

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

      await requireAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Аккаунт заблокирован. Обратитесь к администрации.',
        },
        timestamp: expect.any(String),
      });
    });

    it('should upsert user and call next when telegram data is valid', async () => {
      const telegramUser = { id: 123, first_name: 'Test', username: 'testuser' };
      const initData = buildTelegramInitData({ user: telegramUser });

      const upsertedUser = {
        id: 1,
        telegramId: '123',
        username: 'testuser',
        firstName: 'Test',
        lastName: null,
        avatarUrl: null,
        role: 'user' as const,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      req.headers = { 'x-telegram-init-data': initData };
      mockValidateTelegramInitData.mockReturnValue(true);
      mockParseTelegramInitData.mockReturnValue(telegramUser);
      mockPrismaUser.upsert.mockResolvedValue(upsertedUser);

      await requireAuth(req as Request, res as Response, next);

      expect(mockPrismaUser.upsert).toHaveBeenCalledWith({
        where: { telegramId: '123' },
        update: {
          username: 'testuser',
          firstName: 'Test',
          lastName: undefined,
          avatarUrl: undefined,
          role: 'user',
          updatedAt: expect.any(Date),
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
      expect(req.user).toEqual({
        id: 1,
        telegramId: '123',
        username: 'testuser',
        firstName: 'Test',
        lastName: undefined,
        avatarUrl: undefined,
        role: 'user',
      });
      expect(next).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const telegramUser = { id: 123, first_name: 'Test', username: 'testuser' };
      const initData = buildTelegramInitData({ user: telegramUser });

      req.headers = { 'x-telegram-init-data': initData };
      mockValidateTelegramInitData.mockReturnValue(true);
      mockParseTelegramInitData.mockReturnValue(telegramUser);
      mockPrismaUser.upsert.mockRejectedValue(new Error('Database error'));

      await requireAuth(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ошибка сервера при аутентификации',
        },
        timestamp: expect.any(String),
      });
    });
  });
});