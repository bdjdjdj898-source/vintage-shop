import TelegramBot from 'node-telegram-bot-api';
import { TelegramUser } from '../utils/telegram';

/**
 * Сервис для отправки уведомлений через Telegram Bot
 */
export class TelegramBotService {
  private readonly botToken: string;
  private readonly adminIds: string[];
  private bot: TelegramBot | null = null;
  private readonly webAppUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.adminIds = (process.env.ADMIN_TELEGRAM_IDS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    this.webAppUrl = process.env.WEBAPP_URL || 'https://t.me/myvintageshop_bot/shop';

    if (!this.botToken) {
      console.warn('TELEGRAM_BOT_TOKEN не задан, уведомления отключены');
    }

    if (this.adminIds.length === 0) {
      console.warn('ADMIN_TELEGRAM_IDS не заданы, уведомления админам недоступны');
    }

    // Инициализируем бота для обработки команд
    if (this.botToken) {
      this.initializeBot();
    }
  }

  /**
   * Инициализация бота с ручным polling
   */
  private initializeBot(): void {
    try {
      // Инициализируем бота БЕЗ auto-polling
      this.bot = new TelegramBot(this.botToken, { polling: false });

      // Запускаем ручной polling
      this.startManualPolling();

      console.log('Telegram Bot инициализирован с ручным polling');
    } catch (error) {
      console.error('Ошибка инициализации Telegram Bot:', error);
    }
  }

  /**
   * Ручной polling через getUpdates
   */
  private async startManualPolling(): Promise<void> {
    let offset = 0;

    const poll = async () => {
      try {
        const url = `https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${offset}&timeout=30`;
        const response = await fetch(url);
        const data: any = await response.json();

        if (data.ok && data.result && data.result.length > 0) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            await this.processUpdate(update);
          }
        }
      } catch (error) {
        console.error('Ошибка polling:', error);
      }

      // Продолжаем polling
      setTimeout(poll, 1000);
    };

    poll();
  }

  /**
   * Обработка входящего update от Telegram
   */
  private async processUpdate(update: any): Promise<void> {
    try {
      // Обработка текстовых сообщений
      if (update.message && update.message.text) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const text = msg.text;

        console.log('Получено сообщение:', text, 'от:', msg.from?.username || msg.from?.first_name);

        // Обработка команды /start
        if (text === '/start') {
          const firstName = msg.from?.first_name || 'друг';

          const welcomeMessage = `
Привет, ${firstName}! 👋

Добро пожаловать в наш винтажный магазин! 🛍️

Здесь вы найдете уникальные винтажные вещи:
• Куртки и толстовки
• Джинсы и брюки
• Свитеры
• Аксессуары
• Обувь

Все товары тщательно отобраны и находятся в отличном состоянии!

Нажмите кнопку ниже, чтобы открыть магазин 👇
          `.trim();

          const options = {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🛍️ Открыть магазин',
                    web_app: { url: this.webAppUrl }
                  }
                ]
              ]
            }
          };

          await this.bot?.sendMessage(chatId, welcomeMessage, options);
          console.log('Приветственное сообщение отправлено успешно');
        }
      }
    } catch (error) {
      console.error('Ошибка обработки update:', error);
    }
  }

  /**
   * Отправка сообщения всем админам
   */
  async notifyAdmins(message: string): Promise<void> {
    if (!this.botToken || this.adminIds.length === 0) {
      console.log('Уведомления админам отключены');
      return;
    }

    const promises = this.adminIds.map(adminId =>
      this.sendMessage(adminId, message)
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Ошибка при отправке уведомлений админам:', error);
    }
  }

  /**
   * Отправка сообщения конкретному пользователю
   */
  async sendMessage(chatId: string, message: string): Promise<void> {
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
    } catch (error) {
      console.error(`Ошибка отправки сообщения в Telegram (${chatId}):`, error);
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