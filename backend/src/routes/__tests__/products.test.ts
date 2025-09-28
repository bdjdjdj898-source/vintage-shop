import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { prisma } from '../../lib/prisma';
import productsRouter from '../products';

// Mock auth middleware at module level
vi.mock('../../middleware/requireAdmin', () => ({
  requireAdmin: [
    (req: any, res: any, next: any) => {
      // Check if this is a test that should fail RBAC
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
      // Default to admin
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

// Mock dependencies
vi.mock('../../lib/prisma', () => ({
  prisma: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../services/cloudinary', () => ({
  getCloudinarySignature: vi.fn().mockResolvedValue({
    signature: 'test_signature',
    timestamp: 123456789,
    public_id: 'test_public_id',
    api_key: 'test_api_key',
    cloud_name: 'test_cloud',
    folder: 'test_folder',
    resource_type: 'image',
  }),
}));

const mockPrisma = vi.mocked(prisma);

describe('Products Routes RBAC', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/products', productsRouter);
    vi.clearAllMocks();
  });

  describe('POST /api/products', () => {
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

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('test-user-role', 'user')
        .send(validProductData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
      expect(response.body.error.message).toBe('Доступ запрещён. Требуются права администратора.');
    });

    it('should succeed for admin users and return normalized images', async () => {
      const createdProduct = {
        id: 1,
        ...validProductData,
        images: validProductData.images, // Return as array (Json column)
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.create.mockResolvedValue(createdProduct as any);

      const response = await request(app)
        .post('/api/products')
        .send(validProductData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toEqual(['image1.jpg', 'image2.jpg']); // Normalized array
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
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

  describe('PUT /api/products/:id', () => {
    const updateData = {
      title: 'Updated Product',
      price: 6000,
      images: ['updated1.jpg', 'updated2.jpg'],
    };

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/api/products/1')
        .set('test-user-role', 'user')
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
      expect(response.body.error.message).toBe('Доступ запрещён. Требуются права администратора.');
    });

    it('should succeed for admin users and return normalized images', async () => {
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
        images: ['old1.jpg'], // Return as array (Json column)
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateData,
        images: updateData.images, // Return as array (Json column)
      };

      mockPrisma.product.findUnique.mockResolvedValue(existingProduct as any);
      mockPrisma.product.update.mockResolvedValue(updatedProduct as any);

      const response = await request(app)
        .put('/api/products/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toEqual(['updated1.jpg', 'updated2.jpg']); // Normalized array
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'Updated Product',
          price: 6000,
          images: ['updated1.jpg', 'updated2.jpg'],
        },
      });
    });

    it('should return 404 when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/products/999')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});