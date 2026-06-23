import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NAV_LINKS, resolveActiveNav, type NavLink } from './nav';

// Feature: portfolio-website, Property 14: Untuk setiap bagian yang ditetapkan
// sebagai bagian yang sedang terlihat, fungsi penentu tautan aktif menandai
// tepat satu tautan Menu_Navigasi sebagai aktif, dan tautan tersebut adalah
// tautan yang menuju bagian itu.
// **Validates: Requirements 5.4, 5.5**
describe('resolveActiveNav (Property 14)', () => {
  const navIds = NAV_LINKS.map((l) => l.id);

  it('marks exactly one link active — the one whose id matches the visible section', () => {
    fc.assert(
      fc.property(fc.constantFrom(...navIds), (activeSectionId) => {
        const result = resolveActiveNav(NAV_LINKS, activeSectionId);

        const activeLinks = result.filter((l) => l.active);

        // Tepat satu tautan aktif.
        expect(activeLinks).toHaveLength(1);
        // Tautan aktif itu adalah tautan menuju bagian terlihat.
        expect(activeLinks[0].id).toBe(activeSectionId);
      }),
    );
  });
});
