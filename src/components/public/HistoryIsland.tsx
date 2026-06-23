// HistoryIsland — Bagian_Riwayat (timeline, gaya neobrutalism).
//
// Island ini mengambil data riwayat secara runtime dari peramban Pengunjung
// melalui getHistory() (Req 15.1), lalu merender linimasa kronologis menurun
// menggunakan sortHistoryDesc (Req 15.5) dengan periode yang diformat oleh
// formatPeriod (endDate null -> penanda "sekarang", Req 15.4). Setiap entri
// dirender sebagai kartu berborder tebal (neobrutalism) yang menampilkan
// periode, posisi/gelar (roleTitle), instansi/institusi, serta deskripsi
// opsional (Req 15.3).
//
// Mesin state seragam:
//   Loading -> Loaded  : data diterima & tidak kosong
//   Loading -> Empty   : data diterima & kosong (Req 15.6)
//   Loading -> Error   : gagal; tombol "Coba lagi" memuat ulang (Req 15.2, 15.7)
//
// Gaya neobrutalism (Foundation tokens): radius 0, border tebal
// border-light-text dark:border-dark-text, offset shadow-brutal, heading
// font-display uppercase, aksen oranye = light-primary/dark-primary.

import { useCallback, useEffect, useState } from 'react';
import { getHistory } from '../../lib/dataAccess';
import { formatPeriod, sortHistoryDesc } from '../../lib/transforms';
import type { HistoryEntry } from '../../lib/types';
import { EmptyView, ErrorView, LoadingView } from './StateViews';

type HistoryState =
  | { status: 'loading' }
  | { status: 'loaded'; entries: HistoryEntry[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

/**
 * Satu kartu linimasa: periode, posisi/gelar (roleTitle), instansi, dan
 * deskripsi opsional. Periode diturunkan dari formatPeriod sehingga entri
 * berjalan (endDate null) ditandai dengan "sekarang".
 */
function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const period = formatPeriod(entry.startDate, entry.endDate);

  return (
    <li className="flex flex-col gap-2 border-4 border-light-text bg-light-surface p-5 text-light-text shadow-brutal dark:border-dark-text dark:bg-dark-surface dark:text-dark-text">
      {/* Periode (formatPeriod): entri berjalan memuat penanda "sekarang". */}
      <p className="font-display text-xs uppercase tracking-wider text-light-primary dark:text-dark-primary">
        {period}
      </p>

      <h4 className="font-display text-h3 uppercase text-light-text dark:text-dark-text">
        {entry.roleTitle}
      </h4>

      <p className="font-sans text-sm font-bold uppercase tracking-wide text-light-text dark:text-dark-text">
        {entry.institution}
      </p>

      {entry.description ? (
        <p className="mt-2 font-sans text-sm leading-relaxed text-light-text-muted dark:text-dark-text-muted">
          {entry.description}
        </p>
      ) : null}
    </li>
  );
}

/**
 * Island Bagian_Riwayat. Memisahkan entri menjadi dua kelompok terpisah:
 * "Pengalaman" (kind 'experience') dan "Pendidikan" (kind 'education').
 * Tiap kelompok diurutkan kronologis menurun (terbaru lebih dahulu).
 */
export default function HistoryIsland() {
  const [state, setState] = useState<HistoryState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const result = await getHistory();

    if (result.status === 'error') {
      setState({ status: 'error', message: result.message });
      return;
    }

    if (result.data.length === 0) {
      setState({ status: 'empty' });
      return;
    }

    setState({ status: 'loaded', entries: sortHistoryDesc(result.data) });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const experiences =
    state.status === 'loaded'
      ? state.entries.filter((e) => e.kind !== 'education')
      : [];
  const education =
    state.status === 'loaded'
      ? state.entries.filter((e) => e.kind === 'education')
      : [];

  return (
    <section
      aria-labelledby="riwayat-heading"
      className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <h2
        id="riwayat-heading"
        className="mb-8 font-display text-h2 uppercase text-light-text dark:text-dark-text"
      >
        Riwayat
      </h2>

      {state.status === 'loading' && (
        <LoadingView message="Memuat riwayat…" label="Memuat riwayat" />
      )}

      {state.status === 'error' && (
        <ErrorView
          message={state.message || 'Gagal memuat riwayat. Silakan coba lagi.'}
          onRetry={() => void load()}
          label="Gagal memuat riwayat"
        />
      )}

      {state.status === 'empty' && (
        <EmptyView message="Belum ada riwayat untuk ditampilkan." />
      )}

      {state.status === 'loaded' && (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Kelompok Pengalaman */}
          <div>
            <h3 className="mb-5 inline-block border-2 border-light-text bg-accent px-3 py-1 font-display text-sm uppercase tracking-widest text-black shadow-brutal-sm dark:border-dark-text dark:bg-accent dark:text-black">
              Pengalaman
            </h3>
            {experiences.length > 0 ? (
              <ol className="flex flex-col gap-6">
                {experiences.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} />
                ))}
              </ol>
            ) : (
              <p className="font-sans text-sm text-light-text-muted dark:text-dark-text-muted">
                Belum ada pengalaman.
              </p>
            )}
          </div>

          {/* Kelompok Pendidikan */}
          <div>
            <h3 className="mb-5 inline-block border-2 border-light-text bg-accent px-3 py-1 font-display text-sm uppercase tracking-widest text-black shadow-brutal-sm dark:border-dark-text dark:bg-accent dark:text-black">
              Pendidikan
            </h3>
            {education.length > 0 ? (
              <ol className="flex flex-col gap-6">
                {education.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} />
                ))}
              </ol>
            ) : (
              <p className="font-sans text-sm text-light-text-muted dark:text-dark-text-muted">
                Belum ada pendidikan.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
