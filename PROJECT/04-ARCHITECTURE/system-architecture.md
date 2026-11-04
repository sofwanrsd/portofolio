# Arsitektur Sistem — Portfolio CMS & Showcase Pribadi

| Atribut | Nilai |
| --- | --- |
| Produk | Website portofolio pribadi + CMS semi-custom |
| Versi dokumen | 1.0 |
| Tanggal | 4 November 2026 |
| Stack | Next.js 15 (App Router) · TypeScript · Tailwind v4 · Neon Postgres (raw SQL via @neondatabase/serverless, HTTP driver) · Vercel · jose (JWT) · bcryptjs · Zod · Resend (opsional) |
| Basis desain | `db/schema.sql`, `db/seed.sql`, `PROJECT/05-PLANNING/roadmap.md` |
| Prinsip utama | Public-first, deploy hari pertama, serverless end-to-end, satu sumber kebenaran (Neon) |

---

## 1. Ringkasan Eksekutif

Sistem ini adalah **monorepo satu aplikasi Next.js** yang berjalan sepenuhnya di Vercel dengan database terkelola di Neon. Tidak ada server aplikasi yang harus dioperasikan sendiri: tidak ada VPS, tidak ada container yang di-build manual, tidak ada cron worker terpisah. Seluruh siklus hidup aplikasi — build, preview, edge cache, secrets, database — berada di dua dashboard (Vercel dan Neon).

Arsitektur sengaja dipisah menjadi **tiga layer logis** agar perubahan pada satu layer tidak merambat ke layer lain:

1. **Presentation** — RSC/Client Component, Tailwind, komponen UI. Murni soal tampilan.
2. **Domain** — skema Zod, aturan bisnis (slug, soft-publish, aturan harga), server actions. Tidak tahu bentuk tabel.
3. **Data** — Skema SQL + query modul raw SQL di atas `@neondatabase/serverless` (HTTP driver). Tidak tahu HTTP, tidak tahu React.

Konsekuensi praktis dari pemisahan ini: **konten, konfigurasi visual, dan harga adalah data, bukan kode.** Admin mengubah `settings` dan halaman publik berubah pada request berikutnya tanpa deploy. Ini yang menjawab akar masalah O4 di `problem-statement.md`.

Sifat operasional yang harus dipahami sebelum membaca sisa dokumen:

- **Skala ini didesain untuk traffic rendah-menengah.** Target: 10–50 ribu page view/bulan. Arsitektur ini akan tetap hidup pada 10× itu, tapi ada titik saat Neon perlu di-upgrade plan atau Vercel perlu CDN cache yang lebih agresif.
- **Tidak ada downtime terjadwal.** Deploy = build immutable baru di Vercel + traffic switch. Rollback satu klik.
- **Satu mode gagal yang berbahaya: DB mati.** Semua mitigasi fokus ke sini (Bagian 11).

---

## 2. Diagram Arsitektur

### 2.1 Diagram Mermaid — Tinjauan Keseluruhan

```mermaid
flowchart TB
    subgraph Client["Browser / Client"]
        U[Pengunjung]
        A[Admin]
    end

    subgraph Vercel["Vercel Platform"]
        subgraph Edge["Edge Network / CDN"]
            CD[Static Assets<br/>_next/static, /public]
        end

        subgraph Next["Next.js 15 App Router"]
            MW[Middleware<br/>JWT cookie check]
            RSC[Server Components<br/>Public pages]
            SA[Server Actions<br/>Admin mutations]
            RH[Route Handlers<br/>/api/*]
        end

        subgraph Cache["Next.js Data Cache"]
            DC[(Data Cache)]
            RC[(Full Route Cache)]
        end
    end

    subgraph Neon["Neon Postgres (Managed)"]
        PG[(Primary<br/>us-east-2)]
        BR[(Branches<br/>dev / staging)]
        POOL[Pooled Connection String]
    end

    subgraph Ext["Layanan Eksternal"]
        RS[Resend API<br/>email notifikasi]
        VER[Vercel Analytics<br/>Log drain]
    end

    U -->|HTTPS| CD
    U -->|HTTPS /admin/*| MW
    A -->|HTTPS /admin/login| MW
    MW -->|valid JWT| RSC
    MW -->|invalid/absent| Login[Redirect /admin/login]
    RSC --> DC
    RSC --> PG
    SA --> PG
    SA -->|revalidatePath| DC
    SA -.-> RS
    RH --> PG
    PG <--> POOL
    POOL --> PG
    BR -.->|restore / clone| PG
    RSC --> VER
```

### 2.2 Diagram ASCII — Alur Request

```
                         ┌──────────────────────────────┐
   Pengunjung / Admin    │        VERCEL EDGE           │
   (Browser) ───────────►│  CDN + Edge Middleware       │
                         │  • cache aset statis         │
                         │  • rewrite ke origin         │
                         └──────────────┬───────────────┘
                                        │ (miss / dynamic)
                                        ▼
                         ┌──────────────────────────────┐
                         │      NEXT.JS (serverless fn)  │
                         │                              │
                         │  1. Middleware               │
                         │     └─ baca cookie JWT (jose)│
                         │     └─ /admin/* → tolak 401  │
                         │                              │
                         │  2. Route Handler / RSC      │
                         │     └─ layer Presentation    │
                         │     └─ layer Domain (Zod)    │
                         │     └─ layer Data (raw SQL)  │
                         └───────┬──────────────┬───────┘
                                 │              │
                    HTTP driver  │              │ revalidatePath
                    (fetch → SQL)│              ▼
                                 │      ┌────────────────┐
                                 ▼      │  Next Data     │
                    ┌────────────────┐   │  Cache + Route │
                    │  NEON POSTGRES │   │  Cache (CDN)   │
                    │  primary branch│   └────────────────┘
                    └───────┬────────┘
                            │ (opsional)
                            ▼
                    ┌────────────────┐
                    │  RESEND API    │  email notifikasi inquiry
                    └────────────────┘
```

### 2.3 Deployment Topology

```
GitHub (main)  ──push──►  Vercel Build (Linux, Node 20)  ──►  Vercel Edge
                              │                                      │
                              │                                      ├─► Region: Washington DC (iad1)
                              │                                      └─► CDN global (edge cache)
                              │
                              └── npm run db:migrate / db:setup (CLI) ──► Neon primary
```

| Komponen | Planet | Detail |
| --- | --- | --- |
| Source of truth kode | GitHub | Branch `main` = produksi, PR = preview |
| Runtime aplikasi | Vercel Serverless | Region default `iad1` (US East). Single region → latensi ke Neon rendah |
| Aset statis | Vercel Edge Network | `_next/static/*` immutable, `/public/*` |
| Database | Neon | Primary branch `main`, region `us-east-2` |
| Integrasi email | Resend | HTTP API, dipanggil dari Server Action (bukan webhook) |
| Observability | Vercel Analytics + Logs | Error tracking, traffic, request log |

---

## 3. Layer Breakdown

### 3.1 Layer Presentation

Berisi apa saja yang **tampak** ke pengguna. Tidak melakukan query database secara langsung; semua data masuk sebagai prop dari layer domain.

| Bagian | Tanggung jawab | Contoh file |
| --- | --- | --- |
| Layout & shell | Navbar, footer, container, tema global | `app/layout.tsx`, `components/layout/*` |
| Halaman publik | Hero, project grid, pricing, blog | `app/(public)/**/page.tsx` |
| Halaman admin | Tabel CRUD, form editor | `app/admin/**` |
| Komponen UI | Tombol, card, badge, input, modal | `components/ui/*` |
| Styling | Tailwind v4 tokens, dark mode | `app/globals.css` |
| Client interactivity | Toggle tema, filter tag, preview gambar | `components/**` dengan `"use client"` |

Aturan main: **Server Component secara default.** `"use client"` hanya ditambahkan pada komponen yang butuh event handler, state browser, atau browser API. Tiap `"use client"` adalah tambahan bundle JS ke klien — gunakan sesedikit mungkin.

### 3.2 Layer Domain

Berisi **aturan bisnis**. Layer ini yang membuat aplikasi benar, dan yang harus diuji (unit test) terpisah dari UI.

| Bagian | Tanggung jawab |
| --- | --- |
| Skema Zod | Validasi input form, server action, dan route handler. Satu sumber aturan validasi. |
| Generator slug | `slugify()` — lowercase, strip karakter khusus, dahulukan-judul, suffix numerik bila bentrok |
| Aturan soft-publish | `published = true` **dan** (untuk posts) `published_at <= now()` → tampil |
| Aturan harga | `price_label` + `price_value` + `currency` → format rupiah dengan pemisah ribuan |
| Aturan section | `settings.sections` menentukan section mana yang dirender di `/` |
| Otorisasi | `requireAdmin()` — baca cookie, verifikasi JWT, cek role, tolak bila tidak valid |
| Formatting | Tanggal Bahasa Indonesia (`Intl.DateTimeFormat('id-ID')`), excerpt potong 160 karakter |

### 3.3 Layer Data

Satu-satunya tempat yang **tahu bentuk tabel**. Tidak mengimpor React, tidak tahu apa itu Server Action.

| Bagian | Tanggung jawab |
| --- | --- |
| Skema SQL | Definisi kolom, tipe, default, index — persis cerminan `db/schema.sql` |
| Klien Neon | `neon()` HTTP driver dengan `Pooled Connection String` (WebSocket tidak diperlukan di serverless) |
| Query modul | Satu file per entitas: `getPublishedProjects()`, `createPost()`, `updateSettings()` |
| Transaksi | `db.transaction()` untuk operasi multi-tabel (mis. publish post + revalidasi) |
| Mapping | Baris DB → objek domain (JSONB di-parse ke array typed, bukan `unknown`) |

Aturan main: **tidak ada string SQL mentah.** Semua query ditulis sebagai tagged template `sql` dari `@neondatabase/serverless`, yang berarti semua nilai ter-parameterisasi otomatis (lihat `security-design.md` §5.5).

---

## 4. Komponen

### 4.1 Peta Route

| Route | Jenis | Auth | Cache | Sumber data |
| --- | --- | --- | --- | --- |
| `/` | RSC | Publik | `revalidate = 3600` | projects, services, experiences, skills, testimonials, settings |
| `/projects` | RSC | Publik | `revalidate = 3600` | projects (published) |
| `/projects/[slug]` | RSC | Publik | `revalidate = 3600` | 1 project by slug |
| `/blog` | RSC | Publik | `revalidate = 3600` | posts (published) |
| `/blog/[slug]` | RSC | Publik | `revalidate = 3600` | 1 post by slug |
| `/about` | RSC | Publik | `revalidate = 3600` | experiences, skills, testimonials, settings.site |
| `/services` | RSC | Publik | `revalidate = 3600` | services (published) |
| `/contact` | RSC + SA | Publik | `dynamic` (form) | settings (kontak) |
| `/admin/login` | RSC + SA | Publik | `dynamic` | users |
| `/admin` | RSC | Admin | `dynamic` | agregat semua entitas |
| `/admin/projects` | RSC + SA | Admin | `dynamic` | projects (semua) |
| `/admin/posts` | RSC + SA | Admin | `dynamic` | posts (semua) |
| `/admin/services` | RSC + SA | Admin | `dynamic` | services (semua) |
| `/admin/experience` | RSC + SA | Admin | `dynamic` | experiences |
| `/admin/skills` | RSC + SA | Admin | `dynamic` | skills |
| `/admin/testimonials` | RSC + SA | Admin | `dynamic` | testimonials |
| `/admin/messages` | RSC + SA | Admin | `dynamic` | messages |
| `/admin/settings` | RSC + SA | Admin | `dynamic` | settings |
| `/api/*` | Route Handler | Campuran | Bervariasi | Lihat `api-specification.yaml` |

### 4.2 Komponen Non-Route

| Komponen | Fungsi |
| --- | --- |
| `middleware.ts` | Penjaga `/admin/*`: verifikasi cookie JWT, tolak / redirect. Jalur paling awal, sebelum render. |
| `lib/auth.ts` | `signSession()`, `verifySession()`, `requireAdmin()`, `requireEditor()` |
| `lib/db.ts` | Inisialisasi `neon(DATABASE_URL)` — satu instance, reuse di seluruh request; mengekspor tagged template `sql` |
| `lib/validation/*.ts` | Skema Zod per entitas (`projectSchema`, `postSchema`, `messageSchema`, …) |
| `lib/settings.ts` | Baca/tulis key-value settings + cache per-key |
| `lib/slug.ts` | `slugify()`, `uniqueSlug()` |
| `lib/format.ts` | Format rupiah, tanggal Indonesia, excerpt |
| `lib/email.ts` | Kirim notifikasi via Resend; gagal = warning, bukan error fatal |
| `lib/rate-limit.ts` | Rate limit in-memory untuk login & endpoint messages |
| `lib/revalidate.ts` | Wrapper `revalidatePath()` yang dipanggil setiap mutasi admin |

### 4.3 Dependency Map

```
                    ┌───────────────────────────┐
                    │        app/**             │
                    │  (Route handlers, pages)  │
                    └─────────────┬─────────────┘
                                  │ import
                    ┌─────────────▼─────────────┐
                    │      lib/ (domain)        │
                    │  validation, slug, format │
                    │  auth, settings, revalidate│
                    └──────┬───────────┬────────┘
                           │           │
            ┌──────────────▼───┐   ┌───▼──────────────┐
            │  db/ (data)      │   │  services/ (ext) │
            │  schema, queries │   │  email (Resend)  │
            └──────────┬───────┘   └──────────────────┘
                       │
            ┌──────────▼───────────┐
            │ @neondatabase/       │
            │ serverless (HTTP)    │
            │ neon() tagged tmpl   │
            └──────────┬───────────┘
                       │ HTTPS (TLS, sslmode=require)
            ┌──────────▼───────────┐
            │   NEON POSTGRES      │
            └──────────────────────┘
```

Aturan dependency (dilarang): `lib/` **tidak boleh** meng-import dari `app/`. `db/` **tidak boleh** meng-import dari `lib/` maupun `app/`. Ini yang membuat query bisa diuji tanpa Next.js.

Dependency pihak ketiga per kelompok:

| Kelompok | Paket | Risiko |
| --- | --- | --- |
| Runtime web | `next`, `react`, `react-dom` | Patch otomatis oleh Vercel |
| Database | `@neondatabase/serverless` | Kompatibilitas versi API HTTP driver + perilaku escaping parameter |
| Auth | `jose` (JWT), `bcryptjs` (hash) | `jose` sudah pakai WebCrypto, aman di edge |
| Validasi | `zod` | Stabil, backward-compatible |
| UI | `lucide-react`, `clsx`, `tailwind-merge` | Low risk |
| Konten | `react-markdown`, `remark-gfm` | **Perhatikan**: konten post adalah input semi-tidak-tepercaya |
| Email | `resend` | Opsional, dimuat lazy agar bundle tidak naik |

---

## 5. Alur Request: Baca (Read Path)

```
1. Browser → GET /projects
2. Vercel Edge: cache miss → forward ke serverless function
3. Middleware: bukan /admin/* → lanjut, tanpa cek JWT
4. Route/RSC: panggil getPublishedProjects()
5. Data layer: query modul → neon HTTP driver → POST https://<ep>.neon.tech/neondb
   ├─ Query: SELECT ... FROM projects WHERE published = true ORDER BY sort_order
   └─ Index dipakai: idx_projects_published
6. Baris kembali → map ke objek domain (JSONB gallery/stack di-parse)
7. Render RSC → HTML streamed ke browser
8. Hasil disimpan di Next Data Cache + Full Route Cache (TTL sesuai `revalidate`)
9. Browser menerima HTML; hydration client hanya untuk interaksi
```

**Karakteristik penting:**

- **Tidak ada N+1.** Semua query publik diambil dalam satu round-trip HTTP (Neon HTTP driver mendukung multi-statement dalam satu request). Contoh: `/` fetching 6 entitas = 1 request DB, bukan 6.
- **Tidak ada komponen Client yang melakukan fetching.** Data masuk sebagai prop. Ini yang membuat TTFB rendah dan bundle kecil.
- **Cache read path membuat DB jarang dipanggil.** Dengan TTL 1 jam, satu hari = ±24 request DB per halaman, bukan ribuan.

### Cache hierarchy

```
Browser cache (ETag / Cache-Control)      ← 0 latency
   ↓
Vercel Edge CDN                            ← ~20 ms dari user
   ↓
Full Route Cache (per-path HTML)           ← ~50 ms
   ↓
Next Data Cache (per-fetch result)         ← ~50 ms
   ↓
Neon Postgres (HTTP query)                 ← ~60–150 ms (us-east-2 → iad1)
```

---

## 6. Alur Request: Tulis (Write Path)

Semua mutasi melewati **Server Action** (bukan REST API) untuk operasi internal admin. Ini memberi gratis: proteksi Origin/CSRF bawaan Next.js, progressive enhancement, dan satu tipe payload yang sama untuk form.

```
1. Admin buka /admin/projects → form terisi
2. Submit → POST ke Server Action (bukan ke URL baru)
3. Middleware: /admin/* → verifikasi cookie JWT
4. Server Action:
   a. requireAdmin()  — pastikan session valid (double-check di dalam action)
   b. parse FormData → validate dengan Zod → return error lebih awal jika invalid
   c. Query modul: INSERT/UPDATE ke Neon (raw SQL via tagged template)
   d. revalidatePath('/projects'); revalidatePath('/')
   e. revalidateTag('projects') bila memakai tag-based cache
   f. return { ok: true } atau { ok: false, errors }
5. Client component menampilkan toast sukses / error field
```

### Aturan mutasi (wajib dipatuhi)

1. **Selalu panggil `revalidatePath` setelah mutasi.** Tanpa ini, admin menyimpan perubahan tetapi pengunjung masih melihat versi lama selama TTL.
2. **`requireAdmin()` dipanggil di dalam action, bukan hanya di middleware.** Middleware bisa dilewati pada konfigurasi tertentu; defense in depth.
3. **Route-path yang direvalidasi harus mencakup semua halaman yang terpengaruh:**

   | Mutasi | `revalidatePath` |
   | --- | --- |
   | projects | `/`, `/projects`, `/projects/[slug]` |
   | posts | `/`, `/blog`, `/blog/[slug]` |
   | services | `/`, `/services` |
   | experiences | `/about`, `/` |
   | skills | `/about`, `/` |
   | testimonials | `/about`, `/` |
   | settings | `/`, `/about`, `/services`, `/contact`, `/blog`, `/projects` |
   | messages | `/admin/messages` |

4. **Transaksi DB dulu, revalidasi belakangan.** Kalau revalidasi gagal, data sudah aman di DB; kalau transaksi gagal, tidak ada revalidasi (tidak ada data basi).

### Form kontak (publik → tulis)

```
1. Pengunjung isi form di /contact
2. Submit → Server Action validateMessage()
3. Rate limit check (IP, max 5 / 10 menit)
4. Honeypot field terisi? → return sukses palsu, jangan simpan (anti-spam)
5. INSERT INTO messages (name, email, subject, budget, message, status='new')
6. Kirim email notifikasi via Resend (jika RESEND_API_KEY terisi)
   └─ Gagal? → log warning, jangan gagalkan request. Pesan sudah tersimpan di DB.
7. Tampilkan thank-you state
```

Kunci: **email adalah bonus, database adalah sumber kebenaran.** Admin tetap melihat pesan di `/admin/messages` walau Resend mati atau limit.

---

## 7. Caching & Revalidation

### 7.1 Strategi per jenis data

| Data | Cache | TTL | invalidated oleh |
| --- | --- | --- | --- |
| Halaman statis (`/about`) | Full Route | 3600s | revalidatePath manual |
| `/` | Full Route | 3600s | hampir semua mutasi |
| `/projects`, `/blog` | Full Route | 3600s | projects / posts |
| Query DB via `unstable_cache` | Data Cache | 3600s | `revalidateTag` |
| `settings` | Data Cache (tag: `settings`) | 86400s | revalidateTag('settings') |
| `/admin/*` | **Tidak ada cache** | — | selalu fresh |
| `/contact` | `dynamic` | — | form butuh input |
| Route handler `/api/*` | header `Cache-Control` manual | 60–300s | manual |

### 7.2 Tag-based invalidation

Untuk data yang dipakai banyak halaman (terutama `settings`), gunakan tag agar invalidasi precise:

```ts
// server action
await db.update(settings).set({ value, updated_at: new Date() })
  .where(eq(settings.key, key));
revalidateTag('settings', 'max');     // invalidasi semua fetch bertag 'settings'
revalidatePath('/', 'layout');          // bersihkan route cache subtree
```

`revalidatePath('/', 'layout')` adalah Senjata yang berguna: ia membersihkan seluruh subtree dari path tersebut, sehingga `/`, `/about`, `/services`, `/contact` hilang dari cache sekaligus.

### 7.3 On-demand revalidation (opsional)

Untuk memicu rebuild dari luar (mis. webhook CI setelah migrasi):

```
POST /api/revalidate
Headers: x-revalidate-secret: <REVALIDATE_SECRET>

Body: { "paths": ["/", "/projects"], "tags": ["settings"] }
```

Secret dibandingkan dengan `crypto.timingSafeEqual` (wajib — bukan `===`).

---

## 8. Environment Variables

Semua env var disimpan di **Vercel → Settings → Environment Variables**, dipisah per environment (Production / Preview / Development). Tidak ada `.env` yang masuk ke git.

| Variabel | Wajib | Contoh / Format | Dipakai oleh | Catatan |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | ✅ | `postgresql://USER:PASS@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` | Klien Neon | **Gunakan pooled connection string** untuk runtime. Direct URL hanya untuk migrasi |
| `AUTH_SECRET` | ✅ | 32+ char random (`openssl rand -base64 32`) | jose | HS256 signing key. Rotasi = semua sesi logout |
| `ADMIN_EMAIL` | ✅ | `admin@domainmu.com` | seed script | Akun admin pertama |
| `ADMIN_PASSWORD` | ✅ | (strong, ≥12 char) | seed script | Hanya dipakai sekali saat seeding |
| `RESEND_API_KEY` | ❌ | `re_xxx` | email.ts | Kosong = email dimatikan, form tetap jalan |
| `CONTACT_TO_EMAIL` | ❌ | `admin@domainmu.com` | email.ts | Tujuan notifikasi inquiry |
| `CONTACT_FROM_EMAIL` | ❌ | `Portfolio <onboarding@resend.dev>` | email.ts | Wajib domain terverifikasi agar tidak masuk spam |
| `REVALIDATE_SECRET` | ❌ | random string | `/api/revalidate` | Bila kosong, endpoint 404 |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://domain.com` | metadata, sitemap | Dipakai canonical URL & sitemap.xml |

### Aturan pengelolaan secret

- Tidak ada secret yang di-bundle ke klien. `NEXT_PUBLIC_*` **hanya** untuk nilai yang memang publik (URL situs).
- Preview deployments memakai env Production untuk `DATABASE_URL`? **Jangan.** Override ke branch Neon dev — kecuali sengaja, preview akan menulis ke database produksi.
- Catatan: `AUTH_SECRET` di Development boleh berbeda dari Production. Yang penting Production konsisten antar function.
- Rotasi `AUTH_SECRET`: ubah di Vercel → deploy → semua admin forced re-login. Tidak merusak data.

---

## 9. Skala & Limit Neon

### 9.1 Batas yang relevan

| Parameter | Free plan | Paid plan | Catatan |
| --- | --- | --- | --- |
| Compute size | 0.25 CU | 1–4 CU | CU = Compute Unit; 1 CU ≈ 1 vCPU + 4 GB RAM |
| Branch | 1 (bisa di-fork ke dev gratis) | Unlimited | |
| Database storage | 0.5 GB | 100 GB | 9 tabel portofolio ≈ < 10 MB |
| Data transfer | 5 GB/bulan | 100 GB/bulan | Kritis: query berulang = transfer besar |
| Compute time | 100 jam/bulan | 500 jam/bulan | |
| Auto-suspend | 5 menit idle | 5 menit idle | Cold start 100–300 ms |

### 9.2 Analisis untukuse case ini

Portfolio dengan 10 ribu page view/bulan ≈ 10.000 read + 200 write:

- **Read**: 10.000 query × 5 KB hasil ≈ 50 MB transfer → **1% dari kuota Free**.
- **Write**: 200 insert/update ≈ 1 MB → **0,02%**.
- **Compute time**: auto-suspend 5 menit, traffic tersebar sepanjang hari → ±2 jam/bulan. **2% dari kuota.**

Artinya: **Free plan cukup hingga ~50–100 ribu page view/bulan.** Di titik itu, yang lebih mungkin menjadi masalah adalah kuota *data transfer* Vercel, bukan Neon.

### 9.3 Strategi penskalaan

| Situasi | Tindakan |
| --- | --- |
| PV < 50rb/bulan | Free plan, tanpa intervensi |
| PV 50rb–500rb | Neon Scale (1 CU), aktifkan cache tag yang lebih agresif |
| PV > 500rb | Neon 2–4 CU + **Neon read replicas** via pooling PgBouncer, atau pindahkan ke Supabase/RDS |
| Query lambat | Tambah index komposit, kurangi `SELECT *`, pakai agregasi di SQL |
| Volume tulis naik | Batch insert, kurangi revalidasi berlebihan |

**Titik paling penting untuk dihindari: `SELECT *` pada tabel besar.** `projects`/`posts` bisa mencapai ratusan baris, tapi `SELECT *` tanpa `LIMIT` pada `posts` yang nanti di-paginate akan menarik seluruh kolom `content` (besar) ke memori serverless. **Selalu pilih kolom eksplisit + `LIMIT`/`OFFSET`.**

---

## 10. Monitoring & Logging

### 10.1 Stack observability

| Tool | Fungsi | Biaya |
| --- | --- | --- |
| Vercel Analytics | Traffic, Core Web Vitals, Real User Monitoring | Free tier |
| Vercel Observability / Logs | Request log, function duration, error stack | Free tier |
| Neon Dashboard | Query history, locks, branch status, storage | Free tier |
| Vercel Speed Insights | Field data (opsional) | Free |

### 10.2 Metrik yang dipantau

| Metrik | Ambang alert | Tindakan |
| --- | --- | --- |
| Error rate 5xx | > 1% dalam 5 menit | Cek log Vercel → kemungkinan DB down atau bug deploy |
| Function duration p95 | > 3 detik | Cek query lambat + region |
| Neon compute time | > 80% kuota | Upgrade plan / optimalkan query |
| Data transfer | > 80% kuota | Kurangi query, perpanjang TTL cache |
| Message submit gagal | > 3/hr | Cek Resend + rate limit |
| Admin login gagal | > 10 dari IP sama | Indikasi brute force → blokir IP |

### 10.3 Struktur log

Log memakai format JSON satu baris agar bisa dicari (Vercel Logs support filter):

```json
{
  "ts": "2026-11-04T09:14:22.481Z",
  "level": "info",
  "event": "admin.project.update",
  "actor": "admin@domainmu.com",
  "entity": "project",
  "id": "0d3f...",
  "slug": "analytics-dashboard",
  "duration_ms": 42,
  "request_id": "req_9f2c"
}
```

Event yang **wajib** di-log:

| Event | Data |
| --- | --- |
| `auth.login.success` / `auth.login.failed` | email, ip, ua, reason |
| `auth.logout` | email |
| `admin.<entity>.create/update/delete` | actor, id, slug, field yang berubah |
| `admin.settings.update` | actor, key |
| `message.submit` | message_id, ip (tanpa isi pesan) |
| `email.send.failed` | to, error |
| `db.query.error` | query name, error, duration |

### 10.4 Alerting

Pakai Vercel Observability → Slack/Discord webhook, atau **cron ping** sederhana: satu route handler `/api/health` yang mengecek `SELECT 1` ke Neon, dipanggil tiap 5 menit oleh **Vercel Cron**. Kalau gagal → HTTP 503 → pemantau uptime memberi tahu.

> Vercel Hobby mengizinkan Cron **harian saja**. Pakai Polar/UptimeRobot (gratis) untuk pemeriksaan 5 menit.

---

## 11. Failure Modes & Fallback

Ini bagian terpenting dari dokumen ini. Setiap mode kegagalan di bawah memiliki perilaku yang telah ditentukan.

### 11.1 Matriks kegagalan

| # | Gagal | Dampak | Perilaku aplikasi | Mitigasi |
| --- | --- | --- | --- | --- |
| F1 | **Neon down / tidak terjangkau** | Halaman publik kosong | **Fallback ke cache**: RSC menangkap error DB dan merender dari `Next Data Cache`/ISR terakhir. Jika tidak ada cache → render shell minimal + banner "Sedang ada gangguan sesaat" | `unstable_cache` TTL panjang untuk settings; page-level `try/catch` dengan fallback |
| F2 | Neon cold-start lambat | TTFB naik 100–300 ms | Normal, transparan | Auto-suspend 5 menit cukup; tidak perlu SSR permanen |
| F3 | Rate limit database (too many connections) | Error 500 saat write | Tampilkan pesan "Sibuk, coba lagi" | Gunakan **pooled connection string** (PgBouncer), bukan direct URL |
| F4 | Resend mati / limit | Email inquiry tidak terkirim | **Sukses tetap**. Pesan sudah di DB | `try/catch` di `lib/email.ts`, log warning, admin tetap melihat di `/admin/messages` |
| F5 | Build Vercel gagal | Deploy tertahan | Produksi tidak berubah (tetap versi lama) | Preview deployment sebagai jaring pengaman; `vercel --prod` untuk rollback |
| F6 | Cookie JWT kedaluwarsa | Admin terlempar ke login | Redirect `/admin/login?next=...` | UX: tampilkan notifikasi "sesi berakhir" |
| F7 | `AUTH_SECRET` bocor | Sesi bisa dipalsukan | Rotasi seketika | Secret di Vercel, tidak pernah di repo; rotasi = logout massal |
| F8 | Vercel downtime | Situs tidak dapat diakses | 503 dari platform | Status page Vercel; domain tetap milikmu |
| F9 | Konten post berisi script berbahaya | XSS | React escape otomatis; markdown di-sanitize | `react-markdown` tanpa `rehype-raw`; sanitasi URL skema |
| F10 | Spam pada form kontak | Kotak masuk penuh | Honeypot + rate limit | Honeypot field, rate limit per IP, verifikasi email belum dipakai |
| F11 | Migration gagal di tengah jalan | Skema tidak sinkron | Rollback via `DROP`/restore branch | Jalankan migrasi di branch Neon dulu, lalu branch ke main |
| F12 | Kredensial bocor di log | Akunzy compromise | `.env` tidak pernah di-log | Redaksi `DATABASE_URL` di log |

### 11.2 Strategi fallback DB (detail F1)

Pola yang dipakai di setiap query layer:

```ts
// lib/data/with-fallback.ts — pola generik
export async function withFallback<T>(
  key: string,
  fetcher: () => Promise<T>,
  fallback: T | null = null,
): Promise<T | null> {
  try {
    return await fetcher();
  } catch (err) {
    log.error({ event: 'db.fallback', key, err });
    // cache hit → Next.js sudah meng-return cache lama bila configured via unstable_cache
    return fallback;
  }
}
```

Prinsipnya:

1. **Data statis (settings, about, testimonials)**: `unstable_cache` dengan `revalidate: 86400`. Saat DB mati, Next.js menyajikan hasil cache terakhir tanpa menyentuh DB sama sekali.
2. **Data dinamis (projects, posts)**: `unstable_cache` dengan `revalidate: 3600`. Bila tidak ada cache, komponen mengembalikan array kosong dan halaman tetap render dengan benar (hanya daftar yang kosong).
3. **Halaman yang wajib tampil**: hero, navigasi, footer, kontak — berasal dari `settings`, jadi hampir selalu punya cache.
4. **Admin**: TIDAK ada fallback. Admin harus melihat error yang jujur, bukan data basi. Menampilkan daftar proyek lama sementara simpan gagal adalah lebih berbahaya daripada error.

### 11.3 Error boundary

| Lokasi | Perilaku |
| --- | --- |
| `app/error.tsx` | Error boundary segment-level. Tampilkan pesan + tombol "Coba lagi". Hanya untuk halaman publik. |
| `app/admin/error.tsx` | Error boundary admin. Tampilkan detail teknis (aman untuk admin) + tombol ke dashboard. |
| `app/not-found.tsx` | 404 kustom. Untuk slug yang tidak ada, atau draft yang diakses publik. |
| `app/global-error.tsx` | Error terakhir sebelum root layout gagal. Minimal HTML, tetap 500. |
| `app/admin/(dashboard)/loading.tsx` | Skeleton saat data dashboard sedang diambil. Sengaja tidak dipasang di root: `loading.tsx` di root membuat Next.js mengirim shell HTTP 200 lebih dulu, sehingga `notFound()` kehilangan status 404-nya. |

### 11.4 Runbook kegagalan (ringkas)

**Situs publik 500 / kosong**
1. Cek Vercel → Deployments → deployment terakhir berhasil?
2. Cek Vercel Logs → pesan error apa? (umumnya `ECONNREFUSED` / `NeonError` / `Too many connections`)
3. Cek Neon Dashboard → branch `main` aktif? Compute tersuspend normal?
4. Cek `DATABASE_URL` di Vercel → masih valid? (berubah kalau password dirotasi di Neon)
5. Rollback deploy: `vercel rollback` atau redeploy versi sebelumnya.

**Admin tidak bisa login**
1. Cek `AUTH_SECRET` ada & sama antar environment?
2. Cek baris `users` di Neon: `SELECT email, role FROM users;` — `password_hash` terisi?
3. Cek log `auth.login.failed` → reason-nya apa (invalid password / JWT error / user not found)?
4. Rate limit IP yang terlalu agresif? Tunggu 10 menit atau restart function.

**Konten berubah tapi situs tidak berubah**
1. `revalidatePath` dipanggil di mutasi yang relevan? (bug paling sering)
2. Cache TTL masih aktif? Tunggu TTL atau panggil `/api/revalidate` dengan secret.
3. Deploy terbaru sudah menyertakan perubahan itu? (lupa push/deploy)

---

## 12. Backup & Recovery (Neon Branching)

Neon menyediakan branch = salinan database lengkap, dan branch **bukan** backup tradisional (bisa berubah). nonetheless invaluable untuk recovery dan testing.

### 12.1 Strategi branch

| Branch | Sumber | Tujuan | Umur |
| --- | --- | --- | --- |
| `main` | — | Produksi | Permanen |
| `dev` | `main` | Development lokal, uji migrasi, testing | Permanen, reset dari main sesekali |
| `staging` | `main` | Preview dengan migrasi realistis | Dihapus setelah merge |
| `backup-<YYYYMMDD>` | `main` | Snapshot sebelum migrasi berisiko | 7–30 hari, lalu dihapus |

### 12.2 Cara membuat backup

**Neon Dashboard:**
```
Branches → New Branch → Name: backup-20261104 → Base: main → Create
```

**CLI:**
```bash
neon branches create --project <project-id> --name backup-20261104 --parent main
```

Biaya: branch di luar kuota tetap dihitung pada storage & compute — hapus branch lama secara berkala.

### 12.3 Restore

```
1. Neon Dashboard → Branches → pilih backup-20261104
2. tombol "Promote" / atau: git-branch-with-schema
   - Neon dapat promote branch menjadi main (perlu swap connection string)
   - Alternatif lebih aman: restore ke branch baru, lalu salin data
3. Update DATABASE_URL di Vercel bila main yang di-promote
4. Deploy ulang
```

> **Penting**: backup branch bukan substitute PITR (Point-In-Time Recovery). Untuk pemulihan data yang salah hapus 10 menit lalu, andalkan **Neon PITR** (fitur berbayar) yang menyimpan log WAL. Branch = coarse checkpoint; PITR = fine-grained recovery.

### 12.4 Kapan wajib ambil backup

| Pemicu | Tindakan |
| --- | --- |
| Sebelum migrasi schema | Buat branch `backup-YYYYMMDD` |
| Sebelum `db:reset` | WAJIB — `db:reset` menghapus seluruh data |
| Sekali per minggu (rutin) | Otomatis: scheduled branch via Neon API |
| Sebelum import data massal | Branch dulu |

### 12.5 Ekspor SQL (portabilitas)

Neon menyediakan export logical:

```bash
neon databases export --project-id <id> --branch main --output dump.sql
```

Gunanya: arsip offsite (S3/GitHub Release), dan recovery kalau harus pindah provider.

---

## 13. Alur Kerja Deployment

### 13.1 Preview → Production

```
git checkout -b feature/fitur-baru
# ... ubah kode ...
npm run typecheck                 # tsc --noEmit, wajib lolos
npm run build                     # next build, wajib lolos
git push origin feature/fitur-baru
  → Vercel otomatis build preview URL
  → Preview memakai branch Neon 'staging' (atau read-only prod untuk konten)
  → Review manual + smoke test: / , /projects , /admin/login , /contact
git checkout main && git merge feature/fitur-baru && git push
  → Vercel build production
  → Smoke test ulang
```

### 13.2 Migrasi database

```bash
# 1. Pastikan branch dev sudah sync dengan main
neon branches create --name staging-$(date +%Y%m%d) --parent main

# 2. Jalankan migrasi terhadap branch staging
DATABASE_URL="postgresql://...staging..." npm run db:migrate

# 3. Uji aplikasi terhadap staging (Vercel preview + env override)

# 4. Terapkan ke main
DATABASE_URL="postgresql://...main..." npm run db:migrate

# 5. Bersihkan branch staging
```

Aturan: **migrasi harus backward-compatible.** Kolom baru nullable/default, kolom lama tidak langsung di-drop dalam migrasi yang sama (expand → migrate → contract, tiga langkah terpisah).

### 13.3 Rollback

| Jenis masalah | Aks |
| --- | --- |
| Bug di kode | Vercel Dashboard → deployment → **Promote to Production** (instant) |
| Bug di migrasi | `npm run db:migrate:rollback`, atau restore branch backup |
| Konten rusak | Restore nilai `settings` dari branch backup via SQL `UPDATE` |
| Semua gagal | Restore branch backup → update `DATABASE_URL` → deploy |

---

## 14. Checklist Implementasi Arsitektur

Sebelum rilis produksi:

- [ ] Middleware melindungi `/admin/*` dan mengarahkan ke `/admin/login`
- [ ] `requireAdmin()` juga dipanggil di dalam setiap Server Action
- [ ] Semua query publik punya TTL cache yang wajar
- [ ] Semua mutasi memanggil `revalidatePath` untuk path yang benar
- [ ] `settings` dibaca lewat cache bertag `settings`
- [ ] Zod memvalidasi setiap input server action
- [ ] Tidak ada string SQL mentah
- [ ] Header keamanan terpasang (lihat `security-design.md`)
- [ ] Rate limit aktif di `/admin/login` dan POST `/api/messages`
- [ ] Honeypot pada form kontak
- [ ] `RESEND_API_KEY` kosong → sistem tetap jalan (tested)
- [ ] Neon down → halaman publik tetap render dari cache (tested)
- [ ] Branch `dev` dibuat & env preview diarahkan ke sana
- [ ] `npm run typecheck` dan `npm run build` hijau
- [ ] Sitemap + robots.txt + metadata OG terisi
- [ ] Error boundary terpasang di segment publik & admin
- [ ] `/api/health` ada untuk monitoring uptime
- [ ] Backup branch dibuat sebelum migrasi pertama ke produksi

---

## 15. Dokumen Terkait

| Dokumen | Isi |
| --- | --- |
| `database-schema.md` | ERD, definisi kolom, indeks, strategi settings, migrasi, seed |
| `api-specification.yaml` | OpenAPI 3.1 — kontrak endpoint |
| `security-design.md` | Threat model, kontrol keamanan, insiden, kepatuhan |
| `../05-PLANNING/roadmap.md` | Peta fase dan milestone |
| `../../db/schema.sql` | DDL sumber kebenaran |
| `../../db/seed.sql` | Data awal |
