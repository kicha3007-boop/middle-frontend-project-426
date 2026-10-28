import type { FastifyReply, FastifyRequest, preHandlerAsyncHookHandler } from "fastify";
import type pg from "pg";

import { unauthorized } from "../errors.js";
import type { User } from "../schemas.js";
import { SESSION_TTL_MS, userBySessionToken } from "../services/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    user: User | null;
  }
}

const SESSION_COOKIE = "sid";

export const readSessionToken = (request: FastifyRequest): string | undefined =>
  request.cookies[SESSION_COOKIE];

export const setSessionCookie = (reply: FastifyReply, token: string): void => {
  reply.setCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // За прокси хостинга запрос приходит по HTTPS — тогда cookie помечается Secure.
    secure: "auto",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
};

export const clearSessionCookie = (reply: FastifyReply): void => {
  reply.clearCookie(SESSION_COOKIE, { path: "/" });
};

const resolveUser = async (pool: pg.Pool, request: FastifyRequest): Promise<void> => {
  const token = readSessionToken(request);
  request.user = token ? await userBySessionToken(pool, token) : null;
};

// Подставляет в request.user владельца сессии из cookie (или null).
export const loadUser =
  (pool: pg.Pool): preHandlerAsyncHookHandler =>
  async (request) => {
    await resolveUser(pool, request);
  };

// Закрытые адреса закрыты на сервере: без сессии — 401 в общем формате ошибок.
export const requireUser =
  (pool: pg.Pool): preHandlerAsyncHookHandler =>
  async (request) => {
    await resolveUser(pool, request);
    if (!request.user) {
      throw unauthorized();
    }
  };

export const currentUser = (request: FastifyRequest): User => {
  if (!request.user) {
    throw unauthorized();
  }
  return request.user;
};
