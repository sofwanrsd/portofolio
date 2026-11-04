"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Star,
  User,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Project", icon: Briefcase },
  { href: "/admin/posts", label: "Artikel", icon: FileText },
  { href: "/admin/services", label: "Layanan", icon: Package },
  { href: "/admin/experience", label: "Pengalaman", icon: User },
  { href: "/admin/skills", label: "Skill", icon: Wrench },
  { href: "/admin/testimonials", label: "Testimoni", icon: Star },
  { href: "/admin/messages", label: "Pesan", icon: MessageSquare },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)]/40 lg:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
        <Link href="/admin" className="mb-7 flex items-center gap-2.5 px-2">
          <span className="accent-gradient grid h-8 w-8 place-items-center rounded-lg text-[13px] font-bold text-white">
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Admin</span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--border)]/50 hover:text-[var(--fg)]"
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-4">
          <Link
            href="/"
            className="block px-3 text-[12.5px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
          >
            Lihat website
          </Link>
          <div className="flex items-center justify-between gap-2 px-3">
            <span className="truncate text-[12.5px] text-[var(--muted)]">
              {userName}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Keluar"
                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--border)]/50 hover:text-[var(--fg)]"
              >
                <LogOut size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
