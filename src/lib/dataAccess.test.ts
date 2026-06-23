import { describe, it, expect } from 'vitest';

// Uji fasad dataAccess: memverifikasi delegasi ke repository aktif (jsonRepository)
// terhadap seed.json NYATA. Fasad tidak boleh melempar dan harus mengembalikan
// FetchResult ok dengan data domain camelCase yang publik.

import {
  getProfile,
  getSkills,
  getHistory,
  getCertifications,
} from './dataAccess';

describe('dataAccess (fasad) mendelegasikan ke repository JSON', () => {
  it('getProfile mengembalikan profil publik (camelCase)', async () => {
    const result = await getProfile();
    expect(result.status).toBe('ok');
    if (result.status === 'ok' && result.data) {
      expect(typeof result.data.name).toBe('string');
      expect('photoUrl' in result.data).toBe(true);
    }
  });

  it('getSkills mengembalikan hanya keahlian publik, terurut sortOrder menaik', async () => {
    const result = await getSkills();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.every((s) => s.isPublic !== false)).toBe(true);
      const orders = result.data.map((s) => s.sortOrder);
      expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    }
  });

  it('getHistory mengembalikan hanya riwayat publik', async () => {
    const result = await getHistory();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.data.every((h) => h.isPublic !== false)).toBe(true);
    }
  });

  it('getCertifications mengembalikan hanya sertifikat publik, terurut sortOrder menaik', async () => {
    const result = await getCertifications();
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.data.every((c) => c.isPublic !== false)).toBe(true);
      const orders = result.data.map((c) => c.sortOrder);
      expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    }
  });
});
