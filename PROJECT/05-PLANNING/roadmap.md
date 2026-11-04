---

## 1. Ringkasan Eksekutif

Roadmap ini memecah pembangunan produk menjadi **5 fase** dengan batas keluar (*exit criteria*) yang terukur. Setiap fase punya satu nilai yang bisa diverifikasi:

| Fase | Nilai yang dihasilkan |
| --- | --- |
| F0 Discovery | Kepastian scope: tidak ada lagi "mungkin" |
| F1 MVP | Portofolio yang bisa dibagikan lewat link |
| F2 Polish | Site yang dipercaya HRD & calon klien |
| F3 Monetize | Lead masuk & tawaran harga yang konkret |
| F4 Scale | Aset jangka panjang: aman, terukur, bisa dipulihkan |

Prinsip kerja yang dipakai di seluruh roadmap:

1. **Public-first.** Halaman publik harus hidup sebelum panel admin selesai. Konten awal diisi lewat `db/seed.sql`; panel admin dibangun setelah situs terbukti bernilai.
2. **Deploy hari pertama.** Integrasi Neon + Vercel dilakukan di Fase 1, bukan ditunda. Menunda deploy hanya menambah risiko integrasi di akhir.
3. **Konten adalah fitur.** Kecepatan admin meng-update konten adalah fitur produk, bukan detail teknis.
4. **Setiap fase berakhir dengan sesuatu yang bisa dijual.** Tidak ada fase yang hanya menghasilkan "kode yang rapi".
5. **Risiko dipindah lebih awal.** Integrasi pihak ketiga (Neon, Vercel, Resend) diuji pada Fase 1, bukan Fase 3.
6. **Raw SQL, bukan ORM.** Sesuai implementasi aktual (`src/lib/db.ts` → `neon()` HTTP driver + `query()`/`queryOne()`/`execute()`). Query tetap wajib ter-parameterisasi (`$1`, `$2`): tidak ada interpolasi string.

---

## 2. Peta Fase (Ringkasan)

| Fase | Nama | Durasi | Minggu | Deliverable utama | Nilai yang dihasilkan |
| --- | --- | --- | --- | --- | --- |
| F0 | Discovery | 2 minggu | M1–M2 | Dokumen kebutuhan, ERD final, wireframe, repo & CI siap | Kepastian scope |
| F1 | MVP | 5 minggu | M3–M7 | Situs publik live + auth admin + CRUD inti | Portofolio yang bisa dibagikan |
| F2 | Polish | 3 minggu | M8–M10 | Desain matang, SEO lengkap, dark mode, a11y & performa | Site yang dipercaya HRD & klien |
| F3 | Monetize | 4 minggu | M11–M14 | Halaman harga/paket, form inquiry, email, konversi terukur | Lead masuk & tawaran harga |
| F4 | Scale | 6+ minggu | M15–M20+ | Blog, analytics, 2FA, backup, monitoring, audit log | Aset jangka panjang |

Total: **20 minggu** untuk F0–F4, dengan Fase Scale dirancang untuk berlanjut tanpa batas tetap.

### 2.1 Peta Modul (Rute)

**Publik (8):** `/` · `/projects` · `/projects/[slug]` · `/blog` · `/blog/[slug]` · `/about` · `/services` · `/contact`

**Admin (10):** `/admin/login` · `/admin` · `/admin/projects` · `/admin/posts` · `/admin/services` · `/admin/experience` · `/admin/skills` · `/admin/testimonials` · `/admin/messages` · `/admin/settings`

### 2.2 Peta Tabel Database

`users` · `settings` (key/value JSONB) · `projects` · `posts` · `services` · `experiences` · `skills` · `testimonials` · `messages`

---

## 3. Fase 0: Discovery (Minggu 1–2)

### Tujuan
Membuang ambiguitas sebelum kode ditulis: memastikan *apa* yang dibangun dan *mengapa*.

### Deliverable

| # | Deliverable | Bentuk | Lokasi |
| --- | --- | --- | --- |
| D0.1 | Problem statement & persona | Markdown | `PROJECT/01-RESEARCH/problem-statement.md` |
| D0.2 | Requirements fungsional & non-fungsional | Markdown | `PROJECT/02-REQUIREMENTS/` |
| D0.3 | ERD & skema database final | SQL | `db/schema.sql` |
| D0.4 | Seed data konten contoh | SQL | `db/seed.sql` |
| D0.5 | Design system tokens (warna, tipografi, spacing) | Referensi visual | `PROJECT/03-DESIGN/design-system.md` |
| D0.6 | Wireframe 8 halaman publik + 10 halaman admin | Referensi visual | `PROJECT/03-DESIGN/user-flow.md` |
| D0.7 | Repo Git + CI baseline (lint, typecheck, test, build) | GitHub | `.github/workflows/` |
| D0.8 | Kontrak environment variables | Markdown | `.env.example` |
### Exit Criteria (Fase 0)

- [ ] ERD disetujui; seluruh 9 tabel punya kolom, tipe, default, dan index yang terdefinisi di `db/schema.sql`.
- [ ] Skema `db/schema.sql` dapat dijalankan bersih di Neon tanpa error (sudah diuji di branch `dev`).
- [ ] `db/seed.sql` mengisi ≥ 1 admin, 4 project, 2 post, 3 service, 3 experience, 10 skill, 3 testimonial.
- [ ] Requirements fungsional memuat semua 8 rute publik dan 10 rute admin dengan acceptance criteria.
- [ ] CI GitHub Actions hijau pada branch `main` (lint + typecheck + test + build).
- [ ] Script `npm run db:setup` idempotent: dijalankan dua kali tidak menduplikasi data.
- [ ] `.env.example` memuat variabel wajib: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`.
- [ ] Domain dan nama proyek dikonfirmasi.

### Milestone
**M1** (akhir M1): Dokumen kebutuhan + ERD draft disetujui.
**M2** (akhir M2): Repo + CI + schema + seed siap; Fase 1 dimulai.

---

## 4. Fase 1: MVP (Minggu 3–7)

### Tujuan
Situs **publik yang hidup** + **panel admin yang bisa dipakai** untuk konten inti. Ini fase paling kritikal: bila fase ini gagal, tidak ada fase berikutnya yang berarti.

### Deliverable

| # | Deliverable | Detail |
| --- | --- | --- |
| D1.1 | Setup Next.js 15 App Router | TypeScript strict, Tailwind v4, ESLint, folder `src/app` |
| D1.2 | Koneksi Neon raw SQL | `src/lib/db.ts`: `neon()` HTTP driver, `query()`/`queryOne()`/`execute()` |
| D1.3 | Auth admin | Login bcryptjs (cost 10), JWT HS256 via `jose`, cookie `portfolio_session` |
| D1.4 | Halaman publik | `/`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/about`, `/services`, `/contact` |
| D1.5 | CRUD `projects` | List, form create/edit, delete, publish toggle, featured, sort_order || D1.6 | CRUD `posts` | List, form dengan editor markdown, publish toggle, published_at |
| D1.7 | CRUD `services` | List, form harga (`price_label`, `price_value`, `currency`), features JSONB |
| D1.8 | CRUD `experiences`, `skills`, `testimonials` | Form sederhana, publish toggle, urutan (`sort_order`) |
| D1.9 | Panel settings | Edit key/value: `site`, `theme`, `sections`, `socials`, `seo`, `features`, `footer` |
| D1.10 | Viewer pesan | `/admin/messages` list + detail + ubah status (`new`/`read`/`archived`) |
| D1.11 | Dashboard admin | Ringkasan jumlah project, post, service, pesan baru |
| D1.12 | Deploy produksi | Vercel + domain + environment variables + SSL aktif |

### Exit Criteria (Fase 1)

- [ ] `npm run build` sukses tanpa error TypeScript.
- [ ] Semua 8 rute publik merespons HTTP 200 dan terhubung ke data nyata dari Neon (bukan data dummy di memori).
- [ ] `slug` tidak duplikat; navigasi list → detail → edit → kembali ke list mulut utuh.
- [ ] Rute `/admin/*` tanpa cookie valid **mengalihkan** ke `/admin/login` (bukan 500, bukan blank).
- [ ] Password salah menampilkan pesan error generik ("Email atau password salah."); hash dan stack trace tidak pernah muncul di respons.
- [ ] Timing-constant login: bcrypt dijalankan walau email tidak ditemukan: ada tes yang menutupi ini.
- [ ] Admin dapat mengubah `site.heroTitle` di settings dan perubahan terlihat di beranda **tanpa deploy ulang**.
- [ ] Section toggle di `settings.sections` benar-benar menyembunyikan section di halaman publik.
- [ ] Semua query DB ter-parameterisasi (`$1`, `$2`): diverifikasi lewat review kode, nol interpolasi string.
- [ ] Deployment produksi terpasang di domain sendiri dengan HTTPS aktif.
- [ ] Checklist smoke test di `../06-QUALITY/test-plan.md` (§8) lulus 100%.

### Milestone
**M3** (akhir M3): Next.js + Neon tersambung; seed terbaca di dev.
**M4** (akhir M4): Auth admin bekerja; proteksi route terverifikasi.
**M5** (akhir M5): 8 halaman publik live dengan data seed.
**M6** (akhir M6): CRUD projects, posts, services, settings lengkap.
**M7** (akhir M7): **Deploy produksi pertama**; MVP diumumkan ke jaringan.
---

## 5. Fase 2: Polish (Minggu 8–10)

### Tujuan
Mengubah "situs yang berfungsi" menjadi "situs yang membuat orang percaya". Fokus: kualitas visual, discoverability, aksesibilitas, dan kecepatan.

### Deliverable

| # | Deliverable | Detail |
| --- | --- | --- |
| D2.1 | Design system penuh | Token warna accent/secondary, dark mode, radius, font Geist, grid dekoratif |
| D2.2 | Komponen publik | Hero, SectionHeading, ProjectCard, PostCard, ServiceCard, SkillBar, Timeline, TestimonialCard, CTA |
| D2.3 | Halaman detail | `/projects/[slug]` dengan gallery, stack, repo/live link; `/blog/[slug]` dengan markdown + TOC |
| D2.4 | Dark mode | Toggle persist (localStorage), respect `prefers-color-scheme`, tanpa flash |
| D2.5 | Section toggle penuh | Semua 11 toggle di `settings.sections` terpasang di 8 rute publik |
| D2.6 | SEO | `generateMetadata` per rute, Open Graph, Twitter Card, canonical, JSON-LD |
| D2.7 | Sitemap & robots | `sitemap.xml` dinamis, `robots.txt`, `manifest.webmanifest` |
| D2.8 | OG image | `opengraph-image.tsx` generik dengan template Next.js |
| D2.9 | Upload gambar | Upload ke Vercel Blob atau Cloudinary, preview, optimasi `next/image` |
| D2.10 | Editor markdown | Editor dengan preview, toolbar, sanitasi HTML, paste gambar |
| D2.11 | Paginasi & filter | `/projects` dan `/blog` paginasi + filter kategori/tag |
| D2.12 | Audit a11y | Axe score ≥ 95, keyboard navigation penuh, kontras AA |
| D2.13 | Performance budget | Lighthouse Performance ≥ 90 mobile; LCP < 2,5s, CLS < 0,1, INP < 200ms |
| D2.14 | Konten riil | Ganti seluruh seed dengan project, testimonial, dan harga asli |
### Exit Criteria (Fase 2)

- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100.
- [ ] Axe: 0 violation kritis/serious di seluruh 8 rute publik.
- [ ] Dark mode tidak menimbulkan hydration mismatch (dicek via console browser).
- [ ] `sitemap.xml` memuat seluruh URL publik; `robots.txt` valid dan `/admin` di-disallow.
- [ ] Setiap halaman punya OG image valid (dicek validator Facebook/LinkedIn).
- [ ] Admin dapat upload cover project dan gambar muncul di halaman publik.
- [ ] Placeholder `Nama Kamu` dan `domainmu.com` **tidak lagi** muncul di halaman produksi.
- [ ] 320px hingga 1920px tidak ada horizontal scroll.

### Milestone
**M8** (akhir M8): Design system + komponen publik selesai; beranda direvisi penuh.
**M9** (akhir M9): SEO, sitemap, OG image, upload gambar, editor markdown aktif.
**M10** (akhir M10): Audit a11y & performa lulus; konten asli menggantikan seed.

---

## 6. Fase 3: Monetize (Minggu 11–14)

### Tujuan
Mengubah pengunjung menjadi **lead berbayar**. Fokus: harga transparan, jalur konversi tanpa friksi, dan notifikasi pesan masuk.

### Deliverable

| # | Deliverable | Detail |
| --- | --- | --- |
| D3.1 | Halaman `/services` matang | Paket harga, perbandingan fitur, badge "Paling Populer", CTA per paket |
| D3.2 | Pricing section di beranda | Section `pricing` toggle-able, menampilkan paket + harga |
| D3.3 | Form kontak lengkap | Nama, email, subjek, budget, pesan, validasi Zod, honeypot, timestamp min 3 detik |
| D3.4 | Spam guard | Honeypot field + rate limit IP + deteksi pola tautan |
| D3.5 | Route API pesan | `POST /api/contact` menyimpan ke tabel `messages`, validasi server-side |
| D3.6 | Notifikasi email | Kirim via Resend ke `CONTACT_TO_EMAIL` saat pesan baru masuk |
| D3.7 | CTA "Hire Me" | Tombol yang bisa diubah teks/tautan dari `settings.features` |
| D3.8 | Halaman thank-you | `/contact?sent=1` menampilkan konfirmasi + langkah berikutnya || D3.9 | Paket & harga | Minimal 3 paket dengan `price_value` numerik + `price_label` + `currency` IDR |
| D3.10 | Testimonial gating | Hanya tampilkan testimonial `published = true` |
| D3.11 | Copywriting penjualan | Hero, CTA, dan copy `/services` ditulis untuk konversi, bukan teknis |
| D3.12 | Pelacakan konversi | Event analytics untuk klik CTA dan submit form |

### Exit Criteria (Fase 3)

- [ ] Submit form kontak valid → pesan tersimpan di `messages` **dan** email notifikasi diterima.
- [ ] Submit form dengan honeypot terisi → ditolak, **tidak** ada baris baru di `messages`.
- [ ] Submit > 5 pesan dari IP sama dalam 10 menit → diblokir (429) dengan pesan ramah.
- [ ] Pesan invalid (email salah karakter) ditolak dengan pesan ramah per-field, tanpa stack trace.
- [ ] `RESEND_API_KEY` kosong → form tetap sukses (pesan masuk DB, notifikasi dilewati, warning di log).
- [ ] Halaman `/services` menampilkan ≥ 3 paket dengan harga dan minimal 1 paket bertanda popular.
- [ ] Semua CTA menuju ke `/contact` atau form langsung; tidak ada tombol mati.
- [ ] 1 minggu setelah rilis: minimal 3 lead masuk atau 1 inquiry (diukur lewat dashboard pesan).
- [ ] Funnel event CTA terkirim ke analytics.

### Milestone
**M11** (akhir M11): Halaman harga + copy penjualan selesai.
**M12** (akhir M12): Form kontak + spam guard + route API + penyimpanan pesan live.
**M13** (akhir M13): Email notifikasi aktif & terverifikasi.
**M14** (akhir M14): Funnel terukur; halaman konversi dioptimasi 1 iterasi.
---

## 7. Fase 4: Scale (Minggu 15–20+)

### Tujuan
Menjadikan situs sebagai **aset jangka panjang**: aman, terukur, bisa dipulihkan, dan punya kedalaman konten yang bisa diindeks mesin pencari.

### Deliverable

| # | Deliverable | Detail |
| --- | --- | --- |
| D4.1 | Blog matang | Editor markdown lengkap, tag, related posts, RSS feed, sindikasi |
| D4.2 | Dashboard statistik | Grafik pesan masuk 30 hari, project views, top post, konversi |
| D4.3 | Search & filter admin | Pencarian full-text + filter status/tanggal/kategori di semua list admin |
| D4.4 | Audit log | Tabel `audit_logs`: aksi, actor, entitas, id, timestamp, IP |
| D4.5 | Rate limit | Limiter berbasis token bucket untuk route API publik & login |
| D4.6 | 2FA (TOTP) | QR + secret base32, recovery code, verifikasi di login |
| D4.7 | Multi-user | Tabel `users` dengan role `admin`/`editor` + pembatasan aksi per role |
| D4.8 | Export / import backup | Ekspor JSON semua tabel; impor dengan mode merge atau replace |
| D4.9 | Backup otomatis | Cron harian (Vercel Cron) → dump ke object storage |
| D4.10 | Monitoring & uptime | UptimeRobot / Better Stack, Vercel Analytics, alerting error |
| D4.11 | Deploy preview | Preview deployment per PR dengan database branch Neon |
| D4.12 | a11y & performa lanjutan | Budget Lighthouse dikunci di CI; audit dependensi otomatis |
| D4.13 | Konten berkelanjutan | 2 artikel/minggu + 1 case study per bulan |
### Exit Criteria (Fase 4)

- [ ] Audit log mencatat create/update/delete untuk semua entitas, dengan nama aktor.
- [ ] Admin `editor` tidak bisa mengubah `settings` role/akun (diverifikasi via tes).
- [ ] 2FA aktif dan login tetap berhasil dengan kode TOTP yang benar; recovery code sekali pakai.
- [ ] Ekspor JSON berisi seluruh entitas; impor restore menghasilkan data identik.
- [ ] Restore backup teruji minimal 1 kali ke database branch dan hasil compare = identik.
- [ ] Uptime monitor aktif dengan alerting ke email; alert diuji manual.
- [ ] PR menghasilkan preview URL dengan schema terisolasi (tidak menyentuh data produksi).
- [ ] RSS feed valid dan lolos validator feed.
- [ ] Biaya bulanan tetap di bawah ambang yang disepakati (lihat `../07-DEPLOYMENT/deployment-plan.md` §10).

### Milestone
**M15** (akhir M15): Blog matang + RSS + dashboard statistik v1.
**M16** (akhir M16): Search/filter admin + audit log + multi-role.
**M17** (akhir M17): Rate limit + 2FA + hardening keamanan.
**M18** (akhir M18): Export/import + backup otomatis + restore teruji.
**M19** (akhir M19): Monitoring + uptime + alerting aktif.
**M20** (akhir M20): Preview deploy + CI budget gate; fase masuk mode operasional.

---

## 8. Dependency Antar Fase

### 8.1 Matriks Dependency (Bergantung Pada → Diblokir Oleh)

| Fase/Deliverable | Bergantung pada | Alasan |
| --- | --- | --- |
| F1.D1.2 Koneksi Neon | F0.D0.3 ERD, F0.D0.7 repo | Skema tabel harus final sebelum query |
| F1.D1.3 Auth admin | F1.D1.2 koneksi DB | Verifikasi user butuh tabel `users` |
| F1.D1.4 Halaman publik | F1.D1.2 koneksi DB, F0.D0.4 seed | Data harus dibaca dari DB, bukan hardcode |
| F1.D1.5–D1.8 CRUD | F1.D1.3 auth | Semua form butuh sesi admin |
| F1.D1.9 Panel settings | F1.D1.5–D1.8 | Pola CRUD sudah proven di entitas lain |
| F1.D1.11 Dashboard | F1.D1.10 viewer pesan | Butuh agregasi pesan |
| F1.D1.12 Deploy produksi | F1.D1.2, F1.D1.3, F1.D1.4 | Env var & domain butuh aplikasi berjalan || F2.D2.4 Dark mode | F2.D2.1 design system | Token warna dulu |
| F2.D2.9 Upload gambar | F1.D1.12 deploy | Butuh bucket & domain yang sudah aktif |
| F2.D2.11 Paginasi/filter | F1.D1.5 CRUD projects, F1.D1.6 posts | Query list harus sudah ada |
| F3.D3.3 Form kontak | F1.D1.2 koneksi DB | Menyimpan ke `messages` |
| F3.D3.5 Route API pesan | F3.D3.3 form, F1.D1.3 auth patterns | Pola server action & validasi |
| F3.D3.6 Email notifikasi | F3.D3.5 route API | Email dikirim setelah persist sukses |
| F4.D4.4 Audit log | F1.D1.5–F1.D1.10 CRUD | Log ditulis oleh operasi CRUD |
| F4.D4.6 2FA | F1.D1.3 auth | TOTP ditambahkan pada alur login |
| F4.D4.7 Multi-user | F1.D1.3 auth, F0.D0.3 schema `users.role` | Role sudah ada di schema |
| F4.D4.8 Export/import | F1.D1.5–F1.D1.10 CRUD | Serializer mengikuti model entitas |
| F4.D4.9 Backup otomatis | F4.D4.8 export | Backup memakai format export |
| F4.D4.11 Preview deploy | F1.D1.12 deploy, F0.D0.7 CI | Butuh infra Vercel + CI |

### 8.2 Dependency Eksternal

| Extern | Dibutuhkan oleh | Risiko bila terlambat |
| --- | --- | --- |
| Akun Neon (free tier) | F1.D1.2 | Blokir total: tidak ada data |
| Akun Vercel | F1.D1.12 | Blokir deploy |
| Domain (`.id`/`.com`) | F1.D1.12 | Deploy tetap jalan di URL `*.vercel.app` |
| Resend + domain terverifikasi | F3.D3.6 | Email masuk spam; fallback ke notifikasi in-app |
| Object storage (Blob/Cloudinary) | F2.D2.9 | Upload nonaktif; pakai URL eksternal manual |
| UptimeRobot / Better Stack | F4.D4.10 | Tidak ada alerting dini |
| GitHub (repo + Actions) | F0.D0.7 | CI manual; tidak memblokir development |
### 8.3 Jalur Kritis

```
F0.3 ERD → F1.2 DB → F1.3 Auth → F1.5-1.9 CRUD+Settings → F1.12 Deploy
                                                     ↓
                                    F2.9 Upload Gambar → F3.3 Form → F3.6 Email
                                                     ↓
                                          F4.4 Audit Log → F4.8 Export/Import → F4.9 Backup
```

Selisih ±1 minggu pada jalur kritis menggeser **seluruh** fase berikutnya. Fase 2 (Polish) dan Fase 3 (Monetize) punya jalur paralel yang bisa dikerjakan sebagian bersamaan bila ada buffer.

---

## 9. Risiko Timeline

Risiko timeline adalah risiko yang terutama memengaruhi **jadwal**, bukan teknis. Register risiko lengkap (probabilitas, dampak, skor, mitigasi, contingency, owner, trigger) ada di `risks.md`.

| # | Risiko Timeline | Dampak | Mitigasi | Contingency |
| --- | --- | --- | --- | --- |
| TL-1 | Scope creep dari permintaan klien/pelanggan | +2–4 minggu | Whitelist backlog di `product-backlog.md`; fitur baru masuk backlog, bukan langsung dikerjakan | Tunda Fase 4 (Scale): fase 1–3 tetap utuh |
| TL-2 | Solo developer, sakit atau downtime 1–2 minggu | Mundur 2 minggu | Time-boxing fase, buffer 15% di tiap fase | Kompres Fase 2 (Polish) menjadi 2 minggu, tunda D2.14 |
| TL-3 | Estimasi halaman admin CRUD (10 rute) underestimated | +1 minggu F1 | Validasi dengan 1 CRUD penuh lebih dulu (projects) sebagai prototype | Fase 1 Must-have untuk CRUD `projects` + `settings` saja; sisanya ke Fase 2 |
| TL-4 | Integrasi Neon/Vercel bermasalah (env var, region, SSL) | +1 minggu | Sudah diuji di F0/M1 dengan branch percobaan | Pindah ke direct connection string sementara, atau deploy manual |
| TL-5 | Ketergantungan pada layanan pihak ketiga (Resend, Vercel, Neon) | Mundur tidak pasti | Adapter tipis (abstraksi) agar mudah ditukar | Fallback ke form `mailto:` + baca pesan di admin panel || TL-6 | Perubahan kebutuhan setelah rilis MVP | Rework 1–2 minggu | Exit criteria per fase mengunci scope; user testing dengan 3 orang | Fasilitas feedback: kanal WhatsApp khusus 7 hari setelah rilis |
| TL-7 | Optimasi performa menumpuk di akhir | +1 minggu F2 | Performance budget masuk CI sejak F1 | Prioritaskan LCP & gambar saja; sisanya backlog |
| TL-8 | Konten riil belum siap (testimonial, harga, project) | Bloking F2.D2.14 & F3 | Owner menyiapkan draft konten paralel di M8 | Pakai foto & case study lama yang sudah ada, revisi copy nanti |
| TL-9 | Idle karena tidak ada tekanan deadline | Progres lambat | Milestone bulanan dengan tanggal tetap + review tiap sprint | Self-imposed deadline + akuntabilitas ke 1 klien/prospect |
| TL-10 | Break teknologi (Next.js 15 / Tailwind v4 major baru) | Waktu adaptasi | Pin versi mayor di `package.json`, baca release notes tiap awal bulan | Tunda upgrade ke versi major baru sampai fase selesai |
| TL-11 | Lonjakan pesan masuk (spam) saat promosi | Panel admin kewalahan | Rate limit + honeypot aktif sejak F3; badge "new" di dashboard | Naikkan threshold rate limit sementara, filter manual |
| TL-12 | Kehilangan akses akun Neon/Vercel (2FA, kadaluarsa kartu) | Blokir deploy/migrasi | 2FA aktif di kedua akun sejak F0; kredensial di password manager | Recovery code tersimpan offline; deploy via CLI token sementara |

---

## 10. Pelacakan Kemajuan (Review Berkala)

### 10.1 Ritme Review

| Ritme | Peserta | Output |
| --- | --- | --- |
| Harian (15 menit, async) | Owner | Checklist harian: ticket selesai, commit, status deploy |
| Mingguan (Senin, 60 menit) | Owner | Review backlog, update status item, update risiko |
| Akhir fase (90 menit) | Owner | Evaluasi exit criteria, retrospektif, rencana fase berikutnya |
| Bulanan (45 menit) | Owner + 1 mentor/prospect | Validasi arah produk, prioritas backlog |
### 10.2 Indikator Progress (KPI Roadmap)

| Fase | KPI | Target |
| --- | --- | --- |
| F0 | Requirements ter-cover | 100% rute punya acceptance criteria |
| F1 | Rute publik live | 8/8 HTTP 200 |
| F1 | Waktu update konten | < 2 menit (tanpa deploy) |
| F2 | Lighthouse Performance (mobile) | ≥ 90 |
| F2 | Axe violations | 0 kritis/serious |
| F3 | Lead masuk | ≥ 3/minggu |
| F3 | Waktu balas pesan pertama | ≤ 24 jam |
| F4 | Uptime | ≥ 99,5% |
| F4 | Pemulihan backup | < 1 jam |

### 10.3 Indikator Health Produk

| Indikator | Rumus | Target |
| --- | --- | --- |
| Konversi lead | pesan masuk ÷ pengunjung unik | ≥ 2% |
| Blog engagement | rata-rata waktu baca ÷ durasi post | ≥ 40% |
| Kecepatan update | median waktu publish project | ≤ 3 menit |
| Kualitas lead | inquiry yang jadi proyek ÷ total inquiry | ≥ 25% |

---

## 11. Ringkasan Milestone

| ID | Milestone | Fase | Target (Minggu) | Deliverable Kunci |
| --- | --- | --- | --- | --- |
| M1 | Kebutuhan & ERD disetujui | F0 | 1 | `02-REQUIREMENTS/`, `db/schema.sql` |
| M2 | Repo + CI + seed siap | F0 | 2 | GitHub Actions hijau |
| M3 | Data flowing dari Neon | F1 | 3 | `src/lib/db.ts` aktif |
| M4 | Auth admin terverifikasi | F1 | 4 | Login + proteksi route |
| M5 | 8 halaman publik live | F1 | 5 | Konten seed tampil |
| M6 | CRUD inti lengkap | F1 | 6 | projects/posts/services/settings |
| M7 | **MVP live di produksi** | F1 | 7 | Domain + HTTPS |
| M8 | Design system final | F2 | 8 | Komponen publik |
| M9 | SEO + upload + markdown | F2 | 9 | Sitemap, OG image |
| M10 | Polish QA lulus | F2 | 10 | Lighthouse & axe hijau || M11 | Halaman harga siap | F3 | 11 | 3 paket harga |
| M12 | Form kontak + spam guard | F3 | 12 | `messages` terisi |
| M13 | Notifikasi email aktif | F3 | 13 | Resend terverifikasi |
| M14 | Funnel terukur | F3 | 14 | Data konversi masuk |
| M15 | Blog + RSS + statistik | F4 | 15 | Dashboard v1 |
| M16 | Search/filter + audit log | F4 | 16 | Audit trail |
| M17 | Rate limit + 2FA | F4 | 17 | Hardening keamanan |
| M18 | Backup + restore teruji | F4 | 18 | Export/import |
| M19 | Monitoring aktif | F4 | 19 | Uptime + alert |
| M20 | Mode operasional | F4 | 20 | Preview deploy + CI gate |

---

## 12. Rujukan Silang

| Dokumen | Isi yang diambil dari roadmap ini |
| --- | --- |
| `product-backlog.md` | Fase F0–F4 sebagai kolom "Fase Roadmap" tiap item |
| `risks.md` | TL-1…TL-12 menjadi subset risiko jadwal; register lengkap menambah risiko teknis |
| `../06-QUALITY/test-plan.md` | Exit criteria tiap fase menjadi checklist verifikasi |
| `../06-QUALITY/definition-of-done.md` | Exit criteria fase = syarat "Done" pada level fitur |
| `../07-DEPLOYMENT/deployment-plan.md` | D1.12, D4.11, dan §9 biaya di sini adalah acuan deployment |
