// Lapisan transformasi murni untuk Portfolio_Website.
// Fungsi-fungsi di sini bebas efek samping (pure) dan tidak memutasi
// argumennya. Logika ini menjadi inti yang diuji dengan property-based
// testing (lihat Correctness Properties 1-4 pada design.md).

import type { HistoryEntry, Skill, SkillCategory } from './types';

/** Hasil pengelompokan keahlian ke empat kategori tetap. */
export interface GroupedSkills {
  language: Skill[];
  framework: Skill[];
  tool: Skill[];
  soft: Skill[];
}

/**
 * Mengelompokkan keahlian ke dalam empat kategori tetap (language,
 * framework, tool, soft) tanpa kehilangan, menduplikasi, atau memindahkan
 * entri ke kategori yang salah. Urutan relatif entri dalam setiap grup
 * dipertahankan sesuai urutan masukan.
 *
 * Property 1 (Req 2.4): gabungan keempat grup adalah permutasi dari
 * daftar masukan, dan setiap entri berada pada grup yang sama dengan
 * nilai `category`-nya.
 */
export function groupSkills(skills: Skill[]): GroupedSkills {
  const groups: GroupedSkills = { language: [], framework: [], tool: [], soft: [] };
  for (const skill of skills) {
    // `category` dijamin bertipe SkillCategory oleh sistem tipe.
    groups[skill.category].push(skill);
  }
  return groups;
}

/**
 * Membatasi tampilan keahlian ke maksimum `max` entri pertama (default 50).
 *
 * Property 2 (Req 2.8): mengembalikan tepat `min(panjang, max)` entri
 * yang merupakan prefiks berurutan dari daftar masukan. Tidak memutasi
 * masukan karena `slice` menghasilkan array baru.
 */
export function limitSkills(skills: Skill[], max = 50): Skill[] {
  return skills.slice(0, Math.max(0, max));
}

/**
 * Mengurutkan riwayat berdasarkan `startDate` menurun (terbaru -> terlama).
 *
 * Property 3 (Req 15.5): hasil adalah permutasi dari masukan yang monoton
 * tidak-naik berdasarkan `startDate`. Membuat salinan terlebih dahulu agar
 * tidak memutasi argumen; `Array.prototype.sort` bersifat stabil sehingga
 * entri dengan `startDate` sama mempertahankan urutan relatif masukan.
 */
export function sortHistoryDesc(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort((a, b) => {
    if (a.startDate < b.startDate) return 1;
    if (a.startDate > b.startDate) return -1;
    return 0;
  });
}

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Memformat sebuah tanggal ISO ("YYYY-MM-DD", "YYYY-MM", atau "YYYY")
 * menjadi representasi yang mudah dibaca dalam bahasa Indonesia.
 * Bila bulan tidak dapat dipetakan, mengembalikan string aslinya apa adanya.
 */
function formatDate(iso: string): string {
  const [yearPart, monthPart] = iso.split('-');
  if (monthPart) {
    const monthIndex = Number(monthPart) - 1;
    const monthName = MONTHS_ID[monthIndex];
    if (monthName && yearPart) {
      return `${monthName} ${yearPart}`;
    }
  }
  return iso;
}

/**
 * Memformat periode riwayat. Bila `end` bernilai null, periode ditandai
 * sebagai sedang berjalan dengan penanda "sekarang".
 *
 * Property 4 (Req 15.4): keluaran mengandung penanda "sekarang" jika dan
 * hanya jika `end` bernilai null; bila `end` ada, keluaran memuat
 * representasi tanggal selesai tersebut.
 */
export function formatPeriod(start: string, end: string | null): string {
  const startLabel = formatDate(start);
  const endLabel = end === null ? 'sekarang' : formatDate(end);
  return `${startLabel} \u2013 ${endLabel}`;
}

// Re-export tipe kategori untuk kemudahan konsumsi modul lain.
export type { SkillCategory };
