import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-[13px] uppercase tracking-widest text-[var(--muted)]">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 text-[14px] text-[var(--muted)]">
        Halaman yang Anda cari sudah dipindah atau tidak pernah ada.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-10 items-center rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)]"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
