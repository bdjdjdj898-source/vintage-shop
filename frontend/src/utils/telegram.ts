export function initTelegramWebApp() {
  console.log('🔄 Initializing Telegram WebApp...');

  // Проверяем что Telegram WebApp SDK загружен
  const tg = (window as any).Telegram?.WebApp;
  console.log('📱 Telegram WebApp object:', tg);
  console.log('🌍 window.Telegram:', (window as any).Telegram);
  console.log('📄 document.readyState:', document.readyState);

  // Проверяем все возможные варианты Telegram объектов
  console.log('🔍 window.TelegramWebviewProxy:', (window as any).TelegramWebviewProxy);
  console.log('🔍 window.external:', (window as any).external);

  if (!tg) {
    console.error('❌ Telegram WebApp SDK не найден');

    // Проверяем загружен ли скрипт
    const scripts = Array.from(document.scripts);
    const telegramScript = scripts.find(script => script.src.includes('telegram-web-app.js'));
    console.log('📜 Telegram script найден:', !!telegramScript);
    console.log('📜 Все скрипты:', scripts.map(s => s.src));

    // ВРЕМЕННЫЙ FALLBACK для тестирования
    console.log('🧪 Используем тестовый режим');
    return {
      initData: 'test_init_data=test_user',
      user: {
        id: 12345,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser'
      },
      colorScheme: 'light'
    };
  }

  // Инициализируем WebApp
  tg.ready();
  tg.expand();

  console.log('Telegram WebApp initialized');
  console.log('initData:', tg.initData);
  console.log('initDataUnsafe:', tg.initDataUnsafe);
  console.log('user:', tg.initDataUnsafe?.user);

  // Проверяем что есть данные пользователя
  if (!tg.initData || !tg.initDataUnsafe?.user) {
    console.error('Telegram WebApp: нет данных пользователя');

    // ВРЕМЕННЫЙ FALLBACK
    console.log('Используем тестовые данные пользователя');
    return {
      initData: tg.initData || 'fallback_init_data',
      user: {
        id: 67890,
        first_name: 'Fallback',
        last_name: 'User',
        username: 'fallbackuser'
      },
      colorScheme: tg.colorScheme || 'light'
    };
  }

  return {
    initData: tg.initData as string,
    user: tg.initDataUnsafe.user,
    colorScheme: tg.colorScheme
  };
}