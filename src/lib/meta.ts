// Utilitas render Meta_Tag murni: menghasilkan deskriptor Meta_Tag hanya untuk
// nilai konfigurasi situs yang terisi (Req 18.1–18.5). Tidak pernah
// menghasilkan tag berkonten kosong. Bebas efek samping agar dapat diuji
// dengan property-based testing (lihat Property 17).

import type { SiteConfig } from '../config/site';

/** Deskriptor satu Meta_Tag pada `<head>`. */
export interface MetaTag {
  /** Nama elemen HTML yang dirender. */
  tag: 'title' | 'meta' | 'link';
  /** Atribut elemen (mis. `name`, `property`, `content`, `rel`, `href`). */
  attrs: Record<string, string>;
  /** Isi teks untuk elemen `<title>` (tidak dipakai elemen void). */
  text?: string;
}

/** Mengembalikan true bila nilai dianggap "terisi" (non-kosong setelah trim). */
function isConfigured(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Menghasilkan daftar Meta_Tag dari konfigurasi situs (boleh parsial). Sebuah
 * Meta_Tag disertakan jika dan hanya jika nilai konfigurasi yang bersesuaian
 * terisi; tidak pernah ada tag dengan `content` kosong (Property 17 — Req 18.5).
 *
 * Pemetaan nilai -> tag:
 * - `title`       -> `<title>`, `og:title`, `twitter:title`
 * - `description` -> `meta[name=description]`, `og:description`, `twitter:description`
 * - `url`         -> `og:url`
 * - `ogImageUrl`  -> `og:image`, `twitter:image`, `twitter:card`
 */
export function renderMetaTags(config: Partial<SiteConfig>): MetaTag[] {
  const tags: MetaTag[] = [];

  if (isConfigured(config.title)) {
    const title = config.title.trim();
    tags.push({ tag: 'title', attrs: {}, text: title });
    tags.push({ tag: 'meta', attrs: { property: 'og:title', content: title } });
    tags.push({ tag: 'meta', attrs: { name: 'twitter:title', content: title } });
  }

  if (isConfigured(config.description)) {
    const description = config.description.trim();
    tags.push({ tag: 'meta', attrs: { name: 'description', content: description } });
    tags.push({ tag: 'meta', attrs: { property: 'og:description', content: description } });
    tags.push({ tag: 'meta', attrs: { name: 'twitter:description', content: description } });
  }

  if (isConfigured(config.url)) {
    tags.push({ tag: 'meta', attrs: { property: 'og:url', content: config.url.trim() } });
  }

  if (isConfigured(config.ogImageUrl)) {
    const image = config.ogImageUrl.trim();
    tags.push({ tag: 'meta', attrs: { property: 'og:image', content: image } });
    tags.push({ tag: 'meta', attrs: { name: 'twitter:image', content: image } });
    tags.push({ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } });
  }

  return tags;
}

/** Meng-escape teks untuk konteks atribut/isi HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Menserialisasi satu MetaTag menjadi string HTML. */
export function metaTagToHtml(tag: MetaTag): string {
  const attrs = Object.entries(tag.attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(' ');

  if (tag.tag === 'title') {
    return `<title>${escapeHtml(tag.text ?? '')}</title>`;
  }
  return `<${tag.tag}${attrs ? ' ' + attrs : ''} />`;
}

/**
 * Menyerialisasi seluruh Meta_Tag terkonfigurasi menjadi potongan HTML siap
 * sisip ke `<head>` (dipakai BaseLayout pada task berikutnya).
 */
export function renderMetaHtml(config: Partial<SiteConfig>): string {
  return renderMetaTags(config).map(metaTagToHtml).join('\n');
}
