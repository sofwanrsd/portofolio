/**
 * Skema validasi entri riwayat: pekerjaan, pendidikan, organisasi, sertifikasi.
 */

import { z } from "zod";
import { optionalDateSchema, optionalText, pointListSchema } from "./shared";

export const EXPERIENCE_KINDS = ["work", "education", "organization", "certification"] as const;
export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number];

export const experienceSchema = z
  .object({
    kind: z.enum(EXPERIENCE_KINDS).default("work"),
    role: z.string().trim().min(2).max(120),
    company: z.string().trim().min(2).max(120),
    start_date: optionalDateSchema,
    end_date: optionalDateSchema,
    period: optionalText(60),
    description: optionalText(2000),
    highlights: pointListSchema.default([]),
    url: optionalText(500),
    sort_order: z.coerce.number().int().default(0),
  })
  .refine((v) => !v.start_date || !v.end_date || v.start_date <= v.end_date, {
    path: ["end_date"],
    error: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;
