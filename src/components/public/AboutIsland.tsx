// AboutIsland — Bagian_Tentang (gaya neobrutalism).
//
// Mengambil rekaman profil tunggal dari Basis_Data secara runtime dari peramban
// Pengunjung via getProfile() (Req 1.1), lalu merender bagian "ABOUT": label
// section, nama Pemilik sebagai heading, dan deskripsi profil di dalam sebuah
// "card" berborder tebal + shadow-brutal.
//
// Foto profil sengaja TIDAK dirender di sini karena sudah ditampilkan oleh
// HeroIsland; bagian ini fokus pada narasi (nama + deskripsi).
//
// Mesin state mengikuti pola seragam islands publik dan memakai LoadingView/
// ErrorView bersama:
//   Loading --> Loaded (data diterima) | Error (gagal)
//   Error --> Loading (klik "Coba lagi" -> fetch ulang)
// (Req 1.2 State_Pemuatan, Req 1.6 State_Kesalahan + kontrol coba lagi).
//
// Gaya neobrutalism: radius 0, border tebal (border-2/4 border-light-text
// dark:border-dark-text), shadow-brutal keras, heading font-display uppercase
// 900, aksen oranye = token primary. Warna semantik memakai light-*/dark-*.

import { useCallback, useEffect, useState } from 'react';
import { getProfile } from '../../lib/dataAccess';
import type { Profile } from '../../lib/types';
import { ErrorView, LoadingView } from './StateViews';

/** State internal mesin pemuatan Bagian_Tentang. */
type AboutState =
  | { status: 'loading' }
  | { status: 'loaded'; profile: Profile | null }
  | { status: 'error'; message: string };

export interface AboutIslandProps {
  /** Judul bagian opsional (untuk tautan navigasi/anchor). */
  heading?: string;
}

export default function AboutIsland({ heading }: AboutIslandProps) {
  const [state, setState] = useState<AboutState>({ status: 'loading' });

  const fetchProfile = useCallback(async (isActive: () => boolean = () => true) => {
    setState({ status: 'loading' });
    const result = await getProfile();
    if (!isActive()) return;
    if (result.status === 'ok') {
      setState({ status: 'loaded', profile: result.data });
    } else {
      setState({ status: 'error', message: result.message });
    }
  }, []);

  const load = useCallback(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    let active = true;
    void fetchProfile(() => active);
    return () => {
      active = false;
    };
  }, [fetchProfile]);

  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto w-full max-w-content bg-light-background px-4 pb-12 pt-2 text-light-text dark:bg-dark-background dark:text-dark-text sm:px-6 lg:px-8 lg:pb-20 lg:pt-4"
    >
      {/* Label section neobrutalism. */}
      <p className="mb-6 inline-block border-2 border-light-text bg-accent px-3 py-1 font-display text-sm font-black uppercase tracking-widest text-black shadow-brutal dark:border-dark-text dark:bg-accent dark:text-black">
        Tentang
      </p>
      <h2 id="about-heading" className="sr-only">
        {heading ?? 'Tentang'}
      </h2>

      {state.status === 'loading' && (
        <LoadingView message="Memuat profil…" label="Memuat Bagian Tentang" />
      )}

      {state.status === 'error' && (
        <ErrorView
          message="Gagal memuat profil. Silakan coba lagi."
          onRetry={load}
          label="Gagal memuat Bagian Tentang"
        />
      )}

      {state.status === 'loaded' && state.profile === null && (
        <p className="font-sans text-sm font-bold uppercase tracking-wide text-light-text-muted dark:text-dark-text-muted">
          Profil belum tersedia.
        </p>
      )}

      {state.status === 'loaded' && state.profile !== null && (
        <article className="border-4 border-light-text bg-light-surface p-6 shadow-brutal dark:border-dark-text dark:bg-dark-surface sm:p-8">
          <h3 className="font-display text-3xl font-black uppercase leading-tight tracking-tight text-light-text dark:text-dark-text sm:text-4xl">
            {state.profile.name}
          </h3>
          <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-light-text-muted dark:text-dark-text-muted">
            {state.profile.description}
          </p>
        </article>
      )}
    </section>
  );
}
