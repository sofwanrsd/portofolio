# Portfolio CMS

Website portofolio pribadi lengkap dengan Content Management System (CMS) semi-kustom. Dibangun dengan **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, dan **PostgreSQL Neon**: siap deploy ke **Vercel**.

Dokumentasi lengkap ada di direktori [`PROJECT/`](./PROJECT/README.md).

---

## Fitur

### Situs Publik
- **Beranda**: hero, project unggulan, koleksi, layanan, dan konten, semuanya bisa dimatikan lewat pengaturan.
- **Katalog Project**: filter kategori, pencarian, pagination.
- **Detail Project**: deskripsi, stack teknologi, screenshot, tautan demo & repo.
- **Blog**: daftar artikel, tag, dan pembacaan artikel (markdown + GFM).
- **Layanan**: paket layanan dengan harga dan fitur.
- **Tentang**: profil, pengalaman, skill, testimoni.
- **Kontak**: form pesan dengan validasi Zod, honeypot, dan rate limiting.
- **Tema dinamis**: mode terang/gelap + warna aksen diatur dari dashboard.
- **SEO**: sitemap.xml, robots.txt, Open Graph, metadata per halaman.

### Dashboard Admin (`/admin`)
- Login dengan email + password (bcrypt + JWT di cookie HTTP-only).
- Dashboard statistik: jumlah project, artikel, layanan, pesan baru.
- **CRUD generik** untuk project, artikel, layanan, pengalaman, skill, testimoni: satu resource manager generik, bukan halaman terpisah.
- **Inbox pesan** dengan tandai sudah dibaca / belum.
- **Pengaturan situs**: identitas, tema, section on/off, socials, SEO, fitur, footer.
- **Halaman 404** kustom.

### API REST
| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/projects` | Daftar project published (filter `?category=`, `?limit=`) |
| GET | `/api/projects/{slug}` | Detail satu project |
| GET | `/api/posts` | Daftar artikel published (filter `?tag=`) |
| GET | `/api/services` | Daftar layanan |
| GET | `/api/settings/public` | Pengaturan publik (tanpa secret) |
| POST | `/api/messages` | Kirim pesan kontak |
| POST | `/api/revalidate` | Trigger revalidasi cache (butuh secret) |
| GET | `/api/health` | Health check aplikasi + koneksi database |

Spesifikasi lengkap: [`PROJECT/04-ARCHITECTURE/api-specification.yaml`](./PROJECT/04-ARCHITECTURE/api-specification.yaml) (OpenAPI 3.1.0).

---

## Stack Teknologi

| Lapisan | Teknologi |
|---|---|
| Framework | Next.js 15.1 (App Router, React Server Components) |
| Bahasa | TypeScript 5.7 (strict) |
| Styling | Tailwind CSS v4 + CSS Variables untuk tema |
| Database | PostgreSQL (Neon Serverless, HTTP driver) |
| Akses data | Raw SQL parameterised (tanpa ORM) |
| Auth | JOSE (JWT HS256) + bcryptjs |
| Validasi | Zod |
| Markdown | react-markdown + remark-gfm |
| Ikon | lucide-react |
| Hosting | Vercel |

---

## Persyaratan

- Node.js **20** atau lebih baru
- Akun [Neon](https://neon.tech) (free tier cukup)
- Akun [Vercel](https://vercel.com) (free tier cukup)

---

## Instalasi Lokal

```bash
git clone <url-repo>
cd portfolio
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="<hasil openssl rand -base64 48>"
ADMIN_EMAIL="anda@domain.com"
ADMIN_PASSWORD="<password kuat>"
REVALIDATE_SECRET="<hasil openssl rand -hex 32>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Buat secret acak:

```bash
openssl rand -base64 48   # AUTH_SECRET
openssl rand -hex 32      # REVALIDATE_SECRET
```

> Gunakan **pooled** connection string (mengandung `-pooler.`), bukan direct connection.

> **Postgres lokal?** Driver `@neondatabase/serverless` hanya bicara HTTP/HTTPS ke
> `https://<host>/sql`: tidak ada koneksi TCP seperti driver `pg`. Jadi `DATABASE_URL`
> harus menunjuk endpoint Neon (atau Postgres ber-protokol HTTP seperti Neon Local).
> Menembak Postgres biasa dari `docker run` butuh jembatan HTTP tambahan di port 443
> plus `NODE_TLS_REJECT_UNAUTHORIZED=0` bila sertifikatnya self-signed.

Inisialisasi database:

```bash
npm run db:setup
```

Perintah tersebut menjalankan `db/schema.sql` (DDL 9 tabel), mengisi `db/seed.sql` (data demo), dan membuat akun admin dari `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Jalankan development server:

```bash
npm run dev
```

Buka http://localhost:3000: admin tersedia di http://localhost:3000/admin/login.

---

## Scripts

| Script | Fungsi |
|---|---|
| `npm run dev` | Development server (port 3000) |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:setup` | Skema + seed + buat akun admin |
| `npm run db:seed` | Isi ulang data seed (tidak menghapus data) |
| `npm run db:reset` | Hapus tabel, lalu setup ulang (**hapus data**) |
| `npm test` | Unit test Vitest (60 tes, sekali jalan) |
| `npm run test:watch` | Unit test mode watch |
| `NEXT_DIST_DIR=.next-preview npm run build` | Build produksi terpisah, aman dijalankan berdampingan dengan `npm run dev` |

---

## Pengujian

Unit test memakai **Vitest** (tanpa DOM, environment `node`) dan mencakup 5 berkas:

| Berkas | Cakupan |
|---|---|
| `src/lib/slug.test.ts` | Normalisasi slug, aksen, pemotongan 80 karakter |
| `src/lib/format.test.ts` | Tanggal Indonesia, parsing nominal (`2.500.000`), harga, excerpt, waktu baca |
| `src/lib/rate-limit.test.ts` | Sliding window, penolakan tanpa perpanjangan jendela, `reset`, `sweep` |
| `src/lib/validation/schemas.test.ts` | Skema Zod project/post/service/message termasuk honeypot |
| `src/lib/contact.test.ts` | Validasi form kontak + kuota rate limit per IP |

```bash
npm test          # sekali jalan
npm run test:watch
```

Tes ini murni logika (tanpa database), sehingga aman dijalankan di CI tanpa `DATABASE_URL`. Untuk integration/E2E, lihat `PROJECT/06-QUALITY/test-plan.md`.

---

## Struktur Proyek

```
portfolio/
├── db/
│   ├── schema.sql              # DDL 9 tabel Postgres
│   └── seed.sql                 # Data demo awal
├── scripts/
│   ├── setup.ts                 # Bootstrap: DDL → seed → akun admin
│   └── seed.ts                  # Seed saja
├── src/
│   ├── app/
│   │   ├── page.tsx             # Beranda
│   │   ├── projects/            # Katalog + detail project
│   │   ├── blog/                # Daftar + detail artikel
│   │   ├── services/            # Halaman layanan
│   │   ├── about/               # Halaman tentang
│   │   ├── contact/             # Halaman & form kontak
│   │   ├── admin/               # Dashboard admin (route group)
│   │   │   ├── login/
│   │   │   └── (dashboard)/     # Layout dashboard + CRUD dinamis
│   │   ├── actions/             # Server actions (auth, admin, contact)
│   │   ├── api/                 # REST route handlers
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── icon.svg            # Favicon
│   │   ├── opengraph-image.tsx # OG image dinamis (fallback seo.ogImage)
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── sections/            # Section beranda
│   │   ├── admin/               # Komponen dashboard
│   │   └── ...                  # Komponen UI atomik
│   ├── lib/
│   │   ├── db.ts                # Klien Neon HTTP: sql`` + query/execute
│   │   ├── auth.ts              # bcrypt, signSession, requireAdmin
│   │   ├── settings.ts          # Default + merge + cache per-key
│   │   ├── resources.ts         # Definisi resource generik
│   │   ├── validation/          # Skema Zod per entitas
│   │   ├── contact.ts           # Handler form kontak + rate limit
│   │   ├── data.ts              # Data access layer
│   │   ├── slug.ts              # slugify + uniqueSlug
│   │   ├── format.ts            # Tanggal, rupiah, excerpt, waktu baca
│   │   ├── email.ts             # Notifikasi Resend (opsional)
│   │   ├── rate-limit.ts        # Sliding-window in-memory
│   │   ├── revalidate.ts        # Invalidasi cache Next.js
│   │   ├── types.ts             # Interface TypeScript
│   │   └── utils.ts             # cn + re-export helper
│   └── middleware.ts            # Proteksi rute /admin
├── PROJECT/                     # Dokumentasi lengkap (21 dokumen)
├── .env.example                 # Template env (salin ke .env.local)
├── next.config.ts
├── postcss.config.mjs
├── vitest.config.ts             # Konfigurasi unit test
└── tsconfig.json
```

---

## Skema Database

Sembilan tabel: `users`, `settings`, `projects`, `posts`, `services`, `experiences`, `skills`, `testimonials`, `messages`.

Rincian kolom, index, dan relasi: [`PROJECT/04-ARCHITECTURE/database-schema.md`](./PROJECT/04-ARCHITECTURE/database-schema.md).

---

## Autentikasi

1. Admin login melalui `/admin/login` → password diverifikasi dengan **bcrypt**.
2. Server membuat **JWT HS256** (JOSE) berisi `userId`, `email`, `role`, `exp` 7 hari.
3. Token disimpan di cookie **`portfolio_session`**: `HttpOnly`, `SameSite=Lax`, `Secure` (production).
4. `src/middleware.ts` memverifikasi JWT untuk seluruh rute `/admin/*` dan mengarahkan ke login bila tidak valid.
5. Server action admin selalu memanggil `requireAdmin()`: proteksi berlapis, bukan hanya di middleware.

---

## Deployment

Ringkas:

```bash
npm i -g vercel
vercel login
vercel --prod
```

Langkah lengkap (provisioning Neon, env var, domain, rollback, backup): [`PROJECT/07-DEPLOYMENT/deployment-plan.md`](./PROJECT/07-DEPLOYMENT/deployment-plan.md).

---

## Dokumentasi

Semua dokumen ada di [`PROJECT/`](./PROJECT/README.md):

| Folder | Isi |
|---|---|
| `00-PROJECT-OVERVIEW.md` | Ringkasan proyek, ruang lingkup, timeline |
| `01-RESEARCH/` | Problem statement, studi kelayakan |
| `02-REQUIREMENTS/` | PRD, SRS, user stories, acceptance criteria |
| `03-DESIGN/` | User flow, design system, wireframes, UI spec |
| `04-ARCHITECTURE/` | Arsitektur sistem, skema DB, OpenAPI spec, security design |
| `05-PLANNING/` | Roadmap, product backlog, risk register |
| `06-QUALITY/` | Test plan, definition of done |
| `07-DEPLOYMENT/` | Deployment plan |

---

## Lisensi

Dibuat sebagai portofolio pribadi. Bebas digunakan dan dimodifikasi.
