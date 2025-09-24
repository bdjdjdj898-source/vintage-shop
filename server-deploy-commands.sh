#!/bin/bash

# Скрипт для деплоя винтажного магазина на сервере
# Выполняйте команды по порядку

echo "🚀 Начинаем деплой винтажного магазина..."

# 1. Генерация Prisma клиента
echo "📦 Генерация Prisma клиента..."
cd /var/www/my-vintage-shop
npx prisma generate

# 2. Сборка фронтенда
echo "🏗️ Сборка фронтенда..."
cd /var/www/my-vintage-shop/frontend
npm install @tailwindcss/postcss --save-dev
npm run build

# 3. Настройка backend для статических файлов
echo "⚙️ Настройка backend для отдачи статических файлов..."
cd /var/www/my-vintage-shop/backend/src

# Проверяем есть ли уже настройка статики
if ! grep -q "express.static" server.ts; then
    echo "📝 Добавляем код для отдачи статических файлов..."

    # Добавляем import path если его нет
    if ! grep -q "import path from 'path'" server.ts; then
        sed -i "/import dotenv from 'dotenv';/a import path from 'path';" server.ts
    fi

    # Добавляем код для статических файлов перед API роутами
    sed -i '/\/\/ API routes/i \
// Serve static files from frontend build\
if (process.env.NODE_ENV === "production") {\
  const frontendPath = path.join(__dirname, "../../frontend/dist");\
  app.use(express.static(frontendPath));\
\
  // Fallback for SPA - все неизвестные роуты отправляем на index.html\
  app.get("*", (req, res, next) => {\
    // Исключаем API роуты\
    if (req.path.startsWith("/api/")) {\
      return next();\
    }\
    res.sendFile(path.join(frontendPath, "index.html"));\
  });\
}\
' server.ts

    echo "✅ Код для статических файлов добавлен"
else
    echo "ℹ️ Код для статических файлов уже существует"
fi

# 4. Сборка бэкенда
echo "🏗️ Сборка бэкенда..."
cd /var/www/my-vintage-shop/backend
npm run build

# 5. Запуск миграций базы данных
echo "🗄️ Запуск миграций базы данных..."
cd /var/www/my-vintage-shop
npx prisma migrate deploy

# 6. Настройка systemd сервиса
echo "⚙️ Настройка systemd сервиса..."

# Если файл не существует, создаем его
if [ ! -f /etc/systemd/system/vintage-shop.service ]; then
    echo "📝 Создаем systemd сервис файл..."
    sudo tee /etc/systemd/system/vintage-shop.service > /dev/null << 'EOF'
[Unit]
Description=Vintage Shop Telegram WebApp
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/my-vintage-shop
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
    echo "✅ Systemd сервис файл создан"
fi

# Перезагружаем systemd конфигурацию
sudo systemctl daemon-reload

# Запускаем сервис
sudo systemctl start vintage-shop

# Включаем автозапуск
sudo systemctl enable vintage-shop

# 7. Настройка Nginx
echo "🌐 Настройка Nginx..."

# Проверяем установлен ли Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Устанавливаем Nginx..."
    sudo apt update
    sudo apt install nginx -y
fi

# Создаем необходимые папки если их нет
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Добавляем включение sites-enabled в основной конфиг если его нет
sudo bash -c 'grep -q "include /etc/nginx/sites-enabled/" /etc/nginx/nginx.conf || sed -i "/http {/a\\    include /etc/nginx/sites-enabled/*;" /etc/nginx/nginx.conf'

# Если конфиг не существует, создаем его
if [ ! -f /etc/nginx/sites-available/vintage-shop ]; then
    echo "📝 Создаем Nginx конфиг..."
    sudo tee /etc/nginx/sites-available/vintage-shop > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    echo "✅ Nginx конфиг создан"
fi

# Удаляем дефолтный сайт и активируем наш
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/vintage-shop /etc/nginx/sites-enabled/

# Проверяем конфигурацию Nginx
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx

# 8. Проверка работы
echo "🔍 Проверка работы приложения..."

# Проверяем health endpoint
echo "Проверяем health endpoint..."
curl -s http://localhost:3000/health || echo "❌ Health endpoint не отвечает"

# Проверяем главную страницу
echo "Проверяем главную страницу..."
curl -s http://localhost/ | head -c 100

# Проверяем что порты слушаются
echo "Проверяем открытые порты..."
if command -v netstat &> /dev/null; then
    sudo netstat -tlnp | grep :3000
    sudo netstat -tlnp | grep :80
else
    ss -tlnp | grep :3000
    ss -tlnp | grep :80
fi

# Проверяем статус сервисов
echo "📊 Статус сервисов:"
sudo systemctl status vintage-shop --no-pager -l
sudo systemctl status nginx --no-pager -l

echo ""
echo "🌐 Узнайте внешний IP:"
curl -4 icanhazip.com

echo ""
echo "🎯 ФИНАЛЬНАЯ НАСТРОЙКА TELEGRAM БОТА:"
echo "1. Узнайте внешний IP: curl -4 icanhazip.com"
echo "2. Идите к @BotFather в Telegram"
echo "3. Выполните: /setmenubutton"
echo "4. Выберите вашего бота"
echo "5. Текст кнопки: 🛍 Открыть магазин"
echo "6. URL: http://ваш-внешний-ip"

echo ""
echo "✅ ГОТОВО! Ваш винтажный магазин работает!"
echo "🌐 Откройте http://ваш-внешний-ip в браузере для проверки"