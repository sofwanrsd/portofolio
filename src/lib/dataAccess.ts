// Fasad lapisan akses data BACA untuk Portfolio_Website.
//
// Modul ini sengaja TIPIS: ia hanya mendelegasikan ke `repository` (lihat
// `src/lib/data/index.ts`) yang memilih implementasi `ContentRepository`
// aktif. Saat ini sumber tunggal kebenaran konten adalah `src/data/seed.json`
// melalui `jsonRepository`. Untuk pindah ke MongoDB nanti, cukup ganti satu
// baris di `src/lib/data/index.ts` — fasad ini dan island publik tidak berubah.
//
// Nama fungsi yang diekspor di sini dipertahankan (getProfile/getSkills/
// getHistory/getCertifications) agar island publik tidak perlu diubah.
//
// Catatan: Bagian_Proyek TIDAK ada di sini — proyek bersumber otomatis dari
// GitHub via `src/lib/github.ts` (getGithubProjects).
//
// Kontrak penting: fungsi-fungsi ini TIDAK PERNAH melempar exception. Setiap
// kegagalan dikonversi menjadi `{ status: 'error', message }` oleh repository
// agar island publik dapat menampilkan State_Kesalahan tanpa menghentikan
// bagian lain (Req 1.1, 2.1, 3.1, 15.1).

import { repository } from './data';
import type {
  Certification,
  FetchResult,
  HistoryEntry,
  Profile,
  Skill,
} from './types';

/** Mengambil rekaman profil tunggal Bagian_Tentang (Req 1.1). */
export function getProfile(): Promise<FetchResult<Profile | null>> {
  return repository.getProfile();
}

/** Mengambil daftar keahlian publik, terurut `sortOrder` menaik (Req 2.1). */
export function getSkills(): Promise<FetchResult<Skill[]>> {
  return repository.getSkills();
}

/** Mengambil daftar entri riwayat publik (Req 15.1). */
export function getHistory(): Promise<FetchResult<HistoryEntry[]>> {
  return repository.getHistory();
}

/** Mengambil daftar sertifikat publik, terurut `sortOrder` menaik. */
export function getCertifications(): Promise<FetchResult<Certification[]>> {
  return repository.getCertifications();
}
