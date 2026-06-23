# Portofolio — Sofwan Rosidi

Website portofolio pribadi (Network & Infrastructure Engineer) bergaya **neobrutalism**, dibangun dengan **Astro + React (islands) + Tailwind CSS**.

## Fitur
- Hero, Tentang, Keahlian (teknis + soft skill), Proyek, Riwayat (Pengalaman & Pendidikan), Sertifikat, Kontak
- **Proyek otomatis dari GitHub** (`sofwanrsd`) — sinkron tanpa edit manual
- Konten lain bersumber dari **`src/data/seed.json`** (satu sumber data, siap dipindah ke MongoDB lewat pola repository di `src/lib/data/`)
- Mode terang/gelap, responsif (HP & desktop), SEO/Open Graph
- Halaman CV web di `/cv` (bisa Save/Print PDF)

## Pengembangan
```bash
npm install
npm run dev      # http://localhost:4321
npm test         # unit + property-based tests
npm run build    # build statis ke dist/
```

## Edit konten
Ubah `src/data/seed.json` (profil, skills, history, certifications) lalu build/redeploy. Proyek diambil langsung dari GitHub.

## Pindah ke MongoDB (nanti)
Buat `src/lib/data/mongoRepository.ts` yang meng-implement `ContentRepository`, lalu ganti satu baris di `src/lib/data/index.ts`.
