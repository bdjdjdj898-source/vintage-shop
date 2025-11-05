#!/bin/bash

# Скрипт настройки Nginx для webhook бота

echo "🔧 Настройка Nginx для webhook..."

# Создаем конфигурацию Nginx для webhook
cat > /tmp/telegram-bot-webhook.conf << 'EOF'
server {
    listen 80;
    server_name egorloh.duckdns.org;

    # Редирект на HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name egorloh.duckdns.org;

    # SSL сертификаты (предполагается что certbot уже установил)
    ssl_certificate /etc/letsencrypt/live/egorloh.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/egorloh.duckdns.org/privkey.pem;

    # Webhook endpoint для бота
    location /webhook {
        proxy_pass http://localhost:3001/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend (React app)
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ Конфигурация создана"
echo "📋 Содержимое:"
cat /tmp/telegram-bot-webhook.conf

echo ""
echo "🚀 Для применения конфигурации выполните на сервере:"
echo "   sudo mv /tmp/telegram-bot-webhook.conf /etc/nginx/sites-available/default"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
