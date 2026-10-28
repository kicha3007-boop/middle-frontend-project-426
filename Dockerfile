# Образ приложения — контракт проекта: им запускают и проверка Хекслета, и прод.
# Снаружи нужны только PORT и DATABASE_URL; миграции и сид выполняет старт контейнера.

# --- Сборка: фронтенд (Vite) и бэкенд (tsc) ---
FROM node:24-alpine AS build
WORKDIR /app
# Зависимости отдельным слоем: правка кода не переустанавливает node_modules.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# DSN мониторинга фронтенда подставляется в бандл при сборке (пусто — мониторинг выключен).
ARG VITE_MONITORING_DSN=""
ENV VITE_MONITORING_DSN=$VITE_MONITORING_DSN
RUN npm run build

# --- Только зависимости рантайма, без инструментов сборки ---
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# --- Итоговый образ ---
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY migrations ./migrations
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server/index.js"]
