# 07: Deployment Plan

Dokumen ini prosedur deploy Portfolio CMS ke Vercel dengan Neon Postgres: prasyarat, konfigurasi, langkah provisioning, alur rilis, rollback, dan operasi harian.

**Target:** Vercel (Next.js 15 App Router) + Neon Serverless Postgres (HTTP driver).

---

## 1. Ringkasan Arsitektur Deployment

```
┌──────────────┐        HTTPS         ┌───────────────────────┐
│  Pengunjung  │ ───────────────────► │      Vercel Edge      │
│  / Admin     │ ◄─────────────────── │  Next.js 15 App Router │
└──────────────┘   respons + cookie    │  (Serverless/Node)    │
                                           │
                                           │  fetch() via HTTP
                                           ▼
                                  ┌──────────────────────┐
                                  │   Neon Postgres      │
                                  │  (Pooled connection)  │
                                  └──────────────────────┘
```

| Komponen | Layanan | Konfigurasi |
|---|---|---|
| Web app | Vercel Hobby/Pro | Framework preset: Next.js, Build `npm run build` |
| Database | Neon (Free/Pro) | Connection string **pooled** |
| Env | Vercel Environment Variables | Production & Preview terpisah |
| CDN/Assets | Vercel Edge Network | Otomatis, tanpa konfigurasi |
| Monitoring | Vercel Observability + Neon Dashboard | Logging & query history |

---

## 2. Prasyarat

| Kebutuhan | Detail | Status |
|---|---|---|
| Akun Vercel | Gratis cukup untuk hobby | Wajib |
| Akun Neon | Gratis cukup untuk 1 project | Wajib |
| Akun GitHub | Untuk deployment berbasis Git | Wajib |
| Node.js 20+ | Lokal | Wajib |
| Domain | Opsional (`.vercel.app` sudah cukup) | Opsional |

Verifikasi lokal:

```bash
node -v      # v20.0.0 atau lebih baru
npm -v
```

---

## 3. Provisioning Database Neon

### 3.1 Buat Project

1. Login ke Neon Dashboard → **New Project**.
2. Nama: `portfolio-cms`.
3. Region: pilih yang terdekat dengan audiens (mis. `Southeast Asia (Singapore)` untuk Indonesia).
4. Postgres version: 16 atau 17 (default terbaru).
5. Plan: **Free** (0.5 GB) untuk mulai.

### 3.2 Ambil Connection String

1. Dashboard project → **Connect** (atau ikon sesuai branch `main`).
2. Pastikan toggle **Pooled connection** aktif (wajib untuk driver HTTP Neon).
3. Salin string; bentuknya:

```
postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
```

> Gunakan string **pooled** (mengandung `-pooler.`). String direct hanya untuk operasi admin/migrasi CLI.

### 3.3 Jalankan Skema & Seed

Di repo lokal:

```bash
# 1. Salin template env
cp .env.example .env.local

# 2. Isi .env.local dengan nilai sebenarnya
#    DATABASE_URL=postgresql://...-pooler....
#    AUTH_SECRET=<hasil openssl rand -base64 48>
#    ADMIN_EMAIL=anda@domain.com
#    ADMIN_PASSWORD=<password kuat>

# 3. Jalankan bootstrap (DDL + seed + buat akun admin)
npm run db:setup
```

Output sukses yang diharapkan:

```
[db] Skema diterapkan.
[db] Seed data selesai.
[db] Akun admin dibuat: anda@domain.com
[db] Selesai.
```

### 3.4 Verifikasi Data

```bash
psql "$DATABASE_URL" -c "\dt"          # daftar tabel (harus 9)
psql "$DATABASE_URL" -c "SELECT count(*) FROM projects;"
psql "$DATABASE_URL" -c "SELECT email, role FROM users;"
```

Bila `psql` tidak tersedia, gunakan Neon Dashboard → **SQL Editor** untuk query yang sama.

---

## 4. Environment Variables

### 4.1 Daftar Variabel

| Variabel | Required | Contoh | Scope | Keterangan |
|---|---|---|---|---|
| `DATABASE_URL` | Ya | `postgresql://...-pooler...` | Production + Preview | Pooled connection string Neon |
| `AUTH_SECRET` | Ya | `<48 char base64>` | Production + Preview | Kunci HS256 JWT. **Panjang & unik** |
| `ADMIN_EMAIL` | Saat setup | `anda@domain.com` | Production | Email akun admin awal |
| `ADMIN_PASSWORD` | Saat setup | `<password kuat>` | Production | Password akun admin awal |
| `REVALIDATE_SECRET` | Ya | `<32 char hex>` | Production + Preview | Header `x-revalidate-secret` |
| `NEXT_PUBLIC_SITE_URL` | Direkomendasikan | `https://domain-anda.tld` | Production | Dipakai sitemap & canonical |
| `RESEND_API_KEY` | Opsional | `re_xxx` | Production | Notifikasi email pesan masuk |

### 4.2 Membuat Secret Acak

```bash
# AUTH_SECRET
openssl rand -base64 48

# REVALIDATE_SECRET
openssl rand -hex 32
```

### 4.3 Konfigurasi di Vercel

1. Vercel Dashboard → project → **Settings → Environment Variables**.
2. Tambahkan setiap variabel, pilih scope **Production** (+ **Preview** bila ingin preview DB berfungsi penuh).
3. **Jangan** centang variabel sensitif untuk Public.
4. Setelah menambah/mengubah, deploy ulang agar variabel ter-*inject* (perubahan env memicu deploy baru).

> Environment variable Vercel terenkripsi at rest dan tidak pernah ditampilkan lagi setelah disimpan (hanya dapat di-*overwrite*).

---

## 5. Deployment ke Vercel

### 5.1 Via Git (Direkomendasikan)

1. Push repo ke GitHub.
2. Vercel Dashboard → **Add New → Project** → import repo.
3. Konfigurasi build:

| Field | Nilai |
|---|---|
| Framework Preset | Next.js (auto) |
| Build Command | `npm run build` |
| Output Directory | `.next` (auto) |
| Install Command | `npm install` |
| Node.js Version | 20.x (atau `NODE_VERSION` env) |

4. Tambahkan env variables (bagian 4).
5. Klik **Deploy**.
6. Tunggu build sukses → URL `https://portfolio-cms.vercel.app`.

### 5.2 Via Vercel CLI

```bash
npm i -g vercel

vercel login
vercel                 # preview deployment
vercel --prod          # production deployment
```

CLI membaca env dari `.env.local` untuk preview; untuk production, set env via Dashboard atau `vercel env add`.

### 5.3 Redeploy Setelah Perubahan Env

```bash
vercel --prod --force
```

atau: Vercel Dashboard → Deployments → ⋯ → **Redeploy**.

---

## 6. Checklist Pasca-Deploy

```bash
# 1. Health check
curl -s https://domain-anda.tld/api/health

# 2. API publik
curl -s https://domain-anda.tld/api/projects | head -c 300

# 3. Header keamanan
curl -sI https://domain-anda.tld/ | grep -iE "x-frame|x-content|referrer|permissions|strict-transport"

# 4. Proteksi admin
curl -sI https://domain-anda.tld/admin | head -1        # harus 307/302 ke /admin/login

# 5. Revalidasi
curl -s -X POST https://domain-anda.tld/api/revalidate -H "x-revalidate-secret: <SECRET>"
```

Verifikasi manual di browser:

- [ ] `/` tampil dengan semua section sesuai pengaturan.
- [ ] `/projects`, `/blog`, `/services`, `/about`, `/contact` tampil.
- [ ] `/admin` mengarahkan ke `/admin/login`.
- [ ] Login berhasil → dashboard menampilkan statistik.
- [ ] Tambah 1 project published → muncul di beranda.
- [ ] Kirim pesan dari `/contact` → masuk ke `/admin/messages`.
- [ ] `robots.txt` dan `sitemap.xml` benar.

---

## 7. Domain Kustom (Opsional)

1. Vercel Dashboard → project → **Settings → Domains** → **Add**.
2. Masukkan domain; tambahkan DNS sesuai instruksi:

| Provider | Tipe | Nama | Nilai |
|---|---|---|---|
| Cloudflare | CNAME | `www` | `cname.vercel-dns.com` |
| Cloudflare | A | `@` | IP Vercel (dari dashboard) |
| Google Domains | CNAME | `www` | `cname.vercel-dns.com` |

3. Tunggu propagasi (biasanya < 1 jam; TXT verification required untuk domain root).
4. Set `NEXT_PUBLIC_SITE_URL` ke domain final lalu redeploy.

SSL otomatis diterbitkan Vercel (Let's Encrypt) dan diperpanjang otomatis.

---

## 8. Release Management

### 8.1 Alur Rilis

```
Perubahan di branch → PR → review → merge ke main
   → Vercel auto-deploy preview (PR)
   → verifikasi manual preview
   → merge ke main → auto-deploy production
   → smoke test produksi
   → monitoring 24 jam
```

### 8.2 Preview Deployment

Setiap PR otomatis mendapat URL preview. Preview memakai **Preview scope** env. Bila preview perlu data, arahkan ke Neon branch `preview` (Neon mendukung branch database per preview).

### 8.3 Versi Rilis

| Versi | Cakupan | Status |
|---|---|---|
| v1.0.0 | MVP lengkap: situs publik + admin CMS | Rilis awal |
| v1.1.0 | Peningkatan UI, paket layanan, halaman detail | Belgrade roadmap |
| v1.2.0 | Audit log, soft delete, 2FA | Belgrade roadmap |
| v2.0.0 | Multi-admin, peran editor, i18n | Belgrade roadmap |

Tag git saat rilis:

```bash
git tag -a v1.0.0 -m "Portfolio CMS v1.0.0: MVP"
git push origin v1.0.0
```

---

## 9. Rollback

### 9.1 Rollback Deployment

Vercel Dashboard → **Deployments** → pilih deployment sebelumnya → ⋯ → **Promote to Production**.

Atau CLI:

```bash
vercel rollback          # ke deployment sebelumnya
vercel ls               # lihat daftar
```

Rollback deployment **tidak** menyentuh database.

### 9.2 Rollback Database

Neon menyediakan **Time Travel** (restore ke titik waktu):

1. Neon Dashboard → project → **Restore** (atau `branches` → point-in-time).
2. Pilih timestamp sebelum migrasi bermasalah.
3. Buat branch baru berisi data yang direstore.
4. Verifikasi data, lalu arahkan `DATABASE_URL` ke branch tersebut dan redeploy.

Manual (pg_dump/pg_restore):

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F).sql
psql "$RESTORED_URL" < backup-2026-11-04.sql
```

---

## 10. Backup

| Jenis | Pemicu | Lokasi | Retensi |
|---|---|---|---|
| Auto backup Neon | Berulang | Neon storage | 7 hari (Pro) |
| Point-in-time restore | Manual | Neon branch | Fleksibel |
| Dump SQL manual | Mingguan (cron) | Penyimpanan offsite terenkripsi | 6 bulan |

Contoh cron mingguan:

```bash
0 3 * * 1 pg_dump "$DATABASE_URL" | gzip > backup-$(date +\%F).sql.gz
```

> Backup hanya berguna bila **sudah pernah diuji dipulihkan**. Lakukan restore test satu kali sebelum rilis.

---

## 11. Operasi Harian

### 11.1 Rutinitas Mingguan

- [ ] Cek uptime & error log Vercel.
- [ ] Cek Neon dashboard: storage, connection, query lambat.
- [ ] Review pesan masuk baru di `/admin/messages`.
- [ ] Backup dump SQL.

### 11.2 Rutinitas Bulanan

- [ ] Review dependency: `npm outdated`, `npm audit`.
- [ ] Rotasi kredensial bila perlu (rekomendasi: 90–180 hari).
- [ ] Review konten: hapus project lama, perbarui testimoni.
- [ ] Uji restore backup.

### 11.3 Incident Response Ringkas

| Gejala | Langkah Pertama |
|---|---|
| Situs 500 total | Cek status Neon → rollback deployment → cek env |
| Situs lambat | Cek Neon: query aktif, koneksi, cold start |
| Tidak bisa login | Verifikasi `AUTH_SECRET` & baris `users` di DB |
| Konten tidak berubah setelah edit | `POST /api/revalidate` dengan secret |
| Pesan tidak masuk | Cek tabel `messages` & rate limit (429) |
| Bocor secret | Rotasi **segera** (lihat security-design §9.2) |

---

## 12. Optimasi & Batas Vercel

| Item | Batas Hobby | Dampak pada proyek |
|---|---|---|
| Build time | 600 detik | Build saat ini < 60 detik: aman |
| Function execution | 60 detik | Query DB < 1 detik: aman |
| Bandwidth | 100 GB/bulan | Cukup untuk portofolio |
| Serverless function | 12 | Route handler 7 + middleware: aman |
| Build concurrency | 1 | Build paralel dibatasi |
| Cron jobs | 2/hari | Cukup untuk backup mingguan (v2: backup harian di Pro) |

Optimasi yang sudah diterapkan: driver HTTP Neon (tanpa WebSocket), tidak ada dependensi native, tidak ada ORM dengan codegen saat build, font di-self-host via `next/font`.

---

## 13. Biaya

| Komponen | Free Tier | Kapan Perlu Upgrade |
|---|---|---|
| Vercel | 100 GB bandwidth/bulan | > 50k visitor/bulan |
| Neon | 0.5 GB storage, 191.9 jam compute | > 100 MB data atau query berat |
| Domain |: (opsional, ~Rp 100–200 ribu/tahun) | Saat situs resmi |
| Resend (email) | 3.000 email/bulan | Jika notifikasi email aktif |

---

## 14. Panduanxm Rapid (Ringkasan)

```bash
# === SETUP LOKAL ===
cp .env.example .env.local          # isi DATABASE_URL, AUTH_SECRET, dll
npm install
npm run db:setup                    # skema + seed + akun admin
npm run dev                         # http://localhost:3000

# === BUILD & VERIFIKASI ===
npx tsc --noEmit
npx next lint
npm run build

# === DEPLOY ===
vercel --prod --force
curl -s https://domain-anda.tld/api/health
```

---

## 15. Pengujian Restore (Checklist)

- [ ] Dump SQL berhasil dibuat dan ukurannya masuk akal (> 0 byte).
- [ ] Dump di-restore ke database uji (Neon branch baru).
- [ ] Jumlah baris tiap tabel cocok dengan production.
- [ ] Login admin berhasil di database hasil restore.
- [ ] Satu project, satu artikel, dan satu pesan tes dapat dibaca.
- [ ] Waktu restore tercatat (target < 10 menit untuk data < 50 MB).

---

## 16. Checklist Rilis Akhir

**Pra-deploy**
- [ ] `npm run build` sukses di lokal.
- [ ] `npm run db:setup` berhasil pada database staging/baru.
- [ ] Semua env variable terisi di Vercel (Production & Preview).
- [ ] `AUTH_SECRET` dan `REVALIDATE_SECRET` di-generate acak (bukan nilai contoh).
- [ ] `DATABASE_URL` memakai connection **pooled**.
- [ ] `NEXT_PUBLIC_SITE_URL` sesuai domain final.

**Deploy**
- [ ] Deploy production sukses (build log hijau).
- [ ] Smoke test seluruh halaman publik.
- [ ] Login admin → tambah 1 item uji → tampil di publik → hapus item uji.
- [ ] Pesan kontak masuk ke inbox.

**Pasca-deploy**
- [ ] Header keamanan terverifikasi via `curl -I`.
- [ ] `/admin` redirect ke login.
- [ ] `robots.txt` & `sitemap.xml` valid.
- [ ] Lighthouse production ≥ target.
- [ ] Backup pertama dibuat + 1 restore test.
- [ ] Dokumentasi `PROJECT/` diperbarui.
