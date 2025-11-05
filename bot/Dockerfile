FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем исходники
COPY . .

# Компилируем TypeScript
RUN npm run build

# Удаляем devDependencies после сборки
RUN npm prune --production

# Запускаем приложение
CMD ["npm", "start"]
