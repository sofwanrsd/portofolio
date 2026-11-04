import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Kelas tombol dipakai bersama oleh komponen server dan client. */
export const btnPrimary =
  "accent-gradient inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-[13.5px] font-semibold text-[var(--on-accent)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";
export const btnSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--glass)] px-4 text-[13.5px] font-medium text-[var(--fg)] transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] disabled:opacity-60";
export const btnIcon =
  "grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] hover:text-[var(--fg)] disabled:opacity-50";
export const btnDanger =
  "grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-red-500/60 hover:text-[color-mix(in_oklab,#ef4444_75%,var(--fg))] disabled:opacity-50";

/** Header halaman admin: eyebrow, judul, deskripsi, aksi di kanan. */
export function AdminHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rise flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--accent)]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-[-0.03em]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[13.5px] text-[var(--muted)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Kartu permukaan standar untuk panel admin. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "surface scroll-mt-24 rounded-2xl ring-1 ring-inset ring-[var(--border)]",
        className
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-[14.5px] font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const TONES = {
  accent:
    "bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-[var(--accent)] ring-[color-mix(in_oklab,var(--accent)_35%,transparent)]",
  success:
    "bg-emerald-500/12 text-[color-mix(in_oklab,#10b981_70%,var(--fg))] ring-emerald-500/30",
  muted: "bg-[var(--glass)] text-[var(--muted)] ring-[var(--border)]",
  danger: "bg-red-500/10 text-[color-mix(in_oklab,#ef4444_75%,var(--fg))] ring-red-500/30",
} as const;

export function Pill({
  tone = "muted",
  dot,
  children,
}: {
  tone?: keyof typeof TONES;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        TONES[tone]
      )}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Notifikasi hasil aksi (sukses/gagal) yang terbaca di kedua tema. */
export function Notice({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p
      role="status"
      className={cn(
        "pop rounded-xl px-4 py-3 text-[13px] ring-1 ring-inset",
        ok ? TONES.success : TONES.danger
      )}
    >
      {children}
    </p>
  );
}

/** Avatar inisial dengan warna stabil berdasarkan nama. */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(140deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 75% 40%))`,
      }}
    >
      {initials || "?"}
    </span>
  );
}

export function EmptyPanel({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
      <p className="text-[14px] font-medium">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-[var(--muted)]">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
