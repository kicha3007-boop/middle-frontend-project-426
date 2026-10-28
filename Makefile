.PHONY: install generate build start dev dev-server db db-down up down test lint lint-fix typecheck

# Зависимости строго по lock-файлу.
install:
	npm ci

# TypeSpec → contract/openapi.yaml → схемы бэкенда и типы фронтенда.
generate:
	npm run generate

# Сборка фронтенда (dist/client) и бэкенда (dist/server).
build:
	npm run build

# Собранное приложение: миграции, сид, сервер. Нужны PORT и DATABASE_URL в окружении.
start:
	npm start

# Только PostgreSQL из docker compose (для разработки без докера для приложения).
db:
	docker compose up -d db

db-down:
	docker compose down

# Бэкенд в режиме разработки: переменные берутся из .env (см. .env.example).
dev-server:
	npm run dev:server

# Дев-сервер Vite на http://localhost:5173, /api проксируется на бэкенд.
dev:
	npm run dev

# Всё приложение в докере — так же, как в проверке и в проде: http://localhost:8080.
up:
	docker compose up -d --build

down:
	docker compose down

# Браузерные тесты; адрес приложения — в APP_URL (например, http://localhost:8080).
test:
	npm test

lint:
	npm run lint

lint-fix:
	npm run lint:fix

typecheck:
	npm run typecheck
