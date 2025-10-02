#!/bin/bash

# Быстрый деплой для первоначальной настройки на сервере
set -e

echo "🚀 Быстрый деплой My Vintage Shop"
echo "=================================="

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и Docker Compose."
    exit 1
fi

# Проверка наличия .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Копируем из backend/.env..."
    if [ -f "backend/.env" ]; then
        cp backend/.env .env
    else
        echo "❌ Файл backend/.env не найден. Создайте его вручную."
        exit 1
    fi
fi

# Убедимся что SQLite используется в prisma/schema.prisma
echo "🔧 Проверяем настройки Prisma..."
sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma 2>/dev/null || true

# Останавливаем все контейнеры если есть
echo "⏹️  Останавливаем старые контейнеры..."
docker-compose down 2>/dev/null || true

# Удаляем старые образы
echo "🧹 Очищаем старые образы..."
docker-compose rm -f 2>/dev/null || true

# Собираем образы
echo "🔨 Собираем backend (это может занять несколько минут)..."
docker-compose build --no-cache backend

echo "🔨 Собираем frontend..."
docker-compose build --no-cache frontend

# Запускаем контейнеры
echo "▶️  Запускаем приложение..."
docker-compose up -d

# Ждем запуска
echo "⏳ Ждем запуска сервисов (20 секунд)..."
sleep 20

# Проверяем статус
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

# Показываем логи backend
echo ""
echo "📋 Логи backend:"
docker-compose logs --tail=50 backend

echo ""
echo "=================================="
echo "✅ Деплой завершен!"
echo ""
echo "🌐 Ваше приложение доступно:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3003"
echo "   Backend API: http://$(hostname -I | awk '{print $1}'):3002"
echo ""
echo "📝 Для просмотра логов используйте:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
