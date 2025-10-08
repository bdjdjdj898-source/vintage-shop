/**
 * Проксирует URL изображения через наш бэкенд
 * Используется для обхода блокировок (например, Unsplash в России)
 */
export function getProxiedImageUrl(imageUrl: string): string {
  // Если это уже проксированный URL или data URI, возвращаем как есть
  if (imageUrl.startsWith('/api/proxy/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Если это внешний URL, проксируем через наш backend
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Base64 encode using browser's btoa
    const encoded = btoa(imageUrl);
    return `/api/proxy/image/${encoded}`;
  }

  // Локальный путь - возвращаем как есть
  return imageUrl;
}
