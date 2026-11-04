# 06 — Definition of Done (DoD)

Dokumen ini mendefinisikan kriteria "selesai" untuk setiap item pekerjaan (feature, bug fix, dokumen) dalam Portfolio CMS v1.

---

## 1. DoD Umum (Semua Item)

Setiap item dianggap selesai bila **seluruh** butir berikut terpenuhi:

### Kode
- [ ] Implementasi berfungsi sesuai deskripsi item dan kriteria penerimaan terkait.
- [ ] `npx tsc --noEmit` → exit 0, tanpa error baru.
- [ ] `npx next lint` → 0 error (warning baru harus dijelaskan).
- [ ] `npx next build` → exit 0.
- [ ] Tidak ada `console.log` tersisa di kode produksi (kecuali `console.error` yang disengaja untuk log server).
- [ ] Tidak ada `TODO`, `FIXME`, atau kode mati yang ditinggalkan.
- [ ] Tidak ada `any` yang tidak diperlukan; tipe eksplisit pada boundary data.

### Validasi & Keamanan
- [ ] Input eksternal divalidasi di server (Zod atau checks eksplisit).
- [ ] Query yang disturbed user input memakai parameter (`$1`, `$2`), bukan string interpolation.
- [ ] Perubahan menyentuh otentikasi/otorisasi diverifikasi ulang di server, bukan hanya di UI.
- [ ] Tidak ada secret, API key, atau credential di dalam kode atau dokumen.

### Fungsionalitas
- [ ] Alur utama (happy path) diuji manual di browser.
- [ ] Alur error ditangani: input tidak valid, tidak ditemukan, dan kegagalan DB menampilkan pesan yang masuk akal (bukan stack trace).
- [ ] State kosong ditangani (tabel kosong, daftar kosong, form kosong).
- [ ] State loading ditangani (skeleton atau disabled state, tanpa double-submit).

### UI/UX
- [ ] Tampilan konsisten dengan `03-DESIGN/design-system.md` (token warna, tipografi, spacing).
- [ ] Responsive di 360px, 768px, dan 1440px.
- [ ] Fokus keyboard terlihat di seluruh elemen interaktif baru.
- [ ] Label form terasosiasi; pesan error diumumkan dengan `role="alert"`.

### Dokumentasi
- [ ] Dokumen relevan di `PROJECT/` diperbarui bila perilaku/data berubah (arsitektur, API spec, DB schema).
- [ ] Perubahan yang impacting deployment dicatat di `07-DEPLOYMENT/deployment-plan.md` bila ada (env var baru, migrasi, langkah manual).

## 2. DoD Specific per Jenis Item

### 2.1 Feature Publik (halaman / section)

- [ ] Halaman Terindeks di `sitemap.xml` bila relevan.
- [ ] `robots.txt` masih konsisten dengan struktur baru.
- [ ] Metadata (title, description, Open Graph) terisi.
- [ ] Konten kosong tidak menghasilkan halaman kosong yang membingungkan.

### 2.2 Feature Admin (CRUD)

- [ ] Definisi resource di `src/lib/resources.ts` lengkap (label, kolom, field, validasi).
- [ ] Server action menolak akses tanpa sesi valid.
- [ ] Perubahan data tercermin di halaman publik setelah simpan (cache ter-revalidate atau `dynamic`).
- [ ] `updated_at` ter-update otomatis.
- [ ] Aksi destruktif meminta konfirmasi.

### 2.3 Perubahan API

- [ ] `04-ARCHITECTURE/api-specification.yaml` diperbarui (path, method, schema, status code).
- [ ] Bentuk error konsisten: `{ "error": string, "details"?: object }`.
- [ ] Endpoint publik tidak membocorkan field sensitif.
- [ ] Contoh request/response valid di spec.

### 2.4 Perubahan Skema Database

- [ ] `db/schema.sql` diperbarui dan dapat dijalankan pada database kosong tanpa error.
- [ ] Skema idempotent (`IF NOT EXISTS`) atau ada catatan migrasi berurutan.
- [ ] `04-ARCHITECTURE/database-schema.md` diperbarui (tabel, kolom, index, relasi).
- [ ] Query aplikasi yang menyentuh kolom baru diperbarui bersamaan.
- [ ] Migrasi diuji pada database yang sudah berisi data lama.

### 2.5 Perubahan Konfigurasi / Environment

- [ ] `.env.example` diperbarui bila ada variabel baru.
- [ ] Didaftarkan di `07-DEPLOYMENT/deployment-plan.md` bagian "Environment Variables".
- [ ] Nilai default memiliki fallback yang aman bila variabel tidak di-set.
- [ ] Tidak ada nilai nyata di `.env.example`.

### 2.6 Dokumentasi

- [ ] Struktur file mengikuti konvensi `PROJECT/` yang ada.
- [ ] Bahasa Indonesia, konsisten dengan dokumen lain.
- [ ] Tabel/diagram ASCII dipakai untuk ilustrasi (tidak ada gambar bitmap yang tidak verzif).
- [ ] Tidak ada karakter asing yang tidak disengaja (mojibake).
- [ ] Referensi silang antar dokumen valid (nama file benar).

### 2.7 Bug Fix

- [ ] Ada langkah reproduksi yang tertulis (di issue/commit).
- [ ] Perbaikan berada di akar masalah, bukan menutup gejala.
- [ ] Test regresi ada (unit atau integration) atau langkah verifikasi manual terdokumentasi.
- [ ] Area serupa diperiksa (apakah bug yang sama ada di tempat lain?).

## 3. Definition of Done untuk Rilis (Release DoD)

Rilis v1 dinyatakan selesai bila:

**Fungsional**
- [ ] Seluruh AC-01 s/d AC-15 berstatus Terpenuhi (lihat `02-REQUIREMENTS/acceptance-criteria.md`).
- [ ] Seluruh test plan P0/P1 lulus (`06-QUALITY/test-plan.md`).
- [ ] Alur admin lengkap teruji: login → CRUD → publish → tampil publik → pesan masuk → dibaca.

**Kualitas**
- [ ] Lighthouse: Performance ≥ 90, A11y ≥ 95, SEO ≥ 95, BP ≥ 90.
- [ ] 0 temuan keamanan Critical/High terbuka.
- [ ] Checklist keamanan rilis (`04-ARCHITECTURE/security-design.md` §8) terisi penuh.

**Operasional**
- [ ] Deployment ke Vercel Production sukses.
- [ ] Environment variables production terisi dan terverifikasi.
- [ ] Custom domain terpasang dan HTTPS aktif (jika dipakai).
- [ ] Backup database pertama dibuat; satu restore test berhasil.
- [ ] Monitoring/alert aktif (Vercel + Neon).

**Dokumentasi**
- [ ] Seluruh dokumen `PROJECT/` ada dan konsisten dengan implementasi aktual.
- [ ] `README.md` proyek memuat instruksi setup, deploy, dan operasi harian.
- [ ] Konten demo dibersihkan.

## 4. Anti-Pola (Belum Selesai Bila)

| Anti-pola | Mengapa belum selesai |
|---|---|
| "Fungsinya jalan, tapi belum dirapikan" | Tidak memenuhi gate build/lint/type |
| "Sudah ada, tapi belum dites" | Tidak ada bukti kebenaran |
| "Deploy nanti saja" | Rilis tanpa verifikasi lingkungan target |
| "Documentasi menyusul" | Dokumen adalah bagian dari DoD, bukan tambahan |
| "Saya cek manual sekilas" | Pengujian harus sistematis dan tercatat |
| "Hardcode dulu, refactor nanti" | Hardcode secret/kredensial = temuan keamanan terbuka |
| "Feature flag dibiarkan nyala" | Fitur dibiarkan mati permanen tanpa flag |

## 5. Checklist Ringkas (Tempel ke PR)

```
[ ] tsc / lint / build hijau
[ ] AC terkait terpenuhi
[ ] Validasi server untuk input baru
[ ] Tidak ada secret dalam kode
[ ] Loading / kosong / error state ditangani
[ ] Responsive + fokus keyboard
[ ] Dokumentasi PROJECT/ diperbarui
[ ] Test manual dicatat
```
