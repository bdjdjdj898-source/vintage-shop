#!/bin/bash

echo "🔧 Исправляем nginx proxy на правильный порт Docker backend..."

# Backup текущего конфига
sudo cp /etc/nginx/sites-available/vintage-shop /etc/nginx/sites-available/vintage-shop.backup

# Заменяем localhost:3000 на localhost:3002 (порт Docker backend)
sudo sed -i 's|http://localhost:3000|http://localhost:3002|g' /etc/nginx/sites-available/vintage-shop

echo "📄 Новая конфигурация:"
grep "proxy_pass" /etc/nginx/sites-available/vintage-shop

# Проверяем конфигурацию nginx
echo ""
echo "🧪 Проверяем nginx конфигурацию..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Конфигурация валидна, перезагружаем nginx..."
    sudo systemctl reload nginx
    echo ""
    echo "✅ Готово! Nginx теперь проксирует на порт 3002 (Docker backend)"
    echo ""
    echo "🧪 Проверяем что работает:"
    curl -s http://localhost:3002/health | head -20
else
    echo ""
    echo "❌ Ошибка в конфигурации! Откатываем изменения..."
    sudo cp /etc/nginx/sites-available/vintage-shop.backup /etc/nginx/sites-available/vintage-shop
fi
