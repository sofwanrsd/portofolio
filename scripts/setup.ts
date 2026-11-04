import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Setup database:
 *  - jalankan db/schema.sql (CREATE TABLE IF NOT EXISTS ...)
 *  - jalankan db/seed.sql (data contoh, aman diulang)
 *  - buat/reset akun admin dari ADMIN_EMAIL + ADMIN_PASSWORD
 *
 * Pakai: npm run db:setup
 */

const ROOT = process.cwd();

/**
 * Pecah berkas SQL menjadi statement terpisah.
 *
 * Komentar baris (`-- ...`) dibuang lebih dulu; kalau tidak, komentar pemisah
 * di atas sebuah CREATE TABLE membuat seluruh statement ikut terbuang dan
 * skema tidak pernah terbentuk.
 */
function splitStatements(sql: string): string[] {
  const withoutComments = sql
    .split("\n")
    .filter((line) => !/^\s*--/.test(line))
    .join("\n");

  return withoutComments
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "\n[ERROR] DATABASE_URL belum di-set.\n" +
        "  1. cp .env.example .env.local\n" +
        "  2. Isi DATABASE_URL dari Neon Dashboard (pooled connection)\n" +
        "  3. Jalankan ulang: npm run db:setup\n"
    );
    process.exit(1);
  }

  const sql = neon(url);
  const reset = process.argv.includes("--reset");

  console.log("→ Membaca db/schema.sql ...");
  const schema = await readFile(join(ROOT, "db", "schema.sql"), "utf-8");
  for (const statement of splitStatements(schema)) {
    await sql(statement);
  }
  console.log("  ✓ skema siap");

  if (reset) {
    console.log("→ Reset data (--reset) ...");
    await sql(
      "TRUNCATE projects, posts, services, experiences, skills, testimonials, messages, settings RESTART IDENTITY CASCADE"
    );
  }

  console.log("→ Menjalankan db/seed.sql ...");
  const seed = await readFile(join(ROOT, "db", "seed.sql"), "utf-8");
  for (const statement of splitStatements(seed)) {
    try {
      await sql(statement);
    } catch (error) {
      // Seed memakai ON CONFLICT DO NOTHING; error lain tetap fatal.
      console.error(`  ! Gagal: ${(error as Error).message}`);
      throw error;
    }
  }
  console.log("  ✓ seed selesai");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "\n[!] ADMIN_EMAIL / ADMIN_PASSWORD belum di-set: akun admin dilewati."
    );
  } else {
    console.log(`→ Menyiapkan akun admin: ${email}`);
    const hash = await bcrypt.hash(password, 10);
    await sql(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash, updated_at = now()`,
      [email.toLowerCase(), "Admin", hash]
    );
    console.log("  ✓ akun admin siap");
  }

  console.log("\n✅ Setup selesai. Jalankan `npm run dev` lalu buka /admin/login\n");
}

main().catch((error) => {
  console.error("\n[ERROR]", (error as Error).message);
  process.exit(1);
});
