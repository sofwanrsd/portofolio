import { parseAmount } from "./format";

/** Pilihan rentang budget di form kontak. Urutan menentukan urutan tampil. */
export const BUDGET_OPTIONS = [
  "< 5 juta",
  "5 - 15 juta",
  "15 - 50 juta",
  "> 50 juta",
  "Belum tahu",
] as const;

/**
 * Pilih rentang budget yang memuat harga awal sebuah paket.
 * Mengembalikan string kosong bila harga tidak bisa dibaca, supaya form
 * tetap menampilkan "Pilih range (opsional)".
 */
export function budgetFor(priceValue: string | null | undefined): string {
  if (!priceValue) return "";
  const amount = parseAmount(priceValue);
  if (amount === null || amount <= 0) return "";
  if (amount < 5_000_000) return "< 5 juta";
  if (amount < 15_000_000) return "5 - 15 juta";
  if (amount <= 50_000_000) return "15 - 50 juta";
  return "> 50 juta";
}
