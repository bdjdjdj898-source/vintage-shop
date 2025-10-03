#!/bin/bash

echo "🔍 Проверяем nginx на сервере..."
echo ""

echo "1️⃣ Статус nginx:"
sudo systemctl status nginx --no-pager || echo "nginx не установлен"
echo ""

echo "2️⃣ Конфигурация nginx для приложения:"
if [ -f /etc/nginx/sites-enabled/vintage-shop ]; then
    cat /etc/nginx/sites-enabled/vintage-shop
elif [ -f /etc/nginx/conf.d/vintage-shop.conf ]; then
    cat /etc/nginx/conf.d/vintage-shop.conf
else
    echo "Конфигурация для приложения НЕ НАЙДЕНА"
fi
echo ""

echo "3️⃣ Все конфигурации nginx:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Папка sites-enabled не найдена"
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "Папка conf.d не найдена"
echo ""

echo "4️⃣ DuckDNS IP:"
nslookup egorloh.duckdns.org | grep "Address:" | tail -1
echo ""

echo "5️⃣ IP адрес сервера:"
curl -s ifconfig.me
echo ""
