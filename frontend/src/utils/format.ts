export const formatCurrency = (amount: number, currency = 'RUB', locale = 'ru-RU') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

// Additional formatting utilities
export const formatNumber = (value: number, locale = 'ru-RU') =>
  new Intl.NumberFormat(locale).format(value);

export const formatDate = (date: Date, locale = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

export const formatDateTime = (date: Date, locale = 'ru-RU') =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);