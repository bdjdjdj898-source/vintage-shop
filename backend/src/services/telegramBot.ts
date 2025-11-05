import { TelegramUser } from '../utils/telegram';

/**
 * Сервис для отправки уведомлений через Bot API
 */
export class TelegramBotService {
  private readonly botApiUrl: string;

  constructor() {
    this.botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';

    if (!process.env.BOT_API_URL) {
      console.warn('BOT_API_URL не задан, используется localhost:3001');
    }
  }

  /**
   * Отправка сообщения админам через Bot API
   */
  async notifyAdmins(message: string): Promise<void> {
    try {
      const response = await fetch(`${this.botApiUrl}/api/notify-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка отправки уведомления через Bot API:', errorData);
      } else {
        const result = await response.json();
        console.log(`✅ Уведомление отправлено ${result.sent}/${result.total} админам`);
      }
    } catch (error) {
      console.error('Ошибка при вызове Bot API:', error);
    }
  }

  /**
   * Форматирование уведомления о новом заказе
   */
  formatOrderNotification(
    orderId: number,
    user: TelegramUser,
    itemsCount: number,
    totalAmount: number
  ): string {
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

// Экспортируем единственный экземпляр сервиса
export const telegramBot = new TelegramBotService();