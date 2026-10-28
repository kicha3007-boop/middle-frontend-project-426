// Мониторинг ошибок фронтенда по протоколу Sentry. DSN подставляется в бандл при сборке
// (VITE_MONITORING_DSN, аргумент сборки образа). Без DSN SDK даже не загружается.
type SentryModule = typeof import("@sentry/react");

let sentry: SentryModule | undefined;
const pending: unknown[] = [];

const loadSentry = async (dsn: string): Promise<void> => {
  const module = await import("@sentry/react");
  // Неперехваченные ошибки и отклонённые промисы SDK ловит глобальными обработчиками.
  module.init({ dsn, environment: import.meta.env.MODE });
  sentry = module;
  pending.splice(0).forEach((error) => module.captureException(error));
};

export const initMonitoring = (): void => {
  const dsn = import.meta.env.VITE_MONITORING_DSN;
  if (dsn) {
    void loadSentry(dsn);
  }
};

export const captureError = (error: unknown): void => {
  if (!import.meta.env.VITE_MONITORING_DSN) {
    return;
  }
  if (sentry) {
    sentry.captureException(error);
  } else {
    pending.push(error);
  }
};
