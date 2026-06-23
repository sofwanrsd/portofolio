// Unit test untuk SkillsIsland (Task 10.4).
//
// Memocking getSkills dari lapisan akses data agar tidak ada permintaan
// jaringan, lalu memverifikasi perilaku island Bagian_Keahlian ("TOOLS /
// KEAHLIAN") setelah restyle neobrutalism. Markup berubah (chip/badge
// berborder), namun struktur penting tetap dipertahankan: judul kategori
// berupa heading bersaudara dengan daftar <ul>/<li>, indikator level
// role="img", dan pesan empty-state. Assertion berikut tetap berlaku:
//   - Pengelompokan ke kategori language/framework/tool (Req 2.4)
//   - Pembatasan tampilan ke 50 entri pertama (Req 2.8)
//   - Indikator tingkat penguasaan 1-5 saat `level` ada (Req 2.5 via render)
//   - Empty state saat tidak ada keahlian (Req 2.6)
//
// **Validates: Requirements 2.4, 2.6, 2.8**

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { FetchResult, Skill, SkillCategory } from '../../lib/types';

// Mock lapisan akses data: hanya getSkills yang dipakai SkillsIsland.
const getSkillsMock =
  vi.fn<() => Promise<FetchResult<Skill[]>>>();

vi.mock('../../lib/dataAccess', () => ({
  getSkills: () => getSkillsMock(),
}));

// Diimpor setelah vi.mock agar memakai versi tiruan.
import SkillsIsland from './SkillsIsland';

/** Helper pembuat entri keahlian dengan nilai default yang masuk akal. */
function makeSkill(
  id: string,
  name: string,
  category: SkillCategory,
  level: number | null = null,
): Skill {
  return { id, name, category, level, sortOrder: 0 };
}

beforeEach(() => {
  getSkillsMock.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('SkillsIsland - pengelompokan kategori (Req 2.4)', () => {
  it('mengelompokkan keahlian ke bagian language/framework/tool', async () => {
    getSkillsMock.mockResolvedValue({
      status: 'ok',
      data: [
        makeSkill('s1', 'TypeScript', 'language'),
        makeSkill('s2', 'Python', 'language'),
        makeSkill('s3', 'React', 'framework'),
        makeSkill('s4', 'Docker', 'tool'),
      ],
    });

    render(<SkillsIsland />);

    // Judul kategori muncul sesuai label tampilan Bahasa Indonesia.
    const languageHeading = await screen.findByRole('heading', {
      name: 'Bahasa Pemrograman',
    });
    const frameworkHeading = screen.getByRole('heading', { name: 'Framework' });
    const toolHeading = screen.getByRole('heading', { name: 'Tools' });

    // Entri berada di bawah kategori yang benar.
    const languageSection = languageHeading.parentElement as HTMLElement;
    expect(within(languageSection).getByText('TypeScript')).toBeInTheDocument();
    expect(within(languageSection).getByText('Python')).toBeInTheDocument();

    const frameworkSection = frameworkHeading.parentElement as HTMLElement;
    expect(within(frameworkSection).getByText('React')).toBeInTheDocument();

    const toolSection = toolHeading.parentElement as HTMLElement;
    expect(within(toolSection).getByText('Docker')).toBeInTheDocument();
  });

  it('tidak merender kategori yang tidak memiliki entri', async () => {
    getSkillsMock.mockResolvedValue({
      status: 'ok',
      data: [makeSkill('s1', 'Go', 'language')],
    });

    render(<SkillsIsland />);

    await screen.findByRole('heading', { name: 'Bahasa Pemrograman' });
    expect(
      screen.queryByRole('heading', { name: 'Framework' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Tools' })).not.toBeInTheDocument();
  });
});

describe('SkillsIsland - batas 50 entri (Req 2.8)', () => {
  it('menampilkan tepat 50 entri saat data melebihi 50', async () => {
    // Sediakan 60 keahlian dalam satu kategori agar mudah dihitung.
    const many: Skill[] = Array.from({ length: 60 }, (_, i) =>
      makeSkill(`s${i}`, `Skill ${i}`, 'language'),
    );
    getSkillsMock.mockResolvedValue({ status: 'ok', data: many });

    render(<SkillsIsland />);

    const languageHeading = await screen.findByRole('heading', {
      name: 'Bahasa Pemrograman',
    });
    const section = languageHeading.parentElement as HTMLElement;

    // Tepat 50 entri (prefiks pertama: Skill 0..Skill 49) yang dirender.
    const items = within(section).getAllByRole('listitem');
    expect(items).toHaveLength(50);
    expect(within(section).getByText('Skill 0')).toBeInTheDocument();
    expect(within(section).getByText('Skill 49')).toBeInTheDocument();
    expect(within(section).queryByText('Skill 50')).not.toBeInTheDocument();
  });
});

describe('SkillsIsland - indikator level (Req 2.5)', () => {
  it('merender label proficiency saat level tersedia', async () => {
    getSkillsMock.mockResolvedValue({
      status: 'ok',
      data: [makeSkill('s1', 'Rust', 'language', 4)],
    });

    render(<SkillsIsland />);

    await screen.findByText('Rust');
    // Level 4 dipetakan ke label "Expert".
    expect(screen.getByText('Expert')).toBeInTheDocument();
  });

  it('tidak merender label proficiency saat level null', async () => {
    getSkillsMock.mockResolvedValue({
      status: 'ok',
      data: [makeSkill('s1', 'Bash', 'tool', null)],
    });

    render(<SkillsIsland />);

    await screen.findByText('Bash');
    expect(
      screen.queryByText(/beginner|intermediate|advanced|expert|pro/i),
    ).not.toBeInTheDocument();
  });
});

describe('SkillsIsland - empty state (Req 2.6)', () => {
  it('menampilkan pesan kosong saat tidak ada keahlian', async () => {
    getSkillsMock.mockResolvedValue({ status: 'ok', data: [] });

    render(<SkillsIsland />);

    expect(
      await screen.findByText('Belum ada keahlian yang tersedia.'),
    ).toBeInTheDocument();
  });

  it('memuat ulang dan menampilkan empty state setelah fetch selesai', async () => {
    getSkillsMock.mockResolvedValue({ status: 'ok', data: [] });

    render(<SkillsIsland />);

    await waitFor(() => expect(getSkillsMock).toHaveBeenCalled());
    expect(
      await screen.findByText('Belum ada keahlian yang tersedia.'),
    ).toBeInTheDocument();
  });
});
