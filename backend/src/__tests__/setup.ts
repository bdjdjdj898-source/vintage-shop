import { vi } from 'vitest';
import crypto from 'crypto';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.TELEGRAM_BOT_TOKEN = 'test_token';
process.env.TELEGRAM_INITDATA_TTL = '86400';

// Mock console.error to avoid noise in tests
global.console.error = vi.fn();

// Setup global test utilities
global.beforeEach(() => {
  vi.clearAllMocks();
});

// Helper to build realistic initData strings for tests
export function buildTelegramInitData(params: {
  user?: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string };
  auth_date?: number;
  hash?: string;
}) {
  const authDate = params.auth_date || Math.floor(Date.now() / 1000);
  const user = params.user || { id: 123, first_name: 'Test', username: 'testuser' };

  const dataEntries = [
    `auth_date=${authDate}`,
    `user=${JSON.stringify(user)}`
  ];

  // Create a simple hash for testing (not real HMAC)
  const hash = params.hash || crypto.createHash('sha256').update(dataEntries.join('\n')).digest('hex');
  dataEntries.push(`hash=${hash}`);

  return dataEntries.join('&');
}

// Helper to build expired initData
export function buildExpiredTelegramInitData(params: Omit<Parameters<typeof buildTelegramInitData>[0], 'auth_date'>) {
  const expiredAuthDate = Math.floor(Date.now() / 1000) - 90000; // 25 hours ago (expired)
  return buildTelegramInitData({ ...params, auth_date: expiredAuthDate });
}