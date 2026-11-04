"use client";

import { Star } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { FieldSchema, RowData } from "./field-schema";
import { Pill } from "./admin-ui";

export type ColumnSchema = {
  name: string;
  label: string;
  type?: FieldSchema["type"];
};

const CATEGORY_LABELS: Record<string, string> = {
  web: "Web App",
  ui: "UI/UX",
  automation: "Automation",
  mobile: "Mobile",
  ai: "AI",
  other: "Lainnya",
};

export function renderCell(column: ColumnSchema, row: RowData) {
  const value = row[column.name];

  if (column.type === "boolean") {
    return value ? (
      <Pill tone={column.name === "published" ? "success" : "accent"} dot>
        {column.name === "published" ? "Tayang" : "Ya"}
      </Pill>
    ) : (
      <Pill>{column.name === "published" ? "Draft" : "Tidak"}</Pill>
    );
  }

  if (column.type === "tags") {
    const items = Array.isArray(value) ? value : [];
    if (items.length === 0) return <span className="text-[var(--muted)]">-</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {items.slice(0, 3).map((item) => (
          <Pill key={String(item)}>{String(item)}</Pill>
        ))}
        {items.length > 3 && <span className="text-[11px] text-[var(--muted)]">+{items.length - 3}</span>}
      </span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-[var(--muted)]">-</span>;
  }

  if (column.name === "price_value") {
    return (
      <span className="text-[13px] font-semibold tabular-nums">
        {formatPrice(String(value), String(row.currency ?? "IDR"))}
      </span>
    );
  }

  if (column.name === "rating") {
    const n = Math.max(0, Math.min(5, Number(value)));
    return (
      <span className="flex gap-0.5" role="img" aria-label={`Rating ${n} dari 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} aria-hidden className={i < n ? "fill-[var(--accent-2)] text-[var(--accent-2)]" : "text-[var(--border)]"} />
        ))}
      </span>
    );
  }

  if (column.name === "level") {
    const n = Math.max(0, Math.min(100, Number(value)));
    return (
      <span className="flex min-w-28 items-center gap-2">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
          <span className="accent-gradient block h-full rounded-full" style={{ width: `${n}%` }} />
        </span>
        <span className="w-8 text-right text-[12px] tabular-nums text-[var(--muted)]">{n}%</span>
      </span>
    );
  }

  if (column.name === "category" && CATEGORY_LABELS[String(value)]) {
    return <Pill>{CATEGORY_LABELS[String(value)]}</Pill>;
  }

  const text = String(value);
  return (
    <span className="line-clamp-2 text-[13px]">
      {text.length > 90 ? `${text.slice(0, 90)}…` : text}
    </span>
  );
}
