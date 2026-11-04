"use client";

import { useTransition } from "react";
import { Loader2, Save, X } from "lucide-react";
import {
  createResource,
  updateResource,
  type ActionResult,
} from "@/app/actions/admin";
import { FieldInput } from "./field-input";
import type { FieldSchema, RowData } from "./field-schema";

export function ResourceForm({
  resourceKey,
  fields,
  row,
  isCreate,
  onDone,
  onCancel,
}: {
  resourceKey: string;
  fields: FieldSchema[];
  row: RowData;
  isCreate: boolean;
  onDone: (result: ActionResult) => void;
  onCancel: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = isCreate
        ? await createResource(resourceKey, formData)
        : await updateResource(resourceKey, String(row.id ?? ""), formData);
      onDone(response);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="mt-6 rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">
          {isCreate ? "Tambah baru" : "Edit item"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup formulir"
          className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--border)]/50"
        >
          <X size={15} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const wide =
            field.type === "textarea" ||
            field.type === "tags" ||
            field.type === "list";
          return (
            <div key={field.name} className={wide ? "md:col-span-2" : ""}>
              <label
                htmlFor={field.name}
                className="mb-1.5 block text-[13px] font-medium"
              >
                {field.label}
                {field.required && (
                  <span className="text-[var(--muted)]"> *</span>
                )}
              </label>
              <FieldInput field={field} row={row} />
              {field.help && (
                <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                  {field.help}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
