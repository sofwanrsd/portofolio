"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Mode = "light" | "dark";

const COOKIE = "portfolio_theme";

/** Baca preferensi tema dari cookie (dipasang oleh toggle ini). */
function readCookie(): Mode | null {
  const match = document.cookie.match(/(?:^|;\s*)portfolio_theme=(light|dark)/);
  return match ? (match[1] as Mode) : null;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("dark");

  // Server sudah mengatur data-theme dari cookie, di sini hanya disinkronkan
  // ke state lokal supaya ikon yang tampil sesuai tema aktif.
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") {
      setMode(current);
      return;
    }
    const saved = readCookie();
    if (saved) setMode(saved);
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.dataset.theme = next;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={mode === "dark" ? "Mode terang" : "Mode gelap"}
      className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--glass)] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/60 hover:text-[var(--fg)]"
    >
      {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
