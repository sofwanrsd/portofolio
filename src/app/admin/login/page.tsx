import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Inbox, LayoutGrid, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

const POINTS = [
  { icon: LayoutGrid, text: "Kelola project, artikel, dan paket layanan dari satu tempat" },
  { icon: Inbox, text: "Inbox pesan calon klien lengkap dengan budget" },
  { icon: BarChart3, text: "Ringkasan aktivitas dan kelengkapan situs" },
];

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  const { site } = await getSettings();
  const logo = site.logoText || site.name.slice(0, 2).toUpperCase();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panel brand */}
      <aside className="relative hidden overflow-hidden border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-grid bg-grid-mask absolute inset-0 opacity-60" />
          <div className="aurora -left-10 top-10 h-80 w-80 bg-[var(--accent)]" />
          <div className="aurora bottom-0 right-0 h-72 w-72 bg-[var(--accent-2)] [animation-delay:-8s]" />
        </div>

        <div className="rise relative flex items-center gap-3">
          <span className="accent-gradient grid h-10 w-10 place-items-center rounded-xl text-[14px] font-bold text-[var(--on-accent)]">
            {logo}
          </span>
          <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
        </div>

        <div className="relative max-w-md">
          <p className="rise d1 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">Studio admin</p>
          <h2 className="rise d2 mt-4 text-[clamp(2.2rem,3.6vw,3.2rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            Semua isi portofolio, <span className="font-display shimmer-text pr-1">satu tempat.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map(({ icon: Icon, text }, i) => (
              <li key={text} className={`rise d${i + 3} flex items-start gap-3 text-[14px] text-[var(--muted)]`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)]">
                  <Icon size={16} aria-hidden />
                </span>
                <span className="pt-2">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[12px] text-[var(--muted)]">
          <ShieldCheck size={14} aria-hidden className="text-[var(--accent)]" />
          Sesi ditandatangani (JWT) dan disimpan di cookie HTTP-only selama 7 hari.
        </p>
      </aside>

      {/* Form */}
      <section aria-label="Form login" className="relative flex items-center justify-center px-5 py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="spotlight absolute inset-x-0 top-0 h-80" />
        </div>
        <div className="relative w-full max-w-sm">
          <div className="rise mb-8">
            <span className="accent-gradient grid h-11 w-11 place-items-center rounded-xl text-sm font-bold text-[var(--on-accent)] lg:hidden">
              {logo}
            </span>
            <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.03em] lg:mt-0">Selamat datang kembali</h1>
            <p className="mt-2 text-[14px] text-[var(--muted)]">Masuk untuk mengelola konten {site.name}.</p>
          </div>

          <div className="rise d2 surface rounded-2xl p-6 ring-1 ring-inset ring-[var(--border)]">
            <LoginForm />
          </div>

          <p className="rise d3 mt-6 text-center text-[13px] text-[var(--muted)]">
            <Link href="/" className="link-grow hover:text-[var(--fg)]">
              Kembali ke website
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
