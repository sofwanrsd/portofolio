import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="accent-gradient mx-auto grid h-11 w-11 place-items-center rounded-xl text-sm font-bold text-[var(--on-accent)]">
            A
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Panel Admin
          </h1>
          <p className="mt-2 text-[13px] text-[var(--muted)]">
            Masuk untuk mengelola konten portofolio Anda.
          </p>
        </div>

        <div className="rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-[12px] text-[var(--muted)]">
          <a href="/" className="transition-colors hover:text-[var(--fg)]">
            Kembali ke website
          </a>
        </p>
      </div>
    </div>
  );
}
