import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Smoke test untuk memastikan toolchain Vitest + fast-check terpasang dan
// konfigurasi global ({ numRuns: 100 }) aktif. Test sebenarnya per properti
// ditambahkan pada task-task berikutnya.
describe('toolchain setup', () => {
  it('fast-check global numRuns default adalah 100', () => {
    expect(fc.readConfigureGlobal().numRuns).toBe(100);
  });

  it('property dasar berjalan via fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        return a + b === b + a;
      }),
    );
  });
});
