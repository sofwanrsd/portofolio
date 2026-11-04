import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { queryOne } from "./db";
import type { User } from "./types";

const COOKIE_NAME = "portfolio_session";
const SESSION_DAYS = 7;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET belum di-set atau terlalu pendek (minimal 16 karakter)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** Tanda tangani JWT session (HS256) untuk user yang sudah terautentikasi. */
export async function signSession(user: User): Promise<string> {
  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

/** Verifikasi token JWT dan kembalikan payload-nya (null bila tidak valid/kedaluwarsa). */
export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: (payload.role as "admin" | "editor") ?? "admin",
    };
  } catch {
    return null;
  }
}

/** Buat session: tanda tangani JWT lalu simpan di cookie HTTP-only 7 hari. */
export async function createSession(user: User): Promise<void> {
  const token = await signSession(user);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "editor";
};

export async function readSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await readSession();
  if (!session?.sub) return null;
  const user = await queryOne<User>(
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1 LIMIT 1",
    [session.sub]
  );
  return user ?? null;
}

export async function authenticate(
  email: string,
  password: string
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const row = await queryOne<User & { password_hash: string }>(
    "SELECT id, email, name, role, password_hash, created_at FROM users WHERE lower(email) = lower($1) LIMIT 1",
    [email.trim()]
  );

  // Selalu jalankan bcrypt (walau user tidak ada) agar timing tidak membocorkan info.
  const hash = row?.password_hash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const valid = await verifyPassword(password, hash);

  if (!row || !valid) {
    return { ok: false, error: "Email atau password salah." };
  }

  const user: User = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    created_at: row.created_at,
  };
  return { ok: true, user };
}

/**
 * Guard untuk server component / server action admin.
 * Mengembalikan user aktif, atau redirect ke halaman login bila session tidak sah.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

/**
 * Guard khusus area yang boleh diakses role "editor" maupun "admin".
 * Saat ini seluruh area dashboard terbuka untuk keduanya; pemisahan hak akses
 * yang lebih rinci dapat ditambahkan di sini tanpa mengubah pemanggil.
 */
export async function requireEditor(): Promise<User> {
  const user = await requireAdmin();
  if (user.role !== "admin" && user.role !== "editor") {
    redirect("/admin/login");
  }
  return user;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
