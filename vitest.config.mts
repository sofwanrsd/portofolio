import { defineConfig } from "vitest/config";

/**
 * Konfigurasi Vitest untuk unit test logika murni (slug, validasi, format,
 * rate limiter, kontak, filter API). Alias `@/` dibaca langsung dari
 * tsconfig.json lewat dukungan bawaan Vite, jadi tidak perlu ditulis ulang.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    reporters: "default",
  },
});
