import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../requireAdmin';

describe('requireAdmin middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 401 when user is not authenticated', () => {
    requireAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'AUTH_REQUIRED',
        message: 'Требуется аутентификация',
      },
      timestamp: expect.any(String),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when user is not admin', () => {
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

    requireAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'ACCESS_DENIED',
        message: 'Требуются права администратора',
      },
      timestamp: expect.any(String),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when user is admin', () => {
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

    requireAdmin(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});