FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходники
COPY . .

# Компилируем TypeScript
RUN npm run build

# Запускаем приложение
CMD ["npm", "start"]
