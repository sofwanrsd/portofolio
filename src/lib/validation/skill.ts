/**
 * Skema validasi entitas skill.
 */

import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(80),
  level: z.coerce.number().int().min(0).max(100).default(80),
  sort_order: z.coerce.number().int().default(0),
});

export type SkillInput = z.infer<typeof skillSchema>;
