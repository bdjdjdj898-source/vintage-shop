# My Vintage Shop - Telegram Mini App

A Telegram Mini-App for a vintage shop that allows users to browse and purchase vintage items through Telegram's WebApp interface.

## Tech Stack

- **Frontend**: React 19 + Vite 7 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: SQLite + Prisma ORM
- **Integration**: Telegram WebApp API + Bot API
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- npm 8+
- Docker and Docker Compose (for containerized deployment)

### Environment Variables

Create a `.env` file in the project root with the following required variables:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=file:./database.db
PORT=3000
NODE_ENV=development
ADMIN_TELEGRAM_IDS=your_admin_telegram_id
```

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   This starts both frontend (port 5173) and backend (port 3000) in development mode.

### Docker Deployment

1. **Build and start all services:**
   ```bash
   docker compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000

3. **Health check:**
   ```bash
   curl http://localhost:3000/health
   ```

### Other Commands

- `npm run build` - Build both frontend and backend
- `npm run lint` - Run ESLint on both workspaces
- `npm run db:reset` - Reset database and run migrations
- `docker compose down` - Stop Docker containers

## Project Structure

```
my-vintage-shop/
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend
├── prisma/            # Database schema and migrations
├── Dockerfile.frontend    # Frontend Docker configuration
├── Dockerfile.backend     # Backend Docker configuration
└── docker-compose.yml     # Container orchestration
```

## Features

- Telegram WebApp authentication
- Product catalog with filtering
- Shopping cart management
- Order processing
- Admin panel for product management
- Mobile-first responsive design
- Role-based access control

## API Endpoints

- `GET /health` - Health check (no auth required)
- `GET /api/products` - Product catalog
- `GET /api/cart` - User's shopping cart (auth required)
- `POST /api/orders` - Create order (auth required)
- `/api/admin/*` - Admin endpoints (admin role required)
