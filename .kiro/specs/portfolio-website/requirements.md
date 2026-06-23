# Requirements Document

## Introduction

Fitur ini adalah sebuah website portofolio statis untuk seorang web/software developer yang menampilkan profil, keahlian teknis, proyek coding, dan informasi kontak pemilik website. Website dibangun menggunakan framework Astro yang menghasilkan keluaran build statis (HTML, CSS, dan JavaScript) dan ditata menggunakan Tailwind CSS. Artefak statis tersebut dilayani melalui web server Apache yang berjalan di sebuah VPS (Virtual Private Server). Pada fase awal, website diakses melalui alamat IP VPS menggunakan HTTP, sementara HTTPS/TLS ditunda hingga domain tersedia. Konten Bagian_Tentang, Bagian_Keahlian, Bagian_Proyek, dan Bagian_Riwayat tidak disimpan di dalam Build_Statis, melainkan bersumber dari Basis_Data Supabase (PostgreSQL) yang berada di luar VPS dan diambil secara runtime langsung dari peramban Pengunjung melalui Supabase API (client-side). Bagian_Riwayat menampilkan linimasa (timeline) pengalaman kerja dan pendidikan Pemilik secara kronologis. Seluruh gambar pada Portfolio_Website, yaitu foto profil pada Bagian_Tentang dan gambar pratinjau pada Bagian_Proyek, dirujuk melalui URL gambar eksternal (tautan) yang dimasukkan Pemilik sebagai teks, tanpa proses unggah berkas (file upload). Penyebaran (deployment) dilakukan secara otomatis melalui Pipeline_CICD berbasis GitHub Actions. Selain bagian publik, Portfolio_Website menyediakan Halaman_Admin pada rute `/admin` di dalam situs Astro yang sama dan dilayani oleh Apache_Server. Karena situs merupakan Build_Statis, Halaman_Admin dirender di sisi klien (client-rendered) dan menggunakan Supabase JavaScript client di peramban untuk autentikasi melalui Supabase_Auth serta operasi data terhadap Basis_Data. Halaman_Admin memungkinkan Pemilik mengelola konten Bagian_Proyek, Bagian_Keahlian, dan Bagian_Riwayat (membuat, menyunting, dan menghapus) serta menyunting konten Bagian_Tentang (nama Pemilik, URL foto profil, dan deskripsi singkat) tanpa mengakses Basis_Data secara langsung. Arsitektur ini dirancang agar portabel dan dapat dipindahkan ke Vercel di masa mendatang (kombinasi Build_Statis Astro dengan lapisan data Supabase eksternal) tanpa mengubah sumber data. Portfolio_Website juga mendukung Mode_Tema terang dan gelap (light/dark) yang dapat dialihkan Pengunjung melalui Kontrol_Tema, mengikuti preferensi sistem operasi/peramban pada kunjungan pertama, serta menyimpan preferensi tersebut di peramban untuk kunjungan berikutnya. Selain itu, Portfolio_Website menyertakan Meta_Tag untuk SEO dan berbagi sosial, mencakup judul halaman, deskripsi, Open_Graph (og:title, og:description, og:image, og:url), Twitter card, dan favicon. Dokumen ini mendefinisikan kebutuhan untuk konten yang ditampilkan, pengambilan data runtime dari Supabase beserta state pemuatan dan kesalahannya, keamanan akses Basis_Data, autentikasi dan pengelolaan konten melalui Halaman_Admin, navigasi antar bagian, kontak berbasis mailto, responsivitas tampilan pada kelas perangkat ponsel, tablet, dan desktop (termasuk Halaman_Admin), dukungan Mode_Tema terang/gelap, penyertaan Meta_Tag untuk SEO dan Open_Graph, penyajian melalui Apache, serta proses build dan deployment otomatis.

## Glossary

- **Portfolio_Website**: Situs web statis yang menampilkan profil dan karya Pemilik sebagai web/software developer, terdiri dari berkas HTML, CSS, dan JavaScript hasil build Astro.
- **Astro**: Framework pembangun situs web yang digunakan untuk menghasilkan Build_Statis dari kode sumber Portfolio_Website.
- **Build_Statis**: Keluaran build statis (berkas HTML, CSS, dan JavaScript) yang dihasilkan oleh Astro dan siap dilayani oleh Apache_Server.
- **Pengunjung**: Orang yang mengakses Portfolio_Website melalui peramban (browser).
- **Pemilik**: Orang yang memiliki dan mengelola konten Portfolio_Website.
- **Apache_Server**: Web server Apache HTTP Server yang berjalan di VPS dan melayani Build_Statis Portfolio_Website kepada Pengunjung.
- **VPS**: Virtual Private Server tempat Apache_Server dan Build_Statis Portfolio_Website di-host.
- **Alamat_IP_VPS**: Alamat IP publik VPS yang digunakan Pengunjung untuk mengakses Portfolio_Website pada fase awal sebelum domain tersedia.
- **Bagian_Tentang**: Bagian halaman yang menampilkan ringkasan profil dan deskripsi diri Pemilik, yang datanya (nama Pemilik, URL foto profil, dan deskripsi singkat) bersumber dari Basis_Data Supabase dan diambil secara runtime dari peramban Pengunjung. Foto profil dirujuk melalui URL gambar eksternal.
- **Bagian_Keahlian**: Bagian halaman yang menampilkan daftar keahlian teknis Pemilik berupa bahasa pemrograman, framework, dan tools, yang datanya bersumber dari Basis_Data Supabase dan diambil secara runtime dari peramban Pengunjung.
- **Bagian_Proyek**: Bagian halaman yang menampilkan daftar proyek coding Pemilik beserta tech stack, tautan repositori GitHub, dan tautan demo langsung opsional, yang datanya bersumber dari Basis_Data Supabase dan diambil secara runtime dari peramban Pengunjung.
- **Bagian_Riwayat**: Bagian halaman yang menampilkan linimasa (timeline) riwayat pengalaman kerja dan pendidikan Pemilik secara kronologis, dengan setiap entri memuat posisi/gelar, instansi/institusi, periode (tanggal mulai dan tanggal selesai yang dapat bernilai "sekarang"/sedang berjalan), serta deskripsi opsional. Data Bagian_Riwayat bersumber dari Basis_Data Supabase dan diambil secara runtime dari peramban Pengunjung, serta dikelola melalui Halaman_Admin.
- **Bagian_Kontak**: Bagian halaman yang menampilkan informasi kontak Pemilik berupa tautan mailto dan tautan media profesional opsional.
- **Tautan_Mailto**: Tautan dengan skema `mailto:` yang sudah teralamat ke email Pemilik dan membuka klien email bawaan Pengunjung saat diaktifkan.
- **Menu_Navigasi**: Komponen antarmuka yang berisi tautan menuju setiap bagian Portfolio_Website.
- **Repositori_Git**: Repositori GitHub yang menyimpan kode sumber Portfolio_Website dan menjadi pemicu Pipeline_CICD saat terjadi push.
- **Pipeline_CICD**: Rangkaian otomatis (Continuous Integration/Continuous Deployment) berbasis GitHub Actions yang melakukan build Astro dan deployment Build_Statis ke direktori root dokumen Apache_Server pada VPS saat ada perubahan yang di-push ke Repositori_Git.
- **Supabase**: Layanan backend yang menyediakan Basis_Data PostgreSQL beserta Supabase API yang diakses Portfolio_Website dari peramban Pengunjung untuk mengambil data Bagian_Keahlian dan Bagian_Proyek.
- **Basis_Data**: Basis data PostgreSQL yang dikelola oleh Supabase, berada di luar VPS, dan menyimpan data keahlian serta proyek yang ditampilkan Portfolio_Website.
- **Kunci_Anon**: Kunci publik (public anon key) yang digunakan klien peramban Portfolio_Website untuk mengakses Supabase API secara baca (read-only).
- **RLS**: Row Level Security, mekanisme pada Basis_Data yang membatasi hak akses pada tingkat baris sehingga klien publik hanya dapat membaca data keahlian dan proyek yang ditandai dapat dibaca publik.
- **State_Pemuatan**: Kondisi tampilan saat data sedang diambil dari Basis_Data melalui Supabase API dan belum selesai diterima.
- **State_Kesalahan**: Kondisi tampilan saat pengambilan data dari Basis_Data melalui Supabase API gagal diselesaikan.
- **Halaman_Admin**: Panel administrasi pada rute `/admin` di dalam situs Astro yang sama, dirender di sisi klien, yang digunakan Pemilik untuk mengelola konten Bagian_Proyek, Bagian_Keahlian, dan Bagian_Riwayat serta menyunting konten Bagian_Tentang.
- **Supabase_Auth**: Layanan autentikasi Supabase yang memverifikasi kredensial email dan kata sandi Pemilik serta menerbitkan Sesi_Autentikasi.
- **Sesi_Autentikasi**: Sesi terautentikasi yang diterbitkan oleh Supabase_Auth setelah Pemilik berhasil login dan yang menjadi dasar pemberian akses ke Halaman_Admin.
- **TLS**: Transport Layer Security, protokol enkripsi yang digunakan untuk koneksi HTTPS.
- **Mode_Tema**: Status tema tampilan Portfolio_Website yang dapat bernilai terang (light) atau gelap (dark), menentukan skema warna seluruh bagian dan teks.
- **Kontrol_Tema**: Kontrol antarmuka (toggle) pada Portfolio_Website yang digunakan Pengunjung untuk mengalihkan Mode_Tema antara terang dan gelap.
- **Meta_Tag**: Elemen metadata pada bagian head dokumen HTML Build_Statis Portfolio_Website, mencakup judul halaman (title), deskripsi (meta description), Open_Graph, Twitter card, dan favicon, yang digunakan oleh mesin pencari dan platform sosial.
- **Open_Graph**: Sekumpulan Meta_Tag berstandar Open Graph protocol (og:title, og:description, og:image, og:url) yang menentukan tampilan pratinjau tautan Portfolio_Website ketika dibagikan ke platform sosial.

## Requirements

### Requirement 1: Menampilkan Bagian Tentang

**User Story:** Sebagai Pengunjung, saya ingin melihat profil dan deskripsi diri Pemilik, sehingga saya dapat memahami latar belakang Pemilik.

#### Acceptance Criteria

1. WHEN Pengunjung membuka Bagian_Tentang, THE Portfolio_Website SHALL mengambil data Bagian_Tentang (nama Pemilik, URL foto profil, dan deskripsi singkat) dari Basis_Data melalui Supabase API secara runtime dari peramban Pengunjung.
2. WHILE pengambilan data Bagian_Tentang dari Basis_Data belum selesai, THE Portfolio_Website SHALL menampilkan State_Pemuatan berupa indikator pemuatan pada Bagian_Tentang.
3. WHEN pengambilan data Bagian_Tentang dari Basis_Data berhasil, THE Portfolio_Website SHALL menampilkan Bagian_Tentang yang memuat nama Pemilik, foto profil dari URL gambar eksternal, dan deskripsi singkat.
4. THE Portfolio_Website SHALL menampilkan Bagian_Tentang pada halaman utama tanpa memerlukan interaksi tambahan dari Pengunjung.
5. THE Portfolio_Website SHALL menampilkan deskripsi singkat Pemilik pada Bagian_Tentang dengan panjang antara 1 sampai 500 karakter.
6. IF pengambilan data Bagian_Tentang dari Basis_Data gagal, THEN THE Portfolio_Website SHALL menampilkan State_Kesalahan berupa pesan kesalahan beserta kontrol untuk mencoba kembali pada Bagian_Tentang tanpa menghentikan tampilan bagian lain pada halaman.
7. IF foto profil Pemilik gagal dimuat dari URL gambar eksternal, THEN THE Portfolio_Website SHALL menampilkan gambar pengganti (placeholder) pada Bagian_Tentang serta tetap menampilkan nama Pemilik dan deskripsi singkat tanpa menghentikan tampilan halaman utama.

### Requirement 2: Menampilkan Bagian Keahlian Teknis

**User Story:** Sebagai Pengunjung, saya ingin melihat daftar keahlian teknis Pemilik berupa bahasa pemrograman, framework, dan tools, sehingga saya dapat menilai kemampuan teknis Pemilik.

#### Acceptance Criteria

1. WHEN Pengunjung membuka Bagian_Keahlian, THE Portfolio_Website SHALL mengambil data keahlian teknis Pemilik dari Basis_Data melalui Supabase API secara runtime dari peramban Pengunjung.
2. WHILE pengambilan data keahlian dari Basis_Data belum selesai, THE Portfolio_Website SHALL menampilkan State_Pemuatan berupa indikator pemuatan pada Bagian_Keahlian.
3. WHEN pengambilan data keahlian dari Basis_Data berhasil, THE Portfolio_Website SHALL menampilkan daftar keahlian teknis Pemilik dengan setiap entri menampilkan nama keahlian sebagai teks.
4. THE Portfolio_Website SHALL mengelompokkan keahlian teknis pada Bagian_Keahlian ke dalam kategori bahasa pemrograman, framework, dan tools.
5. WHERE sebuah keahlian memiliki tingkat penguasaan, THE Portfolio_Website SHALL menampilkan indikator tingkat penguasaan untuk keahlian tersebut menggunakan skala diskret dengan nilai minimum 1 dan nilai maksimum 5.
6. IF pengambilan data keahlian dari Basis_Data berhasil dan tidak memuat satu pun keahlian, THEN THE Portfolio_Website SHALL menampilkan pesan yang mengindikasikan bahwa belum ada keahlian yang tersedia.
7. IF pengambilan data keahlian dari Basis_Data gagal, THEN THE Portfolio_Website SHALL menampilkan State_Kesalahan berupa pesan kesalahan beserta kontrol untuk mencoba kembali pada Bagian_Keahlian tanpa menghentikan tampilan bagian lain pada halaman.
8. WHEN jumlah keahlian yang berhasil diambil melebihi 50 entri, THE Portfolio_Website SHALL membatasi tampilan pada 50 entri pertama.

### Requirement 3: Menampilkan Bagian Proyek

**User Story:** Sebagai Pengunjung, saya ingin melihat daftar proyek coding Pemilik beserta tech stack dan tautannya, sehingga saya dapat menilai pengalaman dan hasil karya teknis Pemilik.

#### Acceptance Criteria

1. WHEN Pengunjung melihat Bagian_Proyek, THE Portfolio_Website SHALL mengambil data proyek Pemilik dari Basis_Data melalui Supabase API secara runtime dari peramban Pengunjung.
2. WHILE pengambilan data proyek dari Basis_Data belum selesai, THE Portfolio_Website SHALL menampilkan State_Pemuatan berupa indikator pemuatan pada Bagian_Proyek.
3. WHEN pengambilan data proyek dari Basis_Data berhasil, THE Portfolio_Website SHALL menampilkan setiap proyek dengan judul (maksimum 100 karakter), deskripsi singkat (maksimum 300 karakter), dan gambar pratinjau dari URL gambar eksternal dalam waktu maksimum 3 detik sejak data proyek diterima.
4. THE Portfolio_Website SHALL menampilkan daftar teknologi (tech stack) yang digunakan setiap proyek dalam bentuk tag teks.
5. THE Portfolio_Website SHALL menampilkan tautan menuju repositori GitHub untuk setiap proyek.
6. WHERE sebuah proyek memiliki tautan demo langsung (live demo), THE Portfolio_Website SHALL menampilkan tautan demo langsung untuk proyek tersebut.
7. WHEN Pengunjung memilih tautan repositori GitHub atau tautan demo langsung sebuah proyek, THE Portfolio_Website SHALL membuka tautan tujuan pada tab peramban baru.
8. IF pengambilan data proyek dari Basis_Data berhasil dan tidak memuat satu pun proyek, THEN THE Portfolio_Website SHALL menampilkan pesan yang mengindikasikan bahwa belum ada proyek yang ditampilkan.
9. IF pengambilan data proyek dari Basis_Data gagal, THEN THE Portfolio_Website SHALL menampilkan State_Kesalahan berupa pesan kesalahan beserta kontrol untuk mencoba kembali pada Bagian_Proyek tanpa menghentikan tampilan bagian lain pada halaman.
10. IF gambar pratinjau sebuah proyek gagal dimuat dari URL gambar eksternal, THEN THE Portfolio_Website SHALL menampilkan gambar pengganti (placeholder) dan tetap menampilkan proyek lainnya tanpa terganggu.

### Requirement 4: Keamanan Akses Data Supabase

**User Story:** Sebagai Pemilik, saya ingin akses peramban ke Basis_Data dibatasi sesuai peran, sehingga klien publik hanya dapat membaca data publik sementara hanya Pemilik yang terautentikasi yang dapat mengubah data, tanpa membuka risiko penulisan oleh anonim atau kebocoran kredensial rahasia.

#### Acceptance Criteria

1. WHEN Portfolio_Website mengakses Supabase API dari peramban Pengunjung untuk menampilkan Bagian_Tentang, Bagian_Keahlian, Bagian_Proyek, atau Bagian_Riwayat, THE Portfolio_Website SHALL menggunakan Kunci_Anon publik untuk autentikasi permintaan.
2. THE Basis_Data SHALL menerapkan RLS yang mengizinkan klien Kunci_Anon hanya melakukan operasi baca (read-only) terhadap data profil/Bagian_Tentang, data keahlian, data proyek, dan data riwayat/Bagian_Riwayat yang ditandai dapat dibaca publik.
3. IF klien peramban yang menggunakan Kunci_Anon mengirim permintaan tulis, perbarui, atau hapus terhadap data profil/Bagian_Tentang, data keahlian, data proyek, atau data riwayat/Bagian_Riwayat, THEN THE Basis_Data SHALL menolak permintaan tersebut melalui RLS.
4. WHILE Sesi_Autentikasi Pemilik valid, THE Basis_Data SHALL mengizinkan operasi tulis, perbarui, dan hapus terhadap data profil/Bagian_Tentang, data keahlian, data proyek, dan data riwayat/Bagian_Riwayat melalui RLS yang membatasi operasi tersebut hanya untuk Pemilik yang terautentikasi melalui Supabase_Auth.
5. IF permintaan tulis, perbarui, atau hapus terhadap data profil/Bagian_Tentang, data keahlian, data proyek, atau data riwayat/Bagian_Riwayat berasal dari klien tanpa Sesi_Autentikasi yang valid, THEN THE Basis_Data SHALL menolak permintaan tersebut melalui RLS.
6. THE Portfolio_Website SHALL mengecualikan kunci service-role atau kunci rahasia Supabase apa pun dari Build_Statis dan dari kode yang dieksekusi di peramban Pengunjung.

### Requirement 5: Navigasi Antar Bagian

**User Story:** Sebagai Pengunjung, saya ingin berpindah antar bagian dengan mudah, sehingga saya dapat menemukan informasi yang saya cari dengan cepat.

#### Acceptance Criteria

1. THE Portfolio_Website SHALL menampilkan Menu_Navigasi yang berisi tepat lima tautan menuju Bagian_Tentang, Bagian_Keahlian, Bagian_Proyek, Bagian_Riwayat, dan Bagian_Kontak.
2. WHEN Pengunjung memilih sebuah tautan pada Menu_Navigasi, THE Portfolio_Website SHALL menggulir tampilan menuju bagian yang dipilih hingga bagian tersebut berada pada bagian atas viewport dalam waktu paling lama 1 detik.
3. WHILE Pengunjung menggulir halaman, THE Portfolio_Website SHALL menjaga Menu_Navigasi tetap terlihat pada bagian atas tampilan.
4. WHEN Pengunjung memilih sebuah tautan pada Menu_Navigasi, THE Portfolio_Website SHALL menandai tautan tersebut sebagai tautan aktif.
5. WHILE Pengunjung menggulir halaman, THE Portfolio_Website SHALL menandai tautan pada Menu_Navigasi yang sesuai dengan bagian yang sedang ditampilkan sebagai tautan aktif.

### Requirement 6: Kontak melalui Mailto

**User Story:** Sebagai Pengunjung, saya ingin menghubungi Pemilik melalui email, sehingga saya dapat menjalin komunikasi tanpa proses pengiriman formulir ke server.

#### Acceptance Criteria

1. THE Portfolio_Website SHALL menampilkan Bagian_Kontak yang memuat alamat email Pemilik dan sebuah Tautan_Mailto yang teralamat ke email Pemilik.
2. WHEN Pengunjung mengaktifkan Tautan_Mailto pada Bagian_Kontak, THE Portfolio_Website SHALL membuka klien email bawaan Pengunjung dengan kolom penerima telah terisi alamat email Pemilik.
3. WHERE Pemilik menyediakan tautan media profesional seperti GitHub atau LinkedIn, THE Portfolio_Website SHALL menampilkan tautan tersebut pada Bagian_Kontak.
4. WHEN Pengunjung memilih sebuah tautan media profesional pada Bagian_Kontak, THE Portfolio_Website SHALL membuka tautan tujuan pada tab peramban baru.

### Requirement 7: Tampilan Responsif

**User Story:** Sebagai Pengunjung, saya ingin mengakses website dari berbagai ukuran layar pada ponsel, tablet, dan desktop, sehingga saya mendapatkan tampilan yang nyaman di setiap kelas perangkat.

#### Acceptance Criteria

1. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar 320 piksel sampai kurang dari 768 piksel (kelas perangkat ponsel), THE Portfolio_Website SHALL menampilkan tata letak satu kolom.
2. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar 768 piksel sampai kurang dari 1024 piksel (kelas perangkat tablet), THE Portfolio_Website SHALL menampilkan tata letak ringkas dengan minimal dua kolom.
3. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar 1024 piksel atau lebih (kelas perangkat desktop), THE Portfolio_Website SHALL menampilkan tata letak penuh dengan minimal dua kolom.
4. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar 1440 piksel atau lebih, THE Portfolio_Website SHALL membatasi lebar konten pada lebar maksimum tetap dan memusatkan konten secara horizontal pada viewport.
5. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar kurang dari 768 piksel, THE Portfolio_Website SHALL menampilkan Menu_Navigasi dalam bentuk menu yang dapat dibuka dan ditutup dengan kondisi awal tertutup.
6. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar 768 piksel atau lebih, THE Portfolio_Website SHALL menampilkan seluruh tautan Menu_Navigasi secara penuh tanpa kontrol buka/tutup.
7. WHEN Pengunjung mengetuk kontrol buka/tutup Menu_Navigasi pada layar dengan lebar kurang dari 768 piksel, THE Portfolio_Website SHALL mengubah kondisi Menu_Navigasi antara terbuka dan tertutup dalam waktu paling lama 1 detik.
8. WHILE Pengunjung mengakses Portfolio_Website dari layar dengan lebar minimal 320 piksel, THE Portfolio_Website SHALL menampilkan konten tanpa menimbulkan gulir horizontal.
9. WHILE Pengunjung mengakses Halaman_Admin pada rute `/admin` dari layar dengan lebar minimal 320 piksel pada kelas perangkat ponsel (320 sampai kurang dari 768 piksel), tablet (768 sampai kurang dari 1024 piksel), maupun desktop (1024 piksel atau lebih), THE Halaman_Admin SHALL menyesuaikan tata letak kontrol dan konten administrasi terhadap lebar layar tanpa menimbulkan gulir horizontal.

### Requirement 8: Penyajian melalui Apache di VPS

**User Story:** Sebagai Pemilik, saya ingin website dilayani oleh Apache di VPS, sehingga website dapat diakses publik melalui internet.

#### Acceptance Criteria

1. WHEN Pengunjung mengakses Portfolio_Website melalui Alamat_IP_VPS dengan HTTP, THE Apache_Server SHALL mengembalikan berkas halaman utama Portfolio_Website dengan kode status HTTP 200 dalam waktu paling lama 3 detik untuk ukuran berkas hingga 5 MB pada kondisi koneksi normal.
2. WHEN Pengunjung mengakses sebuah URL yang tidak memiliki berkas yang sesuai, THE Apache_Server SHALL mengembalikan halaman kesalahan dengan kode status HTTP 404 yang memuat indikasi bahwa sumber daya tidak ditemukan.
3. THE Apache_Server SHALL melayani Build_Statis Portfolio_Website dari direktori root dokumen yang telah dikonfigurasi pada VPS untuk setiap permintaan yang sumber dayanya tersedia di direktori tersebut.
4. WHERE konfigurasi kompresi diaktifkan, THE Apache_Server SHALL mengirim berkas teks (HTML, CSS, dan JavaScript) berukuran minimal 1 KB dalam bentuk terkompresi kepada Pengunjung yang klien-nya menyatakan dukungan kompresi.
5. IF Apache_Server tidak dapat memproses permintaan karena kegagalan internal, THEN THE Apache_Server SHALL mengembalikan halaman kesalahan dengan kode status HTTP 5xx tanpa mengubah Build_Statis Portfolio_Website pada VPS.
6. WHILE Apache_Server menerima hingga 50 permintaan serentak, THE Apache_Server SHALL melayani setiap permintaan yang sumber dayanya tersedia dengan kode status HTTP 200.

### Requirement 9: Akses melalui HTTP pada Fase Awal dan HTTPS sebagai Kebutuhan Mendatang

**User Story:** Sebagai Pemilik, saya ingin website dapat diakses melalui Alamat_IP_VPS pada fase awal dan siap dialihkan ke HTTPS setelah domain tersedia, sehingga website tetap dapat diakses sekarang dan tetap aman di kemudian hari.

#### Acceptance Criteria

1. WHILE domain belum dikonfigurasi, THE Apache_Server SHALL menyajikan Portfolio_Website melalui HTTP yang diakses menggunakan Alamat_IP_VPS.
2. WHEN Pengunjung mengakses Portfolio_Website melalui Alamat_IP_VPS dengan HTTP pada fase awal, THE Apache_Server SHALL menyajikan seluruh konten (HTML, CSS, JavaScript, dan gambar) tanpa mengarahkan permintaan ke HTTPS.
3. WHERE domain telah dikonfigurasi, THE Apache_Server SHALL menyajikan Portfolio_Website melalui koneksi terenkripsi TLS menggunakan sertifikat yang valid.

### Requirement 10: Deployment Otomatis melalui GitHub Actions

**User Story:** Sebagai Pemilik, saya ingin perubahan kode yang di-push ke Repositori_Git secara otomatis di-build dan disebarkan ke VPS melalui GitHub Actions, sehingga konten terbaru dapat diakses Pengunjung tanpa langkah manual.

#### Acceptance Criteria

1. WHEN perubahan di-push ke Repositori_Git pada GitHub, THE Pipeline_CICD SHALL menjalankan build proyek Astro melalui GitHub Actions untuk menghasilkan Build_Statis.
2. WHEN build Astro selesai tanpa kesalahan, THE Pipeline_CICD SHALL menyalin seluruh Build_Statis ke direktori root dokumen Apache_Server pada VPS dalam waktu maksimum 300 detik.
3. WHEN Pipeline_CICD selesai menyalin berkas, THE Pipeline_CICD SHALL memverifikasi bahwa jumlah berkas dan ukuran total berkas yang disalin sama dengan Build_Statis sumber sebelum menandai deployment berhasil.
4. WHEN Pipeline_CICD selesai tanpa kesalahan, THE Apache_Server SHALL menyajikan versi Build_Statis Portfolio_Website yang terbaru kepada Pengunjung dalam waktu maksimum 5 detik setelah Pipeline_CICD selesai.
5. IF build Astro gagal, THEN THE Pipeline_CICD SHALL menghentikan langkah deployment, mempertahankan versi Portfolio_Website sebelumnya pada Apache_Server, dan menampilkan pesan kesalahan yang menjelaskan penyebab kegagalan build.
6. IF Pipeline_CICD gagal menyalin satu atau lebih berkas, THEN THE Pipeline_CICD SHALL menghentikan langkah berikutnya, mempertahankan versi Portfolio_Website sebelumnya pada Apache_Server, dan menampilkan pesan kesalahan yang menjelaskan penyebab kegagalan.
7. IF durasi Pipeline_CICD melebihi 300 detik, THEN THE Pipeline_CICD SHALL membatalkan operasi, mempertahankan versi Portfolio_Website sebelumnya pada Apache_Server, dan menampilkan pesan kesalahan yang mengindikasikan terjadinya batas waktu terlampaui.

### Requirement 11: Autentikasi Halaman Admin

**User Story:** Sebagai Pemilik, saya ingin mengakses Halaman_Admin hanya setelah login dengan email dan kata sandi, sehingga pengelolaan konten terlindungi dari akses pihak yang tidak berwenang.

#### Acceptance Criteria

1. WHEN pengunjung tanpa Sesi_Autentikasi yang valid mengakses rute `/admin`, THE Halaman_Admin SHALL mengarahkan pengunjung tersebut ke tampilan login serta menyembunyikan seluruh kontrol administrasi dan fungsi pengelolaan konten.
2. WHEN Pemilik mengirim email dan kata sandi yang valid pada tampilan login, THE Halaman_Admin SHALL melakukan autentikasi melalui Supabase_Auth dan memberikan akses ke Halaman_Admin.
3. IF email atau kata sandi yang dikirim pada tampilan login tidak valid, THEN THE Halaman_Admin SHALL menampilkan pesan kesalahan autentikasi dan menolak akses ke Halaman_Admin.
4. THE Halaman_Admin SHALL menyediakan aksi logout yang mengakhiri Sesi_Autentikasi Pemilik.
5. WHEN Pemilik mengaktifkan aksi logout, THE Halaman_Admin SHALL mengakhiri Sesi_Autentikasi dan mengarahkan akses berikutnya ke rute `/admin` menuju tampilan login.
6. WHILE Sesi_Autentikasi Pemilik valid, THE Halaman_Admin SHALL mempertahankan Pemilik dalam keadaan terautentikasi tanpa meminta login ulang.
7. IF Sesi_Autentikasi tidak ada atau telah kedaluwarsa, THEN THE Halaman_Admin SHALL memperlakukan akses ke rute `/admin` sebagai tidak terautentikasi dan mengarahkannya ke tampilan login.

### Requirement 12: Manajemen Proyek melalui Halaman Admin

**User Story:** Sebagai Pemilik, saya ingin membuat, menyunting, dan menghapus proyek melalui Halaman_Admin, sehingga konten Bagian_Proyek dapat dikelola tanpa mengakses Basis_Data secara langsung.

#### Acceptance Criteria

1. WHILE Sesi_Autentikasi Pemilik valid, THE Halaman_Admin SHALL menyediakan fungsi untuk membuat, menyunting, dan menghapus proyek.
2. THE Halaman_Admin SHALL menyediakan kolom isian proyek berupa judul (wajib, maksimum 100 karakter), deskripsi singkat (wajib, maksimum 300 karakter), daftar teknologi (tech stack) berupa tag, tautan repositori GitHub (wajib), tautan demo langsung (opsional), dan URL gambar pratinjau berupa tautan gambar eksternal yang dimasukkan sebagai teks tanpa unggah berkas (opsional).
3. IF Pemilik menyimpan proyek dengan satu atau lebih kolom wajib (judul, deskripsi singkat, atau tautan repositori GitHub) belum terisi, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi yang menunjukkan kolom wajib yang belum terisi.
4. IF Pemilik mengisi URL gambar pratinjau dengan teks yang bukan merupakan URL yang sah, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi pada kolom URL gambar pratinjau.
5. WHEN Pemilik menyimpan proyek dengan seluruh kolom wajib terisi, THE Halaman_Admin SHALL menyimpan perubahan tersebut ke Basis_Data Supabase dan menampilkan konfirmasi keberhasilan.
6. WHEN penyimpanan proyek ke Basis_Data berhasil, THE Portfolio_Website SHALL mencerminkan perubahan tersebut pada Bagian_Proyek publik pada pemuatan data berikutnya.
7. WHEN Pemilik menghapus sebuah proyek, THE Halaman_Admin SHALL menghapus proyek tersebut dari Basis_Data dan menampilkan konfirmasi keberhasilan.
8. IF operasi tulis, perbarui, atau hapus proyek ke Basis_Data gagal, THEN THE Halaman_Admin SHALL menampilkan pesan kesalahan dan mempertahankan data proyek sebelumnya tanpa perubahan.

### Requirement 13: Manajemen Keahlian melalui Halaman Admin

**User Story:** Sebagai Pemilik, saya ingin membuat, menyunting, dan menghapus keahlian melalui Halaman_Admin, sehingga konten Bagian_Keahlian dapat dikelola tanpa mengakses Basis_Data secara langsung.

#### Acceptance Criteria

1. WHILE Sesi_Autentikasi Pemilik valid, THE Halaman_Admin SHALL menyediakan fungsi untuk membuat, menyunting, dan menghapus keahlian.
2. THE Halaman_Admin SHALL menyediakan kolom isian keahlian berupa nama keahlian (wajib), kategori (bahasa pemrograman, framework, atau tools), dan tingkat penguasaan (opsional) pada skala diskret dengan nilai minimum 1 dan nilai maksimum 5.
3. IF Pemilik menyimpan keahlian dengan kolom wajib (nama keahlian atau kategori) belum terisi, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi yang menunjukkan kolom wajib yang belum terisi.
4. WHEN Pemilik menyimpan keahlian dengan seluruh kolom wajib terisi, THE Halaman_Admin SHALL menyimpan perubahan tersebut ke Basis_Data Supabase dan menampilkan konfirmasi keberhasilan.
5. WHEN penyimpanan keahlian ke Basis_Data berhasil, THE Portfolio_Website SHALL mencerminkan perubahan tersebut pada Bagian_Keahlian publik pada pemuatan data berikutnya.
6. WHEN Pemilik menghapus sebuah keahlian, THE Halaman_Admin SHALL menghapus keahlian tersebut dari Basis_Data dan menampilkan konfirmasi keberhasilan.
7. IF operasi tulis, perbarui, atau hapus keahlian ke Basis_Data gagal, THEN THE Halaman_Admin SHALL menampilkan pesan kesalahan dan mempertahankan data keahlian sebelumnya tanpa perubahan.

### Requirement 14: Manajemen Profil/Bagian Tentang melalui Halaman Admin

**User Story:** Sebagai Pemilik, saya ingin menyunting konten Bagian_Tentang melalui Halaman_Admin, sehingga profil yang ditampilkan dapat diperbarui tanpa mengakses Basis_Data secara langsung.

#### Acceptance Criteria

1. WHILE Sesi_Autentikasi Pemilik valid, THE Halaman_Admin SHALL menyediakan fungsi untuk menyunting satu rekaman profil Bagian_Tentang yang memuat nama Pemilik, URL foto profil, dan deskripsi singkat.
2. THE Halaman_Admin SHALL menyediakan kolom isian profil berupa nama (wajib), URL foto profil berupa tautan gambar eksternal yang dimasukkan sebagai teks tanpa unggah berkas (opsional), dan deskripsi singkat (wajib, maksimum 500 karakter).
3. IF Pemilik menyimpan profil dengan satu atau lebih kolom wajib (nama atau deskripsi singkat) belum terisi, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi yang menunjukkan kolom wajib yang belum terisi.
4. IF Pemilik mengisi URL foto profil dengan teks yang bukan merupakan URL yang sah, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi pada kolom URL foto profil.
5. WHEN Pemilik menyimpan profil dengan seluruh kolom wajib terisi, THE Halaman_Admin SHALL menyimpan perubahan tersebut ke Basis_Data Supabase sebagai pembaruan rekaman profil dan menampilkan konfirmasi keberhasilan.
6. WHEN penyimpanan profil ke Basis_Data berhasil, THE Portfolio_Website SHALL mencerminkan perubahan tersebut pada Bagian_Tentang publik pada pemuatan data berikutnya.
7. IF operasi perbarui profil ke Basis_Data gagal, THEN THE Halaman_Admin SHALL menampilkan pesan kesalahan dan mempertahankan data profil sebelumnya tanpa perubahan.

### Requirement 15: Menampilkan Bagian Riwayat

**User Story:** Sebagai Pengunjung, saya ingin melihat linimasa riwayat pengalaman kerja dan pendidikan Pemilik, sehingga saya dapat memahami perjalanan profesional dan latar belakang akademik Pemilik.

#### Acceptance Criteria

1. WHEN Pengunjung melihat Bagian_Riwayat, THE Portfolio_Website SHALL mengambil data riwayat pengalaman dan pendidikan Pemilik dari Basis_Data melalui Supabase API secara runtime dari peramban Pengunjung.
2. WHILE pengambilan data riwayat dari Basis_Data belum selesai, THE Portfolio_Website SHALL menampilkan State_Pemuatan berupa indikator pemuatan pada Bagian_Riwayat.
3. WHEN pengambilan data riwayat dari Basis_Data berhasil, THE Portfolio_Website SHALL menampilkan Bagian_Riwayat sebagai linimasa dengan setiap entri memuat posisi/gelar sebagai judul, instansi/institusi, periode berupa tanggal mulai dan tanggal selesai, serta deskripsi opsional bila tersedia.
4. WHERE sebuah entri riwayat tidak memiliki tanggal selesai, THE Portfolio_Website SHALL menampilkan periode entri tersebut dengan keterangan "sekarang" untuk menandai bahwa entri sedang berjalan.
5. THE Portfolio_Website SHALL menampilkan entri riwayat pada Bagian_Riwayat secara kronologis dengan urutan tanggal mulai dari yang paling baru ke yang paling lama.
6. IF pengambilan data riwayat dari Basis_Data berhasil dan tidak memuat satu pun entri, THEN THE Portfolio_Website SHALL menampilkan pesan yang mengindikasikan bahwa belum ada riwayat yang tersedia.
7. IF pengambilan data riwayat dari Basis_Data gagal, THEN THE Portfolio_Website SHALL menampilkan State_Kesalahan berupa pesan kesalahan beserta kontrol untuk mencoba kembali pada Bagian_Riwayat tanpa menghentikan tampilan bagian lain pada halaman.

### Requirement 16: Manajemen Riwayat melalui Halaman Admin

**User Story:** Sebagai Pemilik, saya ingin membuat, menyunting, dan menghapus entri riwayat pengalaman dan pendidikan melalui Halaman_Admin, sehingga konten Bagian_Riwayat dapat dikelola tanpa mengakses Basis_Data secara langsung.

#### Acceptance Criteria

1. WHILE Sesi_Autentikasi Pemilik valid, THE Halaman_Admin SHALL menyediakan fungsi untuk membuat, menyunting, dan menghapus entri riwayat.
2. THE Halaman_Admin SHALL menyediakan kolom isian entri riwayat berupa posisi/gelar (wajib), instansi/institusi (wajib), tanggal mulai (wajib), tanggal selesai (opsional; jika kosong dianggap "sekarang"/sedang berjalan), dan deskripsi (opsional).
3. IF Pemilik menyimpan entri riwayat dengan satu atau lebih kolom wajib (posisi/gelar, instansi/institusi, atau tanggal mulai) belum terisi, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi yang menunjukkan kolom wajib yang belum terisi.
4. IF Pemilik mengisi tanggal selesai dengan nilai yang lebih awal dari tanggal mulai, THEN THE Halaman_Admin SHALL membatalkan penyimpanan dan menampilkan pesan validasi pada kolom tanggal selesai.
5. WHEN Pemilik menyimpan entri riwayat dengan seluruh kolom wajib terisi, THE Halaman_Admin SHALL menyimpan perubahan tersebut ke Basis_Data Supabase dan menampilkan konfirmasi keberhasilan.
6. WHEN penyimpanan entri riwayat ke Basis_Data berhasil, THE Portfolio_Website SHALL mencerminkan perubahan tersebut pada Bagian_Riwayat publik pada pemuatan data berikutnya.
7. WHEN Pemilik menghapus sebuah entri riwayat, THE Halaman_Admin SHALL menghapus entri tersebut dari Basis_Data dan menampilkan konfirmasi keberhasilan.
8. IF operasi tulis, perbarui, atau hapus entri riwayat ke Basis_Data gagal, THEN THE Halaman_Admin SHALL menampilkan pesan kesalahan dan mempertahankan data riwayat sebelumnya tanpa perubahan.

### Requirement 17: Mode Terang dan Gelap

**User Story:** Sebagai Pengunjung, saya ingin mengalihkan tampilan website antara mode terang dan gelap serta preferensi saya diingat, sehingga saya dapat membaca konten dengan nyaman sesuai preferensi dan kondisi pencahayaan saya.

#### Acceptance Criteria

1. THE Portfolio_Website SHALL menampilkan Kontrol_Tema yang memungkinkan Pengunjung mengalihkan Mode_Tema antara terang dan gelap.
2. WHEN Pengunjung mengakses Portfolio_Website untuk pertama kali tanpa preferensi Mode_Tema yang tersimpan di peramban, THE Portfolio_Website SHALL menetapkan Mode_Tema awal sesuai preferensi sistem operasi atau peramban Pengunjung yang dinyatakan melalui `prefers-color-scheme`.
3. WHEN Pengunjung mengaktifkan Kontrol_Tema, THE Portfolio_Website SHALL mengalihkan Mode_Tema dan menerapkan tema yang dipilih pada seluruh bagian dalam waktu paling lama 1 detik.
4. WHEN Pengunjung mengalihkan Mode_Tema melalui Kontrol_Tema, THE Portfolio_Website SHALL menyimpan preferensi Mode_Tema yang dipilih di peramban Pengunjung melalui localStorage.
5. WHEN Pengunjung membuka kembali atau memuat ulang Portfolio_Website dan terdapat preferensi Mode_Tema yang tersimpan di peramban, THE Portfolio_Website SHALL menerapkan Mode_Tema yang tersimpan tersebut.
6. THE Portfolio_Website SHALL menampilkan seluruh bagian dan teks dengan rasio kontras minimal 4,5:1 antara teks dan latar belakangnya pada Mode_Tema terang maupun gelap.

### Requirement 18: SEO dan Meta Tag Open Graph

**User Story:** Sebagai Pemilik, saya ingin website menyertakan Meta_Tag SEO dan Open_Graph, sehingga tautan website tampil dengan judul, deskripsi, dan gambar pratinjau yang baik di mesin pencari maupun platform sosial.

#### Acceptance Criteria

1. THE Portfolio_Website SHALL menyertakan judul halaman (title) dan deskripsi (meta description) pada bagian head dokumen HTML Build_Statis.
2. THE Portfolio_Website SHALL menyertakan Meta_Tag Open_Graph berupa og:title, og:description, og:image, dan og:url pada bagian head dokumen HTML Build_Statis.
3. THE Portfolio_Website SHALL menyertakan Meta_Tag Twitter card sehingga tautan menampilkan judul, deskripsi, dan gambar pratinjau ketika dibagikan ke platform sosial.
4. THE Portfolio_Website SHALL merujuk og:image melalui URL gambar eksternal yang dimasukkan sebagai teks, konsisten dengan pendekatan rujukan gambar melalui URL eksternal.
5. WHERE sebuah nilai meta dikonfigurasi, THE Portfolio_Website SHALL merender Meta_Tag yang bersesuaian pada bagian head dokumen Build_Statis.
6. THE Portfolio_Website SHALL menyertakan favicon pada bagian head dokumen HTML Build_Statis.
