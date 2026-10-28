import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type pg from "pg";

import { withTransaction } from "./pool.js";

// Номер блокировки, под которой идут миграции: два одновременно стартующих экземпляра
// приложения не применят одну миграцию дважды.
const MIGRATION_LOCK_ID = 426_001;

export const migrationsDir = path.resolve(process.cwd(), "migrations");

// Применяет по порядку файлы migrations/*.sql, которых ещё нет в schema_migrations.
// Каждая миграция — в своей транзакции вместе с отметкой о применении.
export const runMigrations = async (pool: pg.Pool): Promise<string[]> => {
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).toSorted();

  return withTransaction(pool, async (client) => {
    await client.query("SELECT pg_advisory_xact_lock($1)", [MIGRATION_LOCK_ID]);
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`,
    );
    const { rows } = await client.query<{ name: string }>("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((row) => row.name));

    const fresh = files.filter((file) => !applied.has(file));
    for (const file of fresh) {
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    }
    return fresh;
  });
};
