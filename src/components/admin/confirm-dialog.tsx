"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { btnSecondary } from "./admin-ui";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

/**
 * Pengganti window.confirm() yang mengikuti tema admin.
 *
 *   const [confirm, dialog] = useConfirm();
 *   if (!(await confirm({ title: "Hapus project?" }))) return;
 *   ...
 *   return <>{dialog}...</>
 *
 * Aksesibel: role="alertdialog", fokus awal di tombol Batal (pilihan aman),
 * Esc dan klik latar = batal, fokus dikembalikan ke tombol pemicu.
 */
export function useConfirm() {
  const [pending, setPending] = useState<Pending | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    return new Promise<boolean>((resolve) => setPending({ ...options, resolve }));
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
      requestAnimationFrame(() => returnFocus.current?.focus());
    },
    [pending]
  );

  // Portal ke <body>: induk yang punya transform (animasi masuk) tidak boleh
  // mengurung position: fixed, supaya latar gelap menutup seluruh layar.
  const dialog = pending ? createPortal(<ConfirmDialog {...pending} onClose={close} />, document.body) : null;
  return [confirm, dialog] as const;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel = "Hapus",
  onClose,
}: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(false);
      }
      // Fokus hanya berputar di antara dua tombol dialog.
      if (e.key === "Tab") {
        const first = cancelRef.current;
        const last = confirmRef.current;
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Batal"
        tabIndex={-1}
        onClick={() => onClose(false)}
        className="fade absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? "confirm-desc" : undefined}
        className="pop relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]"
      >
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-red-500/30 bg-red-500/10 text-[color-mix(in_oklab,#ef4444_75%,var(--fg))]">
          <AlertTriangle size={19} aria-hidden />
        </span>
        <h2 id="confirm-title" className="mt-4 text-[17px] font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p id="confirm-desc" className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--muted)]">
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className={btnSecondary}>
            Batal
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#dc2626] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#b91c1c]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
