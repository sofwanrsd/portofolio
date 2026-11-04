import Link from "next/link";
import { Github, Linkedin, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react";
import type { AppSettings } from "@/lib/types";

const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export function SiteFooter({ settings }: { settings: AppSettings }) {
  const { site, socials, footer } = settings;
  const socialEntries = Object.entries(socials).filter(
    ([, value]) => Boolean(value)
  );

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="accent-gradient grid h-8 w-8 place-items-center rounded-lg text-[13px] font-bold text-[var(--on-accent)]">
                {site.logoText || site.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                {site.name}
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {footer.tagline || site.description}
            </p>
            {socialEntries.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {socialEntries.map(([key, url]) => {
                  const Icon = SOCIAL_ICONS[key];
                  if (!Icon) return null;
                  return (
                    <a
                      key={key}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--fg)]"
                    >
                      <Icon size={15} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Navigasi
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/projects" className="text-[var(--muted)] hover:text-[var(--fg)]">
                    Project
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-[var(--muted)] hover:text-[var(--fg)]">
                    Layanan
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-[var(--muted)] hover:text-[var(--fg)]">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Tentang
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-[var(--muted)] hover:text-[var(--fg)]">
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[var(--muted)] hover:text-[var(--fg)]">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Kontak
              </h3>
              <ul className="space-y-2 text-[var(--muted)]">
                {site.email && <li>{site.email}</li>}
                {site.phone && <li>{site.phone}</li>}
                {site.location && <li>{site.location}</li>}
              </ul>
            </div>
          </div>
        </div>

        {footer.showCopyright && (
          <div className="mt-10 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]">
            {footer.copyrightText ||
              `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`}
          </div>
        )}
      </div>
    </footer>
  );
}
