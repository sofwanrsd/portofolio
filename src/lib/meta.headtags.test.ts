import { describe, it, expect } from 'vitest';
import { renderMetaTags, renderMetaHtml } from './meta';
import type { SiteConfig } from '../config/site';

// Feature: portfolio-website, Task 15.5 - Unit test render head/Meta_Tag.
// Verifikasi kehadiran title, description, Open_Graph (og:title/og:description/
// og:image/og:url), dan Twitter card untuk konfigurasi penuh; serta tidak ada
// Meta_Tag berkonten kosong untuk nilai yang hilang/kosong.
// Berbasis contoh (example-based), melengkapi Property 17 di meta.test.ts.
// **Validates: Requirements 18.1, 18.2, 18.3, 18.5, 18.6**

// Konfigurasi penuh yang mewakili nilai SiteConfig terisi sepenuhnya.
const fullConfig: SiteConfig = {
  title: 'Portfolio - Web & Software Developer',
  description: 'Portofolio web/software developer: profil, keahlian, proyek.',
  url: 'https://example.com',
  ogImageUrl: 'https://example.com/og.png',
  ownerName: 'Nama Kamu',
  role: 'Software Engineer',
  tagline: 'Membangun web modern yang cepat dan rapi.',
  cvUrl: '/cv.pdf',
  ownerEmail: 'owner@example.com',
  socialLinks: [{ label: 'GitHub', href: 'https://github.com/' }],
  certifications: [{ title: 'Cert Contoh', issuer: 'Penerbit', year: '2024' }],
};

// Helper pencarian Meta_Tag berdasarkan atribut.
const findByAttr = (
  tags: ReturnType<typeof renderMetaTags>,
  attr: string,
  value: string,
) => tags.find((t) => t.attrs[attr] === value);

describe('renderMetaTags dengan konfigurasi penuh (Req 18.1, 18.2, 18.3)', () => {
  const tags = renderMetaTags(fullConfig);

  it('menghasilkan elemen <title> dengan teks judul', () => {
    const title = tags.find((t) => t.tag === 'title');
    expect(title).toBeDefined();
    expect(title?.text).toBe(fullConfig.title);
  });

  it('menghasilkan meta description (Req 18.2)', () => {
    const desc = findByAttr(tags, 'name', 'description');
    expect(desc).toBeDefined();
    expect(desc?.attrs.content).toBe(fullConfig.description);
  });

  it('menghasilkan tag Open_Graph: og:title, og:description, og:image, og:url', () => {
    const ogTitle = findByAttr(tags, 'property', 'og:title');
    const ogDesc = findByAttr(tags, 'property', 'og:description');
    const ogImage = findByAttr(tags, 'property', 'og:image');
    const ogUrl = findByAttr(tags, 'property', 'og:url');

    expect(ogTitle?.attrs.content).toBe(fullConfig.title);
    expect(ogDesc?.attrs.content).toBe(fullConfig.description);
    expect(ogImage?.attrs.content).toBe(fullConfig.ogImageUrl);
    expect(ogUrl?.attrs.content).toBe(fullConfig.url);
  });

  it('menghasilkan tag Twitter card: twitter:card, twitter:title, twitter:description, twitter:image (Req 18.6)', () => {
    const twCard = findByAttr(tags, 'name', 'twitter:card');
    const twTitle = findByAttr(tags, 'name', 'twitter:title');
    const twDesc = findByAttr(tags, 'name', 'twitter:description');
    const twImage = findByAttr(tags, 'name', 'twitter:image');

    expect(twCard?.attrs.content).toBe('summary_large_image');
    expect(twTitle?.attrs.content).toBe(fullConfig.title);
    expect(twDesc?.attrs.content).toBe(fullConfig.description);
    expect(twImage?.attrs.content).toBe(fullConfig.ogImageUrl);
  });

  it('tidak ada Meta_Tag berkonten kosong pada konfigurasi penuh', () => {
    for (const t of tags) {
      if (t.tag === 'title') {
        expect((t.text ?? '').trim()).not.toBe('');
      }
      if (typeof t.attrs.content === 'string') {
        expect(t.attrs.content.trim()).not.toBe('');
      }
    }
  });
});

describe('renderMetaTags dengan nilai hilang/kosong (Req 18.5)', () => {
  it('tidak menghasilkan tag untuk field yang tidak ada', () => {
    const tags = renderMetaTags({});
    expect(tags).toHaveLength(0);
  });

  it('tidak menghasilkan tag untuk string kosong atau whitespace', () => {
    const tags = renderMetaTags({
      title: '',
      description: '   ',
      url: '',
      ogImageUrl: '\t  \n',
    });
    expect(tags).toHaveLength(0);
  });

  it('hanya menghasilkan tag untuk field yang terisi (parsial)', () => {
    const tags = renderMetaTags({ title: 'Hanya Judul', description: '' });

    // Title-related tags ada.
    expect(tags.find((t) => t.tag === 'title')).toBeDefined();
    expect(findByAttr(tags, 'property', 'og:title')).toBeDefined();
    expect(findByAttr(tags, 'name', 'twitter:title')).toBeDefined();

    // Description/url/image tidak ada.
    expect(findByAttr(tags, 'name', 'description')).toBeUndefined();
    expect(findByAttr(tags, 'property', 'og:url')).toBeUndefined();
    expect(findByAttr(tags, 'property', 'og:image')).toBeUndefined();
  });

  it('tidak pernah menghasilkan atribut content kosong meskipun parsial', () => {
    const tags = renderMetaTags({ description: 'Ada deskripsi', url: '   ' });
    for (const t of tags) {
      if (typeof t.attrs.content === 'string') {
        expect(t.attrs.content.trim()).not.toBe('');
      }
    }
  });
});

describe('renderMetaHtml (serialisasi ke string <head>)', () => {
  it('menyertakan title, description, Open_Graph, dan Twitter card untuk konfigurasi penuh', () => {
    const html = renderMetaHtml(fullConfig);

    expect(html).toContain('<title>Portfolio - Web &amp; Software Developer</title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:url"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('content="summary_large_image"');
  });

  it('menghasilkan string kosong untuk konfigurasi tanpa nilai terisi', () => {
    expect(renderMetaHtml({})).toBe('');
  });

  it('tidak pernah menyertakan content="" untuk nilai kosong', () => {
    const html = renderMetaHtml({ title: 'Judul', description: '' });
    expect(html).not.toContain('content=""');
  });
});
