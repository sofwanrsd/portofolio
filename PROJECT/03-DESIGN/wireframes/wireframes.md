# 03: Wireframes (Low-Fidelity)

Dokumen ini mendeskripsikan tata letak dan alur layar dalam bentuk low-fidelity (struktur, hierarki, dan perilaku) sebelum detail visual dipoles. Referensi visual token ada di `03-DESIGN/design-system.md`.

**Legend:**
```
[ ]  Input / field        ( )  Radio        [x] Checkbox
[=]  Textarea             (•)  Tab aktif    [⋯]  Tombol aksi
+---+  Kartu / container  ▭▭▭  Grid 3 kolom
```

---

## W-01: Beranda (Desktop, ≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [NK] Nama    Home  Projects  Services  Blog  About  Contact  [CTA]   │  ← sticky header
├──────────────────────────────────────────────────────────────────────┤
│  ● Tersedia untuk project baru                                      │
│                                                                      │
│  Saya bikin website yang                  ┌───────────────────────┐  │
│  enak dipakai dan enak dilihat.          │  Cover Project        │  │
│                                            │  (16:10, radius 12)   │  │
│  Full-stack developer dengan fokus        └───────────────────────┘  │
│  pada performa, aksesibilitas, dan                                   │
│  desain yang bersih.                                                │
│  [Lihat Project]  [Hubungi Saya]                                    │
├──────────────────────────────────────────────────────────────────────┤
│  SERVICES                                                            │
│  ▭▭▭▭▭▭   ▭▭▭▭▭▭   ▭▭▭▭▭▭      ← 3 kolom: ikon + judul + ringkas │
├──────────────────────────────────────────────────────────────────────┤
│  SELECTED WORK           [Lihat semua →]                            │
│  ▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭   ← 3 kolom: cover + title +       │
│  Judul Project       Judul Project       Judul Project              │
│  Ringkasan 1-2 baris  chip stack        chip stack                   │
│  [2025] [Web App]                                                  │
├──────────────────────────────────────────────────────────────────────┤
│  ABOUT   ▭▭▭▭▭▭▭▭ (foto/avatar)   Teks profil 3-4 baris + tombol    │
├──────────────────────────────────────────────────────────────────────┤
│  SKILLS                                                             │
│  Languages      [React ████████░░ 85]  [TypeScript ███████░░░ 78]    │
│  Frameworks     [Next.js █████████░ 92] [Tailwind ████████░░ 80]    │
├──────────────────────────────────────────────────────────────────────┤
│  EXPERIENCE                                                         │
│  2023: sekarang   Peran  ·  Perusahaan     deskripsi 1-2 baris      │
│  2021: 2023       Peran  ·  Perusahaan     deskripsi                 │
├──────────────────────────────────────────────────────────────────────┤
│  TESTIMONIALS        ▭▭▭▭▭▭   ▭▭▭▭▭▭   ▭▭▭▭▭▭                   │
│                      "kutipan"    "kutipan"   "kutipan"               │
├──────────────────────────────────────────────────────────────────────┤
│  PRICING: Paket Layanan                                             │
│  ▭▭▭▭▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭▭▭▭▭   ← kartu paket     │
│  Lite              Pro  ★POPULER     Custom                         │
│  fitur...          fitur...         fitur...                        │
│  Rp 2.5jt          Rp 7jt           Hubungi                         │
│  [Pesan]           [Pesan]          [Pesan]                          │
├──────────────────────────────────────────────────────────────────────┤
│  FROM THE BLOG            [Semua artikel →]                         │
│  ▭▭▭▭▭▭▭  Judul    ▭▭▭▭▭▭▭  Judul    ▭▭▭▭▭▭▭  Judul                │
├──────────────────────────────────────────────────────────────────────┤
│  CTA BANNER: "Punya ide project?"   [Mulai Diskusi]                 │
├──────────────────────────────────────────────────────────────────────┤
│  CONTACT / FOOTER                                                    │
│  [form inquiry]              social icons · copyright · tagline      │
└──────────────────────────────────────────────────────────────────────┘
```

**Perilaku:**
- Setiap section punya `id` untuk anchor link dan dapat dimatikan lewat `settings.sections`.
- Hero memakai 2 kolom di ≥1024px; stack vertikal di bawah 768px.
- Section Pricing-info hides itself entirely when `features.showPricing = false`.

---

## W-02: Mobile Beranda (360px)

```
┌──────────────────────┐
│ [NK]        ☰        │  ← hamburger → drawer full-screen
├──────────────────────┤
│ ● Tersedia           │
│                      │
│ Saya bikin website   │
│ yang enak dipakai    │
│ dan enak dilihat.    │
│                      │
│ [Lihat Project]      │
│ [Hubungi Saya]       │
├──────────────────────┤
│ ▭▭▭▭▭▭▭▭ (1 kolom)  │
├──────────────────────┤
│ [Scroll]              │
└──────────────────────┘
```
- Semua grid multi-kolom runtuh ke 1 kolom.
- Tombol CTA melebar penuh (min-height 44px, target sentuh).
- Drawer menu: logo di atas, 6 tautan vertikal, tombol CTA di bawah.

---

## W-03: Detail Project

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← Semua Project                        [Repo] [Live ↗]              │
├──────────────────────────────────────────────────────────────────────┤
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭  ← cover penuh (16:9)                    │
├──────────────────────────────────────────────────────────────────────┤
│  Judul Project                          [2025] [Web App] [★ Featured] │
│  Ringkasan satu kalimat.                                              │
│                                                                      │
│  ┌─── BODY ───────────────────────────────────────────────────────┐  │
│  │ ## Masalah                                                       │  │
│  │ Paragraf.                                                        │  │
│  │ - Poin satu                                                      │  │
│  │ - Poin dua                                                       │  │
│  │ > Kutipan                                                       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  STACK                                                               │
│  (React) (Next.js) (PostgreSQL) (Tailwind)                            │
│                                                                      │
│  GALERI                                                             │
│  ▭▭▭▭  ▭▭▭▭  ▭▭▭▭                                                   │
├──────────────────────────────────────────────────────────────────────┤
│  ← Project sebelumnya        Project berikutnya →                    │
└──────────────────────────────────────────────────────────────────────┘
```

**Perilaku:**
- `description` di-render sebagai Markdown-lite (heading `##`, list `-`, quote `>`, bold, code, link).
- `cover_image` kosong → blok gradien placeholder setinggi 16:9.
- Galeri kosong → section disembunyikan.
- Metadata tidak ada di detail project (langsung menampilkan), section "Tentang" memuat ringkasan.

---

## W-04: Daftar Project (`/projects`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Page Title + subtitle                                               │
│  ( All )  ( Web )  ( UI/UX )  ( Automation )  ( Mobile )             │
├──────────────────────────────────────────────────────────────────────┤
│  ▭▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭▭                                 │
│  Judul        Judul         Judul                                     │
│  chip chip    chip chip      chip chip                                  │
│  2025 · Web   2024 · UI     2025 · Mobile                             │
├──────────────────────────────────────────────────────────────────────┤
│  ▭▭▭▭▭▭▭▭   ▭▭▭▭▭▭▭▭                                         │
└──────────────────────────────────────────────────────────────────────┘
```
- Filter kategori = tab, state di URL query (`?category=web`) supaya bisa di-share.
- Grid 3 kolom ≥1024px, 2 kolom ≥640px, 1 kolom <640px.
- Card: cover 16:10, judul, ringkasan 2 baris (clamp), chip stack, meta tahun/kategori.

---

## W-05: Admin Dashboard (`/admin`)

```
┌────────────┬─────────────────────────────────────────────────────────┐
│  [A] Admin │  Dashboard                                               │
│            │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│ ▸ Dashboard│  │ Project│ │ Artikel│ │ Pesan  │ │ Paket  │             │
│   Project  │  │  12    │ │   8    │ │  3 ⚠  │ │   4    │             │
│   Artikel  │  └────────┘ └────────┘ └────────┘ └────────┘             │
│   Layanan  │                                                         │
│   Pengalam.│  AKTIVITAS TERBARU          QUICK ACTIONS                │
│   Skill    │  • Pesan baru: Budi         [+ Project] [+ Artikel]     │
│   Testimon.│  • Project: Toko Online      [+ Paket]  [+ Pesan]       │
│   Pesan ⚠3 │  • Artikel: 5 Tips React                                │
│   Pengatur.│                                                         │
│            │                                                         │
│  Lihat ↗   │                                                         │
│  Admin  ⏻ │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘
```
- Sidebar lebar 240px, sticky, highlight item aktif dengan `bg-accent/12` + teks accent.
- Di <1024px sidebar diganti bottom-nav/drawer.

---

## W-06: Admin CRUD Resource (`/admin/projects`)

```
┌────────────┬─────────────────────────────────────────────────────────┐
│  sidebar   │  Project                              [+ Tambah Project] │
│            │  ─────────────────────────────────────────────────────  │
│            │  [🔍 Cari judul atau tag…            ] [Status ▾]      │
│            │  ┌──────────────────────────────────────────────────┐    │
│            │  │ Judul      │ Kategori │ Stack │ ★ │ Status │ ⋯  │    │
│            │  ├────────────┼──────────┼───────┼───┼────────┼────┤    │
│            │  │ Toko Online│ Web      │ 4    │ ✓ │ 🟢    │ ⋯  │    │
│            │  │ App Kasir  │ Web      │ 3    │ ○ │ 🟢    │ ⋯  │    │
│            │  │ Redesign   │ UI/UX    │ 2    │ ○ │ ⚪    │ ⋯  │    │
│            │  └──────────────────────────────────────────────────┘    │
│            │  1–3 dari 12                                          │
└────────────┴─────────────────────────────────────────────────────────┘

MODAL / DRAWER: Tambah Project
┌──────────────────────────────────────────────────────┐
│  Tambah Project                                    ✕ │
│  ──────────────────────────────────────────────────── │
│  Judul *              [________________________]     │
│  Slug URL             [________________________]     │
│                       (auto dari judul bila kosong)  │
│  Ringkasan *          [________________________]     │
│                       textarea, maks 200 karakter    │
│  Deskripsi            [                          ]  │
│                       textarea 10 baris             │
│  Kategori             ( Web ▾ )                     │
│  Cover Image URL      [________________________]     │
│  Stack                [Next.js                     ]  │
│                       (satu per baris → chip)        │
│  Klien / Tahun        [__________] [____]           │
│  Repo / Live          [__________] [__________]      │
│  Urutan               [0]                           │
│  ( ) Featured   (x) Published                        │
│  ──────────────────────────────────────────────────── │
│  [Batal]                              [Simpan Project]│
└──────────────────────────────────────────────────────┘
```

**Perilaku:**
- Drawer modal slide-in dari kanan (desktop) / bottom sheet (mobile).
- Kolom `⋯` membuka menu: Edit, Toggle Publish, Hapus.
- Field list/tags: textarea satu item per baris → disimpan JSONB → tampil sebagai chip dengan tombol ×.
- Checkbox boolean: tidak dicentang = `false` (bukan `null`).
- Setelah simpan: toast sukses + tabel ter-refresh tanpa full reload.

---

## W-07: Admin Pengaturan (`/admin/settings`)

```
┌────────────┬─────────────────────────────────────────────────────────┐
│  sidebar   │  Pengaturan                              [Simpan semua] │
│            │  ─────────────────────────────────────────────────────  │
│            │  ▾ IDENTITAS SITUS                                       │
│            │    Nama        [____________________]                    │
│            │    Teks Logo   [NK]  Tagline [__________________]         │
│            │    Deskripsi  [________________________________________] │
│            │  ▾ HERO / HEADLINE                                      │
│            │    Judul       [________________________________________] │
│            │    Subjudul    [________________________________________] │
│            │    [x] Tampilkan badge ketersediaan                     │
│            │  ▾ TEMA & TAMPILAN                                      │
│            │    Aksen   [🎨] [#6366f1]   Aksen 2 [🎨] [#22d3ee]       │
│            │    Mode (•) Gelap ( ) Terang   Radius ( Lunak ▾ )        │
│            │    [x] Tampilkan latar grid                              │
│            │  ▾ SECTION HOME                                          │
│            │    [x] Hero  [x] Layanan  [x] Project  [x] About        │
│            │    [x] Skill  [x] Pengalaman  [x] Testimoni             │
│            │    [x] Pricing  [x] Blog  [x] CTA  [x] Kontak           │
│            │  ▾ JUALAN & CTA                                          │
│            │    [x] Aktifkan banner Hire Me                           │
│            │    Judul [__________]  Teks [_________________________]  │
│            │    [x] Tampilkan section pricing                         │
│            │  ▾ SOCIAL MEDIA  (GitHub, LinkedIn, Twitter, IG, YT, WA)  │
│            │  ▾ SEO  (meta title, description, keywords, og image)    │
│            │  ▾ FOOTER (tagline, copyright, [x] tampilkan)             │
└────────────┴─────────────────────────────────────────────────────────┘
```
- Semua section berupa accordion; state buka/tutup tidak persisten (v1).
- Satu tombol "Simpan semua" di sticky footer + satu di header.
- Nilai hex bisa diisi manual lewat input teks (validasi `#RRGGBB`) atau color picker.

---

## W-08: Admin Inbox Pesan (`/admin/messages`)

```
┌────────────┬─────────────────────────────────────────────────────────┐
│  sidebar   │  Pesan                              [Semua ▾] [Hapus ▾]  │
│            │  ─────────────────────────────────────────────────────  │
│            │  ● Budi Santoso: butuh web toko      [Baru] [Arsipkan] │
│    3 baru  │    budi@contoh.id · 2 jam lalu · Budget: 5-10jt        │
│            │    "Halo, saya butuh toko online..."                    │
│            │  ─────────────────────────────────────────────────────  │
│            │  ○ Sari: tanya layanan SEO          [Baru] [Arsipkan] │
│            │    sari@contoh.id · 1 hari lalu                         │
│            │    "Mau tanya paket SEO..."                             │
└────────────┴─────────────────────────────────────────────────────────┘
```
- Badge "●" = status `new`; klik baris → ubah menjadi `read`.
- Filter: Semua / Belum dibaca / Archived.
- Hapus → dialog konfirmasi.

---

## W-09: Login Admin (`/admin/login`)

```
┌───────────────────────────────┐
│                               │
│            [A]                │
│         Portfolio CMS         │
│   Masuk untuk mengelola      │
│          konten Anda          │
│                               │
│   Email    [________________]  │
│   Password [________________]  │
│                               │
│   [      Masuk      ]         │
│                               │
│   ⚠ Email atau password salah │
│                               │
└───────────────────────────────┘
```
- Kartu terpusat, lebar maks 380px, di atas latar grid.
- Error tampil inline di bawah form dengan ikon peringatan, `role="alert"`.
- Submit loading: tombol disabled + spinner.

---

## W-10: Form Kontak Publik (`/contact`)

```
┌───────────────────────────────┬──────────────────────────────────────┐
│  Kontak                       │  Nama *    [________________________]  │
│  Punya ide project?           │  Email *   [________________________]  │
│  Ceritakan kebutuhan Anda...  │  Subjek    [________________________]  │
│                               │  Budget    [__________] (opsional)    │
│  Email: hello@domain.com      │  Pesan *   [                        ]  │
│  WhatsApp: +62 812-xxx        │            [                        ]  │
│  Lokasi: Jakarta              │  [ Kirim Pesan ]                      │
└───────────────────────────────┴──────────────────────────────────────┘
```
- Dua kolom di desktop (kontak info | form), satu kolom di mobile.
- Field honeypot `website` disembunyikan via CSS (`position:absolute; left:-9999px`): bukan `display:none` agar bot tetap mengisinya.
- Setelah sukses: form dikosongkan dan muncul pesan hijau "Terima kasih, pesan Anda terkirim."

---

## W-11: Halaman 404

```
┌───────────────────────────────────────┐
│               404                     │
│   Halaman tidak ditemukan             │
│   Halaman yang Anda cari sudah       │
│   dipindahkan atau tidak pernah ada.  │
│   [ Kembali ke beranda ]              │
└───────────────────────────────────────┘
```

---

## W-12: Error & Loading States

| Situasi | Tampilan |
|---|---|
| Halaman publik sedang memuat | Konten skeleton (blok abu-abu dengan animasi shimmer) pada card & list |
| Query DB gagal | Fallback: section kosong dengan teks "Konten sedang dimuat ulang." + error log di server |
| Admin: tabel kosong | "Belum ada data. [+ Tambah pertama]" |
| Admin: simpan gagal | Alert merah di atas form: "Gagal menyimpan. Coba lagi." |
| Admin: hapus | Dialog modal: "Hapus item ini? Tindakan tidak dapat dibatalkan." |
| Form kontak gagal | Pesan error per-field (merah, kecil, di bawah input) + ringkasan error di atas form |
| 404 | `src/app/not-found.tsx` (custom, bilingual-friendly) |
| Error server 500 | Halaman error default Next.js (production), log ke Vercel |

---

## Ringkasan Validasi Wireframe

| Wireframe | AC terkait |
|---|---|
| W-01 Beranda | AC-01.1–01.8 |
| W-02 Mobile | AC-14.4 |
| W-03 Detail Project | AC-02.2–02.6, AC-03.2 |
| W-04 Daftar Project | AC-02.1, AC-02.5 |
| W-05 Dashboard | AC-09.1–09.3 |
| W-06 CRUD Resource | AC-10.1–10.12 |
| W-07 Pengaturan | AC-12.1–12.9 |
| W-08 Inbox | AC-11.1–11.5 |
| W-09 Login | AC-08.1–08.3 |
| W-10 Form Kontak | AC-06.1–06.5 |
| W-11 404 | AC-07.4 |
| W-12 Error states | AC-14.6 |
