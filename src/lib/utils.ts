import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitas umum presentasi.
 *
 * Fungsi spesifik sudah dipisah ke modul sendiri sesuai arsitektur:
 * - `@/lib/slug`   -> slugify, uniqueSlug
 * - `@/lib/format` -> formatDate, formatDateTime, formatPrice, readingTime, excerpt
 *
 * Modul ini mengekspor ulang helper tersebut agar import lama
 * `@/lib/utils` tetap berfungsi.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { slugify } from "./slug";
export {
  formatDate,
  formatDateTime,
  formatPrice,
  readingTime,
  excerpt,
} from "./format";

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
