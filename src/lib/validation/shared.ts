/**
 * Skema Zod primitive yang dipakai bersama seluruh entitas.
 */

import { z } from "zod";

export const slugSchema = z
  .string()
  .trim()
  .max(80)
  .regex(/^[a-z0-9-]*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung.");

export const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");

/** Daftar URL dipisah baris baru; setiap item divalidasi sebagai URL. */
export const urlListSchema = z
  .union([z.array(z.string().trim().pipe(z.url())), z.string()])
  .transform((value) =>
    Array.isArray(value)
      ? value
      : value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
  )
  .pipe(z.array(z.string().trim().pipe(z.url())));

/** Daftar poin (kalimat) dipisah baris baru, mis. kegiatan selama bekerja/kuliah. */
export const pointListSchema = z
  .union([z.array(z.string()), z.string()])
  .transform((value) =>
    (Array.isArray(value) ? value : value.split("\n"))
      .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
      .filter(Boolean)
  )
  .pipe(z.array(z.string().min(1).max(300)).max(12, "Maksimal 12 poin."));

/** Tanggal opsional berformat YYYY-MM atau YYYY-MM-DD (kosong = tidak diisi). */
export const optionalDateSchema = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    const full = value.length === 7 ? `${value}-01` : value;
    return z.iso.date().safeParse(full).success;
  }, "Tanggal harus valid dalam format YYYY-MM atau YYYY-MM-DD.")
  .optional()
  .default("");

/** Daftar tag dipisah baris baru. */
export const tagListSchema = z
  .union([z.array(z.string()), z.string()])
  .transform((value) =>
    Array.isArray(value)
      ? value
      : value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
  )
  .pipe(z.array(z.string().trim().min(1).max(40)));
