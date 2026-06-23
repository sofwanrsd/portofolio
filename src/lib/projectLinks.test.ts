import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildProjectLinks } from './projectLinks';

// Feature: portfolio-website, Property 15: Untuk setiap proyek, setiap anchor
// tautan eksternal yang dirender (repositori GitHub dan demo bila ada)
// memiliki atribut target="_blank" dan rel yang mengandung noopener.
// **Validates: Requirements 3.7**
describe('buildProjectLinks (Property 15)', () => {
  it('every external link opens in a new tab safely (target=_blank, rel contains noopener)', () => {
    const urlArb = fc.webUrl();
    const demoArb = fc.oneof(
      fc.constant<null>(null),
      fc.constant(''),
      fc.constant('   '),
      fc.webUrl(),
    );

    fc.assert(
      fc.property(urlArb, demoArb, (githubUrl, demoUrl) => {
        const links = buildProjectLinks({ githubUrl, demoUrl });

        // Selalu ada minimal tautan GitHub.
        expect(links.length).toBeGreaterThanOrEqual(1);

        for (const link of links) {
          expect(link.target).toBe('_blank');
          expect(link.rel).toContain('noopener');
        }
      }),
    );
  });
});
