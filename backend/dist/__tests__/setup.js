"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTelegramInitData = buildTelegramInitData;
exports.buildExpiredTelegramInitData = buildExpiredTelegramInitData;
const vitest_1 = require("vitest");
const crypto_1 = __importDefault(require("crypto"));
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.TELEGRAM_BOT_TOKEN = 'test_token';
process.env.TELEGRAM_INITDATA_TTL = '86400';
global.console.error = vitest_1.vi.fn();
global.beforeEach(() => {
    vitest_1.vi.clearAllMocks();
});
function buildTelegramInitData(params) {
    const authDate = params.auth_date || Math.floor(Date.now() / 1000);
    const user = params.user || { id: 123, first_name: 'Test', username: 'testuser' };
    const dataEntries = [
        `auth_date=${authDate}`,
        `user=${JSON.stringify(user)}`
    ];
    const hash = params.hash || crypto_1.default.createHash('sha256').update(dataEntries.join('\n')).digest('hex');
    dataEntries.push(`hash=${hash}`);
    return dataEntries.join('&');
}
function buildExpiredTelegramInitData(params) {
    const expiredAuthDate = Math.floor(Date.now() / 1000) - 90000;
    return buildTelegramInitData({ ...params, auth_date: expiredAuthDate });
}
