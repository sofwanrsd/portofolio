import type { z } from "zod";
import { execute } from "@/lib/db";
import { consume, type RateLimitResult } from "@/lib/rate-limit";
import { sendInquiryNotification } from "@/lib/email";
import { messageSchema } from "@/lib/validation/message";

export const contactSchema = messageSchema;

export type ContactPayload = z.infer<typeof contactSchema>;

export type ContactResult =
  | { ok: true; message: string; rateLimit?: RateLimitResult }
  | {
      ok: false;
      message: string;
      errors?: Record<string, string>;
      /** true bila penolakan disebabkan rate limit (bukan validasi). */
      rateLimited?: boolean;
      /** Status kuota untuk header X-RateLimit-*. */
      rateLimit?: RateLimitResult;
    };

/**
 * Rate limit form kontak: 5 permintaan per IP per 10 menit.
 * State in-memory per instance (lihat PROJECT/04-ARCHITECTURE/security-design.md).
 */
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const RATE_LIMIT_MAX = 5;

/**
 * Kunci rate limit: IP pengunjung. Email ikut dicampur agar satu IP yang
 * mencoba banyak alamat email tetap terlimitasi.
 */
export function rateLimitKey(ip: string | null, email: string): string {
  return `${ip ?? "unknown"}|${email.toLowerCase()}`;
}

export async function submitContact(
  raw: Record<string, string | undefined>,
  ip: string | null = null
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Periksa kembali isian formulir Anda.",
      errors,
    };
  }

  const payload = parsed.data;

  const rateLimit = consume(rateLimitKey(ip, payload.email), {
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return {
      ok: false,
      message:
        "Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.",
      rateLimited: true,
      rateLimit,
    };
  }

  try {
    await execute(
      `INSERT INTO messages (name, email, subject, budget, message, status)
       VALUES ($1, $2, $3, $4, $5, 'new')`,
      [
        payload.name,
        payload.email,
        payload.subject ?? "",
        payload.budget ?? "",
        payload.message,
      ]
    );
  } catch (error) {
    console.error("[contact] insert failed:", (error as Error).message);
    return {
      ok: false,
      message:
        "Pesan gagal disimpan. Silakan coba lagi atau hubungi saya langsung via email.",
      rateLimit,
    };
  }

  await sendInquiryNotification({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    budget: payload.budget,
    message: payload.message,
  });

  return {
    ok: true,
    message:
      "Pesan Anda telah diterima. Saya akan menindaklanjutinya melalui email yang Anda cantumkan.",
    rateLimit,
  };
}
