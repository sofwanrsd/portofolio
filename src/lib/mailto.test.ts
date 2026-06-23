import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildMailtoHref, buildMailtoLink } from './mailto';

// Feature: portfolio-website, Property 16: Untuk setiap alamat email yang
// dikonfigurasi, tautan kontak yang dihasilkan memiliki href tepat sama dengan
// "mailto:" + email dan menampilkan alamat email tersebut.
// **Validates: Requirements 6.1**
describe('buildMailtoLink (Property 16)', () => {
  it('href equals "mailto:" + email and label shows the email', () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        const link = buildMailtoLink(email);

        expect(link.href).toBe('mailto:' + email);
        expect(buildMailtoHref(email)).toBe('mailto:' + email);
        expect(link.label).toBe(email);
      }),
    );
  });
});
