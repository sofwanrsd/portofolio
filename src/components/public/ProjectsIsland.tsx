// Island Bagian_Proyek (Req 3.1–3.10), gaya neobrutalism.
//
// Mengambil daftar proyek langsung dari GitHub (repo publik milik Pemilik) via
// getGithubProjects() saat runtime dari peramban Pengunjung, sehingga daftar
// proyek OTOMATIS sinkron dengan GitHub tanpa perlu edit/rebuild (cocok untuk
// deploy statis di Vercel). Merender mesin state seragam: loading ->
// loaded/empty/error (dengan kontrol "Coba lagi"). Saat termuat, menampilkan
// baris tab filter kategori
// neobrutalism ("ALL" + kategori yang benar-benar muncul pada data) dan
// menyaring kartu di sisi klien berdasarkan kolom `category` proyek.
//
// Setiap kartu memiliki garis tepi tebal + shadow-brutal, badge kategori,
// gambar pratinjau (fallback placeholder bila gagal — state per-kartu agar
// satu kegagalan tidak memengaruhi kartu lain, Req 3.10), judul, deskripsi,
// tag tech stack (chip bergaris), serta tautan GitHub (selalu) dan demo (bila
// ada) yang dibangun via buildProjectLinks (target="_blank" rel mengandung
// noopener, Req 3.7).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGithubProjects } from '../../lib/github';
import { buildProjectLinks } from '../../lib/projectLinks';
import type { Project, ProjectCategory } from '../../lib/types';
import { EmptyView, ErrorView, LoadingView } from './StateViews';

type ProjectsState =
  | { status: 'loading' }
  | { status: 'loaded'; projects: Project[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

/** Tab khusus untuk menampilkan seluruh proyek. */
const ALL_TAB = 'ALL';

/** Urutan kanonik kategori saat membangun tab (yang muncul saja yang dipakai). */
const CATEGORY_ORDER: ProjectCategory[] = [
  'web',
  'mobile',
  'desktop',
  'game',
  'other',
];

/** Label tampil (huruf kapital) per kategori. */
const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  web: 'WEB',
  mobile: 'MOBILE',
  desktop: 'DESKTOP',
  game: 'GAME',
  other: 'LAINNYA',
};

/** Kategori efektif sebuah proyek (default 'other' bila tidak diset). */
function categoryOf(project: Project): ProjectCategory {
  return project.category ?? 'other';
}

/**
 * Placeholder inline (SVG data URI) yang ditampilkan ketika gambar pratinjau
 * proyek gagal dimuat dari URL eksternal (Req 3.10).
 */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='18'%3EPratinjau tidak tersedia%3C/text%3E%3C/svg%3E";

interface ProjectsIslandProps {
  /** Tidak dipakai untuk id (section id diatur di index.astro). */
  sectionId?: string;
}

/** Gaya dasar tautan neobrutalism (border tebal + shadow + radius 0). */
const LINK_BASE =
  'inline-flex items-center justify-center border-2 border-light-text px-4 py-2 text-xs font-display uppercase tracking-wider shadow-brutal-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-light-primary dark:border-dark-text dark:focus-visible:outline-dark-primary';

/**
 * Kartu satu proyek. Mengelola fallback gambar secara lokal sehingga gambar
 * yang gagal pada satu kartu tidak memengaruhi kartu lain (Req 3.10).
 */
function ProjectCard({ project }: { project: Project }) {
  const [imageFailed, setImageFailed] = useState(false);

  const hasPreview =
    project.previewImageUrl !== null &&
    project.previewImageUrl !== undefined &&
    project.previewImageUrl.trim() !== '';
  const imageSrc =
    !hasPreview || imageFailed
      ? PLACEHOLDER_IMAGE
      : (project.previewImageUrl as string);

  const links = buildProjectLinks(project);
  const category = categoryOf(project);

  return (
    <article className="flex flex-col border-4 border-light-text bg-light-surface text-light-text shadow-brutal dark:border-dark-text dark:bg-dark-surface dark:text-dark-text">
      {/* Badge kategori. */}
      <div className="flex items-center justify-between border-b-4 border-light-text px-4 py-2 dark:border-dark-text">
        <span className="bg-accent px-2 py-0.5 text-xs font-display uppercase tracking-wider text-black">
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      <div className="border-b-4 border-light-text p-2 dark:border-dark-text">
        <img
          src={imageSrc}
          alt={`Pratinjau proyek ${project.title}`}
          loading="lazy"
          onError={() => {
            if (!imageFailed) {
              setImageFailed(true);
            }
          }}
          className="aspect-video w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display uppercase text-h3 text-light-text dark:text-dark-text">
          {project.title}
        </h3>

        <p className="flex-1 text-sm leading-relaxed text-light-text dark:text-dark-text">
          {project.description}
        </p>

        {project.techStack.length > 0 && (
          <ul aria-label="Teknologi yang digunakan" className="flex flex-wrap gap-2">
            {project.techStack.map((tech, index) => (
              <li
                key={`${tech}-${index}`}
                className="border-2 border-light-text px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-light-text dark:border-dark-text dark:text-dark-text"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-1 flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.kind}
              href={link.href}
              target={link.target}
              rel={link.rel}
              className={
                link.kind === 'github'
                  ? `${LINK_BASE} bg-accent text-black dark:bg-accent dark:text-black`
                  : `${LINK_BASE} bg-light-surface text-light-text dark:bg-dark-surface dark:text-dark-text`
              }
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * Island Bagian_Proyek. Melakukan fetch saat mount dan menyediakan retry.
 */
export default function ProjectsIsland(_props: ProjectsIslandProps = {}) {
  const [state, setState] = useState<ProjectsState>({ status: 'loading' });
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    setActiveTab(ALL_TAB);
    const result = await getGithubProjects();

    if (result.status === 'error') {
      setState({ status: 'error', message: result.message });
      return;
    }

    if (result.data.length === 0) {
      setState({ status: 'empty' });
      return;
    }

    setState({ status: 'loaded', projects: result.data });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const projects = state.status === 'loaded' ? state.projects : [];

  // Tab: "ALL" + kategori yang benar-benar muncul (urutan kanonik).
  const tabs = useMemo<string[]>(() => {
    const present = new Set(projects.map(categoryOf));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    return [ALL_TAB, ...ordered];
  }, [projects]);

  // Penyaringan klien: ALL menampilkan semua, selain itu cocokkan kategori.
  const visibleProjects = useMemo(
    () =>
      activeTab === ALL_TAB
        ? projects
        : projects.filter((p) => categoryOf(p) === activeTab),
    [projects, activeTab],
  );

  return (
    <section
      aria-labelledby="proyek-heading"
      className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <h2
        id="proyek-heading"
        className="mb-8 font-display uppercase text-h2 text-light-text dark:text-dark-text"
      >
        Proyek
      </h2>

      {state.status === 'loading' && (
        <LoadingView message="Memuat proyek…" label="Memuat proyek" />
      )}

      {state.status === 'error' && (
        <ErrorView
          message={state.message || 'Gagal memuat proyek. Silakan coba lagi.'}
          onRetry={() => {
            void load();
          }}
          label="Gagal memuat proyek"
        />
      )}

      {state.status === 'empty' && (
        <EmptyView message="Belum ada proyek yang ditampilkan." label="Tidak ada proyek" />
      )}

      {state.status === 'loaded' && (
        <>
          {/* Baris tab filter kategori neobrutalism. */}
          {tabs.length > 1 && (
            <div
              role="group"
              aria-label="Filter kategori proyek"
              className="mb-8 flex flex-wrap gap-3"
            >
              {tabs.map((tab) => {
                const active = tab === activeTab;
                const label =
                  tab === ALL_TAB
                    ? 'SEMUA'
                    : CATEGORY_LABELS[tab as ProjectCategory];
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveTab(tab)}
                    className={`border-4 border-light-text px-4 py-2 text-sm font-display uppercase tracking-wider shadow-brutal transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-light-primary dark:border-dark-text dark:focus-visible:outline-dark-primary ${
                      active
                        ? 'bg-accent text-black dark:bg-accent dark:text-black'
                        : 'bg-light-surface text-light-text dark:bg-dark-surface dark:text-dark-text'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {visibleProjects.length === 0 ? (
            <p className="border-4 border-light-text bg-light-surface px-4 py-3 text-sm font-bold uppercase tracking-wide text-light-text shadow-brutal dark:border-dark-text dark:bg-dark-surface dark:text-dark-text">
              Tidak ada proyek pada kategori ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
