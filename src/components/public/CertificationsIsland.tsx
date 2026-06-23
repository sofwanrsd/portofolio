// CertificationsIsland — Bagian_Sertifikat (gaya neobrutalism).
//
// Mengambil daftar sertifikat dari Basis_Data secara runtime via
// getCertifications() dan merender mesin state seragam:
//   Loading -> Loaded | Empty | Error  (Error -> Loading via "Coba lagi")
// memakai komponen bersama StateViews. Tiap entri dirender sebagai kartu
// berborder tebal + hard shadow (badge tahun, judul, penerbit, tautan
// kredensial opsional yang dibuka aman di tab baru).
//
// Gaya neobrutalism: radius 0, border tebal, shadow-brutal, font-display
// uppercase, aksen oranye. Konsisten pada Mode_Tema terang & gelap (Req 17).

import { useCallback, useEffect, useState } from 'react';
import { getCertifications } from '../../lib/dataAccess';
import type { Certification } from '../../lib/types';
import { EmptyView, ErrorView, LoadingView } from './StateViews';

type ViewState =
  | { status: 'loading' }
  | { status: 'loaded'; certifications: Certification[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export default function CertificationsIsland() {
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const result = await getCertifications();

    if (result.status === 'error') {
      setState({ status: 'error', message: result.message });
      return;
    }

    if (result.data.length === 0) {
      setState({ status: 'empty' });
      return;
    }

    setState({ status: 'loaded', certifications: result.data });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section
      aria-labelledby="certifications-heading"
      className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <h2
        id="certifications-heading"
        className="mb-8 inline-block border-4 border-light-text bg-accent px-4 py-2 font-display text-h2 uppercase text-black shadow-brutal dark:border-dark-text dark:bg-accent dark:text-black"
      >
        Sertifikat
      </h2>

      {state.status === 'loading' && (
        <LoadingView label="Memuat sertifikat" message="Memuat sertifikat…" />
      )}

      {state.status === 'error' && (
        <ErrorView message={state.message} onRetry={() => void load()} />
      )}

      {state.status === 'empty' && (
        <EmptyView message="Belum ada sertifikat untuk ditampilkan." />
      )}

      {state.status === 'loaded' && (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.certifications.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-col gap-3 border-4 border-light-text bg-light-surface p-5 text-light-text shadow-brutal dark:border-dark-text dark:bg-dark-surface dark:text-dark-text"
            >
              <span className="inline-flex w-fit items-center border-2 border-light-text bg-accent px-2.5 py-1 font-display text-xs uppercase tracking-wider text-black dark:border-dark-text dark:text-black">
                {cert.year}
              </span>
              <h3 className="font-display text-h3 uppercase leading-tight text-light-text dark:text-dark-text">
                {cert.title}
              </h3>
              <p className="font-sans text-sm font-bold uppercase tracking-wide text-light-text-muted dark:text-dark-text-muted">
                {cert.issuer}
              </p>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex w-fit items-center border-2 border-light-text bg-light-surface px-3 py-1 font-display text-xs uppercase tracking-wider text-light-text shadow-brutal-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-light-text dark:border-dark-text dark:bg-dark-surface dark:text-dark-text dark:focus-visible:outline-dark-text"
                >
                  Lihat Kredensial
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
