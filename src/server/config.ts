// Конфигурация приходит только из окружения: ни порта, ни строки подключения в коде нет.
export type Config = {
  port: number;
  databaseUrl: string;
  monitoringDsn: string | undefined;
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Не задана переменная окружения ${name}`);
  }
  return value;
};

export const readConfig = (): Config => {
  const port = Number(required("PORT"));
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT должен быть положительным целым числом");
  }
  return {
    port,
    databaseUrl: required("DATABASE_URL"),
    monitoringDsn: process.env.MONITORING_DSN || undefined,
  };
};
