# 02: Product Requirements Document (PRD)

## 1. Ringkasan Produk

**Nama:** Portfolio CMS
**Versi:** 1.0 (MVP)
**Tanggal:** November 2026
**Author:** Owner / Developer
**Status:** Disetujui → masuk Fase 1 (MVP)

Website portofolio pribadi yang berfungsi sebagai **showcase karya sekaligus etalase jualan**, dengan **panel admin sendiri** agar seluruh konten dapat diperbarui tanpa menyentuh kode.

## 2. Masalah yang Diselesaikan

Detail lengkap di `01-RESEARCH/problem-statement.md`. Ringkasnya:

1. Portofolio yang tersebar di banyak tempat (GitHub, Dribbble, Medium, Google Drive) tidak membentuk satu cerita yang koheren.
2. Mengubah isi portofolio statis butuh deploy ulang: lambat, mahal, dan tidakmengubah skema.
3. Belum ada kanal konversi terukur dari pengunjung menjadi prospek.
4. Belum ada mechanism untuk menampilkan "saya bisa(expression hiring)" secara eksplisit.

## 3. Target Pengguna

| Segmen | Karakteristik | Kebutuhan utama |
|---|---|---|
| **Calon klien** | Owner bisnis tanpa tim IT, sedang mencari "developer XYZ" | Bukti kerja relevan, cara kerja, harga, cara menghubungi |
| **Recruiter / hiring manager** | Melakukan scan cepat 30 detik | Yang dibutuhkan: bio singkat, tech stack, pengalaman, tautan langsung |
| **Pembaca teknis** | Datang dari artikel/SEO | Artikel yang terbaca ringan, related project |
| **Owner** | Non-engineer, ingin kendali penuh | Login aman, form sederhana, preview sebelum simpan |

Detail persona & pain point: `01-RESEARCH/problem-statement.md` §3.

## 4. Sasaran Produk (Goals)

| ID | Sasaran | Ukuran |
|---|---|---|
| G1 | Showcase karya yang kredibel | ≥ 6 project lengkap dengan deskripsi, stack, dan link live |
| G2 | Konten 100% bisa diubah owner tanpa kode | 100% field konten & konfigurasi lewat `/admin` |
| G3 | Kanal konversi aktif | Form inquiry bekerja; pesan masuk ke inbox admin |
| G4 | Opsi "jualan" aktif | Section harga + CTA + banner hire-me, semuanya configurable |
| G5 | Performa & SEO kelas produksi | Lighthouse ≥ 90, sitemap, robots, metadata per halaman |
| G6 | Biaya operasional minimum | $0/bulan pada free tier untuk trafik < 10k PV |

## 5. Non-Sasaran (Out of Scope untuk v1)

- Multi-admin dengan role granular & audit log.
- Payment gateway, invoice, dan checkout otomatis.
- Editor WYSIWYG (pakai Markdown-lite).
- Upload media ke storage sendiri (pakai URL eksternal).
- Multi-bahasa / i18n.
- Analytics dashboard di dalam admin (pakai Vercel Analytics).
- Notifikasi real-time (email notifikasi bersifat best-effort via Resend).

## 6. Fitur: Prioritas

MoSCoW. **M** = Must, **S** Should, **C** Could, **W** Won't (v1).

### 6.1 Publik (tanpa login)

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| F-P01 | Beranda | M | Hero, layanan, project, about, skill, pengalaman, testimoni, pricing, artikel terbaru, CTA |
| F-P02 | Halaman daftar project | M | Grid project published + filter kategori |
| F-P03 | Detail project | M | Cover, gallery, deskripsi, stack, tautan live/repo, project lain |
| F-P04 | Halaman blog | M | Daftar artikel published |
| F-P05 | Detail artikel | M | Isi Markdown, metadata, artikel terkait |
| F-P06 | Halaman tentang | M | Profil, pengalaman, skill, testimoni |
| F-P07 | Halaman layanan | M | Paket + harga + fitur tiap paket |
| F-P08 | Form kontak | M | Nama, email, subjek, budget, pesan → `messages` |
| F-P09 | Section pricing | M | Kotak harga dari tabel `services` |
| F-P10 | Banner hire-me | M | CTA global, toggle on/off |
| F-P11 | SEO dasar | M | Meta tag, Open Graph, sitemap.xml, robots.txt |
| F-P12 | Halaman 404 | S | Disesuaikan dengan brand |
| F-P13 | Navigasi responsif | S | Header sticky, menu mobile |

### 6.2 Admin (wajib login)

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| F-A01 | Login | M | Email + password, bcrypt, session JWT 7 hari |
| F-A02 | Logout | M | Hapus cookie session |
| F-A03 | Proteksi rute | M | Middleware redirect ke `/admin/login` bila tidak terautentikasi |
| F-A04 | Dashboard | M | Statistik konten + pesan baru + shortcut |
| F-A05 | CRUD Project | M | Tambah/edit/hapus/urut/publish/featured |
| F-A06 | CRUD Artikel | M | Tambah/edit/hapus/publish, slug otomatis |
| F-A07 | CRUD Paket Layanan | M | Nama, harga, fitur, penanda populer, publish |
| F-A08 | CRUD Pengalaman | M | Perusahaan, peran, periode, urutan |
| F-A09 | CRUD Skill | M | Nama, kategori, level, urutan |
| F-A10 | CRUD Testimoni | M | Nama, jabatan, perusahaan, rating, publish |
| F-A11 | Inbox pesan | M | Lihat pesan, tandai read/archived, hapus |
| F-A12 | Pengaturan situs | M | Nama, tagline, deskripsi, email, telepon, lokasi, status tersedia |
| F-A13 | Pengaturan tema | M | Warna aksen & sekunder, mode gelap/terang, radius, grid |
| F-A14 | Pengaturan section | M | Toggle tampil/tidak tiap section beranda |
| F-A15 | Pengaturan CTA & harga | M | Teks CTA, banner hire-me, judul & subjudul pricing |
| F-A16 | Pengaturan social & SEO | M | 6 link sosial, meta title/description/keywords/OG image |
| F-A17 | Pengaturan footer | S | Tagline, teks copyright, toggle copyright |
| F-A18 | API publik | S | `GET` JSON untuk project/post/layanan/settings |
| F-A19 | Endpoint revalidate | W | Trigger cache refresh via header rahasia |

### 6.3 Platform

| ID | Fitur | Prioritas | Deskripsi |
|---|---|---|---|
| F-X01 | Deploy Vercel | M | Git push → deploy, env var via dashboard |
| F-X02 | Database Neon | M | 9 tabel, pooled connection |
| F-X03 | Setup satu perintah | M | `npm run db:setup` membuat tabel + seed + akun admin |
| F-X04 | Responsive | M |320px → 1920px |
| F-X05 | Dark mode | M | Default gelap, toggle terang via pengaturan |
| F-X06 | Aksesibilitas | M | Semantic HTML, focus ring, kontras, label form |

## 7. Kebutuhan Non-Fungsional

| Kategori | Requirement | Cara verifikasi |
|---|---|---|
| Performa | LCP < 2.5s, CLS < 0.1, INP < 200ms pada koneksi 4G | Lighthouse |
| Performa | First Load JS < 130 kB | Output `next build` |
| Performa | Halaman data dinamis < 800ms TTFB | `curl -w` |
| Keamanan | Password hash bcrypt cost 10 | Inspect `users.password_hash` |
| Keamanan | Session cookie httpOnly + sameSite=lax + secure di prod | Inspect Set-Cookie |
| Keamanan | Semua mutasi admin melewati verifikasi sesi | Code review + uji langsung |
| Keamanan | Semua input tervalidasi Zod | Code review |
| Keamanan | Tidak ada secret di repo | `grep` + `.gitignore` |
| Privasi | Pesan visitor tidak ditampilkan publik | Query hanya di `/admin/messages` |
| Skalabilitas | 6 CRUD resource ditangani satu engine | `src/lib/resources.ts` |
| Skalabilitas | Query paralel untuk data independen | `Promise.all` |
| Keandalan | Error DB tidakblank page | try/catch + fallback default |
| SEO | Metadata unik per halaman | `metadata` export |
| SEO | Sitemap berisi semua URL | `sitemap.xml` |
| Maintainability | TypeScript strict, `tsc --noEmit` bersih | `npm run typecheck` |
| Maintainability | Satu sumber kebenaran untuk definisi CRUD | `src/lib/resources.ts` |

## 8. Aturan Domain

1. **Slug unik global** per tabel; generate otomatis dari judul bila kosong (slugify: lowercase, non-alnum → `-`, trim `-`).
2. **Project & artikel unpublished tidak tampil** di halaman publik maupun sitemap.
3. **`sort_order` lebih kecil → tampil lebih dulu**; tie-breaker `created_at DESC`.
4. **Featured project** tampil di blok project utama beranda, maksimal 6.
5. **Pesan form kontak** selalu berstatus `new` saat masuk.
6. **Setting key** merupakan JSONB: `site`, `theme`, `sections`, `socials`, `seo`, `features`, `footer`.
7. **Nilai setting yang belum ada** memakai default dari `src/lib/settings.ts` (merge per-key, bukan replace).
8. **Hapus project/artikel** adalah hard delete (v1), dengan konfirmasi di UI.
9. **Section pricing** memakai data tabel `services`, bukan disimpan di settings.
10. **Level skill** 0–100; label: 0–40 Pemula, 41–60 Menengah, 61–80 Lanjut, 81–100 Mahir.

## 9. Model & Aturan Harga

- `price_value` disimpan sebagai **TEKS** agar bisa berisi "2.500.000", "mulai dari 1jt", atau "nego".
- `price_label` teks bebas: "mulai dari", "per project", "per bulan".
- `currency`: `IDR` | `USD` | `EUR`.
- `popular` menandai satu paket yang dikhighlight di halaman layanan.
- Banner "hire me" (settings `features.hireMeEnabled`) bersifat global, muncul di beranda.

## 10. Metrik Sukses

| Metrik | Definisi | Target 3 bulan |
|---|---|---|
| K1 | Konversi inquiry | ≥ 1 inquiry per 500 kunjungan |
| K2 | Waktu update konten | ≤ 60 detik dari buka admin sampai publish |
| K3 | Lighthouse Performance beranda | ≥ 90 |
| K4 | Lighthouse Accessibility | ≥ 95 |
| K5 | Error rate 5xx | < 1% request |
| K6 | Waktu balas inquiry | ≤ 24 jam |
| K7 | Waktu buka admin (p95) | ≤ 1.5 detik |

## 11. Asumsi & Dependensi

| Asumsi | Dampak bila salah |
|---|---|
| Owner memiliki akun Neon free | Perlu naik ke Pro saat storage > 300 MB |
| Owner comfortable dengan Markdown | Konten artikel mungkin perlu penyuntingan owner |
| Gambar di-hosting di CDN eksternal | V1 tidak mendukung upload |
| Email domain sudah dimiliki | Menunda verifikasi email & email blast |
| Trafik < 10k PV/bulan | Jika lebih, optimasi image & cache diperluas |

## 12. Pelacakan traceability

Setiap fitur di atas dipetakan ke acceptance criteria di `02-REQUIREMENTS/acceptance-criteria.md` dengan format **AC-xx.yy**.

## 13. Outlier / Keputusan Tertutup

| ID | Keputusan | Alasan |
|---|---|---|
| D-01 | Raw SQL via `@neondatabase/serverless`, bukan ORM | Query sederhana, dependency kecil, driver HTTP cocok untuk serverless |
| D-02 | Session JWT di cookie, bukan session DB | Stateless, mudah di-scale, tidak perlu tabel session |
| D-03 | Settings JSONB per key | Konfigurasi semi-custom tanpa migrasi DB |
| D-04 | Satu generic `ResourceManager` untuk 6 tabel | Mengurangi duplikasi kode admin |
| D-05 | Markdown-lite, bukan WYSIWYG | V1 cukup, waktu bangun jauh lebih singkat |
| D-06 | Rate limit in-memory untuk form | Cukup untuk bot dasar, nol biaya; Redis jadi opsi v2 |
| D-07 | Email notifikasi best-effort via Resend | Kegagalan email tidak boleh memblokir simpan pesan |
