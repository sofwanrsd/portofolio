"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, ArrowLeft, Inbox, Loader2, Mail, MailOpen, Search, Trash2, Wallet } from "lucide-react";
import {
  deleteMessage,
  updateMessageStatus,
  type ActionResult,
} from "@/app/actions/admin";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { AdminHeader, Avatar, EmptyPanel, Notice, Pill, btnDanger, btnIcon, btnPrimary } from "./admin-ui";
import { useConfirm } from "./confirm-dialog";

type Filter = "all" | "new" | "read" | "archived";

const STATUS_LABEL: Record<Message["status"], string> = {
  new: "Baru",
  read: "Dibaca",
  archived: "Arsip",
};

function timeAgo(value: string) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} hari`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(value));
}

export function MessageList({ messages, initialId }: { messages: Message[]; initialId?: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId && messages.some((m) => m.id === initialId) ? initialId : null
  );

  const counts = useMemo(
    () => ({
      all: messages.length,
      new: messages.filter((m) => m.status === "new").length,
      read: messages.filter((m) => m.status === "read").length,
      archived: messages.filter((m) => m.status === "archived").length,
    }),
    [messages]
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (!needle) return true;
      return [m.name, m.email, m.subject, m.message].join(" ").toLowerCase().includes(needle);
    });
  }, [messages, filter, q]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  function run(action: () => Promise<ActionResult>, after?: () => void) {
    startTransition(async () => {
      const response = await action();
      setResult(response);
      after?.();
      router.refresh();
    });
  }

  // Membuka pesan baru otomatis menandainya sebagai dibaca, sekali per pesan,
  // supaya "Tandai belum dibaca" tidak langsung dibatalkan lagi.
  const [confirm, confirmDialog] = useConfirm();
  const autoRead = useRef(new Set<string>());
  useEffect(() => {
    if (selected?.status === "new" && !autoRead.current.has(selected.id)) {
      autoRead.current.add(selected.id);
      startTransition(async () => {
        await updateMessageStatus(selected.id, "read");
        router.refresh();
      });
    }
  }, [selected?.id, selected?.status, router]);

  async function remove(m: Message) {
    const ok = await confirm({
      title: `Hapus pesan dari ${m.name}?`,
      description: "Pesan akan dihapus permanen dari kotak masuk. Gunakan Arsip bila hanya ingin menyembunyikannya.",
      confirmLabel: "Hapus pesan",
    });
    if (!ok) return;
    run(() => deleteMessage(m.id), () => setSelectedId(null));
  }

  const tabs: [Filter, string][] = [
    ["all", "Semua"],
    ["new", "Baru"],
    ["read", "Dibaca"],
    ["archived", "Arsip"],
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {confirmDialog}
      <AdminHeader
        eyebrow="Kotak masuk"
        title="Pesan"
        description={`${messages.length} pesan dari form kontak, ${counts.new} belum dibaca.`}
      />

      {result && !result.ok && <Notice ok={false}>{result.message}</Notice>}

      <div className="rise d2 surface grid min-h-[34rem] overflow-hidden rounded-2xl ring-1 ring-inset ring-[var(--border)] lg:h-[calc(100dvh-15rem)] lg:grid-cols-[22rem_1fr]">
        {/* Daftar */}
        <div className={cn("flex min-h-0 min-w-0 flex-col border-[var(--border)] lg:border-r", selected && "hidden lg:flex")}>
          <div className="space-y-3 border-b border-[var(--border)] p-4">
            <label className="relative block">
              <span className="sr-only">Cari pesan</span>
              <Search size={15} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama, email, isi..."
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--glass)] pl-10 pr-3 text-[13.5px] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div role="tablist" aria-label="Filter status pesan" className="flex gap-1 overflow-x-auto">
              {tabs.map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    "shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                    filter === key
                      ? "bg-[color-mix(in_oklab,var(--accent)_15%,transparent)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]"
                  )}
                >
                  {label} <span className="tabular-nums opacity-70">{counts[key]}</span>
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-[13px] text-[var(--muted)]">
              Tidak ada pesan pada filter ini.
            </div>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-[var(--border)] overflow-y-auto">
              {visible.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(m.id)}
                    aria-current={selectedId === m.id ? "true" : undefined}
                    className={cn(
                      "relative flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors",
                      selectedId === m.id ? "bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]" : "hover:bg-[var(--glass)]"
                    )}
                  >
                    {m.status === "new" && (
                      <span aria-hidden className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--accent)]" />
                    )}
                    <Avatar name={m.name} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-[13.5px]", m.status === "new" ? "font-semibold" : "font-medium")}>{m.name}</span>
                        <span className="shrink-0 text-[11px] text-[var(--muted)]">{timeAgo(m.created_at)}</span>
                      </span>
                      <span className={cn("block truncate text-[12.5px]", m.status === "new" ? "text-[var(--fg)]" : "text-[var(--muted)]")}>
                        {m.subject || "(tanpa subjek)"}
                      </span>
                      <span className="block truncate text-[12px] text-[var(--muted)]">{m.message}</span>
                    </span>
                    {m.status === "new" && <span className="sr-only">(belum dibaca)</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className={cn("min-h-0 min-w-0 flex-col", selected ? "flex" : "hidden lg:flex")}>
          {!selected ? (
            <div className="grid flex-1 place-items-center p-10">
              <div className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)]">
                  <Inbox size={22} aria-hidden />
                </span>
                <p className="mt-4 text-[14px] font-medium">Pilih pesan untuk dibaca</p>
                <p className="mt-1 text-[12.5px] text-[var(--muted)]">Pesan baru otomatis ditandai dibaca saat dibuka.</p>
              </div>
            </div>
          ) : (
            <article key={selected.id} className="fade flex min-h-0 flex-1 flex-col">
              <header className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] px-5 py-3">
                <button type="button" onClick={() => setSelectedId(null)} aria-label="Kembali ke daftar" className={cn(btnIcon, "lg:hidden")}>
                  <ArrowLeft size={15} aria-hidden />
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  {pending && <Loader2 size={15} className="animate-spin text-[var(--muted)]" aria-label="Memproses" />}
                  {selected.status !== "new" && selected.status !== "archived" && (
                    <button type="button" disabled={pending} onClick={() => run(() => updateMessageStatus(selected.id, "new"), () => setSelectedId(null))} aria-label="Tandai belum dibaca" title="Tandai belum dibaca" className={btnIcon}>
                      <MailOpen size={15} aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => updateMessageStatus(selected.id, selected.status === "archived" ? "read" : "archived"))}
                    aria-label={selected.status === "archived" ? "Keluarkan dari arsip" : "Arsipkan"}
                    title={selected.status === "archived" ? "Keluarkan dari arsip" : "Arsipkan"}
                    className={btnIcon}
                  >
                    {selected.status === "archived" ? <ArchiveRestore size={15} aria-hidden /> : <Archive size={15} aria-hidden />}
                  </button>
                  <button type="button" disabled={pending} onClick={() => remove(selected)} aria-label="Hapus pesan" title="Hapus pesan" className={btnDanger}>
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
                <div className="flex flex-wrap items-start gap-4">
                  <Avatar name={selected.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[18px] font-semibold tracking-tight">{selected.subject || "(tanpa subjek)"}</h2>
                    <p className="mt-1 text-[13px]">
                      <span className="font-medium">{selected.name}</span>{" "}
                      <a href={`mailto:${selected.email}`} className="link-grow text-[var(--accent)]">
                        {selected.email}
                      </a>
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--muted)]">{formatDateTime(selected.created_at)}</p>
                  </div>
                  <Pill tone={selected.status === "new" ? "accent" : selected.status === "archived" ? "muted" : "success"} dot>
                    {STATUS_LABEL[selected.status]}
                  </Pill>
                </div>

                {selected.budget && (
                  <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--glass)] px-3 py-2 text-[13px]">
                    <Wallet size={15} aria-hidden className="text-[var(--accent)]" />
                    Estimasi budget: <strong className="font-semibold">{selected.budget}</strong>
                  </p>
                )}

                <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 text-[14px] leading-relaxed">
                  {selected.message}
                </div>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 md:px-8">
                <p className="text-[12px] text-[var(--muted)]">Balasan dibuka di aplikasi email Anda.</p>
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || "Pertanyaan project"}`)}`}
                  className={btnPrimary}
                >
                  <Mail size={15} aria-hidden /> Balas via email
                </a>
              </footer>
            </article>
          )}
        </div>
      </div>

      {messages.length === 0 && <EmptyPanel title="Belum ada pesan" description="Pesan dari form kontak akan muncul di sini." />}
    </div>
  );
}
