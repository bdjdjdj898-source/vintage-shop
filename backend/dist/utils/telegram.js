"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTelegramInitData = validateTelegramInitData;
exports.parseTelegramInitData = parseTelegramInitData;
exports.isAdminTelegramId = isAdminTelegramId;
exports.getUserDisplayName = getUserDisplayName;
const crypto_1 = __importDefault(require("crypto"));
function validateTelegramInitData(initData, botToken) {
    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        if (!hash) {
            return false;
        }
        urlParams.delete('hash');
        const dataCheckString = [...urlParams.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        const secretKey = crypto_1.default
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();
        const calculatedHash = crypto_1.default
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        return calculatedHash === hash;
    }
    catch (error) {
        console.error('Ошибка валидации Telegram initData:', error);
        return false;
    }
}
function parseTelegramInitData(initData) {
    try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        if (!userParam) {
            return null;
        }
        const user = JSON.parse(decodeURIComponent(userParam));
        if (!user.id || !user.first_name) {
            return null;
        }
        return user;
    }
    catch (error) {
        console.error('Ошибка парсинга Telegram user data:', error);
        return null;
    }
}
function isAdminTelegramId(telegramId) {
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (adminIds.length === 0) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('WARNING: No admin Telegram IDs configured in production');
        }
        return false;
    }
    return adminIds.includes(telegramId);
}
function getUserDisplayName(user) {
    if (user.username) {
        return `@${user.username}`;
    }
    return [user.first_name, user.last_name].filter(Boolean).join(' ');
}
