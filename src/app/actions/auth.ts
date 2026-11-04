"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession } from "@/lib/auth";
import { consume, reset as resetRateLimit } from "@/lib/rate-limit";

export type LoginState = {
  error?: string;
};

/** Batas percobaan login: 5 percobaan per 15 menit per IP. */
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

async function getClientIp(): Promise<string | null> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null
  );
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const ip = await getClientIp();
  const key = `login|${ip ?? "unknown"}|${email}`;

  const quota = consume(key, { limit: LOGIN_LIMIT, windowMs: LOGIN_WINDOW_MS });
  if (!quota.allowed) {
    const waitMinutes = Math.max(
      1,
      Math.ceil((quota.resetAt - Date.now()) / 60000)
    );
    return {
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${waitMinutes} menit.`,
    };
  }

  const result = await authenticate(email, password);

  if (!result.ok) {
    return { error: result.error };
  }

  // Login berhasil: bersihkan kuota agar percobaan sah berikutnya tidak terlimitasi.
  resetRateLimit(key);
  await createSession(result.user);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
