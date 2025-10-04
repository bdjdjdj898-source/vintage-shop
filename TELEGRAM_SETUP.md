# Vintage Shop - Telegram Mini App для продажи винтажной одежды

## Обзор проекта
Это полноценное веб-приложение для продажи винтажной одежды, работающее как Telegram Mini App. Монорепозиторий с отдельными frontend и backend частями.

## Технологический стек

### Frontend
- **Framework**: React 19 с TypeScript 5.8
- **Build Tool**: Vite 7.1.9
- **Styling**: Tailwind CSS 4 + CSS Variables для системы тем
- **Routing**: React Router DOM v6
- **State Management**: React Context API (ThemeContext, AuthContext, CartContext)
- **Integration**: Telegram WebApp SDK (@telegram-web-app/sdk)
- **Package Manager**: npm с workspaces

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: SQLite с Prisma ORM 5
- **Authentication**: Telegram WebApp initData validation
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (для статики и SSL)
- **Deployment**: Git-based deployment на VPS
- **SSL**: Let's Encrypt (egorloh.duckdns.org)

## Архитектура проекта

```
my-vintage-shop/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/      # Переиспользуемые компоненты
│   │   │   ├── Header.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CategoryTabs.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── MobileFilterDrawer.tsx
│   │   ├── pages/           # Страницы приложения
│   │   │   ├── Home.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Admin*.tsx
│   │   ├── contexts/        # React Context для глобального состояния
│   │   │   ├── ThemeContext.tsx    # Темная/светлая тема
│   │   │   ├── AuthContext.tsx     # Telegram аутентификация
│   │   │   └── CartContext.tsx     # Корзина покупок
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useSwipe.ts
│   │   ├── api/             # API клиент
│   │   │   └── client.ts
│   │   ├── utils/           # Утилиты
│   │   │   ├── format.ts
│   │   │   └── telegram.ts
│   │   ├── types/           # TypeScript типы
│   │   │   └── api.ts
│   │   ├── index.css        # CSS переменные + Tailwind
│   │   ├── App.tsx          # Главный компонент с роутингом
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── server.ts        # Express сервер setup
│   │   ├── lib/
│   │   │   └── prisma.ts    # Prisma client
│   │   ├── middleware/
│   │   │   ├── telegramAuth.ts     # Валидация Telegram initData
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   └── utils/
│   │       └── logger.ts    # Winston logger
│   ├── package.json
│   └── tsconfig.json
│
├── prisma/                   # Database schema
│   ├── schema.prisma        # Prisma schema
│   ├── migrations/          # Database migrations
│   └── dev.db              # SQLite database file
│
├── nginx.conf               # Nginx конфигурация
├── docker-compose.yml       # Docker orchestration
├── Dockerfile              # Frontend container
├── Dockerfile.backend      # Backend container
├── package.json            # Root workspace config
└── CLAUDE.md              # Инструкции для AI

```

## База данных (Prisma Schema)

### Основные модели:

**User** - пользователи Telegram
- id, telegramId, username, firstName, lastName
- role (USER | ADMIN)
- timestamps

**Product** - товары
- id, title, description, price
- images[] (массив URL)
- brand, category, size, color, condition
- isAvailable, timestamps

**Cart** - корзины пользователей
- id, userId, items[]
- timestamps

**CartItem** - элементы корзины
- id, cartId, productId, quantity

**Order** - заказы
- id, userId, items[], totalAmount
- status (PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED)
- timestamps

**OrderItem** - элементы заказа
- id, orderId, productId, quantity, price

## Ключевые особенности

### Frontend
1. **Система тем**: CSS Variables + Tailwind для светлой/темной темы
   - Автоматическое определение темы из Telegram
   - Плавные переходы между темами

2. **Компоненты**:
   - ProductCard: карточка товара с hover-эффектами, анимациями
   - ProductDetail: полноэкранный слайдер изображений с свайпами
   - CategoryTabs: horizontal scroll табы категорий
   - FilterPanel: фильтры с focus-состояниями
   - Header: sticky header с счетчиком корзины

3. **Mobile-first**: оптимизация под Telegram на мобильных
   - Touch gestures (swipe для слайдера)
   - Fixed bottom buttons
   - Responsive grid (2 cols mobile, 3-4 desktop)

### Backend
1. **Authentication**:
   - Telegram WebApp initData validation через crypto.createHmac
   - Роли: USER и ADMIN
   - Middleware для защиты эндпоинтов

2. **API Endpoints**:
   ```
   GET  /api/me              - текущий пользователь
   GET  /api/products        - список товаров (с фильтрами)
   GET  /api/products/:id    - детали товара
   POST /api/cart/add        - добавить в корзину
   GET  /api/cart            - получить корзину
   POST /api/orders          - создать заказ
   GET  /api/orders          - список заказов

   Admin:
   POST /api/admin/products  - создать товар
   PUT  /api/admin/products/:id - обновить товар
   DELETE /api/admin/products/:id - удалить товар
   ```

3. **Безопасность**:
   - Helmet для HTTP headers
   - CORS настроен для фронтенда
   - Rate limiting (100 req/15min)
   - Input validation

## Deployment

### Production Setup:
1. **Frontend**: Docker контейнер с Nginx (порт 3003)
   - Сервит статику из `/usr/share/nginx/html`
   - Кэширование: no-cache для JS/CSS, 1 год для изображений

2. **Backend**: Docker контейнер с Node.js (порт 3002)
   - SQLite DB в volume для персистентности

3. **Reverse Proxy**: Главный Nginx на хосте
   - HTTPS через Let's Encrypt (egorloh.duckdns.org)
   - Проксирует все запросы на frontend:3003
   - Frontend проксирует /api/* на backend:3002

### Deployment Process:
```bash
# На локальной машине
git add .
git commit -m "message"
git push origin main

# На сервере (автоматизировано)
cd /var/www/my-vintage-shop
git pull origin main
docker-compose build frontend backend
docker-compose up -d
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="file:../prisma/dev.db"
TELEGRAM_BOT_TOKEN="your_bot_token"
NODE_ENV="production"
```

### Frontend (.env.production)
```bash
VITE_DEV_MODE=false
VITE_MOCK_TELEGRAM=false
```

## Команды разработки

```bash
# Установка зависимостей
npm install

# Разработка
npm run dev                # оба сервиса
npm run dev:frontend       # только frontend
npm run dev:backend        # только backend

# Билд
npm run build
npm run build:frontend
npm run build:backend

# База данных
npm run db:generate        # Prisma client generate
npm run db:migrate         # Run migrations
npm run db:reset          # Reset DB

# Линтинг
npm run lint

# Docker
npm run docker:build
npm run docker:up
npm run docker:down
```

## Текущее состояние UI

**Завершено**:
- ✅ Главная страница с фильтрами и категориями
- ✅ ProductCard с современным дизайном
- ✅ Header с навигацией и счетчиком корзины
- ✅ CategoryTabs с horizontal scroll
- ✅ FilterPanel с упрощенными фильтрами
- ✅ ProductDetail с слайдером изображений
- ✅ Система тем (светлая/темная)
- ✅ Мобильная оптимизация

**В процессе улучшений**:
- Страницы Cart, Orders, Profile (нужен рефакторинг)
- Admin панель (нужен рефакторинг)

## Git Repository
- Remote: https://github.com/bdjdjdj898-source/vintage-shop.git
- Branch: main
- Последние коммиты: UI improvements для ProductCard, Header, CategoryTabs, FilterPanel, ProductDetail

## Telegram Mini App Setup

### Bot Configuration (через @BotFather)
1. Создать бота: `/newbot`
2. Настроить Web App URL: `/mybots` → выбрать бота → Bot Settings → Menu Button
3. URL: `https://egorloh.duckdns.org`

### initData Validation Flow
1. Frontend получает `window.Telegram.WebApp.initData`
2. Отправляет в заголовке `X-Telegram-Init-Data` на backend
3. Backend валидирует через `crypto.createHmac('sha256', secretKey)` где secretKey = SHA256(BOT_TOKEN)
4. Парсит данные пользователя и создает/обновляет User в БД
5. Возвращает user object в response

### Dev Mode (для разработки без Telegram)
```bash
# frontend/.env.development
VITE_DEV_MODE=true
VITE_MOCK_TELEGRAM=true
```

При этом используется mock Telegram user для тестирования локально.

## Проверка работы

### Что должно отображаться
При правильной настройке вы увидите:

1. **Загрузка** - спиннер "Загрузка..."
2. **Главная страница** с:
   - Списком товаров (если есть в БД)
   - Фильтрами (бренд, размер, цвет, цена, сортировка)
   - CategoryTabs с horizontal scroll
   - Корзиной в Header

3. **Если товаров нет:**
   - Пустая страница с текстом "Товары не найдены"

### Проверка API
```bash
# На сервере
curl http://localhost:3002/api/health
# Должен вернуть JSON с status: "ok"

# Проверка товаров
curl http://localhost:3002/api/products
# Должен вернуть список товаров (или пустой массив)
```

### Проверка доступа admin
Telegram ID `5619341542` настроен как админ.

При открытии Mini App вы должны видеть дополнительные пункты меню:
- Admin Panel
- Управление товарами
- Управление заказами
- Аналитика

## Решение проблем

### "Требуется авторизация"
- Убедитесь что открываете через Telegram (не через браузер напрямую)
- Проверьте что backend работает: `docker-compose ps`

### "Ошибка авторизации"
- Проверьте логи: `docker-compose logs backend`
- Убедитесь что TELEGRAM_BOT_TOKEN правильный в `.env`

### Пустая страница / ошибка загрузки
- Откройте DevTools в Telegram Desktop (Ctrl+Shift+I)
- Проверьте Console на ошибки
- Проверьте Network → смотрите запросы к `/api/`

### API недоступен
```bash
# На сервере проверьте
docker-compose logs frontend
docker-compose logs backend

# Проверьте что nginx проксирует правильно
docker-compose exec frontend cat /etc/nginx/nginx.conf
```

## После обновления на сервере

```bash
cd /var/www/my-vintage-shop
git pull origin main
docker-compose build frontend backend
docker rm -f $(docker ps -aqf 'name=my-vintage-shop_frontend') $(docker ps -aqf 'name=my-vintage-shop_backend')
docker-compose up -d
```

Приложение автоматически пересоберется и перезапустится.
