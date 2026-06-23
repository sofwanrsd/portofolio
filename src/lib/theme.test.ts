import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  resolveTheme,
  toggleTheme,
  readStoredTheme,
  writeStoredTheme,
  palette,
  CONTRAST_PAIRS,
  contrastRatio,
  MIN_CONTRAST_RATIO,
  type Theme,
  type ThemeStorage,
} from './theme';

// Generator untuk nilai Theme yang sah.
const themeArb: fc.Arbitrary<Theme> = fc.constantFrom('light', 'dark');

// Generator untuk nilai "stored" yang TIDAK sah sebagai Theme (termasuk null,
// undefined, dan string acak yang bukan 'light'/'dark').
const nonThemeStoredArb: fc.Arbitrary<string | null | undefined> = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.string().filter((s) => s !== 'light' && s !== 'dark'),
);

/**
 * Penyimpanan tema in-memory palsu yang mengimplementasikan `ThemeStorage`,
 * dipakai untuk menguji round-trip persistensi tanpa peramban.
 */
function createFakeStorage(): ThemeStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe('theme utilities (property-based)', () => {
  // Feature: portfolio-website, Property 10: Resolusi tema memprioritaskan preferensi tersimpan
  // Tag: Property 10
  // Validates: Requirements 17.2, 17.5
  it('Property 10: resolveTheme mengembalikan preferensi tersimpan bila sah, selain itu preferensi sistem', () => {
    fc.assert(
      fc.property(
        fc.oneof(themeArb, nonThemeStoredArb),
        fc.boolean(),
        (stored, systemPrefersDark) => {
          const result = resolveTheme(stored, systemPrefersDark);
          if (stored === 'light' || stored === 'dark') {
            // Preferensi tersimpan yang sah harus diprioritaskan.
            expect(result).toBe(stored);
          } else {
            // Tanpa preferensi tersimpan yang sah, jatuh ke preferensi sistem.
            expect(result).toBe(systemPrefersDark ? 'dark' : 'light');
          }
        },
      ),
    );
  });

  // Feature: portfolio-website, Property 11: Toggle tema bersifat involusi
  // Tag: Property 11
  // Validates: Requirements 17.3
  it('Property 11: toggleTheme bersifat involusi dan selalu mengubah nilai', () => {
    fc.assert(
      fc.property(themeArb, (theme) => {
        // Sekali toggle harus berbeda dari masukan.
        expect(toggleTheme(theme)).not.toBe(theme);
        // Dua kali toggle mengembalikan tema semula (involusi).
        expect(toggleTheme(toggleTheme(theme))).toBe(theme);
      }),
    );
  });

  // Feature: portfolio-website, Property 12: Persistensi tema bersifat round-trip
  // Tag: Property 12
  // Validates: Requirements 17.4
  it('Property 12: menulis tema ke penyimpanan lalu membacanya kembali menghasilkan tema yang sama', () => {
    fc.assert(
      fc.property(themeArb, fc.boolean(), (theme, systemPrefersDark) => {
        const storage = createFakeStorage();
        writeStoredTheme(theme, storage);

        // Pembacaan langsung dari penyimpanan harus mengembalikan tema yang ditulis.
        expect(readStoredTheme(storage)).toBe(theme);

        // Pembacaan via resolveTheme (preferensi tersimpan) juga harus konsisten,
        // terlepas dari preferensi sistem.
        expect(resolveTheme(readStoredTheme(storage), systemPrefersDark)).toBe(theme);
      }),
    );
  });

  // Feature: portfolio-website, Property 13: Kontras warna memenuhi ambang aksesibilitas
  // Tag: Property 13
  // Validates: Requirements 17.6
  it('Property 13: setiap pasangan kontras di kedua mode memenuhi rasio >= 4.5:1', () => {
    const modes: Theme[] = ['light', 'dark'];
    fc.assert(
      fc.property(
        fc.constantFrom(...modes),
        fc.constantFrom(...CONTRAST_PAIRS),
        (mode, pair) => {
          const fg = palette[mode][pair.foreground];
          const bg = palette[mode][pair.background];
          const ratio = contrastRatio(fg, bg);
          expect(ratio).toBeGreaterThanOrEqual(MIN_CONTRAST_RATIO);
        },
      ),
    );
  });
});
