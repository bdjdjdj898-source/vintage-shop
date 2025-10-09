export function initTelegramWebApp() {
  console.log('🔄 Initializing Telegram WebApp...');
  console.log('🌍 Environment:', import.meta.env.MODE);
  console.log('🔧 VITE_MOCK_TELEGRAM:', import.meta.env.VITE_MOCK_TELEGRAM);
  console.log('🔧 VITE_DEV_MODE:', import.meta.env.VITE_DEV_MODE);

  // Если включен mock режим, возвращаем mock данные
  if (import.meta.env.VITE_MOCK_TELEGRAM === 'true') {
    console.log('🎭 Using MOCK Telegram data for development');

    const mockData = {
      initData: 'mock_init_data_for_development',
      user: {
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'devuser',
        language_code: 'ru',
        is_premium: false
      },
      colorScheme: 'light' as 'light' | 'dark'
    };

    console.log('🎭 Mock user:', mockData.user);
    console.log('🎭 Mock colorScheme:', mockData.colorScheme);

    return mockData;
  }

  // Проверяем что Telegram WebApp SDK загружен
  const tg = (window as any).Telegram?.WebApp;
  console.log('📱 Telegram WebApp object:', tg);
  console.log('🌍 window.Telegram:', (window as any).Telegram);
  console.log('📄 document.readyState:', document.readyState);

  // Проверяем все возможные варианты Telegram объектов
  console.log('🔍 window.TelegramWebviewProxy:', (window as any).TelegramWebviewProxy);
  console.log('🔍 window.external:', (window as any).external);

  if (!tg) {
    console.log('⚠️ Telegram WebApp SDK не найден - возможно открыто в браузере');

    // Проверяем загружен ли скрипт
    const scripts = Array.from(document.scripts);
    const telegramScript = scripts.find(script => script.src.includes('telegram-web-app.js'));
    console.log('📜 Telegram script найден:', !!telegramScript);
    console.log('🌐 User Agent:', navigator.userAgent);

    // Возвращаем null вместо выброса ошибки - пусть работает как обычный сайт
    return null;
  }

  // Инициализируем WebApp
  tg.ready();
  tg.expand();

  console.log('✅ Telegram WebApp initialized');
  console.log('📋 initData:', tg.initData);
  console.log('📋 initDataUnsafe:', tg.initDataUnsafe);
  console.log('👤 user:', tg.initDataUnsafe?.user);
  console.log('🎨 colorScheme:', tg.colorScheme);
  console.log('📱 platform:', tg.platform);
  console.log('🔢 version:', tg.version);

  // Проверяем что есть данные пользователя
  if (!tg.initData || !tg.initDataUnsafe?.user) {
    console.error('❌ Telegram WebApp: нет данных пользователя');
    console.error('initData length:', tg.initData?.length || 0);
    console.error('initDataUnsafe:', JSON.stringify(tg.initDataUnsafe));

    // Возвращаем null - пусть работает без авторизации
    return null;
  }

  return {
    initData: tg.initData as string,
    user: tg.initDataUnsafe.user,
    colorScheme: tg.colorScheme
  };
}
