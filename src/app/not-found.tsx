import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden px-5">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="spotlight absolute inset-x-0 top-0 h-[30rem]" />
        <div className="aurora left-[15%] top-10 h-72 w-72 bg-[var(--accent)]" />
        <div className="aurora bottom-0 right-[12%] h-64 w-64 bg-[var(--accent-2)] [animation-delay:-8s]" />
      </div>
      <div className="mx-auto max-w-xl text-center">
        <p aria-hidden className="ghost-num rise text-[clamp(7rem,22vw,13rem)]">404</p>
        <h1 className="rise d2 mt-2 text-balance text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-[-0.03em]">
          Halaman ini <span className="font-display shimmer-text pr-1">tersesat.</span>
        </h1>
        <p className="rise d3 mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          Halaman yang Anda cari sudah dipindah atau tidak pernah ada.
        </p>
        <div className="rise d4 mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="accent-gradient inline-flex h-12 items-center rounded-full px-6 text-[15px] font-semibold text-[var(--on-accent)] transition-transform hover:-translate-y-0.5">
            Kembali ke beranda
          </Link>
          <Link href="/projects" className="inline-flex h-12 items-center rounded-full border border-[var(--border)] bg-[var(--glass)] px-6 text-[15px] font-medium transition-transform hover:-translate-y-0.5">
            Lihat project
          </Link>
        </div>
      </div>
    </section>
  );
}
