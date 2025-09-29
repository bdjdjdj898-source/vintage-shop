"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../../lib/prisma");
const orders_1 = __importDefault(require("../orders"));
vitest_1.vi.mock('../../middleware/telegramAuth', () => ({
    requireAuth: (req, res, next) => {
        req.user = {
            id: 1,
            telegramId: '123',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            role: 'user',
            isBanned: false,
        };
        next();
    },
}));
vitest_1.vi.mock('../../middleware/requireAdmin', () => ({
    requireAdmin: [
        (req, res, next) => {
            req.user = {
                id: 1,
                telegramId: '123',
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isBanned: false,
            };
            next();
        },
        (req, res, next) => next(),
    ],
}));
vitest_1.vi.mock('../../lib/prisma', () => ({
    prisma: {
        order: {
            findMany: vitest_1.vi.fn(),
            findFirst: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            count: vitest_1.vi.fn(),
        },
        cart: {
            findUnique: vitest_1.vi.fn(),
        },
        cartItem: {
            deleteMany: vitest_1.vi.fn(),
        },
        orderItem: {
            create: vitest_1.vi.fn(),
        },
        product: {
            update: vitest_1.vi.fn(),
        },
        $transaction: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('../../services/telegramBot', () => ({
    telegramBot: {
        formatOrderNotification: vitest_1.vi.fn().mockReturnValue('Notification message'),
        notifyAdmins: vitest_1.vi.fn(),
    },
}));
const mockPrisma = vitest_1.vi.mocked(prisma_1.prisma);
(0, vitest_1.describe)('Orders Routes', () => {
    let app;
    (0, vitest_1.beforeEach)(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api/orders', orders_1.default);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('GET /api/orders', () => {
        (0, vitest_1.it)('should return user orders with pagination', async () => {
            const mockOrders = [
                {
                    id: 1,
                    userId: 1,
                    status: 'pending',
                    totalAmount: 5000,
                    shippingInfo: { name: 'Test User', phone: '+7123456789', address: 'Test Address' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    items: [
                        {
                            id: 1,
                            orderId: 1,
                            productId: 1,
                            quantity: 1,
                            price: 5000,
                            product: {
                                id: 1,
                                title: 'Test Product',
                                brand: 'Test Brand',
                                images: ['test.jpg'],
                                isActive: true,
                            },
                        },
                    ],
                },
            ];
            mockPrisma.order.findMany.mockResolvedValue(mockOrders);
            mockPrisma.order.count.mockResolvedValue(1);
            const response = await (0, supertest_1.default)(app).get('/api/orders');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.data).toHaveLength(1);
            (0, vitest_1.expect)(response.body.data[0].items[0].product.images).toEqual(['test.jpg']);
        });
        (0, vitest_1.it)('should filter orders by status when provided', async () => {
            mockPrisma.order.findMany.mockResolvedValue([]);
            mockPrisma.order.count.mockResolvedValue(0);
            await (0, supertest_1.default)(app).get('/api/orders?status=completed');
            (0, vitest_1.expect)(mockPrisma.order.findMany).toHaveBeenCalledWith({
                where: { userId: 1, status: 'completed' },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 10,
            });
        });
    });
    (0, vitest_1.describe)('POST /api/orders', () => {
        const validShippingInfo = {
            name: 'Test User',
            phone: '+79123456789',
            address: 'Test Address, City, 123456',
            email: 'test@example.com',
        };
        (0, vitest_1.it)('should create order successfully when cart has items', async () => {
            const mockCart = {
                id: 1,
                userId: 1,
                items: [
                    {
                        id: 1,
                        productId: 1,
                        quantity: 1,
                        product: { id: 1, price: 5000, isActive: true },
                    },
                ],
            };
            const mockOrder = {
                id: 1,
                userId: 1,
                status: 'pending',
                totalAmount: 5000,
                shippingInfo: validShippingInfo,
                items: [
                    {
                        id: 1,
                        product: {
                            id: 1,
                            title: 'Test Product',
                            images: '["test.jpg"]',
                        },
                    },
                ],
            };
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
            mockPrisma.order.create.mockResolvedValue(mockOrder);
            mockPrisma.orderItem.create.mockResolvedValue({});
            mockPrisma.product.update.mockResolvedValue({});
            mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
            mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
            const response = await (0, supertest_1.default)(app)
                .post('/api/orders')
                .send({ shippingInfo: validShippingInfo });
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.data.id).toBe(1);
        });
        (0, vitest_1.it)('should return error when cart is empty', async () => {
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.cart.findUnique.mockResolvedValue({ items: [] });
            const response = await (0, supertest_1.default)(app)
                .post('/api/orders')
                .send({ shippingInfo: validShippingInfo });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('CART_EMPTY');
        });
        (0, vitest_1.it)('should return error when products are unavailable', async () => {
            const mockCart = {
                id: 1,
                userId: 1,
                items: [
                    {
                        id: 1,
                        productId: 1,
                        quantity: 1,
                        product: { id: 1, price: 5000, isActive: false },
                    },
                ],
            };
            mockPrisma.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrisma);
            });
            mockPrisma.cart.findUnique.mockResolvedValue(mockCart);
            const response = await (0, supertest_1.default)(app)
                .post('/api/orders')
                .send({ shippingInfo: validShippingInfo });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('PRODUCT_UNAVAILABLE');
        });
        (0, vitest_1.it)('should validate shipping info', async () => {
            const invalidShippingInfo = {
                name: 'T',
                phone: 'invalid',
                address: 'short',
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/orders')
                .send({ shippingInfo: invalidShippingInfo });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
    (0, vitest_1.describe)('GET /api/orders/:id', () => {
        (0, vitest_1.it)('should return specific order for user', async () => {
            const mockOrder = {
                id: 1,
                userId: 1,
                status: 'pending',
                totalAmount: 5000,
                shippingInfo: { name: 'Test User' },
                items: [
                    {
                        id: 1,
                        product: {
                            id: 1,
                            title: 'Test Product',
                            images: '["test.jpg"]',
                        },
                    },
                ],
            };
            mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
            const response = await (0, supertest_1.default)(app).get('/api/orders/1');
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.data.id).toBe(1);
        });
        (0, vitest_1.it)('should return 404 when order not found', async () => {
            mockPrisma.order.findFirst.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app).get('/api/orders/999');
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body.success).toBe(false);
        });
    });
    (0, vitest_1.describe)('PUT /api/orders/:id/status', () => {
        (0, vitest_1.it)('should update order status for admin', async () => {
            const mockOrder = {
                id: 1,
                userId: 1,
                status: 'confirmed',
                totalAmount: 5000,
                items: [
                    {
                        id: 1,
                        product: {
                            id: 1,
                            title: 'Test Product',
                            images: '["test.jpg"]',
                        },
                    },
                ],
            };
            mockPrisma.order.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.order.update.mockResolvedValue(mockOrder);
            const response = await (0, supertest_1.default)(app)
                .put('/api/orders/1/status')
                .send({ status: 'confirmed' });
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.data.status).toBe('confirmed');
        });
        (0, vitest_1.it)('should return 404 when order does not exist', async () => {
            mockPrisma.order.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .put('/api/orders/999/status')
                .send({ status: 'confirmed' });
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body.success).toBe(false);
        });
        (0, vitest_1.it)('should validate status values', async () => {
            const response = await (0, supertest_1.default)(app)
                .put('/api/orders/1/status')
                .send({ status: 'invalid_status' });
            (0, vitest_1.expect)(response.status).toBe(400);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
});
