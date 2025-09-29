# Deployment Guide - Deploy to Cloud

После исправления TypeScript ошибок и настройки приложения для работы с SQLite, вот что нужно сделать для развертывания на облачном сервере.

## Что изменилось после исправлений

1. ✅ Исправлены все TypeScript ошибки компиляции
2. ✅ Обновлена система типов для Request/Response
3. ✅ Настроена работа с SQLite (JSON поля → String поля)
4. ✅ Приложение собирается и запускается локально

## Развертывание на облачном сервере

### Шаг 1: Подготовка файлов на сервере

```bash
# Остановить все текущие контейнеры
docker-compose down

# Обновить код из репозитория или скопировать измененные файлы
# Если используете git:
git pull origin main

# Или скопировать измененные файлы:
# - backend/src/routes/*.ts (исправленные типы)
# - backend/src/types/auth.ts (новые helper функции)
# - backend/src/utils/normalize.ts (поддержка JSON строк)
# - backend/tsconfig.json (добавлен downlevelIteration)
# - prisma/schema.prisma (Json → String для SQLite)
```

### Шаг 2: Выбор базы данных

#### Вариант A: Остаться с SQLite (проще)
```bash
# Убедиться что используется SQLite в schema.prisma
sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

# Обновить DATABASE_URL в backend/.env
echo 'DATABASE_URL="file:./database.db"' > backend/.env
echo 'TELEGRAM_BOT_TOKEN=ваш_токен' >> backend/.env
echo 'ADMIN_TELEGRAM_IDS=ваш_id' >> backend/.env
echo 'NODE_ENV=production' >> backend/.env
echo 'PORT=3000' >> backend/.env
```

#### Вариант B: Использовать PostgreSQL (рекомендуется)
```bash
# Убедиться что используется PostgreSQL в schema.prisma
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# Обновить DATABASE_URL в backend/.env
echo 'DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vintage_shop?schema=public"' > backend/.env
echo 'TELEGRAM_BOT_TOKEN=ваш_токен' >> backend/.env
echo 'ADMIN_TELEGRAM_IDS=ваш_id' >> backend/.env
echo 'NODE_ENV=production' >> backend/.env
echo 'PORT=3000' >> backend/.env

# Запустить PostgreSQL контейнер
docker run -d --name postgres-vintage -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vintage_shop \
  postgres:15-alpine
```

### Шаг 3: Пересобрать контейнеры

```bash
# Пересобрать backend с исправлениями
docker-compose build --no-cache backend

# Пересобрать frontend
docker-compose build --no-cache frontend

# Проверить что образы собрались
docker images | grep vintage
```

### Шаг 4: Обновить базу данных

#### Для SQLite:
```bash
# Сгенерировать Prisma клиент
cd backend && npm run db:generate

# Создать/обновить базу данных
cd backend && npx prisma db push --schema=../prisma/schema.prisma
```

#### Для PostgreSQL:
```bash
# Сгенерировать Prisma клиент
cd backend && npm run db:generate

# Запустить миграции
cd backend && npx prisma migrate deploy --schema=../prisma/schema.prisma
```

### Шаг 5: Запустить приложение

```bash
# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Должно быть:
# - backend: Up
# - frontend: Up
# - postgres: Up (если используете PostgreSQL)
```

### Шаг 6: Проверить работу

```bash
# Проверить логи
docker-compose logs backend --tail 20
docker-compose logs frontend --tail 20

# Проверить API
curl http://localhost:3002/api/health

# Ожидаемый ответ:
# {"status":"ok","db":"up","timestamp":"...","uptime":...}

# Проверить frontend
curl http://localhost:3003
```

### Шаг 7: Настроить Nginx (если нужно)

```bash
# Обновить конфиг nginx
sudo nano /etc/nginx/sites-available/vintage-shop
```

Содержимое:
```nginx
server {
    listen 80;
    server_name ваш-домен-или-ip;

    location / {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Перезапустить nginx
sudo nginx -t
sudo systemctl reload nginx
```

## Возможные проблемы и решения

### Проблема: TypeScript ошибки при сборке
```bash
# Проверить что файлы обновились
docker-compose build --no-cache backend
docker-compose logs backend
```

### Проблема: База данных не подключается
```bash
# Для SQLite - проверить права доступа
ls -la backend/database.db

# Для PostgreSQL - проверить контейнер
docker ps | grep postgres
docker logs postgres-vintage
```

### Проблема: Frontend не загружается
```bash
# Проверить переменные окружения
cat frontend/.env

# Должно быть:
# VITE_API_URL=http://ваш-домен-или-ip:3002
```

## Финальная проверка

1. ✅ Приложение доступно по http://ваш-ip
2. ✅ API отвечает на http://ваш-ip/api/health
3. ✅ Нет ошибок в логах: `docker-compose logs`
4. ✅ База данных работает (SQLite файл создался или PostgreSQL подключается)
5. ✅ Telegram WebApp работает (если настроен)

## Команды для мониторинга

```bash
# Посмотреть статус всех сервисов
docker-compose ps

# Посмотреть логи в реальном времени
docker-compose logs -f

# Перезапустить только backend
docker-compose restart backend

# Посмотреть использование ресурсов
docker stats

# Очистить старые образы (экономия места)
docker system prune -f
```

Приложение готово к работе в продакшене!