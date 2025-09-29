# Полное руководство по развертыванию проекта

## Текущее состояние
У вас проект успешно развернут на сервере:
- ✅ Backend контейнер запущен на порту 3001
- ✅ Frontend контейнер запущен на порту 3000
- ✅ Все зависимости установлены
- ✅ Docker-compose работает

## Что делать дальше

### 1. Проверить работу приложения

```bash
# Проверить API
curl http://localhost:3001/api/health

# Проверить фронтенд
curl http://localhost:3000

# Посмотреть логи (если что-то не работает)
docker-compose logs backend
docker-compose logs frontend
```

### 2. Настроить доступ извне (если нужен внешний доступ)

#### Вариант A: Через nginx (рекомендуемый)

```bash
# Установить nginx
sudo apt update
sudo apt install nginx -y

# Создать конфиг сайта
sudo nano /etc/nginx/sites-available/vintage-shop
```

Вставить в файл:
```nginx
server {
    listen 80;
    server_name ваш-домен.com;  # Замените на ваш домен или IP

    # Фронтенд
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активировать конфиг
sudo ln -s /etc/nginx/sites-available/vintage-shop /etc/nginx/sites-enabled/

# Удалить дефолтный конфиг (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверить конфиг
sudo nginx -t

# Перезапустить nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Проверить статус
sudo systemctl status nginx
```

#### Вариант B: Открыть порты напрямую (НЕ рекомендуется для продакшена)

```bash
# Проверить файрвол
sudo ufw status

# Открыть порты
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw reload
```

### 3. Настроить SSL (HTTPS) - для продакшена

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить SSL сертификат (замените домен)
sudo certbot --nginx -d ваш-домен.com

# Проверить автообновление
sudo certbot renew --dry-run
```

### 4. Управление проектом

#### Остановить проект
```bash
cd /var/www/my-vintage-shop
docker-compose down
```

#### Запустить проект
```bash
cd /var/www/my-vintage-shop
docker-compose up -d
```

#### Обновить проект (после изменений в коде)
```bash
cd /var/www/my-vintage-shop

# Остановить
docker-compose down

# Пересобрать
docker-compose build --no-cache

# Запустить
docker-compose up -d
```

#### Посмотреть логи
```bash
# Все логи
docker-compose logs

# Только backend
docker-compose logs backend

# Только frontend
docker-compose logs frontend

# В реальном времени
docker-compose logs -f
```

#### Посмотреть статус
```bash
docker-compose ps
```

### 5. Мониторинг и отладка

#### Проверить ресурсы
```bash
# Использование Docker
docker stats

# Использование диска
df -h

# Память и CPU
htop
# или
top
```

#### Очистка (если место заканчивается)
```bash
# Очистить Docker кеш
docker system prune -f

# Очистить все неиспользуемые образы
docker image prune -a -f

# Очистить логи
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### 6. Резервное копирование

#### Создать бэкап базы данных
```bash
cd /var/www/my-vintage-shop

# Создать папку для бэкапов
mkdir -p backups

# Скопировать базу данных
docker-compose exec backend cp /app/prisma/dev.db /tmp/backup.db
docker cp $(docker-compose ps -q backend):/tmp/backup.db ./backups/db-$(date +%Y%m%d-%H%M%S).db
```

#### Восстановить базу данных
```bash
# Остановить контейнеры
docker-compose down

# Заменить файл базы (замените BACKUP_FILE на имя файла)
docker run --rm -v my-vintage-shop_database:/data -v $(pwd)/backups:/backup alpine cp /backup/BACKUP_FILE /data/dev.db

# Запустить обратно
docker-compose up -d
```

## Решение проблем

### Если контейнеры не запускаются
```bash
# Посмотреть ошибки
docker-compose logs

# Пересобрать с нуля
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Если порты заняты
```bash
# Найти процессы на портах
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Убить процесс (замените PID)
sudo kill -9 PID
```

### Если не хватает места
```bash
# Очистить Docker
docker system prune -a -f
docker volume prune -f

# Очистить npm cache
npm cache clean --force

# Очистить логи системы
sudo journalctl --vacuum-time=3d
```

## Итог

**Ваш проект работает!** 🎉

- Фронтенд: http://localhost:3000 (или через nginx на 80 порту)
- API: http://localhost:3001
- Все функции реализованы: темы, Telegram интеграция, фильтрация, корзина

Если настроили nginx, то приложение доступно по вашему домену/IP адресу.

---

## ВАЖНО: Исправление ошибки backend контейнера

Если backend не запускается и выдает ошибку:
```
npm error The `npm ci` command can only install with an existing package-lock.json
```

И curl на порт 3001 не работает:
```bash
curl: (7) Failed to connect to localhost port 3001 after 0 ms: Couldn't connect to server
```

**Это НЕ нормально!** Backend не запустился.

### Быстрое исправление:

```bash
# 1. Остановить все
docker-compose down

# 2. Перейти в backend и создать package-lock.json
cd backend
npm install
ls -la package-lock.json

# 3. Вернуться в корень
cd ..

# 4. Пересобрать backend с нуля
docker-compose build --no-cache backend

# 5. Запустить все заново
docker-compose up -d

# 6. Проверить статус (должны быть ОБА контейнера Up)
docker-compose ps

# 7. Проверить логи backend
docker-compose logs backend

# 8. Проверить API
curl http://localhost:3001/api/health
```

### Если все равно не работает - запуск без Docker:

```bash
# Остановить Docker контейнеры
docker-compose down

# Запустить backend напрямую
cd backend
npm run db:generate
npm run db:migrate
npm run start &

# Frontend уже работает на порту 3000
# API будет на порту 3001
```

### Признаки успеха:
- `docker-compose ps` показывает оба контейнера со статусом "Up"
- `curl http://localhost:3001/api/health` возвращает ответ
- `curl http://localhost:3000` возвращает HTML фронтенда

Без работающего backend'а фронтенд будет статичным без данных из API.