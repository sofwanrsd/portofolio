"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AppSettings } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Project" },
  { href: "/services", label: "Layanan" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

export function SiteHeader({ settings }: { settings: AppSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { site } = settings;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full px-5 pt-3">
      <div
        className={cn(
          "mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-full border px-3 pl-4 transition-all duration-300",
          scrolled
            ? "border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] shadow-[0_10px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="accent-gradient grid h-8 w-8 place-items-center rounded-xl text-[13px] font-bold text-white shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--accent)_90%,transparent)]">
            {site.logoText || site.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-[var(--glass)] text-[var(--fg)] ring-1 ring-inset ring-[var(--border)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-1.5 h-5 w-px bg-[var(--border)]" />
          <ThemeToggle />
          <Link
            href="/contact"
            className="accent-gradient ml-2 rounded-full px-4 py-2 text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Hire Me
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--glass)] md:hidden"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 w-full max-w-6xl rounded-3xl border border-[var(--border)] bg-[var(--bg)]/95 p-3 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--border)]/40 hover:text-[var(--fg)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="accent-gradient mt-1 rounded-2xl px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Hire Me
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
