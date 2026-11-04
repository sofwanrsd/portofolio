-- Seed data (dijalankan otomatis oleh `npm run db:setup` jika tabel kosong)

INSERT INTO settings (key, value) VALUES
  ('site', '{"name":"Nama Kamu","tagline":"Full-Stack Developer & Designer","description":"Portfolio pribadi saya. Saya bangun produk web yang cepat, rapi, dan layak dipamerkan.","logoText":"NK","email":"hello@domainmu.com","phone":"+62 812-3456-7890","location":"Jakarta, Indonesia","availability":"Tersedia untuk project baru","showAvailability":true,"heroTitle":"Saya bikin website yang enak dipakai dan enak dilihat.","heroSubtitle":"Full-stack developer dengan fokus pada performa, aksesibilitas, dan desain yang bersih.","heroCtaText":"Lihat Project","heroCtaLink":"/projects","heroSecondaryText":"Hubungi Saya","heroSecondaryLink":"/contact"}'),
  ('theme', '{"accent":"#ff6b1a","accentSecondary":"#ffb54d","mode":"dark","font":"Geist","radius":"soft","showGrid":true}'),
  ('sections', '{"hero":true,"services":true,"projects":true,"about":true,"skills":true,"experience":true,"testimonials":true,"pricing":true,"blog":true,"cta":true,"contact":true}'),
  ('socials', '{"github":"https://github.com/namakamu","linkedin":"https://linkedin.com/in/namakamu","twitter":"https://x.com/namakamu","instagram":"https://instagram.com/namakamu","youtube":"https://youtube.com/@namakamu","whatsapp":"https://wa.me/6281234567890"}'),
  ('seo', '{"metaTitle":"Portfolio Nama Kamu","metaDescription":"Portfolio pribadi developer: project, blog, dan layanan freelance.","ogImage":"/opengraph-image","keywords":"portfolio, web developer, freelance"}'),
  ('features', '{"hireMeEnabled":true,"hireMeTitle":"Punya ide project?","hireMeText":"Ceritakan kebutuhan Anda. Saya balas dalam 1x24 jam dengan estimasi harga dan timeline.","hireMeButtonText":"Mulai Diskusi","hireMeButtonLink":"/contact","showPricing":true,"pricingTitle":"Paket Layanan","pricingSubtitle":"Harga transparan, tanpa biaya tersembunyi.","ctaTitle":"Mari kerjakan project Anda","ctaText":"Punya sesuatu yang ingin dibahas? Langsung saja, konsultasi gratis untuk project pertama.","ctaButtonText":"Kontak Sekarang"}'),
  ('footer', '{"tagline":"","showCopyright":true,"copyrightText":"© 2026 Nama Kamu. All rights reserved."}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO projects (slug, title, summary, description, category, cover_image, gallery, stack, repo_url, live_url, client, year, featured, published, sort_order) VALUES
  ('dashboard-analytics', 'Analytics Dashboard', 'Dashboard KPI real-time untuk 40 juta baris data, tetap responsif di bawah 300 ms.', '## Latar belakang

Tim operasional Nusantara Labs memantau KPI harian dari lima sumber data yang berbeda. Laporan dibuat manual di spreadsheet setiap pagi dan sering terlambat sampai siang.

## Tantangan

- Data mentah lebih dari 40 juta baris dan terus bertambah
- Dashboard lama menghitung agregasi di browser sehingga sering macet
- Setiap divisi butuh tampilan dan filter yang berbeda

## Solusi

Agregasi dipindah ke database lewat materialized view yang diperbarui tiap lima menit. Frontend hanya menerima data yang sudah diringkas, sehingga ukuran respons turun dari belasan megabyte menjadi puluhan kilobyte.

Filter disimpan di URL, jadi tampilan apa pun bisa dibagikan lewat satu tautan. Setiap divisi punya preset sendiri tanpa perlu kode baru.

## Hasil

- Waktu muat dashboard turun dari 9 detik menjadi 280 ms
- Laporan pagi kini siap otomatis pukul 07.00
- Dipakai harian oleh 60 orang di 4 divisi', 'web', '/covers/dashboard-analytics.svg', '[]', '["Next.js 15", "TypeScript", "PostgreSQL", "pgvector", "Recharts", "Tailwind CSS"]', '', '', 'Nusantara Labs', '2025', true, true, 1),
  ('ecommerce-studio', 'E-commerce Studio', 'Toko online headless dengan checkout Midtrans, LCP 1,2 detik di jaringan 4G.', '## Latar belakang

Kopi Senja berjualan lewat marketplace dan Instagram. Komisi marketplace terus naik, dan mereka ingin punya toko sendiri yang sama mudahnya dipakai pelanggan.

## Tantangan

- Pelanggan mayoritas belanja dari ponsel dengan jaringan tidak stabil
- Stok harus sinkron dengan kasir di tiga cabang
- Tim tidak punya developer internal untuk mengurus konten

## Solusi

Katalog dirender statis dan diperbarui ulang hanya saat stok atau harga berubah. Checkout memakai Midtrans dengan pilihan QRIS, transfer bank, dan e-wallet.

Tim Kopi Senja mengelola produk, promo, dan banner dari panel admin sederhana. Notifikasi pesanan dikirim otomatis lewat email dan WhatsApp.

## Hasil

- Penjualan langsung naik 2,1 kali dalam tiga bulan pertama
- Rasio checkout selesai 68 persen, naik dari 41 persen di toko lama
- Skor Lighthouse mobile 98', 'web', '/covers/ecommerce-studio.svg', '[]', '["Next.js 15", "Neon", "Midtrans", "Tailwind CSS", "Resend", "Vercel"]', '', '', 'Kopi Senja', '2025', true, true, 2),
  ('design-system', 'Design System Kit', '60 komponen dan token desain yang dipakai bersama oleh 4 tim produk.', '## Latar belakang

Empat tim produk membangun komponen masing-masing. Hasilnya ada tujuh versi tombol dan lima warna biru yang berbeda di satu ekosistem produk.

## Solusi

Saya menyusun token desain untuk warna, jarak, radius, dan tipografi, lalu membangun 60 komponen di atas Radix UI agar aksesibilitas keyboard dan screen reader sudah beres sejak awal.

Dokumentasi dibuat otomatis dari kode, sehingga tidak pernah tertinggal dari versi terbaru.

## Hasil

- Waktu membangun halaman baru turun sekitar 40 persen
- Semua komponen lolos audit WCAG 2.2 level AA
- Satu sumber kebenaran untuk desainer dan developer', 'ui', '/covers/design-system.svg', '[]', '["React 19", "Tailwind CSS v4", "Radix UI", "Storybook", "Turborepo"]', '', '', 'Product Studio', '2024', false, true, 3),
  ('automation-bot', 'Automation Bot', 'Bot yang memproses 1.200 order per hari dari email ke sistem gudang tanpa input manual.', '## Latar belakang

Admin gudang menyalin pesanan dari email ke sistem internal satu per satu. Pekerjaan ini memakan dua orang penuh waktu dan rawan salah ketik.

## Solusi

Bot membaca email masuk, mengekstrak data pesanan, memvalidasinya dengan katalog produk, lalu membuat order di sistem gudang. Pesanan yang meragukan masuk antrean review, bukan langsung diproses.

## Hasil

- 1.200 order per hari diproses otomatis
- Tingkat kesalahan input turun dari 3 persen menjadi 0,2 persen
- Dua admin kini fokus ke layanan pelanggan', 'automation', '/covers/automation-bot.svg', '[]', '["Node.js", "TypeScript", "Upstash Redis", "Gmail API", "Postgres"]', '', '', 'Agen Logistik', '2024', false, true, 4),
  ('booking-klinik', 'Booking Klinik', 'Sistem reservasi dokter online untuk 12 cabang klinik dengan pengingat WhatsApp otomatis.', '## Latar belakang

Pasien HaloHealth harus menelepon untuk membuat janji. Antrean telepon panjang di pagi hari, dan sekitar seperempat pasien tidak datang tanpa kabar.

## Solusi

Pasien memilih cabang, dokter, dan jam yang masih kosong langsung dari ponsel. Jadwal dokter diatur oleh admin cabang, dan slot terkunci secara transaksional agar tidak ada pemesanan ganda.

Pengingat dikirim lewat WhatsApp sehari dan dua jam sebelum jadwal, lengkap dengan tombol konfirmasi atau ubah jadwal.

## Hasil

- Pasien tidak datang turun dari 24 persen menjadi 7 persen
- 70 persen reservasi kini masuk lewat web
- Beban telepon resepsionis berkurang separuh', 'web', '/covers/booking-klinik.svg', '[]', '["Next.js 15", "PostgreSQL", "Drizzle", "WhatsApp Cloud API", "Tailwind CSS"]', '', '', 'HaloHealth', '2025', true, true, 5),
  ('company-profile-arsitek', 'Company Profile Studio Arsitek', 'Situs portofolio editorial untuk studio arsitektur, dengan galeri proyek yang ringan dibuka.', '## Latar belakang

Studio arsitektur ini punya karya bagus, tapi situs lamanya lambat karena foto beresolusi tinggi dimuat sekaligus.

## Solusi

Desain editorial dengan tipografi serif besar dan ruang kosong yang lega, mengikuti karakter karya mereka. Foto dioptimalkan otomatis ke format modern dan dimuat bertahap saat digulir.

## Hasil

- Ukuran halaman galeri turun dari 28 MB menjadi 1,9 MB
- Permintaan konsultasi lewat situs naik 3 kali lipat
- Tim studio bisa menambah proyek baru sendiri', 'ui', '/covers/company-profile-arsitek.svg', '[]', '["Astro", "Tailwind CSS", "Sanity", "Cloudinary"]', '', '', 'Ruang Tenang Studio', '2024', false, true, 6),
  ('kasir-umkm', 'Kasir UMKM', 'Aplikasi kasir PWA yang tetap jalan saat offline dan sinkron otomatis begitu sinyal kembali.', '## Latar belakang

Banyak warung di daerah punya sinyal yang putus-sambung. Aplikasi kasir berbasis cloud biasa jadi tidak bisa dipakai tepat saat ramai pembeli.

## Solusi

Semua transaksi disimpan dulu di perangkat, lalu dikirim ke server saat koneksi tersedia. Aplikasi bisa dipasang dari browser tanpa toko aplikasi dan berjalan lancar di ponsel Android kelas menengah ke bawah.

## Hasil

- Dipakai di 35 warung dalam uji coba tiga bulan
- Nol transaksi hilang selama periode offline
- Laporan penjualan harian otomatis untuk pemilik warung', 'mobile', '/covers/kasir-umkm.svg', '[]', '["React", "PWA", "IndexedDB", "Hono", "Neon"]', '', '', 'Warung Bu Sri', '2025', false, true, 7),
  ('asisten-dokumen-ai', 'Asisten Dokumen AI', 'Pencarian dan tanya jawab atas 8.000 dokumen kontrak dengan jawaban yang selalu menyertakan sumber.', '## Latar belakang

Staf hukum menghabiskan waktu berjam-jam mencari klausul serupa di ribuan kontrak lama.

## Solusi

Dokumen dipecah per bagian dan diindeks dengan pgvector. Setiap jawaban menampilkan kutipan asli beserta nama dokumen dan halamannya, sehingga staf bisa memeriksa ulang sebelum memakai hasilnya.

Akses dibatasi per tim, dan dokumen tidak pernah keluar dari server milik firma.

## Hasil

- Waktu mencari klausul turun dari rata-rata 40 menit menjadi 2 menit
- Setiap jawaban dapat ditelusuri ke sumber aslinya
- Dipakai 25 staf sejak bulan pertama', 'ai', '/covers/asisten-dokumen-ai.svg', '[]', '["Next.js 15", "AI SDK", "pgvector", "PostgreSQL", "Tailwind CSS"]', '', '', 'Firma Hukum Sentosa', '2025', false, true, 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO posts (slug, title, excerpt, content, cover_image, tags, published, published_at) VALUES
  ('cara-deploy-nextjs-ke-vercel', 'Cara Deploy Next.js ke Vercel dan Neon dalam 10 Menit', 'Panduan ringkas dari repo kosong sampai URL publik, lengkap dengan database Postgres.', 'Banyak tutorial deploy berhenti di halaman statis. Begitu butuh database, langkahnya mendadak jadi panjang. Padahal dengan Vercel dan Neon, semuanya bisa selesai dalam sekali duduk.

## Yang perlu disiapkan

- Akun GitHub, Vercel, dan Neon (ketiganya punya paket gratis)
- Project Next.js yang sudah jalan di lokal
- File skema SQL untuk membuat tabel

## Langkah 1: buat database di Neon

Buat project baru di dashboard Neon, pilih region terdekat dengan pengguna Anda. Singapura biasanya pilihan terbaik untuk pengunjung Indonesia. Salin connection string yang diberikan.

## Langkah 2: push ke GitHub

Pastikan file `.env.local` masuk `.gitignore`. Rahasia tidak boleh ikut ter-commit, sekecil apa pun project-nya.

## Langkah 3: import di Vercel

Pilih repo dari dashboard Vercel, lalu isi environment variable:

1. DATABASE_URL berisi connection string dari Neon
2. AUTH_SECRET berisi string acak minimal 32 karakter
3. NEXT_PUBLIC_SITE_URL berisi domain final situs Anda

## Langkah 4: jalankan skema

Buka SQL Editor di Neon, tempel isi file skema, lalu jalankan. Setelah itu deploy ulang dari Vercel supaya halaman dinamis membaca data terbaru.

> Simpan connection string hanya di environment variable. Jangan pernah menaruhnya di kode frontend.

## Penutup

Setelah langkah ini, setiap push ke branch utama akan otomatis ter-deploy. Branch lain mendapat URL preview sendiri, sangat berguna untuk menunjukkan progres ke klien sebelum rilis.', '/covers/blog-cara-deploy-nextjs-ke-vercel.svg', '["Next.js", "Vercel", "Neon"]', true, now() - interval '3 days'),
  ('kenapa-pakai-neon-postgres', 'Kenapa Saya Pakai Neon Postgres untuk Project Kecil', 'Postgres sungguhan tanpa harus mengurus server, dan biayanya hanya naik saat benar-benar dipakai.', 'Untuk project klien skala kecil sampai menengah, saya hampir selalu memulai dengan Neon. Alasannya sederhana: saya ingin Postgres sungguhan tanpa harus menjadi admin server.

## Postgres, bukan tiruannya

Neon menjalankan Postgres asli. Semua fitur yang biasa saya pakai tetap ada, mulai dari transaksi, JSONB, full text search, sampai pgvector untuk fitur AI. Kalau suatu hari project perlu pindah, datanya bisa dibawa dengan pg_dump biasa.

## Bayar saat dipakai

Database bisa tidur saat tidak ada trafik dan bangun lagi dalam hitungan ratusan milidetik. Untuk situs portofolio atau company profile yang trafiknya naik turun, ini menghemat biaya cukup banyak.

## Branch database

Fitur favorit saya. Setiap branch Git bisa punya salinan database sendiri, jadi saya bisa mencoba migrasi berisiko tanpa menyentuh data produksi.

## Kapan tidak cocok

- Beban tulis yang sangat tinggi dan konstan sepanjang hari
- Kebutuhan data harus disimpan di server dalam negeri
- Tim sudah punya infrastruktur database sendiri yang stabil

## Kesimpulan

Untuk sebagian besar project yang saya kerjakan, Neon memberi keseimbangan terbaik antara kemudahan, biaya, dan kebebasan untuk pindah di kemudian hari.', '/covers/blog-kenapa-pakai-neon-postgres.svg', '["Neon", "Database", "Postgres"]', true, now() - interval '10 days'),
  ('core-web-vitals-praktis', 'Core Web Vitals Tanpa Pusing: 7 Perbaikan yang Paling Berdampak', 'Daftar perbaikan yang paling sering menaikkan skor performa situs klien saya, diurutkan dari yang paling murah.', 'Skor performa bukan sekadar angka untuk dipamerkan. Situs yang lambat kehilangan pengunjung sebelum mereka sempat membaca apa pun. Berikut perbaikan yang paling sering saya lakukan, diurutkan dari usaha paling kecil.

## 1. Ukuran gambar yang tepat

Gambar hero 4000 piksel untuk layar ponsel adalah penyebab paling umum LCP yang buruk. Sajikan beberapa ukuran dan biarkan browser memilih.

## 2. Font tanpa geser

Muat font dari domain sendiri dan tentukan fallback dengan ukuran yang mirip. Ini mengurangi pergeseran layout saat font selesai dimuat.

## 3. Tunda script pihak ketiga

Chat widget, pixel iklan, dan analytics jarang perlu dimuat di detik pertama. Muat setelah halaman interaktif.

## 4. Sediakan ruang untuk konten dinamis

Banner dan embed yang muncul belakangan mendorong konten ke bawah. Berikan tinggi minimum agar layout tidak melompat.

## 5. Kurangi JavaScript di sisi klien

Komponen yang tidak interaktif cukup dirender di server. Setiap kilobyte yang tidak dikirim adalah kilobyte yang tidak perlu diproses ponsel.

## 6. Cache yang masuk akal

Halaman yang jarang berubah bisa dirender statis dan diperbarui hanya saat konten diedit.

## 7. Ukur di perangkat nyata

Laptop developer bukan representasi pengguna. Uji dengan ponsel kelas menengah dan jaringan 4G yang dibatasi.

## Penutup

Kebanyakan situs bisa naik dari kategori merah ke hijau hanya dengan tiga perbaikan pertama.', '/covers/blog-core-web-vitals-praktis.svg', '["Performa", "SEO", "Next.js"]', true, now() - interval '17 days'),
  ('menulis-brief-project-web', 'Cara Menulis Brief Project Web yang Bikin Estimasi Akurat', 'Template sederhana supaya developer bisa memberi harga dan timeline yang realistis sejak percakapan pertama.', 'Estimasi yang meleset hampir selalu berawal dari brief yang terlalu singkat. Bukan karena klien tidak tahu maunya, tapi karena tidak tahu informasi apa yang dibutuhkan developer.

## Mulai dari tujuan, bukan fitur

Kalimat "saya butuh website" sulit diestimasi. Kalimat "saya ingin calon pelanggan bisa memesan konsultasi tanpa harus menelepon" jauh lebih jelas, karena dari situ fitur bisa diturunkan.

## Lima hal yang wajib ada

1. Tujuan utama dan cara mengukur keberhasilannya
2. Siapa pengguna dan dari perangkat apa mereka biasanya mengakses
3. Daftar halaman atau fitur, dipisah antara wajib dan opsional
4. Contoh situs yang Anda suka, beserta alasannya
5. Tenggat waktu dan rentang anggaran

## Soal anggaran

Banyak klien enggan menyebut anggaran karena takut harga dinaikkan. Kenyataannya, rentang anggaran membantu developer mengusulkan solusi yang pas, bukan solusi termahal.

## Siapkan konten lebih awal

Keterlambatan project paling sering bukan di sisi kode, melainkan menunggu teks dan foto. Siapkan konten utama sebelum desain dimulai.

## Penutup

Brief yang baik tidak harus panjang. Satu halaman yang menjawab lima hal di atas sudah cukup untuk menghasilkan estimasi yang bisa dipegang.', '/covers/blog-menulis-brief-project-web.svg', '["Freelance", "Proses", "Klien"]', true, now() - interval '26 days'),
  ('aksesibilitas-dasar-web', 'Aksesibilitas Web: 6 Hal Dasar yang Sering Terlewat', 'Perubahan kecil yang membuat situs bisa dipakai lebih banyak orang, sekaligus disukai mesin pencari.', 'Aksesibilitas sering dianggap fitur tambahan. Padahal sebagian besar perbaikannya murah dan langsung membuat situs lebih nyaman untuk semua orang, bukan hanya pengguna dengan disabilitas.

## 1. Kontras warna

Teks abu-abu muda di atas latar putih mungkin terlihat elegan di monitor desainer, tapi sulit dibaca di bawah sinar matahari. Targetkan rasio kontras minimal 4,5 banding 1 untuk teks biasa.

## 2. Teks alternatif gambar

Tulis apa yang disampaikan gambar, bukan sekadar nama filenya. Gambar dekoratif cukup diberi alt kosong agar dilewati pembaca layar.

## 3. Navigasi dengan keyboard

Coba tekan Tab dari atas halaman. Setiap elemen interaktif harus bisa dicapai dan terlihat jelas saat sedang fokus.

## 4. Label pada form

Placeholder bukan pengganti label. Saat pengguna mulai mengetik, petunjuknya hilang.

## 5. Struktur judul yang urut

Satu H1 per halaman, lalu H2 dan H3 secara berurutan. Pembaca layar memakai struktur ini sebagai daftar isi.

## 6. Hormati preferensi gerak

Sebagian orang merasa pusing dengan animasi berlebihan. Matikan animasi besar saat sistem operasi pengguna meminta gerak dikurangi.

## Penutup

Mulailah dari enam hal ini. Hasilnya situs yang lebih mudah dipakai, lebih mudah dirawat, dan biasanya juga lebih baik di mata mesin pencari.', '/covers/blog-aksesibilitas-dasar-web.svg', '["Aksesibilitas", "UX", "HTML"]', true, now() - interval '35 days'),
  ('design-token-tailwind-v4', 'Design Token di Tailwind CSS v4: Satu Sumber untuk Tema Terang dan Gelap', 'Cara menyusun variabel warna supaya ganti tema cukup lewat satu atribut, tanpa menulis ulang kelas.', 'Salah satu perubahan terbesar di Tailwind CSS v4 adalah konfigurasi yang pindah ke CSS. Ini membuat design token terasa jauh lebih alami.

## Masalah yang ingin diselesaikan

Tanpa token, warna tersebar di ratusan kelas. Mengganti warna aksen berarti mencari dan mengganti di seluruh project, dan biasanya ada yang terlewat.

## Susun token berdasarkan peran

Beri nama warna berdasarkan fungsinya, bukan tampilannya. Gunakan nama seperti latar, teks, teks redup, garis, dan aksen, bukan biru atau abu-abu. Dengan begitu tema gelap cukup mengganti nilainya, bukan namanya.

## Satu atribut untuk ganti tema

Simpan nilai tema terang dan gelap sebagai variabel CSS, lalu tukar nilainya berdasarkan atribut di elemen html. Komponen tidak perlu tahu tema apa yang sedang aktif.

## Warna turunan dengan color-mix

Daripada mendefinisikan sepuluh tingkat transparansi, turunkan langsung dari warna aksen. Hasilnya otomatis ikut berubah saat aksen diganti dari panel admin.

## Hal yang perlu diwaspadai

- Uji kontras di kedua tema, bukan hanya tema gelap
- Hindari warna putih atau hitam yang ditulis langsung di komponen
- Simpan pilihan tema pengguna di cookie agar tidak ada kedipan saat halaman dimuat

## Penutup

Dengan token yang rapi, mengganti identitas visual seluruh situs bisa selesai dalam hitungan menit.', '/covers/blog-design-token-tailwind-v4.svg', '["Tailwind CSS", "Desain", "CSS"]', true, now() - interval '48 days')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (slug, title, description, price_label, price_value, currency, features, icon, popular, published, sort_order) VALUES
  ('landing-page', 'Landing Page', 'Satu halaman yang persuade dan converting, siap tayang.', 'mulai dari', '2.500.000', 'IDR', '["Desain custom (Figma)","Responsif mobile","SEO dasar","Deploy ke Vercel","Revisi 2x"]', 'rocket', true, true, 1),
  ('website-company', 'Company Website', 'Multi halaman untuk perusahaan atau personal brand yang serius.', 'mulai dari', '8.000.000', 'IDR', '["Semua halaman landing","CMS sederhana","Blog + optimasi SEO","Analytics setup","Pelatihan editing"]', 'globe', false, true, 2),
  ('custom-app', 'Custom Web App', 'Aplikasi kustom: dashboard, auth, pembayaran, atau integrasi API.', 'mulai dari', '25.000.000', 'IDR', '["Analisis kebutuhan","Arsitektur & ERD","Auth & role management","Integrasi API pihak ketiga","Dokumentasi serah terima"]', 'code', false, true, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiences (company, role, kind, start_date, end_date, period, description, highlights, url, sort_order) VALUES
  ('Freelance', 'Full-Stack Developer', 'work', '2023-01-01', '', '', 'Membangun web app, toko online, dan sistem internal untuk startup, klinik, serta UMKM.', '["Menangani project dari brief sampai serah terima.", "Merancang antarmuka, database, dan deployment.", "Menjaga komunikasi progres mingguan dengan klien."]'::jsonb, '', 1),
  ('Product Studio', 'Senior Frontend Engineer', 'work', '2022-01-01', '2023-01-01', '', '', '["Memimpin pembangunan design system untuk 4 tim produk.", "Memastikan seluruh komponen lolos audit WCAG AA."]'::jsonb, '', 2),
  ('Agen Digital', 'Web Developer', 'work', '2019-01-01', '2021-12-01', '', '', '["Mengerjakan lebih dari 30 landing page dan company profile.", "Bertanggung jawab atas performa dan SEO teknis."]'::jsonb, '', 3),
  ('Universitas Contoh', 'S1 Teknik Informatika', 'education', '2015-08-01', '2019-08-01', '', 'Lulus dengan tugas akhir sistem informasi berbasis web.', '["Menyelesaikan tugas akhir sistem pemesanan berbasis web.", "Asisten laboratorium pemrograman web."]'::jsonb, '', 4),
  ('Himpunan Mahasiswa Informatika', 'Kepala Divisi Teknologi', 'organization', '2017-03-01', '2018-03-01', '', '', '["Mengelola website dan sistem pendaftaran acara himpunan."]'::jsonb, '', 5),
  ('Dicoding', 'Belajar Membuat Aplikasi Back-End', 'certification', '2018-06-01', '2018-06-01', '', 'Sertifikat kelulusan kelas online.', '[]'::jsonb, '', 6)
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category, level, sort_order) VALUES
  ('TypeScript','Languages',96,1),
  ('JavaScript','Languages',94,2),
  ('SQL','Languages',90,3),
  ('Python','Languages',78,4),
  ('Next.js','Frameworks',96,5),
  ('React','Frameworks',95,6),
  ('Node.js','Frameworks',92,7),
  ('Bun','Frameworks',80,8),
  ('PostgreSQL','Database',92,9),
  ('Neon','Database',88,10),
  ('Redis','Database',78,11),
  ('Tailwind CSS','Styling',94,12),
  ('Radix UI','Styling',84,13),
  ('Framer Motion','Styling',82,14),
  ('Git','Tools',92,15),
  ('Docker','Tools',84,16),
  ('Vercel','Tools',90,17),
  ('Turborepo','Tools',76,18),
  ('AI SDK','AI',80,19),
  ('OpenAI API','AI',78,20)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (name, role, company, content, rating, published, sort_order) VALUES
  ('Rina Prameswari', 'Product Owner', 'Nusantara Labs', 'Dashboard yang dulu butuh hampir sepuluh detik untuk terbuka sekarang langsung tampil. Prosesnya rapi, setiap minggu ada demo progres, dan dokumentasinya jelas sampai tim kami bisa melanjutkan sendiri.', 5, true, 1),
  ('Bagas Prayoga', 'Founder', 'Kopi Senja', 'Penjualan dari toko sendiri naik lebih dari dua kali lipat. Yang paling saya suka, tim kami bisa mengganti promo dan banner tanpa harus menghubungi developer.', 5, true, 2),
  ('Sasha Nur', 'Head of Operations', 'HaloHealth', 'Angka pasien yang tidak datang turun drastis setelah pengingat WhatsApp aktif. Komunikasinya enak, istilah teknis selalu dijelaskan dengan bahasa yang mudah dipahami.', 5, true, 3),
  ('Andre Wijaya', 'Principal Architect', 'Ruang Tenang Studio', 'Situs baru kami benar-benar mencerminkan karakter studio. Tenang, lega, dan galerinya cepat dibuka walau isinya foto resolusi tinggi.', 5, true, 4),
  ('Maya Kartika', 'Engineering Manager', 'Product Studio', 'Design system yang dibangun menyatukan empat tim yang sebelumnya jalan sendiri-sendiri. Kualitas aksesibilitasnya juga di atas ekspektasi kami.', 5, true, 5),
  ('Fajar Hidayat', 'Partner', 'Firma Hukum Sentosa', 'Fitur yang paling kami hargai adalah setiap jawaban selalu menyertakan sumber dokumennya. Staf kami percaya pada hasilnya karena bisa langsung memeriksa.', 4, true, 6)
ON CONFLICT DO NOTHING;

-- Pesan masuk contoh (dummy) supaya inbox admin tidak kosong saat pertama dibuka.
INSERT INTO messages (name, email, subject, budget, message, status, created_at) VALUES
  ('Dewi Lestari', 'dewi@contoh.com', 'Landing page untuk produk skincare', 'Rp5-10 juta', 'Halo, saya butuh landing page untuk peluncuran produk bulan depan. Ada form pre-order dan integrasi ke WhatsApp. Kira-kira bisa mulai kapan?', 'new', now() - interval '2 hours'),
  ('Yoga Pratama', 'yoga@contoh.com', 'Aplikasi absensi karyawan', 'Rp25-50 juta', 'Kami punya 120 karyawan di 3 lokasi dan ingin absensi berbasis lokasi lewat ponsel, lengkap dengan rekap untuk HR. Boleh minta jadwal call minggu ini?', 'new', now() - interval '5 hours'),
  ('Rangga Wibowo', 'rangga@contoh.com', 'Redesign website company profile', 'Rp10-25 juta', 'Website kami sudah 4 tahun tidak diubah. Ingin redesign total plus CMS supaya tim marketing bisa update sendiri.', 'read', now() - interval '1 day'),
  ('Laras Ayuningtyas', 'laras@contoh.com', 'Optimasi kecepatan toko online', 'Rp5-10 juta', 'Toko online kami lambat sekali di ponsel, skor PageSpeed cuma 31. Apakah bisa diaudit dulu sebelum dikerjakan?', 'read', now() - interval '3 days'),
  ('Sinta Maharani', 'sinta@contoh.com', 'Pertanyaan soal paket Company Website', 'Belum tahu', 'Apakah paket Company Website sudah termasuk domain dan hosting untuk tahun pertama?', 'archived', now() - interval '6 days'),
  ('Hendra Gunawan', 'hendra@contoh.com', 'Kolaborasi project agensi', 'Rp50 juta ke atas', 'Kami agensi kreatif dan sedang mencari partner developer untuk dua project klien korporat kuartal depan.', 'archived', now() - interval '12 days');
