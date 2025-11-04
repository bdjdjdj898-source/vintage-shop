# ER-МОДЕЛЬ БАЗЫ ДАННЫХ ANDROID-ПРИЛОЖЕНИЯ "VINTAGE SHOP"

## ОПИСАНИЕ ПРОЕКТА
Android-приложение для интернет-магазина винтажных товаров с полным функционалом электронной коммерции, включая управление пользователями, каталогом товаров, заказами, отзывами и аналитикой.

---

## ТАБЛИЦЫ И ИХ ОПИСАНИЕ

### 1. ТАБЛИЦА: Users (Пользователи)
**Назначение**: Хранение информации о зарегистрированных пользователях приложения

**Атрибуты**:
- `user_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор пользователя
- `username` (VARCHAR(50), UNIQUE, NOT NULL) - Имя пользователя для входа
- `email` (VARCHAR(100), UNIQUE, NOT NULL) - Электронная почта
- `password_hash` (VARCHAR(255), NOT NULL) - Хэш пароля
- `phone` (VARCHAR(20), NULL) - Телефон пользователя
- `full_name` (VARCHAR(100), NULL) - Полное имя
- `date_of_birth` (DATE, NULL) - Дата рождения
- `gender` (ENUM('male', 'female', 'other'), NULL) - Пол
- `role` (ENUM('customer', 'admin', 'moderator'), DEFAULT 'customer') - Роль пользователя
- `registration_date` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата регистрации
- `last_login` (TIMESTAMP, NULL) - Последний вход
- `is_active` (BOOLEAN, DEFAULT TRUE) - Активен ли аккаунт
- `profile_image_url` (VARCHAR(255), NULL) - URL аватара
- `fcm_token` (VARCHAR(255), NULL) - Токен для push-уведомлений

**Первичный ключ**: `user_id`

**Связи**:
- **1:M с Orders** - Один пользователь может создать много заказов
- **1:M с Reviews** - Один пользователь может написать много отзывов
- **1:M с Favorites** - Один пользователь может добавить много товаров в избранное
- **1:1 с ShoppingCart** - У одного пользователя одна корзина
- **1:M с Addresses** - У одного пользователя может быть много адресов доставки
- **1:M с Notifications** - Один пользователь получает много уведомлений

---

### 2. ТАБЛИЦА: Categories (Категории товаров)
**Назначение**: Каталог категорий для классификации товаров

**Атрибуты**:
- `category_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор категории
- `category_name` (VARCHAR(100), UNIQUE, NOT NULL) - Название категории
- `parent_category_id` (INT, NULL, FOREIGN KEY → Categories.category_id) - Родительская категория (для подкатегорий)
- `description` (TEXT, NULL) - Описание категории
- `image_url` (VARCHAR(255), NULL) - Изображение категории
- `display_order` (INT, DEFAULT 0) - Порядок отображения
- `is_active` (BOOLEAN, DEFAULT TRUE) - Активна ли категория
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата создания

**Первичный ключ**: `category_id`

**Внешние ключи**:
- `parent_category_id` → `Categories(category_id)` - Рекурсивная связь для иерархии категорий

**Связи**:
- **1:M с Products** - Одна категория содержит много товаров
- **1:M с Categories (рекурсивная)** - Категория может иметь подкатегории

---

### 3. ТАБЛИЦА: Products (Товары)
**Назначение**: Каталог всех доступных товаров в магазине

**Атрибуты**:
- `product_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор товара
- `category_id` (INT, NOT NULL, FOREIGN KEY → Categories.category_id) - Категория товара
- `product_name` (VARCHAR(200), NOT NULL) - Название товара
- `description` (TEXT, NULL) - Подробное описание
- `price` (DECIMAL(10,2), NOT NULL) - Цена товара
- `discount_percentage` (DECIMAL(5,2), DEFAULT 0) - Процент скидки
- `quantity_in_stock` (INT, DEFAULT 0) - Количество на складе
- `sku` (VARCHAR(50), UNIQUE, NOT NULL) - Артикул товара
- `brand` (VARCHAR(100), NULL) - Бренд
- `vintage_year` (INT, NULL) - Год производства (для винтажных вещей)
- `condition` (ENUM('new', 'excellent', 'good', 'fair', 'poor'), NOT NULL) - Состояние товара
- `material` (VARCHAR(100), NULL) - Материал
- `size` (VARCHAR(50), NULL) - Размер
- `color` (VARCHAR(50), NULL) - Цвет
- `weight` (DECIMAL(8,2), NULL) - Вес в граммах
- `is_featured` (BOOLEAN, DEFAULT FALSE) - Рекомендуемый товар
- `view_count` (INT, DEFAULT 0) - Количество просмотров
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата добавления
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) - Дата обновления
- `is_active` (BOOLEAN, DEFAULT TRUE) - Активен ли товар

**Первичный ключ**: `product_id`

**Внешние ключи**:
- `category_id` → `Categories(category_id)` - Связь с категорией

**Связи**:
- **M:1 с Categories** - Много товаров принадлежат одной категории
- **1:M с ProductImages** - Один товар имеет много изображений
- **1:M с OrderItems** - Товар может быть в многих заказах
- **1:M с CartItems** - Товар может быть в многих корзинах
- **1:M с Reviews** - Товар может иметь много отзывов
- **1:M с Favorites** - Товар может быть добавлен в избранное многими пользователями

---

### 4. ТАБЛИЦА: ProductImages (Изображения товаров)
**Назначение**: Хранение множественных изображений для каждого товара

**Атрибуты**:
- `image_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор изображения
- `product_id` (INT, NOT NULL, FOREIGN KEY → Products.product_id) - Товар, которому принадлежит изображение
- `image_url` (VARCHAR(255), NOT NULL) - URL изображения
- `is_primary` (BOOLEAN, DEFAULT FALSE) - Является ли основным изображением
- `display_order` (INT, DEFAULT 0) - Порядок отображения
- `uploaded_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата загрузки

**Первичный ключ**: `image_id`

**Внешние ключи**:
- `product_id` → `Products(product_id)` - Связь с товаром

**Связи**:
- **M:1 с Products** - Много изображений принадлежат одному товару

---

### 5. ТАБЛИЦА: ShoppingCart (Корзина покупок)
**Назначение**: Хранение активных корзин пользователей

**Атрибуты**:
- `cart_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор корзины
- `user_id` (INT, UNIQUE, NOT NULL, FOREIGN KEY → Users.user_id) - Владелец корзины
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата создания корзины
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) - Последнее обновление

**Первичный ключ**: `cart_id`

**Внешние ключи**:
- `user_id` → `Users(user_id)` - Связь с пользователем (UNIQUE - обеспечивает связь 1:1)

**Связи**:
- **1:1 с Users** - У одного пользователя одна активная корзина
- **1:M с CartItems** - Одна корзина содержит много товаров

---

### 6. ТАБЛИЦА: CartItems (Товары в корзине)
**Назначение**: Связующая таблица между корзиной и товарами с количеством

**Атрибуты**:
- `cart_item_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор записи
- `cart_id` (INT, NOT NULL, FOREIGN KEY → ShoppingCart.cart_id) - Корзина
- `product_id` (INT, NOT NULL, FOREIGN KEY → Products.product_id) - Товар
- `quantity` (INT, NOT NULL, DEFAULT 1) - Количество товара
- `added_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата добавления в корзину

**Первичный ключ**: `cart_item_id`

**Внешние ключи**:
- `cart_id` → `ShoppingCart(cart_id)` - Связь с корзиной
- `product_id` → `Products(product_id)` - Связь с товаром

**Уникальные ограничения**:
- UNIQUE(`cart_id`, `product_id`) - Один товар не может быть дважды в одной корзине

**Связи**:
- **M:1 с ShoppingCart** - Много записей принадлежат одной корзине
- **M:1 с Products** - Много записей ссылаются на один товар

---

### 7. ТАБЛИЦА: Orders (Заказы)
**Назначение**: Хранение информации о размещенных заказах

**Атрибуты**:
- `order_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор заказа
- `user_id` (INT, NOT NULL, FOREIGN KEY → Users.user_id) - Покупатель
- `address_id` (INT, NOT NULL, FOREIGN KEY → Addresses.address_id) - Адрес доставки
- `order_number` (VARCHAR(50), UNIQUE, NOT NULL) - Номер заказа (например, ORD-2024-00001)
- `order_status` (ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'), DEFAULT 'pending') - Статус заказа
- `payment_method` (ENUM('card', 'cash', 'online', 'wallet'), NOT NULL) - Способ оплаты
- `payment_status` (ENUM('pending', 'paid', 'failed', 'refunded'), DEFAULT 'pending') - Статус оплаты
- `subtotal` (DECIMAL(10,2), NOT NULL) - Сумма товаров
- `discount_amount` (DECIMAL(10,2), DEFAULT 0) - Сумма скидки
- `shipping_cost` (DECIMAL(10,2), DEFAULT 0) - Стоимость доставки
- `tax_amount` (DECIMAL(10,2), DEFAULT 0) - Сумма налога
- `total_amount` (DECIMAL(10,2), NOT NULL) - Итоговая сумма
- `notes` (TEXT, NULL) - Примечания к заказу
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата создания заказа
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) - Последнее обновление
- `estimated_delivery_date` (DATE, NULL) - Ожидаемая дата доставки
- `actual_delivery_date` (DATE, NULL) - Фактическая дата доставки

**Первичный ключ**: `order_id`

**Внешние ключи**:
- `user_id` → `Users(user_id)` - Связь с покупателем
- `address_id` → `Addresses(address_id)` - Связь с адресом доставки

**Связи**:
- **M:1 с Users** - Много заказов принадлежат одному пользователю
- **M:1 с Addresses** - Много заказов могут использовать один адрес
- **1:M с OrderItems** - Один заказ содержит много товаров
- **1:M с Notifications** - Один заказ генерирует много уведомлений

---

### 8. ТАБЛИЦА: OrderItems (Товары в заказе)
**Назначение**: Связующая таблица между заказами и товарами

**Атрибуты**:
- `order_item_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор записи
- `order_id` (INT, NOT NULL, FOREIGN KEY → Orders.order_id) - Заказ
- `product_id` (INT, NOT NULL, FOREIGN KEY → Products.product_id) - Товар
- `quantity` (INT, NOT NULL) - Количество товара
- `price_at_purchase` (DECIMAL(10,2), NOT NULL) - Цена на момент покупки
- `discount_at_purchase` (DECIMAL(5,2), DEFAULT 0) - Скидка на момент покупки
- `subtotal` (DECIMAL(10,2), NOT NULL) - Сумма за товар (price × quantity)

**Первичный ключ**: `order_item_id`

**Внешние ключи**:
- `order_id` → `Orders(order_id)` - Связь с заказом
- `product_id` → `Products(product_id)` - Связь с товаром

**Связи**:
- **M:1 с Orders** - Много товаров принадлежат одному заказу
- **M:1 с Products** - Много записей ссылаются на один товар

---

### 9. ТАБЛИЦА: Addresses (Адреса доставки)
**Назначение**: Хранение адресов доставки пользователей

**Атрибуты**:
- `address_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор адреса
- `user_id` (INT, NOT NULL, FOREIGN KEY → Users.user_id) - Владелец адреса
- `address_label` (VARCHAR(50), NULL) - Метка адреса (например, "Дом", "Работа")
- `recipient_name` (VARCHAR(100), NOT NULL) - Имя получателя
- `recipient_phone` (VARCHAR(20), NOT NULL) - Телефон получателя
- `country` (VARCHAR(100), NOT NULL) - Страна
- `city` (VARCHAR(100), NOT NULL) - Город
- `state_province` (VARCHAR(100), NULL) - Область/регион
- `postal_code` (VARCHAR(20), NOT NULL) - Почтовый индекс
- `street_address` (VARCHAR(255), NOT NULL) - Улица и номер дома
- `apartment_suite` (VARCHAR(50), NULL) - Квартира/офис
- `is_default` (BOOLEAN, DEFAULT FALSE) - Адрес по умолчанию
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата создания

**Первичный ключ**: `address_id`

**Внешние ключи**:
- `user_id` → `Users(user_id)` - Связь с пользователем

**Связи**:
- **M:1 с Users** - Много адресов принадлежат одному пользователю
- **1:M с Orders** - Один адрес может использоваться во многих заказах

---

### 10. ТАБЛИЦА: Reviews (Отзывы)
**Назначение**: Хранение отзывов пользователей о товарах

**Атрибуты**:
- `review_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор отзыва
- `product_id` (INT, NOT NULL, FOREIGN KEY → Products.product_id) - Товар
- `user_id` (INT, NOT NULL, FOREIGN KEY → Users.user_id) - Автор отзыва
- `rating` (INT, NOT NULL, CHECK(rating BETWEEN 1 AND 5)) - Оценка от 1 до 5
- `title` (VARCHAR(200), NULL) - Заголовок отзыва
- `comment` (TEXT, NULL) - Текст отзыва
- `is_verified_purchase` (BOOLEAN, DEFAULT FALSE) - Подтвержденная покупка
- `helpful_count` (INT, DEFAULT 0) - Количество "полезно"
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата создания отзыва
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) - Дата обновления
- `is_visible` (BOOLEAN, DEFAULT TRUE) - Виден ли отзыв

**Первичный ключ**: `review_id`

**Внешние ключи**:
- `product_id` → `Products(product_id)` - Связь с товаром
- `user_id` → `Users(user_id)` - Связь с автором

**Уникальные ограничения**:
- UNIQUE(`product_id`, `user_id`) - Один пользователь может оставить только один отзыв на товар

**Связи**:
- **M:1 с Products** - Много отзывов относятся к одному товару
- **M:1 с Users** - Много отзывов написаны одним пользователем

---

### ДОПОЛНИТЕЛЬНАЯ ТАБЛИЦА: Favorites (Избранное)
**Назначение**: Хранение избранных товаров пользователей

**Атрибуты**:
- `favorite_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор записи
- `user_id` (INT, NOT NULL, FOREIGN KEY → Users.user_id) - Пользователь
- `product_id` (INT, NOT NULL, FOREIGN KEY → Products.product_id) - Товар
- `added_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата добавления

**Первичный ключ**: `favorite_id`

**Внешние ключи**:
- `user_id` → `Users(user_id)` - Связь с пользователем
- `product_id` → `Products(product_id)` - Связь с товаром

**Уникальные ограничения**:
- UNIQUE(`user_id`, `product_id`) - Один товар не может быть дважды в избранном одного пользователя

**Связи**:
- **M:1 с Users** - Много записей в избранном принадлежат одному пользователю
- **M:1 с Products** - Много записей ссылаются на один товар
- **M:M между Users и Products** - Связующая таблица для отношения многие-ко-многим

---

### ДОПОЛНИТЕЛЬНАЯ ТАБЛИЦА: Notifications (Уведомления)
**Назначение**: Хранение push-уведомлений для пользователей

**Атрибуты**:
- `notification_id` (INT, PRIMARY KEY, AUTO_INCREMENT) - Уникальный идентификатор уведомления
- `user_id` (INT, NOT NULL, FOREIGN KEY → Users.user_id) - Получатель
- `order_id` (INT, NULL, FOREIGN KEY → Orders.order_id) - Связанный заказ (если применимо)
- `title` (VARCHAR(200), NOT NULL) - Заголовок уведомления
- `message` (TEXT, NOT NULL) - Текст уведомления
- `notification_type` (ENUM('order_update', 'promotion', 'system', 'review_request'), NOT NULL) - Тип уведомления
- `is_read` (BOOLEAN, DEFAULT FALSE) - Прочитано ли
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP) - Дата создания
- `read_at` (TIMESTAMP, NULL) - Дата прочтения

**Первичный ключ**: `notification_id`

**Внешние ключи**:
- `user_id` → `Users(user_id)` - Связь с пользователем
- `order_id` → `Orders(order_id)` - Связь с заказом (может быть NULL)

**Связи**:
- **M:1 с Users** - Много уведомлений получает один пользователь
- **M:1 с Orders** - Много уведомлений могут относиться к одному заказу

---

## ДЕТАЛЬНОЕ ОПИСАНИЕ СВЯЗЕЙ

### 1. Users ↔ Orders (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Users
- **Вторичная таблица**: Orders
- **Внешний ключ**: `Orders.user_id` → `Users.user_id`
- **Кардинальность**: Один пользователь может создать 0 или более заказов. Каждый заказ принадлежит ровно одному пользователю.
- **Обязательность**: Обязательная со стороны Orders (каждый заказ должен иметь пользователя)

### 2. Users ↔ ShoppingCart (ОДИН К ОДНОМУ)
- **Тип связи**: 1:1
- **Первичная таблица**: Users
- **Вторичная таблица**: ShoppingCart
- **Внешний ключ**: `ShoppingCart.user_id` → `Users.user_id` (UNIQUE)
- **Кардинальность**: У каждого пользователя может быть максимум одна активная корзина. Каждая корзина принадлежит ровно одному пользователю.
- **Обязательность**: Обязательная со стороны ShoppingCart

### 3. Users ↔ Reviews (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Users
- **Вторичная таблица**: Reviews
- **Внешний ключ**: `Reviews.user_id` → `Users.user_id`
- **Кардинальность**: Один пользователь может написать 0 или более отзывов. Каждый отзыв принадлежит ровно одному пользователю.
- **Обязательность**: Обязательная со стороны Reviews

### 4. Users ↔ Addresses (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Users
- **Вторичная таблица**: Addresses
- **Внешний ключ**: `Addresses.user_id` → `Users.user_id`
- **Кардинальность**: Один пользователь может иметь 0 или более адресов доставки. Каждый адрес принадлежит ровно одному пользователю.
- **Обязательность**: Обязательная со стороны Addresses

### 5. Users ↔ Notifications (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Users
- **Вторичная таблица**: Notifications
- **Внешний ключ**: `Notifications.user_id` → `Users.user_id`
- **Кардинальность**: Один пользователь может получить 0 или более уведомлений. Каждое уведомление предназначено ровно одному пользователю.
- **Обязательность**: Обязательная со стороны Notifications

### 6. Users ↔ Products (МНОГИЕ КО МНОГИМ через Favorites)
- **Тип связи**: M:M
- **Связующая таблица**: Favorites
- **Внешние ключи**:
  - `Favorites.user_id` → `Users.user_id`
  - `Favorites.product_id` → `Products.product_id`
- **Кардинальность**: Один пользователь может добавить в избранное много товаров. Один товар может быть в избранном у многих пользователей.

### 7. Categories ↔ Products (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Categories
- **Вторичная таблица**: Products
- **Внешний ключ**: `Products.category_id` → `Categories.category_id`
- **Кардинальность**: Одна категория может содержать 0 или более товаров. Каждый товар принадлежит ровно одной категории.
- **Обязательность**: Обязательная со стороны Products

### 8. Categories ↔ Categories (РЕКУРСИВНАЯ, ОДИН КО МНОГИМ)
- **Тип связи**: 1:M (рекурсивная)
- **Первичная таблица**: Categories (родительская)
- **Вторичная таблица**: Categories (дочерняя)
- **Внешний ключ**: `Categories.parent_category_id` → `Categories.category_id`
- **Кардинальность**: Одна категория может иметь 0 или более подкатегорий. Каждая подкатегория может иметь максимум одну родительскую категорию.
- **Обязательность**: Необязательная (корневые категории не имеют родителя)

### 9. Products ↔ ProductImages (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Products
- **Вторичная таблица**: ProductImages
- **Внешний ключ**: `ProductImages.product_id` → `Products.product_id`
- **Кардинальность**: Один товар может иметь 0 или более изображений. Каждое изображение принадлежит ровно одному товару.
- **Обязательность**: Обязательная со стороны ProductImages

### 10. Products ↔ Reviews (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Products
- **Вторичная таблица**: Reviews
- **Внешний ключ**: `Reviews.product_id` → `Products.product_id`
- **Кардинальность**: Один товар может иметь 0 или более отзывов. Каждый отзыв относится ровно к одному товару.
- **Обязательность**: Обязательная со стороны Reviews

### 11. ShoppingCart ↔ CartItems (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: ShoppingCart
- **Вторичная таблица**: CartItems
- **Внешний ключ**: `CartItems.cart_id` → `ShoppingCart.cart_id`
- **Кардинальность**: Одна корзина может содержать 0 или более товаров. Каждая запись товара принадлежит ровно одной корзине.
- **Обязательность**: Обязательная со стороны CartItems

### 12. Products ↔ CartItems (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Products
- **Вторичная таблица**: CartItems
- **Внешний ключ**: `CartItems.product_id` → `Products.product_id`
- **Кардинальность**: Один товар может быть добавлен в 0 или более корзин. Каждая запись в корзине ссылается ровно на один товар.
- **Обязательность**: Обязательная со стороны CartItems

### 13. Orders ↔ OrderItems (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Orders
- **Вторичная таблица**: OrderItems
- **Внешний ключ**: `OrderItems.order_id` → `Orders.order_id`
- **Кардинальность**: Один заказ содержит 1 или более товаров. Каждая запись товара принадлежит ровно одному заказу.
- **Обязательность**: Обязательная со стороны OrderItems

### 14. Products ↔ OrderItems (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Products
- **Вторичная таблица**: OrderItems
- **Внешний ключ**: `OrderItems.product_id` → `Products.product_id`
- **Кардинальность**: Один товар может быть в 0 или более заказах. Каждая запись в заказе ссылается ровно на один товар.
- **Обязательность**: Обязательная со стороны OrderItems

### 15. Addresses ↔ Orders (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Addresses
- **Вторичная таблица**: Orders
- **Внешний ключ**: `Orders.address_id` → `Addresses.address_id`
- **Кардинальность**: Один адрес может использоваться в 0 или более заказах. Каждый заказ использует ровно один адрес доставки.
- **Обязательность**: Обязательная со стороны Orders

### 16. Orders ↔ Notifications (ОДИН КО МНОГИМ)
- **Тип связи**: 1:M
- **Первичная таблица**: Orders
- **Вторичная таблица**: Notifications
- **Внешний ключ**: `Notifications.order_id` → `Orders.order_id`
- **Кардинальность**: Один заказ может генерировать 0 или более уведомлений. Каждое уведомление может относиться максимум к одному заказу (или не относиться ни к какому).
- **Обязательность**: Необязательная со стороны Notifications (уведомления могут быть не связаны с заказами)

---

## СВОДНАЯ ТАБЛИЦА СВЯЗЕЙ

| № | Первичная таблица | Вторичная таблица | Тип связи | Внешний ключ | Обязательность |
|---|-------------------|-------------------|-----------|--------------|----------------|
| 1 | Users | Orders | 1:M | Orders.user_id | Обязательная |
| 2 | Users | ShoppingCart | 1:1 | ShoppingCart.user_id | Обязательная |
| 3 | Users | Reviews | 1:M | Reviews.user_id | Обязательная |
| 4 | Users | Addresses | 1:M | Addresses.user_id | Обязательная |
| 5 | Users | Notifications | 1:M | Notifications.user_id | Обязательная |
| 6 | Users | Favorites | 1:M | Favorites.user_id | Обязательная |
| 7 | Categories | Products | 1:M | Products.category_id | Обязательная |
| 8 | Categories | Categories | 1:M | Categories.parent_category_id | Необязательная |
| 9 | Products | ProductImages | 1:M | ProductImages.product_id | Обязательная |
| 10 | Products | Reviews | 1:M | Reviews.product_id | Обязательная |
| 11 | Products | CartItems | 1:M | CartItems.product_id | Обязательная |
| 12 | Products | OrderItems | 1:M | OrderItems.product_id | Обязательная |
| 13 | Products | Favorites | 1:M | Favorites.product_id | Обязательная |
| 14 | ShoppingCart | CartItems | 1:M | CartItems.cart_id | Обязательная |
| 15 | Orders | OrderItems | 1:M | OrderItems.order_id | Обязательная |
| 16 | Orders | Notifications | 1:M | Notifications.order_id | Необязательная |
| 17 | Addresses | Orders | 1:M | Orders.address_id | Обязательная |

---

## ДИАГРАММА ER-МОДЕЛИ (ТЕКСТОВОЕ ПРЕДСТАВЛЕНИЕ)

```
                                    ┌─────────────────┐
                                    │     Users       │
                                    │─────────────────│
                                    │ PK: user_id     │
                                    │     username    │
                                    │     email       │
                                    │     role        │
                                    └────────┬────────┘
                                             │
                 ┌───────────────────────────┼───────────────────────────┐
                 │                           │                           │
                 │ 1                         │ 1                         │ 1
                 │                           │                           │
        ┌────────▼────────┐         ┌───────▼────────┐         ┌────────▼────────┐
        │   Orders        │         │  ShoppingCart  │         │   Addresses     │
        │─────────────────│         │────────────────│         │─────────────────│
        │ PK: order_id    │         │ PK: cart_id    │         │ PK: address_id  │
        │ FK: user_id     │         │ FK: user_id    │◄────┐   │ FK: user_id     │
        │ FK: address_id  │◄────────┤     (UNIQUE)   │     │   │     city        │
        │     total       │         └────────┬────────┘     │   │     street      │
        │     status      │                  │              │   └─────────────────┘
        └────────┬────────┘                  │ 1            │
                 │                           │              │
                 │ 1                         │              │
                 │                           │              │
        ┌────────▼────────┐         ┌───────▼────────┐     │
        │  OrderItems     │         │   CartItems    │     │
        │─────────────────│         │────────────────│     │
        │ PK: order_item  │         │ PK: cart_item  │     │
        │ FK: order_id    │         │ FK: cart_id    │     │
        │ FK: product_id  │─┐       │ FK: product_id │─┐   │
        │     quantity    │ │       │     quantity   │ │   │
        └─────────────────┘ │       └────────────────┘ │   │
                            │                          │   │
                            │ M                      M │   │
                            │                          │   │
                    ┌───────▼──────────────────────────▼───┼────────────┐
                    │              Products                │            │
                    │──────────────────────────────────────│            │
                    │ PK: product_id                       │            │
                    │ FK: category_id                      │            │
                    │     product_name                     │            │
                    │     price                            │            │
                    │     quantity_in_stock                │            │
                    └──────┬───────────────────────────────┘            │
                           │                                            │
           ┌───────────────┼───────────────┐                            │
           │ 1             │ 1             │ 1                          │
           │               │               │                            │
   ┌───────▼──────┐ ┌─────▼──────┐ ┌──────▼──────┐                     │
   │ProductImages │ │  Reviews   │ │  Favorites  │                     │
   │──────────────│ │────────────│ │─────────────│                     │
   │PK: image_id  │ │PK: review  │ │PK: favorite │                     │
   │FK: product   │ │FK: product │ │FK: user_id  │─────────────────────┘
   │   image_url  │ │FK: user_id │ │FK: product  │
   │  is_primary  │ │   rating   │ │  added_at   │
   └──────────────┘ │   comment  │ └─────────────┘
                    └──────┬─────┘
                           │ M
                           │
                    ┌──────▼──────┐
                    │    Users    │
                    │ (связь 1:M) │
                    └─────────────┘

             ┌──────────────────┐
             │   Categories     │
             │──────────────────│
             │ PK: category_id  │
             │ FK: parent_cat.  │◄───┐ (рекурсивная связь 1:M)
             │     name         │────┘
             └────────┬─────────┘
                      │ 1
                      │
             ┌────────▼─────────┐
             │    Products      │
             │──────────────────│
             │ FK: category_id  │
             └──────────────────┘

             ┌──────────────────┐
             │  Notifications   │
             │──────────────────│
             │ PK: notify_id    │
             │ FK: user_id      │──────► Users (1:M)
             │ FK: order_id     │──────► Orders (1:M, optional)
             │     message      │
             │     is_read      │
             └──────────────────┘
```

---

## ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ

### Рекомендуемые индексы:

1. **Users**:
   - INDEX на `email` (для быстрого поиска при авторизации)
   - INDEX на `username` (для быстрого поиска)

2. **Products**:
   - INDEX на `category_id` (для фильтрации по категориям)
   - INDEX на `sku` (уже UNIQUE, но явный индекс)
   - INDEX на `price` (для сортировки и фильтрации)
   - INDEX на `created_at` (для сортировки "новинки")
   - FULLTEXT INDEX на `product_name, description` (для полнотекстового поиска)

3. **Orders**:
   - INDEX на `user_id` (для получения заказов пользователя)
   - INDEX на `order_status` (для фильтрации по статусу)
   - INDEX на `created_at` (для сортировки по дате)

4. **Reviews**:
   - INDEX на `product_id` (для получения отзывов товара)
   - INDEX на `user_id` (для получения отзывов пользователя)

5. **CartItems**:
   - INDEX на `cart_id` (для получения товаров корзины)

6. **OrderItems**:
   - INDEX на `order_id` (для получения товаров заказа)

---

## ОГРАНИЧЕНИЯ ЦЕЛОСТНОСТИ

1. **CASCADE DELETE**:
   - При удалении пользователя → удалять его корзину, адреса (но НЕ заказы и отзывы)
   - При удалении товара → удалять его изображения
   - При удалении корзины → удалять все CartItems
   - При удалении заказа → удалять все OrderItems

2. **SET NULL**:
   - При удалении адреса → НЕ удалять заказы, а установить address_id = NULL

3. **RESTRICT**:
   - При удалении категории → запретить удаление, если есть товары
   - При удалении пользователя → запретить удаление, если есть заказы

---

## ИТОГОВАЯ СТАТИСТИКА ER-МОДЕЛИ

- **Количество таблиц**: 12 (10 основных + 2 дополнительные)
- **Связи 1:1**: 1 (Users ↔ ShoppingCart)
- **Связи 1:M**: 16
- **Связи M:M**: 1 (Users ↔ Products через Favorites)
- **Рекурсивных связей**: 1 (Categories ↔ Categories)
- **Общее количество связей**: 17

---

## ПРИМЕРЫ SQL-ЗАПРОСОВ

### 1. Создание таблицы Users:
```sql
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(100),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    role ENUM('customer', 'admin', 'moderator') DEFAULT 'customer',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url VARCHAR(255),
    fcm_token VARCHAR(255),
    INDEX idx_email (email),
    INDEX idx_username (username)
);
```

### 2. Создание таблицы Products с внешним ключом:
```sql
CREATE TABLE Products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    quantity_in_stock INT DEFAULT 0,
    sku VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(100),
    vintage_year INT,
    condition ENUM('new', 'excellent', 'good', 'fair', 'poor') NOT NULL,
    material VARCHAR(100),
    size VARCHAR(50),
    color VARCHAR(50),
    weight DECIMAL(8,2),
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    INDEX idx_created (created_at),
    FULLTEXT INDEX ft_search (product_name, description)
);
```

### 3. Создание связующей таблицы Favorites (M:M):
```sql
CREATE TABLE Favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, product_id),
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
);
```

### 4. Запрос для получения заказов пользователя с адресами:
```sql
SELECT
    o.order_id,
    o.order_number,
    o.total_amount,
    o.order_status,
    a.city,
    a.street_address
FROM Orders o
INNER JOIN Users u ON o.user_id = u.user_id
LEFT JOIN Addresses a ON o.address_id = a.address_id
WHERE u.user_id = ?
ORDER BY o.created_at DESC;
```

### 5. Запрос для получения товаров с рейтингом:
```sql
SELECT
    p.product_id,
    p.product_name,
    p.price,
    AVG(r.rating) as avg_rating,
    COUNT(r.review_id) as review_count
FROM Products p
LEFT JOIN Reviews r ON p.product_id = r.product_id
WHERE p.is_active = TRUE
GROUP BY p.product_id
HAVING avg_rating >= 4.0
ORDER BY avg_rating DESC;
```

---

**КОНЕЦ ДОКУМЕНТА**
