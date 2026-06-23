// Sumber data dari GitHub (Req 1 & 3) — menarik profil & repositori publik
// milik Pemilik secara runtime dari peramban Pengunjung dan memetakannya ke
// bentuk domain (`Profile` & `Project`).
//
// Catatan desain:
//   - Tanpa autentikasi (memakai endpoint publik). Cocok untuk situs statis;
//     batas laju GitHub untuk permintaan tak-terautentikasi cukup untuk lalu
//     lintas portofolio biasa.
//   - Gambar pratinjau proyek memakai kartu Open Graph GitHub
//     (https://opengraph.githubassets.com/1/<owner>/<repo>) sehingga setiap
//     kartu punya pratinjau rapi tanpa unggah gambar manual.
//   - Foto profil memakai avatar GitHub.
//   - Repo hasil fork & arsip disaring keluar; sisanya diurutkan bintang lalu
//     push terbaru.
//   - Kegagalan jaringan/HTTP dikonversi ke FetchResult error agar island bisa
//     menampilkan State_Kesalahan + tombol "Coba lagi".

import type { FetchResult, Profile, Project, ProjectCategory } from './types';

/** Username GitHub Pemilik (sumber Bagian_Proyek & Profil). */
export const GITHUB_USERNAME = 'sofwanrsd';

/** Bentuk minimal objek repo dari GitHub REST API yang kita pakai. */
interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  stargazers_count: number;
}

/** Bentuk minimal objek user dari GitHub REST API yang kita pakai. */
interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

/** Bahasa yang dikategorikan sebagai proyek web. */
const WEB_LANGS = new Set([
  'JavaScript',
  'TypeScript',
  'HTML',
  'CSS',
  'PHP',
  'Vue',
  'Astro',
  'Blade',
  'Svelte',
  'EJS',
]);
/** Bahasa yang dikategorikan sebagai proyek mobile. */
const MOBILE_LANGS = new Set(['Kotlin', 'Swift', 'Dart']);
/** Bahasa yang dikategorikan sebagai proyek desktop. */
const DESKTOP_LANGS = new Set(['C++', 'C', 'Rust']);
/** Bahasa yang dikategorikan sebagai proyek game. */
const GAME_LANGS = new Set(['C#', 'GDScript', 'Lua']);

/** Menentukan kategori filter dari bahasa utama repo. */
function categorize(language: string | null): ProjectCategory {
  if (language === null) return 'other';
  if (WEB_LANGS.has(language)) return 'web';
  if (MOBILE_LANGS.has(language)) return 'mobile';
  if (DESKTOP_LANGS.has(language)) return 'desktop';
  if (GAME_LANGS.has(language)) return 'game';
  return 'other';
}

/** Mengubah nama repo (kebab/snake) menjadi judul yang rapi & terbaca. */
export function prettifyRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Membangun deskripsi cadangan saat repo tidak punya deskripsi. */
function fallbackDescription(repo: GithubRepo): string {
  if (repo.language) {
    return `Proyek ${repo.language} — repositori publik di GitHub.`;
  }
  return 'Repositori publik di GitHub.';
}

/** Memetakan satu repo GitHub ke entri domain Project. */
export function mapRepoToProject(repo: GithubRepo, index: number): Project {
  const techStack = [repo.language, ...(repo.topics ?? [])].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  const homepage =
    repo.homepage && repo.homepage.trim() !== '' ? repo.homepage.trim() : null;

  return {
    id: String(repo.id),
    title: prettifyRepoName(repo.name),
    description: repo.description ?? fallbackDescription(repo),
    techStack,
    githubUrl: repo.html_url,
    demoUrl: homepage,
    previewImageUrl: `https://opengraph.githubassets.com/1/${repo.full_name}`,
    sortOrder: index,
    category: categorize(repo.language),
  };
}

/** Menyaring & mengurutkan repo: bukan fork/arsip, bintang lalu push terbaru. */
export function selectRepos(repos: GithubRepo[]): GithubRepo[] {
  return repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });
}

/**
 * Mengambil daftar proyek dari repositori publik GitHub Pemilik.
 * Mengembalikan FetchResult agar island dapat menampilkan State_Pemuatan/
 * State_Kesalahan tanpa exception.
 */
export async function getGithubProjects(
  username: string = GITHUB_USERNAME,
): Promise<FetchResult<Project[]>> {
  const endpoint = `https://api.github.com/users/${encodeURIComponent(
    username,
  )}/repos?per_page=100&sort=pushed`;

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `Gagal memuat proyek dari GitHub (HTTP ${response.status}).`,
      };
    }

    const raw = (await response.json()) as GithubRepo[];
    if (!Array.isArray(raw)) {
      return { status: 'error', message: 'Format data GitHub tidak terduga.' };
    }

    const projects = selectRepos(raw).map(mapRepoToProject);
    return { status: 'ok', data: projects };
  } catch {
    return {
      status: 'error',
      message: 'Gagal terhubung ke GitHub. Periksa koneksi lalu coba lagi.',
    };
  }
}

/**
 * Mengambil profil Pemilik dari GitHub: nama tampilan, foto (avatar), dan bio
 * sebagai deskripsi (Req 1). Bila bio kosong, `description` string kosong agar
 * pemanggil dapat memberi cadangan. FetchResult agar island bisa menampilkan
 * State_Pemuatan/State_Kesalahan.
 */
export async function getGithubProfile(
  username: string = GITHUB_USERNAME,
): Promise<FetchResult<Profile | null>> {
  const endpoint = `https://api.github.com/users/${encodeURIComponent(username)}`;

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: `Gagal memuat profil dari GitHub (HTTP ${response.status}).`,
      };
    }

    const user = (await response.json()) as GithubUser;
    const profile: Profile = {
      id: String(user.id ?? user.login ?? username),
      name: user.name && user.name.trim() !== '' ? user.name : user.login,
      photoUrl:
        user.avatar_url && user.avatar_url.trim() !== '' ? user.avatar_url : null,
      description: user.bio && user.bio.trim() !== '' ? user.bio : '',
    };
    return { status: 'ok', data: profile };
  } catch {
    return {
      status: 'error',
      message: 'Gagal terhubung ke GitHub. Periksa koneksi lalu coba lagi.',
    };
  }
}
