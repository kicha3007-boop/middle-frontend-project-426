import path from "node:path";

import { buildApp } from "./app.js";
import { readConfig } from "./config.js";
import { runMigrations } from "./db/migrate.js";
import { createPool, waitForDatabase } from "./db/pool.js";
import { runSeed } from "./db/seed.js";
import { initMonitoring } from "./monitoring.js";

// Старт приложения: миграции и сид, потом сервер. На сборке образа базы нет,
// поэтому всё, что требует базу, происходит здесь.
const main = async (): Promise<void> => {
  const config = readConfig();
  const monitoring = initMonitoring(config.monitoringDsn);

  const pool = createPool(config.databaseUrl);
  await waitForDatabase(pool);
  const applied = await runMigrations(pool);
  await runSeed(pool);

  const app = await buildApp({ pool, clientDir: path.resolve(process.cwd(), "dist/client") });
  app.log.info(
    { migrations: applied, monitoring: monitoring ? "on" : "off" },
    "база готова, запускаю сервер",
  );

  const shutdown = async (): Promise<void> => {
    await app.close();
    await pool.end();
    process.exit(0);
  };
  process.once("SIGTERM", () => void shutdown());
  process.once("SIGINT", () => void shutdown());

  await app.listen({ host: "0.0.0.0", port: config.port });
};

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
