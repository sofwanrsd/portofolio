// Utilitas tautan eksternal proyek murni: membangun deskriptor anchor untuk
// repositori GitHub (selalu ada) dan demo langsung (opsional). Setiap tautan
// eksternal dibuka di tab baru secara aman dengan `target="_blank"` dan `rel`
// mengandung `noopener` (Req 3.5, 3.6, 3.7). Bebas efek samping agar dapat
// diuji dengan property-based testing (lihat Property 15).

import type { Project } from './types';

/** Jenis tautan eksternal proyek. */
export type ProjectLinkKind = 'github' | 'demo';

/** Deskriptor anchor tautan eksternal proyek. */
export interface ProjectExternalLink {
  /** Jenis tautan: repositori GitHub atau demo langsung. */
  kind: ProjectLinkKind;
  /** URL tujuan. */
  href: string;
  /** Label yang ditampilkan. */
  label: string;
  /** Selalu `_blank` agar terbuka di tab baru (Req 3.7). */
  target: '_blank';
  /** Mengandung `noopener` (plus `noreferrer`) untuk keamanan tab baru. */
  rel: string;
}

/** Nilai `rel` aman untuk tautan yang dibuka di tab baru. */
const SAFE_REL = 'noopener noreferrer';

/**
 * Membangun daftar tautan eksternal untuk sebuah proyek. Selalu menyertakan
 * tautan repositori GitHub; menambahkan tautan demo hanya bila `demoUrl`
 * terisi. Setiap anchor memiliki `target="_blank"` dan `rel` yang mengandung
 * `noopener` (Property 15 — Req 3.7).
 */
export function buildProjectLinks(
  project: Pick<Project, 'githubUrl' | 'demoUrl'>,
): ProjectExternalLink[] {
  const links: ProjectExternalLink[] = [
    {
      kind: 'github',
      href: project.githubUrl,
      label: 'GitHub',
      target: '_blank',
      rel: SAFE_REL,
    },
  ];

  if (project.demoUrl !== null && project.demoUrl !== undefined && project.demoUrl.trim() !== '') {
    links.push({
      kind: 'demo',
      href: project.demoUrl,
      label: 'Demo',
      target: '_blank',
      rel: SAFE_REL,
    });
  }

  return links;
}
