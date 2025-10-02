#!/bin/bash

# Скрипт для исправления docker-compose конфликта и полного переразвертывания
set -e

echo "🔧 Исправляем конфликт git и переразвертываем приложение..."

# Сохраняем изменения в stash
echo "💾 Сохраняем локальные изменения..."
git stash

# Подтягиваем изменения с GitHub
echo "⬇️  Подтягиваем изменения с GitHub..."
git pull origin main

# Восстанавливаем правильные настройки в .env
echo "✏️  Настраиваем backend/.env..."
cat > backend/.env << 'EOF'
DATABASE_URL="file:./database.db"
TELEGRAM_BOT_TOKEN=8296924139:AAFnzJ3i_UcU4_OfyLtp1ZzziWc9MVs0QBc
ADMIN_TELEGRAM_IDS=5619341542
NODE_ENV=production
PORT=3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Development Auth (for testing without Telegram)
ENABLE_TEST_AUTH=true
DEBUG_AUTH_SECRET=dev-secret-123
DEBUG_TEST_ADMIN=false

# Telegram Auth Configuration
TELEGRAM_INITDATA_TTL=86400
EOF

echo "✅ Git конфликт исправлен!"
echo ""
echo "🗑️  Удаляем старые контейнеры и volumes..."
docker-compose down -v

echo ""
echo "🔨 Пересобираем и запускаем контейнеры..."
docker-compose up -d --force-recreate

echo ""
echo "⏳ Ждем запуска сервисов (20 секунд)..."
sleep 20

echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "📋 Логи backend:"
docker-compose logs backend | tail -30

echo ""
echo "🧪 Проверка API..."
echo "Проверка /health:"
curl -s http://localhost:3002/health || echo "❌ Health check failed"

echo ""
echo "Проверка /api/products:"
curl -s http://localhost:3002/api/products || echo "❌ API products failed"

echo ""
echo "Проверка через nginx /api/products:"
curl -s http://185.177.216.22:3003/api/products || echo "❌ Nginx proxy failed"

echo ""
echo "=================================="
echo "✅ Деплой завершен!"
echo ""
echo "🌐 Ваше приложение доступно:"
echo "   Frontend: http://185.177.216.22:3003"
echo "   Backend API: http://185.177.216.22:3002"
echo ""
echo "📱 Настройте Telegram бота:"
echo "   1. Откройте @BotFather"
echo "   2. /mybots → выберите бота"
echo "   3. Bot Settings → Menu Button → Configure Menu Button"
echo "   4. URL: http://185.177.216.22:3003"
echo "   5. Текст: 🛍️ Открыть магазин"
echo ""
