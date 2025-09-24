#!/bin/bash

# ПОЛУЧЕНИЕ SSL СЕРТИФИКАТА

echo "🔒 ПОЛУЧАЕМ SSL СЕРТИФИКАТ ДЛЯ egorloh.duckdns.org"
echo ""

# Проверяем что домен резолвится правильно
echo "✅ Проверяем DNS:"
nslookup egorloh.duckdns.org | grep -A2 "Non-authoritative answer:"
echo ""

# Установка certbot
echo "📦 Устанавливаем Certbot:"
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
echo ""

# Получение SSL сертификата
echo "🔐 Получаем SSL сертификат от Let's Encrypt:"
sudo certbot --nginx -d egorloh.duckdns.org --non-interactive --agree-tos --email admin@egorloh.duckdns.org

# Автообновление сертификатов
echo ""
echo "🔄 Настраиваем автообновление:"
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Проверяем статус
echo ""
echo "✅ ПРОВЕРЯЕМ РЕЗУЛЬТАТ:"
sudo certbot certificates
echo ""

# Тестируем HTTPS
echo "🧪 Тестируем HTTPS:"
curl -I https://egorloh.duckdns.org/health
echo ""

echo "✅ ГОТОВО!"
echo ""
echo "🌐 Ваш HTTPS сайт: https://egorloh.duckdns.org"
echo ""
echo "🤖 НАСТРОЙКА TELEGRAM БОТА:"
echo ""
echo "1️⃣ Откройте @BotFather в Telegram"
echo ""
echo "2️⃣ Настройте Menu Button:"
echo "/setmenubutton"
echo "- Выберите вашего бота"
echo "- Текст: 🛍️ Открыть магазин"
echo "- URL: https://egorloh.duckdns.org"
echo ""
echo "3️⃣ ИЛИ создайте Web App:"
echo "/newapp"
echo "- Выберите бота"
echo "- Title: Vintage Shop"
echo "- Description: Винтажный магазин"
echo "- URL: https://egorloh.duckdns.org"
echo "- Short name: vintage"
echo ""
echo "4️⃣ Настройте команды (опционально):"
echo "/setcommands"
echo "start - 🚀 Запустить магазин"
echo "shop - 🛍️ Открыть каталог"
echo ""
echo "⚠️ ВАЖНО:"
echo "- НЕ открывайте сайт в обычном браузере!"
echo "- Заходите ТОЛЬКО через Telegram бота"
echo "- Нажимайте кнопку меню в боте"
echo ""
echo "🎉 После настройки бота - магазин заработает в Telegram!"
echo ""
echo "🔄 ОБНОВЛЕНИЕ ПРИЛОЖЕНИЯ С ИСПРАВЛЕНИЯМИ:"
echo "cd /var/www/my-vintage-shop"
echo "git pull"
echo "npm run build"
echo "sudo systemctl restart vintage-shop"
echo ""
echo "✅ После обновления - приложение должно работать в Telegram!"