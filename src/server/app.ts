import { existsSync } from "node:fs";
import path from "node:path";

import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import type pg from "pg";

import { registerErrorHandler, sendError } from "./errors.js";
import { authRoutes } from "./routes/auth.js";
import { catalogRoutes } from "./routes/catalog.js";
import { orderRoutes } from "./routes/orders.js";

export type AppOptions = {
  pool: pg.Pool;
  // Каталог собранного фронтенда. Нет каталога (дев-режим с Vite) — отдаётся только API.
  clientDir: string;
  logger?: boolean;
};

export const buildApp = async ({
  pool,
  clientDir,
  logger = true,
}: AppOptions): Promise<FastifyInstance> => {
  const app = Fastify({
    logger,
    // За прокси хостинга: протокол и адрес клиента берутся из X-Forwarded-*.
    trustProxy: true,
    ajv: {
      customOptions: {
        // Форматы и x-атрибуты из OpenAPI, которые Ajv не знает: проверять тут нечего.
        formats: { int32: true },
        keywords: ["x-in", "x-status-code", "x-content-type"],
      },
    },
  });

  await app.register(fastifyCookie);
  app.decorateRequest("user", null);
  registerErrorHandler(app);

  app.get("/api/health", async () => {
    await pool.query("SELECT 1");
    return { status: "ok" as const };
  });
  authRoutes(app, pool);
  catalogRoutes(app, pool);
  orderRoutes(app, pool);

  const indexHtml = path.join(clientDir, "index.html");
  const hasClient = existsSync(indexHtml);
  if (hasClient) {
    await app.register(fastifyStatic, {
      root: clientDir,
      wildcard: false,
      setHeaders: (reply, filePath) => {
        if (filePath.endsWith("index.html")) {
          reply.header("Cache-Control", "no-cache");
        }
      },
    });
  }

  // /api/* без маршрута — 404 в общем формате; любой другой GET — index.html для роутинга SPA.
  app.setNotFoundHandler((request, reply) => {
    const pathname = request.url.split("?")[0] ?? "";
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return sendError(reply, 404, { code: "NOT_FOUND", message: "Такого адреса в API нет" });
    }
    if (hasClient && (request.method === "GET" || request.method === "HEAD")) {
      return reply.type("text/html").header("Cache-Control", "no-cache").sendFile("index.html");
    }
    return sendError(reply, 404, { code: "NOT_FOUND", message: "Страница не найдена" });
  });

  return app;
};
