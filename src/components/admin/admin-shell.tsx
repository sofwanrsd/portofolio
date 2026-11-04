"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Briefcase,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Star,
  User,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "./admin-ui";

type NavItem = { href: string; label: string; icon: typeof Briefcase; badge?: "messages" };

const GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Ringkasan", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Konten",
    items: [
      { href: "/admin/projects", label: "Project", icon: Briefcase },
      { href: "/admin/posts", label: "Artikel", icon: FileText },
      { href: "/admin/services", label: "Layanan", icon: Package },
      { href: "/admin/testimonials", label: "Testimoni", icon: Star },
    ],
  },
  {
    label: "Profil",
    items: [
      { href: "/admin/experience", label: "Pengalaman", icon: User },
      { href: "/admin/skills", label: "Skill", icon: Wrench },
    ],
  },
  {
    label: "Kotak masuk & sistem",
    items: [
      { href: "/admin/messages", label: "Pesan", icon: MessageSquare, badge: "messages" },
      { href: "/admin/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

type ShellProps = {
  children: ReactNode;
  user: { name: string; email: string };
  siteName: string;
  logoText: string;
  newMessages: number;
};

function NavList({ pathname, newMessages, onNavigate }: { pathname: string; newMessages: number; onNavigate?: () => void }) {
  return (
    <nav aria-label="Navigasi admin" className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              const count = item.badge === "messages" ? newMessages : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition-all duration-200",
                      active
                        ? "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--fg)]"
                        : "text-[var(--muted)] hover:translate-x-0.5 hover:bg-[var(--glass)] hover:text-[var(--fg)]"
                    )}
                  >
                    {active && (
                      <span aria-hidden className="absolute -left-4 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
                    )}
                    <Icon
                      size={16}
                      aria-hidden
                      className={cn("shrink-0 transition-colors", active ? "text-[var(--accent)]" : "group-hover:text-[var(--fg)]")}
                    />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span className="accent-gradient min-w-5 rounded-full px-1.5 text-center text-[10.5px] font-bold leading-5 text-[var(--on-accent)]">
                        {count}
                        <span className="sr-only"> pesan baru</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand({ siteName, logoText }: { siteName: string; logoText: string }) {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-3 rounded-xl px-1 py-1">
      <span className="accent-gradient grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold text-[var(--on-accent)] shadow-[0_10px_26px_-12px_var(--accent)]">
        {logoText}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold tracking-tight">{siteName}</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Studio admin</span>
      </span>
    </Link>
  );
}

function UserCard({ user }: { user: ShellProps["user"] }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--glass)] p-2.5">
      <Avatar name={user.name || user.email} size={34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{user.name || "Admin"}</p>
        <p className="truncate text-[11.5px] text-[var(--muted)]">{user.email}</p>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          aria-label="Keluar"
          title="Keluar"
          className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--glass)] hover:text-[var(--fg)]"
        >
          <LogOut size={15} aria-hidden />
        </button>
      </form>
    </div>
  );
}

export function AdminShell({ children, user, siteName, logoText, newMessages }: ShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ALL.find((i) => isActive(pathname, i.href));

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="relative flex min-h-screen bg-[var(--bg)]">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="spotlight absolute inset-x-0 top-0 h-[28rem] opacity-70" />
      </div>

      <aside className="relative z-10 hidden w-[17rem] shrink-0 border-r border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_70%,transparent)] backdrop-blur-xl lg:block">
        <div className="sticky top-0 flex h-screen flex-col gap-7 overflow-y-auto px-4 py-6">
          <Brand siteName={siteName} logoText={logoText} />
          <NavList pathname={pathname} newMessages={newMessages} />
          <div className="mt-auto space-y-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--glass)] hover:text-[var(--fg)]"
            >
              Lihat website
              <ExternalLink size={14} aria-hidden />
              <span className="sr-only">(tab baru)</span>
            </Link>
            <UserCard user={user} />
          </div>
        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_80%,transparent)] px-4 backdrop-blur-xl md:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Buka menu admin"
            aria-expanded={open}
            aria-controls="admin-drawer"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] lg:hidden"
          >
            <Menu size={16} aria-hidden />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-2 text-[13px]">
              <li className="hidden text-[var(--muted)] sm:block">Admin</li>
              <li aria-hidden className="hidden text-[var(--muted)] sm:block">/</li>
              <li className="truncate font-medium" aria-current="page">
                {current?.label ?? "Admin"}
              </li>
            </ol>
          </nav>
          <Link
            href="/"
            target="_blank"
            className="hidden h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--glass)] px-3 text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)] sm:inline-flex"
          >
            <ExternalLink size={14} aria-hidden /> Website
            <span className="sr-only">(tab baru)</span>
          </Link>
          <ThemeToggle />
          <span className="hidden items-center gap-2 rounded-xl border border-[var(--border)] py-1 pl-1 pr-3 md:flex">
            <Avatar name={user.name || user.email} size={26} />
            <span className="max-w-32 truncate text-[12.5px] font-medium">{user.name || "Admin"}</span>
          </span>
        </header>

        <div className="flex-1 px-4 py-7 md:px-8 md:py-9">{children}</div>
      </div>

      <div
        id="admin-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu admin"
        aria-hidden={!open}
        className={cn("fixed inset-0 z-50 lg:hidden", open ? "visible" : "invisible")}
      >
        <button
          type="button"
          aria-label="Tutup menu"
          tabIndex={-1}
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(19rem,86vw)] flex-col gap-7 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg)] px-4 py-5 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <Brand siteName={siteName} logoText={logoText} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)]"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
          <NavList pathname={pathname} newMessages={newMessages} onNavigate={() => setOpen(false)} />
          <div className="mt-auto">
            <UserCard user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
