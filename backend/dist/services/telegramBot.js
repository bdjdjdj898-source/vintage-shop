"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramBot = exports.TelegramBotService = void 0;
class TelegramBotService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
        this.adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        if (!this.botToken) {
            console.warn('TELEGRAM_BOT_TOKEN не задан, уведомления отключены');
        }
        if (this.adminIds.length === 0) {
            console.warn('ADMIN_TELEGRAM_IDS не заданы, уведомления админам недоступны');
        }
    }
    async notifyAdmins(message) {
        if (!this.botToken || this.adminIds.length === 0) {
            console.log('Уведомления админам отключены');
            return;
        }
        const promises = this.adminIds.map(adminId => this.sendMessage(adminId, message));
        try {
            await Promise.allSettled(promises);
        }
        catch (error) {
            console.error('Ошибка при отправке уведомлений админам:', error);
        }
    }
    async sendMessage(chatId, message) {
        if (!this.botToken) {
            return;
        }
        const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Ошибка отправки сообщения в Telegram (${chatId}):`, errorData);
            }
        }
        catch (error) {
            console.error(`Ошибка отправки сообщения в Telegram (${chatId}):`, error);
        }
    }
    formatOrderNotification(orderId, user, itemsCount, totalAmount) {
        const userName = user.username
            ? `@${user.username}`
            : `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`;
        return `
🛍 <b>Новый заказ #${orderId}</b>

👤 <b>Покупатель:</b> ${userName}
📱 <b>Telegram ID:</b> ${user.id}
📦 <b>Товаров:</b> ${itemsCount} шт.
💰 <b>Сумма:</b> ${totalAmount.toLocaleString('ru-RU')} ₽

🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `.trim();
    }
}
exports.TelegramBotService = TelegramBotService;
exports.telegramBot = new TelegramBotService();
