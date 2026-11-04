import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Klien Neon HTTP (serverless-friendly, tanpa WebSocket: aman untuk Vercel Edge/Node runtime).
 * Lazy-init supaya build tidak gagal saat DATABASE_URL belum di-set.
 *
 * `fullResults: true` wajib: tanpa opsi itu driver mengembalikan array baris
 * saja, sehingga pembacaan `.rows` / `.rowCount` di bawah selalu kosong.
 */
let client: NeonQueryFunction<false, true> | null = null;

export function getSql(): NeonQueryFunction<false, true> | null {
  if (!process.env.DATABASE_URL) return null;
  if (!client) {
    client = neon(process.env.DATABASE_URL, { fullResults: true });
  }
  return client;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Tagged template `sql`: cara utama berinteraksi dengan database.
 *
 * ```ts
 * const rows = await sql`SELECT * FROM projects WHERE published = true`;
 * const row  = (await sql`SELECT * FROM projects WHERE id = ${id}`)[0] ?? null;
 * ```
 *
 * Nilai interpolasi di-escape otomatis oleh driver Neon sebagai parameter
 * query ($1, $2, ...) sehingga aman dari SQL injection.
 */
export async function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const res = await client(strings, ...values);
    return (res.rows ?? []) as T[];
  } catch (error) {
    console.error("[db] sql error:", (error as Error).message);
    return [];
  }
}

/** Jalankan query dan kembalikan baris sebagai array. Return [] bila DB tidak tersedia / error. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = getSql();
  if (!client) return [];
  try {
    const res = await client(text, params as never[]);
    return (res.rows ?? []) as T[];
  } catch (error) {
    console.error("[db] query error:", (error as Error).message);
    return [];
  }
}

/** Jalankan query dan kembalikan satu baris pertama (atau null). */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length ? rows[0] : null;
}

/** Jalankan statement tanpa mengembalikan baris. Throws bila gagal. */
export async function execute(
  text: string,
  params: unknown[] = []
): Promise<{ rowCount: number }> {
  const client = getSql();
  if (!client) throw new Error("DATABASE_URL belum di-set");
  const res = await client(text, params as never[]);
  return { rowCount: res.rowCount ?? 0 };
}

/** Ubah nilai JSONB database (string / object) menjadi array string. */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v));
    } catch {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }
  return [];
}
