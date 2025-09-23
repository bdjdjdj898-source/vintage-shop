import { Request, Response, NextFunction } from 'express';
import { requireAuth } from './telegramAuth';

export const requireAdmin = [
  requireAuth, // Сначала проверяем аутентификацию
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Требуется аутентификация' 
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Доступ запрещён. Требуются права администратора.',
        userRole: req.user.role 
      });
    }

    next();
  }
];