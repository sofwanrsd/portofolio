"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { INPUT_BASE } from "./field-schema";
import { btnPrimary } from "./admin-ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} h-11 w-full text-[14px]`}>
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" aria-hidden /> Memeriksa...
        </>
      ) : (
        <>
          <LogIn size={15} aria-hidden /> Masuk ke dashboard
        </>
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
          Email
        </label>
        <div className="relative">
          <Mail size={15} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="admin@domainmu.com"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
            className={`${INPUT_BASE} h-11 pl-10`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium">
          Password
        </label>
        <div className="relative">
          <Lock size={15} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Masukkan password"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "login-error" : undefined}
            className={`${INPUT_BASE} h-11 pl-10 pr-11`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            {show ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
          </button>
        </div>
      </div>

      {state.error && (
        <p
          id="login-error"
          role="alert"
          className="pop rounded-xl bg-red-500/10 px-3.5 py-2.5 text-[13px] text-[color-mix(in_oklab,#ef4444_75%,var(--fg))] ring-1 ring-inset ring-red-500/30"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
