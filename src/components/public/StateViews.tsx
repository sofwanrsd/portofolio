// Komponen tampilan state bersama untuk islands bagian publik.
//
// Menyediakan tiga tampilan presentasional yang dapat dipakai ulang oleh
// AboutIsland, SkillsIsland, ProjectsIsland, dan HistoryIsland (task 10.x):
//   - LoadingView : State_Pemuatan berupa spinner (Req 1.2, 2.2, 3.2, 15.2)
//   - ErrorView   : State_Kesalahan berupa pesan + tombol "Coba lagi"
//                   (Req 1.6, 2.7, 3.9, 15.7)
//   - EmptyView   : pesan kosong saat data berhasil dimuat namun tanpa entri
//                   (Req 2.6, 3.8, 15.6)
//
// Komponen ini murni presentasional (tanpa fetch/efek samping) agar mesin
// state tiap island tetap mengendalikan kapan masing-masing tampilan dirender.
// Gaya neobrutalism: border hitam tebal, sudut tajam, aksen kuning. Pada
// Mode_Tema gelap border/aksen tetap terbaca di atas latar #151515.

import type { ReactNode } from 'react';

/** Props bersama untuk seluruh tampilan state. */
interface BaseStateProps {
  /** Label aksesibilitas opsional untuk wadah tampilan. */
  label?: string;
  /** Kelas tambahan opsional untuk penyesuaian tata letak per bagian. */
  className?: string;
}

/** Props untuk {@link LoadingView}. */
export interface LoadingViewProps extends BaseStateProps {
  /** Teks pemuatan yang ditampilkan di samping spinner. */
  message?: string;
}

/** Props untuk {@link ErrorView}. */
export interface ErrorViewProps extends BaseStateProps {
  /** Pesan kesalahan yang ditampilkan kepada Pengunjung. */
  message?: string;
  /** Callback yang dipanggil saat Pengunjung menekan tombol "Coba lagi". */
  onRetry: () => void;
  /** Label kustom opsional untuk tombol coba lagi. */
  retryLabel?: string;
}

/** Props untuk {@link EmptyView}. */
export interface EmptyViewProps extends BaseStateProps {
  /** Pesan yang mengindikasikan belum ada data untuk ditampilkan. */
  message?: string;
  /** Konten tambahan opsional (mis. ikon) di atas pesan. */
  children?: ReactNode;
}

const CONTAINER_BASE =
  'flex flex-col items-center justify-center gap-4 py-10 px-4 text-center';

/**
 * Spinner State_Pemuatan. Ditampilkan saat data sedang diambil dari
 * Basis_Data dan belum selesai (Req 1.2, 2.2, 3.2, 15.2).
 */
export function LoadingView({
  message = 'Memuat…',
  label = 'Memuat konten',
  className = '',
}: LoadingViewProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`${CONTAINER_BASE} ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-8 w-8 animate-spin border-4 border-black border-t-accent dark:border-white dark:border-t-accent"
      />
      <span className="text-sm font-bold uppercase tracking-wide text-black dark:text-white">
        {message}
      </span>
    </div>
  );
}

/**
 * State_Kesalahan berupa pesan kesalahan beserta tombol "Coba lagi" yang
 * memicu callback {@link ErrorViewProps.onRetry}. Setiap bagian dapat
 * mencoba memuat ulang secara independen tanpa menghentikan bagian lain
 * (Req 1.6, 2.7, 3.9, 15.7).
 */
export function ErrorView({
  message = 'Gagal memuat data. Silakan coba lagi.',
  onRetry,
  retryLabel = 'Coba lagi',
  label = 'Terjadi kesalahan',
  className = '',
}: ErrorViewProps) {
  return (
    <div
      role="alert"
      aria-label={label}
      className={`${CONTAINER_BASE} ${className}`}
    >
      <p className="nb-border bg-accent px-4 py-3 text-sm font-bold text-black">
        {message}
      </p>
      <button type="button" onClick={onRetry} className="nb-btn-solid nb-interactive">
        {retryLabel}
      </button>
    </div>
  );
}

/**
 * Tampilan kosong (empty state) saat pengambilan data berhasil namun tidak
 * memuat satu pun entri (Req 2.6, 3.8, 15.6).
 */
export function EmptyView({
  message = 'Belum ada data untuk ditampilkan.',
  label = 'Tidak ada data',
  className = '',
  children,
}: EmptyViewProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`${CONTAINER_BASE} ${className}`}
    >
      {children}
      <p className="text-sm font-bold uppercase tracking-wide text-black dark:text-white">
        {message}
      </p>
    </div>
  );
}
