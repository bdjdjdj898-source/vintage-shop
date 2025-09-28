import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './telegramAuth';
import { ApiResponse } from '../utils/responses';

export const requireAdmin = [
  requireAuth, // Сначала проверяем аутентификацию
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Требуется аутентификация');
    }

    if (req.user.role !== 'admin') {
      return ApiResponse.forbidden(res, 'Доступ запрещён. Требуются права администратора.');
    }

    next();
  }
];