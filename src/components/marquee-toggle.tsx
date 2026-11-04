"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";

/** Tombol jeda untuk pita bergulir (WCAG 2.2.2). Mengatur data-paused pada [data-marquee] terdekat. */
export function MarqueeToggle({ label }: { label: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={paused}
      aria-label={paused ? `Lanjutkan ${label}` : `Jeda ${label}`}
      onClick={(e) => {
        const host = e.currentTarget.closest<HTMLElement>("[data-marquee]");
        const next = !paused;
        setPaused(next);
        if (host) host.toggleAttribute("data-paused", next);
      }}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
    >
      {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
    </button>
  );
}
