import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';
import { validateTelegramInitData, parseTelegramInitData, isAdminTelegramId, getUserDisplayName } from '../telegram';

describe('telegram utils', () => {
  const mockBotToken = 'test-bot-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateTelegramInitData', () => {
    it('should return false for invalid initData without hash', () => {
      const result = validateTelegramInitData('user=test&auth_date=123', mockBotToken);
      expect(result).toBe(false);
    });

    it('should return false for empty initData', () => {
      const result = validateTelegramInitData('', mockBotToken);
      expect(result).toBe(false);
    });

    it('should return true for valid initData with correct hash', () => {
      // Create a valid hash for test data
      const testData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890';
      const urlParams = new URLSearchParams(testData);

      const dataCheckString = [...urlParams.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(mockBotToken)
        .digest();

      const hash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      const validInitData = `${testData}&hash=${hash}`;

      const result = validateTelegramInitData(validInitData, mockBotToken);
      expect(result).toBe(true);
    });

    it('should return false for invalid hash', () => {
      const invalidInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=invalid';
      const result = validateTelegramInitData(invalidInitData, mockBotToken);
      expect(result).toBe(false);
    });
  });

  describe('parseTelegramInitData', () => {
    it('should return null for initData without user parameter', () => {
      const result = parseTelegramInitData('auth_date=123&hash=abc');
      expect(result).toBeNull();
    });

    it('should return null for invalid JSON in user parameter', () => {
      const result = parseTelegramInitData('user=invalid-json&auth_date=123');
      expect(result).toBeNull();
    });

    it('should return user object for valid user data', () => {
      const userData = { id: 123456789, first_name: 'Test', last_name: 'User', username: 'testuser' };
      const encodedUser = encodeURIComponent(JSON.stringify(userData));
      const initData = `user=${encodedUser}&auth_date=123`;

      const result = parseTelegramInitData(initData);
      expect(result).toEqual(userData);
    });

    it('should return null for user without required fields', () => {
      const userData = { last_name: 'User' }; // missing id and first_name
      const encodedUser = encodeURIComponent(JSON.stringify(userData));
      const initData = `user=${encodedUser}&auth_date=123`;

      const result = parseTelegramInitData(initData);
      expect(result).toBeNull();
    });
  });

  describe('isAdminTelegramId', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return false when no admin IDs are configured', () => {
      process.env.ADMIN_TELEGRAM_IDS = '';
      const result = isAdminTelegramId('123456789');
      expect(result).toBe(false);
    });

    it('should return true for configured admin ID', () => {
      process.env.ADMIN_TELEGRAM_IDS = '123456789,987654321';
      const result = isAdminTelegramId('123456789');
      expect(result).toBe(true);
    });

    it('should return false for non-admin ID', () => {
      process.env.ADMIN_TELEGRAM_IDS = '123456789,987654321';
      const result = isAdminTelegramId('111111111');
      expect(result).toBe(false);
    });
  });

  describe('getUserDisplayName', () => {
    it('should return username when available', () => {
      const user = { id: 123, first_name: 'Test', username: 'testuser' };
      const result = getUserDisplayName(user);
      expect(result).toBe('@testuser');
    });

    it('should return full name when username is not available', () => {
      const user = { id: 123, first_name: 'Test', last_name: 'User' };
      const result = getUserDisplayName(user);
      expect(result).toBe('Test User');
    });

    it('should return first name only when last name is not available', () => {
      const user = { id: 123, first_name: 'Test' };
      const result = getUserDisplayName(user);
      expect(result).toBe('Test');
    });
  });
});