import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Роутеры
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import meRouter from './routes/me';
import favoritesRouter from './routes/favorites';
import searchHistoryRouter from './routes/searchHistory';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import logger, { loggerStream } from './lib/logger';
import { prisma } from './lib/prisma';

// Services
import { telegramBot } from './services/telegramBot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Nginx
app.set('trust proxy', true);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 500, // Higher limit to be more lenient for admin usage
  message: {
    error: 'Слишком много запросов с этого IP, попробуйте позже.'
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Optional CSP configuration (commented out by default)
// Enable if you need custom CSP headers beyond what's configured in nginx/reverse proxy
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'"],
//     scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://telegram.org"],
//     styleSrc: ["'self'", "'unsafe-inline'"],
//     imgSrc: ["'self'", "data:", "https:", "blob:"],
//     connectSrc: ["'self'", "https://api.telegram.org"],
//     fontSrc: ["'self'", "data:"],
//     frameSrc: ["https://telegram.org"],
//   },
// }));

// CORS конфигурация
const defaultCorsOrigins = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = (process.env.CORS_ORIGINS || defaultCorsOrigins)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// CORS headers configuration
const baseHeaders = ['Content-Type', 'Authorization', 'x-telegram-init-data'];
const allowedHeaders = process.env.NODE_ENV !== 'production'
  ? [...baseHeaders, 'x-debug-auth']
  : baseHeaders;

// CORS origin configuration
const corsOrigin = allowedOrigins.length > 0
  ? allowedOrigins
  : process.env.NODE_ENV === 'production'
    ? false
    : true;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders
}));

// Общие middleware
app.use(requestIdMiddleware);
app.use(morgan('combined', { stream: loggerStream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Client-side error logging endpoint (before rate limiter)
app.post('/api/log-error', express.json(), (req, res) => {
  const { message, stack, url, userAgent } = req.body;
  logger.error('Client-side error', {
    message,
    stack,
    url,
    userAgent,
    ip: req.ip
  });
  res.status(200).json({ logged: true });
});

// Health check endpoint (before rate limiter to avoid any limits)
app.get('/health', async (req, res) => {
  let dbStatus: 'up' | 'down' = 'down';
  let overallStatus: 'ok' | 'degraded' = 'degraded';

  try {
    // Simple DB ping with raw query
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'up';
    overallStatus = 'ok';
  } catch (error) {
    logger.error('Health check DB ping failed', { error: error instanceof Error ? error.message : error });
    dbStatus = 'down';
    overallStatus = 'degraded';
  }

  const response = {
    status: overallStatus,
    db: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  const statusCode = overallStatus === 'ok' ? 200 : 503;
  res.status(statusCode).json(response);
});

// Apply rate limiter to API routes only (after health check)
app.use('/api', limiter);

// API routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/me', meRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/search-history', searchHistoryRouter);

// Express обрабатывает ТОЛЬКО API роуты
// Статические файлы обслуживаются Nginx в production и Vite dev server в development
app.get('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API роут не найден',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler должен быть последним
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Bot API URL: ${process.env.BOT_API_URL || 'http://localhost:3001'}`);
});

export default app;