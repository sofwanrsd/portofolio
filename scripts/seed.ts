import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Menjalankan db/seed.sql saja (tanpa membuat akun admin).
 * Berguna untuk mengisi data contoh ulang setelah tabel kosong.
 * Pakai: npm run db:seed
 */

const ROOT = process.cwd();

function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "\n[ERROR] DATABASE_URL belum di-set.\n" +
        "  1. cp .env.example .env.local\n" +
        "  2. Isi DATABASE_URL dari Neon Dashboard\n" +
        "  3. Jalankan ulang: npm run db:seed\n"
    );
    process.exit(1);
  }

  const sql = neon(url);
  const seed = await readFile(join(ROOT, "db", "seed.sql"), "utf-8");

  console.log("→ Menjalankan db/seed.sql ...");
  for (const statement of splitStatements(seed)) {
    await sql.query(statement);
  }
  console.log("  ✓ seed selesai");
}

main().catch((error) => {
  console.error("\n[ERROR]", (error as Error).message);
  process.exit(1);
});
