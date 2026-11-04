-- Seed data (dijalankan otomatis oleh `npm run db:setup` jika tabel kosong)

INSERT INTO settings (key, value) VALUES
  ('site', '{"name":"Nama Kamu","tagline":"Full-Stack Developer & Designer","description":"Portfolio pribadi saya — saya bangun produk web yang cepat, rapi, dan layak dipamerkan.","logoText":"NK","email":"hello@domainmu.com","phone":"+62 812-3456-7890","location":"Jakarta, Indonesia","availability":"Tersedia untuk project baru","showAvailability":true,"heroTitle":"Saya bikin website yang enak dipakai dan enak dilihat.","heroSubtitle":"Full-stack developer dengan fokus pada performa, aksesibilitas, dan desain yang bersih.","heroCtaText":"Lihat Project","heroCtaLink":"/projects","heroSecondaryText":"Hubungi Saya","heroSecondaryLink":"/contact"}'),
  ('theme', '{"accent":"#6366f1","accentSecondary":"#22d3ee","mode":"dark","font":"Geist","radius":"soft","showGrid":true}'),
  ('sections', '{"hero":true,"services":true,"projects":true,"about":true,"skills":true,"experience":true,"testimonials":true,"pricing":true,"blog":true,"cta":true,"contact":true}'),
  ('socials', '{"github":"https://github.com/namakamu","linkedin":"https://linkedin.com/in/namakamu","twitter":"https://x.com/namakamu","instagram":"https://instagram.com/namakamu","youtube":"https://youtube.com/@namakamu","whatsapp":"https://wa.me/6281234567890"}'),
  ('seo', '{"metaTitle":"Portfolio — Nama Kamu","metaDescription":"Portfolio pribadi developer: project, blog, dan layanan freelance.","ogImage":"/opengraph-image","keywords":"portfolio, web developer, freelance"}'),
  ('features', '{"hireMeEnabled":true,"hireMeTitle":"Punya ide project?","hireMeText":"Ceritakan kebutuhan Anda — saya balas dalam 1x24 jam dengan estimasi harga dan timeline.","hireMeButtonText":"Mulai Diskusi","hireMeButtonLink":"/contact","showPricing":true,"pricingTitle":"Paket Layanan","pricingSubtitle":"Harga transparan, tanpa biaya tersembunyi.","ctaTitle":"Mari kerjakan project Anda","ctaText":"Punya sesuatu yang ingin dibahas? Langsung saja — konsultasi gratis untuk project pertama.","ctaButtonText":"Kontak Sekarang"}'),
  ('footer', '{"tagline":"","showCopyright":true,"copyrightText":"© 2026 Nama Kamu. All rights reserved."}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO projects (slug, title, summary, description, category, cover_image, gallery, stack, repo_url, live_url, client, year, featured, published, sort_order) VALUES
  ('dashboard-analytics', 'Analytics Dashboard', 'Dashboard real-time dengan chart interaktif dan filter dinamis.', 'Dashboard analitik yang menangani data jutaan baris dengan agregasi di database, bukan di browser. Dipakai tim-suite untuk monitoring KPI harian.', 'web', '', '[]', '["Next.js","TypeScript","PostgreSQL","Drizzle"]', '', '', 'Internal', '2025', true, true, 1),
  ('ecommerce-studio', 'E-commerce Studio', 'Headless storefront dengan checkout multi-pembayaran.', 'Toko online headless: katalog dari CMS, checkout Stripe + Midtrans, optimasi Core Web Vitals di bawah 1.5 detik.', 'web', '', '[]', '["Next.js","Stripe","Tailwind","Neon"]', '', '', 'Startup', '2025', true, true, 2),
  ('design-system', 'Design System Kit', 'Komponen reusable + dokumentasi untuk 4 tim produk.', 'Design system internal: 60+ komponen, token warna/typography, dokumentasi otomatis, dan Storybook versi ringan.', 'ui', '', '[]', '["React","Tailwind","Radix","Storybook"]', '', '', 'Enterprise', '2024', false, true, 3),
  ('automation-bot', 'Workflow Automation', 'Bot scraping + notifikasi real-time untuk tim ops.', 'Automasi pipeline: scraping job terjadwal, normalisasi data, lalu push notifikasi ke Slack saat ada anomali.', 'automation', '', '[]', '["Node.js","PostgreSQL","Cron","Resend"]', '', '', 'Internal', '2024', false, true, 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO posts (slug, title, excerpt, content, tags, published, published_at) VALUES
  ('cara-deploy-nextjs-ke-vercel', 'Cara Deploy Next.js ke Vercel + Neon dalam 10 Menit', 'Panduan ringkas dari repo kosong sampai URL publik dengan database Neon.', '## Langkah Singkat\n\n1. Push repo ke GitHub\n2. Import di Vercel, set environment variables\n3. Jalankan migrasi database\n4. Login ke /admin\n\nSelesai.', '["Next.js","Vercel","Neon"]', true, now() - interval '3 days'),
  ('kenapa-pakai-neon-postgres', 'Kenapa Saya Pakai Neon Postgres untuk Project Kecil', 'Serverless Postgres yang nyantol: cold start cepat, tanpa server yang harus diurus.', 'Neon memberi Postgres beneran, bukan emulator. Skalanya cuma naik saat dipakai, dan branch database-nya berguna untuk testing.', '["Neon","Database"]', true, now() - interval '10 days')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (slug, title, description, price_label, price_value, currency, features, icon, popular, published, sort_order) VALUES
  ('landing-page', 'Landing Page', 'Satu halaman yang persuade dan converting, siap tayang.', 'mulai dari', '2.500.000', 'IDR', '["Desain custom (Figma)","Responsif mobile","SEO dasar","Deploy ke Vercel","Revisi 2x"]', 'rocket', true, true, 1),
  ('website-company', 'Company Website', 'Multi halaman untuk perusahaan atau personal brand yang serius.', 'mulai dari', '8.000.000', 'IDR', '["Semua halaman landing","CMS sederhana","Blog + optimasi SEO","Analytics setup","Pelatihan editing"]', 'globe', false, true, 2),
  ('custom-app', 'Custom Web App', 'Aplikasi kustom: dashboard, auth, pembayaran, atau integrasi API.', 'mulai dari', '25.000.000', 'IDR', '["Analisis kebutuhan","Arsitektur & ERD","Auth & role management","Integrasi API pihak ketiga","Dokumentasi serah terima"]', 'code', false, true, 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO experiences (company, role, period, description, url, sort_order) VALUES
  ('Freelance', 'Full-Stack Developer', '2023 — sekarang', 'Membangun web app & situs untuk startup dan UMKM. Fokus Next.js, PostgreSQL, dan UI system.', '', 1),
  ('Product Studio', 'Frontend Engineer', '2021 — 2023', 'Membangun dashboard analytics dan design system untuk 4 tim produk.', '', 2),
  ('Agen Digital', 'Web Developer', '2019 — 2021', 'Landing page dan website company profile untuk klien ritel.', '', 3)
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, category, level, sort_order) VALUES
  ('TypeScript','Languages',95,1),
  ('JavaScript','Languages',95,2),
  ('SQL','Languages',88,3),
  ('Next.js','Frameworks',95,4),
  ('React','Frameworks',93,5),
  ('Node.js','Frameworks',90,6),
  ('PostgreSQL','Database',88,7),
  ('Tailwind CSS','Styling',92,8),
  ('Figma','Design',85,9),
  ('Git','Tools',90,10)
ON CONFLICT DO NOTHING;

INSERT INTO testimonials (name, role, company, content, rating, published, sort_order) VALUES
  ('Rina Prameswari','Product Owner','Nusantara Labs','Agak cepat dan detail. Revisi unlimited sampai benar-benar pas, dan kodenya rapi.', 5, true, 1),
  ('Bagas Prayoga','Founder','Kopi Senja','Website kami naik 2x dari traffic setelah launch. Loading-nya ngebut.', 5, true, 2),
  ('Sasha Nur','CTO','HaloHealth','Dokumentasi dan serah terima rapi, tim internal langsung bisa kelola sendiri.', 5, true, 3)
ON CONFLICT DO NOTHING;

-- Pesan masuk contoh (dummy) supaya inbox admin tidak kosong saat pertama dibuka.
INSERT INTO messages (name, email, subject, budget, message, status, created_at) VALUES
  ('Dewi Lestari', 'dewi@contoh.com', 'Landing page untuk produk skincare', 'Rp5-10 juta', 'Halo, saya butuh landing page untuk peluncuran produk bulan depan. Bisa mulai kapan?', 'new', now() - interval '2 hours'),
  ('Rangga Wibowo', 'rangga@contoh.com', 'Redesign website company profile', 'Rp10-25 juta', 'Website kami sudah 4 tahun tidak diubah. Ingin redesign total plus CMS supaya tim bisa update sendiri.', 'read', now() - interval '1 day'),
  ('Sinta Maharani', 'sinta@contoh.com', 'Tanya ketersediaan Q3', '', 'Apakah masih ada slot untuk project dashboard internal kuartal depan?', 'archived', now() - interval '9 days')
ON CONFLICT DO NOTHING;
