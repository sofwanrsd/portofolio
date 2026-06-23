// Abstraksi lapisan data konten (sisi BACA) untuk Portfolio_Website.
//
// Tujuan: memisahkan island publik dari sumber data konkret. Island memanggil
// fasad `dataAccess.ts`, yang mendelegasikan ke sebuah implementasi
// `ContentRepository`. Saat ini sumber tunggal kebenaran konten adalah berkas
// JSON lokal (`src/data/seed.json`) melalui `jsonRepository`.
//
// PENTING (seam Mongo): untuk pindah ke MongoDB nanti, cukup buat
// `mongoRepository.ts` yang mengimplementasikan interface `ContentRepository`
// ini, lalu ganti SATU baris di `src/lib/data/index.ts`. Island maupun fasad
// `dataAccess.ts` TIDAK perlu diubah karena keduanya hanya bergantung pada
// kontrak ini.
//
// Catatan: Proyek (Bagian_Proyek) BUKAN bagian dari repository ini — proyek
// bersumber otomatis dari GitHub via `src/lib/github.ts` (getGithubProjects).
//
// Kontrak hasil: setiap metode mengembalikan `FetchResult<T>` dan TIDAK PERNAH
// melempar exception. Kegagalan dikonversi menjadi `{ status: 'error', message }`
// agar island publik dapat menampilkan State_Kesalahan tanpa menghentikan
// bagian lain (Req 1.1, 2.1, 3.1, 15.1).

import type {
  Certification,
  FetchResult,
  HistoryEntry,
  Profile,
  Skill,
} from '../types';

/**
 * Kontrak akses BACA konten. Implementasi konkret (JSON sekarang, MongoDB
 * nanti) hanya perlu memenuhi interface ini.
 */
export interface ContentRepository {
  /**
   * Mengambil rekaman profil tunggal Bagian_Tentang (Req 1.1).
   * Mengembalikan `data: null` bila profil tidak ada / tidak publik.
   */
  getProfile(): Promise<FetchResult<Profile | null>>;

  /**
   * Mengambil daftar keahlian publik, terurut berdasarkan `sortOrder`
   * menaik (Req 2.1).
   */
  getSkills(): Promise<FetchResult<Skill[]>>;

  /**
   * Mengambil daftar entri riwayat publik (Req 15.1). Pengurutan kronologis
   * final tetap dijamin oleh `sortHistoryDesc` (transforms.ts) pada island.
   */
  getHistory(): Promise<FetchResult<HistoryEntry[]>>;

  /**
   * Mengambil daftar sertifikat publik, terurut berdasarkan `sortOrder`
   * menaik.
   */
  getCertifications(): Promise<FetchResult<Certification[]>>;
}
