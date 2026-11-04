/**
 * Skema validasi entitas pengalaman kerja.
 */

import { z } from "zod";
import { optionalText } from "./shared";

export const experienceSchema = z.object({
  role: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(120),
  period: optionalText(60),
  description: optionalText(2000),
  url: optionalText(500),
  sort_order: z.coerce.number().int().default(0),
});

export type ExperienceInput = z.infer<typeof experienceSchema>;
