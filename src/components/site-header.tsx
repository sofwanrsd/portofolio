"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors duration-300",
        scrolled
          ? "border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="accent-gradient grid h-8 w-8 place-items-center rounded-lg text-[13px] font-bold text-white shadow-sm">
            {site.logoText || site.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
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
                  "rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                  active
                    ? "text-[var(--fg)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 rounded-lg bg-[var(--fg)] px-3.5 py-2 text-[13.5px] font-medium text-[var(--bg)] transition-transform hover:-translate-y-px"
          >
            Hire Me
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] md:hidden"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg)]/95 px-5 py-3 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--border)]/40 hover:text-[var(--fg)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-1 rounded-lg bg-[var(--fg)] px-3 py-2.5 text-center text-sm font-medium text-[var(--bg)]"
            >
              Hire Me
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
