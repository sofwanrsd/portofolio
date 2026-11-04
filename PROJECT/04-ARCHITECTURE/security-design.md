# 04: Security Design

**Sistem:** Portfolio CMS · **Versi:** 1.0 · **Tanggal:** November 2026

Dokumen ini menjelaskan model keamanan, kontrol yang diimplementasikan, dan prosedur operasional yang wajib dijalankan owner.

---

## 1. Model Ancaman (STRIDE)

| Kategori | Ancaman pada Sistem Ini | Mitigasi |
|---|---|---|
| **Spoofing** | Attacker memalsukan identitas admin | Password bcrypt + JWT HS256 + verifikasi cookie tiap request |
| **Tampering** | Modifikasi data produk/settings tanpa hak | Server Action wajib cek sesi; parameterized query; tidak ada endpoint tulis publik selain pesan |
| **Repudiation** | Admin menyangkal perubahan data | `created_at`/`updated_at` di setiap tabel; jejak audit opsional (v2) |
| **Information Disclosure** | Bocor password/credential/token | `.env*` di-gitignore; hash bcrypt; `GET /api/settings/public` tidak menyertakan data sensitif; `robots.txt` melarang `/admin` & `/api` |
| **Denial of Service** | Spam form kontak, flood query | Rate limit in-memory (5/10 menit per IP), honeypot, query terindeks, connection pooled |
| **Elevation of Privilege** | Visitor naik jadi admin | Middleware + `requireAdmin()` di setiap server action; role dicek server-side |

## 2. Model Autentikasi

### 2.1 Alur Login

```
Owner -> POST Server Action (loginAction)
          | email + password
          v
   bcrypt.compare(hash, password)        <- constant-time, cost 10
          | gagal -> pesan generik + penghitung rate limit naik
          v berhasil
   jwtSign({ userId, email, role }, AUTH_SECRET, HS256, exp 7d)
          v
   Set-Cookie: portfolio_session=<jwt>; HttpOnly; SameSite=Lax; Path=/; Secure(prod); Max-Age=604800
          v
   redirect("/admin")
```

### 2.2 Aturan Cookie

| Atribut | Nilai | Alasan |
|---|---|---|
| `HttpOnly` | `true` | JavaScript tidak dapat membaca token - melindungi dari XSS |
| `SameSite` | `Lax` | Mencegah CSRF lintas-situs pada sebagian besar kasus, tetap mengirim cookie pada navigasi top-level |
| `Secure` | `true` di produksi | Token hanya lewat HTTPS |
| `Path` | `/` | Token valid untuk seluruh aplikasi |
| `Max-Age` | 604800 (7 hari) | Jendela kompromi dibatasi; owner bisa logout kapan saja |
| `Domain` | tidak diset | Cookie scoped ke domain sendiri (anti-subdomain takeover) |

Tidak ada `Domain` widelisting, tidak ada cookie readable via JS, tidak ada token di URL atau query string.

### 2.3 Klaim JWT

```json
{ "userId": "<uuid>", "email": "<email>", "role": "admin", "iat": 1730000000, "exp": 1730604800 }
```

- Algoritma: **HS256** (HMAC-SHA256), diverifikasi dengan `AUTH_SECRET`.
- Tidak ada dukungan `alg: "none"`. Verifikasi selalu memaksa HS256 - mencegah algoritma downgrade.
- Tidak menyimpan data sensitif di payload (hanya id, email, role).

### 2.4 Rotasi dan Revocation

| Aspek | Strategi |
|---|---|
| Rotasi `AUTH_SECRET` | Meng-invalidasi seluruh sesi (owner login ulang). Setiap 90 hari atau saat ada dugaan kebocoran. |
| Revocation per-sesi | Tidak didukung (JWT stateless). Mitigasi: TTL pendek 7 hari + logout menghapus cookie. |
| Rotasi password | `npm run db:setup` dengan `ADMIN_PASSWORD` baru (upsert). Setiap 90 hari. |
| Reset akun lupa | Jalankan `npm run db:setup` dengan kredensial baru. |

## 3. Kontrol Akses

### 3.1 Middleware (`src/middleware.ts`)

```
Request ke /admin/* (kecuali /admin/login)
   |
   +-- tidak ada cookie portfolio_session -> redirect /admin/login
   +-- cookie ada tapi signature invalid / expired -> hapus cookie -> redirect /admin/login
   +-- role bukan "admin" -> 403
   +-- lolos -> lanjut ke handler
```

**Defense in depth:** middleware bukan satu-satunya penjaga. Setiap server action mutasi memanggil `requireAdmin()` yang memverifikasi ulang cookie di sisi server.

### 3.2 Matriks Hak Akses

| Aksi | Anonim | Admin |
|---|---|---|
| Baca halaman publik | Ya | Ya |
| Kirim pesan kontak | Ya (rate limited) | Ya |
| Baca `/admin/*` | Tidak | Ya |
| Tambah/edit/hapus konten | Tidak | Ya |
| Ubah settings | Tidak | Ya |
| Lihat pesan masuk | Tidak | Ya |
| Jalankan `db:setup` | Tidak | Tidak (CLI + kredensial DB) |

`db:setup` sengaja tidak tersedia lewat HTTP. Membuat akun admin hanya bisa dilakukan dari mesin owner yang memegang `DATABASE_URL`.

### 3.3 Aturan Anti-CSRF

| Kontrol | Implementasi |
|---|---|
| SameSite=Lax | Cookie tidak ikut pada POST lintas-origin |
| Origin check | Server action memverifikasi `Origin` header mencocokkan host |
| Token CSRF eksplisit | Tidak dipakai (cukup untuk 1 admin, SameSite + Same-Origin policy) |
| Verifikasi aksi sensitif | Hapus resource selalu meminta konfirmasi |

## 4. Validasi Input

### 4.1 Prinsip

Tidak ada input yang dipercaya, baik dari browser, API, maupun database.

| Lapis | Kontrol |
|---|---|
| Client | Constraint HTML (`required`, `type=email`, `maxLength`) - hanya untuk UX, bukan keamanan |
| Server (Server Action dan Route Handler) | Zod schema - satu-satunya sumber validasi |
| Database | Tipe kolom, `NOT NULL`, `CHECK`, unique constraint, parameterized query |

### 4.2 Skema Validasi Inti

Form kontak (`src/lib/contact.ts`):

```ts
z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  subject: z.string().trim().max(160).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional().default(""),  // honeypot
});
```

Pengaturan: setiap key divalidasi terhadap tipe yang diharapkan; nilai bukan objek ditolak. Hex warna divalidasi sebagai `#RRGGBB` sebelum disimpan.

Resource CRUD: field wajib dicek berdasarkan definisi di `src/lib/resources.ts`; nilai boolean dipaksa menjadi `true`/`false` (bukan `null`); field list diparse menjadi array string dan diserialkan ke JSONB.

### 4.3 Proteksi SQL Injection

Semua query memakai parameterized query (`$1`, `$2`, ...) melalui helper `query()`/`execute()` di `src/lib/db.ts`.

```ts
// BENAR
await query("SELECT * FROM projects WHERE slug = $1", [slug]);

// SALAH - tidak pernah dipakai di kode ini
await query(`SELECT * FROM projects WHERE slug = '${slug}'`);
```

Nama tabel untuk CRUD generik berasal dari allow-list statis (`RESOURCES`), bukan dari input pengguna:

```ts
const def = RESOURCES[resourceKey];   // undefined -> 404
const table = def.table;              // mis. "projects" (tidak bisa di-inject)
```

Kolom dan `ORDER BY` juga berasal dari definisi statis, bukan dari string request.

### 4.4 Proteksi XSS

| Sumber data | Perlakuan |
|---|---|
| Isi artikel | Di-render dengan `react-markdown` + `remark-gfm`. React meng-escape HTML secara default; `rehype-raw` tidak dipakai sehingga tag HTML mentah tidak dieksekusi. |
| Teks biasa (judul, deskripsi, testimoni) | Di-render sebagai teks React - aman. |
| URL dari admin | Divalidasi: hanya `http://`/`https://` yang di-render sebagai link. |
| Custom CSS | Hanya nilai hex yang diterima untuk warna - mencegah injeksi CSS. |

### 4.5 Proteksi Path Traversal dan SSRF

Tidak ada endpoint yang membaca file berdasarkan parameter pengguna; seluruh aset dilayani Next.js. URL gambar eksternal tidak di-fetch server-side, sehingga tidak ada SSRF.

## 5. Proteksi terhadap Abuse

### 5.1 Rate Limit Form Kontak

| Parameter | Nilai |
|---|---|
| Window | 10 menit |
| Maksimum | 5 permintaan per IP |
| Penyimpanan | Map in-memory per instance |
| Header | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

Catatan: in-memory tidak berbagi state antar instance Vercel. Untuk proteksi lintas-region yang kuat, ganti dengan Upstash Redis (v2). Untuk v1, kombinasi honeypot dengan aturan validasi cukup menahan bot dasar.

### 5.2 Honeypot

Field `website` disembunyikan dari pengguna (CSS `position:absolute; left:-9999px`, bukan `display:none` agar bot tetap mengisinya). Schema Zod menolak nilai non-kosong dengan pesan "Spam terdeteksi" dan tidak menyimpan apa pun.

### 5.3 Rate Limit Login

Maksimal 5 percobaan gagal per IP dalam 5 menit. Pesan error bersifat generik agar tidak menjadi enumerator akun.

## 6. Manajemen Secret

| Secret | Env Var | Sumber | Dampak Kebocoran |
|---|---|---|---|
| Koneksi database | `DATABASE_URL` | Neon Dashboard - Connection string (pooled) | Fatal - rotasi password DB |
| Kunci tanda tangan JWT | `AUTH_SECRET` | `openssl rand -base64 48` | Fatal - rotasi, seluruh sesi invalid |
| Password admin awal | `ADMIN_PASSWORD` | Dibuat owner, hanya dipakai saat `db:setup` | Sedang - ganti setelah provisioning |
| Secret revalidasi | `REVALIDATE_SECRET` | `openssl rand -hex 32` | Sedang - rotasi |
| API key email (opsional) | `RESEND_API_KEY` | Resend dashboard | Sedang - rotasi |

### 6.1 Aturan

1. Semua secret hanya berada di environment variable - tidak pernah di-commit.
2. `.env`, `.env.local`, `.env*.local` masuk `.gitignore`.
3. Vercel menyimpan env secara terenkripsi; production dan preview punya nilai terpisah.
4. `.env.example` hanya berisi placeholder - tidak pernah berisi nilai asli.
5. Rotasi `AUTH_SECRET` dan password admin setiap 90 hari.
6. Bila secret pernah ter-expose (commit, log, screenshot), rotasi sebelum melakukan perubahan lain.

### 6.2 Pemeriksaan Rutin

```bash
git grep -nE "DATABASE_URL=.*|AUTH_SECRET=.*|RESEND_API_KEY=.*" -- ':!.env.example'
npm audit --production
```

## 7. Header Keamanan

Diterapkan di `next.config.ts` pada seluruh respons:

| Header | Nilai | Fungsi |
|---|---|---|
| `X-Frame-Options` | `SAMEORIGIN` | Mencegah clickjacking |
| `X-Content-Type-Options` | `nosniff` | Mencegah MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Membatasi kebocoran URL |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Menonaktifkan API browser yang tidak dipakai |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Memaksa HTTPS di produksi |

## 8. Checklist Keamanan Rilis

- [ ] Tidak ada kredensial di dalam repository (`git grep` bersih)
- [ ] `.env`, `.env.local`, `.env*.local` ada di `.gitignore`
- [ ] `AUTH_SECRET` diganti dari nilai default, panjangnya > 32 karakter
- [ ] Password admin produksi diganti dari nilai seed
- [ ] Connection string Neon memakai mode **pooled**
- [ ] Cookie sesi terverifikasi `HttpOnly` + `SameSite=Lax` + `Secure` di produksi
- [ ] `curl -I https://site.vercel.app/admin` tanpa cookie mengembalikan 307/302 ke `/admin/login`
- [ ] Cookie dengan signature diubah tetap ditolak
- [ ] `npm audit --production` → 0 critical/high
- [ ] Header keamanan tampil pada respons (`curl -I`)
- [ ] `robots.txt` melarang `/admin` dan `/api`
- [ ] Rate limit form kontak teruji (permintaan ke-6 ditolak)
- [ ] Honeypot teruji (isi `website` → ditolak, tidak ada baris baru)
- [ ] XSS teruji (isi `<script>` di field → ter-escape saat render)
- [ ] SQLi teruji (slug berisi `'` → aman, 404, tidak error 500)
- [ ] `POST /api/revalidate` tanpa secret → 401

## 9. Incident Response

### 9.1 Prosedur Umum

1. **Deteksi**: monitor log Vercel, notifikasi error, atau laporan owner.
2. **Kontekanan**: Nonaktifkan deploy (Vercel -> Deployments -> promote rollback), cabut env yang bocor.
3. **Eradikasi**: rotasi seluruh secret yang mungkin terdampak, patch kode, bersihkan data yang disusupi.
4. **Pemulihan**: deploy versi bersih, pulihkan DB dari backup bila perlu.
5. **Pelajaran**: dokumentasikan insiden, tambahkan kontrol pencegahan, perbarui `05-PLANNING/risks.md`.

### 9.2 Skenario dan Respons

| Skenario | Prioritas | Langkah Pertama |
|---|---|---|
| `AUTH_SECRET` bocor | Kritis | Rotasi `AUTH_SECRET` di Vercel - seluruh sesi langsung invalid |
| `DATABASE_URL` bocor | Kritis | Reset password di Neon, buat connection string baru, update env Vercel |
| Password admin bocor | Tinggi | `npm run db:setup` dengan `ADMIN_PASSWORD` baru, rotasi `AUTH_SECRET` |
| Dependency CVE kritis | Tinggi | `npm audit`, upgrade paket, deploy ulang |
| Akun admin dibajak | Tinggi | Rotasi `AUTH_SECRET` + password, cek log akses, audit isi konten |
| Spam pada form kontak | Sedang | Rate limit sudah aktif; tambahkan honeypot/Upstash Redis bila berulang |
| Konten XSS tersimpan | Sedang | Hapus konten, audit sumber, review renderer |

### 9.3 Kontak Darurat

| Peran | Nama | Kanal |
|---|---|---|
| Owner / developer | - | Email pribadi, GitHub Issues repository |
| Penyedia database | Neon Support | Dashboard Neon -> Support |
| Penyedia hosting | Vercel Support | Dashboard Vercel -> Support |

## 10. Batasan Keamanan yang Diketahui

| Batasan | Dampak | Mitigasi / Rencana |
|---|---|---|
| Rate limit in-memory | Tidak berlaku lintas region Vercel | Pindah ke Upstash Redis (v2) |
| Tidak ada 2FA | Password tunggal | Tambahkan TOTP bila admin > 1 (v2) |
| JWT tidak bisa dicabut per-sesi | Sesi bertahan sampai 7 hari | TTL pendek + logout + rotasi secret |
| Tidak ada audit log | Sulit melacak perubahan | Tambah tabel `audit_log` (v2) |
| Taksonomi konten terbatas | Sulit mengelompokkan konten kompleks | Kategori sederhana sudah cukup untuk v1 |
| Hard delete | Konten hilang permanen | Ubah ke soft delete bila dibutuhkan (v2) |