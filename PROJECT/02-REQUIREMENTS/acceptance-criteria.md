# 02 — Acceptance Criteria

**Format:** `AC-<modul>.<nomor>` · **Status setiap AC:** harus **PASS** agar story dianggap selesai.
Dokumen ini adalah kontrak antara owner (acceptance) dan developer (verifikasi). Tidak ada AC yang "dilewati" — jika tidak relevan, tandai **N/A** beserta alasannya di `06-QUALITY/definition-of-done.md`.

> Alias yang dipakai `02-REQUIREMENTS/user-stories.md` dipetakan di bagian 15.

---

## 1. Publik — Beranda (AC-01.x)

| ID | Kriteria (Given / When / Then) | Metode Verifikasi |
|---|---|---|
| AC-01.1 | Given table `projects` berisi data published, When visitor membuka `/`, Then beranda menampilkan section Hero, Services, Projects, About, Skills, Experience, Testimonials, Pricing, Blog, dan CTA sesuai urutan. | Manual |
| AC-01.2 | Given `settings.sections.projects = false`, When visitor membuka `/`, Then section Projects tidak dirender dan section lain tetap tampil. | Manual |
| AC-01.3 | Given `settings.theme.accent` diubah hex, When halaman dimuat ulang, Then warna aksen pada tombol, link, dan badge mengikuti nilai baru tanpa rebuild. | Manual |
| AC-01.4 | Given `settings.theme.mode = "light"`, When halaman dimuat, Then latar dan teks berganti ke tema terang dan kontras tetap ≥ 4.5:1. | Manual + Lighthouse |
| AC-01.5 | Given database kosong, When visitor membuka `/`, Then halaman tetap render dengan nilai default, tanpa error 500. | Manual |
| AC-01.6 | Given ada project `featured = true`, When beranda dimuat, Then blok project unggulan menampilkan maksimal 6 project tersebut. | Manual |
| AC-01.7 | Given `settings.features.showPricing = false`, When beranda dimuat, Then section Pricing tidak muncul. | Manual |
| AC-01.8 | Given `settings.features.hireMeEnabled = true`, When beranda dimuat, Then banner "hire me" tampil dengan tombol menuju `/contact`. | Manual |

## 2. Publik — Project (AC-02.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-02.1 | Given 3 project published dan 1 unpublished, When visitor membuka `/projects`, Then tepat 3 project published yang tampil, terurut `sort_order` ascending lalu `created_at` DESC. | Manual |
| AC-02.2 | Given project published dengan slug `toko-online`, When visitor membuka `/projects/toko-online`, Then detail lengkap tampil: judul, ringkasan, deskripsi, stack, tahun, dan tautan repo/live bila ada. | Manual |
| AC-02.3 | Given slug tidak ada di database, When visitor membuka `/projects/tidak-ada`, Then halaman 404 custom tampil dan HTTP status 404. | Manual + curl |
| AC-02.4 | Given project unpublished, When visitor membuka slug-nya langsung, Then halaman 404 tampil (tidak ada kebocoran draft). | Manual |
| AC-02.5 | Given daftar project, When visitor memilih filter kategori, Then hanya project kategori tersebut yang tampil tanpa reload penuh. | Manual |
| AC-02.6 | Given project tanpa cover image, When kartu dirender, Then tampil placeholder yang rapi, bukan gambar rusak. | Manual |

## 3. Publik — Blog (AC-03.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-03.1 | Given 2 artikel published dan 1 draft, When visitor membuka `/blog`, Then hanya 2 artikel published yang tampil, urut `published_at` DESC. | Manual |
| AC-03.2 | Given artikel published, When visitor membuka `/blog/[slug]`, Then isi artikel ter-render sebagai HTML (heading, list, blockquote, code, bold, link) — bukan teks mentah. | Manual |
| AC-03.3 | Given artikel tanpa `published_at` tetapi `published = true`, When disimpan dari admin, Then `published_at` terisi waktu saat itu dan artikel tampil di daftar. | Manual |
| AC-03.4 | Given artikel published, When visitor membuka halaman, Then metadata (title, description, keywords) terisi dan tag OG valid. | Inspect |

## 4. Publik — Tentang (AC-04.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-04.1 | Given data pengalaman, skill, dan testimoni, When visitor membuka `/about`, Then ketiganya tampil dalam urutan `sort_order`. | Manual |
| AC-04.2 | Given skill dengan `level = 85`, When dirender, Then bar persentase menampilkan 85% dan label "Mahir". | Manual |
| AC-04.3 | Given testimoni unpublished, When halaman dimuat, Then testimoni tersebut tidak tampil. | Manual |
| AC-04.4 | Given `settings.site.description` berubah, When `/about` dimuat, Then deskripsi profil memakai nilai baru. | Manual |

## 5. Publik — Layanan & Harga (AC-05.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-05.1 | Given 3 paket published, When visitor membuka `/services`, Then 3 kartu paket tampil beserta nama, deskripsi, fitur, dan harga. | Manual |
| AC-05.2 | Given paket `popular = true`, When halaman dimuat, Then paket tersebut punya badge highlight dan berada di posisi lebih tinggi dibanding paket biasa. | Manual |
| AC-05.3 | Given `price_value = "2500000"` dan `currency = "IDR"`, When dirender, Then harga tampil terformat rupiah ("Rp 2.500.000") mengikuti aturan `formatPrice`. | Manual |
| AC-05.4 | Given `price_value = "nego"`, When dirender, Then teks ditampilkan apa adanya tanpa format angka. | Manual |
| AC-05.5 | Given setiap paket, When diklik CTA-nya, Then visitor diarahkan ke `/contact`. | Manual |

## 6. Publik — Form Kontak (AC-06.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-06.1 | Given form valid (nama ≥ 2, email format valid, pesan ≥ 10), When dikirim, Then pesan tersimpan di tabel `messages` dengan status `new` dan visitor melihat konfirmasi sukses. | Manual |
| AC-06.2 | Given email tidak valid, When dikirim, Then pesan error per-field tampil dan tidak ada baris tersimpan. | Manual |
| AC-06.3 | Given honeypot `website` terisi, When dikirim, Then request ditolak dan pesan tidak tersimpan. | Manual |
| AC-06.4 | Given IP yang sudah mengirim 5 pesan dalam 10 menit, When mengirim lagi, Then request ditolak dengan pesan rate limit. | Manual |
| AC-06.5 | Given pesan tersimpan, When admin membuka `/admin/messages`, Then pesan tampil di posisi teratas berdasarkan `created_at` DESC. | Manual |

## 7. Publik — SEO (AC-07.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-07.1 | Given visitor membuka `/sitemap.xml`, Then XML valid memuat 6 rute statis + seluruh project & artikel published, dan tidak memuat draft. | Manual + validator |
| AC-07.2 | Given visitor membuka `/robots.txt`, Then file mencantumkan `Sitemap:` dan melarang `/admin` serta `/api`. | Manual |
| AC-07.3 | Given setiap halaman publik, When di-inspect, Then memiliki satu `<title>` unik dan satu meta description. | Inspect |
| AC-07.4 | Given halaman 404, When dirender, Then status HTTP 404 dan halaman custom berisi tautan kembali ke beranda. | curl |

## 8. Admin — Autentikasi (AC-08.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-08.1 | Given kredensial admin valid, When login, Then cookie `portfolio_session` terpasang dengan atribut httpOnly + sameSite=lax + secure (produksi) dan admin diarahkan ke `/admin`. | Inspect cookie |
| AC-08.2 | Given email/password salah, When login, Then pesan "Email atau password salah" tampil dan tidak ada cookie sesi yang terbit. | Manual |
| AC-08.3 | Given login gagal 5 kali consecutively dari IP yang sama, Then percobaan ke-6 ditolak selama 5 menit. | Manual |
| AC-08.4 | Given admin sudah login, When klik logout, Then cookie dihapus dan akses `/admin` kembali mengarahkan ke login. | Manual |
| AC-08.5 | Given visitor tanpa cookie, When membuka `/admin/projects`, Then dialihkan ke `/admin/login`. | Manual / curl |
| AC-08.6 | Given cookie dengan signature dimanipulasi, When membuka `/admin`, Then akses ditolak dan dialihkan ke login. | Manual (ubah 1 karakter payload) |
| AC-08.7 | Given password di DB, When diperiksa, Then nilainya berupa hash bcrypt, bukan plaintext. | Inspect DB |
| AC-08.8 | Given satu admin dengan role `admin`, When menjalankan server action mutasi, Then aksi succeeds; role selain `admin` mendapat 403. | Manual |

## 9. Admin — Dashboard (AC-09.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-09.1 | Given data di DB, When admin membuka `/admin`, Then tampil 4 kartu statistik (total project, artikel, pesan belum dibaca, paket layanan). | Manual |
| AC-09.2 | Given pesan baru masuk, When dashboard dimuat, Then angka pesan belum terbaca bertambah. | Manual |
| AC-09.3 | Given admin berada di halaman admin mana pun, When sidebar dibuka, Then item menu halaman aktif ter-highlight dan seluruh 9 menu dapat diakses. | Manual |

## 10. Admin — CRUD Generic (AC-10.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-10.1 | Given 6 resource (projects, posts, services, experience, skills, testimonials), When admin membuka `/admin/<resource>`, Then tampil tabel berisi data resource tersebut dengan kolom yang sesuai. | Manual |
| AC-10.2 | Given tabel kosong, When halaman dibuka, Then tampil empty state dengan tombol "Tambah". | Manual |
| AC-10.3 | Given form tambah, When data valid disubmit, Then baris baru muncul di tabel dan `created_at` terisi. | Manual |
| AC-10.4 | Given form dengan field wajib kosong, When disubmit, Then validasi menolak dan pesan error per-field tampil. | Manual |
| AC-10.5 | Given baris data, When klik "Edit" dan simpan, Then perubahan tersimpan dan tampil di tabel tanpa reload halaman. | Manual |
| AC-10.6 | Given baris data, When klik "Hapus" dan konfirmasi, Then baris terhapus dari database. | Manual |
| AC-10.7 | Given slug kosong pada form project, When disubmit, Then slug ter-generate dari judul (lowercase, non-alnum → `-`). | Manual |
| AC-10.8 | Given slug duplikat, When disubmit, Then sistem menolak dengan pesan jelas dan data lama tidak berubah. | Manual |
| AC-10.9 | Given field list/tags (stack, features, gallery, tags), When diisi multi-baris, Then disimpan sebagai array JSONB dan tampil sebagai chip. | Manual |
| AC-10.10 | Given checkbox boolean (featured, published, popular), When tidak dicentang, Then tersimpan `false` (bukan `null`/hilang). | Manual + Inspect DB |
| AC-10.11 | Given admin menekan tombol publish toggle, When berhasil, Then status berubah dan halaman publik ikut berubah setelah reload. | Manual |
| AC-10.12 | Given aksi yang sedang berjalan, When waiting, Then tombol menampilkan spinner dan dinonaktifkan (double submit dicegah). | Manual |

## 11. Admin — Inbox Pesan (AC-11.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-11.1 | Given pesan masuk, When admin membuka `/admin/messages`, Then tampil nama, email, subjek, budget, isi pesan, dan tanggal. | Manual |
| AC-11.2 | Given pesan berstatus `new`, When admin menandainya `read`, Then badge "belum dibaca" berkurang. | Manual |
| AC-11.3 | Given pesan, When diarsipkan, Then pesan hilang dari daftar default dan dapat difilter. | Manual |
| AC-11.4 | Given pesan, When dihapus, Then konfirmasi tampil dan baris hilang permanen. | Manual |
| AC-11.5 | Given IP viewer dari `/admin/messages`, Then tidak ada aksi yang bisa dijalankan tanpa sesi valid. | Manual |

## 12. Admin — Pengaturan (AC-12.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-12.1 | Given form pengaturan, When disimpan, Then pesan sukses tampil dan nilai tersimpan pada tabel `settings` per key. | Manual + Inspect DB |
| AC-12.2 | Given key `site`, When `name`, `tagline`, `email`, `phone`, `location`, `availability` diubah, Then seluruh halaman publik memakai nilai baru. | Manual |
| AC-12.3 | Given key `theme`, When accent & mode diubah, Then tampilan publik berubah warna dan mode. | Manual |
| AC-12.4 | Given key `sections`, When suatu section dimatikan, Then section tersebut hilang dari beranda. | Manual |
| AC-12.5 | Given key `socials`, When satu URL dikosongkan, Then ikon social tersebut tidak tampil di footer/header. | Manual |
| AC-12.6 | Given key `features`, When `hireMeEnabled`/`showPricing`/teks CTA diubah, Then banner & section pricing ikut berubah. | Manual |
| AC-12.7 | Given key `seo`, When meta title/description diubah, Then `<title>` dan meta description publik berubah. | Inspect |
| AC-12.8 | Given key `footer`, When tagline/copyright diubah, Then footer berubah dan bisa disembunyikan. | Manual |
| AC-12.9 | Given satu key pengaturan gagal disimpan, Then key lain tidak ikut terhapus (upsert per key). | Manual + Inspect DB |

## 13. Platform — Deploy & Operasional (AC-13.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-13.1 | Given repo terpasang ke Vercel dengan 3 env var, When push ke branch utama, Then build sukses dan situs ter-deploy di URL Vercel. | Manual |
| AC-13.2 | Given `DATABASE_URL` tidak di-set, When `next build` dijalankan lokal, Then build tetap berhasil (koneksi lazy). | Manual |
| AC-13.3 | Given `npm run db:setup`, When dijalankan, Then 9 tabel dibuat, seed terisi, dan akun admin dibuat dari `ADMIN_EMAIL`/`ADMIN_PASSWORD`. | Manual |
| AC-13.4 | Given env file, When `git status` dijalankan, Then `.env*` tidak tercatat sebagai file untuk di-commit. | Manual |
| AC-13.5 | Given halaman publik, When Lighthouse dijalankan (mobile), Then Performance ≥ 90 dan Accessibility ≥ 95. | Lighthouse |
| AC-13.6 | Given request ke `/api/tidak-ada`, When dipanggil, Then respons 404 JSON (bukan halaman HTML). | curl |

## 14. Non-Fungsional (AC-14.x)

| ID | Kriteria | Metode Verifikasi |
|---|---|---|
| AC-14.1 | Given seluruh route publik, When build dijalankan, Then First Load JS tiap route ≤ 120 kB. | Output build |
| AC-14.2 | Given `npx tsc --noEmit`, When dijalankan, Then 0 error. | Terminal |
| AC-14.3 | Given `npm audit --production`, When dijalankan, Then tidak ada vulnerability critical/high. | Terminal |
| AC-14.4 | Given halaman publik, When dibuka di viewport 360px, Then tidak ada scroll horizontal dan semua elemen utama dapat diakses. | Manual |
| AC-14.5 | Given keyboard only, When menjelajah beranda dan admin, Then seluruh elemen interaktif dapat difokus dengan indikator fokus terlihat. | Manual |
| AC-14.6 | Given query DB gagal (mis. string koneksi salah), When halaman dimuat, Then halaman tetap render (fallback) dan error tercatat di log server. | Manual |
| AC-14.7 | Given `robots.txt`, When diperiksa, Then `/admin` dan `/api` tidak di-crawl. | Manual |

## 15. Alias User Stories → Acceptance Criteria

| Story | AC terkait |
|---|---|
| US-P01 Melihat daftar project | AC-02.1, AC-02.5, AC-02.6 |
| US-P02 Membuka detail project | AC-02.2, AC-02.3, AC-02.4 |
| US-P03 Melihat paket & harga | AC-05.1–05.5 |
| US-P04 Mengirim inquiry | AC-06.1–06.5 |
| US-P05 Melihat profil & pengalaman | AC-04.1–04.4 |
| US-P06 Membaca artikel | AC-03.1–03.4 |
| US-P07 Ditemukan lewat mesin pencari | AC-07.1–07.4 |
| US-P08 Navigasi di ponsel | AC-14.4 |
| US-A01 Login | AC-08.1–08.3 |
| US-A02 Sesi bertahan & logout | AC-08.1, AC-08.4 |
| US-A03 Akses admin terlindungi | AC-08.5, AC-08.6, AC-08.8 |
| US-C01 Menambah project | AC-10.3, AC-10.4, AC-10.7 |
| US-C02 Mengubah project | AC-10.5 |
| US-C03 Mengapus project | AC-10.6 |
| US-C04 Publish & draft | AC-02.4, AC-10.11 |
| US-C05 Menulis artikel | AC-10.3, AC-03.3 |
| US-C06 Mengatur paket & harga | AC-05.3, AC-10.9 |
| US-C07 Mengatur pengalaman/skill/testimoni | AC-04.1–04.3 |
| US-C08 Pencarian data admin | AC-10.1, AC-10.2 |

## 16. Daftar Periksa Rilis (Release Checklist)

Sebelum go-live, semua box harus tercentang:

- [ ] AC-01.x sampai AC-14.x diuji (kecuali yang ditandai N/A dengan alasan tertulis)
- [ ] `npx tsc --noEmit` → 0 error
- [ ] `next build` → sukses
- [ ] `npm audit --production` → tidak ada critical/high
- [ ] Lighthouse beranda mobile: Perf ≥ 90, A11y ≥ 95
- [ ] Semua env var terisi di Vercel Production + Preview
- [ ] `npm run db:setup` dijalankan di database Neon produksi
- [ ] Password admin produksi diganti dari nilai default
- [ ] `robots.txt` & `sitemap.xml` valid
- [ ] 404 custom tampil dengan status 404
- [ ] Form kontak benar-benar menyimpan pesan ke DB produksi
- [ ] Cookie sesi terverifikasi httpOnly + secure di produksi
- [ ] Backup pertama database berhasil diunduh
- [ ] Dokumentasi `PROJECT/` lengkap dan sinkron dengan implementasi
