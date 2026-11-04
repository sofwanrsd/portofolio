/**
 * Skema validasi entitas testimoni.
 */

import { z } from "zod";
import { optionalText } from "./shared";

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: optionalText(120),
  company: optionalText(120),
  content: z.string().trim().min(10).max(2000),
  avatar: optionalText(500),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  sort_order: z.coerce.number().int().default(0),
  published: z.coerce.boolean().default(true),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
