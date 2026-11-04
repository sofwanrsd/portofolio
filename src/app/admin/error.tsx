"use client";

import { useEffect } from "react";

/**
 * Error boundary admin. Menampilkan detail teknis (aman untuk admin)
 * plus tombol kembali ke dashboard.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] segment error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--border)]/40 text-lg">
        !
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        Terjadi kesalahan di dashboard
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        Data mungkin belum termuat atau koneksi database bermasalah. Coba
        muat ulang, atau periksa log server untuk detail teknis.
      </p>

      <pre className="mt-6 max-w-xl overflow-x-auto rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--border)]/30 p-4 text-left font-mono text-[12px] leading-relaxed text-[var(--fg)]">
        {error.message}
        {error.digest ? `\nDigest: ${error.digest}` : ""}
      </pre>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
        >
          Coba lagi
        </button>
        <a
          href="/admin"
          className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--border)]/40"
        >
          Kembali ke dashboard
        </a>
      </div>
    </div>
  );
}
