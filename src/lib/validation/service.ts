/**
 * Skema validasi entitas paket layanan.
 */

import { z } from "zod";
import { optionalText, tagListSchema } from "./shared";

export const serviceSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: optionalText(80),
  description: z.string().trim().min(10).max(2000),
  price_label: optionalText(60),
  price_value: optionalText(40),
  currency: z.enum(["IDR", "USD", "EUR"]).default("IDR"),
  features: tagListSchema.default([]),
  icon: z.enum(["rocket", "globe", "code", "briefcase"]).default("rocket"),
  sort_order: z.coerce.number().int().default(0),
  popular: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
