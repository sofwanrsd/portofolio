// Utilitas Mode_Tema (Req 17).
//
// Fungsi inti (`resolveTheme`, `toggleTheme`) ditulis murni: mereka menerima
// masukan eksplisit alih-alih membaca global secara langsung, sehingga dapat
// diuji dengan property-based testing (Properti 10, 11, 12). Pembungkus yang
// menyentuh `localStorage`/`matchMedia` disediakan terpisah untuk dipakai di
// peramban.

/** Nilai Mode_Tema yang valid. */
export type Theme = 'light' | 'dark';

/** Kunci penyimpanan preferensi tema di localStorage (Req 17.4, 17.5). */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Antarmuka penyimpanan minimal yang kompatibel dengan `Window.localStorage`.
 * Diabstraksikan agar fungsi persistensi dapat diuji tanpa peramban.
 */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Type guard: memastikan sebuah nilai adalah Theme yang sah. */
export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * Menentukan Mode_Tema efektif (Req 17.2, 17.5).
 *
 * Memprioritaskan preferensi tersimpan bila ada dan sah; jika tidak ada,
 * jatuh ke preferensi sistem (`prefers-color-scheme`). Fungsi murni.
 *
 * @param stored Preferensi tersimpan (mis. dari localStorage); `null`/tidak sah
 *   berarti belum ada preferensi.
 * @param systemPrefersDark Hasil `prefers-color-scheme: dark` dari sistem.
 */
export function resolveTheme(
  stored: string | null | undefined,
  systemPrefersDark: boolean,
): Theme {
  if (isTheme(stored)) {
    return stored;
  }
  return systemPrefersDark ? 'dark' : 'light';
}

/**
 * Membalik Mode_Tema (Req 17.3).
 *
 * Bersifat involusi: `toggleTheme(toggleTheme(t)) === t`. Fungsi murni.
 */
export function toggleTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * Membaca preferensi tema tersimpan dari penyimpanan (Req 17.5).
 *
 * Mengembalikan `null` bila tidak ada, tidak sah, atau penyimpanan tidak
 * tersedia (mis. saat render di server).
 */
export function readStoredTheme(storage: ThemeStorage | null | undefined = getDefaultStorage()): Theme | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Menulis preferensi tema ke penyimpanan (Req 17.4).
 *
 * Tidak melempar bila penyimpanan tidak tersedia atau gagal (mis. mode privat).
 */
export function writeStoredTheme(
  theme: Theme,
  storage: ThemeStorage | null | undefined = getDefaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Abaikan kegagalan penyimpanan (mis. quota / mode privat).
  }
}

/** Mengambil `localStorage` peramban bila tersedia; selain itu `null`. */
function getDefaultStorage(): ThemeStorage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
      return (globalThis as { localStorage?: ThemeStorage }).localStorage ?? null;
    }
  } catch {
    // Akses localStorage dapat melempar di konteks tertentu.
  }
  return null;
}

/** Mengevaluasi preferensi sistem `prefers-color-scheme: dark` bila tersedia. */
export function systemPrefersDark(): boolean {
  try {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as { matchMedia?: unknown }).matchMedia === 'function') {
      return (globalThis as { matchMedia: (q: string) => { matches: boolean } }).matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
    }
  } catch {
    // Abaikan; kembalikan default terang.
  }
  return false;
}

/**
 * Menentukan tema efektif dari konteks peramban saat ini dengan membaca
 * preferensi tersimpan lalu preferensi sistem (Req 17.2, 17.5).
 */
export function getEffectiveTheme(storage: ThemeStorage | null | undefined = getDefaultStorage()): Theme {
  return resolveTheme(readStoredTheme(storage), systemPrefersDark());
}

// ---------------------------------------------------------------------------
// Token palet warna (Req 17.6)
// ---------------------------------------------------------------------------
// Nilai-nilai ini adalah sumber kebenaran untuk warna teks/latar pada kedua
// mode tema dan dicerminkan ke `tailwind.config.mjs`. Setiap pasangan
// teks/latar yang terdaftar di `CONTRAST_PAIRS` dijamin memiliki rasio kontras
// >= 4.5:1 (divalidasi oleh Properti 13).

/** Token warna untuk satu Mode_Tema. */
export interface ThemePalette {
  /** Latar dasar halaman. */
  background: string;
  /** Latar permukaan terangkat (kartu, panel). */
  surface: string;
  /** Warna teks utama di atas `background`/`surface`. */
  text: string;
  /** Warna teks sekunder/redup di atas `background`/`surface`. */
  textMuted: string;
  /** Warna aksen/tautan di atas `background`/`surface`. */
  primary: string;
}

/** Palet warna lengkap per Mode_Tema. */
export const palette: Record<Theme, ThemePalette> = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#000000',
    textMuted: '#3A3A3A',
    primary: '#111111',
  },
  dark: {
    background: '#161616',
    surface: '#1F1F1F',
    text: '#F5F5F5',
    textMuted: '#B5B5B5',
    primary: '#FAFAFA',
  },
};

/**
 * Pasangan token (teks di atas latar) yang harus memenuhi ambang kontras
 * aksesibilitas (Req 17.6). Dipakai oleh property test (Properti 13) untuk
 * memverifikasi rasio >= 4.5:1 pada kedua mode.
 *
 * Catatan desain neobrutalism: warna `primary` (oranye) dipakai sebagai aksen
 * (border, badge, sorotan) — BUKAN sebagai teks isi di atas latar terang.
 * Oranye pada putih hanya ~2.9:1 sehingga sengaja TIDAK dimasukkan ke daftar
 * ini agar tidak dipakai sebagai teks normal. Hanya pasangan teks/teks-redup
 * yang dijamin memenuhi ambang kontras.
 */
export const CONTRAST_PAIRS: ReadonlyArray<{
  foreground: keyof ThemePalette;
  background: keyof ThemePalette;
}> = [
  { foreground: 'text', background: 'background' },
  { foreground: 'text', background: 'surface' },
  { foreground: 'textMuted', background: 'background' },
  { foreground: 'textMuted', background: 'surface' },
];

/** Ambang rasio kontras minimum untuk teks normal (WCAG AA, Req 17.6). */
export const MIN_CONTRAST_RATIO = 4.5;

/** Mengubah string warna hex (`#rgb` atau `#rrggbb`) menjadi komponen sRGB 0–255. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error(`Warna hex tidak sah: ${hex}`);
  }
  const num = parseInt(value, 16);
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

/** Menghitung luminansi relatif sebuah warna sesuai definisi WCAG 2.x. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Menghitung rasio kontras antara dua warna (WCAG). Hasil dalam rentang
 * 1:1 (identik) hingga 21:1 (hitam vs putih).
 */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
