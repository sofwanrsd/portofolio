// NavBar — island Menu_Navigasi (gaya neobrutalism).
//
// Menampilkan tepat lima tautan tetap menuju Bagian_Tentang, Bagian_Keahlian,
// Bagian_Proyek, Bagian_Riwayat, dan Bagian_Kontak (Req 5.1) yang bersumber
// dari `NAV_LINKS` (src/lib/nav.ts). Komponen ini:
//
//   - Sticky di bagian atas viewport selama Pengunjung menggulir (Req 5.3),
//     dengan border bawah tebal khas neobrutalism (4px solid token teks).
//   - Brand "MADE BY <NAMA>" di kiri (prop `brand`, default dari
//     `siteConfig.ownerName`) — huruf kapital tebal dengan font-display.
//   - Smooth scroll ke bagian tujuan dengan offset setinggi navbar (Req 5.2).
//   - Menandai tautan yang dipilih sebagai aktif (Req 5.4) dan, selama
//     menggulir, menandai tautan yang sesuai dengan bagian yang sedang terlihat
//     melalui scroll-spy berbasis IntersectionObserver (Req 5.5). Penandaan
//     "tepat satu aktif" dihitung oleh util murni `resolveActiveNav`. Tautan
//     aktif memperoleh kotak aksen (bg-light-primary + teks putih).
//   - Ikon sosial (siteConfig.socialLinks, dibuka aman di tab baru) + island
//     Kontrol_Tema (ThemeToggle) di sisi kanan. Ikon sosial hanya dirender bila
//     prop `socialLinks` diisi, sehingga komponen tetap merender tepat lima
//     tautan navigasi saat dipakai tanpa tautan sosial (mis. pada pengujian).
//   - Pada layar < 768px: menu dirender sebagai hamburger tertutup (Req 7.5).
//   - Pada layar >= 768px: seluruh tautan tampil penuh (Req 7.6).
//
// Di-hydrate dengan `client:load` saat dirakit di `index.astro`.

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { NAV_LINKS, resolveActiveNav } from '../../lib/nav';
import { siteConfig } from '../../config/site';
import ThemeToggle from './ThemeToggle';

/**
 * Tinggi navbar (px) yang dipakai sebagai offset smooth scroll (Req 5.2) dan
 * sebagai margin atas root IntersectionObserver. Selaras dengan kelas `h-16`.
 */
const NAV_HEIGHT = 64;

/** Tautan sosial yang ditampilkan sebagai ikon di sisi kanan navbar. */
export interface NavSocialLink {
  label: string;
  href: string;
}

export interface NavBarProps {
  /** Label merek/judul situs di sisi kiri (mis. "MADE BY NAMA"). */
  brand?: string;
  /** Tautan sosial; default dari siteConfig. Bila kosong tidak ada ikon. */
  socialLinks?: NavSocialLink[];
  /** Slot kanan tambahan di sebelah Kontrol_Tema (opsional). */
  children?: ReactNode;
}

/** Ikon sosial sederhana berbasis label (GitHub/LinkedIn/lainnya). */
function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes('github')) {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
      </svg>
    );
  }
  if (key.includes('linkedin')) {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9Z" />
      </svg>
    );
  }
  if (key.includes('whatsapp') || key.includes('wa.me')) {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.984-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    );
  }
  if (key.includes('email') || key.includes('mail')) {
    return (
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5L4 6h16zm0 12H4V8l8 5 8-5v10z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}

/**
 * Kelas kotak neobrutalism untuk tombol persegi (ikon sosial / hamburger):
 * border tebal token teks, bayangan keras, dan efek tactile saat hover.
 */
const SQUARE_BUTTON_CLASS =
  'inline-flex h-10 w-10 items-center justify-center border-2 border-light-text bg-light-surface text-light-text shadow-brutal-sm transition-all ' +
  'hover:-translate-x-px hover:-translate-y-px hover:bg-accent hover:text-black ' +
  'focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-light-primary ' +
  'dark:border-dark-text dark:bg-dark-surface dark:text-dark-text dark:hover:bg-accent dark:hover:text-black';

export default function NavBar({
  brand = 'WANN',
  socialLinks = siteConfig.socialLinks,
  children,
}: NavBarProps) {
  // Id bagian yang sedang terlihat; null berarti belum ada bagian aktif.
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  // Kondisi menu hamburger pada layar kecil; awal tertutup (Req 7.5).
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll-spy: amati setiap bagian tujuan dan tandai bagian dengan rasio
  // keterlihatan terbesar sebagai aktif (Req 5.5).
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }

        if (bestId !== null) {
          setActiveSectionId(bestId);
        }
      },
      {
        rootMargin: `-${NAV_HEIGHT}px 0px -40% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Smooth scroll dengan offset navbar; tandai tautan aktif & tutup menu.
  const handleNavigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      if (target) {
        event.preventDefault();
        const top =
          target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveSectionId(id);
      }
      setMenuOpen(false);
    },
    [],
  );

  const links = resolveActiveNav(NAV_LINKS, activeSectionId);

  // Tautan navigasi neobrutalism: huruf kapital font-display, border tebal,
  // dan kotak aksen (bg-light-primary + teks putih) saat aktif (Req 5.4).
  const linkClass = (active: boolean) =>
    'px-3 py-2 font-display text-xs uppercase tracking-wider border-2 transition-all ' +
    'focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-light-primary ' +
    (active
      ? 'bg-light-primary text-white border-light-text shadow-brutal-sm dark:border-dark-text'
      : 'border-transparent text-light-text hover:-translate-x-px hover:-translate-y-px hover:border-light-text hover:bg-light-primary hover:text-white dark:text-dark-text dark:hover:border-dark-text');

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-light-text bg-light-surface dark:border-dark-text dark:bg-dark-surface">
      <nav
        aria-label="Menu navigasi utama"
        className="mx-auto flex h-16 w-full max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Merek dirender sebagai <span> (bukan tautan) agar NavBar tetap
            memuat tepat lima tautan navigasi (Req 5.1). */}
        <span className="font-display text-sm uppercase tracking-tight text-light-text dark:text-dark-text sm:text-base">
          {brand}
        </span>

        {/* Tautan penuh: tampil pada >= 768px (Req 7.6). */}
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                onClick={(event) => handleNavigate(event, link.id)}
                aria-current={link.active ? 'true' : undefined}
                className={linkClass(link.active)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Sisi kanan: ikon sosial + Kontrol_Tema. */}
        <div className="hidden items-center gap-2 md:flex">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
              className={SQUARE_BUTTON_CLASS}
            >
              <SocialIcon label={social.label} />
            </a>
          ))}
          <ThemeToggle />
          {children}
        </div>

        {/* Tombol hamburger: hanya tampil pada < 768px (Req 7.5). */}
        <button
          type="button"
          aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className={`${SQUARE_BUTTON_CLASS} md:hidden`}
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      {/* Panel menu mobile: dirender hanya saat terbuka, disembunyikan pada >= 768px. */}
      {menuOpen && (
        <div
          id="navbar-mobile-menu"
          className="border-t-4 border-light-text bg-light-surface px-4 py-3 dark:border-dark-text dark:bg-dark-surface md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  onClick={(event) => handleNavigate(event, link.id)}
                  aria-current={link.active ? 'true' : undefined}
                  className={`block ${linkClass(link.active)}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Ikon sosial + Kontrol_Tema pada layar kecil. */}
          <div className="mt-3 flex items-center gap-2 border-t-4 border-light-text pt-3 dark:border-dark-text">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
                className={SQUARE_BUTTON_CLASS}
              >
                <SocialIcon label={social.label} />
              </a>
            ))}
            <ThemeToggle />
            {children}
          </div>
        </div>
      )}
    </header>
  );
}
