/**
 * Skeleton saat halaman dashboard mengambil data.
 *
 * Sengaja dipasang di dalam area admin, bukan di root layout: `loading.tsx`
 * di root membungkus seluruh halaman dalam Suspense sehingga status HTTP
 * sudah terkirim sebagai 200 sebelum `notFound()` dievaluasi: halaman 404
 * jadi kehilangan status 404-nya. Area admin tidak butuh status itu.
 */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--border)]/50 ${className ?? ""}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-64" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-base)] border border-[var(--border)] p-5"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-3 h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
