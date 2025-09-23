# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Telegram Mini-App for a vintage shop that allows users to browse and purchase vintage items through Telegram's WebApp interface. The project is a monorepo with separate frontend and backend workspaces.

## Common Commands

### Development
- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend development server
- `npm run dev:backend` - Start only backend development server

### Building
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Database Operations
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database and run migrations

### Code Quality
- `npm run lint` - Run ESLint on both frontend and backend
- `npm run lint:frontend` - Lint frontend code only
- `npm run lint:backend` - Lint backend code only

### Docker
- `npm run docker:build` - Build Docker containers
- `npm run docker:up` - Start application in Docker
- `npm run docker:down` - Stop Docker containers

## Project Architecture

### Monorepo Structure
```
my-vintage-shop/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript
├── prisma/            # Database schema and migrations
└── docker-compose.yml # Container orchestration
```

### Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **Key Features**: Telegram WebApp integration, mobile-first design

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Key Features**: Telegram WebApp authentication, REST API

### Database Schema (Prisma)
Key models:
- `User` - Telegram users with role-based access
- `Product` - Vintage items with images, pricing, and metadata
- `Cart` - Server-side cart management
- `Order` - Order processing and tracking
- `CartItem` / `OrderItem` - Relational items

## Development Workflow

### Authentication
The app uses Telegram WebApp authentication exclusively. Users are automatically authenticated through Telegram's initData validation.

### Admin Access
Admin functionality is controlled by user roles in the database. Admin users can:
- Manage products (CRUD operations)
- View and manage orders
- Access analytics

### API Structure
- `/api/products` - Product catalog and management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order creation and tracking
- `/api/admin` - Admin-only endpoints

## Important Files

### Configuration
- `package.json` - Root workspace configuration
- `frontend/package.json` - Frontend dependencies and scripts
- `backend/package.json` - Backend dependencies and scripts
- `prisma/schema.prisma` - Database schema

### Environment Variables
- Root `.env` - Shared configuration
- `backend/.env` - Backend-specific variables (DATABASE_URL, TELEGRAM_BOT_TOKEN)

### Key Source Files
- `frontend/src/App.tsx` - Main React application
- `backend/src/server.ts` - Express server setup
- `backend/src/lib/prisma.ts` - Database client
- `backend/src/middleware/telegramAuth.ts` - Telegram authentication

## Technology Stack

- **Frontend**: React 19, Vite 7, TypeScript 5.8, Tailwind CSS 4
- **Backend**: Node.js 18+, Express 4, TypeScript 5
- **Database**: SQLite with Prisma 5
- **Integration**: Telegram WebApp API, Telegram Bot API
- **Deployment**: Docker with Docker Compose

## Development Notes

### Telegram WebApp Integration
The app is designed specifically for Telegram Mini-Apps and includes:
- Telegram WebApp SDK integration
- Theme adaptation (light/dark mode)
- Mobile-optimized UI
- Telegram-specific authentication flow

### Security Considerations
- All API requests require Telegram WebApp validation
- Role-based access control for admin functions
- Rate limiting and input validation implemented
- SQLite with Prisma for SQL injection protection

### Performance
- Mobile-first responsive design
- Optimized for Telegram's WebApp constraints
- Server-side cart persistence across devices