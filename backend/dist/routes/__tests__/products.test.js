"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../../lib/prisma");
const products_1 = __importDefault(require("../products"));
vitest_1.vi.mock('../../middleware/requireAdmin', () => ({
    requireAdmin: [
        (req, res, next) => {
            if (req.headers['test-user-role'] === 'user') {
                req.user = {
                    id: 1,
                    telegramId: '123',
                    username: 'user',
                    firstName: 'Regular',
                    lastName: 'User',
                    role: 'user',
                    isBanned: false,
                };
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'ACCESS_DENIED',
                        message: 'Доступ запрещён. Требуются права администратора.',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            req.user = {
                id: 2,
                telegramId: '456',
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                isBanned: false,
            };
            next();
        },
    ],
}));
vitest_1.vi.mock('../../lib/prisma', () => ({
    prisma: {
        product: {
            create: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
        },
    },
}));
vitest_1.vi.mock('../../services/cloudinary', () => ({
    getCloudinarySignature: vitest_1.vi.fn().mockResolvedValue({
        signature: 'test_signature',
        timestamp: 123456789,
        public_id: 'test_public_id',
        api_key: 'test_api_key',
        cloud_name: 'test_cloud',
        folder: 'test_folder',
        resource_type: 'image',
    }),
}));
const mockPrisma = vitest_1.vi.mocked(prisma_1.prisma);
(0, vitest_1.describe)('Products Routes RBAC', () => {
    let app;
    (0, vitest_1.beforeEach)(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api/products', products_1.default);
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('POST /api/products', () => {
        const validProductData = {
            title: 'Test Product',
            brand: 'Test Brand',
            category: 'Куртки',
            size: 'M',
            color: 'Black',
            condition: 8,
            description: 'Test description',
            price: 5000,
            images: ['image1.jpg', 'image2.jpg'],
        };
        (0, vitest_1.it)('should return 403 for non-admin users', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/products')
                .set('test-user-role', 'user')
                .send(validProductData);
            (0, vitest_1.expect)(response.status).toBe(403);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('ACCESS_DENIED');
            (0, vitest_1.expect)(response.body.error.message).toBe('Доступ запрещён. Требуются права администратора.');
        });
        (0, vitest_1.it)('should succeed for admin users and return normalized images', async () => {
            const createdProduct = {
                id: 1,
                ...validProductData,
                images: validProductData.images,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockPrisma.product.create.mockResolvedValue(createdProduct);
            const response = await (0, supertest_1.default)(app)
                .post('/api/products')
                .send(validProductData);
            (0, vitest_1.expect)(response.status).toBe(201);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.data.images).toEqual(['image1.jpg', 'image2.jpg']);
            (0, vitest_1.expect)(mockPrisma.product.create).toHaveBeenCalledWith({
                data: {
                    title: 'Test Product',
                    brand: 'Test Brand',
                    category: 'Куртки',
                    size: 'M',
                    color: 'Black',
                    condition: 8,
                    description: 'Test description',
                    price: 5000,
                    images: ['image1.jpg', 'image2.jpg'],
                },
            });
        });
    });
    (0, vitest_1.describe)('PUT /api/products/:id', () => {
        const updateData = {
            title: 'Updated Product',
            price: 6000,
            images: ['updated1.jpg', 'updated2.jpg'],
        };
        (0, vitest_1.it)('should return 403 for non-admin users', async () => {
            const response = await (0, supertest_1.default)(app)
                .put('/api/products/1')
                .set('test-user-role', 'user')
                .send(updateData);
            (0, vitest_1.expect)(response.status).toBe(403);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('ACCESS_DENIED');
            (0, vitest_1.expect)(response.body.error.message).toBe('Доступ запрещён. Требуются права администратора.');
        });
        (0, vitest_1.it)('should succeed for admin users and return normalized images', async () => {
            const existingProduct = {
                id: 1,
                title: 'Old Product',
                brand: 'Test Brand',
                category: 'Куртки',
                size: 'M',
                color: 'Black',
                condition: 8,
                description: 'Test description',
                price: 5000,
                images: ['old1.jpg'],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const updatedProduct = {
                ...existingProduct,
                ...updateData,
                images: updateData.images,
            };
            mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
            mockPrisma.product.update.mockResolvedValue(updatedProduct);
            const response = await (0, supertest_1.default)(app)
                .put('/api/products/1')
                .send(updateData);
            (0, vitest_1.expect)(response.status).toBe(200);
            (0, vitest_1.expect)(response.body.success).toBe(true);
            (0, vitest_1.expect)(response.body.data.images).toEqual(['updated1.jpg', 'updated2.jpg']);
            (0, vitest_1.expect)(mockPrisma.product.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    title: 'Updated Product',
                    price: 6000,
                    images: ['updated1.jpg', 'updated2.jpg'],
                },
            });
        });
        (0, vitest_1.it)('should return 404 when product not found', async () => {
            mockPrisma.product.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .put('/api/products/999')
                .send(updateData);
            (0, vitest_1.expect)(response.status).toBe(404);
            (0, vitest_1.expect)(response.body.success).toBe(false);
            (0, vitest_1.expect)(response.body.error.code).toBe('NOT_FOUND');
        });
    });
});
