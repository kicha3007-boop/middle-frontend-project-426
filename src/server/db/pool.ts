import { Pool, type PoolClient } from "pg";

export type Db = Pool | PoolClient;

export const createPool = (connectionString: string): Pool => new Pool({ connectionString });

// Всё, что делается внутри callback, либо фиксируется целиком, либо откатывается.
export const withTransaction = async <T>(
  pool: Pool,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// На хостинге база может подняться позже приложения — ждём её, а не падаем с первой попытки.
export const waitForDatabase = async (pool: Pool, attempts = 30): Promise<void> => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      if (attempt >= attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
