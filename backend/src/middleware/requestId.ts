import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../lib/logger';

// Request interface extension is in types/express.d.ts

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate or use existing request ID from header
  const requestId = req.headers['x-request-id'] as string || uuidv4();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Log request start
  const startTime = Date.now();

  logger.info('Request started', {
    reqId: requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  // Override res.end to log request completion
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding?: any): any {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      reqId: requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};