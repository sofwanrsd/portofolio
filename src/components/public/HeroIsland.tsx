// HeroIsland — Bagian Hero (gaya neobrutalism).
//
// Mengambil rekaman profil tunggal dari Basis_Data secara runtime dari peramban
// Pengunjung via getProfile() (Req 1.1), lalu merender Hero dua kolom:
//   KIRI  : salam kecil "HI, I'M <nama>", judul peran raksasa (siteConfig.role),
//           paragraf deskripsi/tagline, tombol VIEW MORE (isi aksen) + DOWNLOAD
//           CV (outline), serta deretan tautan sosial.
//   KANAN : foto profil di dalam bingkai berborder tebal + shadow-brutal, dengan
//           fallback placeholder saat URL gagal dimuat (Req 1.7).
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
import { siteConfig } from '../../config/site';
import type { Profile } from '../../lib/types';
import { ErrorView, LoadingView } from './StateViews';

/**
 * Gambar pengganti inline (data URI SVG) untuk foto profil yang gagal dimuat
 * dari URL eksternal (Req 1.7).
 */
const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="Foto profil tidak tersedia">` +
      `<rect width="320" height="320" fill="#cbd5e1"/>` +
      `<circle cx="160" cy="124" r="60" fill="#94a3b8"/>` +
      `<path d="M56 280c0-56 48-88 104-88s104 32 104 88z" fill="#94a3b8"/>` +
      `</svg>`,
  );

/** State internal mesin pemuatan Hero. */
type HeroState =
  | { status: 'loading' }
  | { status: 'loaded'; profile: Profile | null }
  | { status: 'error'; message: string };

export interface HeroIslandProps {
  /** Judul bagian opsional (untuk tautan navigasi/anchor). */
  heading?: string;
}

/** Ikon sosial sederhana berbasis label (GitHub/LinkedIn/lainnya). */
function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes('github')) {
    return (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.3-.5-1.5.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
      </svg>
    );
  }
  if (key.includes('linkedin')) {
    return (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9V9Z" />
      </svg>
    );
  }
  if (key.includes('whatsapp') || key.includes('wa.me')) {
    return (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.515 5.26l-.999 3.648 3.984-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    );
  }
  if (key.includes('email') || key.includes('mail')) {
    return (
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5L4 6h16zm0 12H4V8l8 5 8-5v10z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
    </svg>
  );
}

export default function HeroIsland({ heading }: HeroIslandProps) {
  const [state, setState] = useState<HeroState>({ status: 'loading' });
  // Menandai foto gagal dimuat agar beralih ke placeholder (Req 1.7).
  const [photoFailed, setPhotoFailed] = useState(false);

  const fetchProfile = useCallback(async (isActive: () => boolean = () => true) => {
    setState({ status: 'loading' });
    setPhotoFailed(false);
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

  const socialLinks = siteConfig.socialLinks ?? [];

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-content bg-light-background px-4 py-12 text-light-text dark:bg-dark-background dark:text-dark-text sm:px-6 lg:px-8 lg:py-20"
    >
      {/* Heading aksesibilitas tersembunyi agar section punya nama stabil. */}
      <h2 id="hero-heading" className="sr-only">
        {heading ?? 'Hero'}
      </h2>

      {state.status === 'loading' && (
        <LoadingView message="Memuat profil…" label="Memuat Bagian Hero" />
      )}

      {state.status === 'error' && (
        <ErrorView
          message="Gagal memuat profil. Silakan coba lagi."
          onRetry={load}
          label="Gagal memuat Bagian Hero"
        />
      )}

      {state.status === 'loaded' && (
        <Hero
          profile={state.profile}
          photoFailed={photoFailed}
          onPhotoError={() => setPhotoFailed(true)}
          socialLinks={socialLinks}
        />
      )}
    </section>
  );
}

interface HeroProps {
  profile: Profile | null;
  photoFailed: boolean;
  onPhotoError: () => void;
  socialLinks: { label: string; href: string }[];
}

/**
 * Tata letak Hero neobrutalism. Satu kolom pada mobile, dua kolom (>=768px).
 * Nama memakai profile.name dengan fallback siteConfig.ownerName; deskripsi
 * memakai siteConfig.tagline (intro pendek, terpisah dari narasi panjang di
 * AboutIsland). Foto memakai placeholder bila URL kosong/gagal dimuat (Req 1.7).
 */
function Hero({ profile, photoFailed, onPhotoError, socialLinks }: HeroProps) {
  const displayName = profile?.name ?? siteConfig.ownerName;
  // Hero memakai tagline pendek (intro punchy) — sengaja BUKAN
  // profile.description agar tidak menduplikasi narasi panjang di AboutIsland.
  const description = siteConfig.tagline;
  const photoSrc =
    !photoFailed && profile?.photoUrl ? profile.photoUrl : PLACEHOLDER_PHOTO;

  const scrollToProjects = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('projects');
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
      {/* Kolom kiri: teks. */}
      <div className="flex flex-col">
        <p className="mb-5 inline-block w-fit border-2 border-light-text bg-accent px-3 py-1 font-sans text-sm font-bold uppercase tracking-widest text-black shadow-brutal dark:border-dark-text dark:bg-accent dark:text-black">
          Halo, saya {displayName}
        </p>

        <h1 className="font-display text-5xl font-black uppercase leading-[0.95] tracking-tight text-light-text dark:text-dark-text sm:text-7xl">
          {siteConfig.role}
        </h1>

        <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-light-text-muted dark:text-dark-text-muted">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#projects"
            onClick={scrollToProjects}
            className="inline-flex items-center justify-center border-4 border-light-text bg-accent px-6 py-3 font-display text-sm font-black uppercase tracking-wider text-black shadow-brutal transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-light-primary dark:border-dark-text dark:bg-accent dark:text-black"
          >
            Lihat Proyek
          </a>
          <a
            href={siteConfig.cvUrl}
            download
            className="inline-flex items-center justify-center border-4 border-light-text bg-light-surface px-6 py-3 font-display text-sm font-black uppercase tracking-wider text-light-text shadow-brutal transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-light-primary dark:border-dark-text dark:bg-dark-surface dark:text-dark-text"
          >
            Unduh CV
          </a>
        </div>

        {/* Deretan tautan sosial. */}
        {socialLinks.length > 0 && (
          <ul aria-label="Tautan media profesional" className="mt-8 flex gap-3">
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="inline-flex h-11 w-11 items-center justify-center border-2 border-light-text bg-light-surface text-light-text shadow-brutal transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-accent hover:text-black hover:shadow-none focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-light-primary dark:border-dark-text dark:bg-dark-surface dark:text-dark-text dark:hover:bg-accent dark:hover:text-black"
                >
                  <SocialIcon label={social.label} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Kolom kanan: foto profil dalam bingkai berborder + shadow-brutal. */}
      <div className="flex justify-center md:justify-end">
        <div className="border-4 border-light-text bg-light-surface p-2 shadow-brutal dark:border-dark-text dark:bg-dark-surface">
          <img
            src={photoSrc}
            onError={onPhotoError}
            alt={`Foto profil ${displayName}`}
            width={320}
            height={320}
            loading="lazy"
            className="h-64 w-64 object-cover sm:h-80 sm:w-80"
          />
        </div>
      </div>
    </div>
  );
}
