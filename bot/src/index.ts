import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.BOT_PORT || 3001;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://t.me/myvintageshop_bot/shop';
const ADMIN_TELEGRAM_IDS = (process.env.ADMIN_TELEGRAM_IDS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан!');
  process.exit(1);
}

console.log('🤖 Инициализация Telegram бота...');
console.log(`📱 Админы: ${ADMIN_TELEGRAM_IDS.join(', ')}`);
console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);

// Инициализация бота с auto-polling
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10
    }
  }
});

// Обработчик ошибок polling
bot.on('polling_error', (error) => {
  console.error('❌ Telegram Bot polling error:', error);
});

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  console.log('✅ Получена команда /start от:', msg.from?.username || msg.from?.first_name);
  const chatId = msg.chat.id;
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
            web_app: { url: WEBAPP_URL }
          }
        ]
      ]
    }
  };

  try {
    await bot.sendMessage(chatId, welcomeMessage, options);
    console.log('✅ Приветственное сообщение отправлено успешно');
  } catch (err) {
    console.error('❌ Ошибка отправки сообщения:', err);
  }
});

// API endpoint для отправки уведомлений админам
app.post('/api/notify-admin', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📨 Получен запрос на отправку уведомления админам');

    if (ADMIN_TELEGRAM_IDS.length === 0) {
      console.warn('⚠️ ADMIN_TELEGRAM_IDS не заданы');
      return res.status(200).json({
        success: true,
        message: 'No admins configured',
        sent: 0
      });
    }

    // Отправляем сообщение всем админам
    const promises = ADMIN_TELEGRAM_IDS.map(async (adminId) => {
      try {
        await bot.sendMessage(adminId, message, { parse_mode: 'HTML' });
        console.log(`✅ Уведомление отправлено админу ${adminId}`);
        return { success: true, adminId };
      } catch (error) {
        console.error(`❌ Ошибка отправки админу ${adminId}:`, error);
        return { success: false, adminId, error };
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    res.json({
      success: true,
      sent: successful,
      total: ADMIN_TELEGRAM_IDS.length
    });

  } catch (error) {
    console.error('❌ Ошибка обработки запроса:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    bot: 'running',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Telegram Bot запущен с auto-polling');

app.listen(PORT, () => {
  console.log(`🚀 Bot API server запущен на порту ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📮 Notify endpoint: http://localhost:${PORT}/api/notify-admin`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM получен, завершение работы...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT получен, завершение работы...');
  bot.stopPolling();
  process.exit(0);
});
