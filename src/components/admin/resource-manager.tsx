"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, ImageIcon, Loader2, Plus, Search, Trash2 } from "lucide-react";
import {
  deleteResource,
  togglePublished,
  type ActionResult,
} from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import { ResourceForm } from "./resource-form";
import { renderCell, type ColumnSchema } from "./resource-cells";
import type { FieldSchema, RowData } from "./field-schema";
import { AdminHeader, EmptyPanel, Notice, btnDanger, btnIcon, btnPrimary } from "./admin-ui";
import { useConfirm } from "./confirm-dialog";

type Filter = "all" | "published" | "draft";

export function ResourceManager({
  resourceKey,
  title,
  singular,
  description,
  fields,
  columns,
  rows,
  hasPublished = true,
}: {
  resourceKey: string;
  title: string;
  singular: string;
  description?: string;
  fields: FieldSchema[];
  columns: ColumnSchema[];
  rows: RowData[];
  hasPublished?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<RowData | null>(null);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [queryText, setQueryText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirm, confirmDialog] = useConfirm();

  const canPublish = hasPublished && rows.some((r) => "published" in r);
  const counts = useMemo(
    () => ({
      all: rows.length,
      published: rows.filter((r) => r.published).length,
      draft: rows.filter((r) => "published" in r && !r.published).length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "published" && !row.published) return false;
      if (filter === "draft" && row.published) return false;
      if (!q) return true;
      return columns.some((c) => {
        const v = row[c.name];
        return (Array.isArray(v) ? v.join(" ") : String(v ?? "")).toLowerCase().includes(q);
      });
    });
  }, [rows, columns, filter, queryText]);

  const closeForm = useCallback(() => {
    setEditing(null);
    setCreating(false);
  }, []);

  function handleDone(response: ActionResult) {
    setResult(response);
    if (response.ok) {
      closeForm();
      router.refresh();
    }
  }

  async function handleDelete(row: RowData) {
    const label = String(row.title || row.name || row.role || "item ini");
    const ok = await confirm({
      title: `Hapus "${label}"?`,
      description: `${singular.charAt(0).toUpperCase()}${singular.slice(1)} ini akan dihapus permanen dan langsung hilang dari website. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: `Hapus ${singular.toLowerCase()}`,
    });
    if (!ok) return;
    const id = String(row.id);
    setBusyId(id);
    startTransition(async () => {
      const response = await deleteResource(resourceKey, id);
      setResult(response);
      setBusyId(null);
      router.refresh();
    });
  }

  function handleToggle(row: RowData) {
    const id = String(row.id);
    setBusyId(id);
    startTransition(async () => {
      const response = await togglePublished(resourceKey, id, !row.published);
      setResult(response);
      setBusyId(null);
      router.refresh();
    });
  }

  // Kolom status ditangani oleh switch, jadi tidak ditampilkan dua kali.
  const shownColumns = columns.filter((c) => !(canPublish && c.name === "published"));
  const [primary, ...rest] = shownColumns;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {confirmDialog}
      <AdminHeader
        eyebrow="Kelola konten"
        title={title}
        description={description ?? `${rows.length} ${singular} tersimpan.`}
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setCreating(true);
              setResult(null);
            }}
            className={btnPrimary}
          >
            <Plus size={15} aria-hidden /> Tambah {singular}
          </button>
        }
      />

      {result && <Notice ok={result.ok}>{result.message}</Notice>}

      <div className="rise d2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Cari {title.toLowerCase()}</span>
          <Search size={15} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={`Cari ${title.toLowerCase()}...`}
            className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--glass)] pl-10 pr-3 text-[13.5px] outline-none transition-colors focus:border-[var(--accent)]"
          />
        </label>
        {canPublish && (
          <div role="group" aria-label="Filter status" className="flex rounded-xl border border-[var(--border)] bg-[var(--glass)] p-1">
            {([
              ["all", "Semua"],
              ["published", "Tayang"],
              ["draft", "Draft"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-all",
                  filter === key ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm ring-1 ring-[var(--border)]" : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                {label} <span className="tabular-nums opacity-60">{counts[key]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyPanel
          title={`Belum ada ${singular}`}
          description={`Tambahkan ${singular} pertama Anda. Item yang ditandai tayang langsung muncul di website.`}
          action={
            <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
              <Plus size={15} aria-hidden /> Tambah {singular}
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyPanel title="Tidak ada yang cocok" description="Coba kata kunci lain atau ubah filter status." />
      ) : (
        <div className="rise d3 surface overflow-hidden rounded-2xl ring-1 ring-inset ring-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <caption className="sr-only">Daftar {title}</caption>
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {shownColumns.map((column) => (
                    <th key={column.name} scope="col" className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                      {column.label}
                    </th>
                  ))}
                  {canPublish && (
                    <th scope="col" className="px-5 py-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                      Tayang
                    </th>
                  )}
                  <th scope="col" className="px-5 py-3 text-right font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const id = String(row.id);
                  const busy = busyId === id;
                  const cover = typeof row.cover_image === "string" ? row.cover_image : null;
                  const label = String(row[primary?.name ?? "id"] ?? "");
                  return (
                    <tr key={id} className={cn("group border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--glass)]", busy && "opacity-60")}>
                      {primary && (
                        <td className="px-5 py-3.5 align-middle">
                          <div className="flex items-center gap-3">
                            {"cover_image" in row && (
                              <span className="grid h-11 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--glass)]">
                                {cover ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                                ) : (
                                  <ImageIcon size={15} aria-hidden className="text-[var(--muted)]" />
                                )}
                              </span>
                            )}
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setEditing(row)}
                                className="block max-w-[22rem] truncate text-left text-[13.5px] font-medium transition-colors hover:text-[var(--accent)]"
                              >
                                {label}
                              </button>
                              {typeof row.slug === "string" && row.slug && (
                                <p className="truncate font-mono text-[11px] text-[var(--muted)]">/{row.slug}</p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}
                      {rest.map((column) => (
                        <td key={column.name} className="px-5 py-3.5 align-middle">
                          {renderCell(column, row)}
                        </td>
                      ))}
                      {canPublish && (
                        <td className="px-5 py-3.5 align-middle">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(row.published)}
                            aria-label={`Tayangkan ${label}`}
                            disabled={busy}
                            onClick={() => handleToggle(row)}
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300",
                              row.published ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                                row.published ? "translate-x-[22px]" : "translate-x-0.5"
                              )}
                            />
                          </button>
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" onClick={() => setEditing(row)} aria-label={`Edit ${label}`} className={btnIcon}>
                            <Edit3 size={14} aria-hidden />
                          </button>
                          <button type="button" disabled={busy} onClick={() => handleDelete(row)} aria-label={`Hapus ${label}`} className={btnDanger}>
                            {busy ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Trash2 size={14} aria-hidden />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[var(--border)] px-5 py-3 text-[12px] text-[var(--muted)]" aria-live="polite">
            Menampilkan {visible.length} dari {rows.length} {singular}
          </p>
        </div>
      )}

      {(creating || editing) && (
        <ResourceForm
          key={editing ? String(editing.id) : "new"}
          resourceKey={resourceKey}
          singular={singular}
          fields={fields}
          row={editing ?? {}}
          isCreate={!editing}
          onDone={handleDone}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
