"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Project" },
  { href: "/admin/posts", label: "Artikel" },
  { href: "/admin/services", label: "Layanan" },
  { href: "/admin/experience", label: "Pengalaman" },
  { href: "/admin/skills", label: "Skill" },
  { href: "/admin/testimonials", label: "Testimoni" },
  { href: "/admin/messages", label: "Pesan" },
  { href: "/admin/settings", label: "Pengaturan" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[var(--border)] bg-[var(--bg)]/95 lg:hidden">
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2.5">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? "shrink-0 rounded-lg bg-[var(--accent)]/12 px-3 py-1.5 text-[12.5px] font-medium text-[var(--accent)]"
                : "shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-[var(--muted)]"
            }
          >
            {link.label}
          </Link>
        ))}
        <form action={logoutAction} className="ml-auto shrink-0">
          <button
            type="submit"
            aria-label="Keluar"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)]"
          >
            <LogOut size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
