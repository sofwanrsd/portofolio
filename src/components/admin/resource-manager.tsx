"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react";
import {
  deleteResource,
  togglePublished,
  type ActionResult,
} from "@/app/actions/admin";
import { ResourceForm } from "./resource-form";
import { renderCell, type ColumnSchema } from "./resource-cells";
import type { FieldSchema, RowData } from "./field-schema";

export function ResourceManager({
  resourceKey,
  title,
  fields,
  columns,
  rows,
  hasPublished = true,
}: {
  resourceKey: string;
  title: string;
  fields: FieldSchema[];
  columns: ColumnSchema[];
  rows: RowData[];
  hasPublished?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<RowData | null>(null);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setResult(null);
  }

  function openEdit(row: RowData) {
    setCreating(false);
    setEditing(row);
    setResult(null);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  function handleDone(response: ActionResult) {
    setResult(response);
    if (response.ok) {
      closeForm();
      router.refresh();
    }
  }

  function handleDelete(id: string) {
    if (!window.confirm("Hapus item ini? Tindakan tidak bisa dibatalkan.")) return;
    startTransition(async () => {
      const response = await deleteResource(resourceKey, id);
      setResult(response);
      router.refresh();
    });
  }

  function handleToggle(id: string, published: boolean) {
    startTransition(async () => {
      const response = await togglePublished(resourceKey, id, published);
      setResult(response);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {rows.length} item tersimpan.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] transition-transform hover:-translate-y-px"
        >
          <Plus size={15} /> Tambah
        </button>
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

      {creating && (
        <ResourceForm
          resourceKey={resourceKey}
          fields={fields}
          row={{}}
          isCreate
          onDone={handleDone}
          onCancel={closeForm}
        />
      )}

      {editing && (
        <ResourceForm
          resourceKey={resourceKey}
          fields={fields}
          row={editing}
          isCreate={false}
          onDone={handleDone}
          onCancel={closeForm}
        />
      )}

      {rows.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-base)] border border-dashed border-[var(--border)] px-5 py-12 text-center text-[13px] text-[var(--muted)]">
          Belum ada data. Klik &ldquo;Tambah&rdquo; untuk membuat item pertama.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--border)]/20">
                  {columns.map((column) => (
                    <th
                      key={column.name}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={String(row.id)}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--border)]/15"
                  >
                    {columns.map((column) => (
                      <td key={column.name} className="px-4 py-3 align-top">
                        {renderCell(column, row)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPublished && "published" in row && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              handleToggle(
                                String(row.id),
                                !Boolean(row.published)
                              )
                            }
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[11.5px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                          >
                            {row.published ? "Draft" : "Publish"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label="Edit"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleDelete(String(row.id))}
                          aria-label="Hapus"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-red-500/60 hover:text-red-400"
                        >
                          {pending ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
