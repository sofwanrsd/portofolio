# Problem Statement: Website Portofolio Pribadi + CMS Semi-Custom

| Atribut | Nilai |
| --- | --- |
| Produk | Website portofolio pribadi yang sekaligus menjadi kanal penjualan jasa freelance |
| Owner | Satu developer Indonesia (pemilik sekaligus pengoperasional tunggal) |
| Versi dokumen | 1.0 |
| Tanggal | 4 November 2026 |
| Dokumen terkait | `feasibility-study.md`, `../02-REQUIREMENTS/PRD.md`, `../02-REQUIREMENTS/SRS.md` |
| Basis teknis | Next.js 15 App Router, TypeScript, Tailwind v4, Neon Postgres (raw SQL via `@neondatabase/serverless`), Vercel, bcryptjs + JWT (`jose`) |

---

## 1. Ringkasan Editor

Ada satu orang di balik produk ini: seorang developer Indonesia yang sudah bisa membuat website untuk orang lain, tetapi belum punya satu tempat yang **(a) memamerkan karyanya secara profesional** dan **(b) menjual jasanya**. Dua kebutuhan itu sering dianggap satu hal, padahal sebenarnya dua produk yang kebetulan berbagi satu basis data.

Yang dibangun saat ini: jika ada: biasanya berupa portofolio statis yang dirancang untuk *dipuji*, bukan untuk *dibeli*. Ia mengabaikan hal-hal yang justru menentukan keputusan klien: berapa harga pakasnya, apakah ada bukti kerja yang relevan, berapa lama pengerjaannya, dan bagaimana cara menghubungi. Klien yang tidak mendapat jawaban atas pertanyaan-pertanyaan itu pergi: dan yang tidak tercatat, sehingga owner bahkan tidak tahu berapa banyak peluang yang hilang.

Sebaliknya, sisi operasional bocor. Setiap kali owner ingin menambah satu project atau mengubah satu harga, ia harus menyunting file, commit, push, dan menunggu build. Perubahan yang seharusnya butuh dua menit menghabiskan satu siklus deploy penuh. Akibatnya konten membeku: portofolio terakhir mencerminkan kemampuan developer tiga tahun lalu, bukan yang dikuasai sekarang. Portofolio yang usang justru merusak kredibilitas: prospective klien menyimpulkan skills owner sudah rusty.

Maka masalah inti bukan "tidak punya website". Masalahnya adalah **tidak punya satu sistem yang bisa sekaligus dipercaya sebagai alat jualan dan dijaga selalu mutakhir tanpa biaya**. Solusinya: satu aplikasi dengan dua area: area publik yang menjual, dan area admin yang menjaga. Konten dan konfigurasi dipindahkan dari source code ke database, sehingga "mengubah portofolio" berubah dari tugas engineering menjadi tugas admin.

---

## 2. Job to be Done

### 2.1 Job utama (klien)

> **Ketika** saya atau tim saya butuh website/aplikasi dikerjakan, **maka** saya ingin melihat bukti kerja, paket layanan, harga, dan cara menghubungi yang jelas dalam satu halaman, **supaya** saya dapat menilai kelayakan dan timeline tanpa harus menawar atau melakukan riset panjang, **dan** agar saya bisa langsung memulai percakapan dengan brief yang cukup konkret.

Job ini bukan "mencari developer", melainkan **menyingkirkan ketidakpastian**. Orang yang punya anggaran sudah punya kandidat; yang belum adalah fear of mismatch: biaya meleset, timeline meleset, hasil tidak seperti yang dijanjikan.

### 2.2 Job sekunder (recruiter / talent partner)

> **Ketika**saya melakukan screening untuk posisi frontend/backend atau mitra contract, **maka** saya ingin melihat portofolio terstruktur (project, stack, pengalaman kerja, testimonial), **supaya** saya dapat menilai technical depth dalam waktu < 2 menit dan memutuskan siapa yang layak diwawancara.

Recruiter tidak akan melakukan inquiry. Ia akan **menutup tab** bila tidak menemukan bukti. Recruiter adalah audience yang nilainya tak terlihat tapi menentukan: satu lowongan membuat seluruh portofolio relevan.

### 2.3 Job tersier (owner)

> **Ketika** saya memperoleh informasi baru: project selesai, harga berubah, ada artikel baru untuk ditulis: **maka** saya ingin memperbarui situs dalam hitungan menit lewat form, **supaya** portofolio selalu mencerminkan kondisi terkini tanpa saya perlu menyentuh kode atau takut deploy.

### 2.4 Job pasif (visitor dari mesin pencari)

> **Ketika** saya sampai ke portofolio dari mesin pencari atau tautan, **maka** saya ingin memahami dalam 10 detik siapa orang ini dan apakah ia melakukan apa yang saya butuhkan, **supaya** saya tidak perlu menggulir jauh atau meninggalkan situs untuk mencari di tempat lain.

---

## 3. Pain Points per Audiens

### 3.1 Visitor (calon klien yang menelusuri dengan niat lemah)

| # | Pain Point | Dampak ke Produk | Akar Masalah |
| --- | --- | --- | --- |
| V1 | Tidak menemukan harga paket, harus tanya via chat lebih dulu | Menurun friction; pertanyaan "berapa biayanya?" menjadi blokir sebelum percakapan | Tidak ada layer konversi; portofolio hanya menampilkan kemampuannya |
| V2 | Detail project tipis: tidak ada stack, tahun, client, atau tautan live | Pengunjung tidak bisa memverifikasi klaim dan menganggap portofolio "kosong" | Project diperlakukan sebagai gambar, bukan case study |
| V3 | Situs lambat di HP atau berat di perangkat lama | Pengunjung keluar sebelum mencapai CTA |
 Render penuh di client, tanpa RSC dan optimasi gambar |
| V4 | Tidak ada bukti sosial dari pihak ketiga | Keraguan awal: "apakah ini orang yang benar-benar pernah menangani klien?" | Testimonial tidak pernah dianggap sebagai fitur, hanya hiasan |
| V5 | Tidak ada cara menghubungi cepat selain menunggu form panjang | Form abandonment tinggi, lead hilang | Form terlalu panjang dan tanpa jalan pintas (WhatsApp/email langsung) |
| V6 | Gagal menemukan informasi karena navigasi tidak jelas | Pengunjung tidak tahu halaman mana yang relevan | Struktur halaman tidak dirancang untuk intent pencarian |

### 3.2 Recruiter / Hiring Manager

| # | Pain Point | Dampak ke Produk | Akar Masalah |
| --- | --- | --- | --- |
| R1 | Butuh 2 menit memahami kapabilitas, harus membaca seluruh halaman about | Screening jadi lambat, tab ditutup | Tidak ada ringkasan kapabilitas per kategori di beranda |
| R2 | Tidak ada timeline pengalaman kerja | Sulit menilai relevansi pengalaman | Pengalaman kerja tidak pernah dimodelkan sebagai entitas data |
| R3 | Tidak ada kontak yang jelas untuk rekruter | Rekrutir berhenti tanpa follow-up | CTA rekrutmen tidak pernah disatukan dengan situs |
| R4 | Testimoni absen atau tidak kredibel | Meragukan kualitas kerja | Sumber testimoni tidak terstruktur |

### 3.3 Owner (pengelola situs)

| # | Pain Point | Dampak ke Produk | Akar Masalah |
| --- | --- | --- | --- |
| O1 | Setiap perubahan konten butuh edit kode + commit + push + deploy | Update portofolio tertunda berhari-hari; konten menjadi basi | Tidak ada layer admin |
| O2 | Harga paket tersebar di chat, catatan, dan file terpisah | Klien mendapat jawaban berbeda antar percakapan; terjadi harga undercut tanpa sadar | Tidak ada sumber kebenaran tunggal untuk harga |
| O3 | Pesan calon klien tercecer di inbox pribadi | Prospek hilang tanpa riwayat; tidak bisa diukur | Tidak ada penyimpanan pesan terstruktur |
| O4 | Mengganti tema, warna, urutan section, atau font harus menyentuh komponen | Repositori membusuk; setiap penyesuaian kecil butuh bantuan teknis | Konfigurasi ter-hardcode di source code |
| O5 | Tidak tahu halaman mana yang converting dan mana yang buntu | Optimasi dilakukan berdasarkan tebakan | Tidak ada pelacakan konversi |
| O6 | Tidak berani deploy karena takut merusak situs live | Perubahan penting tertunda tanpa batas | Tidak ada staging/preview yang aman |
| O7 | Dua hal yang harus dilayani (portofolio + commerce) tidak punya template yang sama | Dua situs terpisah = dua biaya, dua tempat pemeliharaan | Solusi terpecah |

---

## 4. Akar Masalah

Ketujuh pain point di atas berdiri di atas empat akar masalah yang sama:

**Akar 1: Dua audiens, dua kebutuhan, satu template yang tidak mempuasnya.**
Portofolio umumnya memprioritaskan estetika visual, sementara keputusan pembelian klien terjadi pada halaman harga, daftar paket, dan bukti kerja. Satu template yang hanya optimal untuk "dipuji" akan selalu gagal untuk "dibeli", dan sebaliknya. Produk harus melayani keduanya secara eksplisit, bukan berharap keduanya terjadi secara kebetulan.

**Akar 2: Konten dan konfigurasi tertanam di source code.**
Nama situs, tagline, warna aksen, font, urutan section, dan harga paket adalah **data**, bukan logika aplikasi. Selama keduanya tertanam di komponen React, setiap perubahan bisnis menuntut siklus deploy penuh dan setiap variation kecil butuh bantuan teknis.

**Akar 3: Tidak ada layer persistensi yang bisa ditulis manusia.**
Tidak ada tempat untuk menyimpan pesan calon klien, paket layanan, dan fitur paket secara terstruktur. Konsekuensinya, data repeat paling bernilai (pesan prospek) hilang begitu keluar dari kotak masuk.

**Akar 4: Tidak ada layer konversi yang terukur.**
Form kontak yang ada (bila ada) hanya mengirim email. Tidak ada data apakah orang benar-benar mengisi form, paket mana yang paling menarik, dari mana trafik datang, atau berapa lead hilang karena pertanyaan harga tak terjawab. Optimasi berjalan tanpa umpan balik.

---

## 5. Why Now

| Faktor | Realita 2026 | Implikasi ke Produk |
| --- | --- | --- |
| Hosting nyaris tanpa friction | Vercel Hobby gratis untuk usage pribadi; Pro $20/bulan dengan kredit usage | Biaya hosting bukan penghalang bahkan di tahap pertama |
| Serverless Postgres matang | Neon menyediakan Postgres managed dengan Free plan berbasis CU-hours, storage 1 GB/project | Tidak perlu mengelola server database sendiri |
| Framework React matang | Next.js 15 App Router dengan React Server Component dan streaming | Halaman publik bisa dirender di server tanpa JS client berlebihan |
| Tooling type-safe lazim | TypeScript strict, Zod, dan driver HTTP `@neondatabase/serverless` | Estimasi waktu development lebih dapat diprediksi |
| Persaingan jasa digital mengeras | Pembeli membandingkan 5–10 vendor dalam satu hari | Kecepatan dan kejelasan penawaran menjadi penentu, bukan hanya mutu |
| Kebiasaan konsumen bergeser | Banyak pembeli lebih dulu memilih chat cepat daripada form panjang | Form harus pendek, mobile-first, dan punya jalur pintas |
| SEO untuk portofolio belum jenuh | Halaman project dan artikel teknis adalah sumber organic traffic terbaik untuk niche skill | Blog dan project layak jadi fitur inti, bukan pelengkap |
| AI-assisted development menurunkan biaya iterasi | Boilerplate, validasi, dan dokumentasi bisa diselesaikan lebih cepat | Scope semi-custom yang lebih kaya menjadi ekonomis |

> Catatan: angka harga platform (Vercel, Neon, Resend) berubah dari waktu ke waktu. Nilai yang dipakai dalam dokumen ini adalah snapshot per November 2026 dan wajib diverifikasi ulang di dashboard resmi sebelum anggaran disetujui.
