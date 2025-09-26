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

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import logger, { loggerStream } from './lib/logger';

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

// CORS конфигурация
const defaultCorsOrigins = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = (process.env.CORS_ORIGINS || defaultCorsOrigins)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data']
}));

// Общие middleware
app.use(requestIdMiddleware);
app.use(morgan('combined', { stream: loggerStream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint (before rate limiter to avoid any limits)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Apply rate limiter to API routes only (after health check)
app.use('/api', limiter);

// API routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/me', meRouter);

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
});

export default app;