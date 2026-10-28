import * as Sentry from "@sentry/node";

// Мониторинг ошибок по протоколу Sentry (подходит и Sentry, и совместимый Bugsink).
// DSN приходит из окружения; без него приложение работает так, будто мониторинга нет.
let enabled = false;

export const initMonitoring = (dsn: string | undefined): boolean => {
  if (!dsn) {
    return false;
  }
  // Неперехваченные исключения и отклонённые промисы SDK ловит своими интеграциями.
  Sentry.init({ dsn, environment: process.env.NODE_ENV ?? "development" });
  enabled = true;
  return true;
};

// Только непредвиденные ошибки: бизнес-отказы (занятый email, недоступный товар) сюда не попадают.
export const captureError = (error: unknown): void => {
  if (enabled) {
    Sentry.captureException(error);
  }
};
