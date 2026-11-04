"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { sendContactMessage } from "@/app/actions/contact";

const BUDGET_OPTIONS = [
  "< 5 juta",
  "5 - 15 juta",
  "15 - 50 juta",
  "> 50 juta",
  "Belum tahu",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--fg)] px-5 text-sm font-medium text-[var(--bg)] transition-transform hover:-translate-y-px disabled:opacity-60 sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" /> Mengirim...
        </>
      ) : (
        <>
          <Send size={15} /> Kirim Pesan
        </>
      )}
    </button>
  );
}

export function ContactForm() {
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
          placeholder="Contoh: Company website"
          error={result?.errors?.subject}
        />
        <div>
          <label
            htmlFor="budget"
            className="mb-1.5 block text-[13px] font-medium"
          >
            Estimasi budget
          </label>
          <select
            id="budget"
            name="budget"
            defaultValue=""
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          >
            <option value="">Pilih range (opsional)</option>
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
          placeholder="Ceritakan singkat kebutuhan project Anda…"
          className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
        />
        {result?.errors?.message && (
          <p className="mt-1.5 text-[12px] text-red-400">{result.errors.message}</p>
        )}
      </div>

      {/* Honeypot — disembunyikan dari manusia, biasanya diisi bot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {result && (
        <p
          role="status"
          className={
            result.ok
              ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300"
              : "rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
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
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
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
        className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
      {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
