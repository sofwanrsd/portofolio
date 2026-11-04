/**
 * Utilitas slug untuk URL project, artikel, dan paket layanan.
 * Di dokumentasikan pada PROJECT/04-ARCHITECTURE/system-architecture.md §4.2.
 */

/**
 * Ubah teks bebas menjadi slug URL yang aman.
 * - lowercase, ASCII-only (tanpa aksen)
 * - spasi & simbol menjadi tanda hubung
 * - maksimal 80 karakter
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Pastikan slug unik pada sebuah tabel.
 * Jika sudah dipakai, tambahkan sufiks angka (-2, -3, ...) sampai bebas.
 *
 * @param table Nama tabel Postgres (hanya dari allowlist internal, bukan input user).
 * @param baseSlug Slug yang candidat.
 * @param excludeId Id baris yang sedang diedit (agar slug miliknya sendiri tidak bentrok).
 */
export async function uniqueSlug(
  table: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const { queryOne } = await import("./db");

  const base = slugify(baseSlug) || "item";

  let candidate = base;
  let suffix = 2;

  // Batas 50 percobaan mencegah loop tak terbatas bila tabel penuh.
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM ${table} WHERE slug = $1${excludeId ? " AND id <> $2" : ""} LIMIT 1`,
      excludeId ? [candidate, excludeId] : [candidate]
    );

    if (!existing) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  // Fallback terakhir: slug + timestamp agar tetap unik.
  return `${base}-${Date.now().toString(36)}`;
}
