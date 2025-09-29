# Исправление проблемы с портом 3000

## Проблема
Порт 3000 постоянно занят, контейнеры не запускаются:
```
ERROR: failed to bind port 0.0.0.0:3000/tcp: bind: address already in use
```

## Решение - пошагово

### Шаг 1: Полная очистка портов и процессов
```bash
# 1. Найти что занимает порт
sudo netstat -tulpn | grep :3000

# 2. Найти все Node.js процессы
ps aux | grep node

# 3. Убить все Node.js процессы
sudo killall node

# 4. Остановить все Docker контейнеры
docker stop $(docker ps -aq)

# 5. Полная очистка Docker
docker-compose down --remove-orphans --volumes

# 6. Проверить что порты свободны
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

### Шаг 2: Изменить порты в docker-compose.yml
```bash
# 7. Отредактировать файл
nano docker-compose.yml
```

Найти и изменить секции с портами:
```yaml
backend:
  ports:
    - "3002:3000"  # Изменить первое число с 3000 на 3002

frontend:
  ports:
    - "3003:80"    # Изменить первое число на свободный порт
```

### Шаг 3: Запустить с новыми портами
```bash
# 8. Запустить контейнеры
docker-compose up -d

# 9. Проверить статус
docker-compose ps

# 10. Проверить API (новый порт!)
curl http://localhost:3002/api/health

# 11. Проверить фронтенд (новый порт!)
curl http://localhost:3003

# 12. Посмотреть логи если не работает
docker-compose logs backend
docker-compose logs frontend
```

### Шаг 4: Настроить nginx для доступа через обычные порты
```bash
# 13. Установить nginx
sudo apt update && sudo apt install nginx -y

# 14. Создать конфиг
sudo nano /etc/nginx/sites-available/vintage-shop
```

Вставить (используя новые порты):
```nginx
server {
    listen 80;
    server_name ваш-ip-сервера;

    # Фронтенд на порту 80
    location / {
        proxy_pass http://localhost:3003;  # Новый порт фронтенда
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3002;  # Новый порт API
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

```bash
# 15. Активировать nginx
sudo ln -s /etc/nginx/sites-available/vintage-shop /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 16. Проверить через nginx (обычные порты)
curl http://ваш-ip/
curl http://ваш-ip/api/health
```

## Признаки успеха
- ✅ `docker-compose ps` показывает оба контейнера "Up"
- ✅ `curl http://localhost:3002/api/health` возвращает JSON
- ✅ `curl http://localhost:3003` возвращает HTML
- ✅ Сайт работает в браузере по IP сервера через nginx
- ✅ API доступно по адресу http://ваш-ip/api/health

## Альтернатива - запуск без Docker
Если Docker всё равно не работает:
```bash
# 1. Остановить Docker
docker-compose down

# 2. Запустить backend напрямую
cd /var/www/my-vintage-shop/backend
npm install --ignore-scripts
npm run db:generate
npm run db:migrate
npm run start &

# 3. Запустить frontend напрямую
cd /var/www/my-vintage-shop/frontend
npm install
npm run build
npx serve -s dist -l 8080 &

# 4. Настроить nginx на эти порты
# backend: http://localhost:3001
# frontend: http://localhost:8080
```