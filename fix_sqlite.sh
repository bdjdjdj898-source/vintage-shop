#!/bin/bash

# Скрипт для исправления конфликта git и деплоя проекта
set -e

echo "🔧 Исправляем конфликт с backend/.env и подтягиваем изменения..."

# Отменяем изменения в backend/.env
echo "📝 Отменяем изменения в backend/.env..."
git checkout backend/.env

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
echo "Теперь запускаем деплой..."
echo ""

# Делаем скрипт деплоя исполняемым
chmod +x quick-deploy.sh

# Запускаем деплой
./quick-deploy.sh
