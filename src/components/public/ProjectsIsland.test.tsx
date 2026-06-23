// Unit test untuk ProjectsIsland (Task 10.6).
//
// Memocking getProjects dari lapisan akses data agar tidak ada permintaan
// jaringan, lalu memverifikasi perilaku island Bagian_Proyek:
//   - Tautan eksternal GitHub (selalu) dan demo (bila ada) dirender dengan
//     target="_blank" dan rel mengandung "noopener" (Req 3.7)
//   - Fallback gambar ke placeholder saat gambar gagal dimuat (onError),
//     tanpa menghilangkan proyek lain (Req 3.10)
//   - Empty state saat tidak ada proyek (Req 3.8)
//
// **Validates: Requirements 3.8, 3.10**

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import type { FetchResult, Project } from '../../lib/types';

// Mock sumber data GitHub: ProjectsIsland menarik proyek dari GitHub (auto-sync).
const getProjectsMock =
  vi.fn<() => Promise<FetchResult<Project[]>>>();

vi.mock('../../lib/github', () => ({
  getGithubProjects: () => getProjectsMock(),
}));

// Diimpor setelah vi.mock agar memakai versi tiruan.
import ProjectsIsland from './ProjectsIsland';

/** Helper pembuat entri proyek dengan nilai default yang masuk akal. */
function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    title: 'Proyek Contoh',
    description: 'Deskripsi proyek contoh.',
    techStack: ['TypeScript', 'React'],
    githubUrl: 'https://github.com/owner/repo',
    demoUrl: null,
    previewImageUrl: null,
    sortOrder: 0,
    category: 'web',
    ...overrides,
  };
}

beforeEach(() => {
  getProjectsMock.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('ProjectsIsland - tautan eksternal (Req 3.7)', () => {
  it('selalu merender tautan GitHub dengan target=_blank dan rel noopener', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [makeProject({ demoUrl: null })],
    });

    render(<ProjectsIsland />);

    const githubLink = await screen.findByRole('link', { name: 'GitHub' });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/owner/repo');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink.getAttribute('rel')).toContain('noopener');
  });

  it('tidak merender tautan demo saat demoUrl tidak ada', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [makeProject({ demoUrl: null })],
    });

    render(<ProjectsIsland />);

    await screen.findByRole('link', { name: 'GitHub' });
    expect(screen.queryByRole('link', { name: 'Demo' })).not.toBeInTheDocument();
  });

  it('merender tautan demo dengan target=_blank dan rel noopener saat tersedia', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [makeProject({ demoUrl: 'https://demo.example.com' })],
    });

    render(<ProjectsIsland />);

    const demoLink = await screen.findByRole('link', { name: 'Demo' });
    expect(demoLink).toHaveAttribute('href', 'https://demo.example.com');
    expect(demoLink).toHaveAttribute('target', '_blank');
    expect(demoLink.getAttribute('rel')).toContain('noopener');
  });
});

describe('ProjectsIsland - fallback gambar (Req 3.10)', () => {
  it('beralih ke placeholder saat gambar pratinjau gagal dimuat', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [
        makeProject({
          id: 'p1',
          title: 'Dengan Gambar',
          previewImageUrl: 'https://images.example.com/preview.png',
        }),
      ],
    });

    render(<ProjectsIsland />);

    const image = await screen.findByRole('img', {
      name: 'Pratinjau proyek Dengan Gambar',
    });
    // Mula-mula memakai URL eksternal.
    expect(image).toHaveAttribute(
      'src',
      'https://images.example.com/preview.png',
    );

    // Simulasikan kegagalan memuat gambar.
    fireEvent.error(image);

    // Beralih ke placeholder data URI (SVG).
    expect(image.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });

  it('kegagalan gambar pada satu kartu tidak menghilangkan proyek lain', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [
        makeProject({
          id: 'p1',
          title: 'Proyek Gagal Gambar',
          previewImageUrl: 'https://images.example.com/broken.png',
        }),
        makeProject({
          id: 'p2',
          title: 'Proyek Aman',
          githubUrl: 'https://github.com/owner/repo2',
          previewImageUrl: 'https://images.example.com/ok.png',
        }),
      ],
    });

    render(<ProjectsIsland />);

    const brokenImage = await screen.findByRole('img', {
      name: 'Pratinjau proyek Proyek Gagal Gambar',
    });

    fireEvent.error(brokenImage);

    // Proyek kedua tetap dirender utuh.
    expect(screen.getByText('Proyek Aman')).toBeInTheDocument();
    const safeImage = screen.getByRole('img', {
      name: 'Pratinjau proyek Proyek Aman',
    });
    // Gambar proyek kedua tidak ikut beralih ke placeholder.
    expect(safeImage).toHaveAttribute(
      'src',
      'https://images.example.com/ok.png',
    );
    // Gambar yang gagal beralih ke placeholder.
    expect(brokenImage.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });

  it('merender placeholder saat previewImageUrl null', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [
        makeProject({ id: 'p1', title: 'Tanpa Gambar', previewImageUrl: null }),
      ],
    });

    render(<ProjectsIsland />);

    const image = await screen.findByRole('img', {
      name: 'Pratinjau proyek Tanpa Gambar',
    });
    expect(image.getAttribute('src')).toMatch(/^data:image\/svg\+xml/);
  });
});

describe('ProjectsIsland - filter kategori', () => {
  it('mengklik tab kategori menyaring proyek yang terlihat', async () => {
    getProjectsMock.mockResolvedValue({
      status: 'ok',
      data: [
        makeProject({ id: 'p1', title: 'Proyek Web', category: 'web' }),
        makeProject({
          id: 'p2',
          title: 'Proyek Mobile',
          category: 'mobile',
          githubUrl: 'https://github.com/owner/repo2',
        }),
      ],
    });

    render(<ProjectsIsland />);

    // Mula-mula (tab ALL) kedua proyek tampil.
    expect(await screen.findByText('Proyek Web')).toBeInTheDocument();
    expect(screen.getByText('Proyek Mobile')).toBeInTheDocument();

    // Klik tab MOBILE -> hanya proyek mobile yang tampil.
    fireEvent.click(screen.getByRole('button', { name: 'MOBILE' }));

    expect(screen.getByText('Proyek Mobile')).toBeInTheDocument();
    expect(screen.queryByText('Proyek Web')).not.toBeInTheDocument();

    // Klik tab WEB -> hanya proyek web yang tampil.
    fireEvent.click(screen.getByRole('button', { name: 'WEB' }));

    expect(screen.getByText('Proyek Web')).toBeInTheDocument();
    expect(screen.queryByText('Proyek Mobile')).not.toBeInTheDocument();

    // Klik tab ALL -> kembali menampilkan semua.
    fireEvent.click(screen.getByRole('button', { name: 'SEMUA' }));

    expect(screen.getByText('Proyek Web')).toBeInTheDocument();
    expect(screen.getByText('Proyek Mobile')).toBeInTheDocument();
  });
});

describe('ProjectsIsland - empty state (Req 3.8)', () => {
  it('menampilkan pesan kosong saat tidak ada proyek', async () => {
    getProjectsMock.mockResolvedValue({ status: 'ok', data: [] });

    render(<ProjectsIsland />);

    expect(
      await screen.findByText('Belum ada proyek yang ditampilkan.'),
    ).toBeInTheDocument();
  });
});
