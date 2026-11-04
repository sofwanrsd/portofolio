# Product Backlog: Website Portofolio Pribadi + CMS Semi-Custom

| Atribut | Nilai |
| --- | --- |
| Versi dokumen | 2.0 |
| Tanggal | 4 November 2026 |
| Owner | Solo developer independen (Indonesia), 1 orang |
| Referensi | `roadmap.md` (Fase F0–F4) |
| Jumlah item | 111 (105 dikerjakan + 6 Won't-now/Deferred) |
| Konvensi ID | `PORT-<huruf epik><nomor dua digit>`: contoh `PORT-C03` |
| Status | `Backlog` · `Ready` · `In Progress` · `Review` · `Done` · `Deferred` |
| Capacidad | ±20 story point/minggu (solo developer) |

---

## 1. Cara Membaca Backlog

### 1.1 Prioritas (MoSCoW)

| Kode | Arti | Aturan Perlakuan |
| --- | --- | --- |
| **Must** | Wajib ada untuk rilis fase | Tidak bisa di-defer tanpa melanggar exit criteria fase |
| **Should** | Penting, boleh ditunda 1 sprint | Ditunda hanya bila semua Must belum tuntas |
| **Could** | Nilai tambah, dikerjakan bila ada sisa kapasitas | Boleh di-defer ke fase berikutnya |
| **Won't (now)** | Eksplisit di luar scope versi ini | Dicatat sebagai kandidat, tidak dikerjakan di roadmap ini |

### 1.2 Story Point

Skala Fibonacci: 1 (trivial) · 2 (kecil) · 3 (sedang) · 5 (besar) · 8 (sangat besar) · 13 (spike/riset).

Kalibrasi: **1 SP ≈ 0,5 hari kerja terfokus**. Total kapasitas aktual ≈ 20 SP/minggu untuk solo developer dengan konteks tetap.

### 1.3 Status Tracking

Setiap item punya satu status. Item `Ready` wajib punya acceptance criteria yang disepakati sebelum mulai. Item `Done` wajib punya bukti (link PR, screenshot, atau hasil tes). Item `Deferred` wajib punya alasan tertulis dan target fase berikutnya.

### 1.4 Estimasi vs Fase

Kolom "Estimasi" adalah durasi kerja murni (tanpa menunggu akses, aset, atau keputusan pihak ketiga). Kolom "Fase" adalah fase roadmap tempat item itu harus selesai agar exit criteria fase tersebut terpenuhi.

---
## 2. Peta Epik

| Epik | Nama | Cakupan | Fase |
| --- | --- | --- | --- |
| EP-A | Fondasi & Infrastruktur | Next.js, Tailwind, Neon raw SQL, env var, CI/CD | F0–F1 |
| EP-B | Autentikasi & Keamanan | Login admin, JWT cookie, middleware, rate limit, 2FA, audit log | F1, F4 |
| EP-C | CRUD Projects | `/admin/projects` + halaman publik projects | F1 |
| EP-D | CRUD Posts & Blog | `/admin/posts`, `/blog`, `/blog/[slug]`, editor markdown, RSS | F1, F4 |
| EP-E | CRUD Services & Harga | `/admin/services`, `/services`, section pricing | F1, F3 |
| EP-F | CRUD Experience, Skills, Testimonials | Tiga entitas profil di panel admin | F1 |
| EP-G | Settings, Tema & Dark Mode | Panel settings, key/value JSONB, section toggle, dark mode | F1, F2 |
| EP-H | Pesan & Form Kontak | `/contact`, route API pesan, spam guard, notifikasi email | F1, F3 |
| EP-I | Media & Konten | Upload gambar, optimasi image, OG image | F2 |
| EP-J | SEO & Discoverability | Metadata, sitemap, robots, JSON-LD, Search Console | F2, F4 |
| EP-K | Dashboard & Analitik | Statistik admin, grafik, funnel tracking, analytics | F1, F3, F4 |
| EP-L | Operasional | Backup/restore, monitoring, export/import, deploy preview | F4 |
| EP-M | Kualitas & Aksesibilitas | Responsive, a11y, performance budget, test suite | F1–F4 |

Ringkasan kuantitatif per epik (jumlah item, total SP, SP belum Done) ada di §4, dihitung dari tabel §3.

---
## 3. Backlog Detail

Kolom-kolom tabel: **ID** · **Judul** · **Prioritas** · **SP** · **Estimasi** · **Dependensi** · **Fase** · **Status** · **Acceptance Criteria Ringkas**.

---

### EP-A: Fondasi & Infrastruktur

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-A01 | Inisialisasi Next.js 15 App Router + TypeScript strict + Tailwind v4 | Must | 3 | 0,5 hari |: | F0 | Backlog | `npm run dev` jalan; `tsconfig` strict aktif; Tailwind v4 terpasang; ESLint jalan |
| PORT-A02 | Modul DB terpusat: `neon()` HTTP driver + `query()`/`queryOne()`/`execute()` | Must | 5 | 1 hari | PORT-A01 | F1 | Backlog | Query SELECT berhasil dari dev; koneksi dari `DATABASE_URL`; error ditangkap dan di-log, tidak crash |
| PORT-A03 | Klien DB lazy-init + helper `toStringArray()` untuk kolom JSONB | Must | 3 | 0,5 hari | PORT-A02 | F1 | Backlog | Tanpa `DATABASE_URL` build tetap lolos; JSONB `gallery`/`stack`/`tags` diparse ke `string[]` |
| PORT-A04 | Skrip `db:setup` (schema + seed idempotent via `ON CONFLICT`) | Must | 2 | 0,5 hari | PORT-A02 | F1 | Backlog | Menjalankan dua kali tidak menghasilkan duplikat; `npm run db:reset` mengosongkan lalu mengisi ulang |
| PORT-A05 | Environment variables + validasi env via Zod di sisi server | Must | 3 | 0,5 hari | PORT-A01 | F0 | Backlog | Build/runtime gagal dengan pesan jelas bila `DATABASE_URL`/`AUTH_SECRET`/`NEXT_PUBLIC_SITE_URL` hilang |
| PORT-A06 | Setup GitHub Actions: lint + typecheck + test + build | Must | 3 | 0,5 hari | PORT-A01 | F0 | Backlog | Pipeline hijau di push ke `main`; artifact build terunggah; workflow gagal bila salah satu step gagal |
| PORT-A07 | Setup Vercel: import repo, env var per environment, domain | Must | 3 | 1 hari | PORT-A05, PORT-A06 | F1 | Backlog | Preview & Production deploy sukses; HTTPS aktif; env Production & Preview terpisah |
| PORT-A08 | Route handler `POST /api/revalidate` dengan perbandingan secret timing-safe | Should | 2 | 0,5 hari | PORT-A07 | F2 | Backlog | Request tanpa secret ditolak 401; `crypto.timingSafeEqual` dipakai, bukan `===` |
| PORT-A09 | Struktur folder feature-based + komponen UI dasar + `next.config.ts` header keamanan | Should | 5 | 1 hari | PORT-A01 | F1 | Backlog | `src/app`, `src/components`, `src/lib` konsisten; header `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` terpasang |
### EP-B: Autentikasi & Keamanan

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-B01 | Halaman `/admin/login` (form email + password, validasi Zod) | Must | 3 | 0,5 hari | PORT-A09 | F1 | Backlog | Error tampil inline per field; label terhubung ke input (`htmlFor`/`id`); submit disabled saat loading |
| PORT-B02 | Login: verifikasi `users` dengan bcryptjs + issue JWT via `jose` | Must | 5 | 1 hari | PORT-B01, PORT-A02 | F1 | Backlog | Password benar → cookie sesi; salah → pesan generik tanpa membocorkan detail |
| PORT-B03 | Cookie sesi `portfolio_session`: `httpOnly`, `secure` (prod), `sameSite=lax`, TTL 7 hari | Must | 3 | 0,5 hari | PORT-B02 | F1 | Backlog | Atribut cookie sesuai; `destroySession()` menghapus cookie (maxAge 0) |
| PORT-B04 | Middleware proteksi `/admin/*` (kecuali `/admin/login`) | Must | 5 | 1 hari | PORT-B03 | F1 | Backlog | Tanpa cookie valid → redirect 307 ke `/admin/login?next=…`; loop redirect dicegah |
| PORT-B05 | `requireAdmin()` dipanggil di dalam setiap server action (defense in depth) | Must | 3 | 0,5 hari | PORT-B04 | F1 | Backlog | Memanggil action tanpa sesi tetap menolak walau middleware dilewati |
| PORT-B06 | Logout + invalidasi sesi | Must | 2 | 0,5 hari | PORT-B03 | F1 | Backlog | Klik logout → cookie dihapus, akses admin ditolak |
| PORT-B07 | Ganti password admin | Should | 3 | 0,5 hari | PORT-B02 | F1 | Backlog | Password lama wajib benar; hash baru bcrypt cost ≥ 10; sesi lama tetap valid sampai logout |
| PORT-B08 | Rate limit pada route login (5 percobaan / 15 menit / IP) | Must | 3 | 0,5 hari | PORT-B02 | F3 | Backlog | Percobaan ke-6 mengembalikan 429 dengan pesan ramah |
| PORT-B09 | 2FA TOTP (QR, secret base32, recovery code) | Could | 8 | 2 hari | PORT-B02, PORT-L02 | F4 | Backlog | Login butuh kode TOTP bila aktif; recovery code sekali pakai |
| PORT-B10 | Multi-user dengan role `admin` / `editor` | Could | 8 | 2 hari | PORT-B02 | F4 | Backlog | `editor` tidak bisa ubah settings-role/akun; `admin` bisa |
### EP-C: CRUD Projects

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-C01 | List `/admin/projects` (tabel, cover, status, tanggal, aksi) | Must | 5 | 1 hari | PORT-B04, PORT-A09 | F1 | Backlog | Tampilkan semua project; sort default `sort_order ASC`; aksi edit/delete tersedia |
| PORT-C02 | Form create/edit project (title, slug, summary, description, category) | Must | 8 | 1,5 hari | PORT-C01 | F1 | Backlog | Slug auto-generate dari title dan unik; validasi required field via Zod |
| PORT-C03 | Field tambahan project (stack, gallery, repo_url, live_url, client, year) | Must | 5 | 1 hari | PORT-C02 | F1 | Backlog | `stack` & `gallery` disimpan sebagai JSONB array dan dapat diedit ulang |
| PORT-C04 | Toggle `published` dan `featured` | Must | 3 | 0,5 hari | PORT-C02 | F1 | Backlog | Project unpublished tidak muncul di halaman publik |
| PORT-C05 | Atur `sort_order` (input angka atau drag) | Should | 3 | 0,5 hari | PORT-C04 | F1 | Backlog | Urutan di list publik mengikuti `sort_order` naik |
| PORT-C06 | Hapus project dengan dialog konfirmasi | Must | 2 | 0,5 hari | PORT-C01 | F1 | Backlog | Dialog konfirmasi; data terhapus permanen setelah konfirmasi |
| PORT-C07 | Halaman publik `/projects` (grid, filter kategori, pagination) | Must | 5 | 1 hari | PORT-C04, PORT-C05 | F1 | Backlog | Hanya `published=true`; filter kategori bekerja; 9 item per halaman |
| PORT-C08 | Halaman detail `/projects/[slug]` | Must | 5 | 1 hari | PORT-C03, PORT-C07 | F1 | Backlog | Slug tidak ada → 404; gallery, stack, link repo/live tampil |
| PORT-C09 | Pencarian & filter di list admin projects | Could | 3 | 0,5 hari | PORT-C01 | F4 | Backlog | Filter judul/slug/category/status bekerja; URL menyimpan state filter |
| PORT-C10 | Bulk action (publish/unpublish/hapus terpilih) | Won't (now) | 5 | 1 hari | PORT-C06 | Deferred | Deferred | Diprioritaskan bila volume project admin menumpuk (> 50) |
### EP-D: CRUD Posts & Blog

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-D01 | List `/admin/posts` (judul, status, tanggal publikasi, tag) | Must | 5 | 1 hari | PORT-B04 | F1 | Backlog | Sort `published_at DESC`; badge status draft/published |
| PORT-D02 | Form create/edit post (title, slug, excerpt, content, cover_image) | Must | 8 | 1,5 hari | PORT-D01 | F1 | Backlog | Slug unik auto-generate; excerpt opsional |
| PORT-D03 | Editor markdown + preview tabs | Must | 8 | 1,5 hari | PORT-D02 | F1 | Backlog | Preview menampilkan hasil render GFM; input markdown tidak berubah saat preview |
| PORT-D04 | Sanitasi HTML markdown (blockquote script/XSS) | Must | 5 | 1 hari | PORT-D03 | F1 | Backlog | `<script>` dan `onerror` dibuang saat render; `react-markdown` tanpa `rehype-raw` |
| PORT-D05 | Manage tags (array JSONB) | Should | 3 | 0,5 hari | PORT-D02 | F1 | Backlog | Tag dapat ditambah/dihapus per post; disimpan sebagai array string |
| PORT-D06 | Toggle publish + set `published_at` | Must | 3 | 0,5 hari | PORT-D02 | F1 | Backlog | Publish pertama kali mengisi `published_at`; unpublish menyembunyikan dari daftar publik |
| PORT-D07 | Halaman publik `/blog` (list, filter tag, pagination) | Must | 5 | 1 hari | PORT-D05, PORT-D06 | F1 | Backlog | Hanya published; filter tag bekerja |
| PORT-D08 | Halaman detail `/blog/[slug]` dengan TOC | Must | 5 | 1 hari | PORT-D03, PORT-D07 | F1 | Backlog | Heading h2/h3 jadi anchor TOC; slug tak dikenal → 404 |
| PORT-D09 | CRUD Experiences (company, role, period, description, url) | Must | 5 | 1 hari | PORT-B04 | F1 | Backlog | CRUD penuh + urutan `sort_order`; tampil sebagai timeline di `/about` |
| PORT-D10 | Related posts (3 post terbaru dengan tag sama) | Could | 3 | 0,5 hari | PORT-D08 | F4 | Backlog | Ditampilkan di bawah artikel; menyingkirkan artikel itu sendiri |
| PORT-D11 | RSS feed `/feed.xml` | Should | 3 | 0,5 hari | PORT-D08 | F4 | Backlog | Valid di validator feed; berisi 10 post terbaru |
| PORT-D12 | Draft autosave di localStorage | Won't (now) | 5 | 1 hari | PORT-D02 | Deferred | Deferred | Menunggu umpan balik utilisasi editor |
### EP-E: CRUD Services & Harga

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-E01 | List `/admin/services` (judul, harga, popular, status) | Must | 5 | 1 hari | PORT-B04 | F1 | Backlog | Tampilkan harga terformat; aksi toggle popular & publish tersedia |
| PORT-E02 | Form create/edit service (title, slug, description, icon) | Must | 5 | 1 hari | PORT-E01 | F1 | Backlog | Slug unik; icon dari whitelist lucide-react |
| PORT-E03 | Field harga (`price_label`, `price_value`, `currency`) | Must | 5 | 1 hari | PORT-E02 | F1 | Backlog | `price_value` numerik tanpa titik; tampil sebagai `Rp 2.500.000` |
| PORT-E04 | Manage `features` (array JSONB, tambah/hapus baris) | Must | 3 | 0,5 hari | PORT-E02 | F1 | Backlog | Baris features dapat ditambah/dihapus; urutan terjaga |
| PORT-E05 | Flag `popular` (maks 1 paket aktif) | Should | 3 | 0,5 hari | PORT-E04 | F3 | Backlog | Hanya satu paket bertanda popular pada satu waktu |
| PORT-E06 | Halaman publik `/services` (daftar paket + perbandingan fitur) | Must | 5 | 1 hari | PORT-E03, PORT-E04 | F1 | Backlog | Minimal 3 paket tampil; harga & currency sesuai |
| PORT-E07 | Section `pricing` di beranda (toggle-able) | Must | 3 | 0,5 hari | PORT-E06, PORT-G05 | F3 | Backlog | Section disembunyikan bila `settings.sections.pricing = false` |
| PORT-E08 | CTA per paket menuju `/contact?service=<slug>` | Should | 3 | 0,5 hari | PORT-E06, PORT-H02 | F3 | Backlog | Parameter `service` terisi otomatis di form kontak |
| PORT-E09 | Kalkulator harga (estimasi durasi project) | Won't (now) | 8 | 2 hari | PORT-E03 | Deferred | Deferred | Menunggu data historis harga & durasi |
### EP-F: CRUD Experience, Skills, Testimonials

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-F01 | CRUD Skills (name, category, level, sort_order) | Must | 5 | 1 hari | PORT-B04 | F1 | Backlog | Level 0–100 tervalidasi; dikelompokkan per kategori |
| PORT-F02 | CRUD Testimonials (name, role, company, content, rating) | Must | 5 | 1 hari | PORT-B04 | F1 | Backlog | Rating 1–5; avatar opsional; publish toggle |
| PORT-F03 | Halaman `/about` (bio, timeline pengalaman, skill bars, testimonial) | Must | 8 | 1,5 hari | PORT-D09, PORT-F01, PORT-F02 | F1 | Backlog | Data diambil dari DB; section yang dimatikan tidak tampil |
| PORT-F04 | Filter skill per kategori di `/about` | Should | 3 | 0,5 hari | PORT-F01, PORT-F03 | F2 | Backlog | Klik kategori menyaring daftar skill |
| PORT-F05 | Halaman testimonial terpisah (`/testimonials`) | Won't (now) | 3 | 0,5 hari | PORT-F02 | Deferred | Deferred | Testimonial cukup tampil di beranda + `/about` |
### EP-G: Settings, Tema & Dark Mode

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-G01 | Panel `/admin/settings` dengan form per key | Must | 8 | 1,5 hari | PORT-C02 | F1 | Backlog | Tujuh key terpusat: site, theme, sections, socials, seo, features, footer |
| PORT-G02 | Helper typed read/write `settings` (JSONB) dengan default | Must | 3 | 0,5 hari | PORT-A02 | F1 | Backlog | Satu fungsi baca dengan default bila key belum ada; tulis via upsert `ON CONFLICT` |
| PORT-G03 | Edit `site` (nama, tagline, kontak, lokasi, availability, hero copy) | Must | 3 | 0,5 hari | PORT-G01 | F1 | Backlog | Perubahan langsung tampil di header/footer/hero tanpa deploy |
| PORT-G04 | Edit `socials` (github, linkedin, twitter, instagram, youtube, whatsapp) | Must | 2 | 0,5 hari | PORT-G01 | F1 | Backlog | Link kosong → ikon disembunyikan |
| PORT-G05 | Section toggle (`settings.sections`) untuk 11 section | Must | 5 | 1 hari | PORT-G01 | F1 | Backlog | Matikan `projects` → section projects hilang dari beranda & navigasi |
| PORT-G06 | Edit `theme` (accent, accentSecondary, mode, font, radius, showGrid) | Should | 5 | 1 hari | PORT-G01 | F2 | Backlog | Perubahan accent langsung diterapkan ke CSS variable |
| PORT-G07 | Dark mode toggle + persistensi (localStorage) | Should | 5 | 1 hari | PORT-G06 | F2 | Backlog | `prefers-color-scheme` dihormati; pilihan manual bertahan setelah reload; tanpa hydration mismatch |
| PORT-G08 | Edit `seo` (metaTitle, metaDescription, ogImage, keywords) | Must | 2 | 0,5 hari | PORT-G01 | F1 | Backlog | Nilai tersimpan dan dipakai `generateMetadata` |
| PORT-G09 | Edit `features` & `footer` | Must | 2 | 0,5 hari | PORT-G01 | F1 | Backlog | Copy CTA dan copyright dapat diubah |
| PORT-G10 | Pratinjau perubahan settings sebelum simpan | Won't (now) | 5 | 1 hari | PORT-G01 | Deferred | Deferred | Render real-time sudah memberi umpan balik memadai |
### EP-H: Pesan & Form Kontak

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-H01 | Halaman `/contact` (form: name, email, subject, budget, message) | Must | 5 | 1 hari | PORT-A09 | F1 | Backlog | Field wajib tervalidasi; label terpasang; pesan error per field |
| PORT-H02 | Route `POST /api/contact` dengan validasi Zod server-side | Must | 5 | 1 hari | PORT-H01 | F1 | Backlog | Data valid → tersimpan di `messages`; invalid → 422 dengan daftar error field |
| PORT-H03 | Spam guard: honeypot field + minimum time fill 3 detik | Must | 3 | 0,5 hari | PORT-H02 | F3 | Backlog | Honeypot terisi atau submit < 3 detik → respons sukses palsu tanpa menyimpan |
| PORT-H04 | Rate limit endpoint kontak (5 pesan / 10 menit / IP) | Must | 3 | 0,5 hari | PORT-H02 | F3 | Backlog | Melebihi batas → 429; pengguna tidak melihat error teknis |
| PORT-H05 | List `/admin/messages` + detail + ubah status | Must | 5 | 1 hari | PORT-H02 | F1 | Backlog | Filter `new`/`read`/`archived`; pesan `new` diberi badge |
| PORT-H06 | Notifikasi email via Resend saat pesan masuk | Must | 5 | 1 hari | PORT-H02 | F3 | Backlog | Email diterima di `CONTACT_TO_EMAIL` berisi nama, email, budget, isi pesan |
| PORT-H07 | Halaman konfirmasi `/contact?sent=1` | Must | 2 | 0,5 hari | PORT-H02 | F3 | Backlog | Pesan sukses + waktu balas ≤ 24 jam; link "kirim pesan lain" |
| PORT-H08 | Tombol salin email + tautan WhatsApp | Should | 2 | 0,5 hari | PORT-G03 | F3 | Backlog | Klik menyalin email ke clipboard dengan feedback visual |
| PORT-H09 | Export pesan ke CSV | Won't (now) | 3 | 0,5 hari | PORT-H05 | Deferred | Deferred | Volume pesan masih rendah |
### EP-I: Media & Konten

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-I01 | Upload gambar ke object storage (Vercel Blob / Cloudinary) | Should | 8 | 2 hari | PORT-A07 | F2 | Backlog | Maks 5 MB; tipe JPG/PNG/WebP; URL tersimpan di DB |
| PORT-I02 | Komponen upload dengan preview + hapus | Should | 5 | 1 hari | PORT-I01 | F2 | Backlog | Preview tampil sebelum simpan; batal mengembalikan nilai lama |
| PORT-I03 | Optimasi gambar dengan `next/image` + remote patterns | Must | 3 | 0,5 hari | PORT-I01 | F2 | Backlog | Gambar terkompresi; layout tidak bergeser (CLS rendah) |
| PORT-I04 | Galeri gambar pada halaman detail project | Should | 5 | 1 hari | PORT-I01, PORT-C08 | F2 | Backlog | Minimal 4 gambar; navigasi galeri berfungsi |
| PORT-I05 | OG image generik via `opengraph-image.tsx` | Should | 3 | 0,5 hari | PORT-G08 | F2 | Backlog | Gambar 1200×630 valid; memuat nama & tagline |
| PORT-I06 | Favicon + `manifest.webmanifest` + apple-touch-icon | Should | 2 | 0,5 hari | PORT-A09 | F2 | Backlog | Ikon valid; PWA manifest terpasang |
| PORT-I07 | Optimasi aset: font lokal, SVG inline, lazy loading | Should | 3 | 0,5 hari | PORT-I03 | F2 | Backlog | Tidak ada font shift; gambar di bawah fold lazy |
### EP-J: SEO & Discoverability

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-J01 | `generateMetadata` per rute publik (title, description, canonical) | Must | 5 | 1 hari | PORT-C07, PORT-D07 | F2 | Backlog | 8 rute punya metadata unik; judul ≤ 60 karakter |
| PORT-J02 | Open Graph + Twitter Card tags | Must | 3 | 0,5 hari | PORT-J01 | F2 | Backlog | Valid di validator Open Graph; `og:image` ada di setiap halaman |
| PORT-J03 | `sitemap.xml` dinamis | Must | 3 | 0,5 hari | PORT-C08, PORT-D08 | F2 | Backlog | Memuat 8 rute statis + semua project & post published |
| PORT-J04 | `robots.txt` + directive sitemap | Must | 2 | 0,5 hari | PORT-J03 | F2 | Backlog | `/admin` di-disallow; `Sitemap:` menunjuk URL benar |
| PORT-J05 | JSON-LD schema (Person, WebSite, CreativeWork, Article) | Should | 5 | 1 hari | PORT-J01 | F2 | Backlog | Valid di validator schema.org; tanpa error |
| PORT-J06 | Breadcrumb & prev/next di halaman detail | Could | 3 | 0,5 hari | PORT-C08 | F2 | Backlog | Meningkatkan navigasi dan internal linking |
| PORT-J07 | Submit sitemap ke Google Search Console | Should | 2 | 0,5 hari | PORT-J03 | F2 | Backlog | Sitemap ter-submit; status "Success" |
| PORT-J08 | Halaman 404 & 500 kustom + error boundary | Should | 3 | 0,5 hari | PORT-A09 | F2 | Backlog | Copy lokal; link kembali ke beranda; tanpa stack trace |
### EP-K: Dashboard & Analitik

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-K01 | Dashboard `/admin` (jumlah project, post, service, pesan baru) | Must | 5 | 1 hari | PORT-C01, PORT-H05 | F1 | Backlog | Angka akurat dari agregasi SQL; klik angka menuju list terkait |
| PORT-K02 | Grafik pesan masuk 30 hari | Should | 5 | 1 hari | PORT-K01 | F4 | Backlog | Sumbu tanggal benar; hari tanpa pesan tetap tampil |
| PORT-K03 | Pelacakan event CTA (klik tombol hubungi, submit form) | Should | 3 | 0,5 hari | PORT-G09 | F3 | Backlog | Event terkirim ke analytics dengan label CTA |
| PORT-K04 | Integrasi analytics (Umami atau GA4) | Should | 5 | 1 hari | PORT-K03 | F3 | Backlog | Data trafik masuk; cookie consent bila diwajibkan |
| PORT-K05 | Top project & top post berdasarkan views | Could | 5 | 1 hari | PORT-K02 | F4 | Backlog | Memerlukan pencatatan view: tabel terpisah `page_views` |
| PORT-K06 | Widget "action needed" (pesan baru, draft, gambar hilang) | Could | 3 | 0,5 hari | PORT-K01 | F4 | Backlog | Menyorot item yang butuh tindakan owner |

### EP-L: Operasional

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-L01 | Tabel `audit_logs` + pencatatan aksi admin | Should | 5 | 1 hari | PORT-C01 | F4 | Backlog | Setiap create/update/delete tercatat: aktor, entitas, id, waktu, IP |
| PORT-L02 | Rate limiter token bucket (in-memory / Upstash) | Should | 5 | 1 hari | PORT-B02, PORT-H02 | F4 | Backlog | Limiter dipakai bersama oleh login & kontak; reset otomatis |
| PORT-L03 | Export backup JSON semua tabel | Must | 5 | 1 hari | PORT-C01 | F4 | Backlog | Unduh satu file JSON berisi 9 tabel + versi format |
| PORT-L04 | Import backup (mode merge / replace) | Must | 8 | 1,5 hari | PORT-L03 | F4 | Backlog | Import restore menghasilkan data identik; mode replace mengosongkan tabel target |
| PORT-L05 | Backup otomatis harian (Vercel Cron → object storage) | Must | 5 | 1 hari | PORT-L03 | F4 | Backlog | Cron harian menghasilkan dump; retensi 30 file terakhir |
| PORT-L06 | Monitoring & uptime check + alerting | Should | 3 | 0,5 hari | PORT-A07 | F4 | Backlog | Monitor `/` setiap 5 menit; alert ke email bila gagal |
| PORT-L07 | Route `/api/health` (cek `SELECT 1` ke Neon) | Must | 2 | 0,5 hari | PORT-A02 | F4 | Backlog | 200 bila DB sehat; 503 bila tidak; dipakai uptime monitor |
| PORT-L08 | Deploy preview per PR dengan branch Neon terisolasi | Could | 8 | 2 hari | PORT-A07, PORT-A06 | F4 | Backlog | PR menghasilkan preview URL; tidak menyentuh data produksi |
### EP-M: Kualitas & Aksesibilitas

| ID | Judul | Prioritas | SP | Estimasi | Dependensi | Fase | Status | Acceptance Criteria Ringkas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PORT-M01 | Setup Vitest + konfigurasi coverage | Must | 3 | 0,5 hari | PORT-A01 | F1 | Backlog | `npm run test` jalan; coverage terukur; threshold ≥ 70% (lihat test-plan §7) |
| PORT-M02 | Setup Playwright + smoke test E2E | Must | 5 | 1 hari | PORT-A01 | F1 | Backlog | `npm run test:e2e` menjalankan alur login + CRUD + form kontak |
| PORT-M03 | Unit test layer domain (slug, format rupiah, tanggal, validasi Zod) | Must | 5 | 1 hari | PORT-M01 | F1 | Backlog | ≥ 20 kasus uji; termasuk slug duplikat & format `Rp 2.500.000` |
| PORT-M04 | Integration test query DB terhadap branch Neon `dev` | Must | 5 | 1 hari | PORT-M01, PORT-A02 | F1 | Backlog | Query read & write terverifikasi; test otomatis skip bila `DATABASE_URL` test tidak ada |
| PORT-M05 | Responsive audit 320px–1920px | Should | 3 | 0,5 hari | PORT-C07, PORT-D07 | F2 | Backlog | Tidak ada horizontal scroll di 8 rute publik |
| PORT-M06 | Audit a11y (axe) + perbaikan keyboard navigation | Should | 5 | 1 hari | PORT-M01 | F2 | Backlog | 0 violation kritis/serious; seluruh elemen interaktif dapat dijangkau keyboard |
| PORT-M07 | Performance budget di CI (Lighthouse CI) | Should | 5 | 1 hari | PORT-A06 | F2 | Backlog | Performance ≥ 90 mobile; LCP < 2,5s; CLS < 0,1; INP < 200ms; CI gagal bila turun |
| PORT-M08 | Audit keamanan berkala (OWASP ZAP baseline + dependency audit) | Should | 3 | 0,5 hari | PORT-A07 | F4 | Backlog | Scan ZAP tanpa temuan kritis/tinggi; `npm audit` bersih untuk paket runtime |
---

## 4. Ringkasan Kuantitatif

Angka di bawah dihitung langsung dari tabel §3 (111 baris item, 467 SP).

### 4.1 Per Epik

| Epik | Jumlah Item | Total SP |
| --- | --- | --- |
| EP-A | 9 | 29 |
| EP-B | 10 | 43 |
| EP-C | 10 | 44 |
| EP-D | 12 | 58 |
| EP-E | 9 | 40 |
| EP-F | 5 | 24 |
| EP-G | 10 | 40 |
| EP-H | 9 | 33 |
| EP-I | 7 | 29 |
| EP-J | 8 | 26 |
| EP-K | 6 | 26 |
| EP-L | 8 | 41 |
| EP-M | 8 | 34 |
| **Total** | **111** | **467** |

### 4.2 Per Prioritas

| Prioritas | Jumlah Item | Total SP | % SP |
| --- | --- | --- | --- |
| Must | 66 | 279 | 60% |
| Should | 31 | 118 | 25% |
| Could | 8 | 41 | 9% |
| Won't (now) | 6 | 29 | 6% |
| **Total** | **111** | **467** | **100%** |

### 4.3 Sebaran per Fase Roadmap

| Fase | Jumlah Item | Total SP |
| --- | --- | --- |
| F0 Discovery | 3 | 9 |
| F1 MVP | 52 | 229 |
| F2 Polish | 22 | 83 |
| F3 Monetize | 11 | 35 |
| F4 Scale | 17 | 82 |
| Deferred (tidak dikerjakan) | 6 | 29 |
| **Total** | **111** | **467** |

Beban Must-only Fase F1: **48 item / 215 SP** ≈ 11 minggu pada kapasitas 20 SP/minggu.
### 4.4 Analisis Kapasitas

| Metrik | Nilai |
| --- | --- |
| Total SP seluruh backlog | 467 SP |
| SP yang benar-benar dikerjakan (exclude `Won't (now)`) | 438 SP |
| Kapasitas roadmap (20 SP/minggu × 20 minggu) | 400 SP |
| Selisih | −38 SP (±2 minggu) |

**Kesimpulan:** backlog tidak muat penuh dalam 20 minggu pada kapasitas solo developer. Buffer ±15% per fase (risiko TL-2) justru menutup selisih ini, tetapi marginnya tipis. Rencana pengurangan yang direkomendasikan bila buffer terpakai:

1. Hapus seluruh item `Could` (8 item / 41 SP): paling mudah, dampaknya paling kecil ke nilai produk.
2. Pindahkan `PORT-B09` (2FA, 8 SP) dan `PORT-B10` (multi-user, 8 SP) ke fase setelah roadmap: keduanya `Could` dan tidak diblokir exit criteria mana pun.
3. Kunci `Should` non-kritis sebagai buffer sacrificial: `PORT-B07` (ganti password), `PORT-F04` (filter skill), `PORT-J05` (JSON-LD), `PORT-J07` (Search Console): 11 SP.

Kombinasi 1 + 2 menghasilkan 389 SP, menyisakan buffer ±11 SP (±0,5 minggu). Kombinasi 1 + 2 + 3 menghasilkan 378 SP dengan buffer ±22 SP (±1 minggu): inilah skenario dasar yang dipakai di roadmap.

### 4.5 Item Kritis Jalur Kritis

Item berikut **wajib** selesai tepat waktu karena memblokir seluruh fase berikutnya:

| ID | Kenapa Kritis | Yang Diblokir |
| --- | --- | --- |
| PORT-A02 | Tanpa koneksi DB tidak ada halaman yang punya data | Semua halaman publik |
| PORT-A05 | Env var salah = build gagal | Seluruh pipeline CI |
| PORT-A06 | Tanpa CI, regresi lolos ke produksi | Semua fase |
| PORT-B02 | Tanpa login tidak ada panel admin | Seluruh CRUD |
| PORT-B04 | Tanpa proteksi route, data bocor | Seluruh panel admin |
| PORT-C02 | Pola CRUD project = prototype untuk entitas lain | 6 entitas CRUD |
| PORT-G01 | Settings = sumber konfigurasi semua halaman | 8 rute publik |
| PORT-C07 | Halaman projects = portofolio utama | Nilai produk F1 |
| PORT-A07 | Tanpa deploy tidak ada nilai ke pengguna | Rilis F1 (M7) |

### 4.6 Aturan Prioritisasi Harian

Saat memilih item untuk dikerjakan, gunakan urutan ini:

1. Semua item **Must** pada fase berjalan (Fase saat ini): tidak ada pengecualian.
2. Item **Should** pada fase berjalan, jika kapasitas fase tersisa ≥ 50%.
3. Item **Must** pada fase berikutnya, bila ada jalur kritis yang belum tertutup (§4.5).
4. Item **Could** hanya bila fase berjalan sudah melewati exit criteria.
5. Item **Won't (now)** tidak pernah masuk sprint: hanya ada di dokumen ini sebagai penanda keputusan.

### 4.7 Item Deferred ( Won't (now) ) dan Alasannya

| ID | Judul | Alasan Defer | Kapan Dipertimbangkan |
| --- | --- | --- | --- |
| PORT-C10 | Bulk action project | Volume project admin masih < 30 | Saat list admin melewati 50 item |
| PORT-D12 | Draft autosave | Belum ada laporan kehilangan draft | Setelah 3 bulan pemakaian editor |
| PORT-E09 | Kalkulator harga | Tidak ada data historis harga & durasi | Setelah 10 proyek selesai |
| PORT-F05 | Halaman testimonial terpisah | Testimonial sudah tampil di beranda + `/about` | Setelah ada > 15 testimonial |
| PORT-G10 | Pratinjau settings | Render real-time sudah memberi umpan balik | Jika owner sering salah simpan |
| PORT-H09 | Export pesan CSV | Volume pesan rendah | Setelah > 200 pesan |

---

## 5. Rujukan Silang

| Dokumen | Relasi |
| --- | --- |
| `roadmap.md` | Kolom "Fase" tiap item memetakan ke fase F0–F4; exit criteria fase adalah syarat item `Must` fase tersebut selesai |
| `risks.md` | Risiko cakupan (scope creep) diimplementasikan lewat aturan §4.6 dan daftar Deferred §4.7 |
| `../06-QUALITY/test-plan.md` | Setiap acceptance criteria di atas harus punya minimal satu test case `TC-xx` |
| `../06-QUALITY/definition-of-done.md` | Syarat `Done` untuk tiap item |
| `../07-DEPLOYMENT/deployment-plan.md` | Item `PORT-A07`, `PORT-L08`, `PORT-M07` bersinggungan dengan pipeline deploy |