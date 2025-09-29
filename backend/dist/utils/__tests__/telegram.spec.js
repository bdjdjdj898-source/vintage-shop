"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crypto_1 = __importDefault(require("crypto"));
const telegram_1 = require("../telegram");
(0, vitest_1.describe)('telegram utils', () => {
    const mockBotToken = 'test-bot-token';
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('validateTelegramInitData', () => {
        (0, vitest_1.it)('should return false for invalid initData without hash', () => {
            const result = (0, telegram_1.validateTelegramInitData)('user=test&auth_date=123', mockBotToken);
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should return false for empty initData', () => {
            const result = (0, telegram_1.validateTelegramInitData)('', mockBotToken);
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should return true for valid initData with correct hash', () => {
            const testData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890';
            const urlParams = new URLSearchParams(testData);
            const dataCheckString = [...urlParams.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            const secretKey = crypto_1.default
                .createHmac('sha256', 'WebAppData')
                .update(mockBotToken)
                .digest();
            const hash = crypto_1.default
                .createHmac('sha256', secretKey)
                .update(dataCheckString)
                .digest('hex');
            const validInitData = `${testData}&hash=${hash}`;
            const result = (0, telegram_1.validateTelegramInitData)(validInitData, mockBotToken);
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should return false for invalid hash', () => {
            const invalidInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1234567890&hash=invalid';
            const result = (0, telegram_1.validateTelegramInitData)(invalidInitData, mockBotToken);
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('parseTelegramInitData', () => {
        (0, vitest_1.it)('should return null for initData without user parameter', () => {
            const result = (0, telegram_1.parseTelegramInitData)('auth_date=123&hash=abc');
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should return null for invalid JSON in user parameter', () => {
            const result = (0, telegram_1.parseTelegramInitData)('user=invalid-json&auth_date=123');
            (0, vitest_1.expect)(result).toBeNull();
        });
        (0, vitest_1.it)('should return user object for valid user data', () => {
            const userData = { id: 123456789, first_name: 'Test', last_name: 'User', username: 'testuser' };
            const encodedUser = encodeURIComponent(JSON.stringify(userData));
            const initData = `user=${encodedUser}&auth_date=123`;
            const result = (0, telegram_1.parseTelegramInitData)(initData);
            (0, vitest_1.expect)(result).toEqual(userData);
        });
        (0, vitest_1.it)('should return null for user without required fields', () => {
            const userData = { last_name: 'User' };
            const encodedUser = encodeURIComponent(JSON.stringify(userData));
            const initData = `user=${encodedUser}&auth_date=123`;
            const result = (0, telegram_1.parseTelegramInitData)(initData);
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
    (0, vitest_1.describe)('isAdminTelegramId', () => {
        const originalEnv = process.env;
        (0, vitest_1.beforeEach)(() => {
            process.env = { ...originalEnv };
        });
        afterEach(() => {
            process.env = originalEnv;
        });
        (0, vitest_1.it)('should return false when no admin IDs are configured', () => {
            process.env.ADMIN_TELEGRAM_IDS = '';
            const result = (0, telegram_1.isAdminTelegramId)('123456789');
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should return true for configured admin ID', () => {
            process.env.ADMIN_TELEGRAM_IDS = '123456789,987654321';
            const result = (0, telegram_1.isAdminTelegramId)('123456789');
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should return false for non-admin ID', () => {
            process.env.ADMIN_TELEGRAM_IDS = '123456789,987654321';
            const result = (0, telegram_1.isAdminTelegramId)('111111111');
            (0, vitest_1.expect)(result).toBe(false);
        });
    });
    (0, vitest_1.describe)('getUserDisplayName', () => {
        (0, vitest_1.it)('should return username when available', () => {
            const user = { id: 123, first_name: 'Test', username: 'testuser' };
            const result = (0, telegram_1.getUserDisplayName)(user);
            (0, vitest_1.expect)(result).toBe('@testuser');
        });
        (0, vitest_1.it)('should return full name when username is not available', () => {
            const user = { id: 123, first_name: 'Test', last_name: 'User' };
            const result = (0, telegram_1.getUserDisplayName)(user);
            (0, vitest_1.expect)(result).toBe('Test User');
        });
        (0, vitest_1.it)('should return first name only when last name is not available', () => {
            const user = { id: 123, first_name: 'Test' };
            const result = (0, telegram_1.getUserDisplayName)(user);
            (0, vitest_1.expect)(result).toBe('Test');
        });
    });
});
