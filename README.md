# Интернет-магазин комплектующих для ПК

[![hexlet-check](https://github.com/kicha3007-boop/middle-frontend-project-426/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kicha3007-boop/middle-frontend-project-426/actions)
[![ci](https://github.com/kicha3007-boop/middle-frontend-project-426/actions/workflows/ci.yml/badge.svg)](https://github.com/kicha3007-boop/middle-frontend-project-426/actions/workflows/ci.yml)

«ЖелезоМаркет» — интернет-магазин комплектующих для ПК целиком на TypeScript: главная с промо-блоками,
каталог с фильтрами и пагинацией, карточка товара, корзина, регистрация и вход, оформление заказа
(доставка или самовывоз) и личный кабинет с историей заказов. Фронтенд и бэкенд живут в одном
репозитории и работают одним процессом на одном порту: сервер отдаёт и собранную статику, и `/api/*`.

Учебный проект Хекслета: https://ru.hexlet.io/programs/middle-frontend
Как это должно работать: https://files.hexlet.app/a/qf7bsq

## Стек

- **Фронтенд:** React 19, React Router 7, Vite, обычный CSS.
- **Бэкенд:** Node.js 24, Fastify 5, PostgreSQL (драйвер `pg`, параметризованные SQL-запросы), миграции —
  SQL-файлы в `migrations/`.
- **Контракт API:** TypeSpec → OpenAPI (`contract/openapi.yaml`) → схемы валидации бэкенда
  (`@geut/openapi-box`, TypeBox) и типы фронтенда (`openapi-typescript`).
- **Тесты:** Playwright (браузерные сценарии и запросы к API). **Линтер:** oxlint, oxfmt.
- **Мониторинг ошибок:** Sentry SDK (`@sentry/node`, `@sentry/react`) — подходит Sentry или совместимый Bugsink.

## Быстрый старт (Docker)

Нужен только Docker. Приложение собирается тем же `Dockerfile`, что и для проверки Хекслета, а база —
PostgreSQL из `docker-compose.yml`:

```bash
git clone https://github.com/kicha3007-boop/middle-frontend-project-426.git
cd middle-frontend-project-426
docker compose up -d --build
```

Магазин откроется на http://localhost:8080. При старте контейнер сам применяет миграции и заполняет
каталог сидом (9 категорий, 54 товара, 3 промо-блока); повторный старт дублей не создаёт.
Остановить: `docker compose down` (с флагом `-v` — вместе с данными базы).

Образ можно запустить и против любой своей базы — ему нужны только две переменные окружения:

```bash
docker build -t pc-parts-store .
docker run -p 8080:8080 -e PORT=8080 -e DATABASE_URL=postgres://user:pass@host:5432/db pc-parts-store
```

## Разработка без докера для приложения

Нужен Node.js 24 (подойдёт ≥ 22.12) и Docker для базы.

```bash
make install            # npm ci
make db                 # PostgreSQL из docker compose на localhost:5432
cp .env.example .env    # DATABASE_URL и PORT для локального бэкенда
make dev-server         # бэкенд на http://localhost:8080 (tsx watch), миграции и сид при старте
make dev                # фронтенд на http://localhost:5173, /api проксируется на бэкенд
```

Собрать и запустить как в проде: `make build`, затем `make start` (с `PORT` и `DATABASE_URL` в окружении).

## Контракт API

Источник правды — `contract/main.tsp`. После правки контракта:

```bash
make generate   # tsp compile → contract/openapi.yaml → src/server/generated/schema.js и src/client/api/schema.d.ts
```

Сгенерированные файлы руками не правятся, CI проверяет, что они совпадают с контрактом.
Мок API по спецификации без бэкенда: `npm run mock` (Prism на порту 4010).

| Метод и адрес | Что делает |
| --- | --- |
| `GET /api/health` | приложение живо и база доступна |
| `POST /api/auth/register`, `POST /api/auth/login` | регистрация и вход, открывают сессию (httpOnly-cookie) |
| `POST /api/auth/logout` | выход: сессия удаляется на сервере |
| `GET /api/auth/me` | текущий пользователь или `null` |
| `GET /api/categories` | категории каталога |
| `GET /api/products` | выдача: `category`, `priceMin`, `priceMax`, `available`, `q`, `page`, `pageSize` (≤ 48) |
| `GET /api/products/{id}` | товар |
| `GET /api/promos` | промо-блоки главной |
| `POST /api/orders` | оформление: состав корзины и данные получения, без цен |
| `GET /api/orders`, `GET /api/orders/{id}` | свои заказы |

Ошибки всех ресурсов — в одном формате: `{ "code": "...", "message": "...", "problems"?: [...] }`.
Невалидный параметр каталога получает 400, заказ с недоступным товаром — 409 со списком `problems`.

## Тесты

Браузерные тесты Playwright лежат в `tests/e2e` и идут против запущенного приложения, адрес — в `APP_URL`:

```bash
npx playwright install chromium     # один раз
make up                             # приложение и база в докере
APP_URL=http://localhost:8080 make test
```

Тесты сами регистрируют уникальных пользователей и не зависят от порядка запуска. Отчёт о падениях —
в `tmp/playwright-report`.

## Линтер и типы

```bash
make lint        # oxlint + проверка форматирования oxfmt
make lint-fix    # автоисправление
make typecheck   # tsc для фронтенда, бэкенда и тестов
```

## CI

`.github/workflows/ci.yml` на каждый пуш и pull request: линтер, проверка типов, сверка генерации
с контрактом, сборка Docker-образа, запуск его против PostgreSQL, браузерные тесты и проверка, что
повторный старт не задваивает каталог.

## Мониторинг ошибок

Подключён Sentry SDK на обеих сторонах, ключи — только из окружения:

- бэкенд — переменная рантайма `MONITORING_DSN`; неперехваченные исключения и отклонённые промисы ловит SDK,
  непредвиденные ошибки обработчиков отправляет общий обработчик ошибок;
- фронтенд — аргумент сборки `VITE_MONITORING_DSN` (Vite подставляет его в бандл):
  `docker build --build-arg VITE_MONITORING_DSN=<dsn> .` или переменная окружения для `docker compose up --build`.

Без DSN приложение работает так, будто мониторинга нет, а SDK фронтенда даже не попадает в бандл.

## Деплой

Проект проходится локально: в облако он не разворачивается. Образ из `Dockerfile` готов к деплою на любой
хостинг со сборкой из Dockerfile (Render, Railway, Fly.io): достаточно задать `DATABASE_URL`, а `PORT`
хостинг передаёт сам.

## Структура

```text
contract/            TypeSpec-описание API и сгенерированный openapi.yaml
migrations/          SQL-миграции, применяются при старте
src/server/          бэкенд: routes (тонкие обработчики) → services (правила) → repositories (SQL)
src/server/generated сгенерированные схемы валидации
src/client/          фронтенд: pages, catalog, cart, auth, orders, components; api — единственный модуль запросов
tests/e2e/           браузерные тесты Playwright
public/              статика (иконка, изображения товаров)
```

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
