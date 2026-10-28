import type { FastifyInstance } from "fastify";
import type pg from "pg";

import { credentialsSchema, type Credentials } from "../schemas.js";
import { login, logout, register } from "../services/auth.js";
import { clearSessionCookie, loadUser, readSessionToken, setSessionCookie } from "./session.js";

export const authRoutes = (app: FastifyInstance, pool: pg.Pool): void => {
  app.post<{ Body: Credentials }>(
    "/api/auth/register",
    { schema: { body: credentialsSchema } },
    async (request, reply) => {
      const session = await register(pool, request.body);
      setSessionCookie(reply, session.token);
      return reply.code(201).send(session.user);
    },
  );

  app.post<{ Body: Credentials }>(
    "/api/auth/login",
    { schema: { body: credentialsSchema } },
    async (request, reply) => {
      const session = await login(pool, request.body);
      setSessionCookie(reply, session.token);
      return session.user;
    },
  );

  app.post("/api/auth/logout", async (request, reply) => {
    const token = readSessionToken(request);
    if (token) {
      await logout(pool, token);
    }
    clearSessionCookie(reply);
    return reply.code(204).send();
  });

  app.get("/api/auth/me", { preHandler: loadUser(pool) }, async (request) => ({
    user: request.user,
  }));
};
