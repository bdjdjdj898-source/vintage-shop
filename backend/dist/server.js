"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const me_1 = __importDefault(require("./routes/me"));
const proxy_1 = __importDefault(require("./routes/proxy"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestId_1 = require("./middleware/requestId");
const logger_1 = __importStar(require("./lib/logger"));
const prisma_1 = require("./lib/prisma");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', true);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        error: 'Слишком много запросов с этого IP, попробуйте позже.'
    }
});
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
const defaultCorsOrigins = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = (process.env.CORS_ORIGINS || defaultCorsOrigins)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const baseHeaders = ['Content-Type', 'Authorization', 'x-telegram-init-data'];
const allowedHeaders = process.env.NODE_ENV !== 'production'
    ? [...baseHeaders, 'x-debug-auth']
    : baseHeaders;
const corsOrigin = allowedOrigins.length > 0
    ? allowedOrigins
    : process.env.NODE_ENV === 'production'
        ? false
        : true;
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders
}));
app.use(requestId_1.requestIdMiddleware);
app.use((0, morgan_1.default)('combined', { stream: logger_1.loggerStream }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.post('/api/log-error', express_1.default.json(), (req, res) => {
    const { message, stack, url, userAgent } = req.body;
    logger_1.default.error('Client-side error', {
        message,
        stack,
        url,
        userAgent,
        ip: req.ip
    });
    res.status(200).json({ logged: true });
});
app.get('/health', async (req, res) => {
    let dbStatus = 'down';
    let overallStatus = 'degraded';
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        dbStatus = 'up';
        overallStatus = 'ok';
    }
    catch (error) {
        logger_1.default.error('Health check DB ping failed', { error: error instanceof Error ? error.message : error });
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
app.use('/api', limiter);
app.use('/api/products', products_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/me', me_1.default);
app.use('/api/proxy', proxy_1.default);
app.get('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API роут не найден',
        path: req.originalUrl,
        method: req.method
    });
});
app.use(errorHandler_1.errorHandler);
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
app.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
    logger_1.default.info(`Health check: http://localhost:${PORT}/health`);
    logger_1.default.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
