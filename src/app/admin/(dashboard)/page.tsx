import Link from "next/link";
import {
  Briefcase,
  FileText,
  MessageSquare,
  Package,
  Plus,
  Settings,
} from "lucide-react";
import { getDashboardStats, getMessages } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const QUICK_LINKS = [
  { href: "/admin/projects", label: "Project", icon: Briefcase },
  { href: "/admin/posts", label: "Artikel", icon: FileText },
  { href: "/admin/services", label: "Layanan", icon: Package },
  { href: "/admin/messages", label: "Pesan", icon: MessageSquare },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default async function AdminDashboardPage() {
  const [stats, messages] = await Promise.all([
    getDashboardStats(),
    getMessages(),
  ]);

  const recent = messages.slice(0, 5);
  const cards = [
    { label: "Project", value: stats.projects, href: "/admin/projects" },
    { label: "Artikel", value: stats.posts, href: "/admin/posts" },
    { label: "Paket Layanan", value: stats.services, href: "/admin/services" },
    { label: "Pesan Masuk", value: stats.messages, href: "/admin/messages" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Ringkasan konten portofolio Anda.
          </p>
        </div>
        <Link
          href="/admin/projects"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] transition-transform hover:-translate-y-px"
        >
          <Plus size={15} /> Tambah Project
        </Link>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--accent)]/40"
          >
            <p className="text-[12px] uppercase tracking-wider text-[var(--muted)]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {stats.newMessages > 0 && (
        <div className="mt-6 rounded-[var(--radius-base)] border border-[var(--accent)]/40 bg-[var(--accent)]/8 px-5 py-4 text-[13px]">
          Anda punya{" "}
          <strong className="font-semibold">
            {stats.newMessages} pesan baru
          </strong>{" "}
          yang belum dibaca.{" "}
          <Link href="/admin/messages" className="underline">
            Lihat sekarang
          </Link>
        </div>
      )}

      <section className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Pesan terbaru</h2>
          <Link
            href="/admin/messages"
            className="text-[12.5px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            Semua pesan
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-[var(--radius-base)] border border-dashed border-[var(--border)] px-5 py-10 text-center text-[13px] text-[var(--muted)]">
            Belum ada pesan masuk.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)]">
            {recent.map((message) => (
              <Link
                key={message.id}
                href="/admin/messages"
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[var(--border)]/25"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium">
                    {message.name}
                    {message.status === "new" && (
                      <span className="ml-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10.5px] font-semibold text-white">
                        Baru
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[12.5px] text-[var(--muted)]">
                    {message.subject || message.message}
                  </p>
                </div>
                <span className="shrink-0 text-[11.5px] text-[var(--muted)]">
                  {formatDateTime(message.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-9">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Akses cepat</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-[13px] font-medium transition-colors hover:border-[var(--accent)]/50"
              >
                <Icon size={14} /> {link.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
