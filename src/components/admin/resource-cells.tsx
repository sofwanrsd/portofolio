"use client";

import type { FieldSchema, RowData } from "./field-schema";

export type ColumnSchema = {
  name: string;
  label: string;
  type?: FieldSchema["type"];
};

export function renderCell(column: ColumnSchema, row: RowData) {
  const value = row[column.name];

  if (column.type === "boolean") {
    return value ? (
      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
        Aktif
      </span>
    ) : (
      <span className="rounded-full bg-[var(--border)]/60 px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">
        Draft
      </span>
    );
  }

  if (column.type === "tags") {
    const items = Array.isArray(value) ? value : [];
    if (items.length === 0) return <span className="text-[var(--muted)]">-</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {items.slice(0, 3).map((item) => (
          <span
            key={String(item)}
            className="rounded-full bg-[var(--border)]/60 px-2 py-0.5 text-[10.5px] text-[var(--muted)]"
          >
            {String(item)}
          </span>
        ))}
      </span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-[var(--muted)]">-</span>;
  }

  const text = String(value);
  return (
    <span className="line-clamp-2 text-[13px]">
      {text.length > 90 ? `${text.slice(0, 90)}…` : text}
    </span>
  );
}
