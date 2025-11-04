#!/bin/bash

# Скрипт для деплоя на удаленный сервер

SERVER="root@185.177.216.22"
PROJECT_DIR="/var/www/my-vintage-shop"

echo "🚀 Начинаем деплой на сервер..."

# Подключаемся к серверу и выполняем команды
ssh $SERVER << 'ENDSSH'
cd /var/www/my-vintage-shop

echo "📥 Получаем последние изменения из Git..."
git pull origin main

echo "🛑 Останавливаем контейнеры..."
docker-compose down

echo "🔨 Пересобираем backend образ..."
docker-compose build --no-cache backend

echo "🔨 Пересобираем frontend образ..."
docker-compose build --no-cache frontend

echo "🚀 Запускаем контейнеры..."
docker-compose up -d

echo "⏳ Ждем 10 секунд для запуска..."
sleep 10

echo "📊 Статус контейнеров:"
docker-compose ps

echo "📝 Последние логи backend:"
docker-compose logs --tail=20 backend

echo "✅ Деплой завершен!"
echo ""
echo "Приложение доступно по адресу:"
echo "  Frontend: http://185.177.216.22:3003"
echo "  Backend:  http://185.177.216.22:3002"
ENDSSH

echo ""
echo "🎉 Деплой успешно завершен на сервере!"
