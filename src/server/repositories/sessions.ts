import type { Db } from "../db/pool.js";
import type { User } from "../schemas.js";

export const insertSession = async (
  db: Db,
  tokenHash: string,
  userId: number,
  expiresAt: Date,
): Promise<void> => {
  await db.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    tokenHash,
    userId,
    expiresAt,
  ]);
};

export const findSessionUser = async (db: Db, tokenHash: string): Promise<User | null> => {
  const { rows } = await db.query<User>(
    `SELECT u.id, u.email
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash],
  );
  return rows[0] ?? null;
};

export const deleteSession = async (db: Db, tokenHash: string): Promise<void> => {
  await db.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
};
