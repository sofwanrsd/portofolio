"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { btnPrimary, btnSecondary } from "@/components/admin/admin-ui";

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
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-[color-mix(in_oklab,#ef4444_75%,var(--fg))] ring-1 ring-inset ring-red-500/30">
        <AlertTriangle size={24} aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">Terjadi kesalahan di dashboard</h1>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        Data mungkin belum termuat atau koneksi database bermasalah. Coba muat ulang, atau periksa log server untuk detail teknis.
      </p>

      <pre className="mt-6 max-w-xl overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--glass)] p-4 text-left font-mono text-[12px] leading-relaxed text-[var(--fg)]">
        {error.message}
        {error.digest ? `\nDigest: ${error.digest}` : ""}
      </pre>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className={btnPrimary}>
          <RotateCcw size={15} aria-hidden /> Coba lagi
        </button>
        <a href="/admin" className={btnSecondary}>
          Kembali ke dashboard
        </a>
      </div>
    </div>
  );
}
