/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MONITORING_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
