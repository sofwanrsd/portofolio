# 02 — Software Requirements Specification (SRS)

## 1. Pendahuluan

### 1.1 Tujuan
SRS ini menerjemahkan PRD (`02-REQUIREMENTS/PRD.md`) menjadi spesifikasi teknis yang dapat diimplementasikan dan diverifikasi. Setiap kebutuhan diberi ID **SRS-<kategori>-<nomor>** yang dirujuk oleh test plan (`06-QUALITY/test-plan.md`) dan acceptance criteria.

### 1.2 Konvensi
- **Shall** = wajib dipenuhi.
- **Should** = sangat disarankan.
- **May** = opsional.
- Skill, DB, dan route mengacu pada implementasi aktual di `src/`.

### 1.3 Lingkungan (Environment)
| Item | Nilai |
|---|---|
| Runtime | Node.js ≥ 20 |
| Framework | Next.js 15.1.x, App Router, Server Components |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), token via CSS variables |
| Database | PostgreSQL (Neon), driver `@neondatabase/serverless` (HTTP) |
| Auth | `jose` (JWT HS256) + `bcryptjs` |
| Validation | `zod` |
| Markdown | `react-markdown` + `remark-gfm` |
| Icons | `lucide-react` |
| Hosting | Vercel |

---

## 2. Persyaratan Fungsional — Publik

### SRS-PUB-01 Halaman Beranda
**Sistem shall** merender beranda yang terdiri dari section: hero, layanan, project, about, skill, pengalaman, testimoni, pricing, artikel terbaru, dan CTA.
**Sistem shall** menyembunyikan section yang `sections.<key> = false` pada settings.
**Sistem shall** menampilkan tombol hero dengan teks dan link dari `site.heroCtaText` / `site.heroCtaLink`.

### SRS-PUB-02 Daftar Project
**Sistem shall** menampilkan seluruh project dengan `published = true`, diurutkan `sort_order ASC, created_at DESC`.
**Sistem shall** memfilter berdasarkan kategori bila filter dipilih.
**Sistem shall** menampilkan ringkasan, stack, dan cover image.

### SRS-PUB-03 Detail Project
**Sistem shall** menampilkan project berdasarkan `slug`.
**Sistem shall** mengembalikan 404 bila slug tidak ada atau `published = false`.
**Sistem shall** menampilkan deskripsi, gallery, tech stack, tautan live & repository, klien, dan tahun.

### SRS-PUB-04 Blog
**Sistem shall** menampilkan daftar artikel `published = true` diurutkan `published_at DESC NULLS LAST`.
**Sistem shall** merender isi artikel dari Markdown dengan dukungan GFM (heading, list, tabel, kode, link).
**Sistem shall** menampilkan tag, tanggal terbit, dan waktu baca.

### SRS-PUB-05 Halaman Tentang
**Sistem shall** menampilkan deskripsi personal, linimasa pengalaman, skill per kategori, dan testimoni.

### SRS-PUB-06 Halaman Layanan
**Sistem shall** menampilkan paket dari tabel `services` dengan `published = true`.
**Sistem shall** menampilkan `price_label`, `price_value` berformat mata uang, dan daftar fitur.
**Sistem shall** menandai paket `popular = true` secara visual.

### SRS-PUB-07 Form Kontak
**Sistem shall** menerima `name`, `email`, `subject`, `budget`, `message`.
**Sistem shall** memvalidasi dengan Zod: name 2–100, email valid ≤160, subject ≤160, budget ≤80, message 10–5000.
**Sistem shall** menolak submission yang mengisi honeypot field `website`.
**Sistem shall** membatasi 5 submission per email per 10 menit.
**Sistem shall** menyimpan pesan dengan `status = 'new'`.
**Sistem shall** menampilkan pesan sukses/gagal pada UI.
**Sistem shall** mengirim email notifikasi bila `RESEND_API_KEY` terisi (best-effort, kegagalan tidak memblokir penyimpanan).

### SRS-PUB-08 SEO
**Sistem shall** menyediakan `sitemap.xml` berisi seluruh halaman publik, project, dan artikel.
**Sistem shall** menyediakan `robots.txt` yang mengizinkan halaman publik dan melarang `/admin` serta `/api`.
**Sistem shall** menyuntikkan metadata (title, description, keywords, Open Graph) dari settings.

---

## 3. Persyaratan Fungsional — Admin

### SRS-ADM-01 Login
**Sistem shall** menerima email dan password pada `/admin/login`.
**Sistem shall** mencari user dengan `lower(email) = lower($1)`.
**Sistem shall** membandingkan password dengan bcrypt (`cost 10`).
**Sistem shall** selalu menjalankan bcrypt meski user tidak ditemukan (timing attack mitigation).
**Sistem shall** menampilkan pesan generik "Email atau password salah." untuk email salah maupun password salah.
**Sistem shall** membuat session JWT HS256 berisi `sub`, `email`, `name`, `role`, berlaku 7 hari.
**Sistem shall** menyimpan token pada cookie `portfolio_session` dengan atribut `httpOnly`, `sameSite=lax`, `secure` (produksi), `path=/`.
**Sistem shall** redirect ke `/admin` setelah login berhasil.

### SRS-ADM-02 Proteksi Rute
**Sistem shall** menjalankan middleware pada matcher `/admin/:path*`.
**Sistem shall** redirect ke `/admin/login` bila token tidak ada, invalid, atau kedaluwarsa.
**Sistem shall** menyertakan parameter `from` untuk redirect balik setelah login.
**Sistem shall** mengizinkan akses `/admin/login` tanpa token, dan redirect ke `/admin` bila token valid.
**Sistem shall** memverifikasi ulang sesi di level server action sebelum setiap mutasi (defense in depth).

### SRS-ADM-03 Logout
**Sistem shall** menghapus cookie session (maxAge 0) dan redirect ke `/admin/login`.

### SRS-ADM-04 Dashboard
**Sistem shall** menampilkan jumlah project, artikel, layanan, skill, pengalaman, testimoni, dan pesan baru.
**Sistem shall** menampilkan 5 pesan terbaru.
**Sistem shall** menyediakan shortcut ke tiap modul CRUD.

### SRS-ADM-05 CRUD Generic Resource
Berlaku untuk `projects`, `posts`, `services`, `experience`, `skills`, `testimonials`.

**Sistem shall** menampilkan daftar baris sesuai `orderBy` definisi resource.
**Sistem shall** menampilkan form tambah/edit yang dibangun dari skema field (`FieldSchema[]`).
**Sistem shall** mendukung tipe field: `text`, `textarea`, `number`, `boolean`, `select`, `tags`, `list`.
**Sistem shall** memvalidasi field wajib dan tipe data sebelum menyimpan.
**Sistem shall** membuat `slug` otomatis dari judul bila field slug dikosongkan dan resource memiliki `hasSlug`.
**Sistem shall** menolak slug duplikat dengan pesan yang jelas.
**Sistem shall** menghapus baris setelah konfirmasi eksplisit pengguna.
**Sistem shall** menampilkan notifikasi berhasil/gagal pada setiap aksi.

### SRS-ADM-06 CRUD Project (spesifik)
**Sistem shall** menyimpan `title`, `summary`, `description`, `category`, `cover_image`, `gallery[]`, `stack[]`, `client`, `year`, `repo_url`, `live_url`, `sort_order`, `featured`, `published`.
**Sistem shall** memiliki kategori: `web`, `ui`, `automation`, `mobile`, `other`.
**Sistem shall** menampilkan maksimal 6 project `featured` di beranda.

### SRS-ADM-07 CRUD Artikel (spesifik)
**Sistem shall** menyimpan `title`, `slug`, `excerpt`, `content`, `cover_image`, `tags[]`, `published`.
**Sistem shall** mengatur `published_at` saat pertama kali dipublish.

### SRS-ADM-08 CRUD Paket Layanan (spesifik)
**Sistem shall** menyimpan `title`, `slug`, `description`, `price_label`, `price_value`, `currency`, `features[]`, `icon`, `popular`, `published`, `sort_order`.
**Sistem shall** menyimpan `price_value` sebagai teks (bukan numerik) agar bebas format.

### SRS-ADM-09 Inbox Pesan
**Sistem shall** menampilkan semua pesan terurut `created_at DESC`.
**Sistem shall** memfilter berdasarkan status `new` / `read` / `archived`.
**Sistem shall** mengubah status pesan.
**Sistem shall** menghapus pesan setelah konfirmasi.
**Sistem shall** menampilkan badge jumlah pesan `new`.

### SRS-ADM-10 Pengaturan
**Sistem shall** menyimpan 7 kelompok settings: `site`, `theme`, `sections`, `socials`, `seo`, `features`, `footer`.
**Sistem shall** menyediakan form per kelompok dengan validasi tipe.
**Sistem shall** menyatukan nilai yang disimpan dengan default per-key (merge, bukan replace) sehingga key baru tidak merusak data lama.
**Sistem shall** menerapkan perubahan warna aksen dan mode terang/gelap secara live di seluruh situs.
**Sistem shall** menyatukan seluruh form dalam satu aksi "Simpan semua".

---

## 4. Persyaratan Non-Fungsional

### SRS-NFR-01 Performa
| ID | Requirement |
|---|---|
| SRS-NFR-01a | First Load JS bundle publik ≤ 130 kB |
| SRS-NFR-01b | LCP ≤ 2.5 detik pada emulasi 4G |
| SRS-NFR-01c | CLS ≤ 0.1 |
| SRS-NFR-01d | INP ≤ 200 ms |
| SRS-NFR-01e | Query database independen dijalankan paralel (`Promise.all`) |
| SRS-NFR-01f | Halaman dinamis TTFB ≤ 800 ms |

### SRS-NFR-02 Keamanan
| ID | Requirement |
|---|---|
| SRS-NFR-02a | Password disimpan sebagai bcrypt hash cost ≥ 10, tidak pernah plaintext |
| SRS-NFR-02b | Session cookie `httpOnly` + `sameSite=lax` + `secure` di produksi |
| SRS-NFR-02c | JWT diverifikasi dengan `algorithms: ['HS256']` (mencegah alg confusion) |
| SRS-NFR-02d | `AUTH_SECRET` minimal 16 karakter; build/dev gagal bila tidak diset |
| SRS-NFR-02e | Seluruh input eksternal divalidasi Zod sebelum menyentuh DB |
| SRS-NFR-02f | Query memakai parameter binding (`$1`, `$2`), tidak ada string interpolation nilai user |
| SRS-NFR-02g | `DATABASE_URL` hanya di env var; `.env*` masuk `.gitignore` |
| SRS-NFR-02h | Header keamanan: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| SRS-NFR-02i | `robots.txt` melarang `/admin` dan `/api` |
| SRS-NFR-02j | Endpoint revalidate memerlukan header `x-revalidate-secret` yang cocok |
| SRS-NFR-02k | Output email di-escape HTML sebelum masuk template |
| SRS-NFR-02l | Data pesan visitor tidak pernah diekspos ke halaman publik |
| SRS-NFR-02m | Rate limit mencegah flooding form kontak |

### SRS-NFR-03 Keandalan
| ID | Requirement |
|---|---|
| SRS-NFR-03a | Error database tidak menyebabkan blank page; fallback ke default/empty list |
| SRS-NFR-03b | Kegagalan email notifikasi tidak menggagalkan penyimpanan pesan |
| SRS-NFR-03c | `npm run db:setup` idempoten — dapat dijalankan ulang tanpa merusak data |
| SRS-NFR-03d | Kegagalan build halting pada type error (`tsc --noEmit` bersih) |

### SRS-NFR-04 Maintainability
| ID | Requirement |
|---|---|
| SRS-NFR-04a | Definisi field seluruh resource terpusat di `src/lib/resources.ts` |
| SRS-NFR-04b | Server action tidak mengekspor nilai non-fungsi (aturan Next.js) |
| SRS-NFR-04c | Modul database tidak pernah diimpor dari client component |
| SRS-NFR-04d | Penamaan route: publik = deskriptif; admin = `admin/(dashboard)/<resource>` |
| SRS-NFR-04e | Tipe domain terpusat di `src/lib/types.ts` |

### SRS-NFR-05 Keasibility & Compatibilitas
| ID | Requirement |
|---|---|
| SRS-NFR-05a | Chrome, Safari, Firefox, Edge versi terkini; mobile Safari & Chrome |
| SRS-NFR-05b | Layout utuh pada lebar 320 px |
| SRS-NFR-05c | Tanpa ketergantungan pada font eksternal yang memblokir render |
| SRS-NFR-05d | Font fallback sistem bila `next/font` gagal memuat |

### SRS-NFR-06 Konten & Aksesibilitas
| ID | Requirement |
|---|---|
| SRS-NFR-06a | Struktur heading hierarkis (h1 → h2 → h3) per halaman |
| SRS-NFR-06b | Semua input form memiliki label yang terasosiasi |
| SRS-NFR-06c | Fokus keyboard terlihat (`:focus-visible` dengan outline) |
| SRS-NFR-06d | Semua gambar deskriptif memiliki `alt` |
| SRS-NFR-06e | Kontras teks utama ≥ 4.5:1 |
| SRS-NFR-06f | Tombol memiliki `type` eksplisit agar tidak submitting form tak sengaja |

---

## 5. Persyaratan Data

Lihat `04-ARCHITECTURE/database-schema.md` untuk definisi kolom lengkap.

| ID | Requirement |
|---|---|
| SRS-DAT-01 | 9 tabel: `users`, `settings`, `projects`, `posts`, `services`, `experiences`, `skills`, `testimonials`, `messages` |
| SRS-DAT-02 | Primary key UUID dengan default `gen_random_uuid()` |
| SRS-DAT-03 | `slug` unik pada `projects`, `posts`, `services` |
| SRS-DAT-04 | `settings` memakai key TEXT + value JSONB, `updated_at` otomatis |
| SRS-DAT-05 | Field list/array disimpan sebagai JSONB |
| SRS-DAT-06 | `messages.status` dibatasi CHECK `new` / `read` / `archived` |
| SRS-DAT-07 | Index pada `projects(published, sort_order)`, `posts(published, published_at DESC)`, `services(published, sort_order)`, `messages(status, created_at DESC)` |
| SRS-DAT-08 | Semua tabel memiliki `created_at` (dan `updated_at` bila dapat berubah) |
| SRS-DAT-09 | Foreign key tidak wajib pada v1 (data antar entitas independen) |

---

## 6. Persyaratan Antarmuka (UI)

| ID | Requirement |
|---|---|
| SRS-UI-01 | Dark mode sebagai default; light mode dapat dipilih di pengaturan |
| SRS-UI-02 | Token warna melalui CSS variables (`--fg`, `--bg`, `--muted`, `--accent`, `--border`, `--card`) |
| SRS-UI-03 | Border tipis (1px) sebagai pemisah utama |
| SRS-UI-04 | Radius dapat diubah: `soft` / `sharp` / `round` |
| SRS-UI-05 | Grid background opsional (`theme.showGrid`) |
| SRS-UI-06 | Admin memiliki sidebar (desktop) dan navigasi mobile |
| SRS-UI-07 | Tombol destructive (hapus) memakai warna bahaya + konfirmasi |
| SRS-UI-08 | Loading state memakai spinner pada tombol submit |
| SRS-UI-09 | Form menampilkan pesan error per field |
| SRS-UI-10 | Placeholder gambar project otomatis (gradient + inisial) bila `cover_image` kosong |

---

## 7. Persyaratan API

Detail lengkap di `04-ARCHITECTURE/api-specification.yaml`.

| ID | Requirement |
|---|---|
| SRS-API-01 | `GET /api/projects` — list project published |
| SRS-API-02 | `GET /api/posts` — list artikel published |
| SRS-API-03 | `GET /api/services` — list paket published |
| SRS-API-04 | `GET /api/settings/public` — settings tanpa data sensitif |
| SRS-API-05 | `POST /api/messages` — kirim pesan, validasi Zod, rate limit |
| SRS-API-06 | `POST /api/revalidate` — revalidasi cache, butuh header rahasia |
| SRS-API-07 | Seluruh response JSON konsisten: `{ data, count? }` atau `{ error, details? }` |
| SRS-API-08 | Status code: 200 sukses, 201 dibuat, 400 JSON salah, 422 validasi gagal, 401 tidak sah |

---

## 8. Persyaratan Deployment

Detail di `07-DEPLOYMENT/deployment-plan.md`.

| ID | Requirement |
|---|---|
| SRS-DEP-01 | Deploy ke Vercel dari repo Git |
| SRS-DEP-02 | Env var dikelola via Vercel Dashboard, bukan di repo |
| SRS-DEP-03 | `DATABASE_URL` memakai connection string **pooled** Neon |
| SRS-DEP-04 | Build command `npm run build`, output Next.js default |
| SRS-DEP-05 | Health check: `GET /` mengembalikan 200 |
| SRS-DEP-06 | Rollback ke deployment sebelumnya tersedia di Vercel |

---

## 9. Matriks Traceability Ringkas

| PRD Fitur | SRS | AC |
|---|---|---|
| F-P01 Beranda | SRS-PUB-01 | AC-01.1 |
| F-P02/F-P03 Project | SRS-PUB-02, 03 | AC-02.1, AC-02.2 |
| F-P04/F-P05 Blog | SRS-PUB-04 | AC-03.1, AC-03.2 |
| F-P06 Tentang | SRS-PUB-05 | AC-04.1 |
| F-P07 Layanan | SRS-PUB-06 | AC-05.1 |
| F-P08 Kontak | SRS-PUB-07 | AC-06.1–06.5 |
| F-P11 SEO | SRS-PUB-08 | AC-07.1–07.3 |
| F-A01/F-A02 Auth | SRS-ADM-01, 03 | AC-08.1–08.4 |
| F-A03 Proteksi | SRS-ADM-02 | AC-08.5, AC-08.6 |
| F-A04 Dashboard | SRS-ADM-04 | AC-09.1 |
| F-A05–F-A10 CRUD | SRS-ADM-05–08 | AC-10.1–10.6 |
| F-A11 Inbox | SRS-ADM-09 | AC-11.1–11.3 |
| F-A12–F-A17 Pengaturan | SRS-ADM-10 | AC-12.1–12.6 |
| F-X01/F-X02 Platform | SRS-DEP-01–06 | AC-13.1–13.4 |
