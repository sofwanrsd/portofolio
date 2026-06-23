// Unit test untuk lib/github — pemetaan repo GitHub ke Project, penyaringan/
// pengurutan, dan getGithubProjects dengan fetch yang di-mock.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getGithubProjects,
  mapRepoToProject,
  prettifyRepoName,
  selectRepos,
} from './github';

function makeRepo(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'contoh-repo',
    full_name: 'sofwanrsd/contoh-repo',
    description: 'Deskripsi contoh.',
    html_url: 'https://github.com/sofwanrsd/contoh-repo',
    homepage: null,
    language: 'TypeScript',
    topics: [],
    fork: false,
    archived: false,
    pushed_at: '2025-01-01T00:00:00Z',
    stargazers_count: 0,
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('prettifyRepoName', () => {
  it('mengubah kebab/snake case menjadi judul terbaca', () => {
    expect(prettifyRepoName('auto-cek-domain')).toBe('Auto Cek Domain');
    expect(prettifyRepoName('tugas_webpro_week1')).toBe('Tugas Webpro Week1');
  });
});

describe('mapRepoToProject', () => {
  it('memetakan field repo ke Project dan menyusun techStack + preview OG', () => {
    const project = mapRepoToProject(
      makeRepo({
        name: 'portal-taveve',
        full_name: 'sofwanrsd/portal-taveve',
        language: 'TypeScript',
        topics: ['vercel'],
        homepage: 'https://portal-taveve.vercel.app',
        description: null,
      }),
      0,
    );

    expect(project.title).toBe('Portal Taveve');
    expect(project.githubUrl).toBe('https://github.com/sofwanrsd/contoh-repo');
    expect(project.demoUrl).toBe('https://portal-taveve.vercel.app');
    expect(project.previewImageUrl).toBe(
      'https://opengraph.githubassets.com/1/sofwanrsd/portal-taveve',
    );
    expect(project.techStack).toEqual(['TypeScript', 'vercel']);
    // Tanpa deskripsi -> fallback berbasis bahasa.
    expect(project.description).toContain('TypeScript');
    expect(project.category).toBe('web');
  });

  it('mengategorikan bahasa non-web dengan benar', () => {
    expect(mapRepoToProject(makeRepo({ language: 'Go' }), 0).category).toBe('other');
    expect(mapRepoToProject(makeRepo({ language: 'C++' }), 0).category).toBe('desktop');
    expect(mapRepoToProject(makeRepo({ language: null }), 0).category).toBe('other');
  });
});

describe('selectRepos', () => {
  it('menyaring fork & arsip, lalu mengurutkan bintang/terbaru', () => {
    const repos = [
      makeRepo({ id: 1, name: 'fork', fork: true }),
      makeRepo({ id: 2, name: 'arsip', archived: true }),
      makeRepo({ id: 3, name: 'lama', pushed_at: '2024-01-01T00:00:00Z', stargazers_count: 0 }),
      makeRepo({ id: 4, name: 'baru', pushed_at: '2025-06-01T00:00:00Z', stargazers_count: 0 }),
      makeRepo({ id: 5, name: 'populer', pushed_at: '2023-01-01T00:00:00Z', stargazers_count: 5 }),
    ];
    const selected = selectRepos(repos);
    expect(selected.map((r) => r.name)).toEqual(['populer', 'baru', 'lama']);
  });
});

describe('getGithubProjects', () => {
  it('mengembalikan daftar Project saat fetch berhasil', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [makeRepo({ id: 10, name: 'satu' })],
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getGithubProjects('sofwanrsd');
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Satu');
    }
  });

  it('mengembalikan error saat HTTP gagal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    const result = await getGithubProjects('sofwanrsd');
    expect(result.status).toBe('error');
  });

  it('mengembalikan error saat fetch melempar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const result = await getGithubProjects('sofwanrsd');
    expect(result.status).toBe('error');
  });
});
