import { execute, query } from "./db";
import type { AppSettings } from "./types";

export const defaultSettings: AppSettings = {
  site: {
    name: "Nama Kamu",
    tagline: "Full-Stack Developer & Designer",
    description:
      "Portfolio pribadi saya — saya bangun produk web yang cepat, rapi, dan layak dipuji.",
    logoText: "NK",
    email: "hello@domainmu.com",
    phone: "+62 812-3456-7890",
    location: "Jakarta, Indonesia",
    availability: "Tersedia untuk project baru",
    showAvailability: true,
    heroTitle: "Saya bikin website yang enak dipakai dan enak dilihat.",
    heroSubtitle:
      "Full-stack developer dengan fokus pada performa, aksesibilitas, dan desain yang bersih.",
    heroCtaText: "Lihat Project",
    heroCtaLink: "/projects",
    heroSecondaryText: "Hubungi Saya",
    heroSecondaryLink: "/contact",
    heroImage: "",
  },
  theme: {
    accent: "#6366f1",
    accentSecondary: "#22d3ee",
    mode: "dark",
    font: "Geist",
    radius: "soft",
    showGrid: true,
  },
  sections: {
    hero: true,
    services: true,
    projects: true,
    about: true,
    skills: true,
    experience: true,
    testimonials: true,
    pricing: true,
    blog: true,
    cta: true,
    contact: true,
  },
  socials: {
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
  },
  seo: {
    metaTitle: "Portfolio — Nama Kamu",
    metaDescription:
      "Portfolio pribadi developer: project, blog, dan layanan freelance.",
    ogImage: "",
    keywords: "portfolio, web developer, freelance",
  },
  features: {
    hireMeEnabled: true,
    hireMeTitle: "Punya ide project?",
    hireMeText:
      "Ceritakan kebutuhan Anda — saya balas dalam 1x24 jam dengan estimasi harga dan timeline.",
    hireMeButtonText: "Mulai Diskusi",
    hireMeButtonLink: "/contact",
    showPricing: true,
    pricingTitle: "Paket Layanan",
    pricingSubtitle: "Harga transparan, tanpa biaya tersembunyi.",
    ctaTitle: "Mari kerjakan project Anda",
    ctaText:
      "Punya sesuatu yang ingin dibahas? Langsung saja — konsultasi gratis untuk project pertama.",
    ctaButtonText: "Kontak Sekarang",
  },
  footer: {
    tagline: "",
    showCopyright: true,
    copyrightText: "© 2026 Nama Kamu. All rights reserved.",
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeSection<T extends object>(base: T, incoming: unknown): T {
  if (!isPlainObject(incoming)) return base;
  const result: Record<string, unknown> = { ...(base as object) };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) continue;
    if (
      key in result &&
      isPlainObject(result[key]) &&
      isPlainObject(value)
    ) {
      result[key] = mergeSection(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/* ------------------------------------------------------------------ *
 *  Cache per-key — settings dibaca di hampir setiap request publik,
 *  sementara mutasinya jarang (hanya dari dashboard admin).
 * ------------------------------------------------------------------ */

type CacheEntry = { value: unknown; expiresAt: number };

/** Umur cache: 60 detik. Cukup untuk menyerap lonjakan trafik. */
const CACHE_TTL_MS = 60_000;

const cache = new Map<string, CacheEntry>();

const SETTINGS_KEYS = [
  "site",
  "theme",
  "sections",
  "socials",
  "seo",
  "features",
  "footer",
] as const;

/** Kosongkan cache (dipanggil setelah settings ditulis). */
export function invalidateSettingsCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}

/** Ambil seluruh settings (7 key JSONB) lalu merge dengan default. */
export async function getSettings(): Promise<AppSettings> {
  const now = Date.now();

  // Pakai cache hanya bila seluruh key masih segar.
  const allFresh = SETTINGS_KEYS.every((k) => {
    const entry = cache.get(k);
    return entry !== undefined && entry.expiresAt > now;
  });

  if (!allFresh) {
    const rows = await query<{ key: string; value: unknown }>(
      "SELECT key, value FROM settings"
    );
    for (const row of rows) {
      cache.set(row.key, { value: row.value, expiresAt: now + CACHE_TTL_MS });
    }
    // Key yang tidak ada di DB tetap di-cache sebagai undefined agar
    // tidak query berulang kali untuk data yang memang kosong.
    for (const k of SETTINGS_KEYS) {
      if (!cache.has(k)) cache.set(k, { value: undefined, expiresAt: now + CACHE_TTL_MS });
    }
  }

  const map: Record<string, unknown> = {};
  for (const k of SETTINGS_KEYS) {
    const entry = cache.get(k);
    if (entry && entry.value !== undefined) map[k] = entry.value;
  }

  return {
    site: mergeSection(defaultSettings.site, map.site),
    theme: mergeSection(defaultSettings.theme, map.theme),
    sections: mergeSection(defaultSettings.sections, map.sections),
    socials: mergeSection(defaultSettings.socials, map.socials),
    seo: mergeSection(defaultSettings.seo, map.seo),
    features: mergeSection(defaultSettings.features, map.features),
    footer: mergeSection(defaultSettings.footer, map.footer),
  };
}

/** Simpan satu key settings (JSON) dan segarkan cache-nya. */
export async function saveSetting(key: string, value: unknown): Promise<void> {
  await execute(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Simpan beberapa key sekaligus (dipakai form pengaturan admin). */
export async function saveSettings(
  values: Record<string, unknown>
): Promise<void> {
  for (const [key, value] of Object.entries(values)) {
    await saveSetting(key, value);
  }
}
