# Инструкция по деплою на сервер

## Быстрый старт

### 1. Подключитесь к серверу
```bash
ssh root@185.177.216.22
```

### 2. Перейдите в директорию проекта
```bash
cd /var/www/my-vintage-shop
```

### 3. Запустите скрипт быстрого деплоя
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

Скрипт автоматически:
- Проверит наличие Docker
- Настроит .env файлы
- Пересоберет все образы с нуля
- Запустит контейнеры
- Покажет статус и логи

## Ручной деплой (если нужен больший контроль)

### 1. Остановите старые контейнеры
```bash
docker-compose down
```

### 2. Пересоберите backend
```bash
docker-compose build --no-cache backend
```

### 3. Пересоберите frontend
```bash
docker-compose build --no-cache frontend
```

### 4. Запустите контейнеры
```bash
docker-compose up -d
```

### 5. Проверьте статус
```bash
docker-compose ps
```

### 6. Посмотрите логи
```bash
docker-compose logs -f backend
```

## Решение проблем

### Backend не запускается

1. **Проверьте логи:**
```bash
docker-compose logs backend
```

2. **Проверьте .env файл:**
```bash
cat backend/.env
```

Должен содержать:
- `DATABASE_URL="file:./database.db"`
- `TELEGRAM_BOT_TOKEN=ваш_токен`
- `ADMIN_TELEGRAM_IDS=ваш_id`

3. **Проверьте schema.prisma:**
```bash
head -10 prisma/schema.prisma
```

Должно быть `provider = "sqlite"`

### TypeScript ошибки при сборке

Все TypeScript ошибки уже исправлены в коде. Если видите ошибки:

1. Убедитесь что используете актуальную версию из GitHub
2. Проверьте что сборка идет с Node.js 20 (не 18)

### Prisma ошибки

Если видите ошибки с Prisma:
```bash
# Зайдите в контейнер
docker-compose exec backend sh

# Выполните команды вручную
cd /app/backend
npx prisma generate --schema=../prisma/schema.prisma
npx prisma db push --schema=../prisma/schema.prisma
```

## Проверка работоспособности

### 1. Проверьте что контейнеры запущены
```bash
docker-compose ps
```

Все контейнеры должны быть в статусе `Up`

### 2. Проверьте API
```bash
curl http://localhost:3002/api/health
```

Должен вернуть JSON с health status

### 3. Проверьте Frontend
```bash
curl http://localhost:3003
```

Должен вернуть HTML страницу

## Полезные команды

```bash
# Посмотреть логи всех сервисов
docker-compose logs

# Посмотреть логи только backend
docker-compose logs -f backend

# Перезапустить только backend
docker-compose restart backend

# Зайти внутрь контейнера backend
docker-compose exec backend sh

# Остановить все
docker-compose down

# Удалить все включая volumes
docker-compose down -v

# Посмотреть использование ресурсов
docker stats
```

## После успешного деплоя

Ваше приложение будет доступно по адресу:
- **Frontend**: http://185.177.216.22:3003
- **Backend API**: http://185.177.216.22:3002

## Обновление кода

Когда нужно задеплоить новые изменения:

```bash
cd /var/www/my-vintage-shop
git pull origin main
./quick-deploy.sh
```

## Мониторинг

Рекомендуется периодически проверять:

```bash
# Логи ошибок
docker-compose logs backend | grep -i error

# Использование диска
df -h

# Использование памяти
free -h

# Запущенные процессы
docker-compose ps
```
