# Design System: Website Portofolio Pribadi & CMS Semi-Custom

| Atribut | Nilai |
| --- | --- |
| Produk | Website portofolio pribadi + CMS semi-custom |
| Versi dokumen | 1.0 |
| Status | Draft untuk review (Fase 0: Discovery) |
| Tanggal | 4 November 2026 |
| Owner | Developer independen (Indonesia), 1 orang |
| Aesthetic | Vercel × Linear: clean, lots of whitespace, subtle borders, grid background halus, satu accent color |
| Implementasi | Tailwind CSS v4 (CSS-first, `@theme`), Next.js 15 App Router, `next/font` Geist |
| Sumber token | `src/app/globals.css` (sudah terimplementasi) · `src/lib/utils.ts` · `db/seed.sql` |
| Dokumen terkait | `PROJECT/03-DESIGN/user-flow.md` · `PROJECT/03-DESIGN/wireframes/README.md` |

---

## 1. Prinsip Desain

Sistem ini dibangun di atas empat prinsip. Setiap keputusan token di bawah dapat ditelusuri kembali ke salah satu prinsip ini.

### 1.1 Dark-mode-first, bukan dark-mode-tambahan

Tema gelap adalah **tema asli**. Tema terang adalah adaptasi, bukan kebalikan. Konsekuensinya:

- Canonical component styling ditulis untuk surface gelap (`#09090b`).
- Border gelap tidak pernah "hitam di atas hitam": selalu ada luminance step minimal 1 tingkat.
- Prioritas kontras: teks utama ≥ 7:1 (AAA), teks sekunder ≥ 4.5:1 (AA), border non-tekst ≥ 3:1.
- Light mode bukan sekadar `invert()`; surface, border, dan shadow punya token sendiri.

### 1.2 Satu accent color, dipakai hemat

Default: **Indigo `#6366f1`** (accent) + **Cyan `#22d3ee`** (secondary).

Aturan}:
- Accent hanya untuk: CTA utama, link aktif, link di dalam teks, focus ring, indikator "featured", gradient aksen.
- Accent **tidak** untuk: border semua card, heading, ikon dekoratif, background halaman.
- Jika owner mengubah accent lewat admin (`settings.theme.accent`), seluruh komponen mengikuti karena semuanya memakai CSS variable: tidak ada class hardcoded warna.
- Accent-2 (`#22d3ee`) hanya untuk: gradient aksen, sparkline/glow, highlight sekunder pada pricing "popular". Tidak pernah sebagai warna teks body.

### 1.3 Whitespace sebagai alat, bukan sisa

- Base spacing 4px; ritme utama 8 / 16 / 24 / 32 / 48 / 64 / 96.
- Section homepage dipisahkan `py-20 md:py-32` (80px / 128px). Ini bagian terbesar dari whitespace.
- Di dalam card, padding 16–24px. Di dalam chip/badge, 8–12px.
- **Tidak ada** nilai spacing yang bukan kelipatan 4. Pengecualian: 1px hairline border, 2px ring, 3px bullet indent.

### 1.4 Border tipis sebagai pemisah utama

- Border default: 1px solid, warna `var(--border)`.
- Tidak ada `border-2` di halaman publik. Stub 2px hanya untuk state aktif pada elemen pilihan (tab aktif, input focused).
- Radius mengikuti skala token (§6). Default card: 14px (`--radius-base`), mengikuti setting `theme.radius` (`soft` 14px / `sharp` 4px / `round` 22px).

### 1.5 Grid background sebagai tekstur, bukan dekorasi

`.bg-grid` + `.bg-grid-mask` sudah ada di `globals.css`:
- Garis 1px `var(--grid-line)` = `rgba(255,255,255,0.045)` dark / `rgba(0,0,0,0.045)` light.
- Ukuran sel 56px.
- Mask radial elliptical `80% 60% at 50% 0%` → grid memudar ke bawah, jadi hero terasa "berudara" dan konten di bawah tetap bersih.
- Hanya dipakai di: hero, section CTA, footer. Tidak di list/tabel admin (admin fokus pada kerapatan data).

---

## 2. Fondasi Warna

### 2.1 Token inti (implementasi saat ini)

Token berikut **sudah ada** di `src/app/globals.css` dan menjadi sumber kebenaran.

| Token CSS | Nilai dark | Nilai light | Peran |
| --- | --- | --- | --- |
| `--bg` | `#09090b` | `#ffffff` | Background halaman |
| `--card` | `#111113` | `#ffffff` | Background card / panel |
| `--fg` | `#fafafa` | `#09090b` | Teks utama |
| `--muted` | `#a1a1aa` | `#52525b` | Teks sekunder, metadata, caption |
| `--border` | `#27272a` | `#e4e4e7` | Border, divider, outline input |
| `--accent` | `#6366f1` | `#6366f1` | CTA utama, link, active state |
| `--accent-2` | `#22d3ee` | `#22d3ee` | Gradient aksen, highlight sekunder |
| `--grid-line` | `rgba(255,255,255,0.045)` | `rgba(0,0,0,0.045)` | Garis grid dekoratif |
| `--radius-base` | `14px` (soft) | `14px` (soft) | Radius card & container |

> **Catatan implementasi:** `layout.tsx` sudah meng-override `--accent`, `--accent-2`, `--radius-base` via inline style pada `<html>` berdasarkan `settings.theme`. Artinya admin bisa mengubah accent **tanpa menyentuh CSS**. Light mode bergeser lewat `:root[data-theme="light"]`, bukan class.

### 2.2 Skala netral (expanded)

`globals.css` memakai beberapa token netral. Untuk komponen yang butuh level lebih halus (hover, subtle surface), gunakan skala berikut yang konsisten dengan zinc.

**Dark**

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `bg` | `#09090b` | Halaman |
| `card` | `#111113` | Card, panel, dropdown |
| `elevated` | `#18181b` | Popover, hover card, dropdown menu |
| `border` | `#27272a` | Border default, divider |
| `border-strong` | `#3f3f46` | Border pada elemen aktif/hover, table header |
| `muted` | `#a1a1aa` | Teks sekunder |
| `fg-subtle` | `#d4d4d8` | Teks quasi-sekunder |
| `fg` | `#fafafa` | Teks utama |

**Light**

| Token | Hex | Pemakaian |
| --- | --- | --- |
| `bg` | `#ffffff` | Halaman |
| `card` | `#ffffff` | Card |
| `elevated` | `#f4f4f5` | Popover, hover |
| `border` | `#e4e4e7` | Border default |
| `border-strong` | `#d4d4d8` | Border aktif/hover |
| `muted` | `#52525b` | Teks sekunder |
| `fg-subtle` | `#3f3f46` | Teks quasi-sekunder |
| `fg` | `#09090b` | Teks utama |

Dark mode memakai surface **berlapis** (bg → card → elevated), light mode memakai surface **berwarna** (putih → abu sangat muda). Ini bukan pilihan kosong: di light mode, card putih di atas bg putih perlu assistance dari border dan shadow, sedangkan di dark mode card yang lebih terang dari bg sudah terbaca tanpa shadow.

### 2.3 Accent scale

Owner dapat memilih accent bebas dari color picker. Karena itu, komponen **tidak boleh** memakai hex accent langsung. Gunakan `color-mix()` untuk menghasilkan state turunan.

| State | Light mode | Dark mode | Implementasi |
| --- | --- | --- | --- |
| Solid | accent | accent | `bg-[var(--accent)] text-white` |
| Solid hover | accent +8% lightness | accent +8% lightness | `hover:brightness-110` |
| Text on light surface | accent-700 | accent-400 | `text-[var(--accent)]` + opacity |
| Subtle surface | accent 12% | accent 14% | `color-mix(in oklab, var(--accent) 14%, transparent)` |
| Border | accent 30% | accent 28% | `color-mix(in oklab, var(--accent) 28%, transparent)` |
| Ring / focus | accent 45% | accent 50% | `color-mix(in oklab, var(--accent) 50%, transparent)` |
| Gradient | accent → accent-2 | accent → accent-2 | `.accent-gradient` |

Preset accent yang disediakan di admin (berdasarkan seed `#6366f1`):

| Preset | Hex | Nama |
| --- | --- | --- |
| Indigo | `#6366f1` | Default |
| Violet | `#8b5cf6` | Ungu |
| Cyan | `#06b6d4` | Biru laut |
| Emerald | `#10b981` | Hijau |
| Amber | `#f59e0b` | Kuning hangat |
| Rose | `#f43f5e` | Merah muda |
| Zinc | `#71717a` | Netral |

### 2.4 Warna status

Warna status hanya boleh muncul sebagai **badge kecil**, **ikon**, atau **border tipis**: tidak pernah sebagai background besar.

| Status | Dark | Light | Pemakaian |
| --- | --- | --- | --- |
| Sukses / Published | `#22c55e` | `#16a34a` | Badge "Live", toast sukses |
| Warning | `#f59e0b` | `#d97706` | Toast warning, badge "Popular" |
| Danger / Error | `#ef4444` | `#dc2626` | Toast error, badge "Archived", field error |
| Info / New | `#3b82f6` | `#2563eb` | Badge "Baru", info toast |
| Draft / Netral | `#a1a1aa` | `#71717a` | Badge "Draft", badge "Belum dibaca" |

Semua warna status dark-mode harus dipakai dengan background transparan + border, bukan solid fill. Contoh badge sukses:
`border border-emerald-500/30 bg-emerald-500/10 text-emerald-400`

### 2.5 Aturan kontras

| Kombinasi | Rasio dark | Rasio light | Verdict |
| --- | --- | --- | --- |
| `#fafafa` on `#09090b` | 18.4:1 |: | AAA ✓ |
| `#a1a1aa` on `#09090b` | 7.6:1 |: | AAA ✓ |
| `#fafafa` on `#111113` | 17.2:1 |: | AAA ✓ |
| `#a1a1aa` on `#111113` | 7.1:1 |: | AAA ✓ |
| `#09090b` on `#ffffff` |: | 19.3:1 | AAA ✓ |
| `#52525b` on `#ffffff` |: | 7.5:1 | AAA ✓ |
| `#6366f1` on `#09090b` | 4.6:1 |: | AA ✓ (large text AA) |
| `#ffffff` on `#6366f1` | 4.6:1 | 4.6:1 | AA ✓ |
| `#e4e4e7` on `#ffffff` |: | 1.3:1 | ✗ non-text, jangan dipakai |
| `#27272a` on `#09090b` | 1.4:1 |: | ✗ non-text, jangan dipakai |

> **Aturan**: `#27272a` (dark) dan `#e4e4e7` (light) **hanya boleh** sebagai border/divider, tidak pernah menjadi tempat bagi teks. Border dekoratif tidak wajib mencapai 3:1; border yang merupakan satu-satunya pembawa makna (mis. checkbox, toggle off, input field) **wajib** ≥ 3:1: untuk itu gunakan `--border-strong` atau warna accent.

---

## 3. Tipografi

### 3.1 Font

| Peran | Font | Fallback | Sumber |
| --- | --- | --- | --- |
| Sans (UI & body) | **Geist Sans** | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | `next/font/google`, variable `--font-geist-sans` |
| Mono (kode, slug, label teknis) | **Geist Mono** | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | `next/font/google`, variable `--font-geist-mono` |

Owner dapat mengganti font lewat `settings.theme.font`. Pilihan yang disediakan:

| Opsi | Nama | Catatan |
| --- | --- | --- |
| Geist | Geist Sans | Default, tampilan paling "developer tool" |
| Inter | Inter | Agak lebih netral & umum |
| System | System UI | Tanpa request font eksternal, paling cepat |

**Aturan mono**: mono hanya dipakai untuk (a) blok kode di artikel, (b) slug/URL di form admin, (c) label teknis kecil (mis. `ID`, `IDR`, `SEO`). Tidak untuk body text.

### 3.2 Skala tipografi

Semua ukuran memakai rem agar konsisten dengan setting zoom browser. `font-size` Tailwind v4 default = `1rem` = 16px.

| Token | Class | Size | Weight | Line-height | Letter-spacing | Tracking |
| --- | --- | --- | --- | --- | --- | --- |
| Display | `text-5xl md:text-6xl` | 48 / 60px | 600 | 1.05 | `-0.03em` | Hero headline |
| H1 | `text-3xl md:text-4xl` | 30 / 36px | 600 | 1.15 | `-0.02em` | Judul halaman |
| H2 | `text-2xl md:text-3xl` | 24 / 30px | 600 | 1.2 | `-0.02em` | Judul section |
| H3 | `text-xl` | 20px | 600 | 1.3 | `-0.015em` | Judul card |
| Body L | `text-lg` | 18px | 400 | 1.7 | `-0.01em` | Lead / deskripsi section |
| Body | `text-base` | 16px | 400 | 1.7 | `-0.005em` | Body utama |
| Body S | `text-sm` | 14px | 400 | 1.6 |: | Copy sekunder, deskripsi card |
| Caption | `text-xs` | 12px | 500 | 1.5 | `0.01em` | Metadata, label form |
| Overline | `text-xs uppercase` | 12px | 600 | 1.4 | `0.08em` | Label seksi, "01 / PROJECTS" |
| Mono | `font-mono text-sm` | 14px | 400 | 1.6 |: | Kode, slug |
| Price | `text-4xl` | 36px | 600 | 1.1 | `-0.02em` | Harga paket |
| Metric | `text-3xl` | 30px | 600 | 1.1 | `-0.02em` | Angka dashboard |

### 3.3 Aturan tipografi

1. **Tiga bobot saja**: 400 (baca), 500 (UI/interaktif), 600 (judul/tekanan). Tidak ada 700 di halaman publik: `font-bold` hanya untuk badge "Paling Populer" di admin.
2. **Tracking negatif di ukuran besar**: Geist became lebih rapat di display. `-0.03em` untuk display, `-0.02em` untuk H1/H2. Ukuran ≤ 14px memakai tracking normal.
3. **Jumlah baris dibatasi**: Hero headline maksimal 3 baris (`line-clamp-3`), card title 2 baris (`line-clamp-2`), excerpt 3 baris (`line-clamp-3`).
4. **Ukuran minimum teks**: 12px. Tidak ada teks di bawah 12px di halaman publik. Di admin, 12px untuk label form, 11px hanya untuk badge status.
5. **Panjang baris**: body article maks 68 karakter (`max-w-[68ch]`), prose article `max-w-3xl`.
6. **Teks angka** memakai `tabular-nums` (`font-variant-numeric: tabular-nums`) di tabel admin, harga, dan angka dashboard agar sejajar.

### 3.4 Prose (isi artikel)

`.prose-custom` di `globals.css` sudah mendefinisikan gaya markdown artikel:

| Elemen | Token |
| --- | --- |
| Warna teks | `color-mix(in oklab, var(--fg) 82%, var(--muted))` |
| Line-height | 1.75 |
| `h2` | 1.5rem / 600 / `letter-spacing -0.02em` / `margin-top 2.5rem` |
| `h3` | 1.2rem / 600 / `margin-top 2rem` |
| `p` | `margin-bottom 1.1rem` |
| `a` | warna accent + `underline` + `underline-offset 3px` |
| `ul` / `ol` | padding-left 1.4rem |
| `code` | bg `border/70`, radius 5px, font mono, 0.875em |
| `pre` | bg `border/55` + `bg/`, radius 12px, padding `1rem 1.15rem`, overflow-x auto |
| `blockquote` | border-left 3px accent, padding-left 1rem, warna muted |
| `table` | border 1px `var(--border)`, header bg `border/40` |
| `hr` | border color `var(--border)`, margin 2rem |

Semua elemen prose **harus** tetap terbaca di kedua tema. Jangan menambahkan warna hardcoded.

---

## 4. Spasi & Layout

### 4.1 Skala spacing

Base 4px. Hanya nilai berikut yang boleh dipakai:

| Token | Nilai | Padding | Gap | Ukuran |
| --- | --- | --- | --- | --- |
| `space-1` | 4px |: |: | Icon ke teks |
| `space-2` | 8px |: | `gap-2` | Badge group |
| `space-3` | 12px | `p-3` | `gap-3` | Chip, tag input |
| `space-4` | 16px | `p-4` | `gap-4` | Card kecil, form field |
| `space-5` | 20px | `p-5` | `gap-5` | Card standar |
| `space-6` | 24px | `p-6` | `gap-6` | Card besar, section mobile |
| `space-8` | 32px | `p-8` | `gap-8` | Section desktop |
| `space-10` | 40px |: |: | Block besar |
| `space-12` | 48px | `p-12` |: | Form panel |
| `space-16` | 64px |: |: | Section gap |
| `space-20` | 80px | `py-20` |: | Section py mobile |
| `space-24` | 96px | `py-24` |: | Section py tablet |
| `space-32` | 128px | `py-32` |: | Section py desktop |

### 4.2 Container & grid

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| Container standar | `max-w-6xl` (72rem / 1152px) | Halaman konten umum |
| Container lebar | `max-w-7xl` (80rem / 1280px) | Homepage, halaman dengan grid lebar |
| Container baca | `max-w-3xl` (48rem / 768px) | Isi artikel |
| Container form | `max-w-xl` (36rem / 576px) | Form kontak, login |
| Gutter | `px-4 md:px-6 lg:px-8` | Sisi kiri-kanan container |

**Grid 12 kolom**: pola yang dipakai:

| Pola | Tailwind | Pemakaian |
| --- | --- | --- |
| Grid project | `grid gap-6 md:grid-cols-2 lg:grid-cols-3` | Homepage featured projects |
| Grid paket harga | `grid gap-6 lg:grid-cols-3` | `/services` |
| Grid testimonial | `grid gap-6 md:grid-cols-2 lg:grid-cols-3` | Homepage |
| Split 7/5 | `grid lg:grid-cols-12` → `lg:col-span-7` + `lg:col-span-5` | Detail project: konten + sidebar meta |
| Split 8/4 | `lg:col-span-8` + `lg:col-span-4` | Article: konten + TOC |
| Admin split | `grid lg:grid-cols-[260px_1fr]` | Sidebar + konten |

### 4.3 Breakpoint

| Prefix | Min width | Perubahan layout |
| --- | --- | --- |
| (base) | 0px | 1 kolom, nav mobile (hamburger), container `px-4` |
| `sm` | 640px | 2 kolom untuk grid kecil, container `px-6` |
| `md` | 768px | Nav desktop penuh, section py-24, grid 2 kolom |
| `lg` | 1024px | Grid 3 kolom, sidebar admin tampil, container `px-8` |
| `xl` | 1280px | Sidebar admin tetap, konten max-w-6xl aktif penuh |
| `2xl` | 1536px | Sidebar admin tetap, konten max-w-7xl aktif penuh |

**Minimum 320px**: tidak boleh ada horizontal scroll dari 320px sampai 1920px.

### 4.4 Breakpoint admin

Admin behaviorobile-friendly, tetapi **desktop-first**:

| Viewport | Sidebar | Konten |
| --- | --- | --- |
| < 1024px | Hidden, diganti top bar + drawer | Full width, padding 16px |
| ≥ 1024px | Fixed 260px, sticky, scroll sendiri | `max-w-5xl`, padding 32px |

Tabel admin pada < 768px: ubah menjadi **kartu** (stacked card per baris), bukan horizontal scroll. Ini wajib: horizontal scroll tabel di ponsel adalah pola yang paling sering dipakai buruk.

---

## 5. Tema & Mode

### 5.1 Cara kerja dark/light

```
settings.theme.mode  ──►  <html data-theme="dark" | "light">
                              │
                              ├─► :root                 → --bg #09090b, --fg #fafafa, --border #27272a
                              └─► :root[data-theme=light] → --bg #ffffff, --fg #09090b, --border #e4e4e7
```

Aturan implementasi:
- Tema **tidak** disimpan per-visitor di server. Yang di-cache adalah hasil render untuk tema yang sedang aktif. Untuk production, gunakan ISR dengan `revalidatePath` setiap kali `settings.theme` berubah.
- Pilihan manual visitor (jika toggle client-side disediakan) disimpan di `localStorage` dan di-override via inline script sebelum paint → **tanpa flash of wrong theme**.
- `prefers-color-scheme` dihormati sebagai default awal bila owner belum menentukan mode.
- `suppressHydrationWarning` pada `<html>` (sudah ada di `layout.tsx`) wajib dipakai karena `data-theme` berbeda antara server dan client.

### 5.2 Checklist switching tema

| Item | Dark | Light |
| --- | --- | --- |
| Background halaman | `#09090b` | `#ffffff` |
| Card | `#111113` + border `#27272a` | `#ffffff` + border `#e4e4e7` + shadow xs |
| Input | bg `#111113`, border `#27272a`, text `#fafafa` | bg `#ffffff`, border `#e4e4e7`, text `#09090b` |
| Input placeholder | `#71717a` | `#a1a1aa` |
| Teks sekunder | `#a1a1aa` | `#52525b` |
| Code block | `color-mix(border 55%, bg)` | `color-mix(border 55%, bg)`: sudah adaptif |
| Grid line | `rgba(255,255,255,0.045)` | `rgba(0,0,0,0.045)` |
| Shadow | minimal (hampir tak terlihat di gelap) | `0 1px 2px rgba(0,0,0,0.05)` |
| Scrollbar thumb | `border/90` | `border/90` |

### 5.3 Radius dinamis

`settings.theme.radius` rewritten di `layout.tsx`:

| Nilai | `--radius-base` | Tampak |
| --- | --- | --- |
| `soft` (default) | `14px` | Card-,modern, friendly |
| `sharp` | `4px` | Technical, dense, brutalis |
| `round` | `22px` | Friendly, playful |

Semua komponen yang memakai radius variabel harus merujuk `var(--radius-base)`: **jangan** hardcode `rounded-xl` di komponen yang ikut berubah. Komponen kecil (button, input, badge) boleh punya radius tetap yang lebih kecil dari `--radius-base` (lihat §6).

---

## 6. Radius

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `radius-xs` | 4px | Tag inline, kode inline |
| `radius-sm` | 6px | Badge, chip, small button |
| `radius-md` | 8px | Input, select, textarea, small card |
| `radius-lg` | 12px | Card media, pre block, popover |
| `radius-card` | `var(--radius-base)` (14px default) | Card, panel, section container |
| `radius-xl` | 16px | Featured card, modal |
| `radius-pill` | 9999px | Badge status, filter chip, avatar |
| `radius-full` | 50% | Avatar, dot status, icon button bulat |

---

## 7. Shadow & Elevasi

| Token | Nilai | Pemakaian |
| --- | --- | --- |
| `shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Card di light mode, dropdown |
| `shadow-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Hover card, popover |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Modal, dialog |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Toast |
| `shadow-accent` | `0 0 0 1px accent/22%, 0 18px 60px -20px accent/45%` | `.glow`: CTA accent, featured card |

**Prinsip elevasi (mengikuti Linear):** di permukaan gelap, drop shadow hampir tak terlihat. Elevasi ditentukan oleh **langkah luminansi** (bg → card → elevated), bukan olehINTS shadow. Shadow hanya dipakai untuk elemen yang benar-benar mengambang di atas permukaan (dropdown, modal, toast, sticky header).

---

## 8. Komponen

Semua komponen memakai utility class Tailwind v4 + `cn()` dari `src/lib/utils.ts` untuk merge class.

### 8.1 Button

| Variant | Light | Dark | Class (canonical) |
| --- | --- | --- | --- |
| **Primary** | accent bg | accent bg | `bg-[var(--accent)] text-white hover:brightness-110` |
| **Secondary** | card bg + border | card bg + border | `bg-[var(--card)] border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--elevated)]` |
| **Outline** | transparent + border | transparent + border | `bg-transparent border border-[var(--border)] text-[var(--fg)] hover:bg-white/5 dark:hover:bg-white/5` |
| **Ghost** | transparent | transparent | `bg-transparent text-[var(--muted)] hover:text-[var(--fg)] hover:bg-white/5` |
| **Danger** | red | red | `bg-red-600 text-white hover:bg-red-700` |

| Size | Height | Padding | Font | Radius |
| --- | --- | --- | --- | --- |
| `sm` | 32px | `px-3` | 13px / 500 | 6px |
| `md` (default) | 40px | `px-4` | 14px / 500 | 8px |
| `lg` | 48px | `px-6` | 15px / 500 | 10px |

Aturan:
- Minimal tinggi 40px (32px hanya untuk toolbar admin). Target sentuh mobile ≥ 44px → gunakan `lg` di mobile bila di dalam area tap utama.
- Semua button punya `focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]`.
- State `disabled`: `opacity-50 pointer-events-none`.
- State `loading`: spinner `size-4 animate-spin` + label tetap (jangan hanya spinner) agar konteks jelas.
- Button dengan `aria-label` wajib bila icon-only (target ≥ 32×32px, radius `rounded-md`).

### 8.2 Card

```
Class: rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-6
       transition-colors hover:border-[var(--border-strong)]
```

| Varian | Tambahan |
| --- | --- |
| Default | seperti di atas |
| Interactive | `cursor-pointer` + `hover:border-[var(--border-strong)]` + `focus-visible:ring-2` |
| Featured | `border-[var(--accent)]/40` + `shadow-accent` (pakai `.glow`) |
| Flat | tanpa border, `bg-white/5` (dark) / `bg-zinc-50` (light) |
| Media | `p-0`, overflow hidden, `rounded-t-[var(--radius-base)]` |

### 8.3 Badge

```
Class: inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium
```

| Varian | Class |
| --- | --- |
| Neutral | `border-[var(--border)] bg-white/5 text-[var(--muted)]` |
| Accent | `border-accent/30 bg-accent/10 text-[var(--accent)]` |
| Success | `border-emerald-500/30 bg-emerald-500/10 text-emerald-400` |
| Warning | `border-amber-500/30 bg-amber-500/10 text-amber-400` |
| Danger | `border-red-500/30 bg-red-500/10 text-red-400` |
| Info | `border-blue-500/30 bg-blue-500/10 text-blue-400` |

Badge **"Paling Populer"** pada kartu paket: variant Accent + ikon `Sparkles` size 12 + `font-semibold`.

### 8.4 Input / Textarea / Select

```
Class: w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2
       text-sm text-[var(--fg)] placeholder:text-[var(--muted)]
       focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25
       disabled:opacity-50
```

| Property | Nilai |
| --- | --- |
| Height (input/select) | 40px (`h-10`) |
| Height (textarea) | min 96px, `resize-y` |
| Font | 14px |
| Radius | 8px |
| Border default | 1px `var(--border)` |
| Border focus | 1px `var(--accent)` + ring 2px accent/25 |
| Border error | 1px `#ef4444` + `ring-2 ring-red-500/20` |
| Label | `text-xs font-medium text-[var(--muted)] mb-1.5` |
| Helper text | `text-xs text-[var(--muted)] mt-1.5` |
| Error text | `text-xs text-red-400 mt-1.5` + ikon `CircleAlert` size 12 |

Aturan form:
- `<label>` selalu ada dan terhubung via `htmlFor`/`id`. Placeholder **tidak** menggantikan label.
- Grup field: `space-y-4` atau `grid gap-4 md:grid-cols-2`.
- Field wajib ditandai `*` dengan `aria-hidden="true"` + `aria-required` di input (bukan hanya warna).
- Error muncul di bawah field dan field terkait diberi `aria-invalid="true"` + `aria-describedby`.

### 8.5 Switch / Toggle

```
Track: relative h-6 w-11 rounded-full transition-colors
       bg-[var(--border-strong)]  → checked: bg-[var(--accent)]
Thumb: absolute h-5 w-5 rounded-full bg-white top-0.5 left-0.5 transition-transform
       checked: translate-x-5
```

- Berbasis `<button role="switch" aria-checked>` (bukan checkbox tersembunyi) agar mudah diakses.
- Label selalu di sebelah kiri (desktop) atau di atas (mobile), target sentuh ≥ 44px termasuk area track.
- Deskripsi singkat di bawah toggle untuk menjelaskan efek (mis. "Sembunyikan section Pricing di beranda").
- Di admin, toggle **berdampak besar** (theme, section) sebaiknya punya **preview** di samping, bukan hanya label.

### 8.6 Tabs

```
Tab list: flex gap-1 border-b border-[var(--border)]
Tab item: px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] border-b-2 border-transparent
          → active: border-[var(--accent)] text-[var(--fg)]
```

- Aktif ditandai oleh **underline 2px accent** (bukan hanya perubahan warna): wajib, dan tetap sertakan perubahan warna.
- Panah kiri/kanan memindahkan fokus antar tab (WAI-ARIA Authoring Practices).
- Di mobile, tabs berupa horizontal scroll dengan `scrollbar-hide`, bukan wrapping.

### 8.7 Toast

```
Container: fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm
Item: flex items-start gap-3 rounded-lg border bg-[var(--elevated)] p-4 shadow-lg
      + ikon (size 16) + teks (text-sm) + tombol close (size 16)
```

| Variant | Border | Ikon | Warna ikon |
| --- | --- | --- | --- |
| Success | `border-emerald-500/30` | `CheckCircle2` | emerald-400 |
| Error | `border-red-500/30` | `CircleAlert` | red-400 |
| Warning | `border-amber-500/30` | `TriangleAlert` | amber-400 |
| Info | `border-blue-500/30` | `Info` | blue-400 |

Aturan:
- Auto-dismiss 4 detik (success/info), 6 detik (error/warning, atau error tidak auto-dismiss bila berisi aksi).
- `role="status"` + `aria-live="polite"` untuk success/info; `role="alert"` untuk error.
- Maksimal 3 toast_stack; toast keempat menggeser yang lama.
- Aksi "Buka" (mis. "Lihat pesan") Opsional, berupa `<button>` di dalam toast.

### 8.8 Modal / Dialog

```
Backdrop: fixed inset-0 bg-black/60 backdrop-blur-sm z-50
Dialog:   fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-[calc(100%-2rem)] max-w-lg rounded-xl border border-[var(--border)]
          bg-[var(--card)] p-6 shadow-md
```

| Ukuran | `max-w` | Pemakaian |
| --- | --- | --- |
| `sm` | 384px | Konfirmasi hapus |
| `md` | 512px | Form pendek |
| `lg` | 768px | Editor dengan preview |

Aturan:
- `role="dialog" aria-modal="true" aria-labelledby={titleId}`.
- Focus trap: fokus masuk ke dialog saat dibuka, kembali ke elemen pemicu saat ditutup.
- `Escape` menutup dialog. Klik backdrop menutup **kecuali** dialog yang berisi form dengan isian yang belum disimpan (minta konfirmasi dulu).
- Header (judul + tombol X), body (scrollable `max-h-[70vh] overflow-y-auto`), footer (aksi kanan, `Batal` lalu primary).
- Dialog konfirmasi destructive: tombol utama berwarna **danger**, teks menjelaskan konsekuensi, dan tombol danger tidak melakukan fokus otomatis.

### 8.9 Tabel Admin

```
Wrapper: overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)]
Header:  bg-white/[0.03] px-4 py-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]
         sticky top-0 z-10 backdrop-blur
Row:     border-t border-[var(--border)] px-4 py-3 text-sm
         hover:bg-white/[0.02]
```

| Kolom | Aturan |
| --- | --- |
| Judul/konten | `font-medium text-[var(--fg)]` |
| Meta | `text-xs text-[var(--muted)]` |
| Numerik | `tabular-nums text-right` |
| Aksi | `text-right`, icon button 32px, muncul selalu (bukan hover-only) di mobile |
| Sortable | ikon `ArrowUpDown`/`ArrowUp`/`ArrowDown` 14px di kanan label |

Responsive:
- ≥ 768px: tabel penuh.
- < 768px: setiap baris jadi **kartu** (`rounded-lg border p-4 space-y-2`), label field tampil sebagai `text-xs text-muted`.

### 8.10 Sidebar Admin

```
Sidebar: w-[260px] shrink-0 border-r border-[var(--border)] bg-[var(--card)]
         sticky top-0 h-screen overflow-y-auto
Item:    flex items-center gap-3 rounded-md px-3 py-2 text-sm
         text-[var(--muted)] hover:bg-white/5 hover:text-[var(--fg)]
Active:  bg-[var(--accent)]/10 text-[var(--accent)] font-medium
         + kiri border 2px accent (indikator)
```

Struktur:
1. Logo + nama situs (dari `settings.site.logoText`): link ke `/`.
2. Group "Konten": Projects, Posts, Services, Experience, Skills, Testimonials.
3. Group "Interaksi": Messages (dengan badge jumlah `new`).
4. Group "Situs": Settings.
5. Footer sidebar: nama user + email + tombol logout.

Ikon: `lucide-react` size 16–18, stroke 1.75 (bukan 2: lebih ringan secara visual).

### 8.11 Pagination

```
Wrapper: flex items-center justify-between border-t border-[var(--border)] px-4 py-3
Info:    text-xs text-[var(--muted)] "Menampilkan 1–20 dari 47"
Controls: flex gap-1 + Tombol "Sebelumnya" / "Berikutnya" + nomor halaman
```

- Nomor halaman: `rounded-md size-8 text-sm`; aktif `bg-[var(--accent)] text-white`; nonaktif `text-[var(--muted)]`.
- Maksimal 5 nomor + elipsis `…`.
- Default 20 item/halaman. State page disimpan di URL (`?page=2`).

### 8.12 Empty State

```
Wrapper: flex flex-col items-center justify-center rounded-[var(--radius-base)]
         border border-dashed border-[var(--border)] px-6 py-16 text-center
Icon:   size-10 rounded-full bg-white/5 p-2.5 text-[var(--muted)] mb-4
Title:  text-base font-medium text-[var(--fg)]
Body:   mt-1 text-sm text-[var(--muted)] max-w-sm
Action: mt-5 <Button variant="secondary">
```

Contoh isi empty state:
- Projects: "Belum ada project" → tombol "Tambah Project".
- Messages: "Tidak ada pesan baru" → "Semua pesan sudah ditangani."
- Publik (grid project kosong): "Belum ada project yang dipublikasikan" → CTA "Mulai Diskusi" ke `/contact`.
- Settings: "Seed belum dijalankan" → tombol "Jalankan seed".

### 8.13 Skeleton

```
Base: animate-pulse rounded-[var(--radius-base)] bg-white/[0.04]
      (dark) / bg-zinc-100 (light)
```

| Varian | Bentuk |
| --- | --- |
| Text | `h-4 w-full rounded` (atau `w-3/4`, `w-1/2`) |
| Title | `h-8 w-2/3 rounded-md` |
| Card | `h-64 w-full rounded-[var(--radius-base)]` |
| Avatar | `size-10 rounded-full` |
| Table row | `h-12 w-full rounded-md` |

Skeleton wajib:Nmik sesuai bentuk komponen final (saya). Prinsipnya: layout tidak melompat saat data arrive (CLS ≈ 0). Jangan pernah menampilkan skeleton untuk konten < 300ms (gunakan threshold 150ms agar tidak berkedip).

---

## 9. Pola Halaman Publik

### 9.1 Header

```
Header: sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md
Left:   logo (logoText) + nama
Center: nav links (desktop), hidden < md
Right:  [Availability badge] [Theme toggle] [CTA "Hire Me"]
```

- Height 64px desktop, 56px mobile.
- Active link ditandai `text-[var(--fg)] font-medium` + titik/underline accent subtle.
- `<md`: nav collapse ke hamburger → panel full-width di bawah header (bukan dropdown mungil), dengan link besar (44px target).

### 9.2 Hero

```
Section: relative overflow-hidden + .bg-grid + .bg-grid-mask
         py-24 md:py-32
Content: max-w-3xl mx-auto text-center
Order:   [availability badge] → h1 (display) → p (body-lg, muted) → [CTA primary] [CTA secondary] → [social links row]
```

- H1: `text-5xl md:text-6xl font-semibold tracking-tight` + `.text-gradient` (opsional: gradient subtle dari fg ke accent).
- Subtitle: `text-lg text-[var(--muted)] max-w-xl mx-auto`.
- CTA: primary accent + secondary outline, `gap-3`, wrap di mobile.
- CTA link dapat diatur owner: `heroCtaText` + `heroCtaLink` (default `/projects`), `heroSecondaryText` + `heroSecondaryLink` (default `/contact`).

### 9.3 Section Heading

```
Eyebrow: text-xs uppercase tracking-[0.08em] text-[var(--accent)] "Selected work"
Title:   text-2xl md:text-3xl font-semibold tracking-tight
Desc:    text-[var(--muted)] max-w-2xl
Layout:  text-center mx-auto mb-12 (default) | text-left (variant)
```

### 9.4 Project Card

```
Card: group relative overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)]
      bg-[var(--card)] transition hover:border-[var(--border-strong)]
Media: aspect-[16/10] overflow-hidden bg-gradient (placeholder bila cover kosong)
       → img transition-transform duration-500 group-hover:scale-[1.03]
Body:  p-5
       → title (h3, line-clamp-2) + summary (text-sm muted, line-clamp-3)
Meta:  mt-4 flex items-center gap-2 → [category Badge] [year text-xs muted]
Hover: overlay "Lihat detail" dengan arrow, muncul di pojok kanan atas media
```

### 9.5 Pricing Card

```
Card: relative rounded-[var(--radius-base)] border bg-[var(--card)] p-8
Popular: border-[var(--accent)] + shadow-accent + badge absolut -top-3 "Paling Populer"
Title:   text-lg font-semibold
Desc:    text-sm text-[var(--muted)] min-h-[40px]
Price:   text-4xl font-semibold + label text-xs muted "mulai dari"
Features:mt-6 space-y-3 → item: [Check size 16 accent] [text-sm]
CTA:     mt-8 w-full → <Button variant={popular ? "primary" : "secondary"}>
```

Tinggian kartu harus sama antar paket → gunakan flex column dengan `flex-1` pada area fitur agar CTA rata di bawah.

### 9.6 Timeline (Experience)

```
Item: relative pl-10 pb-10
       → dot: absolute left-0 top-1 size-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent)]/15
       → line: absolute left-[4px] top-4 bottom-0 w-px bg-[var(--border)]
Content: [period text-xs uppercase tracking-wider text-[var(--muted)]] [role text-base font-medium] [company text-sm muted]
```

### 9.7 Skill Bar

```
Row: grid grid-cols-[1fr_auto] items-center gap-3 mb-2
     → name text-sm  → level text-xs tabular-nums text-[var(--muted)]
Bar: h-1.5 rounded-full bg-white/[0.06] overflow-hidden
     → fill: h-full rounded-full bg-[var(--accent)] transition-[width] duration-700
```

Persentase dihitung dari `skills.level` (0–100). Bar thickenedensenyap mengikuti `--accent`, bukan warna per kategori.

### 9.8 Testimonial Card

```
Card: rounded-[var(--radius-base)] border bg-[var(--card)] p-6
Stars: flex gap-0.5 → Star size 14 fill-[var(--accent)] text-[var(--accent)]
Quote: text-sm text-[var(--fg)]/90 leading-relaxed
Author: mt-5 flex items-center gap-3
        → avatar size-9 rounded-full (atau initials) + [name text-sm font-medium] [role, company text-xs muted]
```

### 9.9 Footer

```
Footer: border-t border-[var(--border)] bg-[var(--card)] py-12
Grid:   grid gap-8 md:grid-cols-[2fr_1fr_1fr]
Left:   tagline text-sm muted + social icons row (size 16, gap 3)
Col:    "Navigasi" links / "Sosial" links
Bottom: mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between gap-2
        → copyright text-xs muted + "Dibangun dengan Next.js" text-xs muted
```

Social link kosong **tidak** dirender (tanpa meninggalkan placeholder). Bila semua kosong, baris ikon disembunyikan penuh.

---

## 10. Pola Halaman Admin

### 10.1 Layout admin

```
<div class="grid lg:grid-cols-[260px_1fr] min-h-screen">
  <aside class="hidden lg:flex ...">Sidebar</aside>
  <div class="flex flex-col">
    <header class="sticky top-0 z-30 border-b bg-[var(--bg)]/80 backdrop-blur px-6 h-16">
      <h1 class="text-lg font-semibold">Title halaman</h1> + <div ml-auto>-actions</div>
    </header>
    <main class="flex-1 px-6 py-6 max-w-5xl">...</main>
  </div>
</div>
```

### 10.2 Header halaman admin

- Kiri: judul halaman (`text-lg font-semibold`) + breadcrumb di bawah (`text-xs text-muted`) bila bersarang.
- Kanan: tombol aksi sekunder (Filter, Export) + tombol primary ("Tambah Project").
- Sticky, tinggi 64px, dengan border bawah.

### 10.3 Toolbar list admin

```
Toolbar: flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4
Left:  [Search input w-64] [Filter select] [Status tabs]
Right: [Filter icon button] [Density toggle] [view count text-xs muted]
```

### 10.4 Form admin

```
Layout: max-w-3xl space-y-8
Group:  section dengan heading text-sm font-medium + deskripsi text-xs muted + border-t pt-6
Fields: grid gap-4 md:grid-cols-2 (field lebar → md:col-span-2)
Footer: sticky bottom-0 border-t bg-[var(--bg)]/90 backdrop-blur py-3 px-0
        → flex justify-between: [status hint "Perubahan belum disimpan"] [Batal] [Simpan]
```

- **Sticky action bar** di bawah: owner tidak perlu scroll ke atas untuk menyimpan.
- Tombol simpan: `variant="primary"`, disabled + `isSubmitting` selama request.
- Indikator "Perubahan belum disimpan": `text-xs text-amber-400` dengan titik amber, muncul bila form dirty.

### 10.5 Live preview di Settings

```
Layout: grid lg:grid-cols-[1fr_360px] gap-6
Left:  form tabs
Right: sticky top-20 → panel rounded border overflow-hidden
       → mini preview beranda (skala ~0.35) dengan tema & section yang dipilih
```

Preview memakai state lokal form, **bukan** data server, sehingga respons < 100ms.

---

## 11. Ikon & Gambar

### 11.1 Ikon

- Library: `lucide-react` (sudah jadi dependency).
- Ukuran: 14 (inline badge), 16 (default UI), 18 (nav sidebar), 20 (card), 24+ (empty state / fitur).
- Stroke width default `2`; gunakan `1.75` untuk ikon besar agar lebih halus.
- Ikon tidak pernah berdiri sendiri sebagai aksi tanpa label: button icon-only wajib `aria-label`.
- Ikon dekoratif (panah di card overlay) → `aria-hidden="true"`.

### 11.2 Gambar

| Konteks | Rasio | Loading | Border radius |
| --- | --- | --- | --- |
| Project cover | 16:10 | `priority` (jika di atas fold) | `rounded-t-[var(--radius-base)]` |
| Gallery project | 16:9 | `lazy` | `rounded-lg` |
| Post cover | 16:9 | `priority` | `rounded-t-[var(--radius-base)]` |
| Avatar testimonial | 1:1 | `lazy` | `rounded-full` |
| OG image | 1200×630 |: |: |

Aturan:
- Selalu pakai `next/image` dengan `width`/`height` eksplisit atau `fill` + `sizes` → mencegah CLS.
- `sizes` untuk grid project: `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw`.
- Placeholder saat cover kosong: gradient deterministik dari judul + inisial (`initials()` dari `src/lib/utils.ts`).
- `alt` wajib; alt deskriptif berisi isi informasi, bukan "gambar project".

### 11.3 Placeholder gradient

```
bg-gradient-to-br from-[var(--accent)]/20 via-transparent to-[var(--accent-2)]/20
+ teks inisial 48px font-semibold text-[var(--fg)]/20 di tengah
```

Gradient ini bekerja di kedua tema karena memakai opacity, bukan warna solid.

---

## 12. Motion

| Token | Durasi | Easing | Pemakaian |
| --- | --- | --- | --- |
| `duration-100` | 100ms | `ease-out` | Hover warna, focus ring |
| `duration-200` | 200ms | `ease-out` | Toast masuk, dropdown, tab underline |
| `duration-300` | 300ms | `ease-in-out` | Modal, drawer |
| `duration-500` | 500ms | `ease-out` | Card image zoom, section reveal |
| `duration-700` | 700ms | `ease-out` | Skill bar fill |

Prinsip:
--motion dekoratif (reveal on scroll) hanya boleh subtle: opacity 0→1 + translateY 8px. Jangan stagger banyak elemen (menyusun 12 kartu dengan delay berbeda = lambat & greasy).
- Semua animasi menghormati `prefers-reduced-motion: reduce` (sudah ada di `globals.css`: durasi dipaksa 0.01ms).
- Tidak ada parallax, tidak ada autoplay video loop, tidak ada cursor custom.

---

## 13. Aksesibilitas

### 13.1 Kontras & warna

| Level | Target | Token |
| --- | --- | --- |
| Teks normal | ≥ 4.5:1 (AA) | `--fg` on `--bg`, `--muted` on `--bg` |
| Teks besar (≥ 18.66px bold / 24px) | ≥ 3:1 (AA Large) | Judul besar |
| Non-teks (border bermakna, ikon) | ≥ 3:1 | `--border-strong`, accent |
|-enhanced (AAA) | ≥ 7:1 | Body text utama |

Warna **tidak pernah** menjadi satu-satunya pembawa makna. Badge "Live" selalu punya teks, bukan hanya titik hijau.

### 13.2 Keyboard

- Skip link "Lewati ke konten utama" sudah ada di `layout.tsx` (`sr-only focus:not-sr-only`).
- Semua elemen interaktif dapat difokus dan punya `focus-visible:ring-2` accent.
- Focus tidak pernah dihapus (`outline-none` hanya aman bila ada ring pengganti).
- Modal: focus trap + `Escape` + return focus.
- Tabs: panah kiri/kanan berpindah tab.
- Sidebar admin: bisa dinavigasi penuh dengan keyboard; toggle mobile punya `aria-expanded`.

### 13.3 Semantik

| Elemen | Tag |
| --- | --- |
| Navigasi utama | `<nav aria-label="Navigasi utama">` |
| Konten utama | `<main id="main">` |
| Halaman | satu `<h1>` per halaman |
| Section | `<section aria-labelledby={id}>` |
| Card project | `<article>` |
| Form | `<form>` + `<label for>` + `aria-describedby` |
| Toast | `role="status"` / `role="alert"` + `aria-live` |
| Dialog | `role="dialog" aria-modal="true"` |
| Switch | `role="switch" aria-checked` |
| Progress/skill bar | `role="progressbar" aria-valuenow` |

### 13.4 Target sentuh

Minimum **44×44px** untuk elemen interaktif mobile (tombol utama, link nav, chip filter, toggle). Pada admin dense, minimal **32×32px** dengan padding tambahan agar area sentuh tetap 44px lewat `::after` atau padding.

---

## 14. Content Style Guide

Copy situs ini ditulis untuk **meyakinkan pembaca**, bukan menjelaskan teknologi. copy ini punya pengaruh besar terhadap konversi.

| Aturan | Contoh benar | Contoh salah |
| --- | --- | --- |
| Uses hasil, bukan proses | "Traffic naik 2x setelah launch" | "Saya mengimplementasikan caching Redis" |
| benefits di atas features | "Revisi sampai Andapuas" | "Fitur: unlimited revision" |
| Angka konkret | "Balas dalam 1×24 jam" | "Respon cepat" |
| Bahasa lugas | "Punya ide project?" | "Leverage synergies" |
| Bahasa Indonesia, "Anda" konsisten | "Ceritakan kebutuhan Anda" | "Ceritakan kebutuhan kamu" |
| Tidak menyanjung diri sendiri | "Tim internal langsung bisa kelola sendiri" | "Saya developer terbaik di Jakarta" |

Aturan headline hero: **maks 12 kata**, berisi hasil atau ketersediaan, bukan deskripsi Jabatan.

---

## 15. Checklist Implementasi

### 15.1 Review halaman publik

- [ ] Tidak ada warna hex hardcoded di komponen: semuanya lewat `var(--token)`.
- [ ] Semua section toggle benar-benar conditionally render, bukan `display:none`.
- [ ] Tombol ikon-only punya `aria-label`.
- [ ] Heading hierarchy benar (satu `h1`, lalu `h2` per section).
- [ ] Kontras teks lolos AA; teks utama hampir AAA.
- [ ] CTA selalu punya tujuan valid.
- [ ] Gambar punya `alt` + dimensi eksplisit (CLS 0).
- [ ] Dark & light mode keduanya sudah dilihat.
- [ ] 320px tidak ada horizontal scroll.
- [ ] Keyboard: tab order logis, focus ring terlihat.

### 15.2 Review halaman admin

- [ ] Form punya label (bukan hanya placeholder).
- [ ] Aksi destructive punya confirm dialog.
- [ ] Tombol simpan disabled saat request berjalan.
- [ ] Form yang dirty memberi indikator.
- [ ] List punya empty state, bukan tabel kosong.
- [ ] Tabel responsif (kartu di < 768px).
- [ ] Pagination state ada di URL.
- [ ] Role `editor` tidak bisa mencapai `/admin/settings`.
- [ ] Tidak ada halaman yang menampilkan `password_hash` atau stack trace.

### 15.3 Review global

- [ ] `prefers-reduced-motion` dihormati.
- [ ] `prefers-color-scheme` dihormati sebagai default.
- [ ] Tidak ada `outline: none` tanpa ring pengganti.
- [ ] Bundle JS client-side seminimal mungkin (RSC by default).
- [ ] Tidak ada komponen yang hanya berfungsi setelah hydration (CTA harus `<a>`).

---

## 16. Referensi Cepat

### 16.1 Token cepat

```css
/* Warna */
--bg: #09090b        /* dark */  --bg: #ffffff       /* light */
--card: #111113                  --card: #ffffff
--fg: #fafafa                    --fg: #09090b
--muted: #a1a1aa                 --muted: #52525b
--border: #27272a                --border: #e4e4e7
--accent: #6366f1                --accent: #6366f1
--accent-2: #22d3ee              --accent-2: #22d3ee

/* Radius */
--radius-base: 14px              /* soft | sharp 4px | round 22px */
--radius-card: 14px

/* Font */
--font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, ...
--font-mono: var(--font-geist-mono), ui-monospace, ...
```

### 16.2 Class utilitas kustom (dari `globals.css`)

| Class | Fungsi |
| --- | --- |
| `.bg-grid` | Grid background 56px |
| `.bg-grid-mask` | Mask radial untuk memudarkan grid |
| `.text-gradient` | Gradien teks fg → accent |
| `.accent-gradient` | Gradien accent → accent-2 |
| `.glow` | Ring accent + shadow accent |
| `.card` | bg card + border + radius base |
| `.hairline` | Border bawah 1px |
| `.prose-custom` | Style markdown artikel |

### 16.3 Komponen utama → file yang perlu dibuat

| Komponen | Lokasi file | Catatan |
| --- | --- | --- |
| `SiteHeader` | `src/components/site-header.tsx` | Sudah di-import `layout.tsx` |
| `SiteFooter` | `src/components/site-footer.tsx` | Sudah di-import `layout.tsx` |
| `Button` | `src/components/ui/button.tsx` | 4 variant |
| `Card` | `src/components/ui/card.tsx` | |
| `Badge` | `src/components/ui/badge.tsx` | |
| `Input` / `Textarea` / `Select` | `src/components/ui/input.tsx` | `label` opsional |
| `Switch` | `src/components/ui/switch.tsx` | `role="switch"` |
| `Tabs` | `src/components/ui/tabs.tsx` | |
| `Toast` | `src/components/ui/toast.tsx` | Provider + `useToast()` |
| `Modal` | `src/components/ui/modal.tsx` | Focus trap |
| `DataTable` | `src/components/ui/data-table.tsx` | Responsive ke kartu |
| `Pagination` | `src/components/ui/pagination.tsx` | |
| `EmptyState` | `src/components/ui/empty-state.tsx` | |
| `Skeleton` | `src/components/ui/skeleton.tsx` | |
| `AdminSidebar` | `src/components/admin/admin-sidebar.tsx` | |
| `SectionHeading` | `src/components/section-heading.tsx` | |
| `ProjectCard` | `src/components/project-card.tsx` | |
| `PostCard` | `src/components/post-card.tsx` | |
| `ServiceCard` | `src/components/service-card.tsx` | |
| `SkillBar` | `src/components/skill-bar.tsx` | |
| `Timeline` | `src/components/timeline.tsx` | |
| `TestimonialCard` | `src/components/testimonial-card.tsx` | |
| `CTA` | `src/components/cta-banner.tsx` | Hire-me banner |

> **Catatan**: `layout.tsx` sudah meng-import `SiteHeader` dan `SiteFooter` dari `@/components/...`, jadi kedua file itu harus ada sebelum build berjalan. Komponen lain boleh menyusul sesuai fase.

---

## 17. Referensi

| Dokumen | Isi |
| --- | --- |
| `src/app/globals.css` | Implementasi token warna, radius, grid, prose |
| `src/app/layout.tsx` | Font Geist, `data-theme`, override token dari settings, skip link |
| `src/lib/utils.ts` | `cn`, `slugify`, `formatPrice`, `formatDate`, `readingTime`, `initials` |
| `src/lib/types.ts` | `AppSettings` & tipe entitas |
| `db/seed.sql` | Nilai default settings (accent #6366f1, accent-2 #22d3ee, mode dark) |
| `PROJECT/03-DESIGN/user-flow.md` | Alur pengguna, edge case, error state |
| `PROJECT/03-DESIGN/wireframes/` | Wireframe low-fidelity + mapping komponen |
| `PROJECT/05-PLANNING/roadmap.md` | Fase, deliverable, exit criteria |
