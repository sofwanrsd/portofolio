// Island Bagian_Keahlian — "TOOLS / KEAHLIAN" (Req 2.1-2.8), gaya neobrutalism.
//
// Mengambil daftar keahlian dari Basis_Data secara runtime dari peramban
// Pengunjung (Req 2.1), lalu menerapkan lapisan transformasi murni:
//   - limitSkills : batasi tampilan ke 50 entri pertama (Req 2.8)
//   - groupSkills : kelompokkan ke kategori language/framework/tool (Req 2.4)
//
// Setiap entri menampilkan nama keahlian sebagai teks (Req 2.3) dan, bila
// memiliki tingkat penguasaan, indikator level pada skala diskret 1-5
// (Req 2.5). Komponen mengikuti mesin state seragam:
//   Loading -> Loaded | Empty | Error  (Error -> Loading via "Coba lagi")
// memakai komponen bersama StateViews.
//
// Tata letak neobrutalism: judul font-display kapital, lalu tiap kategori
// merender keahlian sebagai BADGE/CHIP berborder tebal (border-2 border-light-text
// dark:border-dark-text), latar surface, hard offset shadow (shadow-brutal-sm),
// dan hover taktil (mengangkat chip). Konsisten pada Mode_Tema terang & gelap (Req 17).

import { useCallback, useEffect, useState } from 'react';
import { getSkills } from '../../lib/dataAccess';
import { groupSkills, limitSkills } from '../../lib/transforms';
import type { GroupedSkills } from '../../lib/transforms';
import type { Skill, SkillCategory } from '../../lib/types';
import { EmptyView, ErrorView, LoadingView } from './StateViews';

/** Batas maksimum entri keahlian yang ditampilkan (Req 2.8). */
const MAX_SKILLS = 50;

/** Nilai maksimum skala tingkat penguasaan (Req 2.5). */
const MAX_LEVEL = 5;

/** State pemuatan island mengikuti mesin state pada design.md. */
type ViewState =
  | { status: 'loading' }
  | { status: 'loaded'; skills: Skill[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

/** Urutan tetap kategori beserta judul tampilannya (Bahasa Indonesia). */
const CATEGORY_ORDER: { key: SkillCategory; label: string }[] = [
  { key: 'language', label: 'Bahasa Pemrograman' },
  { key: 'framework', label: 'Framework' },
  { key: 'tool', label: 'Tools' },
  { key: 'soft', label: 'Soft Skill' },
];

/** Label proficiency per tingkat 1-5 (Req 2.5). */
const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Pro',
};

/**
 * Badge tingkat penguasaan berupa LABEL TEKS (Beginner/Intermediate/Advanced/
 * Expert/Pro) alih-alih bar bersegmen (Req 2.5). Memakai aksen oranye dan
 * tetap menyertakan teks yang dapat dibaca/diuji.
 */
function LevelIndicator({ level }: { level: number }) {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, level));
  const label = LEVEL_LABELS[clamped];
  return (
    <span className="mt-3 inline-flex w-fit items-center border-2 border-light-text bg-accent px-2.5 py-1 font-display text-[0.7rem] uppercase tracking-wider text-black dark:border-dark-text dark:bg-accent dark:text-black">
      {label}
    </span>
  );
}

/**
 * Tile satu entri keahlian: nama besar (Req 2.3) + label proficiency opsional.
 * Tile neobrutalism — border tebal, latar surface, hard shadow, hover taktil.
 */
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <li className="flex flex-col justify-between border-2 border-light-text bg-light-surface p-4 text-light-text shadow-brutal-sm transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-dark-text dark:bg-dark-surface dark:text-dark-text">
      <span className="font-display text-base uppercase leading-tight tracking-tight">
        {skill.name}
      </span>
      {skill.level !== null ? <LevelIndicator level={skill.level} /> : null}
    </li>
  );
}

/** Bagian satu kategori; hanya dirender bila memuat minimal satu keahlian. */
function CategorySection({ label, skills }: { label: string; skills: Skill[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="inline-flex w-fit items-center border-2 border-light-text bg-accent px-3 py-1 font-display text-sm uppercase tracking-widest text-black shadow-brutal-sm dark:border-dark-text dark:bg-accent dark:text-black">
        {label}
      </h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </ul>
    </div>
  );
}

/** Daftar keahlian yang sudah dikelompokkan, dirender per kategori (bertumpuk). */
function SkillsList({ grouped }: { grouped: GroupedSkills }) {
  return (
    <div className="flex flex-col gap-10">
      {CATEGORY_ORDER.map(({ key, label }) =>
        grouped[key].length > 0 ? (
          <CategorySection key={key} label={label} skills={grouped[key]} />
        ) : null,
      )}
    </div>
  );
}

/**
 * Island Bagian_Keahlian. Menjalankan pengambilan data saat mount dan
 * menyediakan kontrol "Coba lagi" yang melakukan fetch ulang (Req 2.7).
 */
export default function SkillsIsland() {
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const result = await getSkills();

    if (result.status === 'error') {
      setState({ status: 'error', message: result.message });
      return;
    }

    const limited = limitSkills(result.data, MAX_SKILLS);
    if (limited.length === 0) {
      setState({ status: 'empty' });
      return;
    }

    setState({ status: 'loaded', skills: limited });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section
      aria-labelledby="keahlian-heading"
      className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <h2
        id="keahlian-heading"
        className="mb-8 inline-block border-4 border-light-text bg-accent px-4 py-2 font-display text-h2 uppercase text-black shadow-brutal dark:border-dark-text dark:bg-accent dark:text-black"
      >
        Keahlian
      </h2>

      {state.status === 'loading' ? (
        <LoadingView label="Memuat keahlian" message="Memuat keahlian…" />
      ) : null}

      {state.status === 'error' ? (
        <ErrorView message={state.message} onRetry={() => void load()} />
      ) : null}

      {state.status === 'empty' ? (
        <EmptyView message="Belum ada keahlian yang tersedia." />
      ) : null}

      {state.status === 'loaded' ? (
        <SkillsList grouped={groupSkills(state.skills)} />
      ) : null}
    </section>
  );
}
