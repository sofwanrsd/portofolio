# Implementation Plan: Portfolio Website

## Overview

Rencana implementasi ini mengubah desain Portfolio_Website (Astro + Tailwind statis dengan React islands, lapisan data Supabase yang diakses runtime dari peramban via Kunci_Anon dengan RLS, Halaman_Admin SPA untuk CRUD, mode tema terang/gelap, Meta_Tag SEO, konfigurasi Apache, dan Pipeline_CICD GitHub Actions) menjadi serangkaian langkah pengkodean inkremental.

Urutan tugas mengikuti prinsip: logika murni (`transforms.ts`, `validation.ts`, util tema/navigasi/meta/mailto/admin-session) dan model data lebih dahulu serta diuji dengan property-based testing (fast-check + Vitest, 17 properti dari desain), lalu lapisan akses data, kemudian islands publik dengan state pemuatan/kesalahan/kosong, kemudian Halaman_Admin + autentikasi, kemudian tema/SEO, konfigurasi Apache, dan terakhir Pipeline_CICD. Setiap tugas berakhir dengan integrasi sehingga tidak ada kode menggantung. Bahasa implementasi: **TypeScript**.

## Tasks

- [x] 1. Siapkan struktur proyek dan tooling
  - [x] 1.1 Inisialisasi proyek Astro dengan Tailwind, React, Vitest, dan fast-check
    - Buat proyek Astro (`output: 'static'`) dengan integrasi `@astrojs/react` dan Tailwind (`darkMode: 'class'`)
    - Buat struktur direktori `src/config`, `src/layouts`, `src/lib`, `src/components/public`, `src/components/admin`, `src/pages`
    - Konfigurasikan Vitest + fast-check (`{ numRuns: 100 }` sebagai default) dan skrip `test`/`build`
    - Siapkan environment variable publik `PUBLIC_SUPABASE_URL` dan `PUBLIC_SUPABASE_ANON_KEY` (tanpa kunci rahasia)
    - _Requirements: 4.1, 4.6_

  - [x] 1.2 Definisikan tipe domain dan antarmuka konfigurasi situs
    - Buat tipe `Profile`, `Skill`, `SkillCategory`, `Project`, `HistoryEntry`, `FetchResult<T>`, `WriteResult`, `FieldErrors` di `src/lib/types.ts`
    - Buat antarmuka `SiteConfig` dan nilai `src/config/site.ts` (title, description, url, ogImageUrl, ownerEmail, socialLinks)
    - _Requirements: 6.1, 18.1, 18.2_

- [x] 2. Implementasikan logika transformasi murni (`src/lib/transforms.ts`)
  - [x] 2.1 Implementasikan `groupSkills`, `limitSkills`, `sortHistoryDesc`, dan `formatPeriod`
    - `groupSkills` mempartisi keahlian ke kategori language/framework/tool
    - `limitSkills` membatasi ke 50 entri pertama
    - `sortHistoryDesc` mengurutkan riwayat berdasarkan `startDate` menurun
    - `formatPeriod` memformat periode dengan penanda "sekarang" bila `endDate` null
    - _Requirements: 2.4, 2.8, 15.4, 15.5_

  - [x]* 2.2 Tulis property test untuk `groupSkills`
    - **Property 1: Pengelompokan keahlian mempertahankan keanggotaan**
    - **Validates: Requirements 2.4**

  - [x]* 2.3 Tulis property test untuk `limitSkills`
    - **Property 2: Pembatasan keahlian ke 50 entri pertama**
    - **Validates: Requirements 2.8**

  - [x]* 2.4 Tulis property test untuk `sortHistoryDesc`
    - **Property 3: Riwayat terurut kronologis menurun**
    - **Validates: Requirements 15.5**

  - [x]* 2.5 Tulis property test untuk `formatPeriod`
    - **Property 4: Format periode menandai entri berjalan**
    - **Validates: Requirements 15.4**

- [x] 3. Implementasikan logika validasi murni (`src/lib/validation.ts`)
  - [x] 3.1 Implementasikan `isValidUrl`, `validateProject`, `validateSkill`, `validateProfile`, dan `validateHistory`
    - Tegakkan aturan wajib, batas panjang, kategori, skala level 1–5, validitas URL, dan urutan tanggal sesuai desain
    - Kembalikan `FieldErrors` (kosong berarti valid)
    - _Requirements: 1.5, 2.5, 12.2, 12.3, 12.4, 13.2, 13.3, 14.2, 14.3, 14.4, 16.2, 16.3, 16.4_

  - [x]* 3.2 Tulis property test untuk `validateProject`
    - **Property 5: Validasi proyek menegakkan kolom wajib, batas panjang, dan URL**
    - **Validates: Requirements 12.3, 12.4**

  - [x]* 3.3 Tulis property test untuk `validateSkill`
    - **Property 6: Validasi keahlian menegakkan kolom wajib, kategori, dan skala level**
    - **Validates: Requirements 13.3, 2.5**

  - [x]* 3.4 Tulis property test untuk `validateProfile`
    - **Property 7: Validasi profil menegakkan kolom wajib, panjang deskripsi, dan URL foto**
    - **Validates: Requirements 1.5, 14.3, 14.4**

  - [x]* 3.5 Tulis property test untuk `validateHistory`
    - **Property 8: Validasi riwayat menegakkan kolom wajib dan urutan tanggal**
    - **Validates: Requirements 16.3, 16.4**

- [x] 4. Implementasikan utilitas tema (`src/lib/theme.ts` + token palet)
  - [x] 4.1 Implementasikan `resolveTheme`, `toggleTheme`, persistensi localStorage, dan token palet kontras
    - `resolveTheme` memprioritaskan preferensi tersimpan lalu `prefers-color-scheme`
    - `toggleTheme` membalik nilai tema; sediakan fungsi baca/tulis preferensi tersimpan
    - Definisikan token warna teks/latar untuk mode terang dan gelap pada konfigurasi Tailwind
    - _Requirements: 17.2, 17.3, 17.4, 17.5, 17.6_

  - [x]* 4.2 Tulis property test untuk `resolveTheme`
    - **Property 10: Resolusi tema memprioritaskan preferensi tersimpan**
    - **Validates: Requirements 17.2, 17.5**

  - [x]* 4.3 Tulis property test untuk `toggleTheme`
    - **Property 11: Toggle tema bersifat involusi**
    - **Validates: Requirements 17.3**

  - [x]* 4.4 Tulis property test untuk round-trip persistensi tema
    - **Property 12: Persistensi tema bersifat round-trip**
    - **Validates: Requirements 17.4**

  - [x]* 4.5 Tulis property test untuk kontras token palet
    - **Property 13: Kontras warna memenuhi ambang aksesibilitas**
    - **Validates: Requirements 17.6**

- [x] 5. Implementasikan utilitas navigasi, mailto, meta, tautan proyek, dan sesi admin
  - [x] 5.1 Implementasikan util penentu tautan aktif, util mailto, util render meta, util tautan eksternal proyek, dan `resolveAdminView`
    - Util navigasi menandai tepat satu tautan aktif sesuai bagian terlihat
    - Util mailto menghasilkan `href` `"mailto:" + email`
    - Util render meta hanya menghasilkan tag untuk nilai yang dikonfigurasi
    - Util tautan proyek menghasilkan anchor dengan `target="_blank"` dan `rel` mengandung `noopener`
    - `resolveAdminView` mengembalikan `'dashboard'`/`'login'` berdasarkan validitas sesi
    - _Requirements: 3.7, 5.4, 5.5, 6.1, 11.1, 11.6, 11.7, 18.5_

  - [x]* 5.2 Tulis property test untuk util penentu tautan aktif
    - **Property 14: Tepat satu tautan navigasi aktif sesuai bagian terlihat**
    - **Validates: Requirements 5.4, 5.5**

  - [x]* 5.3 Tulis property test untuk util tautan eksternal proyek
    - **Property 15: Tautan eksternal dibuka di tab baru dengan aman**
    - **Validates: Requirements 3.7**

  - [x]* 5.4 Tulis property test untuk util mailto
    - **Property 16: Tautan mailto teralamat dengan benar**
    - **Validates: Requirements 6.1**

  - [x]* 5.5 Tulis property test untuk util render meta
    - **Property 17: Render meta tag hanya untuk nilai yang dikonfigurasi**
    - **Validates: Requirements 18.5**

  - [x]* 5.6 Tulis property test untuk `resolveAdminView`
    - **Property 9: Resolusi tampilan admin berdasarkan sesi**
    - **Validates: Requirements 11.1, 11.6, 11.7**

- [x] 6. Checkpoint - Pastikan seluruh uji logika murni lulus
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Siapkan skema basis data dan kebijakan RLS (Data Model)
  - [x] 7.1 Buat migrasi skema tabel `profile`, `skills`, `projects`, `history`
    - Definisikan kolom, tipe, dan constraint (panjang deskripsi 1–500, judul ≤100, deskripsi proyek ≤300, level 1–5, `end_date >= start_date`, `is_public`)
    - _Requirements: 1.5, 2.4, 2.5, 3.3, 13.2, 16.4_

  - [x] 7.2 Buat migrasi kebijakan RLS untuk keempat tabel
    - Aktifkan RLS; policy baca publik (`is_public = true`) untuk anon; policy tulis/ubah/hapus hanya untuk peran `authenticated`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implementasikan lapisan akses data baca
  - [x] 8.1 Implementasikan `src/lib/supabaseClient.ts`
    - Inisialisasi Supabase JS client dengan Kunci_Anon publik dan opsi `persistSession`/`autoRefreshToken`
    - _Requirements: 4.1, 4.6, 11.6_

  - [x] 8.2 Implementasikan `getProfile`, `getSkills`, `getProjects`, `getHistory` (`src/lib/dataAccess.ts`)
    - Kembalikan `FetchResult<T>`; konversi kegagalan menjadi `{ status: 'error' }` tanpa melempar exception
    - _Requirements: 1.1, 2.1, 3.1, 15.1_

  - [x]* 8.3 Tulis unit test untuk lapisan akses data
    - Mock Supabase client; uji jalur sukses, kosong, dan error
    - _Requirements: 1.1, 2.1, 3.1, 15.1_

- [x] 9. Implementasikan komponen tampilan state bersama
  - [x] 9.1 Implementasikan komponen `StateViews` (spinner, pesan error + tombol "Coba lagi", pesan kosong)
    - Sediakan komponen reusable untuk State_Pemuatan, State_Kesalahan, dan empty state
    - _Requirements: 1.2, 1.6, 2.2, 2.6, 2.7, 3.2, 3.8, 3.9, 15.2, 15.6, 15.7_

  - [x]* 9.2 Tulis unit test untuk `StateViews`
    - Verifikasi tombol "Coba lagi" memicu callback dan render kondisi loading/error/empty
    - _Requirements: 1.2, 1.6, 2.7, 3.9, 15.7_

- [x] 10. Implementasikan islands bagian publik
  - [x] 10.1 Implementasikan `AboutIsland`
    - Fetch profil; render nama, foto (fallback placeholder via `onerror`), deskripsi; mesin state loading/error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7_

  - [x]* 10.2 Tulis unit test untuk `AboutIsland`
    - Uji state loading/loaded/error dan fallback gambar
    - _Requirements: 1.2, 1.6, 1.7_

  - [x] 10.3 Implementasikan `SkillsIsland`
    - Gunakan `groupSkills` + `limitSkills`; indikator level 1–5; empty state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x]* 10.4 Tulis unit test untuk `SkillsIsland`
    - Uji pengelompokan, batas 50, indikator level, dan empty state
    - _Requirements: 2.4, 2.6, 2.8_

  - [x] 10.5 Implementasikan `ProjectsIsland`
    - Kartu judul/deskripsi/preview (fallback placeholder), tag tech stack, tautan GitHub & demo via util tautan eksternal; empty state
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x]* 10.6 Tulis unit test untuk `ProjectsIsland`
    - Uji render tautan, fallback gambar, dan empty state
    - _Requirements: 3.8, 3.10_

  - [x] 10.7 Implementasikan `HistoryIsland`
    - Linimasa dengan `sortHistoryDesc` + `formatPeriod`; empty state
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [x]* 10.8 Tulis unit test untuk `HistoryIsland`
    - Uji urutan kronologis, penanda "sekarang", dan empty state
    - _Requirements: 15.4, 15.5, 15.6_

  - [x] 10.9 Implementasikan `NavBar`
    - 5 tautan; sticky; smooth scroll dengan offset; active link via IntersectionObserver; hamburger <768px
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.5, 7.6, 7.7_

  - [x]* 10.10 Tulis unit test untuk `NavBar`
    - Uji struktur 5 tautan, kondisi awal hamburger tertutup, dan penandaan tautan aktif
    - _Requirements: 5.1, 7.5, 7.7_

  - [x] 10.11 Implementasikan `ThemeToggle`
    - Alihkan kelas `dark` pada `<html>` dan simpan preferensi ke localStorage menggunakan util tema
    - _Requirements: 17.1, 17.3, 17.4_

  - [x]* 10.12 Tulis unit test untuk `ThemeToggle`
    - Uji toggle kelas dan persistensi localStorage
    - _Requirements: 17.3, 17.4_

- [x] 11. Checkpoint - Pastikan seluruh uji islands publik lulus
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implementasikan lapisan tulis admin (`src/lib/adminApi.ts`)
  - [x] 12.1 Implementasikan fungsi CRUD untuk proyek, keahlian, riwayat, dan pembaruan profil
    - Setiap operasi menjalankan validasi murni dahulu; bila ada error kembalikan tanpa memanggil Supabase; bila gagal kembalikan `{ ok: false, message }`
    - _Requirements: 12.1, 12.5, 12.7, 12.8, 13.1, 13.4, 13.6, 13.7, 14.1, 14.5, 14.7, 16.1, 16.5, 16.7, 16.8_

  - [x]* 12.2 Tulis unit test untuk lapisan tulis admin
    - Mock Supabase; uji validasi membatalkan tulis, sukses tulis, dan kegagalan mempertahankan data sebelumnya
    - _Requirements: 12.8, 13.7, 14.7, 16.8_

- [x] 13. Implementasikan Halaman_Admin SPA dan autentikasi
  - [x] 13.1 Implementasikan `AdminApp` (cek sesi, routing internal berbasis state, `onAuthStateChange`)
    - Gunakan `resolveAdminView`; lindungi rute; render Login atau Dashboard; kembalikan ke Login saat sesi kedaluwarsa
    - _Requirements: 11.1, 11.6, 11.7_

  - [x] 13.2 Implementasikan `LoginView`
    - Form email + kata sandi; `signInWithPassword`; pesan kesalahan autentikasi generik
    - _Requirements: 11.2, 11.3_

  - [x] 13.3 Implementasikan `Dashboard` dengan navigasi tab dan aksi logout
    - Aksi logout (`signOut`) mengakhiri sesi dan mengarahkan ke Login
    - _Requirements: 11.4, 11.5_

  - [x] 13.4 Implementasikan `ProjectForm` dan `ProjectList`
    - Kolom isian proyek + validasi; aksi buat/sunting/hapus + konfirmasi keberhasilan
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [x] 13.5 Implementasikan `SkillForm` dan `SkillList`
    - Kolom isian keahlian + validasi; aksi buat/sunting/hapus + konfirmasi keberhasilan
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 13.6 Implementasikan `ProfileForm`
    - Sunting satu rekaman profil + validasi; konfirmasi keberhasilan
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 13.7 Implementasikan `HistoryForm` dan `HistoryList`
    - Kolom isian riwayat + validasi tanggal; aksi buat/sunting/hapus + konfirmasi keberhasilan
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [x]* 13.8 Tulis unit test untuk komponen admin
    - Uji proteksi rute, jalur login sukses/gagal, render form, dan pemertahanan data saat tulis gagal; uji tata letak responsif admin
    - _Requirements: 11.1, 11.3, 7.9, 12.8, 16.8_

- [x] 14. Checkpoint - Pastikan seluruh uji admin lulus
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implementasikan layout, sistem tema, SEO/Meta_Tag, dan perakitan halaman
  - [x] 15.1 Implementasikan `BaseLayout.astro` dengan head, Meta_Tag, dan skrip tema anti-FOUC
    - Render `<head>` statis dari `site.ts` via util render meta (title, description, Open_Graph, Twitter card, favicon); skrip inline blocking penerapan tema
    - _Requirements: 17.2, 17.5, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6_

  - [x] 15.2 Implementasikan Bagian_Kontak statis dengan Tautan_Mailto dan tautan profesional
    - Render mailto dari util; tautan profesional `target="_blank"`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 15.3 Rakit `index.astro` dengan seluruh islands dan tata letak responsif
    - Wire AboutIsland, SkillsIsland, ProjectsIsland, HistoryIsland, NavBar, ThemeToggle, Bagian_Kontak; terapkan grid responsif (ponsel/tablet/desktop, lebar maksimum, tanpa gulir horizontal)
    - _Requirements: 1.4, 5.1, 7.1, 7.2, 7.3, 7.4, 7.8_

  - [x] 15.4 Buat `admin/index.astro` (memuat `AdminApp` via `client:only`) dan `404.astro`
    - Halaman admin client-rendered dan halaman 404 kustom
    - _Requirements: 8.2, 11.1_

  - [x]* 15.5 Tulis unit test untuk render head/Meta_Tag
    - Verifikasi kehadiran title, description, Open_Graph, Twitter card, dan favicon; tidak ada tag berkonten kosong
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6_

- [x] 16. Konfigurasikan penyajian Apache
  - [x] 16.1 Buat `public/.htaccess` dan konfigurasi vhost
    - `ErrorDocument 404 /404.html`, kompresi `mod_deflate` untuk teks, fallback `/admin` ke `index.html`, DocumentRoot, tanpa redirect HTTPS pada fase awal
    - _Requirements: 8.2, 8.3, 8.4, 9.1, 9.2_

  - [x]* 16.2 Tulis uji integrasi Apache
    - Uji HTTP: status 200 halaman utama, 404 kustom, header kompresi pada berkas teks, tanpa redirect HTTPS
    - _Requirements: 8.1, 8.2, 8.4, 8.6, 9.1, 9.2_

- [x] 17. Implementasikan Pipeline_CICD GitHub Actions
  - [x] 17.1 Buat `.github/workflows/deploy.yml`
    - Trigger push; `npm ci` + `astro build`; injeksi `PUBLIC_*` dari Secrets; rsync over SSH ke staging; verifikasi jumlah & ukuran berkas; atomic swap ke DocumentRoot; `timeout-minutes` ≤ 5; pertahankan versi lama saat gagal
    - _Requirements: 4.6, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x]* 17.2 Tulis uji integrasi Pipeline_CICD pada branch percobaan
    - Verifikasi build sukses men-deploy, build gagal mempertahankan versi lama, dan langkah verifikasi jumlah/ukuran berkas berjalan
    - _Requirements: 10.3, 10.5, 10.6_

- [x] 18. Uji integrasi dan smoke lintas-sistem
  - [x]* 18.1 Tulis uji integrasi RLS Supabase
    - Anon dapat membaca baris publik; anon ditolak menulis; sesi owner dapat menulis; klien tanpa sesi ditolak menulis
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x]* 18.2 Tulis uji integrasi akses data runtime dan pencerminan perubahan
    - Verifikasi pembacaan bagian publik dan pencerminan perubahan admin pada pemuatan berikutnya
    - _Requirements: 12.6, 13.5, 14.6, 16.6_

  - [x]* 18.3 Tulis smoke test inisialisasi client dan pemindaian rahasia
    - Verifikasi inisialisasi client dengan Kunci_Anon dari env publik dan pemindaian output build memastikan tidak ada kunci service-role/rahasia
    - _Requirements: 4.1, 4.6_

- [x] 19. Checkpoint akhir - Pastikan seluruh uji lulus
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tugas dengan tanda `*` bersifat opsional (uji unit, property test, integrasi, smoke) dan dapat dilewati untuk MVP yang lebih cepat.
- Setiap tugas merujuk klausa requirement spesifik untuk keterlacakan.
- Property test memvalidasi properti kebenaran universal pada logika murni (`transforms.ts`, `validation.ts`, util tema/navigasi/mailto/meta/admin-session) menggunakan fast-check + Vitest dengan ≥ 100 iterasi.
- Perilaku eksternal (RLS, Apache, Pipeline_CICD) diverifikasi melalui uji integrasi/smoke, bukan PBT.
- Checkpoint memastikan validasi inkremental pada titik henti yang wajar.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "4.1", "5.1", "7.1", "8.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "3.2", "3.3", "3.4", "3.5", "4.2", "4.3", "4.4", "4.5", "5.2", "5.3", "5.4", "5.5", "5.6", "7.2", "8.2"] },
    { "id": 4, "tasks": ["8.3", "9.1", "12.1"] },
    { "id": 5, "tasks": ["9.2", "10.1", "10.3", "10.5", "10.7", "10.9", "10.11", "12.2"] },
    { "id": 6, "tasks": ["10.2", "10.4", "10.6", "10.8", "10.10", "10.12", "13.1", "13.2", "13.3"] },
    { "id": 7, "tasks": ["13.4", "13.5", "13.6", "13.7"] },
    { "id": 8, "tasks": ["13.8", "15.1", "15.2", "15.4"] },
    { "id": 9, "tasks": ["15.3", "16.1", "17.1"] },
    { "id": 10, "tasks": ["15.5", "16.2", "17.2", "18.1", "18.2", "18.3"] }
  ]
}
```
