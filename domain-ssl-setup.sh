#!/bin/bash

# НАСТРОЙКА SSL ДЛЯ ВАШЕГО ДОМЕНА

echo "🔒 НАСТРОЙКА HTTPS ДЛЯ TELEGRAM WEBAPP"

# Ваш DuckDNS домен
DOMAIN="egorloh.duckdns.org"

echo "Настраиваем SSL для: $DOMAIN"
echo ""

# 1. Обновляем конфигурацию Nginx с доменом
sudo tee /etc/nginx/sites-available/vintage-shop > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # КОРНЕВАЯ ПАПКА - это dist
    root /var/www/my-vintage-shop/frontend/dist;
    index index.html;

    # Статические файлы НАПРЯМУЮ от Nginx
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        try_files \$uri =404;
    }

    # Assets папка НАПРЯМУЮ
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        try_files \$uri =404;
    }

    # API запросы - ТОЛЬКО они идут в Express
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
    }

    # Все остальное - SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
EOF

# 2. Проверяем и перезагружаем Nginx
sudo nginx -t
sudo systemctl reload nginx

# 3. Установка Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 4. Получение SSL сертификата
echo "Получаем SSL сертификат..."
sudo certbot --nginx -d $DOMAIN

# 5. Автообновление сертификатов
sudo systemctl enable certbot.timer

echo ""
echo "✅ ГОТОВО!"
echo ""
echo "🌐 Ваш сайт: https://egorloh.duckdns.org"
echo ""
echo "🤖 В BotFather используйте URL:"
echo "https://egorloh.duckdns.org"
echo ""
echo "🎉 Telegram WebApp готов к работе!"