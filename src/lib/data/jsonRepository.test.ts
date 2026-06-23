import { describe, it, expect, vi } from 'vitest';

// Uji unit jsonRepository: pembacaan seed.json + penyaringan is_public +
// pemetaan snake_case -> camelCase + pengurutan sort_order.
//
// Seed tiruan dengan campuran baris publik & tersembunyi agar dapat
// memverifikasi bahwa lapisan baca PUBLIK menyembunyikan baris is_public=false
// dan mengurutkan berdasarkan sort_order menaik.

vi.mock('../../data/seed.json', () => ({
  default: {
    profile: {
      id: 'p1',
      name: 'Owner',
      photo_url: null,
      description: 'desc',
      is_public: true,
    },
    skills: [
      { id: 's2', name: 'Skill B', category: 'tool', level: 3, sort_order: 2, is_public: true },
      { id: 's1', name: 'Skill A', category: 'language', level: 5, sort_order: 1, is_public: true },
      { id: 's3', name: 'Hidden Skill', category: 'tool', level: 3, sort_order: 3, is_public: false },
    ],
    history: [
      {
        id: 'h1',
        role_title: 'Public Role',
        institution: 'Org',
        start_date: '2020-01-01',
        end_date: null,
        description: null,
        kind: 'experience',
        is_public: true,
      },
      {
        id: 'h2',
        role_title: 'Hidden Role',
        institution: 'Org',
        start_date: '2019-01-01',
        end_date: '2020-01-01',
        description: 'x',
        kind: 'education',
        is_public: false,
      },
    ],
    certifications: [
      { id: 'c2', title: 'Cert B', issuer: 'X', year: '2024', url: null, sort_order: 2, is_public: true },
      { id: 'c1', title: 'Cert A', issuer: 'X', year: '2023', url: 'https://e.com', sort_order: 1, is_public: true },
      { id: 'c3', title: 'Hidden Cert', issuer: 'X', year: '2025', url: null, sort_order: 3, is_public: false },
    ],
  },
}));

import { jsonRepository } from './jsonRepository';

describe('jsonRepository — pembacaan & penyaringan is_public', () => {
  it('getProfile memetakan snake_case -> camelCase dan mengembalikan profil publik', async () => {
    const result = await jsonRepository.getProfile();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.data).toEqual({
        id: 'p1',
        name: 'Owner',
        photoUrl: null,
        description: 'desc',
        isPublic: true,
      });
    }
  });

  it('getSkills hanya mengembalikan keahlian publik, terurut sort_order menaik', async () => {
    const result = await jsonRepository.getSkills();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      // s3 tersembunyi; s1 (sort 1) sebelum s2 (sort 2).
      expect(result.data.map((s) => s.id)).toEqual(['s1', 's2']);
      expect(result.data[0]).toMatchObject({ name: 'Skill A', sortOrder: 1, isPublic: true });
    }
  });

  it('getHistory hanya mengembalikan riwayat publik dengan kind ternormalisasi', async () => {
    const result = await jsonRepository.getHistory();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.data.map((h) => h.id)).toEqual(['h1']);
      expect(result.data[0]).toMatchObject({
        roleTitle: 'Public Role',
        startDate: '2020-01-01',
        endDate: null,
        kind: 'experience',
      });
    }
  });

  it('getCertifications hanya mengembalikan sertifikat publik, terurut sort_order menaik', async () => {
    const result = await jsonRepository.getCertifications();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.data.map((c) => c.id)).toEqual(['c1', 'c2']);
      expect(result.data[0]).toMatchObject({ title: 'Cert A', sortOrder: 1 });
    }
  });
});
