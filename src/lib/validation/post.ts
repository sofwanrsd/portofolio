/**
 * Skema validasi entitas artikel blog.
 */

import { z } from "zod";
import { optionalText, tagListSchema } from "./shared";

export const postSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  slug: optionalText(80),
  excerpt: z.string().trim().min(10, "Ringkasan minimal 10 karakter").max(400),
  content: z.string().trim().min(20, "Isi artikel minimal 20 karakter").max(60000),
  cover_image: optionalText(500),
  tags: tagListSchema.default([]),
  published: z.coerce.boolean().default(true),
});

export type PostInput = z.infer<typeof postSchema>;
