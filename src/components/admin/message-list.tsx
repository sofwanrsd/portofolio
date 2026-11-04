"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Check, Loader2, Mail, Trash2 } from "lucide-react";
import {
  deleteMessage,
  updateMessageStatus,
  type ActionResult,
} from "@/app/actions/admin";
import { formatDateTime } from "@/lib/utils";
import type { Message } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  new: "Baru",
  read: "Dibaca",
  archived: "Arsip",
};

export function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">(
    "all"
  );

  const visible = messages.filter((m) =>
    filter === "all" ? true : m.status === filter
  );

  function setStatus(id: string, status: Message["status"]) {
    startTransition(async () => {
      const response = await updateMessageStatus(id, status);
      setResult(response);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Hapus pesan ini?")) return;
    startTransition(async () => {
      const response = await deleteMessage(id);
      setResult(response);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pesan Masuk</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {messages.length} pesan dari form kontak.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1">
          {(["all", "new", "read", "archived"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "rounded-md bg-[var(--accent)]/12 px-3 py-1.5 text-[12px] font-medium text-[var(--accent)]"
                  : "rounded-md px-3 py-1.5 text-[12px] font-medium text-[var(--muted)] hover:text-[var(--fg)]"
              }
            >
              {key === "all" ? "Semua" : STATUS_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <p
          role="status"
          className={
            result.ok
              ? "mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300"
              : "mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
          }
        >
          {result.message}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-base)] border border-dashed border-[var(--border)] px-5 py-12 text-center text-[13px] text-[var(--muted)]">
          Tidak ada pesan pada filter ini.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((message) => (
            <div
              key={message.id}
              className="rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14px] font-semibold">{message.name}</p>
                    <span
                      className={
                        message.status === "new"
                          ? "rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10.5px] font-semibold text-white"
                          : "rounded-full bg-[var(--border)]/60 px-2 py-0.5 text-[10.5px] font-medium text-[var(--muted)]"
                      }
                    >
                      {STATUS_LABEL[message.status]}
                    </span>
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-[12.5px] text-[var(--accent)] hover:underline"
                  >
                    {message.email}
                  </a>
                  <span className="ml-2 text-[11.5px] text-[var(--muted)]">
                    {formatDateTime(message.created_at)}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {message.status === "new" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setStatus(message.id, "read")}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                      aria-label="Tandai dibaca"
                    >
                      <Check size={13} />
                    </button>
                  )}
                  <a
                    href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "Inquiry")}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                    aria-label="Balas via email"
                  >
                    <Mail size={13} />
                  </a>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      setStatus(
                        message.id,
                        message.status === "archived" ? "read" : "archived"
                      )
                    }
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                    aria-label="Ubah status arsip"
                  >
                    <Archive size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(message.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-red-500/60 hover:text-red-400"
                    aria-label="Hapus pesan"
                  >
                    {pending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>

              {message.subject && (
                <p className="mt-3 text-[13px] font-medium">{message.subject}</p>
              )}
              {message.budget && (
                <p className="mt-1 text-[12px] text-[var(--muted)]">
                  Estimasi budget: {message.budget}
                </p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--muted)]">
                {message.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
