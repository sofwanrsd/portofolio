// Unit test untuk komponen tampilan state bersama (StateViews).
//
// Memverifikasi perilaku presentasional ketiga tampilan yang dipakai ulang
// oleh islands publik:
//   - LoadingView : merender indikator status/spinner beserta pesan
//                   (Req 1.2, 2.2, 3.2, 15.2)
//   - ErrorView   : merender pesan kesalahan dan tombol "Coba lagi" yang
//                   memicu callback onRetry (Req 1.6, 2.7, 3.9, 15.7)
//   - EmptyView   : merender pesan kosong (Req 2.6, 3.8, 15.6)

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { EmptyView, ErrorView, LoadingView } from './StateViews';

afterEach(() => {
  cleanup();
});

describe('LoadingView', () => {
  it('merender wadah status untuk pembaca layar', () => {
    render(<LoadingView />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('menampilkan pesan pemuatan default', () => {
    render(<LoadingView />);
    expect(screen.getByText('Memuat…')).toBeInTheDocument();
  });

  it('menampilkan pesan pemuatan kustom', () => {
    render(<LoadingView message="Memuat keahlian…" />);
    expect(screen.getByText('Memuat keahlian…')).toBeInTheDocument();
  });

  it('menyertakan label aksesibilitas pada wadah status', () => {
    render(<LoadingView label="Memuat proyek" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Memuat proyek'
    );
  });
});

describe('ErrorView', () => {
  it('merender pesan kesalahan default', () => {
    render(<ErrorView onRetry={() => {}} />);
    expect(
      screen.getByText('Gagal memuat data. Silakan coba lagi.')
    ).toBeInTheDocument();
  });

  it('merender pesan kesalahan kustom', () => {
    render(<ErrorView message="Koneksi terputus." onRetry={() => {}} />);
    expect(screen.getByText('Koneksi terputus.')).toBeInTheDocument();
  });

  it('merender wadah alert untuk pembaca layar', () => {
    render(<ErrorView onRetry={() => {}} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('merender tombol "Coba lagi" secara default', () => {
    render(<ErrorView onRetry={() => {}} />);
    expect(
      screen.getByRole('button', { name: 'Coba lagi' })
    ).toBeInTheDocument();
  });

  it('merender label tombol coba lagi kustom', () => {
    render(<ErrorView onRetry={() => {}} retryLabel="Muat ulang" />);
    expect(
      screen.getByRole('button', { name: 'Muat ulang' })
    ).toBeInTheDocument();
  });

  it('memicu callback onRetry saat tombol "Coba lagi" diklik', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<ErrorView onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('memicu onRetry sekali per klik (klik berulang)', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<ErrorView onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Coba lagi' });
    await user.click(button);
    await user.click(button);

    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});

describe('EmptyView', () => {
  it('merender pesan kosong default', () => {
    render(<EmptyView />);
    expect(
      screen.getByText('Belum ada data untuk ditampilkan.')
    ).toBeInTheDocument();
  });

  it('merender pesan kosong kustom', () => {
    render(<EmptyView message="Belum ada proyek." />);
    expect(screen.getByText('Belum ada proyek.')).toBeInTheDocument();
  });

  it('merender konten anak tambahan di atas pesan', () => {
    render(
      <EmptyView message="Belum ada keahlian.">
        <span data-testid="empty-icon">ikon</span>
      </EmptyView>
    );
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    expect(screen.getByText('Belum ada keahlian.')).toBeInTheDocument();
  });

  it('menyertakan label aksesibilitas pada wadah', () => {
    render(<EmptyView label="Tidak ada riwayat" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Tidak ada riwayat'
    );
  });
});
