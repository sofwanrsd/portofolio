# 05: Risk Register

**Proyek:** Portfolio CMS · **Tanggal:** November 2026 · **Owner:** -
**Skala Likelihood:** Rendah (1) · Sedang (2) · Tinggi (3)
**Skala Dampak:** Rendah (1) · Sedang (2) · Tinggi (3)
**Skor = Likelihood x Dampak.** Skor ≥ 6 = *High* (wajib ada owner + rencana konkret), 3–5 = *Medium*, ≤ 2 = *Low*.

---

## 1. Ringkasan

| Kategori | Jumlah | High | Medium | Low |
|---|---|---|---|---|
| Teknis | 8 | 3 | 4 | 1 |
| Keamanan | 6 | 3 | 2 | 1 |
| Operasional | 6 | 1 | 4 | 1 |
| Produk | 5 | 1 | 3 | 1 |
| Finansial | 3 | 0 | 2 | 1 |
| **Total** | **28** | **8** | **15** | **5** |

## 2. Risiko Teknis

| ID | Risiko | L | D | Skor | Mitigasi | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-T01 | Neon HTTP driver|latensi tinggi membuat halaman lambat | 2 | 3 | 6 | Connection pooled, query paralel via `Promise.all`, index pada kolom filter, cache via `revalidatePath` | Dev | Aktif |
| R-T02 | Batas free tier Neon habis (compute/storage) | 2 | 3 | 6 | Monitoring usage, naik ke Pro saat storage > 300 MB, pindahkan gambar ke CDN | Owner | Aktif |
| R-T03 | Query gagal menyebabkan halaman publik 500 | 2 | 3 | 6 | `query()` dibungkus try/catch, fallback ke default/daftar kosong, `force-dynamic` pada halaman data | Dev | Mitigasi |
| R-T04 | Build produksi gagal karena `DATABASE_URL` belum ada | 2 | 2 | 4 | Lazy-init koneksi di `src/lib/db.ts`; `getSql()` mengembalikan null bila env kosong | Dev | Mitigasi |
| R-T05 | Duplikasi kode CRUD saat menambah tabel baru | 2 | 2 | 4 | Engine generik `ResourceManager` + definisi skema di `src/lib/resources.ts` | Dev | Mitigasi |
| R-T06 | Server Action tidak bisa mengekspor objek non-fungsi | 3 | 1 | 3 | Semua skema dipisah ke modul non-`"use server"` | Dev | Mitigasi |
| R-T07 | Konflik merge saat banyak perubahan paralel | 2 | 2 | 4 | Batch perubahan per fitur, review sebelum merge | Dev | Aktif |
| R-T08 | Gambar eksternal mati / lambat | 2 | 1 | 2 | `next/image` dengan optimizer, placeholder bila URL kosong | Dev | Mitigasi |

## 3. Risiko Keamanan

| ID | Risiko | L | D | Skor | Mitigasi | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-S01 | Cookie sesi admin bocor (XSS) | 2 | 3 | 6 | Cookie httpOnly + sameSite=lax + secure; React auto-escape; `rehype-raw` tidak dipakai | Dev | Mitigasi |
| R-S02 | Secret bocor di repository | 2 | 3 | 6 | `.env*` di-gitignore; `git grep` berkala; rotasi bila pernah ter-expose | Dev | Mitigasi |
| R-S03 | Serangan brute force ke `/admin/login` | 3 | 2 | 6 | Rate limit 5 percobaan / 5 menit per IP; pesan error generik | Dev | Mitigasi |
| R-S04 | SQL injection | 1 | 3 | 3 | 100% parameterized query; nama tabel dari allow-list statis | Dev | Mitigasi |
| R-S05 | Spam form kontak | 3 | 2 | 6 | Rate limit 5/10 menit, honeypot, validasi Zod | Dev | Mitigasi |
| R-S06 | Dependency dengan CVE | 2 | 2 | 4 | `npm audit --production` tiap sprint, update dependensi | Dev | Aktif |

**Catatan R-S03 dan R-S05:** rate limit in-memory tidak berbagi state antar instance Vercel. Untuk proteksi lintas-region, pindahkan ke Upstash Redis (v2). Bila traffic meningkat, ini risiko yang harus naik prioritas.

## 4. Risiko Operasional

| ID | Risiko | L | D | Skor | Mitigasi | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-O01 | Data hilang (hard delete tanpa backup) | 2 | 3 | 6 | Backup otomatis Neon, dump SQL mingguan, konfirmasi hapus di UI, soft delete untuk v2 | Owner | Aktif |
| R-O02 | Owner salah hapus konten penting | 3 | 2 | 6 | Konfirmasi dialog, publish toggle sebagai jaring pengaman, hard delete dapat di-backup | Dev | Mitigasi |
| R-O03 | Akun admin lupa password | 2 | 2 | 4 | `npm run db:setup` dengan `ADMIN_PASSWORD` baru (upsert) | Owner | Mitigasi |
| R-O04 | Neon project di-suspend (tidak aktif) | 1 | 3 | 3 | Neon free tier tidak auto-suspend, tapi pastikan project aktif | Owner | Mitigasi |
| R-O05 | Deploy gagal karena env var belum diset di Vercel | 2 | 2 | 4 | Checklist env var, preview deploy sebelum production, health check endpoint | Dev | Mitigasi |
| R-O06 | Vercel free tier limit build (1000/minggu) | 1 | 1 | 1 | Batch commit; development lokal untuk iterasi | Dev | Rendah |

## 5. Risiko Produk

| ID | Risiko | L | D | Skor | Mitigasi | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-P01 | Situs tampil sepi karena konten minim | 3 | 2 | 6 | Seed data lengkap sebagai titik awal; checklist konten minimum sebelum go-live | Owner | Aktif |
| R-P02 | Section semi-custom membingungkan owner | 2 | 2 | 4 | Label field berbahasa Indonesia + helper text; accordion per grup | Dev | Mitigasi |
| R-P03 | Harga tampil membingungkan (belum ada angka tetap) | 2 | 2 | 4 | `price_value` bebas teks; owner mengatur label "mulai dari"; section pricing bisa dimatikan | Owner | Mitigasi |
| R-P04 | Tidak ada analytics konversi | 3 | 1 | 3 | Vercel Analytics opsional; jumlah inquiry dari inbox sebagai proxy | Owner | Ditunda (v2) |
| R-P05 | Artikel Markdown kurang visual | 2 | 1 | 2 | Mendukung heading, list, quote, code, tabel GFM | Dev | Mitigasi |

## 6. Risiko Finansial

| ID | Risiko | L | D | Skor | Mitigasi | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-F01 | Biaya naik saat traffic bertambah | 2 | 2 | 4 | Ambang naik kelas: storage > 300 MB atau traffic > 50k PV/bulan | Owner | Aktif |
| R-F02 | Penyimpanan membengkak karena gambar | 2 | 1 | 2 | Host gambar di CDN eksternal, bukan di Neon | Owner | Mitigasi |
| R-F03 | Domain hosting belum dimiliki | 2 | 1 | 2 | Vercel `.vercel.app` cukup untuk go-live; domain bisa ditambahkan kemudian | Owner | Rendah |

## 7. Risiko Dependency (P pihak Ketiga)

| ID | Risiko | L | D | Skor | Mitigasi |
|---|---|---|---|---|---|
| R-D01 | Neon mengubah API / harga | 1 | 3 | 3 | Abstraksi DB di `src/lib/db.ts`; migrasi ke Turso/Supabase hanya perlu mengganti satu file |
| R-D02 | Vercel mengubah perilaku build | 1 | 3 | 3 | Pin versi Next.js; build sukses sebagai gate |
| R-D03 | `next/font` gagal mengunduh font saat build | 2 | 2 | 4 | Fallback ke system font stack bila unduhan gagal; test build sebelum deploy |
| R-D04 | Resend (email notifikasi) down | 1 | 1 | 1 | Kegagalan email tidak memblokir penyimpanan pesan |

## 8. Matriks Risiko

```
Dampak \  Likelihood    Rendah (1)     Sedang (2)      Tinggi (3)
Tinggi (3)               -             R-T01,R-T02,    R-S05
                                        R-T03,R-S01,    R-O01
                                        R-S02,R-S06,    R-S03,
                                        R-O02           R-P01
Sedang (2)               -             R-T04..R-T08,   R-O03..R-O06
                                        R-S04, R-P02..05 R-D01..R-D04
                                        R-F01..R-F03
Rendah (1)               -             R-T08           -
```

## 9. Rencana Kontinjensi

| Skenario | Pemicu | Rencana |
|---|---|---|
| Neon down / limit | Error 5xx pada semua query | Turunkan ke maintenance page; pindah ke DB sementara (opsional); hubungi Neon support |
| Deploy rusak | Build gagal di production | `vercel rollback` ke deployment sebelumnya yang stabil |
| Admin terkunci | Lupa password | `npm run db:setup` dengan `ADMIN_PASSWORD` baru; rotasi `AUTH_SECRET` bila perlu |
| Data korup | Konten berubah tidak sengaja | Restore dump SQL mingguan; recovered sebagian field dari backup |
| Spam masuk | Banyak pesan palsu | Naikkan aggressiveness honeypot; aktifkan Upstash Redis |
| Kredensial bocor | Ditemukan di log / commit | Rotasi sekret, `git filter-repo` bila perlu, audit konten |

## 10. Review Risiko Berkala

| Kapan | Frekuensi | Peserta | Output |
|---|---|---|---|
| Sprint review | Tiap 2 minggu | Dev + Owner | Update skor, status, tambahan risiko baru |
| Post-deploy | Tiap release | Dev | Re-check risiko yang terkait perubahan |
| Insiden | Setelah insiden | Dev + Owner | Lessons learned, risiko baru masuk register |

## 11. Kriteria Kenaikan Prioritas

Sebuah risiko dinaikkan prioritas bila salah satu kondisi terpenuhi:
1. Skor ≥ 6 dan status masih "Aktif" (belum dimitigasi penuh).
2. Terjadi insiden nyata yang berkaitan.
3. Tiba-tiba traffic naik > 3x dari rata-rata.
4. Methode dependensi berubah (Vercel/Neon mengubah kebijakan).

## 12. Risiko yang Secara Eksplisit Diterima

| Risiko | Alasan diterima | Mitigasi Minimal |
|---|---|---|
| Rate limit in-memory tidak lintas region | Traffic rendah, v1 | Honeypot + validasi; upgrade Redis bila perlu |
| Tanpa 2FA | Single admin, password kuat | Rotasi 90 hari + rotasi secret |
| Hard delete | Sederhana, tidak ada soft delete | Backup mingguan + konfirmasi dialog |
| Tanpa audit log | V1 tidak perlu | `updated_at` tersedia di setiap tabel |
| Tanpa real-time preview pengaturan | Kecukupan v1 | Reload halaman untuk melihat perubahan |
