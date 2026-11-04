# 06 — Test Plan

Dokumen ini mendefinisikan strategi pengujian Portfolio CMS: cakupan, level pengujian, kasus uji, dan kriteria keluar (exit criteria) untuk rilis v1.

---

## 1. Strategi Pengujian

| Prinsip | Penerapan |
|---|---|
| Risiko-sentris | Fokus pada jalur otentikasi, input form, dan integritas data — bukan pada detail visual |
| Otomatis di mana mungkin | Type check + lint + build dijalankan sebagai gate pada setiap commit |
| Manual terstruktur | Perilaku UI, responsivitas, dan aksesibilitas diuji manual dengan checklist |
| Wajib sebelum rilis | Semua kasus P0 dan P1 berstatus Lulus |
| Jejak audit | Setiap kasus punya ID, sehingga regresi dapat ditelusuri ke AC terkait |

**Diagram cakupan:**
```
        /\          Unit Test (logic murni)
       /  \         - utils: formatDate, slugify, readingTime, formatPrice
      /----\        - settings: mergeSection (regresi merge parsial)
     /      \       - contact: skema Zod
    /________\      - resources: definisi & normalisasi field
   /\         \     Integration Test (server actions + DB)
  /  \         \    - CRUD tiap resource (create/read/update/delete)
 /____\_________\   - settings save & read-back
/                  \  - message submit
                    E2E Manual (perilaku pengguna)
                    - login → buat project → tampil di beranda
                    - kirim pesan → cek inbox
                    - ubah tema → cek seluruh halaman
```

## 2. Tooling

| Tool | Peran | Perintah |
|---|---|---|
| TypeScript Compiler | Validasi tipe seluruh repo | `npx tsc --noEmit` |
| ESLint | Konsistensi kode & best practice | `npx next lint` |
| Next.js Build | Gate produksi (menangkap masalah bundling/SSR) | `npx next build` |
| Vitest | Unit test logika murni (environment `node`) | `npm test` |
| Manual + DevTools | E2E, responsif, audit Lighthouse | — |
| `curl` | Uji kontrak API | — |

> **Status implementasi:** Vitest sudah terpasang (`vitest.config.ts`) dengan 60 unit test di 5 berkas: `src/lib/slug.test.ts`, `src/lib/format.test.ts`, `src/lib/rate-limit.test.ts`, `src/lib/validation/schemas.test.ts`, dan `src/lib/contact.test.ts`. Seluruh tes berjalan tanpa database sehingga aman dijalankan di CI. E2E otomatis (Playwright) belum dipasang — bagian manual di §6 masih menjadi acuan.

## 3. Level 1 — Unit Test

### 3.1 `src/lib/utils.ts`

| ID | Kasus | Input | Ekspektasi |
|---|---|---|---|
| U-UTL-01 | `slugify` basic | `"Toko Online Sederhana"` | `"toko-online-sederhana"` |
| U-UTL-02 | `slugify` cleans symbols | `"Halaman #1: Blog & News!"` | `"halaman-1-blog-news"` |
| U-UTL-03 | `slugify` empty | `"---"` | `""` |
| U-UTL-04 | `formatDate` valid | `"2025-03-15"` | `"15 Maret 2025"` |
| U-UTL-05 | `formatDate` invalid | `"bukan tanggal"` | teks fallback (bukan `Invalid Date`) |
| U-UTL-06 | `readingTime` | 600 kata | `"4 menit baca"` |
| U-UTL-07 | `readingTime` minimum | 20 kata | `"1 menit baca"` |
| U-UTL-08 | `formatPrice` IDR | `2500000` | `"Rp 2.500.000"` |
| U-UTL-09 | `formatPrice` nol | `0` | `"Rp 0"` |
| U-UTL-10 | `cn` merge | `cn("a", false && "b", "c")` | `"a c"` |

### 3.2 `src/lib/settings.ts` (merge rekursif)

| ID | Kasus | Ekspektasi |
|---|---|---|
| U-SET-01 | Partial override | `accent` berubah, `mode` tetap default |
| U-SET-02 | Nested object | `site.heroTitle` berubah, `site.name` tetap |
| U-SET-03 | Key baru | key yang tidak ada di default ditambahkan |
| U-SET-04 | Nilai bukan objek | ditolak, default dipertahankan |
| U-SET-05 | Merging idempoten | merge dua kali menghasilkan hasil sama |

### 3.3 `src/lib/contact.ts` (Zod)

| ID | Kasus | Ekspektasi |
|---|---|---|
| U-CON-01 | Payload valid | parse sukses |
| U-CON-02 | Nama < 2 karakter | gagal, `name` error |
| U-CON-03 | Email tidak valid | gagal, `email` error |
| U-CON-04 | Pesan < 10 karakter | gagal, `message` error |
| U-CON-05 | Honeypot terisi | gagal, `website` error |
| U-CON-06 | Trim whitespace | tersimpan tanpa spasi tepi |
| U-CON-07 | Field opsional kosong | default `""`, bukan `undefined` |

## 4. Level 2 — Integration Test (Server Action + Neon)

Dijalankan terhadap database uji (Neon branch terpisah), bukan production.

| ID | Modul | Skenario | Ekspektasi |
|---|---|---|---|
| I-AUT-01 | `loginAction` | email+password benar | redirect `/admin`, cookie `portfolio_session` terpasang |
| I-AUT-02 | `loginAction` | password salah | error generik, tidak ada cookie |
| I-AUT-03 | `loginAction` | email tidak ada | error identik dengan I-AUT-02 (tidak membocorkan) |
| I-AUT-04 | `requireAdmin` | tanpa sesi | ditolak (401/redirect), tidak ada mutasi data |
| I-AUT-05 | `logoutAction` | sesi aktif | cookie dihapus, `/admin` tidak bisa diakses |
| I-SET-01 | `saveSettings` | simpan tema baru | nilai tersimpan, terbaca kembali identik |
| I-SET-02 | `saveSettings` | simpan sebagian | field lain tidak berubah (regresi merge) |
| I-SET-03 | `saveSettings` | hex warna invalid | ditolak |
| I-RES-01 | create resource | `projects` | baris baru ada, `created_at` terisi |
| I-RES-02 | update resource | ubah judul | baris ter-update, `updated_at` berubah |
| I-RES-03 | delete resource | hapus | baris hilang |
| I-RES-04 | toggle publish | `published=false` | item hilang dari daftar publik |
| I-RES-05 | resource tak dikenal | slug ngawur | 404, bukan 500 |
| I-RES-06 | slug otomatis | judul tanpa slug | slug ter-generate unik |
| I-RES-07 | slug duplikat | dua item slug sama | uniqueness ditangani (suffix/unique constraint) |
| I-MSG-01 | `submitMessage` | payload valid | baris di `messages` tersimpan, status `new` |
| I-MSG-02 | `submitMessage` | honeypot terisi | tidak ada baris tersimpan |
| I-MSG-03 | `submitMessage` | spam > 5 | ditolak dengan 429 |
| I-MSG-04 | `markMessageRead` | ubah status | `status` berubah `new` → `read` |
| I-DB-01 | `getSettings` | tanpa baris settings | return default, bukan error |
| I-DB-02 | `query()` | parameterized | nilai berisi `'` tidak merusak query |

## 5. Level 3 — Uji API (Kontrak)

Dikurasi dari `04-ARCHITECTURE/api-specification.yaml`.

| ID | Endpoint | Skenario | Ekspektasi |
|---|---|---|---|
| A-01 | `GET /api/projects` | normal | 200, `data` array, `count` sesuai |
| A-02 | `GET /api/projects` | db down | 500 dengan bentuk `{error}` |
| A-03 | `GET /api/projects/{slug}` | slug valid | 200, `data` objek project |
| A-04 | `GET /api/projects/{slug}` | slug salah | 404 `{error}` |
| A-05 | `GET /api/posts` | dengan `?tag=` | hanya post dengan tag tersebut |
| A-06 | `GET /api/services` | normal | 200, array |
| A-07 | `GET /api/settings/public` | normal | 200, hanya kunci publik |
| A-08 | `GET /api/settings/public` | cek kebocoran | tidak ada `password_hash`, `AUTH_SECRET`, `DATABASE_URL` |
| A-09 | `POST /api/messages` | valid | 201 `{ok:true}` |
| A-10 | `POST /api/messages` | JSON rusak | 400 |
| A-11 | `POST /api/messages` | field invalid | 422 dengan `details` |
| A-12 | `POST /api/messages` | 6× dalam 10 menit | 429 + header rate limit |
| A-13 | `POST /api/revalidate` | secret benar | 200 `{revalidated:true}` |
| A-14 | `POST /api/revalidate` | secret salah | 401 |
| A-15 | `GET /api/health` | normal | 200 `{status:"ok"}` |

## 6. Level 4 — Uji Manual E2E (Perjalanan Pengguna)

### 6.1 Perjalanan Pengunjung

| ID | Langkah | Ekspektasi |
|---|---|---|
| E2E-V-01 | Buka beranda | Semua section termuat, tidak ada error di console |
| E2E-V-02 | Klik "Lihat Project" | Buka `/projects`, grid tampil |
| E2E-V-03 | Klik salah satu card | Buka detail, gambar + stack + deskripsi tampil |
| E2E-V-04 | Filter kategori | Query string berubah, hasil ter-filter |
| E2E-V-05 | Buka `/blog`, klik artikel | Artikel tampil, tanggal & tag benar |
| E2E-V-06 | Buka `/services` | Paket + harga + fitur tampil, format rupiah benar |
| E2E-V-07 | Isi form kontak & kirim | Pesan sukses, form kosong, toast hijau |
| E2E-V-08 | Kirim form kosong | Validasi per-field, pesan error merah |
| E2E-V-09 | Buka `/about` | Profil, pengalaman, skill, testimoni tampil |
| E2E-V-10 | Ubah URL ke slug tidak ada | Halaman 404 custom |

### 6.2 Perjalanan Admin

| ID | Langkah | Ekspektasi |
|---|---|---|
| E2E-A-01 | Buka `/admin` tanpa login | Redirect ke `/admin/login` |
| E2E-A-02 | Login dengan data benar | Masuk dashboard, 4 kartu statistik tampil |
| E2E-A-03 | Tambah project baru | Project muncul di tabel dan di beranda (jika published) |
| E2E-A-04 | Edit project | Perubahan tersimpan dan tampil |
| E2E-A-05 | Hapus project | Dialog konfirmasi, data hilang |
| E2E-A-06 | Tambah artikel | Artikel tampil di `/blog` |
| E2E-A-07 | Tambah layanan | Paket tampil di `/services` |
| E2E-A-08 | Buka inbox pesan | Pesan dari langkah E2E-V-07 ada di sana |
| E2E-A-09 | Tandai pesan dibaca | Badge "baru" hilang |
| E2E-A-10 | Ubah warna aksen di pengaturan | Warna berubah di seluruh situs |
| E2E-A-11 | Matikan section "Blog" | Section hilang di beranda |
| E2E-A-12 | Ubah pricing: sembunyikan | Section pricing hilang |
| E2E-A-13 | Ubah logo & tagline | Tampil di header & footer |
| E2E-A-14 | Logout | Kembali ke login, `/admin` tak bisa diakses |

### 6.3 Uji Responsif

| ID | Viewport | Fokus |
|---|---|---|
| R-01 | 360 × 740 | Mobile: 1 kolom, menu drawer, tombol ≥ 44px |
| R-02 | 768 × 1024 | Tablet: grid 2 kolom project, sidebar admin jadi drawer |
| R-03 | 1440 × 900 | Desktop: 3 kolom project, sidebar admin tampil |
| R-04 | 1920 × 1080 | Konten terpusat, lebar container 1200px |

### 6.4 Uji Aksesibilitas

| ID | Pemeriksaan | Ekspektasi |
|---|---|---|
| A11Y-01 | Tab order | seluruh elemen interaktif terjangkau keyboard |
| A11Y-02 | Focus visible | ring fokus terlihat di semua tombol/field |
| A11Y-03 | Kontras teks | rasio ≥ 4.5:1 untuk teks normal |
| A11Y-04 | Label form | setiap input punya label terasosiasi |
| A11Y-05 | `prefers-reduced-motion` | animasi dimatikan |
| A11Y-06 | Heading order | h1 → h2 → h3 tanpa lompat |
| A11Y-07 | Alt text | gambar deskriptif punya alt; dekoratif punya alt kosong |
| A11Y-08 | Error form | diumumkan (`role="alert"`, `aria-describedby`) |

## 7. Uji Keamanan

| ID | Uji | Metode | Ekspektasi |
|---|---|---|---|
| SEC-01 | SQL injection | slug `'` / `1 OR 1=1` | aman, 404, tidak 500 |
| SEC-02 | XSS stored | simpan `<script>alert(1)</script>` di artikel | ter-escape saat render |
| SEC-03 | XSS reflected | `?q=<script>` | aman |
| SEC-04 | CSRF | POST server action dari origin lain | ditolak |
| SEC-05 | Cookie flags | `Set-Cookie` di respons login | HttpOnly, SameSite=Lax, Secure (prod) |
| SEC-06 | JWT tamper | ubah 1 karakter payload | ditolak, redirect login |
| SEC-07 | JWT algoritma | `alg: none` | ditolak |
| SEC-08 | Password hashing | cek kolom di DB | bcrypt hash, bukan plaintext |
| SEC-09 | Akses admin | `curl /admin` tanpa cookie | redirect, bukan 200 |
| SEC-10 | API leak | `GET /api/settings/public` | tidak ada secret |
| SEC-11 | Rate limit | 6× submit pesan | request ke-6 ditolak |
| SEC-12 | Honeypot | isi `website` | ditolak, tidak tersimpan |
| SEC-13 | Header keamanan | `curl -I` | semua header present |
| SEC-14 | Secret di repo | `git grep` | bersih |
| SEC-15 | Path traversal | `GET /api/projects/../../etc/passwd` | 404/400 |

## 8. Uji Performa

| ID | Skenario | Target |
|---|---|---|
| PF-01 | TTFB beranda (cache warm) | < 500 ms |
| PF-02 | TTFB halaman detail project | < 700 ms |
| PF-03 | Lighthouse Performance (mobile) | ≥ 90 |
| PF-04 | Lighthouse Accessibility | ≥ 95 |
| PF-05 | Lighthouse SEO | ≥ 95 |
| PF-06 | Lighthouse Best Practices | ≥ 90 |
| PF-07 | Bundle JS halaman publik | < 150 KB (gzipped) |
| PF-08 | CLS | < 0.1 (font & gambar reserved space) |
| PF-09 | 50 pesan masuk beruntun | tidak error, tetap responsif |

## 9. Uji Kompatibilitas

| Browser | Versi minimal | Target |
|---|---|---|
| Chrome | 120 | Desktop & Android |
| Safari | 17 | macOS & iOS |
| Firefox | 121 | Desktop |
| Edge | 120 | Desktop |
| Samsung Internet | 23 | Android |

## 10. Regression Suite (Wajib Setiap Release)

```
1. npx tsc --noEmit          → exit 0
2. npx next lint             → 0 error
3. npx next build            → exit 0
4. E2E-V-01 s/d E2E-V-10     → semua lulus
5. E2E-A-01 s/d E2E-A-14     → semua lulus
6. SEC-01 s/d SEC-15         → semua lulus
7. A-01 s/d A-15             → semua lulus
8. Smoke test deployment Vercel preview
```

## 11. Exit Criteria Rilis

Rilis dianggap siap bila **seluruh** kondisi berikut terpenuhi:

- [ ] 100% kasus P0/P1 pada tabel di atas berstatus Lulus.
- [ ] `npx tsc --noEmit`, `npx next lint`, `npx next build` → exit 0.
- [ ] 0 temuan keamanan terbuka dengan severity Critical atau High.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- [ ] Checklist keamanan rilis (`04-ARCHITECTURE/security-design.md` §8) terisi penuh.
- [ ] Minimal 1 backup database berhasil dibuat dan dipulihkan uji.
- [ ] Konten demo dibersihkan (project contoh, akun admin bawaan, pesan uji).
- [ ] Dokumentasi (`PROJECT/`) sesuai dengan implementasi aktual.

## 12. Matriks Pelacakan AC ↔ Test

| AC | Test terkait |
|---|---|
| AC-01.x Beranda | E2E-V-01, R-01..04, PF-01, A11Y-* |
| AC-02.x Project | E2E-V-02..04, I-RES-01..07, A-01..04 |
| AC-03.x Detail | E2E-V-03, SEC-01, A11Y-07 |
| AC-04.x Blog | E2E-V-05, A-05 |
| AC-05.x Layanan | E2E-V-06, A-06 |
| AC-06.x Kontak | E2E-V-07/08, U-CON-*, I-MSG-*, A-09..12, SEC-11/12 |
| AC-07.x SEO/404 | E2E-V-10, A11Y-06 |
| AC-08.x Auth | I-AUT-01..05, E2E-A-01/02, SEC-05..09 |
| AC-09.x Dashboard | E2E-A-02 |
| AC-10.x CRUD | I-RES-*, E2E-A-03..07 |
| AC-11.x Pesan | I-MSG-04, E2E-A-08/09 |
| AC-12.x Settings | I-SET-01..03, U-SET-*, E2E-A-10..13, A-08/10 |
| AC-13.x API | A-01..A-15 |
| AC-14.x Non-fungsional | PF-*, SEC-*, R-*, A11Y-* |
| AC-15.x Deploy | Checklist `07-DEPLOYMENT/deployment-plan.md` |
