/**
 * Skema validasi entitas project.
 */

import { z } from "zod";
import { optionalText, tagListSchema, urlListSchema } from "./shared";

export const projectSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(160),
  slug: optionalText(80),
  summary: z.string().trim().min(10, "Ringkasan minimal 10 karakter").max(400),
  description: optionalText(20000),
  category: z.enum(["web", "ui", "automation", "mobile", "other"]),
  cover_image: optionalText(500),
  gallery: urlListSchema.default([]),
  stack: tagListSchema.default([]),
  client: optionalText(120),
  year: optionalText(10),
  repo_url: optionalText(500),
  live_url: optionalText(500),
  sort_order: z.coerce.number().int().default(0),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
});

export type ProjectInput = z.infer<typeof projectSchema>;
