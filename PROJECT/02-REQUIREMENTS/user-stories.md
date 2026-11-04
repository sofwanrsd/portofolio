# 02 — User Stories

Format: `US-<area><nomor>` · prioritas MoSCoW · estimasi story point (SP).

Semua story di bawah **sudah diimplementasikan** pada kode di repo ini; kolom Implementasi menunjuk ke file aktual.

---

## EP-A — Publik: Showcase dan Jualan

### US-P01 — Melihat daftar project
> Sebagai **calon klien**, saya ingin melihat daftar project saya dengan cover, kategori, dan tech stack, agar saya dapat menilai kemampuan saya dengan cepat.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-P01, AC-P02, AC-P03
- **Implementasi:** `src/app/projects/page.tsx`, `src/components/sections/projects.tsx`, `src/components/project-card.tsx`
- **Data:** tabel `projects`, filter `published = true`, urutan `featured DESC, sort_order ASC`

### US-P02 — Membuka detail project
> Sebagai **calon klien**, saya ingin membuka satu project untuk melihat deskripsi lengkap, galeri, stack, dan tautan repo serta live, agar saya bisa menilai kualitas eksekusi.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-P04, AC-P05
- **Implementasi:** `src/app/projects/[slug]/page.tsx`, `src/components/detail.tsx`

### US-P03 — Melihat paket dan harga
> Sebagai **calon klien**, saya ingin melihat paket layanan beserta harga dan fiturnya, agar saya bisa memperkirakan budget sebelum menghubungi.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-P06, AC-P07
- **Implementasi:** `src/app/services/page.tsx`, `src/lib/data.ts` (`getServices`)

### US-P04 — Mengirim inquiry
> Sebagai **calon klien**, saya ingin mengirim pesan berisi kebutuhan dan budget saya, agar saya bisa langsung dihubungi tanpa perlu email terpisah.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-P08, AC-P09, AC-P10, AC-P11
- **Implementasi:** `src/app/contact/page.tsx`, `src/components/contact-form.tsx`, `src/app/actions/contact.ts`, `src/lib/contact.ts`

### US-P05 — Membaca profil dan pengalaman
> Sebagai **recruiter**, saya ingin melihat profil, timeline pengalaman, skill, dan testimoni, agar saya bisa menilai kandidat dalam 30 detik.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-P12, AC-P13
- **Implementasi:** `src/app/about/page.tsx`, `src/components/sections/content.tsx`
### US-P06 — Membaca artikel
> Sebagai **pembaca**, saya ingin membaca artikel dan menemukan artikel lain, agar saya mendapat manfaat dan tetap kembali ke situs.

- **Prioritas:** Should · **SP:** 3
- **AC:** AC-P14, AC-P15
- **Implementasi:** `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`

### US-P07 — Ditemukan lewat mesin pencari
> Sebagai **pengunjung dari Google**, saya ingin halaman situs terindeks dengan metadata yang benar, agar saya bisa menemukan profil yang relevan.

- **Prioritas:** Must · **SP:** 2
- **AC:** AC-P16, AC-P17
- **Implementasi:** `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx`, `next.config.ts`

### US-P08 — Menavigasi di ponsel
> Sebagai **visitor mobile**, saya ingin situs yang nyaman di layar kecil, agar saya tidak perlu melakukan zoom.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-P18
- **Implementasi:** `src/components/site-header.tsx`, `src/app/globals.css`

---

## EP-B — Admin: Autentikasi

### US-A01 — Login
> Sebagai **owner**, saya ingin login dengan email dan password, agar saya bisa masuk ke area pengelolaan konten.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-A01, AC-A02, AC-A03
- **Implementasi:** `src/app/admin/login/page.tsx`, `src/components/admin/login-form.tsx`, `src/app/actions/auth.ts`

### US-A02 — Sesi bertahan dan logout
> Sebagai **owner**, saya ingin tetap login selama beberapa hari dan bisa logout kapan saja, agar saya tidak login ulang tiap kali mengedit.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-A04, AC-A05
- **Implementasi:** `src/lib/auth.ts` (JWT 7 hari), `src/middleware.ts`, `logoutAction`

### US-A03 — Akses admin terlindungi
> Sebagai **owner**, saya ingin area admin tidak bisa diakses tanpa login, agar konten saya aman.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-A06, AC-A07
- **Implementasi:** `src/middleware.ts` (cookie `portfolio_session`), `requireAdmin()` di setiap server action
---

## EP-C — Admin: CRUD Konten

### US-C01 — Menambah project
> Sebagai **owner**, saya ingin menambah project baru lewat form, agar portofolio saya selalu mutakhir.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-C01, AC-C02, AC-C03, AC-C04
- **Implementasi:** `src/app/admin/(dashboard)/[resource]/page.tsx`, `src/components/admin/resource-manager.tsx`, `createResource`

### US-C02 — Mengubah project
> Sebagai **owner**, saya ingin mengubah isi project yang sudah ada, agar deskripsi selalu akurat.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-C05, AC-C06
- **Implementasi:** `updateResource`

### US-C03 — Menghapus project
> Sebagai **owner**, saya ingin menghapus project yang salah, agar tidak ada konten keliru.

- **Prioritas:** Must · **SP:** 2
- **AC:** AC-C07
- **Implementasi:** `deleteResource` dengan konfirmasi di UI

### US-C04 — Publish dan draft
> Sebagai **owner**, saya ingin menpublish atau menyimpan draft project, agar visitor hanya melihat yang sudah final.

- **Prioritas:** Must · **SP:** 3
- **AC:** AC-C08, AC-C09
- **Implementasi:** `togglePublished`, kolom `published` pada tabel konten

### US-C05 — Menulis artikel
> Sebagai **owner**, saya ingin menulis artikel dari panel admin, agar saya bisa menerbitkan konten secara mandiri.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-C10, AC-C11
- **Implementasi:** resource `posts` pada `src/lib/resources.ts`, `src/app/blog/[slug]/page.tsx`

### US-C06 — Mengatur paket dan harga
> Sebagai **owner**, saya ingin mengubah paket layanan beserta harganya, agar tawaran saya selalu sesuai pasar.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-C12, AC-C13, AC-C14
- **Implementasi:** resource `services` (field `price_value`, `price_label`, `currency`, `popular`)

### US-C07 — Mengatur pengalaman, skill, dan testimoni
> Sebagai **owner**, saya ingin mengelola pengalaman, skill, dan testimoni, agar profil saya akurat dan tepercaya.

- **Prioritas:** Must · **SP:** 5
- **AC:** AC-C15, AC-C16
- **Implementasi:** resource `experience`, `skills`, `testimonials`

### US-C08 — Pencarian data admin
> Sebagai **owner**, saya ingin mencari item di daftar admin, agar saya tidak perlu menggulir panjang.

- **Prioritas:** Should · **SP:** 2
- **AC:** AC-C17
- **Implementasi:** `listResource` dengan filter `ILIKE`
