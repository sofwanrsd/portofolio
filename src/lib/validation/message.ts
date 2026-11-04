/**
 * Skema validasi pesan kontak (form publik).
 */

import { z } from "zod";

export const messageSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Email tidak valid").max(160),
  subject: z.string().trim().max(160).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter").max(5000),
  /** Honeypot - bot mengisi field ini, manusia tidak. */
  website: z.string().max(0, "Spam terdeteksi").optional().default(""),
});

export type MessageInput = z.infer<typeof messageSchema>;
