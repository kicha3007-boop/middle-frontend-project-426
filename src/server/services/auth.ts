import { createHash, randomBytes } from "node:crypto";

import type pg from "pg";

import { AppError } from "../errors.js";
import { deleteSession, findSessionUser, insertSession } from "../repositories/sessions.js";
import { findUserByEmail, insertUser } from "../repositories/users.js";
import type { Credentials, User } from "../schemas.js";
import { hashPassword, verifyPassword } from "./password.js";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// В базе лежит только хеш токена; сам токен знает лишь браузер (httpOnly-cookie).
const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export type Session = { user: User; token: string };

const openSession = async (pool: pg.Pool, user: User): Promise<Session> => {
  const token = randomBytes(32).toString("base64url");
  await insertSession(pool, hashToken(token), user.id, new Date(Date.now() + SESSION_TTL_MS));
  return { user, token };
};

export const register = async (pool: pg.Pool, credentials: Credentials): Promise<Session> => {
  const passwordHash = await hashPassword(credentials.password);
  const user = await insertUser(pool, normalizeEmail(credentials.email), passwordHash);
  if (!user) {
    throw new AppError(409, "EMAIL_TAKEN", "Пользователь с таким email уже зарегистрирован");
  }
  return openSession(pool, user);
};

export const login = async (pool: pg.Pool, credentials: Credentials): Promise<Session> => {
  const user = await findUserByEmail(pool, normalizeEmail(credentials.email));
  const valid = user ? await verifyPassword(credentials.password, user.passwordHash) : false;
  if (!user || !valid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Неверный email или пароль");
  }
  return openSession(pool, { id: user.id, email: user.email });
};

export const userBySessionToken = (pool: pg.Pool, token: string): Promise<User | null> =>
  findSessionUser(pool, hashToken(token));

// Выход завершает сессию на сервере: cookie без записи в базе больше ничего не открывает.
export const logout = (pool: pg.Pool, token: string): Promise<void> =>
  deleteSession(pool, hashToken(token));
