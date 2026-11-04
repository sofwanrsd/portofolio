"use client";

import { useEffect, useRef, useTransition } from "react";
import { Loader2, Save, X } from "lucide-react";
import {
  createResource,
  updateResource,
  type ActionResult,
} from "@/app/actions/admin";
import { FieldInput } from "./field-input";
import type { FieldSchema, RowData } from "./field-schema";
import { btnPrimary, btnSecondary } from "./admin-ui";

/** Form tambah/edit yang tampil sebagai panel samping (drawer). */
export function ResourceForm({
  resourceKey,
  singular,
  fields,
  row,
  isCreate,
  onDone,
  onCancel,
}: {
  resourceKey: string;
  singular: string;
  fields: FieldSchema[];
  row: RowData;
  isCreate: boolean;
  onDone: (result: ActionResult) => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `${resourceKey}-form-title`;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>("input, textarea, select");
    first?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      // Jaga fokus tetap di dalam panel saat menekan Tab.
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>(
          "input, textarea, select, button, a[href]"
        );
        if (items.length === 0) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onCancel]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = isCreate
        ? await createResource(resourceKey, formData)
        : await updateResource(resourceKey, String(row.id ?? ""), formData);
      onDone(response);
    });
  }

  const heading = isCreate ? `Tambah ${singular}` : `Edit ${singular}`;
  const subtitle = !isCreate && (row.title || row.name || row.role) ? String(row.title || row.name || row.role) : null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        aria-label="Tutup formulir"
        tabIndex={-1}
        onClick={onCancel}
        className="fade absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        className="drawer-in absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-[var(--border)] bg-[var(--bg)] shadow-[-30px_0_80px_-40px_rgba(0,0,0,0.8)]"
      >
        <form action={handleSubmit} className="flex h-full flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--accent)]">
                {isCreate ? "Item baru" : "Mengedit"}
              </p>
              <h2 id={titleId} className="mt-1 text-[18px] font-semibold tracking-tight">
                {heading}
              </h2>
              {subtitle && <p className="mt-0.5 truncate text-[13px] text-[var(--muted)]">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup formulir"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
            >
              <X size={16} aria-hidden />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((field) => {
                const wide =
                  field.type === "textarea" ||
                  field.type === "tags" ||
                  field.type === "list";
                return (
                  <div key={field.name} className={wide ? "sm:col-span-2" : ""}>
                    <label htmlFor={field.name} className="mb-1.5 block text-[13px] font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-[var(--accent)]" aria-hidden> *</span>
                      )}
                      {field.required && <span className="sr-only"> (wajib)</span>}
                    </label>
                    <FieldInput field={field} row={row} />
                    {field.help && (
                      <p className="mt-1.5 text-[11.5px] text-[var(--muted)]">{field.help}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_60%,transparent)] px-6 py-4">
            <p className="hidden text-[12px] text-[var(--muted)] sm:block">
              Tekan <kbd className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10.5px]">Esc</kbd> untuk menutup
            </p>
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={onCancel} className={btnSecondary}>
                Batal
              </button>
              <button type="submit" disabled={pending} className={btnPrimary}>
                {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
