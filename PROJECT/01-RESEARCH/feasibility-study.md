# 01: Feasibility Study (Studi Kelayakan)

## 1. Ringkasan Eksekutif

| Aspek | Putusan | Alasan |
|---|---|---|
| Layak dari sisi kebutuhan? | **Ya** | Owner butuh Showcase + etalase jualan yang bisa ia ubah sendiri; saat ini belum ada tooling. |
| Layak secara teknis? | **Ya** | Next.js + Neon + Vercel = trio serverless tanpa server yang harus dikelola; tipe data produk ini persis cocok untuk model itu. |
| Layak secara finansial? | **Ya** | Biaya bulanan ~$0 (free tier Vercel Hobby + Neon Free). Estimasi biaya bila naik kelas: < $25/bulan. |
| Layak secara waktu? | **Ya** | MVP 4–6 minggu kerja terfokus. |
| Layak secara operasional? | **Ya** | Satu orang (owner) sebagai admin; tidak butuh tim DevOps. |

**Kesimpulan: LAYAK.** Lanjut ke Fase 1 (MVP) dengan batasan scope yang tertulis di `02-REQUIREMENTS/PRD.md`.

## 2. Kebutuhan vs. Solusi Alternatif

### 2.1 Kebutuhan Owner (Inti)

| # | Kebutuhan | Must have? |
|---|---|---|
| K1 | Tambah/edit/hapus project | Ya |
| K2 | Tambah/edit/hapus artikel | Ya |
| K3 | Atur deskripsi profil / hero / tentang | Ya |
| K4 | Atur paket layanan & harga | Ya |
| K5 | Terima inquiry dari form kontak | Ya |
| K6 | Atur warna tema & section yang tampil | Ya (semi-custom) |
| K7 | Satu akun admin saja, login aman | Ya |
| K8 | Deploy mudah & murah | Ya |
| K9 | SEO dasar (meta, sitemap, robots) | Ya |
| K10 | Multi-admin, role, audit log | Tidak (v2) |
| K11 | Payment gateway | Tidak (v2) |
| K12 | Upload media | Tidak (v2) |

### 2.2 Perbandingan Opsi

| Opsi | Kelebihan | Kekurangan | Biaya | Skor |
|---|---|---|---|---|
| **A. Next.js + Neon + Vercel (dipilih)** | Deploy otomatis, CMS custom penuh, gratisf tier, kontrol penuh, cepat | Perlu tulis CRUD sendiri | $0–25/bln | **9/10** |
| B. WordPress + Neon/hosting | Familiar, banyak tema | Lambat, plugin rapuh, lambat, sering perlu update keamanan | $5–25/bln | 6/10 |
| C. Webflow / Framer | Visual cepat, CMS siap | Kurang fleksibel untuk logika "harga + inquiry", langganan | $15–30/bln | 6/10 |
| D. Notion + Softr/Super.so | Nol coding | Ketergantungan pihak ketiga, biaya naik, data di luar kendali | $0–25/bln | 5/10 |
| E. Static site + file JSON | Paling sederhana | Tidak ada CMS, update butuh deploy ulang, tidak ada pesan masuk | $0 | 4/10 |

### 2.3 Alasan Opsi A Menang untuk Kasus Ini

1. **"Semi-custom" persis berarti**: schema-driven. Owner mengubah isi lewat form; kode tetap. Menambah field baru cukup menambah baris di `src/lib/resources.ts`.
2. **Layanan = data, bukan kode**: satu engine CRUD (`ResourceManager`) melayani 6 tabel.
3. **Skema JSONB untuk settings** membuat tema/CTA/harga bisa berubah total tanpa migrasi DB.
4. **Neon free tier** cukup: produk ini read-heavy dengan query kecil, bukan analitik berat.
5. **Biaya hosting ~$0** untuk traffic portofolio (< 10k PV/bulan).

## 3. Kelayakan Teknis

### 3.1 Kesesuaian Setiap Kebutuhan dengan Stack

| Kebutuhan | Implementasi | Kenapa cocok |
|---|---|---|
| K1–K3, K6 | Server Actions + `settings` JSONB | Tipe data konfigurasi, bukan relasional |
| K4 | Tabel `services` + section pricing | Harga disimpan sebagai TEXT → bebas "mulai dari 2.5jt" |
| K5 | Tabel `messages` + admin inbox | Query simple, index status |
| K7 | bcryptjs + JWT JOSE + middleware | Tanpa service auth eksternal; biaya 0 |
| K8 | Vercel Git integration | Push → deploy |
| K9 | `metadata` API + sitemap/robots + JSON-LD | Native Next.js |

### 3.2 Risiko Teknis dan Cara Diatasi

| Risiko Teknis | Dampak | Mitigasi |
|---|---|---|
| Neon HTTP driver punya latensi ~50–150ms per query | Lambat bila chain banyak query | `Promise.all` untuk query independen; connection string *pooled*; index pada kolom filter |
| Connection exhausted di free tier | 500 error saat trafik naik | *Pooled* connection string (bukan direct), query singkat, atau upgrade ke Pro |
| Server Action tidak bisa ekspor objek non-fungsi | Refactor saat menambah skema | Semua definisi skema dipindah ke file non-`"use server"` (`src/lib/resources.ts`, `src/components/admin/field-schema.ts`) |
| Cookie session expire 7 hari | Owner logout mendadak | TTL 7 hari + tombol logout + login ulang cepat (tanpa OTP) |
| Client component mengimpor modul server | Build error | Server action dijembatani lewat `src/app/actions/contact.ts`; modul `db` tidak pernah diimpor dari client |
| Build tanpa `DATABASE_URL` | Deploy gagal | Lazy-init koneksi; semua query dibungkus try/catch dan fallback ke default |

### 3.3 Batasan Resource

| Sumber | Batas Free Tier | Kebutuhan Estimasi | Headroom |
|---|---|---|---|
| Vercel Hobby | 100 GB bandwidth/bulan, 1000 build/minggu | ~2–5 GB/bulan, ~4 build/bulan | ~95% |
| Neon Free | 0.5 GB storage, compute 191 jam/bulan | ~50–150 MB, ~20 jam/bulan | ~85% |
| Neon Compute | Auto-suspend setelah 5 menit idle | Tidak ada beban idle | Aman |

**Titik(scale) henti:** bila storage > 300 MB (terutama gambar), naik ke Neon Pro ($19/bln) dan pindahkan gambar ke CDN (Vercel Blob / Cloudinary).

## 4. Kelayakan Finansial

### 4.1 Estimasi Biaya

| Komponen | Free | Produktif (traffic naik) |
|---|---|---|
| Vercel | $0 | $20/bln (Pro) |
| Neon | $0 | $19/bln (Pro) |
| Domain |: | $10–15/tahun |
| Gambar/CDN |: | $0 (eksternal) / $5/bln |
| **Total** | **$0** | **~$40–55/bln** |

### 4.2 Nilai Bisnis

Skenario konservatif: 1 klien per bulan dari paket termurah Rp 2–5 juta → payback biaya hosting < 1 jam kerja per bulan. decisively worth it.

Biaya yang *tidak* termasuk dihitung: waktu owner. Jika update konten manual lewat file memerlukan 30 menit per update vs 30 detik via admin, saving waktu adalah benefit utama.

### 4.3 Break-even

| Asumsi | Nilai |
|---|---|
| Margin bulanan bersih | Rp 2.000.000 |
| Biaya hosting (produktif) | Rp 550.000 |
| % biaya hosting terhadap margin | 27,5% |
| Breakeven | 1 project dibayar / bulan |

## 5. Kelayakan Operasional

| Aspek | Rencana |
|---|---|
|(round) Setup | `npm run db:setup` di Neon + 3 env var di Vercel |
| Rutinitas | Update konten via `/admin`: tanpa deploy |
| Monitoring | Vercel Analytics (opsional), Neon dashboard untuk query/storage |
| Backup | Neon auto-backup (7 hari di Pro) + dump SQL manual tiap minggu |
| Onboarding pengganti | README + dokumen `PROJECT/` |
| Waktu pemulihan (RTO) | < 30 menit (redeploy + restore dump) |
| Recovery point (RPO) | ≤ 7 hari (auto-backup) / ≤ 24 jam bila dump mingguan |

## 6. Risiko Kelayakan (ringkas)

| ID | Risiko | Dampak | Mitigasi | Owner |
|---|---|---|---|---|
| R-01 | Session admin bocor | Tinggi | Cookie httpOnly+sameSite, TTL pendek, verifikasi tiap request | Dev |
| R-02 | Secret bocor di repo | Tinggi | `.gitignore`, env var Vercel, rotasi | Dev |
| R-03 | Free-tier habis | Sedang | Monitoring usage, threshold alert manual | Owner |
| R-04 | Owner menghapus data penting | Sedang | Konfirmasi, soft-delete (`published=false`) sebagai default | Dev |
| R-05 | Scope creep | Sedang | Backlog MoSCoW, aturan "deferred" | Dev |
| R-06 | Tidak ada yang menguji | Sedang | Definition of Done + checklist manual | Owner |

## 7. Rekomendasi

**Setujui dan lanjutkan ke Fase 1 (MVP) dengan batasan berikut:**

1. Scope MVP = halaman publik + login admin + CRUD 6 resource + inbox pesan + pengaturan.
2. Tidak ada payment gateway, tidak ada multi-admin, tidak ada upload media di v1.
3. Deploy target: **preview Vercel lebih dulu**, domain kustom setelah KPI terukur.
4. Review kelayakan ulang setelah 3 bulan operasional (data nyata: trafik, konversi, biaya).

## 8. Lampiran: Checklist Kelayakan

- [x] Masalah teridentifikasi dan tervalidasi (`01-RESEARCH/problem-statement.md`)
- [x] Stack dipilih dengan perbandingan alternatif
- [x] Kebutuhan dipetakan ke fitur (PRD)
- [x] Arsitektur dan skema DB dirancang (`04-ARCHITECTURE/`)
- [x] Risiko teridentifikasi + mitigasi (`05-PLANNING/risks.md`)
- [x] Biaya dan resource diestimasi
- [x] Definition of Done & test plan disusun (`06-QUALITY/`)
- [x] Rencana deploy siap (`07-DEPLOYMENT/`)
