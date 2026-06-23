// Utilitas navigasi murni: menentukan tautan Menu_Navigasi yang aktif
// berdasarkan bagian yang sedang terlihat (Req 5.1, 5.4, 5.5).
// Logika ini bebas efek samping agar dapat diuji dengan property-based testing
// (lihat Property 14). Penentuan bagian terlihat (scroll-spy via
// IntersectionObserver) dilakukan di komponen NavBar, sedangkan util ini hanya
// memetakan id bagian terlihat menjadi penanda aktif pada daftar tautan.

/** Tautan tunggal pada Menu_Navigasi. */
export interface NavLink {
  /** Id bagian tujuan (cocok dengan id elemen `<section>`). */
  id: string;
  /** Label yang ditampilkan. */
  label: string;
  /** Target tautan, biasanya `#<id>`. */
  href: string;
}

/** Tautan navigasi beserta status aktifnya. */
export interface ActiveNavLink extends NavLink {
  active: boolean;
}

/**
 * Enam tautan tetap Menu_Navigasi sesuai urutan bagian pada halaman utama
 * (Req 5.1): Tentang, Keahlian, Proyek, Riwayat, Sertifikat, Kontak.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { id: 'about', label: 'Tentang', href: '#about' },
  { id: 'skills', label: 'Keahlian', href: '#skills' },
  { id: 'projects', label: 'Proyek', href: '#projects' },
  { id: 'history', label: 'Riwayat', href: '#history' },
  { id: 'certifications', label: 'Sertifikat', href: '#certifications' },
  { id: 'contact', label: 'Kontak', href: '#contact' },
];

/**
 * Menandai tepat satu tautan sebagai aktif: tautan yang `id`-nya sama dengan
 * `activeSectionId`. Bila `activeSectionId` tidak cocok dengan satu pun tautan
 * (mis. belum ada bagian terlihat), tidak ada tautan yang ditandai aktif.
 *
 * Properti yang dijaga: untuk sebuah id bagian terlihat yang merupakan tujuan
 * salah satu tautan, hasilnya memuat tepat satu tautan aktif dan tautan itu
 * adalah tautan menuju bagian tersebut (Property 14 — Req 5.4, 5.5).
 */
export function resolveActiveNav(
  links: readonly NavLink[],
  activeSectionId: string | null,
): ActiveNavLink[] {
  return links.map((link) => ({
    ...link,
    active: activeSectionId !== null && link.id === activeSectionId,
  }));
}
