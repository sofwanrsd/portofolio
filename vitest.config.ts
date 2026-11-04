import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Konfigurasi Vitest untuk unit test logika murni (slug, validasi, format,
 * rate limiter, kontak). Alias `@` disamakan dengan tsconfig agar import
 * `@/lib/...` tetap valid tanpa build tambahan.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: "default",
  },
});
