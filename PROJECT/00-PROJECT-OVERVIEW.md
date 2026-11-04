# 00: Project Overview

## 1. Identitas Proyek

| Item | Nilai |
|---|---|
| Nama Proyek | Portfolio CMS: Website Portofolio Pribadi & Showcase Jualan |
| Versi Dokumen | 1.0 |
| Tanggal | November 2026 |
| Stack | Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Neon Postgres (serverless HTTP) · Vercel |
| Auth | JWT HS256 (JOSE) pada HTTP-only cookie + bcryptjs |
| Sumber Konten | Postgres (Neon): 9 tabel, settings disimpan sebagai JSONB per key |

## 2. Ringkasan

Sebuah website portofolio pribadi yang berfungsi ganda:

1. **Showcase**: memamerkan karya, pengalaman, skill, testimoni, dan artikel.
2. **Etalase jualan**: menampilkan paket layanan + harga, banner "hire me", dan form inquiry yang masuk ke inbox admin.

Pemilik situs (**owner**) melakukan seluruh perubahan lewat **panel admin** yang dilindungi login: tambah/edit/hapus project, artikel, paket layanan, pengalaman, skill, testimoni, pesan masuk, plus **pengaturan semi-custom** (identitas, warna tema, section mana yang tampil, teks CTA, harga, SEO, social media).

## 3. Tujuan & Non-Tujuan

### Tujuan
- Menampilkan karya secara profesional di satu URL.
- Mengubah seluruh konten tanpa menyentuh kode atau deploy ulang.
- Menyediakan kanal konversi: visitor → form inquiry → pesan di admin.
- Bisa "dijual" sebagai produk/jasa: paket + harga + CTA yang diatur dari admin.
- Deployment sekali klik ke Vercel dengan database Neon.

### Non-Tujuan (v1)
- Multi-tenant / banyak admin dengan role granular.
- Payment gateway, invoice otomatis, dan e-commerce checkout.
- Editor WYSIWYG penuh (v1 pakai Markdown-lite).
- Media upload ke server sendiri (v1 pakai URL gambar eksternal).

## 4. Audiens & Peran

| Peran | Kebutuhan | Halaman |
|---|---|---|
| Visitor / calon klien | Melihat bukti kerja, cara kerja, dan harga | `/`, `/projects`, `/services`, `/about` |
| Pembaca | Membaca artikel / catatan teknis | `/blog`, `/blog/[slug]` |
| Pengunjung dari pencarian | Mendeskripsikan diri & finding project | semua halaman + `sitemap.xml` |
| Owner | Update konten, atur harga & tema, baca inquiry | `/admin/*` |

## 5. Peta Rute

### Publik
| Rute | Fungsi |
|---|---|
| `/` | Beranda: hero, layanan, project, about, skill, pengalaman, testimoni, pricing, blog, CTA |
| `/projects` | Daftar seluruh project published |
| `/projects/[slug]` | Detail project |
| `/services` | Paket layanan & harga |
| `/blog` | Daftar artikel |
| `/blog/[slug]` | Detail artikel |
| `/about` | Profil panjang, pengalaman, skill, testimoni |
| `/contact` | Form inquiry |
| `/sitemap.xml`, `/robots.txt` | SEO |

### Admin (wajib login)
| Rute | Fungsi |
|---|---|
| `/admin/login` | Login |
| `/admin` | Dashboard: statistik & aktivitas |
| `/admin/projects` | CRUD project |
| `/admin/posts` | CRUD artikel |
| `/admin/services` | CRUD paket & harga |
| `/admin/experience` | CRUD pengalaman |
| `/admin/skills` | CRUD skill |
| `/admin/testimonials` | CRUD testimoni |
| `/admin/messages` | Inbox pesan + ubah status |
| `/admin/settings` | Identitas, tema, section, CTA, harga, SEO, social, footer |

### API (read-only publik + 1 tulis)
`GET /api/projects` · `GET /api/posts` · `GET /api/services` · `GET /api/settings/public` · `POST /api/messages` · `POST /api/revalidate` (rahasia header).

## 6. Model Data (ringkas)

```
users        → akun admin (email unik, password_hash bcrypt)
settings    → key JSONB (site, theme, sections, socials, seo, features, footer)
projects    → karya (slug unik, published, featured, stack JSONB, gallery JSONB)
posts       → artikel (slug unik, published, published_at, tags JSONB)
services    → paket jualan (slug unik, price_value, features JSONB, popular)
experiences → timeline kerja (sort_order)
skills      → keahlian + level (0-100)
testimonials→ testimoni klien (rating, published)
messages    → inquiry dari form kontak (status: new/read/archived)
```

Detail kolom lengkap: `04-ARCHITECTURE/database-schema.md` dan `db/schema.sql`.

## 7. Arsitektur Ringkas

```
Browser ──HTTP──► Next.js 15 (Vercel)
                    │
                    ├─ Route Handler / Server Component ──► @neondatabase/serverless (HTTP) ──► Neon Postgres
                    ├─ Middleware (verifikasi JWT cookie) untuk /admin/*
                    └─ Server Actions (mutasi admin, validasi Zod)
```

Prinsip: **server-side everything**. Tidak ada database client di browser. Form contact dan seluruh CRUD admin berjalan lewat Server Action/Route Handler yang memvalidasi sesi sebelum menulis.

## 8.(idx) Timeline Ringkas

| Fase | Durasi | Output |
|---|---|---|
| 0: Discovery | 1–2 minggu | dokumen `01-`, `02-` |
| 1: MVP | 3–5 minggu | situs publik + admin CRUD inti |
| 2: Polish & Jualan | 2 minggu | pricing, CTA, SEO, polish visual |
| 3: Launch | 1 minggu | deploy Vercel + Neon, monitoring |

Detail: `05-PLANNING/roadmap.md`.

## 9. Ukuran Keberhasilan (KPI)

| KPI | Target |
|---|---|
| Lighthouse Performance (beranda) | ≥ 90 mobile |
| Lighthouse Accessibility | ≥ 95 |
| Time to Interactive (4G) | < 2.5 detik |
| Jumlah Core Web Vitals | LCP < 2.5s, CLS < 0.1, INP < 200ms |
| Waktu update konten dari admin | < 60 detik (tanpa deploy) |
| Balasan inquiry | < 24 jam |
| Error rate produksi | < 1% request |

## 10. Risiko Utama (ringkas)

Lihat `05-PLANNING/risks.md` untuk daftar lengkap dan mitigasi.

| ID | Risiko | Mitigasi |
|---|---|---|
| R-01 | Kebocoran/leak admin session | Cookie httpOnly + sameSite=lax + JWT 7 hari + verifikasi per-request |
| R-02 | Password database ter-expose | Env var Vercel, `.env*` masuk `.gitignore`, rotasi berkala |
| R-03 | Neon free-tier kehabisan compute | Connection string *pooled* + query singkat + index |
| R-04 | Konten rusak oleh owner | Slug unik + validasi Zod + konfirmasi hapus |
| R-05 | Dependency usang / CVE | `npm audit` tiap sprint, update berkala |

## 11. Navigasi Dokumen

| Kode | Isi |
|---|---|
| `00-PROJECT-OVERVIEW.md` | Dokumen ini |
| `01-RESEARCH/` | Problem statement, feasibility study |
| `02-REQUIREMENTS/` | PRD, SRS, user stories, acceptance criteria |
| `03-DESIGN/` | User flow, wireframe, UI design, design system |
| `04-ARCHITECTURE/` | Arsitektur sistem, skema DB, API spec, desain keamanan |
| `05-PLANNING/` | Roadmap, backlog, risiko |
| `06-QUALITY/` | Test plan, definition of done |
| `07-DEPLOYMENT/` | Rencana deploy Vercel + Neon |
