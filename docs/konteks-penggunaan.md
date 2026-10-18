# Konteks Penggunaan Aplikasi

Dokumen ini merangkum konteks kerja dan kebutuhan aplikasi untuk madrasah. Dokumen masih berupa draf, tetapi dapat digunakan sebagai konteks pengembangan dengan memperhatikan label status di bawah.

- **DIKONFIRMASI**: fakta atau keputusan yang sudah disampaikan pengguna.
- **PERLU KLARIFIKASI**: belum menjadi aturan final; jangan menganggapnya sebagai keputusan.
- **USULAN**: rekomendasi untuk didiskusikan, belum disetujui.
- **DI LUAR MVP**: secara eksplisit tidak termasuk target MVP saat ini.
- **DITUNDA**: belum menjadi fokus saat ini dan dapat dibahas kemudian.

Admin aplikasi memperbarui konteks berdasarkan masukan pengguna sesuai peran dan tanggung jawabnya. Jika keputusan berubah, perbarui bagian terkait dan label statusnya.

## 1. Tujuan dan batas konteks

Aplikasi mendukung pencatatan kegiatan pembelajaran, kehadiran dan perkembangan murid, serta tindak lanjut perilaku. Pembagian peran dan tugas di madrasah merupakan kondisi nyata. Pemetaan tugas tersebut ke fitur dan hak akses aplikasi masih perlu divalidasi bersama pengguna.

## 2. Lingkungan madrasah dan pengguna

### 2.1 Skala

- **DIKONFIRMASI**: pengguna terdiri dari sekitar 50 guru dan sekitar 900 murid. Angka tersebut adalah pembulatan dari jumlah sebenarnya.
- **DIKONFIRMASI**: murid berada di jenjang 7, 8, dan 9; setiap jenjang memiliki 9 kelas, sehingga terdapat 27 kelas.
- **DIKONFIRMASI**: pada setiap jam pelajaran sekitar 27 guru mata pelajaran menggunakan aplikasi.

### 2.2 Pengguna dan perangkat

- Pengguna dapat berperan sebagai guru mata pelajaran, wali kelas, guru BK, guru piket, pembina ekstrakurikuler, waka kurikulum, waka kesiswaan, guru tahfizh, kepala madrasah (kamad), atau admin aplikasi.
- **DIKONFIRMASI**: seorang guru dapat memiliki beberapa peran aktif sekaligus.
- **DIKONFIRMASI**: admin aplikasi ada; admin memperbarui konteks berdasarkan masukan pengguna.
- **DIKONFIRMASI**: rentang usia dan kecakapan digital pengguna beragam. Sebagai patokan desain yang aman, aplikasi perlu mudah digunakan oleh guru berusia di atas 45 tahun dengan kecakapan menggunakan aplikasi yang rendah.
- **DIKONFIRMASI**: perangkat utama adalah ponsel atau tablet Android; laptop digunakan lebih terbatas. Koneksi seluler umum digunakan.
- **DIKONFIRMASI**: aplikasi digunakan setiap hari sekolah. Guru BK cenderung menggunakannya sepanjang hari, terutama untuk penanganan kasus; peran lain menggunakannya sesuai tugas dan kebutuhan.

### 2.3 Hari dan waktu sekolah

- **DIKONFIRMASI**: hari sekolah adalah Senin-Sabtu.
- **DIKONFIRMASI**: waktu sekolah umumnya pukul 07.30-14.30 WIT; khusus Jumat pukul 07.30-12.00 WIT.
- **DIKONFIRMASI**: jadwal belajar menggunakan jam pelajaran berdurasi 40 menit: 8 jam pelajaran pada hari biasa dan 6 jam pada Jumat.
- **DIKONFIRMASI**: tidak ada batasan waktu untuk mengisi data; aturan batas waktu perubahan jurnal dapat ditetapkan admin.
- **DITUNDA**: jadwal dapat berubah saat ujian dan Ramadan. Penanganan kalender khusus tersebut tidak perlu menjadi fokus saat ini.

## 3. Peran dan cakupan akses

### 3.1 Prinsip akses

- **DIKONFIRMASI**: satu pengguna dapat memiliki beberapa peran aktif.
- **DIKONFIRMASI**: cakupan kelas, mata pelajaran, dan murid ditentukan dari kombinasi peran dan penugasan pengguna.
- **PERLU KLARIFIKASI**: aturan ketika beberapa peran memberi hak akses berbeda, serta sumber data penugasan yang menjadi acuan final.
- **PERLU KLARIFIKASI**: matriks hak lihat, tambah, ubah, hapus, dan tindak lanjut per peran. Daftar di bawah adalah rancangan berdasarkan tugas yang selama ini dilakukan secara manual, bukan matriks izin final.

### 3.2 Pemetaan peran awal

| Peran | Kebutuhan aplikasi yang tergambar dalam draf | Status |
| --- | --- | --- |
| Guru mata pelajaran | Membuat jurnal; melihat rekap jurnal sendiri dan informasi kehadiran; memasukkan catatan perilaku; melaporkan perilaku positif dan negatif; melihat informasi akademik murid pada kelas yang diajar. | PERLU KLARIFIKASI hak akses final |
| Wali kelas | Melihat kehadiran harian dan jurnal guru pada kelas perwaliannya; memasukkan dan menangani catatan perilaku; melihat profil murid di kelas perwaliannya. | PERLU KLARIFIKASI hak akses final |
| Guru BK | Melihat profil murid; memasukkan dan menangani perilaku; mengelola penutupan/pembukaan kembali kasus; melihat rekap perilaku dan kehadiran global; menetapkan pembatasan akses kasus; memberi arahan penanganan khusus kepada guru terkait. | PERLU KLARIFIKASI cakupan akses dan alur |
| Waka kesiswaan | Melihat rekap perilaku dan kehadiran global serta profil murid. Draf awal menyebut aksesnya dapat mengesampingkan pembatasan BK. | PERLU KLARIFIKASI aturan override |
| Waka kurikulum | Melihat rekap jurnal secara global dan rekap kehadiran. | PERLU KLARIFIKASI hak akses final |
| Kamad | Draf awal mengusulkan akses yang dapat dilihat waka kesiswaan dan waka kurikulum. | PERLU KLARIFIKASI hak akses final |
| Guru piket | Menggunakan aplikasi pada hari sekolah. Draf lama menyebut fiturnya belum dimasukkan ke MVP. | PERLU KLARIFIKASI karena batas MVP belum konsisten |
| Guru tahfizh | Draf awal menyebut pengisian jurnal, pelaporan kasus, akses kasus yang dilaporkan, dan pencatatan kemajuan hafalan. | Fitur tahfizh DI LUAR MVP; hak akses peran ini PERLU KLARIFIKASI |
| Pembina ekstrakurikuler | Draf awal menyebut pencatatan prestasi murid. | DI LUAR MVP |
| Admin aplikasi | Ada admin aplikasi yang memperbarui konteks berdasarkan masukan pengguna. | PERLU KLARIFIKASI tugas administrasi dan izin data lainnya |

## 4. Fungsi dan batas MVP

### 4.1 Fungsi yang dibahas

Fungsi dalam draf mencakup jurnal mengajar, rekap jurnal, rekap kehadiran, catatan perilaku positif dan negatif, pelaporan serta tindak lanjut kasus, rekap kasus, dan profil murid.

- **DIKONFIRMASI**: tahfizh dan pencatatan prestasi ekstrakurikuler bukan target MVP.
- **PERLU KLARIFIKASI**: apakah fitur guru piket juga di luar MVP. Draf lama menyebut demikian, sementara batas MVP yang dijelaskan pengguna hanya secara eksplisit mengecualikan tahfizh dan prestasi ekstrakurikuler.
- **PERLU KLARIFIKASI**: status MVP untuk notifikasi, ekspor Excel/PDF, dan dukungan CRUD offline.
- **PERLU KLARIFIKASI**: apakah fitur nilai/pengerjaan tugas yang akan muncul di profil murid termasuk MVP atau hanya berasal dari sumber data lain.

### 4.2 Jurnal dan kehadiran

- **DIKONFIRMASI**: guru mata pelajaran pemilik jurnal dapat mengisi dan mengoreksi jurnal serta presensi.
- **DIKONFIRMASI**: jurnal yang sudah tersimpan dapat diubah atau dihapus tanpa batas waktu, kecuali admin menetapkan batasan.
- **DIKONFIRMASI**: penghapusan jurnal harus memakai konfirmasi berlapis.
- **DIKONFIRMASI**: jadwal guru pengganti dimasukkan secara manual.
- **DIKONFIRMASI**: perubahan jadwal dilakukan guru mata pelajaran atau admin di aplikasi/database.
- **DIKONFIRMASI**: kelas gabungan tidak relevan untuk konteks saat ini.
- **DIKONFIRMASI**: keterlambatan dan pulang awal dicatat secara manual melalui input perilaku oleh guru mata pelajaran atau wali kelas.
- **DIKONFIRMASI**: presensi yang salah dikoreksi oleh guru mata pelajaran.
- **PERLU KLARIFIKASI**: rincian tahap konfirmasi berlapis, batasan yang dapat diterapkan admin, dan apakah perubahan/penghapusan membutuhkan alasan.

### 4.3 Catatan perilaku dan kasus

- **DIKONFIRMASI**: catatan perilaku adalah deskripsi perilaku murid yang dimasukkan dan disimpan melalui aplikasi.
- **DIKONFIRMASI**: “pelanggaran” dan “kasus” dalam konteks saat ini sama-sama merujuk pada perilaku negatif.
- **DIKONFIRMASI**: penanganan berarti eskalasi atau tindak lanjut.
- **DIKONFIRMASI**: status yang digunakan saat ini adalah “Ditangani di Tempat”, “Diteruskan ke BK/Wali Kelas”, “Diproses”, dan “Selesai”. Status dapat berubah di kemudian hari.
- **DIKONFIRMASI**: catatan perilaku positif dipakai sebagai informasi profil murid dan tidak mengikuti alur kasus negatif.
- **DIKONFIRMASI**: informasi perilaku dapat dibatasi oleh BK; pembukaan, perubahan, penghapusan, dan override akses harus tercatat.
- **PERLU KLARIFIKASI**: arti operasional “dikonfirmasi BK” (misalnya validasi laporan, triase, atau penetapan kasus), penanggung jawab pada setiap status, syarat selesai, dan aturan membuka kembali kasus.
- **USULAN**: pisahkan cara penanganan (“Ditangani di Tempat” atau “Diteruskan”) dari status perjalanan kasus (“Baru”, “Ditugaskan”, “Diproses”, “Selesai”). Jika kasus dibuka kembali, catat alasan dan riwayat perubahan. Usulan ini belum menjadi keputusan.

### 4.4 Profil murid

- **DIKONFIRMASI**: istilah yang digunakan dalam konteks produk adalah **murid**, bukan siswa.
- Informasi yang direncanakan untuk profil:
  - Informasi dasar: nama, tempat/tanggal lahir, NISN, alamat, orang tua, nomor telepon murid, nomor telepon orang tua/darurat, dan hobi.
  - Presensi.
  - Pengerjaan tugas dan nilai.
  - Tahfizh dan kemampuan membaca Al-Qur'an.
  - Prestasi.
  - Kebutuhan khusus.
  - Catatan perilaku positif dan negatif.
  - Rekomendasi pembelajaran atau penanganan.
- **DIKONFIRMASI**: semua peran pada prinsipnya dapat melihat profil, dengan pembatasan informasi berdasarkan peran dan kewenangan.
- **DIKONFIRMASI**: informasi dasar yang dikecualikan diatur admin; informasi perilaku yang dikecualikan diatur BK.
- **PERLU KLARIFIKASI**: daftar bidang yang tampil pada MVP, sumber kebenaran tiap bidang, pemilik perubahan, dan aturan akses per bidang.
- **PERLU KLARIFIKASI**: draf menyebut pengubahan profil oleh BK dan wali kelas di kelas perwaliannya, tetapi jawaban pengguna menyebut BK dua kali. Peran ketiga yang dimaksud belum diketahui.
- **PERLU KLARIFIKASI**: apakah informasi tahfizh dan prestasi tetap ditampilkan di profil MVP jika tidak ada fitur inputnya, atau ditunda sepenuhnya bersama fiturnya.
- **PERLU KLARIFIKASI**: apakah catatan perilaku akan dipisahkan menjadi akademik dan nonakademik, serta dampaknya terhadap hak akses.
- **PERLU KLARIFIKASI**: cakupan penggunaan istilah “murid”. Usulan awal: konsisten pada teks antarmuka dan dokumentasi; nama kolom/database internal yang sudah ada tidak diubah kecuali ada kebutuhan teknis khusus.

## 5. Kebutuhan pengalaman penggunaan

- **DIKONFIRMASI**: aplikasi harus sederhana, memakai teks singkat dan ikon yang mudah dipahami, serta diutamakan untuk ponsel.
- **DIKONFIRMASI**: kurangi beban kognitif, kebosanan, dan kelelahan akibat terlalu banyak menggulir, mencari fitur, dan melakukan CRUD.
- **PERLU KLARIFIKASI**: masalah kerja manual mana yang paling penting untuk dikurangi dan bagaimana keberhasilan diukur. Contoh: waktu guru mengisi jurnal/presensi, keterlambatan mengetahui ketidakhadiran, lamanya tindak lanjut BK, atau waktu menyiapkan rekap pimpinan.

## 6. Kebutuhan offline dan sinkronisasi

- **DIKONFIRMASI sebagai kebutuhan**: pengguna perlu dapat melakukan CRUD dengan mudah meskipun jaringan bermasalah, tanpa merasa panik atau kehilangan pekerjaan; perubahan perlu disinkronkan ke Supabase saat tersedia koneksi.
- **KONDISI IMPLEMENTASI SAAT DOKUMEN DIPERBARUI**: service worker menggunakan strategi `NetworkFirst` untuk halaman awal dan `NetworkOnly` untuk rute GET lainnya. Belum ada implementasi CRUD lokal atau antrean sinkronisasi offline yang teridentifikasi. Cache halaman PWA saja tidak sama dengan penyimpanan data offline.
- **PERLU KLARIFIKASI**: modul dan tindakan yang wajib bekerja offline pada MVP; khususnya apakah offline mencakup pembuatan saja atau juga ubah/hapus data lama.
- **PERLU KLARIFIKASI**: aturan saat data di perangkat berbeda dari versi server, saat izin pengguna berubah, atau saat perangkat lama kembali online.
- **USULAN TEKNIS UNTUK DIDISKUSIKAN**:
  1. Simpan draft dan operasi tertunda di IndexedDB, dengan cakupan data lokal seminimal mungkin sesuai penugasan pengguna.
  2. Tampilkan status yang tegas, misalnya “tersimpan di perangkat”, “menunggu sinkronisasi”, “tersinkron”, atau “perlu tindakan”; jangan menyatakan tersimpan di server sebelum Supabase mengonfirmasi.
  3. Coba sinkronisasi saat aplikasi kembali aktif atau koneksi pulih. Background Sync dapat menjadi tambahan, bukan satu-satunya mekanisme, karena eksekusi latar bergantung pada browser/perangkat.
  4. Gunakan ID operasi idempoten, validasi dan pemeriksaan izin di server, serta tampilkan konflik/kegagalan untuk ditindaklanjuti; jangan menimpa perubahan diam-diam.
  5. Hindari menyimpan seluruh profil atau data sensitif di perangkat; tentukan juga perilaku saat logout, perangkat hilang, atau akses dicabut.
- Usulan ini bukan keputusan arsitektur final dan perlu disesuaikan dengan cakupan offline MVP.

## 7. Notifikasi, ekspor, dan sumber daya

- **PERLU KLARIFIKASI**: kejadian yang memicu notifikasi, penerima berdasarkan peran/penugasan, tingkat urgensi, serta batas informasi sensitif dalam notifikasi desktop/mobile.
- **PERLU KLARIFIKASI**: siapa yang boleh mengekspor data apa, format Excel/PDF, template, dan tujuan ekspor.
- **DIKONFIRMASI sebagai batasan umum**: optimalkan penggunaan kuota gratis Vercel dan Supabase. Penggunaan CDN tambahan pernah dipertimbangkan jika aplikasi menampung foto; keputusan dan kebutuhannya belum ditetapkan.

## 8. Privasi, keamanan, dan tata kelola

- **DIKONFIRMASI**: BK mengatur pengecualian akses informasi perilaku; tindakan pembukaan, perubahan, penghapusan, serta override akses harus tercatat.
- **PERLU KLARIFIKASI**: draf menyebut BK, wali kelas, waka kesiswaan, dan kamad sebagai pihak yang dapat membaca informasi kasus, tetapi juga mengusulkan BK menentukan apakah kasus rahasia sepenuhnya atau dibuka untuk peran tertentu. Aturan akses default, pengecualian, dan hak override belum diputuskan.
- **PERLU KLARIFIKASI**: apakah pelapor otomatis dapat melihat laporan yang dibuatnya dan perkembangannya.
- **PERLU KLARIFIKASI**: kebijakan keamanan, retensi, pencadangan, pemulihan, dan penghapusan data, terutama data kontak, kebutuhan khusus, serta perilaku murid.
- **PERLU KLARIFIKASI**: sumber kebijakan madrasah atau ketentuan lain yang harus menjadi acuan pengelolaan data.

## 9. Daftar klarifikasi prioritas

1. Pastikan status fitur guru piket, notifikasi, ekspor, dan offline dalam MVP.
2. Tetapkan akses default kasus, kewenangan BK, hak wali/pelapor, serta kondisi override waka kesiswaan dan kamad.
3. Definisikan arti konfirmasi BK dan alur kasus dari laporan sampai selesai/dibuka kembali.
4. Tetapkan bidang profil yang termasuk MVP, sumber datanya, siapa yang dapat mengubahnya, dan cakupan akses per bidang.
5. Jelaskan peran ketiga yang dimaksud dalam hak ubah profil; tetapkan apakah istilah “murid” hanya untuk antarmuka/dokumentasi atau juga nama internal data.
6. Tentukan cakupan offline MVP dan kebijakan konflik/sinkronisasi.
7. Putuskan minimum kebijakan keamanan, retensi, pencadangan, pemulihan, dan penghapusan sebelum data sensitif digunakan.
8. Identifikasi masalah kerja manual terpenting, pengguna yang terdampak, frekuensi/dampaknya, dan ukuran keberhasilan.

## 10. Hal yang sengaja ditunda

- Perubahan jadwal khusus ujian dan Ramadan tidak menjadi fokus saat ini.
- Fitur tahfizh dan pencatatan prestasi ekstrakurikuler bukan target MVP. Informasi terkait pada profil murid tetap perlu ditentukan apakah ditunda sepenuhnya atau ditampilkan dari sumber lain.