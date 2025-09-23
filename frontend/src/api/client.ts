let initData: string | null = null;
export function setTelegramInitData(v: string | null) { initData = v; }
export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (initData) headers.set('x-telegram-init-data', initData);
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}