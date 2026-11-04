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
  "w-full rounded-xl border border-[var(--border)] bg-[var(--glass)] px-3.5 text-[13.5px] outline-none transition-[border-color,box-shadow] placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_16%,transparent)]";
