// Unit test untuk AboutIsland (Bagian_Tentang) — gaya neobrutalism.
//
// Memverifikasi mesin state island:
//   - State_Pemuatan ditampilkan saat mount (Req 1.2)
//   - State Loaded merender nama + deskripsi profil di dalam card (Req 1.3)
//   - State_Kesalahan menampilkan tombol "Coba lagi" yang memicu fetch ulang
//     dan dapat berhasil pada percobaan berikutnya (Req 1.6)
//
// Foto profil tidak lagi dirender di AboutIsland (ditangani HeroIsland),
// sehingga tes fallback gambar dipindahkan ke HeroIsland.test.tsx.
//
// Lapisan akses data (getProfile) di-mock penuh sehingga tidak ada akses
// jaringan nyata.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import AboutIsland from './AboutIsland';
import { getProfile } from '../../lib/dataAccess';
import type { Profile } from '../../lib/types';
import type { FetchResult } from '../../lib/types';

// Mock lapisan akses data agar tidak menyentuh jaringan.
vi.mock('../../lib/dataAccess', () => ({
  getProfile: vi.fn(),
}));

const mockedGetProfile = vi.mocked(getProfile);

const SAMPLE_PROFILE: Profile = {
  id: 'p1',
  name: 'Budi Santoso',
  photoUrl: 'https://example.com/foto.jpg',
  description: 'Pengembang perangkat lunak yang berfokus pada web.',
};

/** Membuat sebuah Promise yang dapat diselesaikan secara manual oleh tes. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AboutIsland', () => {
  it('menampilkan State_Pemuatan saat mount sebelum data tiba (Req 1.2)', () => {
    // getProfile tertunda agar island tetap di state loading.
    const { promise } = deferred<FetchResult<Profile | null>>();
    mockedGetProfile.mockReturnValue(promise);

    render(<AboutIsland />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Memuat profil…')).toBeInTheDocument();
  });

  it('merender nama dan deskripsi setelah profil dimuat (Req 1.3)', async () => {
    mockedGetProfile.mockResolvedValue({ status: 'ok', data: SAMPLE_PROFILE });

    render(<AboutIsland />);

    expect(await screen.findByText(SAMPLE_PROFILE.name)).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_PROFILE.description)).toBeInTheDocument();
    // State loading tidak lagi tampil.
    expect(screen.queryByText('Memuat profil…')).not.toBeInTheDocument();
  });

  it('menampilkan State_Kesalahan dengan tombol "Coba lagi" yang memicu fetch ulang (Req 1.6)', async () => {
    // Percobaan pertama gagal, percobaan kedua (setelah retry) berhasil.
    mockedGetProfile
      .mockResolvedValueOnce({ status: 'error', message: 'Gagal' })
      .mockResolvedValueOnce({ status: 'ok', data: SAMPLE_PROFILE });

    const user = userEvent.setup();
    render(<AboutIsland />);

    // State error tampil dengan tombol coba lagi.
    const retryButton = await screen.findByRole('button', { name: 'Coba lagi' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(mockedGetProfile).toHaveBeenCalledTimes(1);

    // Klik "Coba lagi" memicu fetch ulang.
    await user.click(retryButton);

    expect(mockedGetProfile).toHaveBeenCalledTimes(2);
    // Setelah fetch ulang berhasil, konten profil tampil.
    expect(await screen.findByText(SAMPLE_PROFILE.name)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
