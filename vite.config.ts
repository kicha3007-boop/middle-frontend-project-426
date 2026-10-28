import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Адрес бэкенда знает только дев-сервер: в коде приложения запросы идут по относительному /api.
const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    sourcemap: true,
  },
});
