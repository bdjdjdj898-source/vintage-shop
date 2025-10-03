# Vintage Shop Frontend

Telegram Mini App для продажи винтажной одежды. React приложение с поддержкой как реального Telegram WebApp SDK, так и режима разработки с mock данными.

## Установка

```bash
npm install
```

## Режимы разработки

### С mock данными (рекомендуется для локальной разработки)

Приложение будет работать в браузере без Telegram, используя mock данные пользователя:

```bash
npm run dev
```

Mock данные автоматически загружаются из `.env.development`:
- `VITE_MOCK_TELEGRAM=true` - включает режим эмуляции Telegram
- Mock пользователь: Dev User (@devuser, ID: 123456789)

### С реальным Telegram (для тестирования в Telegram)

Для тестирования реального Telegram WebApp:

1. Запустите dev сервер с внешним доступом (ngrok, локальная сеть):
   ```bash
   npm run dev -- --host
   ```

2. Настройте URL в BotFather:
   ```
   /setmenubutton
   <your_bot_name>
   <https://your-ngrok-url>
   ```

3. Откройте бота в Telegram и запустите Mini App

## Структура проекта

```
frontend/
├── src/
│   ├── pages/              # Страницы приложения
│   │   ├── Home.tsx        # Главная - каталог товаров
│   │   ├── ProductDetail.tsx  # Детальная страница товара
│   │   ├── Cart.tsx        # Корзина
│   │   ├── Checkout.tsx    # Оформление заказа
│   │   ├── Orders.tsx      # История заказов
│   │   ├── Profile.tsx     # Личный кабинет
│   │   └── Admin*.tsx      # Админ панель
│   │
│   ├── components/         # Переиспользуемые компоненты
│   │   ├── Header.tsx      # Шапка с навигацией
│   │   ├── ProductCard.tsx # Карточка товара
│   │   ├── FilterPanel.tsx # Панель фильтров
│   │   ├── CategoryTabs.tsx # Вкладки категорий
│   │   └── guards/         # Route guards для защиты роутов
│   │
│   ├── contexts/           # React контексты
│   │   ├── AuthContext.tsx # Аутентификация через Telegram
│   │   ├── CartContext.tsx # Управление корзиной
│   │   └── ThemeContext.tsx # Переключение темы
│   │
│   ├── utils/              # Утилиты
│   │   ├── telegram.ts     # Инициализация Telegram WebApp
│   │   └── format.ts       # Форматирование валюты, дат
│   │
│   ├── api/                # API клиент
│   │   └── client.ts       # Fetch wrapper с авторизацией
│   │
│   └── types/              # TypeScript типы
│       └── api.ts          # API типы данных
```

## Переменные окружения

### Development (.env.development)

```env
VITE_API_URL=http://localhost:3000
VITE_DEV_MODE=true
VITE_MOCK_TELEGRAM=true
```

- `VITE_API_URL` - URL backend API
- `VITE_DEV_MODE` - Режим разработки (дополнительные логи)
- `VITE_MOCK_TELEGRAM` - Использовать mock Telegram данные

### Production (.env.production)

```env
VITE_API_URL=https://your-domain.com
VITE_DEV_MODE=false
VITE_MOCK_TELEGRAM=false
```

## Основные функции

### Каталог товаров
- Отображение всех винтажных товаров
- Фильтрация по категориям, брендам, размерам, цвету
- Сортировка по цене, дате добавления, состоянию
- Поиск по названию и описанию

### Корзина и заказы
- Добавление товаров в корзину
- Оформление заказа
- Просмотр истории заказов
- Отслеживание статуса заказа

### Личный кабинет
- Информация о пользователе из Telegram
- Быстрый доступ к заказам и корзине
- Настройка темы оформления

### Темная/Светлая тема
- Автоматическая адаптация под системную тему
- Ручное переключение в настройках
- Плавные переходы между темами

## Решение проблем

### Не отображаются фильтры и категории

Убедитесь что:
1. В `.env.development` установлено `VITE_MOCK_TELEGRAM=true`
2. Backend запущен и доступен по `VITE_API_URL`
3. В базе данных есть товары (запустите seed скрипт на backend)

### Текст наезжает друг на друга

Проблема решена в последней версии:
- Установлен плагин `@tailwindcss/line-clamp`
- Добавлены классы `overflow-hidden` и `break-words`
- Исправлена структура ProductCard

Если проблема осталась:
```bash
npm install @tailwindcss/line-clamp
npm run build
```

### Приложение не работает в браузере

Это нормально для production режима. Для разработки в браузере используйте:
```bash
npm run dev  # автоматически использует mock данные
```

### Ошибка "Telegram WebApp SDK не найден"

В dev режиме эта ошибка игнорируется если `VITE_MOCK_TELEGRAM=true`.

Если работаете с реальным Telegram:
1. Проверьте что открыли через Telegram Mini App, а не в браузере
2. Убедитесь что `telegram-web-app.js` загрузился (проверьте вкладку Network)

## Деплой

### Production build

```bash
npm run build
```

Собранные файлы появятся в `dist/` директории.

### Docker

Приложение готово к запуску в Docker. См. `Dockerfile.frontend` в корне проекта.

```bash
# Из корня проекта
docker-compose build frontend
docker-compose up -d frontend
```

### Настройка Telegram Mini App

1. Создайте бота через @BotFather
2. Настройте Menu Button:
   ```
   /setmenubutton
   <ваш_бот>
   https://your-production-url
   ```
3. Убедитесь что в `.env.production` установлено:
   - `VITE_MOCK_TELEGRAM=false`
   - `VITE_API_URL` указывает на ваш production backend

## Разработка

### Добавление новой страницы

1. Создайте компонент в `src/pages/`
2. Добавьте роут в `src/App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Если требуется авторизация, оберните в `<RequireAuth>`

### Добавление нового API запроса

Используйте `apiFetch` из `src/api/client.ts`:

```tsx
import { apiFetch } from '../api/client';

const response = await apiFetch('/api/endpoint');
if (response.success) {
  console.log(response.data);
}
```

### Стилизация

Используется Tailwind CSS 4 с кастомными цветами в `src/index.css`:

```tsx
<div className="bg-card text-text border-border">
  <h1 className="text-accent">Заголовок</h1>
  <p className="text-text-secondary">Описание</p>
</div>
```

## Технологии

- **React 19** - UI библиотека
- **TypeScript 5.8** - Типизация
- **Vite 7** - Сборщик
- **Tailwind CSS 4** - Стилизация
- **React Router DOM 7** - Роутинг
- **Telegram WebApp SDK** - Интеграция с Telegram

## Лицензия

Проприетарный проект.
