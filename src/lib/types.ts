// Tipe domain dan kontrak hasil untuk Portfolio_Website.
// Catatan: properti memakai konvensi camelCase; pemetaan dari bentuk baris
// snake_case (seed.json) dilakukan di lapisan repository (src/lib/data).

/** Kategori keahlian yang valid (Req 2.4, 13.2). */
export type SkillCategory = 'language' | 'framework' | 'tool' | 'soft';

/** Kategori proyek yang valid untuk filter Bagian_Proyek. */
export type ProjectCategory = 'web' | 'mobile' | 'desktop' | 'game' | 'other';

/** Rekaman profil tunggal Bagian_Tentang (Req 1). */
export interface Profile {
  id: string;
  name: string;
  photoUrl: string | null;
  description: string;
  /**
   * Penanda visibilitas publik (default true bila tidak diisi). Dipakai oleh
   * Halaman_Admin untuk menampilkan/menyembunyikan konten dari situs publik.
   */
  isPublic?: boolean;
}

/** Entri keahlian teknis (Req 2). */
export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number | null;
  sortOrder: number;
  /** Penanda visibilitas publik (default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Entri proyek coding (Req 3). */
export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string | null;
  previewImageUrl: string | null;
  sortOrder: number;
  /**
   * Kategori proyek untuk filter Bagian_Proyek. Dipetakan dari kolom
   * `category` Basis_Data (default 'other'). Opsional pada tipe agar pemanggil
   * yang belum menyetel kategori tetap kompatibel; lapisan akses data selalu
   * mengisi nilai (default 'other') saat memetakan baris.
   */
  category?: ProjectCategory;
  /** Penanda visibilitas publik (default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Entri riwayat pengalaman/pendidikan (Req 15). */
/** Jenis entri riwayat: pengalaman kerja/organisasi atau pendidikan. */
export type HistoryKind = 'experience' | 'education';

export interface HistoryEntry {
  id: string;
  roleTitle: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  /** Jenis entri (default 'experience' bila tidak diisi). */
  kind?: HistoryKind;
  /** Penanda visibilitas publik (default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Entri sertifikat/kredensial Pemilik untuk Bagian_Sertifikat. */
export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  url: string | null;
  sortOrder: number;
  /** Penanda visibilitas publik (default true bila tidak diisi). */
  isPublic?: boolean;
}

/**
 * Hasil pembacaan data yang terbungkus agar island dapat menampilkan
 * State_Pemuatan/State_Kesalahan tanpa exception. Kegagalan dikonversi
 * menjadi `{ status: 'error' }` (lihat dataAccess.ts).
 */
export type FetchResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

/**
 * Hasil operasi tulis admin (CRUD). Kegagalan dikembalikan sebagai
 * `{ ok: false, message }` agar UI mempertahankan data sebelumnya
 * (Req 12.8, 13.7, 14.7, 16.8).
 */
export type WriteResult = { ok: true } | { ok: false; message: string };

/**
 * Kumpulan pesan kesalahan validasi per kolom. Objek kosong berarti
 * masukan valid (dipakai oleh validation.ts).
 */
export type FieldErrors = Record<string, string>;

// ---------------------------------------------------------------------------
// Tipe masukan form (input) — dipertahankan untuk dipakai kembali oleh
// editor/backend MongoDB di masa depan.
// Berbeda dari tipe domain: tanpa `id`/`sortOrder` dan merepresentasikan nilai
// mentah yang diisi Pemilik pada form sebelum divalidasi. `category` pada
// SkillInput sengaja bertipe `string` agar nilai di luar himpunan kategori sah
// dapat ditolak oleh validateSkill (Req 13.2).
// ---------------------------------------------------------------------------

/** Masukan form proyek sebelum validasi (Req 12.2). */
export interface ProjectInput {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string | null;
  previewImageUrl: string | null;
  /** Kategori proyek (opsional pada form; default 'other' di Basis_Data). */
  category?: ProjectCategory;
  /** Visibilitas publik (opsional; default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Masukan form keahlian sebelum validasi (Req 13.2). */
export interface SkillInput {
  name: string;
  category: string;
  level: number | null;
  /** Visibilitas publik (opsional; default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Masukan form profil sebelum validasi (Req 14.2). */
export interface ProfileInput {
  name: string;
  photoUrl: string | null;
  description: string;
  /** Visibilitas publik (opsional; default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Masukan form entri riwayat sebelum validasi (Req 16.2). */
export interface HistoryInput {
  roleTitle: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  kind?: HistoryKind;
  /** Visibilitas publik (opsional; default true bila tidak diisi). */
  isPublic?: boolean;
}

/** Masukan form sertifikat sebelum validasi. */
export interface CertificationInput {
  title: string;
  issuer: string;
  year: string;
  url: string | null;
  /** Visibilitas publik (opsional; default true bila tidak diisi). */
  isPublic?: boolean;
}
