"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[var(--fg)] text-sm font-medium text-[var(--bg)] transition-transform hover:-translate-y-px disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" /> Memeriksa...
        </>
      ) : (
        <>
          <LogIn size={15} /> Masuk
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="admin@domainmu.com"
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-300"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
