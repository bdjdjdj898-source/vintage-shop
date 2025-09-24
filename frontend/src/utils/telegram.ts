export function initTelegramWebApp() {
  console.log('Initializing Telegram WebApp...');

  // Проверяем что Telegram WebApp SDK загружен
  const tg = (window as any).Telegram?.WebApp;
  console.log('Telegram WebApp object:', tg);

  if (!tg) {
    console.error('Telegram WebApp SDK не найден');
    return null;
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
    return null;
  }

  return {
    initData: tg.initData as string,
    user: tg.initDataUnsafe.user,
    colorScheme: tg.colorScheme
  };
}