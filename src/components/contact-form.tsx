"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { sendContactMessage } from "@/app/actions/contact";
import { BUDGET_OPTIONS } from "@/lib/budget";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="accent-gradient inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold text-[var(--on-accent)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" /> Mengirim...
        </>
      ) : (
        <>
          <Send size={15} /> Kirim pesan
        </>
      )}
    </button>
  );
}

export function ContactForm({
  defaultSubject = "",
  defaultBudget = "",
}: {
  defaultSubject?: string;
  defaultBudget?: string;
} = {}) {
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    errors?: Record<string, string>;
  } | null>(null);
  const [, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;

    startTransition(async () => {
      const response = await sendContactMessage(data);
      setResult(response);
      if (response.ok) form.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="name"
          label="Nama"
          placeholder="Nama lengkap Anda"
          error={result?.errors?.name}
          required
        />
        <Field
          name="email"
          label="Email"
          type="email"
          placeholder="nama@email.com"
          error={result?.errors?.email}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="subject"
          label="Subjek"
          placeholder="Contoh: Kolaborasi atau peluang kerja"
          defaultValue={defaultSubject}
          error={result?.errors?.subject}
        />
        <div>
          <label
            htmlFor="budget"
            className="mb-1.5 block text-[13px] font-medium"
          >
            Estimasi anggaran
          </label>
          <select
            id="budget"
            name="budget"
            defaultValue={defaultBudget}
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          >
            <option value="">Pilih anggaran (opsional)</option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium">
          Pesan <span className="text-[var(--muted)]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          aria-invalid={result?.errors?.message ? true : undefined}
          aria-describedby={result?.errors?.message ? "message-error" : undefined}
          placeholder="Jelaskan kebutuhan atau peluang yang ingin Anda diskusikan."
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
        />
        {result?.errors?.message && (
          <p id="message-error" className="mt-1.5 text-[12px] text-[color-mix(in_oklab,#ef4444_70%,var(--fg))]">
            {result.errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: disembunyikan dari manusia, biasanya diisi bot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {result && (
        <p
          role="status"
          className={
            result.ok
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-[color-mix(in_oklab,#10b981_65%,var(--fg))]"
              : "rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-[color-mix(in_oklab,#ef4444_65%,var(--fg))]"
          }
        >
          {result.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  error,
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[13px] font-medium">
        {label} {required && <span className="text-[var(--muted)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[12px] text-[color-mix(in_oklab,#ef4444_70%,var(--fg))]">
          {error}
        </p>
      )}
    </div>
  );
}
