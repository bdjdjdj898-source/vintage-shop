import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/telegramAuth';
import { ApiResponse } from '../utils/responses';

const router = Router();

// GET /api/me - получить профиль текущего пользователя
router.get('/', requireAuth, (req: Request, res: Response) => {
  // User is guaranteed to exist due to requireAuth middleware
  return ApiResponse.success(res, req.user);
});

export default router;