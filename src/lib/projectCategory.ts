// Utilitas kategori proyek murni (bebas efek samping).
//
// Bagian_Proyek pada desain neobrutalism menampilkan tab filter (ALL +
// kategori). Karena tipe/DB Project tidak memiliki kolom kategori wajib,
// kategori diturunkan di sisi klien dari `techStack`. Bila sebuah proyek
// sudah membawa `category` eksplisit (opsional), nilai itu diutamakan.
//
// Pemetaan memakai kata kunci teknologi yang umum:
//   - MOBILE  : React Native, Flutter, Android, iOS, Kotlin, Swift, Expo
//   - DESKTOP : Electron, Tauri, .NET, WPF, Qt, GTK
//   - GAME    : Unity, Godot, Unreal, Phaser, GameMaker
//   - WEBSITE : default (Astro, React, Vue, Next, Node, dsb.)

import type { Project } from './types';

/** Kategori standar yang ditampilkan sebagai tab filter. */
export type ProjectCategory = 'WEBSITE' | 'MOBILE' | 'DESKTOP' | 'GAME';

/** Kategori default bila tidak ada kata kunci yang cocok. */
export const DEFAULT_CATEGORY: ProjectCategory = 'WEBSITE';

/** Label tab khusus untuk menampilkan seluruh proyek. */
export const ALL_TAB = 'ALL';

const KEYWORDS: Record<Exclude<ProjectCategory, 'WEBSITE'>, string[]> = {
  MOBILE: [
    'react native',
    'flutter',
    'android',
    'ios',
    'kotlin',
    'swift',
    'expo',
    'dart',
  ],
  DESKTOP: ['electron', 'tauri', '.net', 'wpf', 'qt', 'gtk', 'winforms'],
  GAME: ['unity', 'godot', 'unreal', 'phaser', 'gamemaker', 'pygame'],
};

/**
 * Menentukan kategori sebuah proyek. Mengutamakan `project.category` eksplisit
 * (dinormalkan ke huruf kapital); selain itu menurunkan dari `techStack`.
 * Selalu mengembalikan kategori yang valid (default WEBSITE).
 */
export function deriveCategory(
  project: Pick<Project, 'techStack' | 'category'>,
): ProjectCategory {
  if (project.category && project.category.trim() !== '') {
    const upper = project.category.trim().toUpperCase();
    if (upper === 'WEBSITE' || upper === 'MOBILE' || upper === 'DESKTOP' || upper === 'GAME') {
      return upper;
    }
  }

  const haystack = (project.techStack ?? [])
    .join(' ')
    .toLowerCase();

  for (const category of ['MOBILE', 'DESKTOP', 'GAME'] as const) {
    if (KEYWORDS[category].some((kw) => haystack.includes(kw))) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}

/**
 * Membangun daftar tab filter terurut: selalu diawali "ALL", diikuti kategori
 * unik yang benar-benar muncul pada daftar proyek (sesuai urutan kemunculan
 * pertama). Tidak memuat kategori yang tidak terpakai.
 */
export function buildCategoryTabs(
  projects: ReadonlyArray<Pick<Project, 'techStack' | 'category'>>,
): string[] {
  const seen: string[] = [];
  for (const project of projects) {
    const category = deriveCategory(project);
    if (!seen.includes(category)) {
      seen.push(category);
    }
  }
  return [ALL_TAB, ...seen];
}

/**
 * Menyaring proyek menurut tab aktif. Tab "ALL" mengembalikan seluruh proyek
 * (urutan dipertahankan); selain itu hanya proyek dengan kategori yang cocok.
 */
export function filterByCategory<T extends Pick<Project, 'techStack' | 'category'>>(
  projects: T[],
  activeTab: string,
): T[] {
  if (activeTab === ALL_TAB) return projects;
  return projects.filter((project) => deriveCategory(project) === activeTab);
}
