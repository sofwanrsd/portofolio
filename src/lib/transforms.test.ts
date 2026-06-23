import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { groupSkills, limitSkills, sortHistoryDesc, formatPeriod } from './transforms';
import type { HistoryEntry, Skill } from './types';

// ---------------------------------------------------------------------------
// Arbitraries (generator) untuk tipe domain Skill dan HistoryEntry.
// ---------------------------------------------------------------------------

/** Tanggal ISO "YYYY-MM-DD" yang dapat dibandingkan secara leksikografis. */
const isoDateArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 1950, max: 2099 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(
    ([y, m, d]) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  );

const skillArb: fc.Arbitrary<Skill> = fc.record({
  id: fc.string(),
  name: fc.string(),
  category: fc.constantFrom('language', 'framework', 'tool', 'soft'),
  level: fc.option(fc.integer({ min: 1, max: 5 }), { nil: null }),
  sortOrder: fc.integer(),
});

const historyArb: fc.Arbitrary<HistoryEntry> = fc.record({
  id: fc.string(),
  roleTitle: fc.string(),
  institution: fc.string(),
  startDate: isoDateArb,
  endDate: fc.option(isoDateArb, { nil: null }),
  description: fc.option(fc.string(), { nil: null }),
});

// ---------------------------------------------------------------------------
// Property tests
// ---------------------------------------------------------------------------

describe('transforms (property-based)', () => {
  // Feature: portfolio-website, Property 1: Pengelompokan keahlian mempertahankan keanggotaan — gabungan ketiga grup adalah permutasi dari daftar masukan, dan setiap entri berada pada grup yang sama dengan nilai category-nya.
  // Validates: Requirements 2.4
  it('Property 1: groupSkills mempertahankan keanggotaan', () => {
    fc.assert(
      fc.property(fc.array(skillArb), (skills) => {
        const groups = groupSkills(skills);

        // Setiap entri berada pada grup sesuai category-nya.
        expect(groups.language.every((s) => s.category === 'language')).toBe(true);
        expect(groups.framework.every((s) => s.category === 'framework')).toBe(true);
        expect(groups.tool.every((s) => s.category === 'tool')).toBe(true);
        expect(groups.soft.every((s) => s.category === 'soft')).toBe(true);

        // Gabungan keempat grup adalah permutasi dari masukan (tanpa kehilangan
        // atau duplikasi). Referensi objek dipertahankan oleh groupSkills,
        // sehingga kesetaraan himpunan referensi membuktikan permutasi.
        const combined = [...groups.language, ...groups.framework, ...groups.tool, ...groups.soft];
        expect(combined.length).toBe(skills.length);
        expect(new Set(combined)).toEqual(new Set(skills));
      }),
    );
  });

  // Feature: portfolio-website, Property 2: Pembatasan keahlian ke 50 entri pertama — limitSkills mengembalikan tepat min(panjang, 50) entri yang merupakan prefiks berurutan dari daftar masukan.
  // Validates: Requirements 2.8
  it('Property 2: limitSkills mengembalikan prefiks berurutan sepanjang min(panjang, 50)', () => {
    fc.assert(
      fc.property(fc.array(skillArb, { maxLength: 120 }), (skills) => {
        const result = limitSkills(skills);
        const expectedLength = Math.min(skills.length, 50);

        expect(result.length).toBe(expectedLength);
        // Prefiks berurutan: elemen ke-i hasil sama dengan elemen ke-i masukan.
        expect(result).toEqual(skills.slice(0, expectedLength));
      }),
    );
  });

  // Feature: portfolio-website, Property 3: Riwayat terurut kronologis menurun — sortHistoryDesc menghasilkan permutasi dari masukan yang monoton tidak-naik berdasarkan startDate.
  // Validates: Requirements 15.5
  it('Property 3: sortHistoryDesc menghasilkan permutasi monoton tidak-naik berdasarkan startDate', () => {
    fc.assert(
      fc.property(fc.array(historyArb), (entries) => {
        const sorted = sortHistoryDesc(entries);

        // Permutasi dari masukan (referensi dipertahankan).
        expect(sorted.length).toBe(entries.length);
        expect(new Set(sorted)).toEqual(new Set(entries));

        // Monoton tidak-naik berdasarkan startDate (terbaru -> terlama).
        for (let i = 0; i + 1 < sorted.length; i += 1) {
          expect(sorted[i].startDate >= sorted[i + 1].startDate).toBe(true);
        }
      }),
    );
  });

  // Feature: portfolio-website, Property 4: Format periode menandai entri berjalan — formatPeriod mengandung "sekarang" jika dan hanya jika endDate bernilai null; bila endDate ada, keluaran memuat representasi tanggal selesai tersebut.
  // Validates: Requirements 15.4
  it('Property 4: formatPeriod menandai entri berjalan dengan "sekarang"', () => {
    fc.assert(
      fc.property(isoDateArb, fc.option(isoDateArb, { nil: null }), (start, end) => {
        const result = formatPeriod(start, end);

        // "sekarang" muncul jika dan hanya jika endDate null.
        expect(result.includes('sekarang')).toBe(end === null);

        // Bila endDate ada, keluaran memuat representasi tanggal selesai.
        // formatDate selalu menyertakan tahun pada keluarannya, sehingga
        // bagian tahun dari endDate harus muncul dalam hasil.
        if (end !== null) {
          const endYear = end.split('-')[0];
          expect(result.includes(endYear)).toBe(true);
        }
      }),
    );
  });
});
