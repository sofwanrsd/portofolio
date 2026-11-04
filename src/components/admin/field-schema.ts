"use client";

export type FieldSchema = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "select"
    | "tags"
    | "list"
    | "date";
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  default?: string | number | boolean;
  rows?: number;
};

export type RowData = Record<string, unknown>;

export function toInputValue(field: FieldSchema, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (field.type === "tags" || field.type === "list") {
    return Array.isArray(value) ? value.join("\n") : String(value);
  }
  if (field.type === "boolean") return value ? "true" : "false";
  return String(value);
}

export const INPUT_BASE =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]";
