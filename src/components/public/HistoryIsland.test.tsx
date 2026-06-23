// Unit test untuk HistoryIsland — Bagian_Riwayat (timeline).
//
// Memverifikasi perilaku island setelah data riwayat diambil melalui
// getHistory() (di-mock; tanpa jaringan):
//   - Urutan kronologis menurun: entri dirender sesuai sortHistoryDesc,
//     terbaru lebih dahulu (Req 15.5).
//   - Penanda "sekarang": entri dengan endDate null memformat periode
//     dengan penanda "sekarang" via formatPeriod (Req 15.4).
//   - Empty state: getHistory mengembalikan data kosong -> pesan kosong
//     (Req 15.6).
//
// getHistory di-mock pada modul ../../lib/dataAccess sehingga komponen tidak
// melakukan akses jaringan dan kita dapat mengontrol jalur sukses/kosong.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import HistoryIsland from './HistoryIsland';
import type { HistoryEntry } from '../../lib/types';

// Mock lapisan akses data: hanya getHistory yang dipakai HistoryIsland.
vi.mock('../../lib/dataAccess', () => ({
  getHistory: vi.fn(),
}));

import { getHistory } from '../../lib/dataAccess';

const mockedGetHistory = vi.mocked(getHistory);

/** Membuat entri riwayat uji dengan nilai default yang dapat ditimpa. */
function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    roleTitle: overrides.roleTitle ?? 'Software Engineer',
    institution: overrides.institution ?? 'Acme Corp',
    startDate: overrides.startDate ?? '2020-01-01',
    endDate: overrides.endDate ?? null,
    description: overrides.description ?? null,
  };
}

beforeEach(() => {
  mockedGetHistory.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('HistoryIsland — judul bagian (markup neobrutalism)', () => {
  it('merender judul bagian "Riwayat" sebagai heading level 2', async () => {
    mockedGetHistory.mockResolvedValue({
      status: 'ok',
      data: [makeEntry({ id: 'h', roleTitle: 'Engineer' })],
    });

    render(<HistoryIsland />);

    // Judul bagian selalu hadir sebagai heading level 2 (font-display uppercase).
    const sectionHeading = screen.getByRole('heading', { level: 2, name: /riwayat/i });
    expect(sectionHeading).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Engineer')).toBeInTheDocument();
    });
  });
});

describe('HistoryIsland — urutan kronologis menurun (Req 15.5)', () => {
  it('merender entri dari startDate terbaru ke terlama', async () => {
    // Sengaja diberikan dalam urutan tidak terurut untuk memastikan
    // sortHistoryDesc benar-benar diterapkan oleh komponen.
    const older = makeEntry({
      id: 'older',
      roleTitle: 'Junior Developer',
      startDate: '2018-06-01',
      endDate: '2020-01-01',
    });
    const newest = makeEntry({
      id: 'newest',
      roleTitle: 'Lead Engineer',
      startDate: '2022-03-01',
      endDate: '2023-01-01',
    });
    const middle = makeEntry({
      id: 'middle',
      roleTitle: 'Senior Developer',
      startDate: '2020-02-01',
      endDate: '2022-02-01',
    });

    mockedGetHistory.mockResolvedValue({
      status: 'ok',
      data: [older, newest, middle],
    });

    render(<HistoryIsland />);

    // Tunggu hingga linimasa selesai dirender.
    await waitFor(() => {
      expect(screen.getByText('Lead Engineer')).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading', { level: 4 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Lead Engineer', // 2022-03
      'Senior Developer', // 2020-02
      'Junior Developer', // 2018-06
    ]);
  });
});

describe('HistoryIsland — penanda "sekarang" (Req 15.4)', () => {
  it('menampilkan "sekarang" untuk entri berjalan (endDate null)', async () => {
    mockedGetHistory.mockResolvedValue({
      status: 'ok',
      data: [
        makeEntry({
          id: 'ongoing',
          roleTitle: 'Staff Engineer',
          startDate: '2023-04-01',
          endDate: null,
        }),
      ],
    });

    render(<HistoryIsland />);

    await waitFor(() => {
      expect(screen.getByText('Staff Engineer')).toBeInTheDocument();
    });

    // formatPeriod menandai entri berjalan dengan "sekarang".
    expect(screen.getByText(/sekarang/i)).toBeInTheDocument();
  });

  it('tidak menampilkan "sekarang" untuk entri dengan endDate terisi', async () => {
    mockedGetHistory.mockResolvedValue({
      status: 'ok',
      data: [
        makeEntry({
          id: 'finished',
          roleTitle: 'Intern',
          startDate: '2019-01-01',
          endDate: '2019-12-01',
        }),
      ],
    });

    render(<HistoryIsland />);

    await waitFor(() => {
      expect(screen.getByText('Intern')).toBeInTheDocument();
    });

    expect(screen.queryByText(/sekarang/i)).not.toBeInTheDocument();
  });
});

describe('HistoryIsland — empty state (Req 15.6)', () => {
  it('menampilkan pesan kosong saat tidak ada entri riwayat', async () => {
    mockedGetHistory.mockResolvedValue({ status: 'ok', data: [] });

    render(<HistoryIsland />);

    await waitFor(() => {
      expect(
        screen.getByText('Belum ada riwayat untuk ditampilkan.'),
      ).toBeInTheDocument();
    });

    // Tidak ada entri linimasa yang dirender.
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });
});
