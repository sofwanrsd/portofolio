// Implementasi `ContentRepository` berbasis JSON lokal (`src/data/seed.json`).
//
// `seed.json` adalah SUMBER TUNGGAL KEBENARAN konten. Berkas tetap memakai
// bentuk baris snake_case (seolah-olah baris Basis_Data) sehingga mudah
// dipindahkan ke MongoDB kelak; repository ini yang melakukan pemetaan
// snake_case -> camelCase ke tipe domain.
//
// Aturan baca publik:
//   - Hanya mengembalikan item dengan `is_public !== false` (default tampil).
//   - Keahlian & sertifikat diurutkan berdasarkan `sort_order` menaik.
//   - Riwayat dikembalikan apa adanya; pengurutan kronologis dilakukan di
//     island via `sortHistoryDesc` (transforms.ts).
//
// Kontrak hasil: metode tidak pernah melempar; kegagalan tak terduga
// dikonversi menjadi `{ status: 'error', message }`.

import seed from '../../data/seed.json';
import type {
  Certification,
  FetchResult,
  HistoryEntry,
  Profile,
  Skill,
  SkillCategory,
} from '../types';
import type { ContentRepository } from './repository';

/** Pesan fallback generik bila terjadi galat tak terduga saat membaca seed. */
const GENERIC_ERROR = 'Gagal memuat data konten.';

// ---------------------------------------------------------------------------
// Bentuk baris mentah (snake_case) sebagaimana tersimpan di seed.json.
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  name: string;
  photo_url: string | null;
  description: string;
  is_public?: boolean | null;
}

interface SkillRow {
  id: string;
  name: string;
  category: SkillCategory;
  level: number | null;
  sort_order: number;
  is_public?: boolean | null;
}

interface HistoryRow {
  id: string;
  role_title: string;
  institution: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  kind?: string | null;
  is_public?: boolean | null;
}

interface CertificationRow {
  id: string;
  title: string;
  issuer: string;
  year: string;
  url: string | null;
  sort_order: number;
  is_public?: boolean | null;
}

// ---------------------------------------------------------------------------
// Helper visibilitas & pemetaan snake_case -> camelCase.
// ---------------------------------------------------------------------------

/** Normalisasi nilai is_public mentah ke boolean (default true). */
function toPublic(value: boolean | null | undefined): boolean {
  return value !== false;
}

/** True bila baris boleh tampil ke publik (is_public bukan false). */
function isRowPublic(row: { is_public?: boolean | null }): boolean {
  return row.is_public !== false;
}

/** Urutkan menaik berdasarkan sort_order tanpa memutasi array masukan. */
function bySortOrder<T extends { sort_order: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photo_url,
    description: row.description,
    isPublic: toPublic(row.is_public),
  };
}

function mapSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
    sortOrder: row.sort_order,
    isPublic: toPublic(row.is_public),
  };
}

function mapHistory(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    roleTitle: row.role_title,
    institution: row.institution,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    kind: row.kind === 'education' ? 'education' : 'experience',
    isPublic: toPublic(row.is_public),
  };
}

function mapCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    year: row.year,
    url: row.url,
    sortOrder: row.sort_order,
    isPublic: toPublic(row.is_public),
  };
}

/** Menormalkan galat tak terduga menjadi pesan string yang aman ditampilkan. */
function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return GENERIC_ERROR;
}

// Casting sekali di satu tempat: seed.json memakai bentuk baris snake_case.
const data = seed as unknown as {
  profile?: ProfileRow;
  skills?: SkillRow[];
  history?: HistoryRow[];
  certifications?: CertificationRow[];
};

/**
 * Repository konten berbasis seed.json. Sumber tunggal kebenaran konten saat
 * ini. Lihat `repository.ts` untuk seam menuju MongoDB.
 */
export const jsonRepository: ContentRepository = {
  async getProfile(): Promise<FetchResult<Profile | null>> {
    try {
      const row = data.profile;
      if (!row || !isRowPublic(row)) {
        return { status: 'ok', data: null };
      }
      return { status: 'ok', data: mapProfile(row) };
    } catch (error) {
      return { status: 'error', message: toErrorMessage(error) };
    }
  },

  async getSkills(): Promise<FetchResult<Skill[]>> {
    try {
      const rows = bySortOrder((data.skills ?? []).filter(isRowPublic));
      return { status: 'ok', data: rows.map(mapSkill) };
    } catch (error) {
      return { status: 'error', message: toErrorMessage(error) };
    }
  },

  async getHistory(): Promise<FetchResult<HistoryEntry[]>> {
    try {
      const rows = (data.history ?? []).filter(isRowPublic);
      return { status: 'ok', data: rows.map(mapHistory) };
    } catch (error) {
      return { status: 'error', message: toErrorMessage(error) };
    }
  },

  async getCertifications(): Promise<FetchResult<Certification[]>> {
    try {
      const rows = bySortOrder((data.certifications ?? []).filter(isRowPublic));
      return { status: 'ok', data: rows.map(mapCertification) };
    } catch (error) {
      return { status: 'error', message: toErrorMessage(error) };
    }
  },
};
