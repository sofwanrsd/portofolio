"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui";

/**
 * Error boundary segment-level untuk halaman publik.
 * Menampilkan pesan ramah + tombol "Coba lagi" tanpa membocorkan stack trace.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] segment error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--border)]/40 text-lg">
        !
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        Halaman ini gagal dimuat
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
        Terjadi kesalahan saat mengambil data. Silakan coba lagi, atau hubungi
        saya langsung bila masalah berlanjut.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
        >
          Coba lagi
        </button>
        <a
          href="/contact"
          className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--fg)] transition-colors hover:bg-[var(--border)]/40"
        >
          Hubungi saya
        </a>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-[11px] text-[var(--muted)]">
          Ref: {error.digest}
        </p>
      )}
    </Container>
  );
}
