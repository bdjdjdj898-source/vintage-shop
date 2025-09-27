# Vintage Shop - Telegram Mini-App

A modern Telegram Mini-App for selling vintage and premium items with React frontend and Node.js backend.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))

### Environment Setup

1. Copy the environment file and configure your values:
```bash
cp .env.example .env
```

2. Edit `.env` and set your Telegram Bot Token and other variables:
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-bot-token-here
ADMIN_TELEGRAM_IDS=your-telegram-id

# Database (PostgreSQL) - Auto-configured for Docker
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vintage_shop?schema=public"

# Cloudinary Configuration (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Running with Docker Compose

1. Build and start all services:
```bash
docker-compose up --build
```

2. The application will be available at:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

### Database Setup

The PostgreSQL database will be automatically set up with Docker Compose. The backend will run migrations on startup.

To manually run database operations:
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local installation or Docker)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up your local PostgreSQL database and update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vintage_shop?schema=public"
```

3. Run database setup:
```bash
npm run db:generate
npm run db:migrate
```

4. Start development servers:
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend    # Backend on http://localhost:3000
```

## 📚 Project Structure

```
my-vintage-shop/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript
├── prisma/            # Database schema and migrations
├── docker-compose.yml # Container orchestration
├── .env.example       # Environment variables template
└── README.md          # This file
```

## 🗄️ Database Choice: PostgreSQL vs SQLite

We chose **PostgreSQL** over SQLite for the following reasons:

- **Concurrency**: Better support for multiple simultaneous users
- **Analytics**: Advanced query capabilities for admin analytics
- **Scalability**: More reliable scaling as the user base grows
- **Production Ready**: Better suited for production deployments
- **ACID Compliance**: Stronger data consistency guarantees
- **Full-text Search**: Built-in search capabilities for products

While SQLite would work for a small-scale application, PostgreSQL provides better long-term sustainability for a growing e-commerce platform.

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development
- `npm run build` - Build both frontend and backend
- `npm run lint` - Run ESLint on both workspaces
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database (development only)

### Docker Commands
- `npm run docker:build` - Build Docker containers
- `npm run docker:up` - Start application with Docker Compose
- `npm run docker:down` - Stop Docker containers

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `TELEGRAM_BOT_TOKEN` | Bot token from BotFather | `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11` |
| `ADMIN_TELEGRAM_IDS` | Comma-separated admin user IDs | `123456789,987654321` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (optional) | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key (optional) | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (optional) | `your-api-secret` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend server port | `3000` |

## 🚀 Deployment

1. Set up your production environment variables
2. Use Docker Compose for production deployment:
```bash
docker-compose -f docker-compose.yml up -d
```

3. The application includes health checks and proper container orchestration

### TLS/CORS in Production

In production, TLS is terminated at a reverse proxy (e.g., Nginx/Traefik/Caddy) and the backend is not exposed publicly. If `CORS_ORIGINS` is omitted, CORS is disabled and the app must be served same-origin via reverse proxy.

#### HTTPS Configuration

For production deployment with HTTPS:

1. **Reverse Proxy Setup**: Use nginx, Traefik, or Caddy to handle TLS termination
2. **SSL Certificates**: Obtain certificates via Let's Encrypt or your certificate provider
3. **Sample Configuration**: See `docs/deploy/nginx-https.conf` for a complete nginx HTTPS setup
4. **Security Headers**: The reverse proxy should handle security headers including CSP

#### Content Security Policy (CSP)

CSP can be configured at the reverse proxy level or optionally in the backend:

- **Reverse Proxy (Recommended)**: Add CSP headers in nginx/apache config
- **Backend Option**: Uncomment the CSP configuration in `backend/src/server.ts`
- **Telegram Compatibility**: Ensure CSP allows necessary Telegram domains

The provided CSP configuration is compatible with Telegram WebApp requirements.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.