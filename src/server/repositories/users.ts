import type { Db } from "../db/pool.js";
import type { User } from "../schemas.js";

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
};

export type UserWithHash = User & { passwordHash: string };

const toUserWithHash = (row: UserRow): UserWithHash => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
});

export const findUserByEmail = async (db: Db, email: string): Promise<UserWithHash | null> => {
  const { rows } = await db.query<UserRow>(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  return rows[0] ? toUserWithHash(rows[0]) : null;
};

// null — email уже занят (уникальный индекс решает гонку двух одновременных регистраций).
export const insertUser = async (
  db: Db,
  email: string,
  passwordHash: string,
): Promise<User | null> => {
  const { rows } = await db.query<{ id: number; email: string }>(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email`,
    [email, passwordHash],
  );
  return rows[0] ?? null;
};
