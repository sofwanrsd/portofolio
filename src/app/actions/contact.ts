"use server";

import { headers } from "next/headers";
import { submitContact, type ContactResult } from "@/lib/contact";

/**
 * Ambil IP pengunjung dari header proxy (Vercel/Neon menggunakan
 * `x-forwarded-for`; `x-real-ip` dipakai sebagai cadangan).
 */
async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip");
}

export async function sendContactMessage(
  raw: Record<string, string | undefined>,
  ip?: string | null
): Promise<ContactResult> {
  return submitContact(raw, ip ?? (await getClientIp()));
}
