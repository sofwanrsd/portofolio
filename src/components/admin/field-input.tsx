"use client";

import { INPUT_BASE } from "./field-schema";
import type { FieldSchema, RowData } from "./field-schema";

export function FieldInput({
  field,
  row,
}: {
  field: FieldSchema;
  row: RowData;
}) {
  const raw = row[field.name];
  const value: string =
    raw === null || raw === undefined
      ? ""
      : field.type === "tags" || field.type === "list"
        ? Array.isArray(raw)
          ? raw.join("\n")
          : String(raw)
        : field.type === "boolean"
          ? raw
            ? "true"
            : "false"
          : String(raw);

  if (
    field.type === "textarea" ||
    field.type === "tags" ||
    field.type === "list"
  ) {
    const mono = field.type !== "textarea";
    return (
      <textarea
        id={field.name}
        name={field.name}
        rows={field.rows ?? 4}
        defaultValue={value}
        placeholder={field.placeholder ?? (mono ? "Satu item per baris" : undefined)}
        className={`${INPUT_BASE} resize-y py-2.5${mono ? " font-mono text-[12.5px]" : ""}`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={field.name}
        name={field.name}
        defaultValue={value || String(field.default ?? "")}
        className={`${INPUT_BASE} h-10`}
      >
        {!field.required && <option value="">- Tidak diisi -</option>}
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "boolean") {
    // Saat membuat item baru, `raw` belum ada: pakai default dari definisi field
    // supaya "Publish" tidak otomatis jatuh ke "Tidak".
    const boolValue =
      raw === null || raw === undefined
        ? String(field.default ?? false)
        : raw
          ? "true"
          : "false";

    return (
      <select
        id={field.name}
        name={field.name}
        defaultValue={boolValue}
        className={`${INPUT_BASE} h-10`}
      >
        <option value="true">Ya</option>
        <option value="false">Tidak</option>
      </select>
    );
  }

  const inputType =
    field.type === "number" ? "number" : field.type === "date" ? "date" : "text";

  return (
    <input
      id={field.name}
      name={field.name}
      type={inputType}
      defaultValue={value}
      placeholder={field.placeholder}
      className={`${INPUT_BASE} h-10`}
    />
  );
}
