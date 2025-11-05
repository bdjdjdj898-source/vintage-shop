import express from 'express';
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

const BOT_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Функция отправки сообщения
async function sendMessage(chatId: number | string, text: string, options?: any) {
  const response = await fetch(`${BOT_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || undefined,
      reply_markup: options?.reply_markup || undefined
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Telegram API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// Обработчик /start команды
async function handleStartCommand(chatId: number, firstName: string) {
  console.log(`✅ Получена команда /start от пользователя ${chatId}`);

  const welcomeMessage = `
Рады видеть Вас в нашем винтажном магазине! 🛍️

Нажмите кнопку ниже, чтобы перейти в каталог 👇
  `.trim();

  try {
    await sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🛍️ Открыть магазин',
              url: 'https://egorloh.duckdns.org'
            }
          ]
        ]
      }
    });
    console.log('✅ Приветственное сообщение отправлено успешно');
  } catch (err) {
    console.error('❌ Ошибка отправки сообщения:', err);
  }
}

// Webhook endpoint для получения обновлений от Telegram
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    console.log('📩 Получено обновление от Telegram:', JSON.stringify(update));

    // Обработка команды /start
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from.first_name || 'друг';
      await handleStartCommand(chatId, firstName);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.sendStatus(500);
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
        await sendMessage(adminId, message, { parse_mode: 'HTML' });
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

// Функция установки webhook
async function setupWebhook() {
  const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || '';

  if (!WEBHOOK_DOMAIN) {
    console.error('❌ WEBHOOK_DOMAIN не задан!');
    return;
  }

  const webhookUrl = `${WEBHOOK_DOMAIN}/webhook`;

  try {
    console.log(`🔗 Устанавливаем webhook: ${webhookUrl}`);

    const response = await fetch(`${BOT_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    });

    const result: any = await response.json();

    if (result.ok) {
      console.log('✅ Webhook успешно установлен!');
    } else {
      console.error('❌ Ошибка установки webhook:', result);
    }
  } catch (error) {
    console.error('❌ Не удалось установить webhook:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Bot API server запущен на порту ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📮 Notify endpoint: http://localhost:${PORT}/api/notify-admin`);
  console.log(`🪝 Webhook endpoint: http://localhost:${PORT}/webhook`);

  // Устанавливаем webhook после запуска сервера
  await setupWebhook();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM получен, завершение работы...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT получен, завершение работы...');
  process.exit(0);
});
