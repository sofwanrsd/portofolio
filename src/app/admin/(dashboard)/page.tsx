import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Circle,
  FileText,
  MessageSquare,
  Package,
  PenSquare,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";
import { getAdminOverview, getDashboardStats, getMessages } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { AdminHeader, Avatar, EmptyPanel, Panel, Pill, btnPrimary, btnSecondary } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

function greeting(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("id-ID", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(date)
  );
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export default async function AdminDashboardPage() {
  const [stats, overview, messages, settings, user] = await Promise.all([
    getDashboardStats(),
    getAdminOverview(),
    getMessages(),
    getSettings(),
    getCurrentUser(),
  ]);

  const now = new Date();
  const today = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(now);
  const firstName = (user?.name || "Admin").split(" ")[0];

  const recent = messages.slice(0, 5);
  const last7 = overview.daily.slice(-7).reduce((a, d) => a + d.total, 0);
  const prev7 = overview.daily.slice(0, 7).reduce((a, d) => a + d.total, 0);
  const maxDaily = Math.max(1, ...overview.daily.map((d) => d.total));

  const cards = [
    { label: "Project", value: stats.projects, hint: `${overview.featured} unggulan`, href: "/admin/projects", icon: Briefcase },
    { label: "Artikel", value: stats.posts, hint: "di blog", href: "/admin/posts", icon: FileText },
    { label: "Paket layanan", value: stats.services, hint: "aktif dijual", href: "/admin/services", icon: Package },
    { label: "Pesan masuk", value: stats.messages, hint: `${stats.newMessages} belum dibaca`, href: "/admin/messages", icon: MessageSquare, highlight: stats.newMessages > 0 },
  ];

  const { site, socials, seo } = settings;
  const checklist = [
    { label: "Foto hero dipasang", done: Boolean(site.heroImage), href: "/admin/settings#hero" },
    { label: "Nama dan tagline diisi", done: Boolean(site.name && site.tagline && site.name !== "Nama Kamu"), href: "/admin/settings#identitas" },
    { label: "Minimal 2 sosial media", done: Object.values(socials).filter(Boolean).length >= 2, href: "/admin/settings#sosial" },
    { label: "Meta description SEO", done: Boolean(seo.metaDescription), href: "/admin/settings#seo" },
    { label: "Minimal 3 project", done: stats.projects >= 3, href: "/admin/projects" },
    { label: "Minimal 1 artikel", done: stats.posts >= 1, href: "/admin/posts" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);

  const quick = [
    { href: "/admin/projects", label: "Project baru", icon: Briefcase },
    { href: "/admin/posts", label: "Tulis artikel", icon: PenSquare },
    { href: "/admin/services", label: "Atur paket", icon: Package },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminHeader
        eyebrow={today}
        title={`${greeting(now)}, ${firstName}`}
        description="Ini ringkasan portofolio Anda hari ini."
        actions={
          <>
            <Link href="/" target="_blank" className={btnSecondary}>
              <ArrowUpRight size={15} aria-hidden /> Lihat situs
            </Link>
            <Link href="/admin/projects" className={btnPrimary}>
              <Plus size={15} aria-hidden /> Tambah project
            </Link>
          </>
        }
      />

      {stats.newMessages > 0 && (
        <Link
          href="/admin/messages"
          className="rise d1 group flex items-center gap-4 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_40%,var(--border))] bg-[color-mix(in_oklab,var(--accent)_9%,transparent)] px-5 py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--accent)_13%,transparent)]"
        >
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--on-accent)]">
            <MessageSquare size={17} aria-hidden />
            <span aria-hidden className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-[var(--accent-2)]" />
          </span>
          <span className="min-w-0 flex-1 text-[13.5px]">
            <strong className="font-semibold">{stats.newMessages} pesan baru</strong> menunggu balasan. Calon klien biasanya
            menunggu jawaban dalam 24 jam.
          </span>
          <span className="hidden text-[13px] font-medium text-[var(--accent)] sm:block">Buka inbox</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, hint, href, icon: Icon, highlight }, i) => (
          <Link
            key={label}
            href={href}
            className={`rise d${i + 2} spot surface group relative overflow-hidden rounded-2xl p-4 ring-1 sm:p-5 ring-inset ring-[var(--border)] transition-transform duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <Icon size={17} aria-hidden />
              </span>
              <ArrowUpRight size={16} aria-hidden className="text-[var(--muted)] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-[12.5px] text-[var(--muted)] sm:mt-5">{label}</p>
            <p className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{value}</p>
            <p className={`mt-2 text-[12px] ${highlight ? "font-medium text-[var(--accent)]" : "text-[var(--muted)]"}`}>{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Aktivitas pesan"
          description="Jumlah pesan dari form kontak, 14 hari terakhir"
          action={
            <Pill tone={last7 >= prev7 ? "success" : "muted"}>
              7 hari: {last7} {prev7 > 0 ? `(sebelumnya ${prev7})` : ""}
            </Pill>
          }
          className="rise d3"
        >
          <figure>
            <div className="flex h-44 items-end gap-1.5 sm:gap-2" role="img" aria-label={`Grafik pesan 14 hari terakhir, total ${overview.daily.reduce((a, d) => a + d.total, 0)} pesan`}>
              {overview.daily.map((d, i) => (
                <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[10.5px] font-medium tabular-nums text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100">
                    {d.total}
                  </span>
                  <span
                    className={`bar-grow w-full rounded-md ${d.total > 0 ? "accent-gradient" : "bg-[var(--border)]"}`}
                    style={{ height: `${Math.max(4, (d.total / maxDaily) * 100)}%`, animationDelay: `${i * 35}ms` }}
                  />
                </div>
              ))}
            </div>
            <figcaption className="mt-2 flex justify-between gap-1.5 text-[10.5px] text-[var(--muted)] sm:gap-2">
              {overview.daily.map((d, i) => (
                <span key={d.day} className="flex-1 text-center">
                  {i % 2 === 1 || i === overview.daily.length - 1 ? dayLabel(d.day) : ""}
                </span>
              ))}
            </figcaption>
          </figure>
        </Panel>

        <Panel title="Kelengkapan situs" description={`${doneCount} dari ${checklist.length} beres`} className="rise d4">
          <div className="flex items-center gap-4">
            <div
              className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(var(--accent) ${percent * 3.6}deg, var(--border) 0deg)` }}
              role="img"
              aria-label={`${percent} persen lengkap`}
            >
              <span className="grid h-[4.1rem] w-[4.1rem] place-items-center rounded-full bg-[var(--card)] text-[17px] font-semibold tabular-nums">
                {percent}%
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              {percent === 100 ? "Semua beres. Situs siap dipamerkan." : "Lengkapi poin di bawah supaya situs terlihat lebih meyakinkan."}
            </p>
          </div>
          <ul className="mt-5 space-y-1">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors hover:bg-[var(--glass)]">
                  {item.done ? (
                    <CheckCircle2 size={16} aria-hidden className="shrink-0 text-[color-mix(in_oklab,#10b981_75%,var(--fg))]" />
                  ) : (
                    <Circle size={16} aria-hidden className="shrink-0 text-[var(--muted)]" />
                  )}
                  <span className={item.done ? "text-[var(--muted)] line-through decoration-[var(--border)]" : ""}>{item.label}</span>
                  <span className="sr-only">{item.done ? "(selesai)" : "(belum)"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Pesan terbaru"
          action={
            <Link href="/admin/messages" className="link-grow text-[12.5px] font-medium text-[var(--accent)]">
              Semua pesan
            </Link>
          }
          className="rise d5"
        >
          {recent.length === 0 ? (
            <EmptyPanel title="Belum ada pesan" description="Pesan dari form kontak akan muncul di sini." />
          ) : (
            <ul className="-mx-2 divide-y divide-[var(--border)]">
              {recent.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/messages?id=${m.id}`} className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[var(--glass)]">
                    <Avatar name={m.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-[13.5px] font-medium">
                        <span className="truncate">{m.name}</span>
                        {m.status === "new" && <Pill tone="accent" dot>Baru</Pill>}
                      </p>
                      <p className="truncate text-[12.5px] text-[var(--muted)]">{m.subject || m.message}</p>
                    </div>
                    <span className="hidden shrink-0 text-[11.5px] text-[var(--muted)] sm:block">{formatDateTime(m.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Status konten" className="rise d6">
            <ul className="space-y-3.5">
              {overview.content.map((c) => {
                const total = c.published + c.draft;
                const pct = total ? (c.published / total) * 100 : 0;
                return (
                  <li key={c.kind}>
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className="font-medium">{c.kind}</span>
                      <span className="tabular-nums text-[var(--muted)]">
                        {c.published} tayang{c.draft > 0 ? ` · ${c.draft} draft` : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                      <span className="accent-gradient block h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Aksi cepat" className="rise d7">
            <div className="grid grid-cols-2 gap-2">
              {quick.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--glass)] p-3.5 text-[13px] font-medium transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))]"
                >
                  <Icon size={16} aria-hidden className="text-[var(--accent)] transition-transform group-hover:scale-110" />
                  {label}
                </Link>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-[var(--muted)]">
              <Sparkles size={14} aria-hidden className="mt-0.5 shrink-0 text-[var(--accent)]" />
              {overview.skills} skill dan {overview.experiences} pengalaman tampil di halaman Tentang.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
