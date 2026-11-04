# PROJECT — Dokumentasi Portfolio CMS

Dokumentasi lengkap proyek Website Portofolio Pribadi dengan CMS semi-kustom, dari riset sampai deployment.

**Proyek:** Portfolio CMS · **Versi:** 1.0.0 · **Stack:** Next.js 15 App Router · TypeScript · Tailwind CSS v4 · Neon Postgres · Vercel

---

## Peta Dokumentasi

| # | Dokumen | Isi | Status |
|---|---|---|---|
| 00 | [PROJECT-OVERVIEW](./00-PROJECT-OVERVIEW.md) | Ringkasan, ruang lingkup, stakeholders, timeline, deliverable | Selesai |
| 01 | [RESEARCH/problem-statement](./01-RESEARCH/problem-statement.md) | Permasalahan nyata, personas, pain points, solusi | Selesai |
| 01 | [RESEARCH/feasibility-study](./01-RESEARCH/feasibility-study.md) | Analisis kelayakan (teknis, ekonomis, operasional, jadwal) | Selesai |
| 02 | [REQUIREMENTS/PRD](./02-REQUIREMENTS/PRD.md) | Product Requirements Document: Masalah, Solusi, Fitur, Metrik | Selesai |
| 02 | [REQUIREMENTS/SRS](./02-REQUIREMENTS/SRS.md) | Software Requirements Specification: Fungsional & non-fungsional | Selesai |
| 02 | [REQUIREMENTS/user-stories](./02-REQUIREMENTS/user-stories.md) | User stories + acceptance criteria per story | Selesai |
| 02 | [REQUIREMENTS/acceptance-criteria](./02-REQUIREMENTS/acceptance-criteria.md) | AC-01 s/d AC-15 formal, dapat diuji | Selesai |
| 03 | [DESIGN/user-flow](./03-DESIGN/user-flow.md) | Alur pengguna lintas peran + diagram ASCII | Selesai |
| 03 | [DESIGN/design-system](./03-DESIGN/design-system.md) | Token warna, tipografi, spacing, komponen | Selesai |
| 03 | [DESIGN/wireframes](./03-DESIGN/wireframes/wireframes.md) | Low-fidelity W-01 s/d W-10 (desktop & mobile) | Selesai |
| 03 | [DESIGN/ui-spec](./03-DESIGN/ui-design/ui-spec.md) | High-fidelity: tema dinamis, layout, komponen | Selesai |
| 04 | [ARCHITECTURE/system-architecture](./04-ARCHITECTURE/system-architecture.md) | Diagram, layer, alur request, deployment | Selesai |
| 04 | [ARCHITECTURE/database-schema](./04-ARCHITECTURE/database-schema.md) | 9 tabel, kolom, index, relasi, ERD | Selesai |
| 04 | [ARCHITECTURE/api-specification](./04-ARCHITECTURE/api-specification.yaml) | OpenAPI 3.1.0 (8 endpoint) | Selesai |
| 04 | [ARCHITECTURE/security-design](./04-ARCHITECTURE/security-design.md) | STRIDE, OWASP, kontrol, checklist rilis | Selesai |
| 05 | [PLANNING/roadmap](./05-PLANNING/roadmap.md) | Fase pengerjaan & milestone | Selesai |
| 05 | [PLANNING/product-backlog](./05-PLANNING/product-backlog.md) | Backlog terurut prioritas + story point | Selesai |
| 05 | [PLANNING/risks](./05-PLANNING/risks.md) | Risk register + mitigasi | Selesai |
| 06 | [QUALITY/test-plan](./06-QUALITY/test-plan.md) | Strategi, 4 level test, exit criteria | Selesai |
| 06 | [QUALITY/definition-of-done](./06-QUALITY/definition-of-done.md) | DoD umum, per jenis item, release DoD | Selesai |
| 07 | [DEPLOYMENT/deployment-plan](./07-DEPLOYMENT/deployment-plan.md) | Provisioning, env, deploy, rollback, backup | Selesai |

**Total: 21 dokumen.**

---

## Cara Membaca

### Saya pemilik proyek, mau cepat paham
Baca berurutan: **00 → PRD → SRS → system-architecture → deployment-plan**.

### Saya developer yang mau mulai coding
Baca: **SRS** (apa yang dibangun) → **database-schema** (siapa tabelnya) → **api-specification** (kontrak API) → **README proyek** (setup).

### Saya designer
Baca: **design-system → wireframes → ui-spec → user-flow**.

### Saya QA / tester
Baca: **acceptance-criteria** (AC-01..15) → **test-plan** → **definition-of-done**.

### Saya reviewer keamanan
Baca: **security-design** → bagian OWASP di **SRS** → checklist rilis di **deployment-plan** §6.

---

## Konvensi Penulisan

- Bahasa Indonesia, konsisten di seluruh dokumen.
- Diagram memakai ASCII art agar dapat dirender di mana saja (terminal, editor, GitHub).
- Kode, perintah shell, dan path ditulis dalam code block.
- Kriteria penerimaan memakai ID stabil (`AC-xx.y`) supaya dapat ditelusuri ke test case.
- Istilah teknis (nama tabel, endpoint, komponen) ditulis apa adanya dalam `backticks`.

---

## Ringkasan Arsitektur

```
Pengunjung / Admin
        │  HTTPS
        ▼
   Vercel Edge CDN  ──►  Next.js 15 App Router (React Server Components)
                              │
                              ├── Server Actions  (auth, CRUD, contact)
                              ├── Route Handlers (/api/*)
                              └── Middleware      (proteksi /admin/*)
                              │
                              │  fetch() HTTP (Neon pooled connection)
                              ▼
                       Neon Postgres
                       users, settings, projects, posts,
                       services, experiences, skills,
                       testimonials, messages
```

Prinsip yang dipegang:

1. **Server-first** — semua query & mutasi terjadi di server; client hanya mengirim form.
2. **Tidak ada ORM** — raw SQL terparameterisasi (`$1`, `$2`) via driver HTTP Neon.
3. **Proteksi berlapis** — middleware memeriksa JWT, server action memeriksa `requireAdmin()`.
4. **Tema dari database** — pengaturan tersimpan di tabel `settings`, di-inject sebagai CSS variable ke root layout.
5. **Satu resource manager generik** — semua entitas CRUD memakai definisi yang sama di `src/lib/resources.ts`.

---

## Prinsip Singkat

Dokumentasi ini adalah sumber kebenaran tunggal untuk perilaku sistem. Bila implementasi kode berbeda dari dokumen, **kode adalah acuan** dan dokumen harus diperbarui sebagai bagian dari Definition of Done (`06-QUALITY/definition-of-done.md` §2.6).

---

## Riwayat Versi Dokumentasi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0.0 | 2026-11-04 | Dokumen awal lengkap: riset → requirements → design → arsitektur → planning → quality → deployment |
