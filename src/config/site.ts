// Konfigurasi situs statis untuk SEO/Open_Graph dan kontak (Req 6, 18).
// Hanya nilai publik yang aman dibangun ke dalam Build_Statis.

export interface SiteConfig {
  /** <title> dan og:title (Req 18.1, 18.2). */
  title: string;
  /** meta description dan og:description (Req 18.2). */
  description: string;
  /** og:url — Alamat_IP_VPS pada fase awal (Req 18.2). */
  url: string;
  /** og:image — URL gambar eksternal (Req 18.4). */
  ogImageUrl: string;
  /** Nama Pemilik untuk brand NavBar ("MADE BY …") dan footer. */
  ownerName: string;
  /** Peran/jabatan profesional Pemilik (mis. "Software Engineer"). */
  role: string;
  /** Tagline singkat untuk hero/branding. */
  tagline: string;
  /** Tautan unduh CV (mis. "/cv.pdf"). */
  cvUrl: string;
  /** Alamat mailto Pemilik (Req 6.1). */
  ownerEmail: string;
  /** Tautan profesional opsional, mis. GitHub/LinkedIn (Req 6.3). */
  socialLinks: { label: string; href: string }[];
  /** Daftar sertifikat/kredensial Pemilik untuk Bagian_Sertifikat. */
  certifications?: { title: string; issuer: string; year: string; url?: string }[];
}

export const siteConfig: SiteConfig = {
  title: 'Sofwan Rosidi - Network & Infrastructure Engineer',
  description:
    'Portofolio Sofwan Rosidi — mahasiswa S1 Teknologi Informasi Universitas Telkom dengan minat pada Network & Infrastructure Engineering.',
  url: 'http://localhost',
  ogImageUrl: '',
  ownerName: 'Sofwan Rosidi',
  role: 'Network & Infrastructure Engineer',
  tagline:
    'Bersertifikat MTCNA. Fokus membangun & mengelola jaringan yang andal — routing, switching, IP addressing, dan keamanan dasar.',
  cvUrl: '/cv',
  ownerEmail: 'rosyidisofwan@gmail.com',
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/sofwanrsd' },
    { label: 'WhatsApp', href: 'https://wa.me/6281232729502' },
    { label: 'Website', href: 'https://bydede.my.id' },
    { label: 'Email', href: 'mailto:rosyidisofwan@gmail.com' },
  ],
  certifications: [
    {
      title: 'MTCNA — MikroTik Certified Network Associate',
      issuer: 'MikroTik',
      year: '2023',
    },
  ],
};
