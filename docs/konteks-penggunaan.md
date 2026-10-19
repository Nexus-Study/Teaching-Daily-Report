# Konteks Penggunaan Aplikasi

Dokumen ini merangkum konteks kerja dan kebutuhan aplikasi untuk madrasah. Dokumen masih berupa draf, tetapi dapat digunakan sebagai konteks pengembangan dengan memperhatikan label status di bawah.

- **DIKONFIRMASI**: fakta atau keputusan yang sudah disampaikan pengguna.
- **RANCANGAN DOKUMEN**: detail kebutuhan/alur yang dijabarkan dalam dokumen pendukung; gunakan sebagai rancangan, bukan keputusan final kecuali sudah dikonfirmasi.
- **PERLU KLARIFIKASI**: belum menjadi aturan final; jangan menganggapnya sebagai keputusan.
- **USULAN**: rekomendasi untuk didiskusikan, belum disetujui.
- **DI LUAR MVP**: secara eksplisit tidak termasuk target MVP saat ini.
- **DITUNDA**: belum menjadi fokus saat ini dan dapat dibahas kemudian.

Admin aplikasi memperbarui konteks berdasarkan masukan pengguna sesuai peran dan tanggung jawabnya. Jika keputusan berubah, perbarui bagian terkait dan label statusnya.

Rincian rancangan perilaku dan profil juga tersedia di [konsep-penanganan-perilaku.md](./konsep-penanganan-perilaku.md) dan [profil-murid.md](./profil-murid.md). Jika rincian dokumen tersebut bertentangan dengan keputusan pengguna yang sudah dikonfirmasi, keputusan pengguna yang dikonfirmasi menjadi acuan dan konflik tetap dicatat.

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
- **DIKONFIRMASI**: BK mengatur pembatasan akses informasi perilaku. Pembukaan, perubahan, penghapusan, dan override akses harus tercatat.

#### Rancangan laporan negatif dan triase

- **RANCANGAN DOKUMEN**: guru mengirim **laporan insiden faktual** berstatus **Baru**; laporan tidak otomatis menjadi kasus konseling resmi. BK meninjau dan melakukan triase terlebih dahulu.
- **RANCANGAN DOKUMEN**: laporan insiden dan rekam kasus konseling merupakan dua jenis catatan/entitas terpisah. Rekam konseling menyimpan catatan internal BK, sedangkan laporan awal menyimpan fakta kejadian dari pelapor.
- **RANCANGAN DOKUMEN**: hasil triase dapat berupa:
  1. Ditangani di tempat dan laporan ditutup tanpa membuka kasus konseling.
  2. Diteruskan kepada wali kelas untuk tindak lanjut yang ditugaskan BK.
  3. Dibuat menjadi kasus konseling yang ditangani BK.
- **RANCANGAN DOKUMEN**: status kasus konseling yang diusulkan adalah **Baru → Ditugaskan → Diproses → Selesai**. “Ditangani di tempat” merupakan hasil penanganan/triase, bukan status tahap konseling.
- **DIKONFIRMASI**: rekam konseling internal BK terpisah dari laporan insiden dan dari catatan tindak lanjut wali kelas.
- **DIKONFIRMASI**: rekam konseling menggunakan editor rich-text bebas, bukan formulir dengan daftar field wajib yang sudah ditetapkan. Format bebas ini tidak dengan sendirinya menetapkan bahwa setiap jenis data sensitif harus dikumpulkan.
- **DIKONFIRMASI**: semua pengguna dengan peran Guru BK dapat membaca seluruh rekam konseling.
- **DIKONFIRMASI**: hanya Guru BK yang ditugaskan pada kasus dapat membuat atau mengubah rekam konseling kasus tersebut. Mekanisme dan sumber data penugasan konselor masih perlu ditetapkan.
- **DIKONFIRMASI**: wali kelas yang menerima penugasan dapat membuat dan mengubah catatan tindak lanjut pada kasus yang ditugaskan kepadanya. Catatan ini terpisah dari rekam konseling internal BK.
- **DIKONFIRMASI**: setelah kasus/tugas tindak lanjut dikembalikan kepada BK, wali kelas tetap dapat membaca tindak lanjut terkait tetapi tidak dapat menambah, mengubah, atau menghapusnya.
- **DIKONFIRMASI**: wali kelas yang masih memegang penugasan dapat menghapus catatan tindak lanjut dengan alasan. Isi yang dihapus tidak disimpan sebagai salinan; metadata tindakan dan alasan dicatat dalam audit.
- **DI LUAR MVP**: fitur analitik untuk mengembangkan rencana pencegahan atau metode penanganan bukan bagian dari aplikasi MVP.
- **RANCANGAN DOKUMEN**: wali kelas dapat mengembalikan/eskalasi penanganan ke BK dengan alasan dan membaca petunjuk penanganan kelas dari BK. Rincian transisi dan izin yang terkait masih perlu dipastikan.
- **PERLU KLARIFIKASI**: hubungan final antara status yang saat ini digunakan (termasuk “Diteruskan ke BK/Wali Kelas”) dan alur rancangan Baru/Ditugaskan/Diproses/Selesai. Belum diputuskan apakah akan mengganti status yang ada atau memisahkan status kasus dari jenis/rute penanganan.

#### Akses dan audit kasus

- **RANCANGAN DOKUMEN**: sebelum triase, laporan terlihat oleh pelapor dan BK. Pelapor dapat melihat laporan miliknya, status, dan petunjuk penanganan yang relevan, tetapi tidak melihat catatan konseling, informasi keluarga, atau analisis psikologis.
- **RANCANGAN DOKUMEN**: wali kelas hanya melihat laporan murid di kelas perwaliannya setelah triase atau ketika mendapat penugasan. Wali kelas dapat melihat petunjuk kelas dan mengirim perkembangan kepada BK, bukan rekam konseling.
- **DIKONFIRMASI**: seluruh pengguna berperan Guru BK dapat membaca rekam konseling; hanya BK yang ditugaskan pada kasus dapat membuat/mengubah rekam tersebut. Pemberian peran Guru BK kepada pengguna baru karena itu memberikan akses baca lintas kasus dan perlu ditinjau sebelum perubahan keanggotaan.
- **PERLU KLARIFIKASI**: sumber/penanggung jawab penugasan BK pada kasus dan bagaimana perubahan atau pencabutan penugasan berlaku.
- **PERLU KLARIFIKASI**: apakah wali kelas boleh membaca laporan insiden sebelum triase atau di luar penugasan, serta akses pelapor terhadap laporan dan perkembangannya.
- **RANCANGAN DOKUMEN**: waka kesiswaan/kamad mendapat ringkasan atau data agregat, bukan akses bebas ke detail konseling. Pembukaan darurat (*break-glass*) mensyaratkan alasan dan pencatatan permanen.
- **PERLU KLARIFIKASI**: akses detail rekam konseling bagi waka kesiswaan, kamad, admin teknis, dan peran selain Guru BK; rancangan ringkasan eksekutif atau akses darurat belum disetujui.
- **DIKONFIRMASI**: setiap pembacaan rekam konseling wajib dicatat dalam audit. Pencatatan audit juga mencakup pembukaan akses, perubahan, penghapusan, dan override.
- **PERLU KLARIFIKASI**: apakah aktivitas unduh data sensitif harus diaudit secara terpisah, serta masa retensi log dan pihak yang berwenang meninjaunya.
- **RANCANGAN DOKUMEN**: membuka kembali kasus selesai wajib disertai alasan dan masuk ke riwayat audit. Ketentuan minimal 20 karakter yang tertulis dalam dokumen desain belum dikonfirmasi.

#### Catatan perilaku positif

- **RANCANGAN DOKUMEN**: input positif dan negatif dapat memakai satu pintu/formulir dengan pilihan jenis, tetapi penyimpanan dan alur tindak lanjutnya dipisahkan.
- **DIKONFIRMASI**: catatan positif tidak melalui triase kasus dan berfungsi sebagai informasi profil.
- **RANCANGAN DOKUMEN**: catatan positif langsung masuk ke portofolio/profil; kategori contoh mencakup kepemimpinan, empati, kejujuran, dan inisiatif. Poin/badge, lampiran, pembatasan edit, soft-delete, dan hak hapus khusus yang disebut dalam dokumen sumber belum menjadi keputusan.

### 4.4 Profil murid

- **DIKONFIRMASI**: istilah yang digunakan dalam konteks produk adalah **murid**, bukan siswa.
- Informasi yang direncanakan pada profil meliputi data dasar/kontak, presensi, tugas/nilai, tahfizh dan kemampuan membaca Al-Qur'an, prestasi, kebutuhan khusus, perilaku positif/negatif, serta rekomendasi pembelajaran/penanganan. **Cakupan tiap bidang pada MVP ditentukan di bawah; daftar ini bukan berarti seluruh data harus tersedia saat MVP.**

#### Sumber data dan pengelolaan

| Informasi | Sumber/pengelola dalam dokumen profil | Status konteks |
| --- | --- | --- |
| Data induk, kontak darurat, dan kebutuhan khusus/medis | Admin/Tata Usaha atau basis data induk | **RANCANGAN DOKUMEN**; hak ubah dan sumber kebenaran perlu disepakati |
| Kehadiran | Jurnal guru mata pelajaran; agregat untuk profil | **RANCANGAN DOKUMEN**; selaras dengan fungsi jurnal yang telah dibahas |
| Catatan positif dan laporan insiden | Guru mata pelajaran dan wali kelas; BK mengelola tindak lanjut kasus | **RANCANGAN DOKUMEN**; rincian hak edit/hapus masih perlu disepakati |
| Rekomendasi penanganan/pembelajaran | Guru BK, dengan masukan wali kelas | **RANCANGAN DOKUMEN** |
| Tugas dan nilai | Guru mata pelajaran/tim kurikulum melalui sistem akademik/LMS; profil hanya sebagai konsumen | **RANCANGAN DOKUMEN**; lihat konflik cakupan MVP di bawah |
| Tahfizh | Modul/penanggung jawab tahfizh | **DI LUAR MVP** untuk fitur tahfizh; status menampilkan data historis pada profil belum diputuskan |
| Prestasi | Dokumen profil menyebut sumber modul prestasi/ekskul dan pengelola pembina/wali kelas | **KONFLIK MVP**: prestasi ekstrakurikuler telah dikonfirmasi di luar MVP; lihat keputusan cakupan di bawah |

#### Cakupan MVP dan konflik dokumen

- **RANCANGAN DOKUMEN**: `profil-murid.md` menyebut kebutuhan khusus dan rekomendasi BK sebagai komponen wajib MVP. Kedua bidang ini diprioritaskan dalam rancangan profil, dengan pembatasan akses dan data seminimal yang diperlukan.
- **RANCANGAN DOKUMEN**: dokumen profil mengusulkan indikator agregat tugas/nilai secara read-only jika sumber data tersedia, tetapi bagian lain menyebut modul nilai/tugas dikecualikan dari MVP. **PERLU KLARIFIKASI** apakah ringkasan read-only tetap masuk atau seluruh informasi akademik ini ditunda.
- **DI LUAR MVP**: fitur tahfizh dan prestasi ekstrakurikuler, sesuai konfirmasi pengguna. `profil-murid.md` menyebut prestasi wajib MVP serta modul Prestasi & Ekskul sebagai formulir MVP; bagian tersebut bertentangan dengan konfirmasi ini dan tidak dijadikan keputusan.
- **PERLU KLARIFIKASI**: apakah “prestasi” non-ekstrakurikuler (misalnya penghargaan yang dicatat terpisah dari modul ekskul) juga dikecualikan atau dapat menjadi informasi profil dari sumber lain.
- **PERLU KLARIFIKASI**: apakah data historis tahfizh/prestasi yang sudah tersedia dari luar aplikasi boleh tampil read-only, walaupun modul inputnya di luar MVP.

#### Cakupan tampilan per peran

Rincian berikut merangkum rancangan tampilan dalam `profil-murid.md`; kecuali sudah dikonfirmasi sebelumnya, rincian per bidang masih merupakan rancangan:

| Peran | Cakupan tampilan yang dirancang | Batas/keputusan terbuka |
| --- | --- | --- |
| Guru mata pelajaran | Murid pada kelas yang diajar; identitas relevan, informasi keselamatan/kebutuhan khusus yang perlu diketahui, rekomendasi kelas dari BK, apresiasi positif, presensi mapel sendiri, dan indikator akademik agregat. | Dokumen profil memperluas akses di luar batas akademik dalam draf awal. **PERLU KLARIFIKASI** data nonakademik mana yang memang boleh dilihat dan bagaimana kebutuhan-untuk-tahu diterapkan. |
| Wali kelas | Profil murid kelas perwaliannya, agregat kehadiran kelas, apresiasi, laporan setelah triase/penugasan, tugas penanganan yang dilimpahkan, dan petunjuk kelas dari BK. | Rekam sesi konseling dan catatan psikologis tetap terkunci dalam rancangan; rincian visibilitas kasus perlu disepakati. |
| Guru BK | Akses profil dan perilaku untuk penanganan; kendali rekomendasi dan akses ke rekam konseling sesuai kewenangan. | **PERLU KLARIFIKASI** pembagian tugas/akses jika ada beberapa petugas BK atau koordinator. |
| Waka kesiswaan/kamad | Ringkasan eksekutif, data agregat, status atau disposisi manajerial; bukan rekam konseling secara default dalam rancangan dokumen. | Hak akses detail dan mekanisme override darurat belum diputuskan; lihat bagian akses kasus. |
| Admin/Tata Usaha | Pengelolaan data induk dan informasi dasar sesuai tugas. | Hak akses admin terhadap data perilaku dan rekam konseling perlu ditetapkan secara terpisah; hak administrasi tidak otomatis berarti hak baca semua data sensitif. |

- **DIKONFIRMASI**: pada prinsipnya profil digunakan lintas peran dengan pembatasan informasi; admin mengatur pengecualian untuk informasi dasar dan BK mengatur pengecualian informasi perilaku.
- **RANCANGAN DOKUMEN**: backend hanya mengirim bidang yang boleh dibaca per peran/cakupan (misalnya kelas yang diajar), bukan sekadar menyembunyikan bidang sensitif pada tampilan. Ini adalah prinsip desain yang perlu dijabarkan ke aturan akses teknis.
- **RANCANGAN DOKUMEN**: aspek positif, minat, dan prestasi ditempatkan menonjol agar profil tidak hanya menyorot masalah/perilaku negatif.
- **DIKONFIRMASI**: gunakan “murid” pada konteks produk. **RANCANGAN DOKUMEN**: istilah tampilan dapat berbeda dari nama tabel/kolom lama seperti `siswa`; perubahan skema internal tidak diperlukan hanya demi bahasa UI.
- **PERLU KLARIFIKASI**: pengguna sebelumnya menyebut pihak yang boleh mengubah profil sebagai BK dan wali kelas kelas perwaliannya, lalu menyebut BK kembali. Dokumen profil menawarkan waka kesiswaan atau admin data sekolah sebagai kemungkinan pihak ketiga; siapa yang berwenang belum diputuskan.
- **PERLU KLARIFIKASI**: kedua dokumen pendukung membedakan perilaku positif/apresiasi dari perilaku negatif/insiden; catatan positif tidak melalui triase, sedangkan insiden negatif melalui triase BK, dan kategori insiden mencakup “Akademik”. Matriks izin juga dibedakan menurut positif/negatif. Namun, belum ditetapkan apakah catatan perlu dipisah khusus menjadi akademik dan nonakademik atau bagaimana pemisahan itu memengaruhi izin.

## 5. Kebutuhan pengalaman penggunaan

- **DIKONFIRMASI**: aplikasi harus sederhana, memakai teks singkat dan ikon yang mudah dipahami, serta diutamakan untuk ponsel.
- **DIKONFIRMASI**: kurangi beban kognitif, kebosanan, dan kelelahan akibat terlalu banyak menggulir, mencari fitur, dan melakukan CRUD.
- **PERLU KLARIFIKASI**: masalah kerja manual mana yang paling penting untuk dikurangi dan bagaimana keberhasilan diukur. Contoh: waktu guru mengisi jurnal/presensi, keterlambatan mengetahui ketidakhadiran, lamanya tindak lanjut BK, atau waktu menyiapkan rekap pimpinan.

## 6. Kebutuhan offline dan sinkronisasi

- **DIKONFIRMASI — cakupan minimum offline MVP**:
  - Pengguna dapat **membaca data jurnal dan presensi** saat offline.
  - Pengguna dapat **membuat jurnal dan presensi** saat offline; perubahan disimpan lokal dan disinkronkan ke Supabase saat koneksi tersedia.
  - Pengguna dapat membaca data lain yang memang berhak diaksesnya, termasuk perilaku dan profil murid, dengan tetap menerapkan batasan peran dan penugasan.
  - Tujuan pengalaman: pekerjaan tidak hilang atau terasa gagal hanya karena jaringan seluler terputus/tidak stabil.
- **PERLU KLARIFIKASI**: apakah pengguna juga harus dapat mengubah dan menghapus jurnal/presensi offline, atau perubahan/penghapusan data yang sudah tersimpan di server harus menunggu koneksi.
- **PERLU KLARIFIKASI**: apakah membuat/mengubah/menghapus data perilaku atau profil harus berfungsi offline. Kebutuhan baca offline sudah dikonfirmasi; cakupan tulis offline belum.
- **PERLU KLARIFIKASI — data sensitif di perangkat**: bagian profil/perilaku mana yang boleh disimpan lokal untuk dibaca offline, berapa lama disimpan, dan bagaimana menghapus/mengunci data lokal saat logout, perangkat hilang, atau hak akses dicabut. Baca offline tidak boleh memperluas akses peran.
- **KONDISI IMPLEMENTASI SAAT DOKUMEN DIPERBARUI**: service worker menggunakan strategi `NetworkFirst` untuk halaman awal dan `NetworkOnly` untuk rute GET lainnya. Belum ada implementasi CRUD lokal atau antrean sinkronisasi offline yang teridentifikasi. Cache halaman PWA saja tidak sama dengan penyimpanan data offline.
- **DIKONFIRMASI — prinsip konflik**: data tidak boleh ditimpa secara diam-diam ketika versi server dan perubahan offline berbeda.
- **RANCANGAN PENANGANAN KONFLIK UNTUK MVP**:
  1. **Pembuatan catatan baru** (jurnal/laporan yang memang belum ada di server) bukan konflik edit; sinkronkan sebagai entri baru dengan ID operasi unik dan idempotensi agar retry tidak membuat duplikasi. Konflik terjadi saat operasi menyunting/menghapus data yang versi dasarnya telah berubah di server.
  2. **Presensi** bersifat data terstruktur per murid dan per jam. Otomatisasi hanya boleh dipakai bila sistem dapat membuktikan perubahan tidak menghilangkan koreksi yang sah—misalnya perubahan pada murid/jam berbeda atau versi dasar belum berubah. Gunakan versi/timestamp dan validasi server. Jika dua pihak mengubah presensi yang sama atau urutannya tidak dapat dipastikan, tahan item itu untuk rekonsiliasi; jangan mengandalkan last-write-wins berdasarkan waktu perangkat yang tidak tepercaya.
  3. **Jurnal dan laporan perilaku** berisi narasi atau informasi sensitif; jika versi dasar berubah sejak data dibaca, tahan perubahan offline sebagai konflik terpisah dan jangan menerbitkannya sebagai jurnal/laporan resmi sampai direkonsiliasi.
  4. Tampilkan indikator yang menjelaskan item tertahan dan tindakan yang diperlukan. Sediakan perbandingan versi server dengan versi offline; pengguna berwenang dapat memilih versi server, mengajukan versi offline sebagai pengganti, atau menggabungkan teks secara manual. Simpan jejak penyelesaian konflik.
- **RANCANGAN TEKNIS UNTUK DIDISKUSIKAN**:
  1. Gunakan IndexedDB untuk data baca offline yang dibatasi berdasarkan penugasan/peran, draft, serta antrean operasi tertunda; minimalkan data lokal terutama untuk profil/perilaku sensitif.
  2. Beri setiap operasi ID idempoten dan versi dasar/server agar retry tidak membuat duplikasi dan konflik dapat dideteksi.
  3. Bedakan status “tersimpan di perangkat”, “menunggu sinkronisasi”, “perlu rekonsiliasi”, dan “tersinkron”. Jangan menyatakan data tersimpan di server sebelum ada konfirmasi server.
  4. Coba sinkronisasi saat aplikasi aktif/koneksi pulih; Background Sync hanya sebagai mekanisme tambahan karena eksekusinya bergantung pada browser/perangkat.
  5. Server tetap memvalidasi izin dan cakupan penugasan saat sinkronisasi. Data yang hak aksesnya telah dicabut tidak boleh dipublikasikan hanya karena pernah tersedia offline.
- **ALTERNATIF YANG PERLU EVALUASI**: dokumen usulan konflik menyarankan mengirim versi konflik ke server sebagai entri khusus `conflict_pending`. Ini dapat membantu pemulihan lintas perangkat, tetapi juga menambah salinan data sensitif, kompleksitas izin/retensi, dan risiko entri konflik disalahartikan sebagai laporan resmi. Untuk rancangan awal MVP, tahan antrean konflik secara lokal; jangan membuat entri server `conflict_pending` sebelum kebutuhan, kontrol akses, dan siklus hidup datanya disepakati.
- **PERLU KLARIFIKASI**: siapa yang berwenang menyelesaikan tiap jenis konflik, apakah guru pembuat dapat mengesahkan versi pengganti, dan kapan eskalasi ke BK/admin diperlukan untuk konflik laporan perilaku.

## 7. Notifikasi, ekspor, dan sumber daya

- **PERLU KLARIFIKASI**: kejadian yang memicu notifikasi, penerima berdasarkan peran/penugasan, tingkat urgensi, serta batas informasi sensitif dalam notifikasi desktop/mobile.
- **PERLU KLARIFIKASI**: siapa yang boleh mengekspor data apa, format Excel/PDF, template, dan tujuan ekspor.
- **DIKONFIRMASI sebagai batasan umum**: optimalkan penggunaan kuota gratis Vercel dan Supabase. Penggunaan CDN tambahan pernah dipertimbangkan jika aplikasi menampung foto; keputusan dan kebutuhannya belum ditetapkan.

## 8. Privasi, keamanan, dan tata kelola

- **DIKONFIRMASI**: BK mengatur pengecualian akses informasi perilaku; tindakan pembukaan, perubahan, penghapusan, serta override akses harus tercatat.
- **DIKONFIRMASI**: seluruh pengguna dengan peran Guru BK dapat membaca rekam konseling; hanya BK yang ditugaskan dapat membuat atau mengubah rekam kasus. Wali kelas hanya menulis/mengubah catatan tindak lanjut terpisah selama ditugaskan, lalu baca-saja setelah tugas dikembalikan ke BK.
- **DIKONFIRMASI**: setiap pembacaan rekam konseling dicatat dalam audit. Penghapusan tindak lanjut wali kelas memerlukan alasan dan audit metadata; isi yang dihapus tidak disalin ke log audit.
- **PERLU KLARIFIKASI**: sumber dan pengelola penugasan konselor, akses laporan sebelum/selepas triase bagi pelapor dan wali kelas, akses detail oleh waka/kamad/admin, dan mekanisme akses darurat.
- **PERLU KLARIFIKASI**: kebijakan keamanan, retensi, pencadangan, pemulihan, dan penghapusan data, terutama data kontak, kebutuhan khusus, serta perilaku murid.
- **PERLU KLARIFIKASI**: sumber kebijakan madrasah atau ketentuan lain yang harus menjadi acuan pengelolaan data.
- Keputusan akses dan audit di atas adalah kebutuhan produk, bukan bukti bahwa RLS, server, atau database produksi sudah menegakkannya. Verifikasi implementasi dan uji akses harus dilakukan terpisah sebelum menyimpulkan kesiapan penggunaan data riil.

## 9. To-do klarifikasi yang masih terbuka

Item di bawah ini adalah keputusan yang belum dijawab atau baru tercatat sebagai rancangan. Kalender ujian/Ramadan sudah diputuskan untuk ditunda, sedangkan cakupan minimum offline (baca jurnal/presensi, buat jurnal/presensi, dan baca data lain sesuai izin) sudah dikonfirmasi; keduanya tidak ditanyakan ulang di daftar ini.

- [ ] **Bahas notifikasi dan ekspor setelah logika serta UI/UX jurnal mengajar dan perilaku MVP selesai.** Keduanya termasuk MVP; pemicunya untuk mulai dibahas adalah permintaan pengguna.
- [ ] **Tetapkan prasyarat sebelum merilis profil/perilaku sensitif.** Sepakati kontrol akses dan audit, penanggung jawab pencadangan/pemulihan, kewenangan penghapusan, serta kebijakan retensi/penghapusan dan rujukan kebijakan madrasah yang berlaku. Lihat [rekomendasi prasyarat perlindungan data sensitif](./prasyarat-perlindungan-data-sensitif.md) sebagai panduan usulan, bukan keputusan yang telah disahkan.
- [ ] **Selesaikan aturan akses laporan dan pimpinan.** Tetapkan siapa yang dapat melihat laporan sebelum/selepas triase, apakah pelapor melihat status dan tindak lanjut, kapan wali kelas dapat membaca laporan, serta apakah waka/kamad/admin dapat melihat ringkasan atau memiliki mekanisme akses darurat dengan alasan dan audit. Akses baca seluruh BK ke rekam konseling dan hak tulis terbatas pada BK yang ditugaskan sudah dikonfirmasi; mekanisme penugasan masih perlu ditetapkan.
- [ ] **Tetapkan tata kelola audit akses.** Setiap baca rekam konseling dan penghapusan tindak lanjut wali kelas dengan alasan wajib dicatat; putuskan retensi log, pihak yang meninjau, perlindungan log, dan apakah unduh data sensitif juga diaudit.
- [ ] **Setujui alur kasus dan hak tindakan.** Putuskan apakah laporan negatif selalu melalui triase BK, bagaimana status lama dipetakan ke Baru → Ditugaskan → Diproses → Selesai, kapan laporan ditangani di tempat atau dilimpahkan ke wali kelas, siapa yang boleh menutup/membuka kembali kasus, dan alasan/riwayat apa yang diwajibkan.
- [ ] **Tetapkan matriks hak akses profil per bidang dan per peran.** Khususnya data kesehatan/kebutuhan khusus, informasi dasar/kontak, perilaku positif, ringkasan insiden, rekomendasi BK, kehadiran, serta data akademik. Dokumen pendukung membedakan izin perilaku positif dan negatif, tetapi belum menetapkan perlu tidaknya pemisahan akademik/nonakademik dan dampaknya pada izin. Tentukan pula batas data yang di-cache untuk baca offline agar hak akses tidak melebar.
- [ ] **Putuskan pengelolaan dan cakupan profil MVP.** Konfirmasi apakah tugas/nilai read-only masuk MVP, apakah prestasi non-ekstrakurikuler termasuk (prestasi ekstrakurikuler tetap di luar MVP), serta apakah data historis tahfizh/prestasi boleh ditampilkan walau fitur inputnya ditunda.
- [ ] **Tetapkan kewenangan mengubah profil.** Klarifikasi peran ketiga yang sebelumnya tertulis BK dua kali—opsi yang muncul adalah waka kesiswaan atau admin data sekolah—dan tentukan bidang apa yang boleh diubah oleh BK, wali kelas, admin, atau pihak lain.
- [ ] **Tentukan tindakan offline di luar cakupan yang telah disepakati.** Apakah edit/hapus jurnal-presensi dan buat/ubah/hapus perilaku/profil harus bisa offline, atau menunggu koneksi? Tentukan juga masa simpan lokal dan tindakan saat logout, perangkat hilang, atau hak akses dicabut.
- [ ] **Tetapkan siapa yang menyelesaikan konflik sinkronisasi.** Putuskan kewenangan memilih versi server/offline atau menggabungkan teks untuk jurnal, presensi, dan laporan perilaku; definisikan kapan konflik harus dieskalasikan ke BK/admin. Pembuatan entri baru yang belum ada di server bukan konflik edit, tetapi tetap memerlukan idempotensi agar retry tidak membuat duplikasi.
- [ ] **Pilih prioritas masalah dan ukuran keberhasilan.** Sebutkan 1–2 pekerjaan manual paling penting yang ingin dikurangi, peran yang terdampak, frekuensi/dampaknya, serta indikator hasil (misalnya waktu isi jurnal, kelengkapan presensi, waktu triase, atau waktu membuat rekap).
- [ ] **Tegaskan cakupan peran guru piket untuk MVP.** Dokumen awal menyebut fiturnya belum masuk, tetapi batas MVP yang dikonfirmasi sejauh ini hanya secara eksplisit mengecualikan tahfizh dan prestasi ekstrakurikuler.

## 10. Hal yang sengaja ditunda

- Perubahan jadwal khusus ujian dan Ramadan tidak menjadi fokus saat ini.
- Fitur tahfizh dan pencatatan prestasi ekstrakurikuler bukan target MVP. Informasi terkait pada profil murid tetap perlu ditentukan apakah ditunda sepenuhnya atau ditampilkan dari sumber lain.
- Rekomendasi desain lain dalam dua dokumen pendukung belum otomatis menjadi keputusan. Gunakan label **RANCANGAN DOKUMEN** dan **PERLU KLARIFIKASI** di atas untuk membedakannya.