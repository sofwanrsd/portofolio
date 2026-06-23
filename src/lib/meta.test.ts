import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { renderMetaTags } from './meta';
import type { SiteConfig } from '../config/site';

// Feature: portfolio-website, Property 17: Untuk setiap konfigurasi situs
// (mungkin parsial), fungsi render meta menyertakan sebuah Meta_Tag jika dan
// hanya jika nilai yang bersesuaian terisi, dan tidak pernah menghasilkan
// Meta_Tag berkonten kosong.
// **Validates: Requirements 18.5**
describe('renderMetaTags (Property 17)', () => {
  // Nilai yang mungkin: tidak ada, kosong, whitespace, atau terisi.
  const valueArb = fc.oneof(
    fc.constant<undefined>(undefined),
    fc.constant(''),
    fc.constant('   '),
    fc.string({ minLength: 1 }).map((s) => s + 'x'), // pastikan ada karakter non-spasi
  );

  const isConfigured = (v: string | undefined): boolean =>
    typeof v === 'string' && v.trim() !== '';

  it('emits a meta tag iff the corresponding config value is non-empty, never empty content', () => {
    fc.assert(
      fc.property(valueArb, valueArb, valueArb, valueArb, (title, description, url, ogImageUrl) => {
        const config: Partial<SiteConfig> = { title, description, url, ogImageUrl };
        const tags = renderMetaTags(config);

        // Identitas tag per field konfigurasi.
        const hasTitle = tags.some((t) => t.tag === 'title');
        const hasDescription = tags.some((t) => t.attrs.name === 'description');
        const hasUrl = tags.some((t) => t.attrs.property === 'og:url');
        const hasImage = tags.some((t) => t.attrs.property === 'og:image');

        // iff: tag ada jika dan hanya jika nilai terisi.
        expect(hasTitle).toBe(isConfigured(title));
        expect(hasDescription).toBe(isConfigured(description));
        expect(hasUrl).toBe(isConfigured(url));
        expect(hasImage).toBe(isConfigured(ogImageUrl));

        // Tidak pernah ada tag berkonten kosong.
        for (const t of tags) {
          if (t.tag === 'title') {
            expect((t.text ?? '').trim()).not.toBe('');
          }
          if (typeof t.attrs.content === 'string') {
            expect(t.attrs.content.trim()).not.toBe('');
          }
        }
      }),
    );
  });
});
