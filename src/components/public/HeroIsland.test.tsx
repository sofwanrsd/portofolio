// Unit test untuk HeroIsland (Bagian Hero) — gaya neobrutalism.
//
// Memverifikasi mesin state island dan fallback gambar:
//   - State_Pemuatan ditampilkan saat mount (Req 1.2)
//   - State Loaded merender judul peran (siteConfig.role), salam nama,
//     tautan VIEW MORE (href "#projects") dan DOWNLOAD CV (Req 1.3)
//   - Foto yang gagal dimuat beralih ke placeholder (Req 1.7)
//   - State_Kesalahan menampilkan tombol "Coba lagi" yang memicu fetch ulang
//     (Req 1.6)
//
// Lapisan akses data (getProfile) di-mock penuh sehingga tidak ada akses
// jaringan nyata. siteConfig dipakai apa adanya (tidak di-mock).

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import HeroIsland from './HeroIsland';
import { getProfile } from '../../lib/dataAccess';
import { siteConfig } from '../../config/site';
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

describe('HeroIsland', () => {
  it('menampilkan State_Pemuatan saat mount sebelum data tiba (Req 1.2)', () => {
    // getProfile tertunda agar island tetap di state loading.
    const { promise } = deferred<FetchResult<Profile | null>>();
    mockedGetProfile.mockReturnValue(promise);

    render(<HeroIsland />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Memuat profil…')).toBeInTheDocument();
  });

  it('merender judul peran, salam nama, dan tautan VIEW MORE / DOWNLOAD CV setelah profil dimuat (Req 1.3)', async () => {
    mockedGetProfile.mockResolvedValue({ status: 'ok', data: SAMPLE_PROFILE });

    render(<HeroIsland />);

    // Judul peran raksasa memakai siteConfig.role.
    expect(
      await screen.findByRole('heading', { name: siteConfig.role, level: 1 }),
    ).toBeInTheDocument();

    // Salam nama "HALO, SAYA <nama>".
    expect(screen.getByText(`Halo, saya ${SAMPLE_PROFILE.name}`)).toBeInTheDocument();

    // Tautan LIHAT PROYEK menuju "#projects".
    const viewMore = screen.getByRole('link', { name: /lihat proyek/i });
    expect(viewMore).toHaveAttribute('href', '#projects');

    // Tautan UNDUH CV menuju siteConfig.cvUrl.
    const downloadCv = screen.getByRole('link', { name: /unduh cv/i });
    expect(downloadCv).toHaveAttribute('href', siteConfig.cvUrl);

    // State loading tidak lagi tampil.
    expect(screen.queryByText('Memuat profil…')).not.toBeInTheDocument();
  });

  it('beralih ke gambar placeholder saat foto gagal dimuat (Req 1.7)', async () => {
    mockedGetProfile.mockResolvedValue({ status: 'ok', data: SAMPLE_PROFILE });

    render(<HeroIsland />);

    const img = (await screen.findByAltText(
      `Foto profil ${SAMPLE_PROFILE.name}`,
    )) as HTMLImageElement;
    // Awalnya memakai URL eksternal.
    expect(img.src).toBe(SAMPLE_PROFILE.photoUrl);

    // Simulasikan kegagalan pemuatan gambar.
    fireEvent.error(img);

    await waitFor(() => {
      expect(img.src).toMatch(/^data:image\/svg\+xml/);
    });

    // Konten utama tetap tampil.
    expect(
      screen.getByRole('heading', { name: siteConfig.role, level: 1 }),
    ).toBeInTheDocument();
  });

  it('menampilkan State_Kesalahan dengan tombol "Coba lagi" yang memicu fetch ulang (Req 1.6)', async () => {
    // Percobaan pertama gagal, percobaan kedua (setelah retry) berhasil.
    mockedGetProfile
      .mockResolvedValueOnce({ status: 'error', message: 'Gagal' })
      .mockResolvedValueOnce({ status: 'ok', data: SAMPLE_PROFILE });

    const user = userEvent.setup();
    render(<HeroIsland />);

    const retryButton = await screen.findByRole('button', { name: 'Coba lagi' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(mockedGetProfile).toHaveBeenCalledTimes(1);

    await user.click(retryButton);

    expect(mockedGetProfile).toHaveBeenCalledTimes(2);
    // Setelah fetch ulang berhasil, judul peran tampil.
    expect(
      await screen.findByRole('heading', { name: siteConfig.role, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
