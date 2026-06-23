import fc from 'fast-check';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Default global untuk property-based testing: minimal 100 iterasi per properti.
// Lihat design.md (Testing Strategy) dan tasks.md (fast-check { numRuns: 100 }).
fc.configureGlobal({ numRuns: 100 });

// Cleanup global Testing Library setelah setiap tes untuk mencegah "bleed"
// DOM antar berkas tes (mis. komponen yang ter-render dari berkas lain ikut
// terhitung). Menstabilkan tes komponen seperti NavBar yang mengandalkan
// hitungan elemen.
afterEach(() => {
  cleanup();
});
