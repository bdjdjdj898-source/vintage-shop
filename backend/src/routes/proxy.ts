import { Router, Request, Response } from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import logger from '../lib/logger';

const router = Router();

// GET /api/proxy/image/:encodedUrl - проксирует изображения для обхода блокировок
router.get('/image/:encodedUrl', [
  param('encodedUrl').isString(),
  validateRequest
], async (req: Request, res: Response) => {
  try {
    const encodedUrl = req.params.encodedUrl;
    const imageUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Fetch image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      logger.error('Failed to fetch image', { imageUrl, status: response.status });
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Stream image to client
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    logger.error('Error proxying image', {
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
