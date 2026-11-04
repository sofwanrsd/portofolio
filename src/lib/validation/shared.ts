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
  .union([z.array(z.string().trim().url()), z.string()])
  .transform((value) =>
    Array.isArray(value)
      ? value
      : value
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
  )
  .pipe(z.array(z.string().trim().url()));

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
