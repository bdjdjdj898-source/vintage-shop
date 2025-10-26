# 📱 План миграции: Telegram Mini App → Кроссплатформенное мобильное приложение

## 🎯 Цель
Превратить текущий Telegram Mini App в standalone мобильное приложение для Android/iOS с собственной системой авторизации.

## 🚀 Краткое резюме

**Выбранная технология:** **Capacitor** (React + TypeScript в WebView)

**Почему именно Capacitor:**
- ✅ **TypeScript** - как ты и хотел, никакого Kotlin/Java
- ✅ **Android Studio** - открывается и собирается там
- ✅ **80% кода готов** - копируешь из `frontend/` почти без изменений
- ✅ **Свайп уже работает** - твой ProductCard с pointer events работает в WebView
- ✅ **Быстрая разработка** - 3-4 недели вместо 2+ месяцев на React Native

**Что нужно сделать:**
1. Создать Capacitor проект на базе Vite + React + TypeScript
2. Скопировать код из `frontend/` (компоненты, API, стили)
3. Заменить Telegram auth на JWT (backend + frontend)
4. Удалить зависимости от Telegram SDK
5. Добавить Capacitor плагины (Storage, Haptics, StatusBar)
6. Собрать APK в Android Studio

**Сроки:** 13-18 дней (3-4 недели при работе 4-6 часов/день)

---

## 📊 Текущее состояние

### Стек:
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: SQLite (Prisma ORM)
- **Auth**: Telegram WebApp (`softAuth` middleware)
- **Deploy**: Docker + nginx

### Ключевые зависимости от Telegram:
1. `@twa-dev/sdk` - Telegram WebApp SDK
2. `frontend/src/utils/telegram.ts` - инициализация WebApp
3. `backend/src/middleware/softTelegramAuth.ts` - парсинг `x-telegram-init-data`
4. `backend/src/utils/telegram.ts` - валидация initData
5. User model: `telegramId` как primary identifier

---

## 🏗️ Архитектура после миграции

### 🎯 **Выбранная технология: Capacitor**

**Почему Capacitor:**
- ✅ **TypeScript** - используем существующий React + TypeScript код
- ✅ **Android Studio** - открывается и компилируется в Android Studio
- ✅ **Быстрая миграция** - можно переиспользовать до 80% кода из `frontend/`
- ✅ **Нативные фичи** - доступ к камере, файлам, push-уведомлениям через плагины
- ⚠️ **WebView** - не чисто native рендеринг, но достаточно быстро для этого проекта

```
my-vintage-shop-mobile/                 # Новая директория (та, куда ты скопировал файлы)
│
├── 📱 mobile-app/                      # Capacitor + React + TypeScript
│   ├── src/                            # React приложение (почти как frontend/)
│   │   ├── pages/                      # Страницы (портировано из frontend/)
│   │   │   ├── Home.tsx                # Catalog
│   │   │   ├── ProductDetail.tsx       # Product detail
│   │   │   ├── Cart.tsx                # Shopping cart
│   │   │   ├── Favorites.tsx           # Favorites
│   │   │   ├── Profile.tsx             # User profile
│   │   │   ├── Search.tsx              # Search
│   │   │   ├── Orders.tsx              # Orders list
│   │   │   ├── OrderDetail.tsx         # Order detail
│   │   │   ├── Login.tsx               # Login form
│   │   │   ├── Register.tsx            # Registration
│   │   │   └── ForgotPassword.tsx      # Password reset
│   │   │
│   │   ├── components/                 # Компоненты (портировано из frontend/)
│   │   │   ├── ProductCard.tsx         # ✅ Уже готов (с новым свайпом)
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx           # Bottom navigation (замена tabs)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── api/                        # API client (портировано из frontend/)
│   │   │   ├── client.ts               # ⚠️ Обновить: заменить x-telegram-init-data на JWT
│   │   │   ├── products.ts             # ✅ Без изменений
│   │   │   ├── cart.ts                 # ✅ Без изменений
│   │   │   ├── orders.ts               # ✅ Без изменений
│   │   │   ├── favorites.ts            # ✅ Без изменений
│   │   │   └── auth.ts                 # 🆕 Новый файл: login, register, refresh
│   │   │
│   │   ├── hooks/                      # React hooks
│   │   │   ├── useAuth.ts              # 🆕 JWT auth hook
│   │   │   ├── useProducts.ts          # ✅ Переиспользовать из frontend
│   │   │   ├── useCart.ts              # ✅ Переиспользовать
│   │   │   └── useFavorites.ts         # ✅ Переиспользовать
│   │   │
│   │   ├── utils/                      # Utilities
│   │   │   ├── storage.ts              # 🆕 Capacitor Storage API (замена localStorage)
│   │   │   ├── validation.ts           # ✅ Переиспользовать
│   │   │   └── format.ts               # ✅ Переиспользовать
│   │   │
│   │   ├── styles/                     # Tailwind CSS (или обычный CSS)
│   │   │   └── global.css              # ✅ Переиспользовать из frontend
│   │   │
│   │   ├── App.tsx                     # Main app component
│   │   ├── Router.tsx                  # React Router (как в frontend/)
│   │   ├── main.tsx                    # Entry point
│   │   └── index.html                  # HTML shell
│   │
│   ├── android/                        # 🤖 Android Studio проект (сгенерирован Capacitor)
│   │   ├── app/
│   │   │   ├── src/
│   │   │   │   └── main/
│   │   │   │       ├── AndroidManifest.xml
│   │   │   │       ├── java/          # Java/Kotlin код (опционально)
│   │   │   │       └── res/           # Android ресурсы (иконки, splash)
│   │   │   └── build.gradle           # Android build config
│   │   └── build.gradle
│   │
│   ├── ios/                            # 🍎 iOS проект (опционально, если нужен iOS)
│   │   └── App/
│   │
│   ├── capacitor.config.ts             # Capacitor configuration
│   ├── vite.config.ts                  # Vite config (как в frontend/)
│   ├── package.json                    # Dependencies
│   ├── tsconfig.json                   # TypeScript config
│   └── tailwind.config.js              # Tailwind config
│
├── 🖥️ backend/                         # Node.js + Express (модифицированный)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts                 # 🆕 Новые роуты
│   │   │   │   ├── POST /register
│   │   │   │   ├── POST /login
│   │   │   │   ├── POST /refresh
│   │   │   │   ├── POST /logout
│   │   │   │   ├── POST /forgot-password
│   │   │   │   └── POST /reset-password
│   │   │   ├── products.ts             # ✅ Без изменений
│   │   │   ├── cart.ts                 # ⚠️ Изменить middleware
│   │   │   ├── orders.ts               # ⚠️ Изменить middleware
│   │   │   ├── favorites.ts            # ⚠️ Изменить middleware
│   │   │   └── admin.ts                # ⚠️ Изменить middleware
│   │   │
│   │   ├── middleware/
│   │   │   ├── jwtAuth.ts              # 🆕 JWT verification
│   │   │   ├── optionalAuth.ts         # 🆕 Optional JWT (для каталога)
│   │   │   ├── adminAuth.ts            # 🆕 Admin role check
│   │   │   ├── ❌ softTelegramAuth.ts  # Удалить
│   │   │   └── ❌ telegramAuth.ts      # Удалить
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.ts                  # 🆕 JWT generation/verification
│   │   │   ├── bcrypt.ts               # 🆕 Password hashing
│   │   │   ├── email.ts                # 🆕 Email sending (nodemailer)
│   │   │   ├── validation.ts           # Email/password validation
│   │   │   ├── ❌ telegram.ts          # Удалить
│   │   │   └── responses.ts            # ✅ Без изменений
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.ts                 # 🆕 Auth validation rules
│   │   │   └── ...existing validators
│   │   │
│   │   ├── types/
│   │   │   ├── auth.ts                 # 🆕 JWT payload types
│   │   │   └── api.ts                  # ⚠️ Обновить User type
│   │   │
│   │   └── server.ts                   # ⚠️ Подключить новые routes
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # ⚠️ Изменить User model
│   │   └── migrations/
│   │       └── YYYYMMDD_add_email_auth/
│   │
│   └── package.json                    # 🆕 Добавить зависимости
│
├── 🌐 frontend/                        # Web версия (опционально сохранить)
│   └── ... (текущий код)
│
├── 📦 shared/                          # 🆕 Общие типы/константы
│   ├── types/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── api.ts
│   └── constants/
│       └── index.ts
│
└── 📄 docs/
    ├── API.md                          # Документация API
    ├── DEPLOYMENT.md                   # Инструкции деплоя
    └── MIGRATION_PLAN.md               # Этот файл
```

---

## 🔐 План изменения авторизации

### Текущая система (Telegram):
```typescript
// Frontend
const { initData } = Telegram.WebApp;
headers: { 'x-telegram-init-data': initData }

// Backend
softAuth middleware → parseTelegramInitData() → User by telegramId
```

### Новая система (JWT + Email/Password):

#### **Вариант 1: Email + Password (рекомендую для учебного проекта)**

**Регистрация:**
```typescript
POST /api/auth/register
Body: { email, password, name }

Backend:
1. Validate email format, password strength (min 8 chars, 1 uppercase, 1 number)
2. Check if email exists
3. Hash password with bcrypt (salt rounds: 10)
4. Create user in DB
5. Generate access token (JWT, expires 15 min)
6. Generate refresh token (expires 30 days, store in DB)
7. Return { accessToken, refreshToken, user }

Frontend:
- Store tokens in AsyncStorage
- Store user in state
- Navigate to main app
```

**Логин:**
```typescript
POST /api/auth/login
Body: { email, password }

Backend:
1. Find user by email
2. Compare password with bcrypt
3. Generate tokens
4. Return { accessToken, refreshToken, user }
```

**Рефреш токена:**
```typescript
POST /api/auth/refresh
Body: { refreshToken }

Backend:
1. Verify refresh token signature
2. Check if token exists in DB (not revoked)
3. Generate new access token
4. Return { accessToken }
```

**Защищённые маршруты:**
```typescript
// Frontend - каждый запрос
headers: { 'Authorization': `Bearer ${accessToken}` }

// Backend - jwtAuth middleware
1. Extract token from Authorization header
2. Verify JWT signature
3. Decode payload → userId
4. Attach user to req.user
5. Continue to route handler
```

---

#### **Вариант 2: OAuth (Google/Apple) - для продакшена**

**Google Sign-In:**
```typescript
// Mobile (React Native)
import * as Google from 'expo-auth-session/providers/google';

1. User clicks "Sign in with Google"
2. Expo opens Google OAuth flow
3. User authorizes
4. Get idToken from Google
5. Send to backend

POST /api/auth/google
Body: { idToken }

Backend:
1. Verify idToken with Google API
2. Extract email, name, googleId
3. Find or create user
4. Generate JWT tokens
5. Return { accessToken, refreshToken, user }
```

**Apple Sign-In:**
```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

POST /api/auth/apple
Body: { identityToken, user }

Backend:
1. Verify identityToken with Apple
2. Extract email (может быть скрыт)
3. Find or create user with appleId
4. Generate tokens
5. Return { accessToken, refreshToken, user }
```

---

#### **Вариант 3: Phone + SMS (как Telegram)**

```typescript
// Step 1: Send code
POST /api/auth/send-code
Body: { phone: "+79991234567" }

Backend:
1. Validate phone format
2. Generate 6-digit code
3. Send SMS via Twilio/Firebase
4. Store code + sessionId in Redis (TTL 5 min)
5. Return { sessionId }

// Step 2: Verify code
POST /api/auth/verify-code
Body: { sessionId, code: "123456" }

Backend:
1. Check code in Redis
2. Verify code matches
3. Find or create user by phone
4. Generate JWT tokens
5. Return { accessToken, refreshToken, user }
```

---

## 🗄️ Изменения в базе данных

### Текущая схема:
```prisma
model User {
  id          Int       @id @default(autoincrement())
  telegramId  String    @unique              // ← Убрать
  username    String?
  firstName   String?
  lastName    String?
  avatarUrl   String?
  role        String    @default("user")
  isBanned    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  favorites   Favorite[]
  cart        Cart[]
  orders      Order[]
}
```

### Новая схема (Вариант 1: Email/Password):
```prisma
model User {
  id          Int       @id @default(autoincrement())

  // Auth fields
  email       String    @unique              // 🆕 Primary identifier
  password    String?                        // 🆕 bcrypt hash (null для OAuth)
  isVerified  Boolean   @default(false)      // 🆕 Email verification

  // Profile
  name        String                         // 🆕 Full name (было firstName + lastName)
  phone       String?   @unique              // 🆕 Опционально
  avatar      String?                        // Переименовать из avatarUrl

  // System
  role        String    @default("user")
  isBanned    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?                      // 🆕 Track last login

  // Relations
  favorites      Favorite[]
  cart           Cart[]
  orders         Order[]
  refreshTokens  RefreshToken[]               // 🆕 Relation

  @@index([email])
}

// 🆕 Refresh tokens table
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}

// 🆕 Email verification tokens
model VerificationToken {
  id        Int      @id @default(autoincrement())
  email     String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([email])
  @@index([token])
}

// 🆕 Password reset tokens
model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}
```

### Новая схема (Вариант 2: OAuth):
```prisma
model User {
  id          Int       @id @default(autoincrement())

  // Auth fields
  email       String    @unique
  password    String?                        // null для OAuth users

  // OAuth providers
  googleId    String?   @unique              // 🆕 Google user ID
  appleId     String?   @unique              // 🆕 Apple user ID
  facebookId  String?   @unique              // 🆕 Facebook user ID (опционально)

  // Profile
  name        String
  phone       String?   @unique
  avatar      String?

  // System
  role        String    @default("user")
  isBanned    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?

  // Relations
  favorites      Favorite[]
  cart           Cart[]
  orders         Order[]
  refreshTokens  RefreshToken[]

  @@index([email])
  @@index([googleId])
  @@index([appleId])
}
```

### Migration steps:
```bash
# 1. Создать миграцию
npx prisma migrate dev --name add_email_auth

# 2. Миграция существующих пользователей (если нужно)
# Скрипт для преобразования telegramId → email
# Например: user_${telegramId}@temp.com

# 3. Удалить старые поля после тестирования
npx prisma migrate dev --name remove_telegram_fields
```

---

## 📦 Новые зависимости

### Backend:
```json
{
  "dependencies": {
    // Auth
    "jsonwebtoken": "^9.0.2",              // JWT tokens
    "bcryptjs": "^2.4.3",                  // Password hashing
    "crypto": "built-in",                  // Random token generation

    // Email (если нужна верификация)
    "nodemailer": "^6.9.7",                // Email sending
    "@sendgrid/mail": "^8.1.0",            // Альтернатива (SendGrid)

    // Validation
    "validator": "^13.11.0",               // Email/URL validation

    // OAuth (если выбран вариант 2)
    "google-auth-library": "^9.4.1",       // Google OAuth
    "apple-signin-auth": "^1.7.5",         // Apple Sign-In

    // SMS (если выбран вариант 3)
    "twilio": "^4.19.0",                   // SMS sending

    // Rate limiting
    "express-rate-limit": "^7.1.5",        // Защита от брутфорса

    // Existing dependencies
    "express": "^4.18.2",
    "prisma": "^5.7.1",
    "@prisma/client": "^5.7.1",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/nodemailer": "^6.4.14"
  }
}
```

### Mobile (Capacitor + React):
```json
{
  "dependencies": {
    // Core
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.21.0",              // Routing (уже есть в frontend/)

    // Capacitor - Native Bridge
    "@capacitor/core": "^6.0.0",                // Core Capacitor
    "@capacitor/android": "^6.0.0",             // Android platform
    "@capacitor/ios": "^6.0.0",                 // iOS platform (опционально)

    // Capacitor Plugins (замена React Native модулей)
    "@capacitor/storage": "^1.2.5",             // Persistent storage (замена AsyncStorage)
    "@capacitor/camera": "^6.0.0",              // Camera access
    "@capacitor/filesystem": "^6.0.0",          // File system
    "@capacitor/haptics": "^6.0.0",             // Vibration/haptic feedback
    "@capacitor/keyboard": "^6.0.0",            // Keyboard control
    "@capacitor/status-bar": "^6.0.0",          // Status bar styling
    "@capacitor/splash-screen": "^6.0.0",       // Splash screen
    "@capacitor/app": "^6.0.0",                 // App state, URL schemes
    "@capacitor/toast": "^6.0.0",               // Native toasts

    // OAuth (если нужен)
    "@capacitor-community/google-auth": "^3.3.4",
    "@capacitor-community/apple-sign-in": "^5.0.0",

    // Push notifications (опционально)
    "@capacitor/push-notifications": "^6.0.0",

    // Networking (уже есть в frontend/)
    "axios": "^1.6.2",

    // UI (уже есть в frontend/)
    "tailwindcss": "^4.0.0",

    // Forms (уже есть в frontend/)
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",

    // Utils (уже есть в frontend/)
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    // Build tools (уже есть в frontend/)
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.8.0",

    // Capacitor CLI
    "@capacitor/cli": "^6.0.0",

    // Types
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

---

## 🔄 Пошаговый план миграции

### **Phase 1: Подготовка (1-2 дня)**
- [ ] Создать ветку `feature/mobile-migration`
- [ ] Документировать текущие API endpoints
- [ ] Проанализировать все зависимости от Telegram API
- [ ] Решить, какую систему авторизации использовать
- [ ] Выбрать state management для мобилки (Context API / Zustand / Redux)

### **Phase 2: Backend - новая авторизация (2-3 дня)**
- [ ] **2.1. Database schema**
  - [ ] Обновить `prisma/schema.prisma`
  - [ ] Создать миграцию `npx prisma migrate dev --name add_email_auth`
  - [ ] Создать seed скрипт для тестовых пользователей

- [ ] **2.2. Auth utilities**
  - [ ] `src/utils/jwt.ts` - generateAccessToken, generateRefreshToken, verifyToken
  - [ ] `src/utils/bcrypt.ts` - hashPassword, comparePassword
  - [ ] `src/utils/email.ts` - sendVerificationEmail, sendPasswordResetEmail (если нужно)
  - [ ] `src/utils/tokens.ts` - generateVerificationToken, generatePasswordResetToken

- [ ] **2.3. Middleware**
  - [ ] `src/middleware/jwtAuth.ts` - проверка JWT токена, извлечение userId
  - [ ] `src/middleware/optionalAuth.ts` - опциональная авторизация (для каталога)
  - [ ] `src/middleware/adminAuth.ts` - проверка роли admin

- [ ] **2.4. Validators**
  - [ ] `src/validators/auth.ts` - email, password, name validation

- [ ] **2.5. Routes**
  - [ ] `src/routes/auth.ts` - register, login, refresh, logout, verify-email, forgot-password
  - [ ] Обновить все существующие routes: заменить `softAuth` на `jwtAuth`
    - [ ] `src/routes/favorites.ts`
    - [ ] `src/routes/cart.ts`
    - [ ] `src/routes/orders.ts`
    - [ ] `src/routes/admin.ts`
    - [ ] `src/routes/products.ts` - добавить `optionalAuth` (для лайков)

- [ ] **2.6. Testing**
  - [ ] Тестировать регистрацию через Postman
  - [ ] Тестировать логин
  - [ ] Тестировать refresh token
  - [ ] Тестировать защищённые routes

### **Phase 3: Capacitor - инициализация (1 день)**
- [ ] **3.1. Создание Capacitor проекта**
  ```bash
  # В новой директории (где уже есть Android Studio файлы)
  npm create vite@latest mobile-app -- --template react-ts
  cd mobile-app
  npm install

  # Установить Capacitor
  npm install @capacitor/core @capacitor/cli
  npx cap init
  # App name: Vintage Shop
  # Package ID: com.vintageshop.app
  ```

- [ ] **3.2. Добавить Android платформу**
  ```bash
  npm install @capacitor/android
  npx cap add android
  # Это создаст папку android/ с Android Studio проектом
  ```

- [ ] **3.3. Скопировать код из frontend/**
  - [ ] Скопировать `src/components/` → `mobile-app/src/components/`
  - [ ] Скопировать `src/api/` → `mobile-app/src/api/`
  - [ ] Скопировать `src/hooks/` (кроме useTelegram.ts)
  - [ ] Скопировать `src/utils/` (кроме telegram.ts)
  - [ ] Скопировать `src/styles/`
  - [ ] Скопировать `tailwind.config.js`, `postcss.config.js`

- [ ] **3.4. Установить Capacitor плагины**
  ```bash
  npm install @capacitor/storage @capacitor/haptics @capacitor/status-bar
  npm install @capacitor/splash-screen @capacitor/app @capacitor/toast
  ```

- [ ] **3.5. Настроить `capacitor.config.ts`**
  ```typescript
  import { CapacitorConfig } from '@capacitor/cli';

  const config: CapacitorConfig = {
    appId: 'com.vintageshop.app',
    appName: 'Vintage Shop',
    webDir: 'dist',
    server: {
      androidScheme: 'https'
    }
  };

  export default config;
  ```

### **Phase 4: Mobile - Auth flow (2-3 дня)**
- [ ] **4.1. Создать Capacitor storage wrapper**
  - [ ] `src/utils/storage.ts` - обёртка над `@capacitor/storage`
  ```typescript
  import { Storage } from '@capacitor/storage';

  export const storage = {
    async set(key: string, value: any) {
      await Storage.set({ key, value: JSON.stringify(value) });
    },
    async get(key: string) {
      const { value } = await Storage.get({ key });
      return value ? JSON.parse(value) : null;
    },
    async remove(key: string) {
      await Storage.remove({ key });
    }
  };
  ```

- [ ] **4.2. Обновить API client**
  - [ ] `src/api/client.ts` - заменить `x-telegram-init-data` на JWT Bearer token
  - [ ] Добавить interceptor для автоматической подстановки access token
  - [ ] Добавить обработку 401 ошибок с auto-refresh token

- [ ] **4.3. Создать auth API**
  - [ ] `src/api/auth.ts` - register(), login(), refreshToken(), logout()

- [ ] **4.4. Создать auth hook**
  - [ ] `src/hooks/useAuth.ts` - проверка авторизации при запуске
  - [ ] Загрузка токенов из Capacitor Storage
  - [ ] Auto-refresh при старте приложения

- [ ] **4.5. Создать страницы авторизации**
  - [ ] `src/pages/Login.tsx` - форма входа
  - [ ] `src/pages/Register.tsx` - форма регистрации
  - [ ] `src/pages/ForgotPassword.tsx` (опционально)

- [ ] **4.6. Обновить роутинг**
  - [ ] `src/Router.tsx` - добавить protected routes
  - [ ] Редирект на /login если не авторизован
  - [ ] Редирект на /home если авторизован

### **Phase 5: Mobile - Адаптация UI (2-3 дня)**
- [ ] **5.1. Удалить Telegram зависимости**
  - [ ] Удалить `@twa-dev/sdk`
  - [ ] Удалить `src/hooks/useTelegram.ts`
  - [ ] Удалить `src/utils/telegram.ts`
  - [ ] Удалить все импорты WebApp из компонентов

- [ ] **5.2. Адаптировать ProductCard**
  - [ ] **УЖЕ ГОТОВ** - свайп переписан на pointer events (работает в WebView)
  - [ ] Заменить haptic feedback: WebApp → Capacitor Haptics
  ```typescript
  import { Haptics, ImpactStyle } from '@capacitor/haptics';
  // Вместо: webApp.HapticFeedback.impactOccurred('light')
  await Haptics.impact({ style: ImpactStyle.Light });
  ```

- [ ] **5.3. Создать Bottom Navigation**
  - [ ] `src/components/BottomNav.tsx` - нижняя навигация (Главная, Поиск, Избранное, Корзина, Профиль)
  - [ ] Sticky position: fixed bottom-0

- [ ] **5.4. Адаптировать стили для mobile**
  - [ ] Убедиться что всё responsive (уже должно быть)
  - [ ] Добавить safe-area для статус-бара
  - [ ] Настроить viewport meta в index.html

- [ ] **5.5. Добавить Status Bar**
  ```typescript
  import { StatusBar, Style } from '@capacitor/status-bar';
  // В App.tsx при загрузке
  await StatusBar.setStyle({ style: Style.Light });
  ```

### **Phase 6: Mobile - Страницы (2-3 дня)**
- [ ] **6.1. Главная (Каталог)**
  - [ ] `src/pages/Home.tsx` - уже есть в frontend, переименовать из Catalog
  - [ ] Pull-to-refresh (обычный браузерный или кастомный)
  - [ ] Infinite scroll (intersection observer)

- [ ] **6.2. Детальная карточка товара**
  - [ ] `src/pages/ProductDetail.tsx` - уже есть
  - [ ] ProductCard уже с рабочим свайпом
  - [ ] Кнопки "В корзину" и "В избранное"

- [ ] **6.3. Избранное**
  - [ ] `src/pages/Favorites.tsx` - уже есть

- [ ] **6.4. Корзина**
  - [ ] `src/pages/Cart.tsx` - уже есть
  - [ ] Проверка работы +/- количества

- [ ] **6.5. Профиль**
  - [ ] `src/pages/Profile.tsx` - уже есть
  - [ ] Добавить кнопку "Выйти" с очисткой Capacitor Storage

- [ ] **6.6. Поиск**
  - [ ] `src/pages/Search.tsx` - если есть, иначе создать

- [ ] **6.7. Заказы**
  - [ ] `src/pages/Orders.tsx` - список заказов
  - [ ] `src/pages/OrderDetail.tsx` - детали заказа

### **Phase 7: Testing & Polish (2-3 дня)**
- [ ] **7.1. Функциональное тестирование**
  - [ ] Регистрация → Login → Browse → Add to Cart → Checkout → Order
  - [ ] Favorites add/remove
  - [ ] Profile edit
  - [ ] Logout → Login

- [ ] **7.2. UI/UX polish**
  - [ ] Loading states
  - [ ] Error handling (toast notifications)
  - [ ] Empty states (пустой каталог, корзина)
  - [ ] Skeleton loaders

- [ ] **7.3. Performance**
  - [ ] Image optimization (expo-image)
  - [ ] List virtualization (FlashList)
  - [ ] Debounce поиска

- [ ] **7.4. Тестирование на устройствах**
  - [ ] Android эмулятор
  - [ ] iOS симулятор (если есть Mac)
  - [ ] Реальное устройство через Expo Go

### **Phase 8: Build & Deploy в Android Studio (1-2 дня)**
- [ ] **8.1. Подготовка к сборке**
  - [ ] Создать иконки приложения:
    - `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
    - `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
    - `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
    - `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
    - `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)
  - [ ] Настроить splash screen в `android/app/src/main/res/drawable/splash.png`

- [ ] **8.2. Сборка Web части**
  ```bash
  # В mobile-app/
  npm run build
  # Это создаст dist/ с React приложением
  ```

- [ ] **8.3. Синхронизация с Android**
  ```bash
  npx cap sync
  # Копирует dist/ → android/app/src/main/assets/public/
  ```

- [ ] **8.4. Открыть в Android Studio**
  ```bash
  npx cap open android
  # Откроется Android Studio с проектом
  ```

- [ ] **8.5. Сборка APK в Android Studio**
  - [ ] **Build → Build Bundle(s) / APK(s) → Build APK(s)**
  - [ ] Или через Gradle:
  ```bash
  cd android
  ./gradlew assembleDebug  # Debug APK
  ./gradlew assembleRelease  # Release APK (требует подписи)
  ```
  - [ ] APK будет в `android/app/build/outputs/apk/`

- [ ] **8.6. Подписание APK (для релиза)**
  - [ ] Создать keystore:
  ```bash
  keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
  ```
  - [ ] Настроить `android/app/build.gradle`:
  ```gradle
  android {
    signingConfigs {
      release {
        storeFile file("path/to/my-release-key.keystore")
        storePassword "password"
        keyAlias "my-key-alias"
        keyPassword "password"
      }
    }
    buildTypes {
      release {
        signingConfig signingConfigs.release
      }
    }
  }
  ```

- [ ] **8.7. Testing production build**
  - [ ] Установить APK на Android устройство через USB:
  ```bash
  adb install android/app/build/outputs/apk/debug/app-debug.apk
  ```
  - [ ] Или через Android Studio: Run → Run 'app'
  - [ ] Проверить все функции

---

## 🔧 Конфигурационные файлы

### `backend/.env` (обновить):
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="30d"

# Email (если используется)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@vintage-shop.com"

# Frontend URL (для email links)
FRONTEND_URL="exp://localhost:8081"  # Expo development
# FRONTEND_URL="myapp://"             # Production deep link

# OAuth (если используется)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_CLIENT_ID="com.yourcompany.app"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_KEY_ID="your-apple-key-id"
APPLE_PRIVATE_KEY="path-to-private-key.p8"

# SMS (если используется)
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Удалить старые переменные
# TELEGRAM_BOT_TOKEN (больше не нужен)
```

### `mobile-app/.env` (создать):
```env
# API URL
VITE_API_URL="http://192.168.1.100:3002"  # Локальная сеть для разработки
# VITE_API_URL="https://api.vintage-shop.com"  # Production

# OAuth (если используется)
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
VITE_APPLE_CLIENT_ID="com.yourcompany.app"
```

### `mobile-app/capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vintageshop.app',
  appName: 'Vintage Shop',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Для разработки с hot reload:
    // url: 'http://192.168.1.100:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#000000'
    }
  }
};

export default config;
```

### `mobile-app/android/app/build.gradle` (часть конфига):
```gradle
android {
    namespace "com.vintageshop.app"
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.vintageshop.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### `mobile-app/android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Vintage Shop"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.SplashScreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
</manifest>
```

---

## 📊 Сравнение: до и после

| Аспект | Telegram Mini App | Capacitor Mobile App |
|--------|-------------------|---------------------|
| **Платформа** | Только Telegram | Android, iOS, Web |
| **Технология** | React + Telegram SDK | React + Capacitor (WebView) |
| **Язык** | TypeScript | TypeScript ✅ |
| **Android Studio** | Нет | Да ✅ |
| **Установка** | Не требуется | Установка APK/Store |
| **Авторизация** | Telegram ID (автоматом) | Email/Password/OAuth |
| **Оффлайн** | Не работает | Может кэшировать (Service Worker) |
| **Push уведомления** | Telegram боты | FCM (Capacitor Push) |
| **Размер** | ~2MB (WebApp) | ~10-15MB (APK с WebView) |
| **Монетизация** | Telegram Payments | In-app purchases / Web payments |
| **Доступность** | Только юзеры Telegram | Все пользователи |
| **Переиспользование кода** | - | **80% кода из frontend/** ✅ |
| **Скорость разработки** | - | **Быстрее чем React Native** ✅ |
| **Производительность** | Отлично (нативный WebView Telegram) | Хорошо (WebView) |

---

## 💰 Оценка трудозатрат (Capacitor)

| Phase | Описание | Время (дни) | Сложность |
|-------|----------|-------------|-----------|
| Phase 1 | Подготовка | 1 | 🟢 Easy |
| Phase 2 | Backend auth | 2-3 | 🟡 Medium |
| Phase 3 | Capacitor init + копирование кода | 1 | 🟢 Easy |
| Phase 4 | Mobile auth (Storage + JWT) | 2 | 🟡 Medium |
| Phase 5 | Адаптация UI (удаление Telegram, добавление Capacitor) | 2-3 | 🟢 Easy |
| Phase 6 | Доработка страниц | 2-3 | 🟢 Easy |
| Phase 7 | Testing | 2 | 🟡 Medium |
| Phase 8 | Build в Android Studio | 1-2 | 🟡 Medium |
| **ИТОГО** | | **13-18 дней** | |

*При работе 4-6 часов в день = **3-4 недели***

**Преимущества Capacitor для твоего кейса:**
- ✅ **80% кода уже готов** - просто копируешь из `frontend/`
- ✅ **TypeScript везде** - никакого Java/Kotlin (если не нужны кастомные плагины)
- ✅ **Открывается в Android Studio** - можешь собирать APK там
- ✅ **ProductCard со свайпом уже работает** - pointer events работают в WebView
- ✅ **Tailwind CSS работает** - не надо переписывать стили
- ✅ **Быстрая итерация** - npm run dev → npx cap sync → refresh в эмуляторе

---

## ⚠️ Потенциальные проблемы

### 1. **Миграция существующих пользователей**
**Проблема:** У вас уже есть пользователи с `telegramId`, но нет email.

**Решение:**
- Создать временные email: `user_${telegramId}@temp.com`
- При первом входе в mobile app попросить ввести реальный email
- Или: добавить API endpoint для "связывания" аккаунтов

### 2. **Синхронизация корзины и избранного**
**Проблема:** Пользователь может использовать оба приложения.

**Решение:**
- Хранить всё на сервере (уже так)
- При логине загружать актуальное состояние

### 3. **Push уведомления**
**Проблема:** В Telegram Mini App уведомления через бота, в mobile app - FCM/APNs.

**Решение:**
- Добавить таблицу `PushTokens` в БД
- При логине сохранять FCM token
- Бэкенд отправляет уведомления через Firebase Cloud Messaging

### 4. **Оплата заказов**
**Проблема:** Telegram Payments не работает в mobile app.

**Решение:**
- Интегрировать Stripe / PayPal / ЮKassa
- Или: просто контактные данные + оплата при получении

### 5. **Изображения и CDN**
**Проблема:** Cloudinary используется для загрузки фото админом.

**Решение:**
- Оставить Cloudinary (уже настроено)
- В mobile app использовать `expo-image-picker` для выбора фото
- Загружать через тот же API endpoint

---

## 🎓 Обучающие ресурсы

### Capacitor:
- [Capacitor Docs](https://capacitorjs.com/docs) - официальная документация
- [Capacitor Android Guide](https://capacitorjs.com/docs/android) - работа с Android Studio
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins) - список плагинов
- [Capacitor Tutorial](https://www.youtube.com/watch?v=K7ghUiXLef8) - видео туториал

### JWT Auth:
- [JWT.io](https://jwt.io/introduction) - что такое JWT
- [Node.js JWT Tutorial](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs)

### React + Vite:
- [Vite Guide](https://vitejs.dev/guide/) - быстрый bundler
- [React Router](https://reactrouter.com/en/main) - роутинг

### Android Studio:
- [Android Studio Basics](https://developer.android.com/studio/intro) - основы работы
- [Build APK](https://developer.android.com/studio/run) - как собрать APK

---

## ✅ Чеклист готовности к запуску

### Backend:
- [ ] JWT auth работает
- [ ] Все endpoints обновлены
- [ ] Миграция БД выполнена
- [ ] Email отправка настроена (если нужно)
- [ ] Tests passed
- [ ] Задеплоено на сервер

### Mobile:
- [ ] Auth flow работает
- [ ] Все экраны реализованы
- [ ] Gestures работают плавно
- [ ] Images загружаются быстро
- [ ] Нет memory leaks
- [ ] Работает на Android
- [ ] Работает на iOS (если нужно)
- [ ] APK собран

### Documentation:
- [ ] API документация обновлена
- [ ] README.md обновлен
- [ ] Инструкции по запуску mobile app
- [ ] Screenshots добавлены

---

## 🚀 Следующие шаги

После завершения миграции:

1. **Marketing:**
   - Публикация в Google Play Store
   - Публикация в App Store (опционально)
   - Landing page для веб-версии

2. **Features:**
   - Push уведомления о новых товарах
   - Персональные рекомендации
   - Wishlist публичный (share с друзьями)
   - Промокоды и скидки

3. **Analytics:**
   - Google Analytics / Firebase Analytics
   - Отслеживание конверсии
   - A/B тестирование

4. **Monetization:**
   - Платная доставка
   - Premium subscription
   - Комиссия с продаж

---

## 📝 Заметки

- Capacitor позволяет писать на TypeScript и открывать в Android Studio
- Можно сохранить Telegram Mini App и запустить mobile app параллельно
- Весь код из `frontend/` переиспользуется почти без изменений
- ProductCard со свайпом уже готов и будет работать в WebView
- Если понадобятся нативные функции - можно написать Capacitor плагин на Kotlin

---

## 🏁 Быстрый старт (для нового проекта в Android Studio директории)

### Шаг 1: Создать Capacitor проект
```bash
# В той директории где ты уже скопировал файлы от Android Studio
npm create vite@latest mobile-app -- --template react-ts
cd mobile-app
npm install

# Установить Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
# Введи:
# App name: Vintage Shop
# Package ID: com.vintageshop.app

# Добавить Android платформу
npx cap add android
```

### Шаг 2: Скопировать код из frontend/
```bash
# Из корня репозитория
cp -r frontend/src/components mobile-app/src/
cp -r frontend/src/api mobile-app/src/
cp -r frontend/src/hooks mobile-app/src/
cp -r frontend/src/utils mobile-app/src/
cp -r frontend/src/styles mobile-app/src/
cp frontend/tailwind.config.js mobile-app/
cp frontend/postcss.config.js mobile-app/
```

### Шаг 3: Установить зависимости
```bash
cd mobile-app
npm install react-router-dom axios @capacitor/storage @capacitor/haptics @capacitor/status-bar
npm install tailwindcss postcss autoprefixer
```

### Шаг 4: Удалить Telegram зависимости
```bash
# Удали эти файлы:
rm src/hooks/useTelegram.ts
rm src/utils/telegram.ts

# В компонентах замени useTelegram на обычный React state или Context
```

### Шаг 5: Собрать и открыть в Android Studio
```bash
npm run build
npx cap sync
npx cap open android
# Откроется Android Studio!
```

### Шаг 6: Запустить в эмуляторе
В Android Studio:
- **Run → Run 'app'**
- Или нажми **Shift+F10**

Готово! Приложение запустится в Android эмуляторе или на подключенном устройстве.

---

**Создано:** 2025-10-24
**Автор:** Claude Code
**Версия:** 2.0 (Capacitor)
