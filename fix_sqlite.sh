#!/bin/bash

# Простой скрипт для деплоя изменений
set -e

echo "🚀 Применяем изменения..."

cd /var/www/my-vintage-shop

git pull origin main

./quick-deploy.sh

echo ""
echo "✅ Готово! Проверьте приложение в Telegram"
