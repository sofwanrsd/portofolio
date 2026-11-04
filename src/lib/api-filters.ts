/**
 * Filter query string untuk endpoint daftar publik (/api/projects, /api/posts).
 * Nilai yang tidak valid diabaikan, bukan dilempar sebagai error, supaya
 * klien lama tetap mendapat data.
 */

export const MAX_LIMIT = 50;

/** Ubah ?limit= menjadi bilangan bulat 1..MAX_LIMIT, atau null bila kosong/tidak valid. */
export function parseLimit(raw: string | null): number | null {
  if (raw === null || raw.trim() === "") return null;
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 1) return null;
  return Math.min(n, MAX_LIMIT);
}

/** Bandingkan teks tanpa memedulikan huruf besar/kecil dan spasi di tepi. */
function same(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function filterProjects<T extends { category: string }>(
  items: T[],
  params: URLSearchParams
): T[] {
  const category = params.get("category");
  const limit = parseLimit(params.get("limit"));
  let out = category ? items.filter((p) => same(p.category, category)) : items;
  if (limit !== null) out = out.slice(0, limit);
  return out;
}

export function filterPosts<T extends { tags: string[] }>(
  items: T[],
  params: URLSearchParams
): T[] {
  const tag = params.get("tag");
  const limit = parseLimit(params.get("limit"));
  let out = tag ? items.filter((p) => p.tags.some((t) => same(t, tag))) : items;
  if (limit !== null) out = out.slice(0, limit);
  return out;
}
