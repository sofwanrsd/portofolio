// ThemeToggle — island Kontrol_Tema.
//
// Tombol aksesibel untuk mengalihkan Mode_Tema antara terang dan gelap
// (Req 17.1). Saat diklik, komponen ini:
//
//   - Membalik tema saat ini dengan `toggleTheme` (util murni, Req 17.3).
//   - Menerapkan tema baru ke DOM dengan mengalihkan kelas `dark` pada
//     `<html>` (`document.documentElement`), sehingga token Tailwind mode
//     gelap aktif/nonaktif (Req 17.1).
//   - Menyimpan preferensi baru ke localStorage via `writeStoredTheme`
//     sehingga bertahan untuk kunjungan berikutnya (Req 17.4).
//
// Saat mount, komponen membaca tema efektif saat ini (`getEffectiveTheme`)
// agar ikon dan state tombol mencerminkan tema yang sedang berlaku — tema
// itu sendiri sudah diterapkan lebih awal oleh skrip anti-FOUC di
// `BaseLayout.astro`, jadi komponen ini hanya menyelaraskan tampilannya.
//
// Di-hydrate dengan `client:load` saat dirakit di `index.astro` karena kecil
// dan harus interaktif sejak awal.

import { useCallback, useEffect, useState } from 'react';
import {
  getEffectiveTheme,
  toggleTheme,
  writeStoredTheme,
  type Theme,
} from '../../lib/theme';

/** Menerapkan tema ke DOM dengan mengalihkan kelas `dark` pada `<html>` (Req 17.1). */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export interface ThemeToggleProps {
  /**
   * Tema awal opsional. Bila tidak diberikan, komponen membaca tema efektif
   * saat ini dari konteks peramban (preferensi tersimpan lalu preferensi
   * sistem). Berguna untuk pengujian.
   */
  initialTheme?: Theme;
}

export default function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  // Mulai dari 'light' sebagai default deterministik; setelah mount kita
  // selaraskan dengan tema efektif sebenarnya pada peramban (Req 17.1).
  const [theme, setTheme] = useState<Theme>(initialTheme ?? 'light');

  // Setelah hydrate, baca tema efektif agar tombol mencerminkan state saat ini.
  useEffect(() => {
    setTheme(initialTheme ?? getEffectiveTheme());
  }, [initialTheme]);

  const handleToggle = useCallback(() => {
    setTheme((current) => {
      const next = toggleTheme(current); // Req 17.3
      applyThemeToDocument(next); // Req 17.1
      writeStoredTheme(next); // Req 17.4
      return next;
    });
  }, []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      aria-pressed={isDark}
      title={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      className="inline-flex h-10 w-10 items-center justify-center border-2 border-light-text bg-light-surface text-light-text shadow-brutal-sm transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-light-primary hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-light-primary dark:border-dark-text dark:bg-dark-surface dark:text-dark-text dark:hover:text-white"
    >
      {isDark ? (
        // Ikon matahari: klik untuk beralih ke mode terang.
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        // Ikon bulan: klik untuk beralih ke mode gelap.
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
