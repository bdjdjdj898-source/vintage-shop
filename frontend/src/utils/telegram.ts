export function initTelegramWebApp() {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return null;
  tg.ready();
  tg.expand();
  return { initData: tg.initData as string, user: tg.initDataUnsafe?.user ?? null, colorScheme: tg.colorScheme };
}