Technical Plan - Vintage Shop
1. Архитектура и технический стек
Структура монорепо
my-vintage-shop/
├── frontend/                 # React + Vite фронтенд
├── backend/                  # Node.js + Express бэкенд  
├── prisma/                   # База данных и миграции
└── docker-compose.yml        # Контейнеризация
Технологический стек

Фронтенд: React + Vite + TypeScript + Tailwind CSS
Бэкенд: Node.js + Express.js + TypeScript
База данных: PostgreSQL + Prisma ORM
Интеграция: Telegram WebApp + Bot API
Деплой: Docker + Docker Compose
Разработка: Hot reload, TypeScript для типобезопасности

2. Схема базы данных (Prisma модели)
prismagenerator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          Int      @id @default(autoincrement())
  telegramId  String   @unique
  username    String?
  firstName   String?
  lastName    String?
  role        String   @default("user") // "user" | "admin"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  orders      Order[]
  cart        Cart?
  
  @@map("users")
}

model Product {
  id          Int      @id @default(autoincrement())
  title       String
  brand       String
  category    String   // "Куртки" | "Толстовки" | "Джинсы" | "Аксессуары" | "Обувь"
  size        String
  color       String
  condition   Int      // 1-10 шкала состояния
  description String
  price       Float
  images      String   // JSON массив URL изображений
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  cartItems   CartItem[]
  orderItems  OrderItem[]
  
  @@map("products")
}

model Cart {
  id        Int      @id @default(autoincrement())
  userId    Int      @unique
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  items     CartItem[]
  
  @@map("carts")
}

model CartItem {
  id        Int     @id @default(autoincrement())
  cartId    Int
  productId Int
  quantity  Int     @default(1)
  
  cart      Cart    @relation(fields: [cartId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  
  @@unique([cartId, productId])
  @@map("cart_items")
}

model Order {
  id            Int      @id @default(autoincrement())
  userId        Int
  status        String   @default("pending") // "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  totalAmount   Float
  shippingInfo  String   // JSON с адресом доставки
  telegramData  String?  // Данные из Telegram WebApp
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User     @relation(fields: [userId], references: [id])
  items         OrderItem[]
  
  @@map("orders")
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Float   // Цена на момент заказа
  
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  
  @@map("order_items")
}
3. Дизайн REST API
Аутентификация через Telegram (Header-based)
typescript// backend/src/utils/telegramAuth.ts
import crypto from 'crypto';

export function validateTelegramInitData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = [...urlParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
    
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}

// Аутентификация реализована через x-telegram-init-data header
// Каждый запрос содержит initData, которые валидируются на сервере
// JWT токены не используются - аутентификация проверяется на каждом запросе

API эндпоинты
typescript// Товары
GET    /api/products              # Список товаров с фильтрами
GET    /api/products/:id          # Детали товара
POST   /api/products              # Создание товара (только админ)
PUT    /api/products/:id          # Обновление товара (только админ)
DELETE /api/products/:id          # Удаление товара (только админ)

// Корзина
GET    /api/cart                  # Получить корзину пользователя
POST   /api/cart/items            # Добавить товар в корзину
PUT    /api/cart/items/:id        # Обновить количество в корзине
DELETE /api/cart/items/:id        # Удалить товар из корзины

// Заказы
GET    /api/orders                # Заказы пользователя
POST   /api/orders                # Создать заказ
GET    /api/orders/:id            # Детали заказа
PUT    /api/orders/:id/status     # Изменить статус заказа (только админ)

// Админ-панель
GET    /api/admin/users           # Список пользователей (только админ)
GET    /api/admin/orders          # Все заказы (только админ)
GET    /api/admin/analytics       # Аналитика (только админ)
Middleware для RBAC
typescript// backend/src/middleware/auth.ts
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};
4. Архитектура фронтенда
React Router структура
typescript// frontend/src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/admin/products" element={<AdminProducts />} />
    <Route path="/admin/orders" element={<AdminOrders />} />
  </Routes>
</BrowserRouter>
Context провайдеры
typescript// frontend/src/contexts/AuthContext.tsx
export const AuthContext = createContext<{
  user: User | null;
  login: (telegramData: string) => Promise<void>;
  logout: () => void;
}>();

// frontend/src/contexts/CartContext.tsx  
export const CartContext = createContext<{
  items: CartItem[];
  addItem: (productId: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
}>();
Инициализация Telegram WebApp
typescript// frontend/src/utils/telegram.ts
export const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    
    // Настройка темы
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#f8f9fa');
    
    return {
      initData: tg.initData,
      user: tg.initDataUnsafe.user,
      colorScheme: tg.colorScheme
    };
  }
  return null;
};
5. Фазы реализации с критериями приемки
Фаза 1: MVP (Неделя 1-2)
Критерии приемки:

 Каталог товаров с базовой фильтрацией по категориям
 Функционал корзины (добавление/удаление товаров)
 Интеграция с Telegram WebApp и аутентификация
 Создание заказов с базовой информацией
 База данных PostgreSQL с настроенным Prisma
 Адаптивный дизайн для мобильных устройств
 Базовое API для товаров, корзины и заказов

Фаза 2: Админ-панель (Неделя 3)
Критерии приемки:

 Аутентификация админа и контроль ролей
 CRUD операции с товарами через админ-панель
 Управление заказами и изменение статусов
 Интерфейс управления пользователями
 Базовая аналитическая панель с метриками
 Загрузка изображений товаров

Фаза 3: Улучшения (Неделя 4)
Критерии приемки:

 Расширенная фильтрация товаров (бренд, размер, состояние)
 Поиск по товарам
 Отслеживание заказов и уведомления
 Оптимизация производительности (lazy loading)
 Улучшения UI/UX
 Настройка автоматизированных тестов

6. Безопасность
Валидация данных Telegram
typescript// backend/src/middleware/telegramAuth.ts
export const validateTelegramAuth = async (req: Request, res: Response, next: NextFunction) => {
  const initData = req.headers['x-telegram-init-data'] as string;
  
  if (!initData) {
    return res.status(401).json({ error: 'Telegram auth required' });
  }
  
  const isValid = validateTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN!);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid Telegram auth' });
  }
  
  // Парсинг пользователя из initData
  const userData = parseTelegramInitData(initData);
  req.user = await findOrCreateUser(userData);
  
  next();
};
Дополнительные меры безопасности

Rate Limiting: express-rate-limit для предотвращения злоупотреблений
Санитизация входных данных: express-validator для валидации API запросов
Защита от SQL инъекций: Prisma автоматически защищает
XSS защита: helmet.js для установки безопасных заголовков
HTTPS: принудительное использование HTTPS в продакшене

7. Деплой и DevOps
Docker конфигурация
dockerfile# Dockerfile.frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

# Dockerfile.backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
COPY prisma/ ./prisma/
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
Docker Compose
yamlversion: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/vintage_shop?schema=public
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - ADMIN_TELEGRAM_IDS=${ADMIN_TELEGRAM_IDS}
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=vintage_shop
    volumes:
      - postgres_data:/var/lib/postgresql/data
Переменные окружения
env# .env.production
DATABASE_URL="postgresql://user:password@localhost:5432/vintage_shop?schema=public"
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret
NODE_ENV=production
PORT=3000
ADMIN_TELEGRAM_IDS=123456789,987654321  # Comma-separated, entries trimmed automatically
TELEGRAM_INITDATA_TTL=86400  # Telegram auth data TTL in seconds

# Important: In production, an empty list disables admin notifications and admin role matching
CI/CD и мониторинг

GitHub Actions: автоматическая сборка и деплой
Логирование: Winston для структурированных логов
Мониторинг: Health check эндпоинты для проверки состояния
Бэкапы: автоматическое резервное копирование БД

8. Риски и митигации
Риск: Ограничения Telegram API

Воздействие: Rate limiting может повлиять на пользовательский опыт
Митигация: Клиентское кеширование, оптимизация API вызовов, graceful handling ошибок rate limit

Риск: Производительность PostgreSQL

Воздействие: Неправильно настроенная БД может привести к медленным запросам
Митигация: Правильная индексация, оптимизация запросов, регулярный мониторинг производительности

Риск: Безопасность доступа админа

Воздействие: Несанкционированный доступ к админ-функциям
Митигация: Строгая аутентификация, RBAC, аудит логи админ-действий

Риск: Хранение изображений

Воздействие: Большие файлы могут занять много места
Митигация: Сжатие изображений, интеграция с CDN, лимиты на размер файлов

Риск: Мобильная производительность

Воздействие: Плохая производительность на мобильных устройствах
Митигация: Оптимизация bundle size, lazy loading, прогрессивная загрузка изображений

Риск: Потеря данных

Воздействие: Потеря данных о товарах или заказах
Митигация: Регулярные бэкапы БД, целостность транзакций, валидация данных

Заключение
Данный технический план обеспечивает полную дорожную карту для реализации винтажного магазина в Telegram WebApp. Поэтапный подход гарантирует постепенную поставку функциональности с сохранением качества кода и стандартов безопасности. Архитектура спроектирована масштабируемой и поддерживаемой.