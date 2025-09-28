import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '../../lib/prisma';
import ordersRouter from '../orders';

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    cart: {
      findUnique: vi.fn(),
    },
    cartItem: {
      deleteMany: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('../../services/telegramBot', () => ({
  telegramBot: {
    formatOrderNotification: vi.fn().mockReturnValue('Notification message'),
    notifyAdmins: vi.fn(),
  },
}));

const mockPrisma = vi.mocked(prisma);

// Mock auth middleware - inject before router to bypass internal requireAuth
const mockAuthMiddleware = (req: any, res: any, next: any) => {
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
};

const mockAdminMiddleware = (req: any, res: any, next: any) => {
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
};

describe('Orders Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    vi.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return user orders with pagination', async () => {
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
                images: '["test.jpg"]',
                isActive: true,
              },
            },
          ],
        },
      ];

      // Inject auth middleware before mounting router
      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.order.findMany.mockResolvedValue(mockOrders as any);
      mockPrisma.order.count.mockResolvedValue(1);

      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].items[0].product.images).toEqual(['test.jpg']);
    });

    it('should filter orders by status when provided', async () => {
      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await request(app).get('/api/orders?status=completed');

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
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

  describe('POST /api/orders', () => {
    const validShippingInfo = {
      name: 'Test User',
      phone: '+79123456789',
      address: 'Test Address, City, 123456',
      email: 'test@example.com',
    };

    it('should create order successfully when cart has items', async () => {
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

      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      // Mock transaction
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.cart.findUnique.mockResolvedValue(mockCart as any);
      mockPrisma.order.create.mockResolvedValue(mockOrder as any);
      mockPrisma.orderItem.create.mockResolvedValue({} as any);
      mockPrisma.product.update.mockResolvedValue({} as any);
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder as any);

      const response = await request(app)
        .post('/api/orders')
        .send({ shippingInfo: validShippingInfo });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return error when cart is empty', async () => {
      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.cart.findUnique.mockResolvedValue({ items: [] } as any);

      const response = await request(app)
        .post('/api/orders')
        .send({ shippingInfo: validShippingInfo });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CART_EMPTY');
    });

    it('should return error when products are unavailable', async () => {
      const mockCart = {
        id: 1,
        userId: 1,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 1,
            product: { id: 1, price: 5000, isActive: false }, // Inactive product
          },
        ],
      };

      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });

      mockPrisma.cart.findUnique.mockResolvedValue(mockCart as any);

      const response = await request(app)
        .post('/api/orders')
        .send({ shippingInfo: validShippingInfo });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_UNAVAILABLE');
    });

    it('should validate shipping info', async () => {
      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      const invalidShippingInfo = {
        name: 'T', // Too short
        phone: 'invalid',
        address: 'short',
      };

      const response = await request(app)
        .post('/api/orders')
        .send({ shippingInfo: invalidShippingInfo });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return specific order for user', async () => {
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

      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.order.findFirst.mockResolvedValue(mockOrder as any);

      const response = await request(app).get('/api/orders/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
    });

    it('should return 404 when order not found', async () => {
      app.use('/api/orders', mockAuthMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.order.findFirst.mockResolvedValue(null);

      const response = await request(app).get('/api/orders/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status for admin', async () => {
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

      app.use('/api/orders', mockAdminMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.order.findUnique.mockResolvedValue({ id: 1 } as any);
      mockPrisma.order.update.mockResolvedValue(mockOrder as any);

      const response = await request(app)
        .put('/api/orders/1/status')
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should return 404 when order does not exist', async () => {
      app.use('/api/orders', mockAdminMiddleware);
      app.use('/api/orders', ordersRouter);

      mockPrisma.order.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/orders/999/status')
        .send({ status: 'confirmed' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate status values', async () => {
      app.use('/api/orders', mockAdminMiddleware);
      app.use('/api/orders', ordersRouter);

      const response = await request(app)
        .put('/api/orders/1/status')
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});