#!/bin/bash

echo "🔧 Исправление SQLite настроек..."

# Исправить DATABASE_URL в docker-compose.yml для использования SQLite
echo "🐳 Настройка docker-compose.yml для SQLite..."
sed -i 's|DATABASE_URL=postgresql://postgres:postgres@postgres:5432/vintage_shop?schema=public|DATABASE_URL=file:./database.db|' docker-compose.yml

# Проверить что изменилось
echo "✅ Проверка DATABASE_URL в docker-compose.yml:"
cat docker-compose.yml | grep DATABASE_URL

echo ""
echo "🚀 Перезапуск контейнеров..."
docker-compose down
docker-compose up -d

echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "📋 Логи backend (последние 20 строк):"
docker-compose logs backend --tail 20

echo ""
echo "🔍 Проверка API..."
sleep 5
echo "Тестирование API health endpoint:"
curl -s http://localhost:3002/api/health || echo "❌ API не отвечает, проверьте логи"

echo ""
echo "✅ Исправление завершено!"