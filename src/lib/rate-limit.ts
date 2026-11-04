/**
 * Rate limiter sliding-window in-memory.
 *
 * Penyimpanan per instance: pada Vercel multi-region state tidak dibagi antar
 * instance. Untuk v1 ini cukup menahan bot dasar; naikkan ke Upstash Redis bila
 * proteksi lintas-region dibutuhkan (lihat PROJECT/04-ARCHITECTURE/security-design.md).
 */

export type RateLimitResult = {
  /** true bila permintaan masih diperbolehkan. */
  allowed: boolean;
  /** Batas maksimum permintaan dalam window. */
  limit: number;
  /** Sisa kuota yang tersedia. */
  remaining: number;
  /** Epoch ms saat jendela berikutnya bergeser. */
  resetAt: number;
};

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

/**
 * Catat satu permintaan dan kembalikan status kuota.
 * Permintaan yang ditolak TIDAK dicatat, sehingga klien yang terus mencoba
 * tidak memperpanjang jendela secara tak terbatas.
 */
export function consume(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  const oldest = timestamps[0];
  const resetAt = (oldest ?? now) + windowMs;

  if (timestamps.length >= limit) {
    buckets.set(key, { timestamps });
    return { allowed: false, limit, remaining: 0, resetAt };
  }

  timestamps.push(now);
  buckets.set(key, { timestamps });
  return {
    allowed: true,
    limit,
    remaining: limit - timestamps.length,
    resetAt,
  };
}

/** Periksa kuota tanpa menambah hit. */
export function peek(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  const timestamps = (bucket?.timestamps ?? []).filter((t) => now - t < windowMs);
  const oldest = timestamps[0];
  return {
    allowed: timestamps.length < limit,
    limit,
    remaining: Math.max(0, limit - timestamps.length),
    resetAt: (oldest ?? now) + windowMs,
  };
}

/** Hapus riwayat hit untuk satu kunci (dipanggil setelah login berhasil). */
export function reset(key: string): void {
  buckets.delete(key);
}

/** Bersihkan bucket yang sudah kedaluwarsa agar Map tidak tumbuh tanpa batas. */
export function sweep(windowMs: number): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    const live = bucket.timestamps.filter((t) => now - t < windowMs);
    if (live.length === 0) buckets.delete(key);
    else buckets.set(key, { timestamps: live });
  }
}
