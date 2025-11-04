# ER-модель базы данных Vintage Shop

## Обзор

Полная модель данных для магазина винтажной одежды с 10 таблицами, включающая управление пользователями, товарами, заказами, корзинами и аналитикой.

---

## Таблицы и их описание

### 1. **users** (Пользователи)

**Назначение**: Хранение информации о пользователях Telegram WebApp

**Первичный ключ**: id (INT, AUTO_INCREMENT)

**Уникальные поля**: telegramId (STRING, UNIQUE)

**Поля**:
- id - INT, PK, AUTO_INCREMENT - Внутренний ID пользователя
- telegramId - STRING, UNIQUE, NOT NULL - ID пользователя в Telegram
- username - STRING, NULLABLE - Username в Telegram (@username)
- firstName - STRING, NULLABLE - Имя пользователя
- lastName - STRING, NULLABLE - Фамилия пользователя
- avatarUrl - STRING, NULLABLE - URL аватара из Telegram
- role - STRING, DEFAULT user - Роль (user | admin)
- isBanned - BOOLEAN, DEFAULT false - Флаг блокировки
- createdAt - DATETIME, DEFAULT NOW() - Дата регистрации
- updatedAt - DATETIME, AUTO_UPDATE - Дата последнего обновления

**Связи**:
- orders → ONE-TO-MANY → orders - Один пользователь может иметь много заказов
- cart → ONE-TO-ONE → carts - У каждого пользователя одна корзина
- favorites → ONE-TO-MANY → favorites - Один пользователь может иметь много избранных товаров
- searchHistory → ONE-TO-MANY → search_history - Один пользователь может иметь много записей поиска

---

[Continue with rest of tables...]
