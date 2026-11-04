# 03 — UI Design (High-Fidelity Spec)

Dokumen ini menerjemahkan wireframe (`03-DESIGN/wireframes/wireframes.md`) menjadi spesifikasi visual yang dapat langsung diimplementasikan. Token warna, tipografi, dan spacing mengikuti `03-DESIGN/design-system.md`.

---

## 1. Prinsip Visual

1. **Dark-first.** Mode gelap adalah default; terang adalah variasi, bukan fitur tambahan.
2. **Satu aksen.** Warna aksen hanya untuk aksi penting (CTA, link aktif, status). Tidak dipakai sebagai dekorasi.
3. **Border tipis, bukan shadow tebal.** Pemisah visual memakai `1px solid var(--border)` + surface sedikit lebih terang.
4. **Grid sebagai tekstur.** Latar memakai garis 1px berjarak 48px dengan opasitas rendah — memberi rasa "drafting", bukan dekorasi.
5. **Tipografi sebagai hierarki utama.** Ukuran + weight membentuk struktur; bukan warna atau garis dekoratif.

## 2. Implementasi Tema Dinamis

Tema berasal dari `settings` dan diterapkan di level `<body>` lewat inline CSS variable, sehingga admin dapat mengganti warna tanpa build.

```html
<!-- src/app/layout.tsx -->
<body style={{
  "--accent": settings.theme.accent,
  "--accent-2": settings.theme.accentSecondary,
  "--radius": radiusMap[settings.theme.radius],
}}>
```

```css
/* src/app/globals.css */
:root {
  --accent: #6366f1;
  --accent-2: #22d3ee;
  --radius: 12px;
}
```

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0a0a0b` | `#ffffff` |
| `--fg` | `#fafafa` | `#0a0a0b` |
| `--muted` | `#a1a1aa` | `#52525b` |
| `--border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |
| `--card` | `#111113` | `#ffffff` |

Mode determined by `settings.theme.mode`; nilai default "dark".

## 3. Sistem Grid & Spacing

| Token | Nilai | Penggunaan |
|---|---|---|
| `--container` | 1200px | Lebar maksimum konten |
| `--gutter` | 24px (16px mobile) | Padding horizontal |
| Section gap | 96px (64px mobile) | Jarak antar section |
| Card gap | 24px | Jarak antar kartu |
| Radius | `soft` 12px, `sharp` 4px, `round` 999px | Dari settings |

```
Container
┌──────────────────────────────────────────────────────────┐
│  padding-inline: 24px                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │  max-w-[1200px] mx-auto                             │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 4. Komponen Inti

### 4.1 Button

| Varian | Pemakaian | Styling |
|---|---|---|
| Primary | CTA utama (hero, form, simpan) | `bg-[var(--fg)] text-[var(--bg)]` |
| Accent | Badge/penanda aktif | `bg-[var(--accent)] text-white` |
| Ghost | Aksi sekunder, icon button | transparan + hover `bg-[var(--border)]/50` |
| Danger | Hapus | `text-red-400` + border merah saat hover |

```tsx
// Primary
className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-60"
```

**Spesifikasi:**
- Height: 40px (default), 44px (mobile — target sentuh minimum).
- Radius: `rounded-lg` (8px) di dalam surface radius 12px.
- Icon 15px, gap 8px.
- State: default → hover (opacity 0.9) → focus (ring 2px accent, offset 2px) → disabled (opacity 0.6, no pointer) → loading (spinner 15px, label dipertahankan).

### 4.2 Card

```tsx
className="group overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] transition-colors hover:border-[var(--accent)]/40"
```
- Border 1px, radius mengikuti `--radius-base`.
- Hover: border accent 40% + `translateY(-2px)` (hanya di pointer:fine).
- Tidak memakai `box-shadow` besar; maksimal `shadow-lg` pada elemen elevated (dropdown, sticky bar).

### 4.3 Badge / Chip

| Jenis | Styling |
|---|---|
| Tag stack | `rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11.5px] text-[var(--muted)]` |
| Status aktif | `bg-emerald-500/12 text-emerald-400` |
| Status draft | `bg-[var(--border)]/60 text-[var(--muted)]` |
| Featured | `bg-[var(--accent)]/12 text-[var(--accent)]` |

### 4.4 Input & Form Field

```tsx
className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
```
- Label: `text-[13px] font-medium`, margin bawah 6px.
- Help text: `text-[11.5px] text-[var(--muted)]`, margin atas 4px.
- Error: border merah + `text-[12px] text-red-400` di bawah field.
- Textarea: `py-2.5`, `resize-y`, tinggi minimum 3 baris.
- Select: native `<select>` dengan `appearance-none` + ikon chevron custom, `h-10`.
- Boolean: checkbox 16px dengan `accent-[var(--accent)]`.
-Required: tanda `*` merah di setelah label + validasi Zod di server.

### 4.5 Section Heading

```
┌────────────────────────────┐
│ ▎SERVICES            ← eyebrow: text-[11.5px] uppercase tracking-[0.18em] text-[var(--muted)]
│  Heading                ← h2: text-[28px] md:text-[34px] font-semibold tracking-tight
│  Subheading (opsional)   ← text-[14px] text-[var(--muted)] max-w-[560px]
└────────────────────────────┘
```
- Eyebrow didahului garis aksen 2px × 14px (`before:` pseudo-element) atau bar aksen vertikal.
- Jarak eyebrow → heading: 10px; heading → subheading: 10px; heading blok → konten: 40px.

### 4.6 Navbar

- Tinggi 64px, `sticky top-0`, `backdrop-blur`, background `rgba(bg, 0.8)`, border-bottom tipis.
- Logo: kotak 32px dengan gradien aksen + teks logo (2 huruf) + nama situs.
- Tautan: `text-[13.5px]`, aktif = `text-[var(--fg)]`, non-aktif = `text-[var(--muted)]`, hover = fg.
- Tombol CTA di kanan: primary, `h-9`.
- Mobile (<768px): logo kiri, hamburger kanan → drawer full-screen.

### 4.7 Footer

- Background `bg-[var(--bg)]`, border-top `1px solid var(--border)`.
- 3 kolom di desktop (brand + tagline / navigasi / social + email), 1 kolom di mobile.
- Social: ikon 36px, border tipis, hover → border accent.
- Barisan bawah: copyright di kiri, "Built with Next.js" di kanan, dipisah garis.

## 5. Halaman Public — Spesifikasi Detail

### 5.1 Hero

```
Grid: 1.1fr / 0.9fr, gap 48px, align center
Desktop: teks kiri, cover kanan (aspect 4/3, radius var(--radius-base))
Mobile: teks dulu, cover di bawah (aspect 16/10)
```
- Badge ketersediaan: `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12.5px]` + titik hijau 6px dengan pulse.
- H1: `text-[36px] md:text-[52px] font-semibold leading-[1.08] tracking-tight`. Maks 2 baris; teks panjang di-`text-balance`.
- Subjudul: `text-[15px] md:text-[16px] text-[var(--muted)] leading-relaxed max-w-[560px]`.
- CTA row: gap 12px; primary `h-11`, ghost `h-11`.
- Cover: `site.heroImage` bila diisi. Jika kosong → panel gradient mesh (aksen → aksen-2, opacity ~0.28) dengan pola grid, berisi:
  - Baris atas: pill "Fokus kerja" (kiri) dan pill jumlah project (kanan), keduanya `border-[var(--border)] bg-[var(--card)]/70 backdrop-blur-sm`.
  - Ornamen cincin konsentris `aria-hidden` di area tengah-atas, ukuran tetap (128/80/40px) agar tidak menabrak teks di viewport pendek.
  - Blok bawah: judul tagline `text-[19px] text-[var(--fg)]`, baris lokasi + email `text-[12.5px] text-[var(--muted)]`, dan grid 3 chip (Performa, Aksesibilitas, Desain).
  - Seluruh teks panel memakai token (`--fg`, `--muted`, `--border`, `--card`), bukan putih keras, supaya kontras tetap aman saat `data-theme=light`.

### 5.2 Project Card

```
┌──────────────────────────┐
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭ │  aspect 16/10, object-cover
│ ▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭ │
├──────────────────────────┤
│ Judul Project            │  text-[16px] font-semibold
│ Ringkasan dua baris.     │  text-[13.5px] text-[var(--muted)] line-clamp-2
│ (React) (Next.js)        │  chip row, max 4 + "+n"
│ 2025 · Web App           │  text-[12px] text-[var(--muted)]
└──────────────────────────┘
```
- Card link penuh: judul memakai `after:absolute inset-0` agar area klik penuh tanpa membungkus tiap elemen.
- Hover cover: `scale-[1.03]` dengan `transition-transform duration-500`.

### 5.3 Pricing Card

```
┌──────────────────────────┐
│      ★ POPULER           │  hanya pada paket popular: ribbon accent
│  Nama Paket              │  text-[15px] font-semibold
│  Deskripsi paket.        │  text-[13px] text-[var(--muted)] min-h 40px
│  ─────────────────────   │
│  Rp 2.500.000            │  text-[26px] font-semibold
│  per project             │  price_label, text-[12px] muted
│  ✓ Fitur satu            │  check emerald + text-[13px]
│  ✓ Fitur dua             │
│  [ Pesan Paket Ini ]     │  full width, h-11
└──────────────────────────┘
```
- Paket popular: border accent 50%, `scale-[1.02]` di desktop, `bg-[var(--accent)]/[0.04]`.
- Format harga: `formatPrice(value, currency)` → IDR `"2.500.000"` → `Rp 2.500.000`; non-numerik ditampilkan apa adanya.

### 5.4 Skill Bar

```
React                              ▓▓▓▓▓▓▓▓░░  85%
```
- Label kiri `text-[13px]`; nilai kanan `text-[12px] text-[var(--muted)]`.
- Bar: tinggi 6px, `rounded-full bg-[var(--border)]`; fill `bg-[var(--accent)]`.
- Lebar = nilai level%.

### 5.5 Testimonial

```
┌──────────────────────────┐
│ ★★★★★                   │  ikon star accent
│ "Kutipan klien..."       │  text-[14px] leading-relaxed
│  (avatar) Nama           │  avatar 36px circle + nama + peran/perusahaan
└──────────────────────────┘
```

### 5.6 Form Kontak

- Input `h-11`, textarea 6 baris.
- Tombol submit full-width di mobile, auto-width di desktop.
--after-success: alert hijau `bg-emerald-500/10 border border-emerald-500/30 text-emerald-300`.

## 6. Admin — Spesifikasi Detail

### 6.1 Layout Admin

```
Grid: [sidebar 240px] [content 1fr], min-h-screen
Sidebar: bg-[var(--card)]/40, border-right, sticky h-screen
Content: px-8 py-8, max-w-[1400px]
```
- Mobile (<1024px): sidebar disembunyikan, digantikan top-bar + drawer; konten px-4.
- Nav item: `h-9 rounded-lg px-3 text-[13.5px]`, aktif `bg-[var(--accent)]/12 text-[var(--accent)]`.

### 6.2 Tabel Resource

```
┌────────────────────────────────────────────────────────────┐
│ Judul    │ Kategori │ Stack │ ★ │ Status │ Aksi           │
├──────────┼──────────┼───────┼───┼────────┼────────────────┤
│ Toko …   │ Web      │ 4     │ ✓ │ Aktif  │ ⋯              │
└────────────────────────────────────────────────────────────┘
```
- `text-[13px]`, header `text-[11.5px] uppercase tracking-wider text-[var(--muted)]`, row border-bottom tipis.
- Row hover: `bg-[var(--border)]/25`.
- Kolom aksi: tombol ikon 28px, menu dropdown klik-luar tertutup.
- <768px: tabel → kartu (grid 2 kolom label/nilai).

### 6.3 Drawer Form (Tambah/Edit)

```
Fixed inset-0, bg-black/50 backdrop-blur-sm
Panel: right, w-full max-w-[560px], bg-[var(--card)], border-l, h-full, overflow-y-auto
Header sticky: judul + tombol ✕
Body: field stack, gap 20px
Footer sticky bottom: Batal (ghost, kiri) + Simpan (primary, kanan)
```
- Mobile: panel jadi bottom sheet `rounded-t-2xl` dengan drag handle.
- Animasi masuk: slide dari kanan 200ms `ease-out`.

### 6.4 Halaman Pengaturan

- Accordion per grup (Identitas, Hero, Tema, Section, Jualan, Social, SEO, Footer).
- Header Accordion: `text-[15px] font-semibold` + chevron yang rotate 180° saat terbuka.
- Field colour: input[type=color] 48×40px + input teks hex di sebelahnya.
- Tombol "Simpan semua": sticky bottom bar `sticky bottom-4` dengan `shadow-lg`, plus tombol identik di header.

### 6.5 Toast / Alert

```tsx
// sukses
"rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300"
// gagal
"rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
```
- `role="status"` (sukses) / `role="alert"` (gagal).
- Muncul di atas form, auto-hide 5 detik untuk sukses.

## 7. Motion & Micro-interaction

| Interaksi | Properti | Durasi |
|---|---|---|
| Hover tombol | opacity / background-color | 150ms ease |
| Hover card | border-color + translateY(-2px) | 200ms ease |
| Cover zoom | `scale(1.03)` | 500ms ease |
| Drawer masuk | translateX(100%) → 0 | 200ms ease-out |
| Menu dropdown | opacity + translateY(-4px) | 150ms ease |
| Toast | opacity + translateY(8px) | 200ms ease |
| Skeleton shimmer | background-position | 1.4s linear infinite |

**Aksesibilitas motion:** `@media (prefers-reduced-motion: reduce)` → semua transisi & animasi dinonaktifkan (`transition: none; animation: none;`).

## 8. Breakpoint

| Breakpoint | Tailwind | Perubahan layout |
|---|---|---|
| Mobile | < 640px | 1 kolom, tombol full-width pada form & CTA row |
| Tablet | 640–1023px | Grid project 2 kolom, sidebar admin jadi drawer |
| Desktop | ≥ 1024px | Grid project 3 kolom, sidebar admin tampil, hero 2 kolom |
| Wide | ≥ 1280px | Container 1200px dengan margin otomatis |

## 9. Checklist Implementasi Visual

- [ ] Semua warna berasal dari CSS variable, tidak ada hex hardcoded di komponen.
- [ ] Font Geist terpasang via `next/font` (nol layout shift).
- [ ] Semua target interaktif ≥ 40px tinggi di desktop, ≥ 44px di mobile.
- [ ] Fokus terlihat (`:focus-visible` ring accent) di seluruh elemen interaktif.
- [ ] `prefers-reduced-motion` dihormati.
- [ ] Gambar memakai `next/image` dengan `sizes` yang benar.
- [ ] Placeholder cover tersedia untuk project tanpa gambar.
