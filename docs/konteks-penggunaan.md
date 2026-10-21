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
- **DIKONFIRMASI**: jika beberapa peran memberi hak berbeda, hak untuk setiap jenis data dan aksi ditentukan secara eksplisit; tidak ada aturan union atau intersection global yang otomatis mengalahkan batas objek.
- **PERLU KLARIFIKASI**: sumber data penugasan yang menjadi acuan final dan matriks baca/tambah/ubah/hapus/tindak lanjut per peran di luar keputusan yang sudah dikonfirmasi.
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
- **PERLU KLARIFIKASI — cek pemahaman dan asesmen singkat**: apakah guru perlu mencatat pertanyaan singkat saat mengajar untuk latihan mengingat kembali (*retrieval practice*), diagnosis/asesmen formatif, atau pemberian nilai angka. Tujuan-tujuan tersebut berbeda: latihan retrieval tidak harus menghasilkan nilai; asesmen formatif/diagnostik digunakan untuk memahami kebutuhan belajar dan menyesuaikan pengajaran; nilai angka dapat menjadi rekaman capaian individual dengan konsekuensi dan kebutuhan rekap tersendiri.
- **REKOMENDASI UNTUK DIDISKUSIKAN**: untuk cara paling sederhana tanpa menambah banyak elemen UI, mulai dari pencatatan opsional tingkat kelas pada refleksi jurnal yang sudah ada—misalnya materi/pertanyaan, pola pemahaman atau miskonsepsi kelas, dan langkah pengajaran berikutnya. Jangan mewajibkan nilai per murid untuk kegiatan retrieval/diagnostik. Jika nilai individual memang diperlukan, pertimbangkan alur asesmen opsional yang terpisah namun tertaut ke pertemuan, dan gunakan daftar murid yang sama agar tidak mengulang pemilihan kelas/daftar.
- **PERLU KLARIFIKASI**: apakah pencatatan hasil asesmen tingkat kelas atau nilai individual termasuk MVP; tujuan dan bobot nilai, data yang disimpan, hak akses, rekap yang diperlukan, serta apakah hasil satu pertanyaan boleh memengaruhi nilai formal. Rekomendasi di atas belum menetapkan keputusan cakupan MVP atau desain final.

### 4.3 Catatan perilaku dan kasus

- **DIKONFIRMASI**: catatan perilaku adalah deskripsi perilaku murid yang dimasukkan dan disimpan melalui aplikasi.
- **DIKONFIRMASI**: setiap pengguna yang memang diberi hak input perilaku dapat memilih murid mana pun sebagai sasaran input; kemampuan memilih sasaran dan menginput laporan tidak dengan sendirinya menetapkan hak baca lain. Hak baca profil, laporan, hasil triase, catatan tindak lanjut, atau rekam konseling tetap mengikuti keputusan akses masing-masing.
- **DIKONFIRMASI**: role yang diberi hak input perilaku adalah Guru BK (`guru_bk`), wali kelas (`wali_kelas`), guru mata pelajaran (`guru_mapel`), dan guru tahfizh (`guru_tahfidz`). Role di luar daftar ini tidak memiliki hak input perilaku; keputusan ini hanya menetapkan hak input, bukan hak baca atau aksi lainnya.
- **DIKONFIRMASI**: pemilih sasaran input perilaku menampilkan nama dan kelas murid saja; informasi lain pada profil tidak ditampilkan melalui pemilih tersebut.
- **DIKONFIRMASI**: “pelanggaran” dan “kasus” dalam konteks saat ini sama-sama merujuk pada perilaku negatif.
- **DIKONFIRMASI**: penanganan berarti eskalasi atau tindak lanjut.
- **DIKONFIRMASI**: status yang digunakan saat ini adalah “Ditangani di Tempat”, “Diteruskan ke BK/Wali Kelas”, “Diproses”, dan “Selesai”. Status dapat berubah di kemudian hari.
- **DIKONFIRMASI**: guru dapat menangani laporan perilaku negatif tanpa menunggu triase BK. Jika guru menandai tindak lanjut awal sebagai “Ditangani di Tempat”, tindakan awal guru dianggap selesai, tetapi laporan tetap dapat ditinjau BK kemudian. Semua laporan negatif yang tersimpan dapat ditinjau BK, termasuk yang sudah ditangani guru; BK dapat melakukan triase untuk menetapkan apakah tindak lanjut ditugaskan kepada wali kelas atau ditangani langsung oleh BK.
- **DIKONFIRMASI**: setelah tindakan awal guru selesai, BK boleh menambahkan penugasan/tindak lanjut kepada wali kelas atau BK jika diperlukan. Riwayat tindakan awal guru tetap dipertahankan; status/transisi yang menampung tindak lanjut lanjutan masih perlu dirancang.
- **DIKONFIRMASI**: status laporan insiden tetap mencatat hasil tindakan awal guru, misalnya “Ditangani di Tempat”. Penugasan/tindak lanjut berikutnya dan rekam konseling BK memiliki status masing-masing yang terpisah; tindak lanjut BK tidak mengganti status awal laporan.
- **DIKONFIRMASI**: tindakan awal guru yang telah selesai, seperti “Ditangani di Tempat”, dicatat sebagai bagian dari riwayat laporan insiden, bukan sebagai tugas tindak lanjut tersendiri. Tugas dibuat untuk tindakan lanjutan yang masih perlu dilakukan/dituntaskan; laporan tanpa tindakan lanjutan tidak otomatis membuat tugas atau rekam konseling. Rekam konseling formal tetap dibuat saat kasus ditugaskan langsung kepada BK.
- **DIKONFIRMASI**: laporan negatif boleh disimpan sebelum tindakan awal dilakukan/dicatat. Keadaan itu harus dibedakan dengan jelas sebagai belum ada tindakan awal, bukan dianggap selesai.
- **DIKONFIRMASI**: hanya guru pelapor yang menambahkan tindakan awalnya sendiri ke riwayat laporan. Tindakan wali kelas atau BK dicatat pada tugas tindak lanjut masing-masing, bukan dengan mengubah riwayat tindakan awal pelapor.
- **DIKONFIRMASI**: bila pelapor menambahkan tindakan awal setelah laporan disimpan sebagai “Belum ada tindakan awal”, status laporan terkini diperbarui mengikuti hasil tersebut dan status/catatan sebelumnya tetap dipertahankan dalam riwayat bertimestamp.
- **DIKONFIRMASI**: tinjauan BK memiliki status/penanda tersendiri yang terpisah dari status tindakan awal laporan; petugas BK dan waktu tinjauan dicatat. Status tinjauan tidak menggantikan status tugas tindak lanjut atau rekam konseling.
- **DIKONFIRMASI**: status tinjauan BK hanya menunjukkan apakah laporan sudah ditinjau (“Belum ditinjau”/“Sudah ditinjau”); hasil triase, seperti keputusan perlu atau tidaknya tindak lanjut, dicatat terpisah.
- **DIKONFIRMASI**: pelapor dapat melihat status tinjauan BK untuk laporannya sendiri, tetapi tidak melihat hasil triase atau catatan internal BK.
- **DIKONFIRMASI**: wali kelas dapat melihat status tinjauan laporan yang dibuat selama masa penugasannya untuk murid di kelas perwaliannya, tetapi tidak melihat hasil triase atau catatan internal BK selain arahan/ringkasan yang memang dibagikan.
- **DIKONFIRMASI**: waka/kamad hanya dapat melihat status tinjauan jika BK secara eksplisit memasukkannya dalam ringkasan yang dipilih untuk dibagikan; tidak ada akses langsung tambahan.
- **DIKONFIRMASI**: guru mata pelajaran yang mengajar murid terkait tetapi bukan pelapor/wali kelas hanya melihat arahan BK yang dibagikan kepadanya; tidak mendapat akses langsung ke status tinjauan atau hasil triase.
- **DIKONFIRMASI**: admin aplikasi/teknis tidak mendapat akses ke isi laporan, hasil triase, atau rekam konseling untuk dukungan teknis. Pemecahan masalah menggunakan metadata, data yang disamarkan, atau bantuan BK; hak admin teknis membaca log audit metadata adalah akses terpisah.
- **DIKONFIRMASI**: hanya admin teknis yang memiliki hak baca default ke log audit metadata; peran lain hanya dapat membaca setelah ditetapkan secara khusus. Hak baca log tidak dengan sendirinya memberi akses langsung ke status laporan, hasil triase, atau rekam konseling.
- **DIKONFIRMASI**: pembacaan log audit oleh admin teknis juga diaudit dengan identitas admin dan waktu akses.
- **DIKONFIRMASI**: log audit tidak dapat diedit atau dihapus secara langsung; koreksi menjadi peristiwa baru, sedangkan penghapusan karena retensi harus melalui proses terpisah yang berwenang dan tercatat.
- **DIKONFIRMASI**: pengelolaan log audit perlu menghindari beban yang tidak perlu pada database karena aplikasi menggunakan Supabase online free tier, termasuk biaya/kuota, kapasitas penyimpanan, dan kinerja baca/tulis. Peristiwa audit yang diwajibkan tetap dicatat; optimasi tidak boleh mengubah makna audit. Prinsip ini belum menetapkan durasi retensi, ambang beban, atau metode teknis. Batas paket perlu diverifikasi kembali pada [halaman harga resmi Supabase](https://supabase.com/pricing) saat melakukan estimasi.
- **DIKONFIRMASI**: selama masa retensi belum ditetapkan, log audit tidak dihapus otomatis dan peristiwa audit yang diwajibkan tidak dikurangi. Gunakan metadata minimum yang diperlukan, hindari duplikasi, serta pantau metrik agregat penyimpanan/kuota/kinerja tanpa meninjau isi log secara berkala. Sebelum mengarsipkan, menghapus, atau mengubah pencatatan, minta keputusan tersendiri; pendekatan ini menjaga makna audit tetapi tidak menghilangkan risiko pertumbuhan penyimpanan.
- **DIKONFIRMASI**: setiap pembacaan status tinjauan BK diaudit dengan identitas pembaca dan waktu akses.
- **DIKONFIRMASI**: metadata audit pembacaan status mencakup identitas pembaca, waktu, identitas laporan, dan jenis akses; log tidak menyalin isi laporan, hasil triase, atau catatan BK.
- **DIKONFIRMASI**: setiap pembacaan isi laporan asli, hasil triase, atau status sementara yang dilindungi juga diaudit bagi peran yang berwenang; log mencatat metadata akses tanpa menyalin konten sensitif.
- **PERLU KLARIFIKASI**: retensi log audit dan perlindungan log; bahas bersama tata kelola retensi/audit seluruh data perilaku, bukan menetapkan durasi khusus untuk log status tinjauan. Akses default dan persyaratan akses khusus tercatat pada bagian tata kelola di bawah; prosedur operasionalnya masih perlu ditetapkan. Log umum ditinjau oleh admin teknis bila ada laporan/kekhawatiran tentang akses tidak semestinya atau anomali/peringatan akses/ekspor, bukan secara berkala. Pengguna memilih pencatatan penolakan akses sensitif hanya bila terjadi pola berulang; satu penolakan tunggal tidak dicatat dengan sendirinya. Kriteria pengulangan dan prosedur peninjauan masih perlu ditetapkan.
- **DIKONFIRMASI**: status tinjauan berubah menjadi “Sudah ditinjau” hanya setelah petugas BK secara eksplisit menyelesaikan/menyimpan tinjauan beserta hasil triase; membuka laporan saja tidak mengubah status tinjauan.
- **DIKONFIRMASI**: jika pelapor menambahkan tindakan awal setelah BK menyelesaikan tinjauan, status tinjauan kembali menjadi “Belum ditinjau” agar informasi baru ditinjau; catatan dan waktu tinjauan sebelumnya tetap disimpan dalam riwayat.
- **DIKONFIRMASI**: jika hasil triase memerlukan tugas tindak lanjut, tinjauan baru berstatus “Sudah ditinjau” setelah keputusan triase dan penugasan tugas yang sesuai berhasil dicatat.
- **DIKONFIRMASI**: BK dapat mencatat hasil sementara “Perlu informasi tambahan” tanpa menyelesaikan tinjauan; status tinjauan tetap “Belum ditinjau” sampai keputusan akhir tercapai.
- **DIKONFIRMASI**: hasil “Perlu informasi tambahan” tidak otomatis membuat tugas. Tugas dibuat bila ada tindakan konkret yang harus dilakukan dan dituntaskan oleh pemilik yang ditugaskan.
- **DIKONFIRMASI**: penyelesaian tugas pengumpulan informasi tidak otomatis menuntaskan tinjauan BK; tinjauan tetap “Belum ditinjau” sampai BK meninjau informasi tersebut dan menyimpan hasil triase akhir serta penugasan tindak lanjut yang diperlukan.
- **DIKONFIRMASI**: tinjauan BK berada di antrean bersama; petugas BK yang berwenang dapat menuntaskan laporan yang belum diklaim. Jika tinjauan diklaim/ditugaskan kepada petugas tertentu, hanya pemilik aktif yang dapat menuntaskannya sampai pengalihan tercatat; identitas dan waktu dicatat.
- **DIKONFIRMASI**: seluruh pengguna berperan BK dapat membaca hasil triase, status sementara, dan pemilik tinjauan; jika tinjauan sudah diklaim, hanya pemilik aktif yang dapat menuntaskannya sampai pengalihan tercatat.
- **DIKONFIRMASI**: klaim tinjauan hanya menetapkan pemilik aktif dan mencatat perubahan itu dalam riwayat; klaim tidak mengubah status tinjauan “Belum ditinjau” dan tidak membuat tugas tindak lanjut.
- **DIKONFIRMASI**: satu laporan dapat memiliki beberapa tugas tindak lanjut tertaut yang berjalan bersamaan untuk aksi/pemilik berbeda; setiap tugas memiliki status dan riwayatnya sendiri.
- **DIKONFIRMASI**: bila satu tinjauan menghasilkan beberapa tugas, tinjauan baru berstatus “Sudah ditinjau” setelah semua tugas yang diputuskan berhasil dicatat.
- **DIKONFIRMASI**: label antarmuka untuk tugas adalah “Menunggu wali kelas” atau “Menunggu BK” → “Sedang ditindaklanjuti” → “Selesai”. Ini adalah istilah tampilan yang disepakati untuk guru; nilai status database dan transisi teknis belum ditetapkan.
- **DIKONFIRMASI**: tugas yang baru ditugaskan langsung kepada petugas BK juga berlabel “Menunggu BK” sampai petugas memulai, kemudian “Sedang ditindaklanjuti” dan “Selesai”. Penugasan tetap langsung membuka rekam konseling formal; rekam itu tidak berarti sesi sudah dimulai.
- **DIKONFIRMASI**: setiap tindak lanjut yang ditugaskan langsung kepada BK membuka rekam konseling formal yang terpisah. Laporan negatif tidak otomatis membuka rekam konseling; rekam formal dibuat ketika BK menetapkan penanganan kasus kepada BK.
- **DIKONFIRMASI**: catatan perilaku positif dipakai sebagai informasi profil murid dan tidak mengikuti alur kasus negatif.
- **DIKONFIRMASI**: BK mengatur pembatasan akses informasi perilaku. Pembukaan, perubahan, penghapusan, dan override akses harus tercatat.

#### Rancangan laporan negatif dan triase

- **DIKONFIRMASI**: guru boleh menandai tindakan awal pada laporan negatif sebagai **Ditangani di Tempat** tanpa menunggu triase BK; keadaan itu menuntaskan tindakan awal guru, tetapi tidak menutup kemungkinan BK meninjau laporan kemudian.
- **DIKONFIRMASI**: laporan insiden negatif terpisah dari rekam konseling internal BK dan dari catatan tindak lanjut wali kelas. BK dapat meninjau laporan tersimpan dan melakukan triase untuk menentukan tindak lanjut kepada wali kelas atau BK.
- **DIKONFIRMASI**: laporan insiden tidak otomatis menjadi rekam konseling resmi. Setiap laporan yang ditugaskan untuk ditangani BK membuka rekam konseling formal tersendiri.
- **DIKONFIRMASI**: BK dapat menambahkan penugasan/tindak lanjut kepada wali kelas atau BK setelah tindakan awal guru selesai, tanpa menghilangkan riwayat tindakan guru.
- **RANCANGAN DOKUMEN**: rincian status/transisi ketika BK menambahkan tindak lanjut setelah tindakan awal guru masih perlu dipastikan.
- **RANCANGAN DOKUMEN**: status kasus konseling yang diusulkan adalah **Baru → Ditugaskan → Diproses → Selesai**. “Ditangani di tempat” merupakan hasil penanganan/triase, bukan status tahap konseling.
- **DIKONFIRMASI**: rekam konseling internal BK terpisah dari laporan insiden dan dari catatan tindak lanjut wali kelas.
- **DIKONFIRMASI**: rekam konseling menggunakan editor rich-text bebas, bukan formulir dengan daftar field wajib yang sudah ditetapkan. Format bebas ini tidak dengan sendirinya menetapkan bahwa setiap jenis data sensitif harus dikumpulkan.
- **DIKONFIRMASI**: semua pengguna dengan peran Guru BK dapat membaca seluruh rekam konseling.
- **DIKONFIRMASI**: hanya Guru BK yang saat ini ditugaskan pada kasus dapat membuat atau mengubah rekam konseling kasus tersebut; semua pengguna berperan Guru BK dapat menetapkan dirinya sendiri atau BK lain sebagai penanggung jawab dan membaca riwayat perpindahan. Perpindahan cukup mencatat pelaku, waktu, penanggung jawab lama/baru tanpa alasan wajib.
- **DIKONFIRMASI**: BK dapat memberikan arahan tindakan untuk guru dan ringkasan singkat sesi yang terpisah dari rekam konseling lengkap. Guru mata pelajaran yang mengajar murid terkait dapat membaca arahan tindakan, tetapi tidak otomatis mendapat akses ke ringkasan sesi atau rekam konseling lengkap. Wali kelas hanya dapat membaca informasi tersebut untuk murid di kelas perwaliannya; waka kesiswaan dan kamad hanya dapat membaca ringkasan yang dipilih BK untuk dibagikan. Ketentuan ini tidak memberikan akses kepada mereka atas rekam konseling lengkap.
- **DIKONFIRMASI**: arahan/rekomendasi BK saja cukup untuk saran umum tanpa tindakan dan penyelesaian yang diharapkan. Jika BK meminta tindakan tertentu—misalnya pemantauan atau mengirim perkembangan—buat tugas dengan penanggung jawab dan status; rekomendasi BK dapat menjadi panduan pendukung tugas.
- **DIKONFIRMASI**: wali kelas yang menerima penugasan dapat membuat dan mengubah catatan tindak lanjut pada kasus yang ditugaskan kepadanya. Catatan ini terpisah dari rekam konseling internal BK.
- **DIKONFIRMASI**: catatan kerja pada tugas tindak lanjut dapat dibaca oleh pemilik tugas saat ini, pihak yang menugaskan, BK yang menangani kasus, serta wali kelas yang pernah memegang tugas setelah tugas dialihkan kembali kepada BK. Hak baca wali kelas sebelumnya bersifat baca-saja.
- **DIKONFIRMASI**: setelah kasus/tugas tindak lanjut dikembalikan kepada BK, wali kelas tetap dapat membaca tindak lanjut terkait tetapi tidak dapat menambah, mengubah, atau menghapusnya.
- **DIKONFIRMASI**: hanya pemilik tugas saat ini yang dapat menambah atau mengubah catatan kerja; hak wali kelas untuk menulis berlaku selama ia memegang penugasan. Pihak yang menugaskan dan BK yang menangani kasus hanya dapat membaca ketika bukan pemilik aktif.
- **DIKONFIRMASI**: wali kelas yang masih memegang penugasan dapat menghapus catatan tindak lanjut dengan alasan. Isi yang dihapus tidak disimpan sebagai salinan; metadata tindakan dan alasan dicatat dalam audit.
- **DI LUAR MVP**: fitur analitik untuk mengembangkan rencana pencegahan atau metode penanganan bukan bagian dari aplikasi MVP.
- **RANCANGAN DOKUMEN**: wali kelas dapat mengembalikan/eskalasi penanganan ke BK dengan alasan dan membaca petunjuk penanganan kelas dari BK. Rincian transisi dan izin yang terkait masih perlu dipastikan.
- **DIKONFIRMASI**: status laporan insiden, status tugas tindak lanjut, dan status rekam konseling adalah status yang terpisah. Satu status tidak menggantikan status pada jenis rekaman lain.
- **DIKONFIRMASI**: jika tindak lanjut BK seperti pemanggilan orang tua sudah selesai tetapi pemantauan masih diperlukan, rekam/tugas BK ditutup dan dibuat tugas pemantauan wali kelas yang terpisah serta tertaut. Rekam BK tidak dibuka kembali hanya karena tugas wali kelas masih berjalan.
- **DIKONFIRMASI**: bila BK mengambil alih tugas wali kelas yang sedang berjalan, pemilik tugas yang sama berpindah ke BK dan riwayat kerja wali kelas dipertahankan; wali kelas menjadi baca-saja pada tugas itu. Jika setelah tindakan BK selesai pemantauan wali kelas masih diperlukan, buat tugas wali kelas baru yang tertaut.
- **DIKONFIRMASI**: saat tugas yang sudah berjalan berpindah dari wali kelas ke BK, label UI tugas tetap “Sedang ditindaklanjuti”; yang berubah adalah pemilik tugas, bukan tahap kemajuannya. Nilai status database tetap belum diputuskan.
- **DIKONFIRMASI**: petugas BK mana pun yang berwenang dapat mengambil alih tugas wali kelas dan menjadi pemilik BK yang ditugaskan. BK lain tetap memiliki hak baca sesuai ketentuan akses rekam konseling.
- **DIKONFIRMASI**: petugas BK yang berwenang dapat menetapkan tindak lanjut kepada dirinya sendiri atau petugas BK lain; tugas BK memiliki satu pemilik aktif, dan penugasan langsung membuka rekam konseling formal.
- **DIKONFIRMASI**: pengambilalihan oleh BK mencatat waktu dan pemilik lama/baru serta mewajibkan alasan singkat yang bersifat operasional, bukan detail konseling.
- **DIKONFIRMASI**: penugasan/perpindahan tugas selain pengambilalihan oleh BK dan pembukaan kembali tugas selesai mencatat waktu serta pemilik lama/baru, tetapi tidak mewajibkan kolom alasan tambahan jika tujuan tugas sudah jelas. Alasan wajib untuk pengambilalihan BK dan reopen tetap berlaku.
- **PERLU KLARIFIKASI**: nilai database dan transisi status untuk laporan, tugas wali kelas, serta rekam konseling BK; termasuk pemetaan status yang sudah digunakan (“Diteruskan”, “Diproses”, “Selesai”) dan rancangan “Baru → Ditugaskan → Diproses → Selesai”. Label antarmuka untuk guru—“Menunggu wali kelas/BK” → “Sedang ditindaklanjuti” → “Selesai”—sudah dikonfirmasi, bukan nilai database.

#### Akses dan audit kasus

- **DIKONFIRMASI**: semua laporan negatif tersimpan dapat ditinjau oleh BK, termasuk laporan yang telah ditangani guru; peninjauan BK tidak menunda tindakan awal guru.
- **DIKONFIRMASI**: guru pelapor dapat melihat laporan yang ia kirim dan status penanganannya. Arahan BK hanya terlihat jika guru tersebut mengajar murid terkait, sesuai batas akses guru mapel; ringkasan sesi dan rekam konseling tidak termasuk.
- **DIKONFIRMASI**: wali kelas dapat melihat laporan negatif asli untuk murid di kelas perwaliannya. Wali kelas juga dapat membaca arahan tindakan dan ringkasan singkat BK untuk murid di kelas perwaliannya; ini tidak mencakup rekam konseling.
- **DIKONFIRMASI**: akses wali kelas ke laporan negatif asli dimulai segera setelah laporan dikirim/disimpan; wali kelas tidak perlu menunggu tinjauan/triase BK untuk membaca laporan murid di kelas perwaliannya.
- **DIKONFIRMASI**: laporan yang dibuat sebelum wali kelas mulai bertugas untuk murid tersebut tidak terbuka otomatis karena penugasan baru. BK dapat membagikan satu laporan lama kepada penerima tertentu yang role-nya memang berwenang membaca laporan asli; dengan pembagian itu wali kelas saat ini dapat membaca laporan lama yang dipilih saja. Akses wali kelas melalui pengecualian ini berakhir otomatis saat penugasannya untuk murid tersebut berakhir, dan BK dapat mencabutnya lebih awal. Pembagian tidak memperluas hak ke role lain, laporan lama lainnya, atau hasil triase/catatan internal. Mekanisme teknis pembagian masih perlu dirinci.
- **DIKONFIRMASI**: pembagian isi laporan lama oleh BK tidak memberikan akses ke status tinjauan laporan tersebut; wali kelas hanya dapat melihat status tinjauan laporan yang dibuat selama masa penugasannya, termasuk bila isi laporan lama dibagikan.
- **DIKONFIRMASI**: wali kelas boleh mengambil tanggung jawab tindak lanjut untuk setiap laporan negatif murid di kelas perwaliannya segera setelah laporan masuk, sebelum triase BK.
- **DIKONFIRMASI**: ketika wali kelas mengambil sendiri tanggung jawab tugas tindak lanjut, tugas langsung dianggap “Sedang ditindaklanjuti”; tidak ada langkah “Mulai” terpisah. Label ini adalah status antarmuka, bukan keputusan nilai status database.
- **DIKONFIRMASI**: tugas pemantauan baru yang dibuat BK untuk wali kelas dimulai dengan label UI “Menunggu wali kelas”; setelah wali kelas mulai mengerjakannya, label berubah menjadi “Sedang ditindaklanjuti”, lalu “Selesai”. Nilai status database tetap belum diputuskan.
- **DIKONFIRMASI**: pemilik aktif tugas tindak lanjut dapat menandai tugas “Selesai” setelah tindakan yang diminta dituntaskan; persetujuan BK bukan prasyarat wajib. Jika diperlukan tindakan baru setelah tugas selesai, tugas tertaut dapat dibuat tanpa membuka kembali tugas yang sudah selesai.
- **DIKONFIRMASI**: tugas yang sudah selesai hanya dibuka kembali bila penutupan keliru atau tindakan yang sama belum tuntas; pembukaan kembali memerlukan alasan dan dicatat dalam riwayat. Tindakan/pemantauan baru menggunakan tugas baru yang tertaut.
- **DIKONFIRMASI**: status tugas tindak lanjut dan rekam konseling BK tetap independen. UI boleh menyediakan satu aksi eksplisit yang menuntaskan keduanya bila keduanya memang sudah selesai, tetapi penyelesaian tugas tidak otomatis menutup rekam konseling.
- **DIKONFIRMASI**: setiap perekaman harus dilengkapi waktu. Perbedaan waktu kejadian, waktu pencatatan sistem, dan cap waktu perubahan/status masih perlu dirinci.
- **DIKONFIRMASI**: rekaman mencatat waktu kejadian/tindakan bila relevan dan diketahui, terpisah dari waktu pencatatan sistem. Perubahan status dan pemilik mendapat cap waktu otomatis dalam riwayat.
- **DIKONFIRMASI**: seluruh pengguna berperan Guru BK dapat membaca rekam konseling; hanya BK yang sedang ditugaskan pada kasus dapat membuat/mengubah rekam tersebut. Saat penanggung jawab dipindahkan, hak tulis BK sebelumnya dicabut segera setelah penugasan baru tersimpan. Jika belum ada penanggung jawab, rekam tetap tampil dalam antrean bersama BK dan hanya dapat diubah setelah BK ditetapkan sebagai penanggung jawab. Pemberian peran Guru BK kepada pengguna baru karena itu memberikan akses baca lintas kasus dan perlu ditinjau sebelum perubahan keanggotaan.
- **DIKONFIRMASI**: pencabutan penanggung jawab BK tanpa pengganti dicatat dengan pelaku, waktu, BK lama, dan nilai penanggung jawab baru kosong; alasan tidak wajib.
- **DIKONFIRMASI**: wali kelas dapat membaca arahan tindakan dan ringkasan singkat BK hanya untuk murid di kelas perwaliannya; BK dapat memilih wali kelas tersebut sebagai penerima ringkasan khusus dalam cakupan kelas perwaliannya. Waka kesiswaan dan kamad hanya dapat membaca ringkasan singkat jika BK memilih mereka secara individual sebagai penerima; keputusan ini tidak mencakup rekam konseling lengkap.
- **DIKONFIRMASI**: ringkasan BK ditulis sebagai teks bebas, dengan rincian yang dipilih BK berdasarkan penilaian tentang informasi yang pantas dan diperlukan bagi penerima. Ringkasan bukan salinan rekam konseling, catatan mentah, atau analisis internal; tidak ada daftar field baku yang ditetapkan.
- **DIKONFIRMASI**: guru mata pelajaran yang mengajar murid terkait dapat membaca arahan tindakan BK. Hak ini tidak mencakup ringkasan sesi atau rekam konseling lengkap.
- **DIKONFIRMASI**: jadwal mengajar aktif yang tersimpan di aplikasi/database menjadi sumber penentuan guru mata pelajaran yang sedang mengajar murid terkait.
- **DIKONFIRMASI**: perubahan jadwal mengajar aktif langsung memperbarui hak baca arahan BK berdasarkan jadwal terbaru.
- **DIKONFIRMASI**: jika jadwal aktif kosong atau belum dimutakhirkan, akses arahan BK tidak diberikan sampai jadwal diperbaiki.
- **DIKONFIRMASI**: setiap pembacaan ringkasan BK yang dibagikan wajib dicatat dalam audit.
- **DIKONFIRMASI**: BK dapat mencabut pembagian ringkasan; setelah dicabut, akses untuk pembacaan berikutnya berhenti segera. Peristiwa pembagian dan pencabutan dicatat dalam audit; pencabutan tidak membatalkan informasi yang sudah dibaca penerima.
- **DIKONFIRMASI**: metadata audit untuk pembagian, pembacaan, dan pencabutan ringkasan mencatat pelaku, waktu, laporan, jenis peristiwa, penerima, dan identitas/versi ringkasan tanpa menyalin isi teks.
- **DIKONFIRMASI**: akses khusus ke log audit bagi peran selain admin teknis bersifat sementara dan berakhir otomatis; durasi spesifik ditentukan pada persetujuan, tanpa nilai baku yang telah disepakati.
- **DIKONFIRMASI**: akses khusus tersebut dibatasi pada kasus atau periode yang dicantumkan dalam persetujuan; akses tidak otomatis mencakup seluruh log.
- **DIKONFIRMASI**: setiap permintaan akses khusus ke log wajib mencatat alasan operasional, penerima, pemberi persetujuan, cakupan, dan masa berlaku.
- **DIKONFIRMASI**: pengguna dari peran apa pun boleh mengajukan permintaan akses khusus untuk kebutuhan operasional; pengajuan tidak memberikan akses dan tetap memerlukan persetujuan yang dicatat sebelum akses berlaku.
- **DIKONFIRMASI**: kepala madrasah atau waka kesiswaan masing-masing dapat menyetujui permintaan akses khusus secara mandiri. Persetujuan tidak otomatis memberikan hak baca log kepada pemberi persetujuan.
- **DIKONFIRMASI**: setelah akses khusus berakhir, pemberi persetujuan yang bukan penerima meninjau penggunaan akses tersebut berdasarkan metadata, bukan isi kasus.
- **DIKONFIRMASI**: pemberi persetujuan dan penerima akses khusus boleh orang yang sama. Jika demikian, peninjauan pasca-akses tidak diperlukan; jika pemberi persetujuan berbeda dari penerima, pemberi persetujuan meninjau penggunaan akses berdasarkan metadata.
- **DIKONFIRMASI**: untuk pola penolakan akses sensitif yang berulang, akun terautentikasi dikelompokkan berdasarkan aktor dan catatan sensitif yang sama dengan ambang minimal dua penolakan; percobaan tanpa autentikasi tidak dikelompokkan sebagai aktor yang sama. Satu penolakan tunggal tidak dicatat sebagai peristiwa dengan sendirinya.
- **DIKONFIRMASI**: laporan anomali yang ditinjau admin teknis tidak memerlukan tindak lanjut; penanganannya berhenti pada admin teknis.
- **DIKONFIRMASI**: dugaan akses tidak semestinya yang ditinjau admin teknis juga berhenti pada admin teknis; tidak ada pemberitahuan kepada pihak lain.
- **DIKONFIRMASI**: fitur perilaku sensitif yang digunakan BK tetap menjadi prioritas untuk dirilis tanpa menunggu durasi retensi ditetapkan. Batas akses yang telah dikonfirmasi tetap berlaku; keputusan ini tidak menetapkan durasi retensi atau aturan penghapusan.
- **PERLU KLARIFIKASI**: prosedur operasional akses bagi pembaca selain admin teknis, pelaksanaan dan pencatatan tinjauan admin, serta retensi log belum ditetapkan. Tinjauan umum oleh admin teknis dipilih hanya bila ada laporan/kekhawatiran tentang akses tidak semestinya atau anomali/peringatan akses/ekspor, termasuk dugaan upaya pihak tak terautentikasi atau non-penanggung jawab mengakses catatan sensitif; peninjauan tidak dilakukan secara berkala. Rentang waktu pengelompokan penolakan akses sensitif tetap terbuka sampai estimasi volume tersedia. Pengguna menyatakan belum ada rujukan kebijakan retensi audit madrasah; durasi retensi tidak ditetapkan sementara.
- **DIKONFIRMASI**: rekam konseling lengkap hanya dapat dibaca pengguna berperan Guru BK; tidak ada akses darurat (*break-glass*) bagi peran di luar BK.
- **DIKONFIRMASI**: setiap pembacaan rekam konseling dan setiap pembacaan ringkasan BK yang dibagikan wajib dicatat dalam audit. Pencatatan audit juga mencakup pembukaan akses, perubahan, penghapusan, dan override.
- **DIKONFIRMASI**: setiap unduh/ekspor data sensitif menghasilkan peristiwa audit tersendiri, terpisah dari pembacaan biasa, dan menggunakan metadata tanpa menyalin isi konten.
- **PERLU KLARIFIKASI**: masa retensi log, pelaksanaan dan pencatatan tinjauan metadata oleh admin teknis, serta rentang waktu untuk menghitung pengulangan (ditunda sampai estimasi volume tersedia). Pengguna belum mengetahui adanya rujukan kebijakan retensi audit madrasah. Peninjauan oleh pemberi persetujuan setelah akses khusus berakhir, jika ia bukan penerima, sudah dikonfirmasi terpisah.
- **RANCANGAN DOKUMEN**: membuka kembali kasus selesai wajib disertai alasan dan masuk ke riwayat audit. Ketentuan minimal 20 karakter yang tertulis dalam dokumen desain belum dikonfirmasi.

#### Catatan observasi dan insight guru

- **DIKONFIRMASI**: ada kebutuhan untuk membuat catatan perilaku murid yang bukan laporan insiden dan tidak otomatis memicu tindak lanjut formal. Catatan dapat merekam fakta, pendapat, asumsi, serta gambaran kemungkinan tindak lanjut mengenai murid secara individu, kelompok, atau kelas.
- **DIKONFIRMASI**: catatan dapat disimpan untuk keperluan guru sendiri dan dibagikan kepada guru lain sebagai insight, termasuk pendekatan yang berhasil dilakukan.
- **DI LUAR MVP**: fitur catatan observasi dan insight guru tidak termasuk MVP.
- **PERLU KLARIFIKASI**: rincian dan batasan catatan, alur penggunaan, klasifikasi, cakupan akses dan pembagian, serta pola interaksi antarperan. Catatan ini perlu dibedakan dari laporan insiden, catatan perilaku positif, tindak lanjut formal, dan rekam konseling; rincian pembedaan dan aturan aksesnya belum ditetapkan.

#### Catatan perilaku positif

- **DIKONFIRMASI**: satu menu “Catatan Perilaku” menyediakan pilihan Positif atau Laporan Negatif di awal input. Pilihan satu pintu ini tidak menyatukan penyimpanan, izin, atau alur tindak lanjut masing-masing jenis.
- **DIKONFIRMASI**: catatan positif tidak melalui triase kasus dan berfungsi sebagai informasi profil.
- **DIKONFIRMASI**: catatan positif hanya berupa entri profil murid; tidak memiliki tindak lanjut atau status kasus.
- **DIKONFIRMASI**: catatan positif hanya berupa entri profil murid; tidak memiliki tindak lanjut atau status kasus.
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
| Wali kelas | Profil murid kelas perwaliannya, agregat kehadiran kelas, apresiasi, laporan negatif asli segera setelah dikirim, tanggung jawab tindak lanjut yang dapat diambil sendiri sebelum triase BK, dan arahan/ringkasan BK untuk murid kelasnya. | Rekam sesi konseling dan catatan psikologis tetap terkunci; setelah tugas dikembalikan ke BK, hak tulis wali kelas dicabut tetapi hak baca-saja tetap berlaku. |
| Guru BK | Akses profil dan perilaku untuk penanganan; kendali rekomendasi dan akses ke rekam konseling sesuai kewenangan. | **PERLU KLARIFIKASI** pembagian tugas/akses jika ada beberapa petugas BK atau koordinator. |
| Waka kesiswaan/kamad | Ringkasan eksekutif, data agregat, status atau disposisi manajerial; bukan rekam konseling secara default dalam rancangan dokumen. | Hak akses detail per bidang tetap perlu diputuskan; akses darurat ke rekam konseling tidak diberikan. |
| Admin/Tata Usaha | Pengelolaan data induk dan informasi dasar sesuai tugas. | Hak akses admin terhadap data perilaku dan rekam konseling perlu ditetapkan secara terpisah; hak administrasi tidak otomatis berarti hak baca semua data sensitif. |

- **DIKONFIRMASI**: pada prinsipnya profil digunakan lintas peran dengan pembatasan informasi; admin mengatur pengecualian untuk informasi dasar dan BK mengatur pengecualian informasi perilaku.
- **RANCANGAN DOKUMEN**: backend hanya mengirim bidang yang boleh dibaca per peran/cakupan (misalnya kelas yang diajar), bukan sekadar menyembunyikan bidang sensitif pada tampilan. Ini adalah prinsip desain yang perlu dijabarkan ke aturan akses teknis.
- **RANCANGAN DOKUMEN**: aspek positif, minat, dan prestasi ditempatkan menonjol agar profil tidak hanya menyorot masalah/perilaku negatif.
- **DIKONFIRMASI**: gunakan “murid” pada konteks produk. **RANCANGAN DOKUMEN**: istilah tampilan dapat berbeda dari nama tabel/kolom lama seperti `siswa`; perubahan skema internal tidak diperlukan hanya demi bahasa UI.
- **PERLU KLARIFIKASI**: pengguna sebelumnya menyebut pihak yang boleh mengubah profil sebagai BK dan wali kelas kelas perwaliannya, lalu menyebut BK kembali. Dokumen profil menawarkan waka kesiswaan atau admin data sekolah sebagai kemungkinan pihak ketiga; siapa yang berwenang belum diputuskan.
- **PERLU KLARIFIKASI**: kedua dokumen pendukung membedakan perilaku positif/apresiasi dari perilaku negatif/insiden; catatan positif tidak melalui triase, sedangkan insiden negatif melalui triase BK, dan kategori insiden mencakup “Akademik”. Matriks izin juga dibedakan menurut positif/negatif. Namun, belum ditetapkan apakah catatan perlu dipisah khusus menjadi akademik dan nonakademik atau bagaimana pemisahan itu memengaruhi izin.

## 5. Kebutuhan pengalaman penggunaan

- **DIKONFIRMASI**: aplikasi harus sederhana, memakai teks singkat dan ikon yang mudah dipahami, serta diutamakan untuk ponsel.
- **DIKONFIRMASI**: kenyamanan dan kemudahan penggunaan harus diprioritaskan di semua jenis perangkat; penyajian metadata audit tidak boleh membuat antarmuka kerja menjadi padat.
- **DIKONFIRMASI**: kurangi beban kognitif, kebosanan, dan kelelahan akibat terlalu banyak menggulir, mencari fitur, dan melakukan CRUD.
- **DIKONFIRMASI**: modul perilaku menggunakan satu menu utama dengan ruang kerja di dalam modul yang menyesuaikan peran pengguna, bukan menambah menu tingkat atas terpisah untuk setiap alur.
- **DIKONFIRMASI**: pengguna dengan beberapa peran melihat pekerjaan dalam satu daftar yang dikelompokkan menurut jenis tugas/peran, bukan harus berpindah mode peran. Setiap kelompok tetap mengikuti hak akses masing-masing.
- **DIKONFIRMASI**: halaman awal modul perilaku menyesuaikan pekerjaan utama pengguna. Guru yang terutama mencatat dapat langsung menginput; BK/wali kelas melihat daftar pekerjaan; pengguna multi-peran melihat daftar tugas terkelompok dengan aksi “Catat” tetap mudah dijangkau.
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
- **DIKONFIRMASI**: seluruh pengguna dengan peran Guru BK dapat membaca rekam konseling; hanya BK yang sedang ditugaskan dapat membuat atau mengubah rekam kasus, dan hak tulis BK sebelumnya dicabut segera setelah penugasan baru tersimpan. Jika belum ada penanggung jawab, rekam konseling berada dalam antrean bersama BK dan hanya dapat diubah setelah BK ditetapkan sebagai penanggung jawab. Wali kelas hanya menulis/mengubah catatan tindak lanjut terpisah selama ditugaskan, lalu baca-saja setelah tugas dikembalikan ke BK. Catatan kerja tugas dapat dibaca pemilik saat ini, pihak yang menugaskan, BK yang menangani kasus, serta wali kelas sebelumnya secara baca-saja setelah tugas dialihkan; hanya pemilik aktif yang dapat menambah/mengubah catatan.
- **DIKONFIRMASI**: setiap pembacaan rekam konseling dicatat dalam audit. Penghapusan tindak lanjut wali kelas memerlukan alasan dan audit metadata; isi yang dihapus tidak disalin ke log audit.
- **DIKONFIRMASI**: penugasan/perpindahan tugas selain pengambilalihan oleh BK dan pembukaan kembali tugas selesai mencatat waktu serta pemilik lama/baru tanpa alasan tambahan bila tujuan tugas sudah jelas; alasan wajib untuk pengambilalihan BK dan reopen. Riwayat perpindahan penanggung jawab rekam konseling dapat dibaca semua pengguna berperan BK.
- **PERLU KLARIFIKASI**: prosedur operasional akses dan audit. Penerima ringkasan waka/kamad dipilih BK secara individual; akses wali kelas atas ringkasan tetap terbatas pada kelas perwaliannya.
- **PERLU KLARIFIKASI**: rincian perlindungan log, retensi log, serta pihak yang meninjau log secara umum dan prosedur operasional akses khusus. Metadata audit pembagian, pembacaan, dan pencabutan ringkasan sudah ditetapkan pada bagian tata kelola di atas.
- **PERLU KLARIFIKASI**: kebijakan keamanan, retensi, pencadangan, pemulihan, dan penghapusan data, terutama data kontak, kebutuhan khusus, serta perilaku murid.
- **PERLU KLARIFIKASI**: sumber kebijakan madrasah atau ketentuan lain yang harus menjadi acuan pengelolaan data.
- Keputusan akses dan audit di atas adalah kebutuhan produk, bukan bukti bahwa RLS, server, atau database produksi sudah menegakkannya. Verifikasi implementasi dan uji akses harus dilakukan terpisah sebelum menyimpulkan kesiapan penggunaan data riil.

## 9. To-do klarifikasi yang masih terbuka

Item di bawah ini adalah keputusan yang belum dijawab atau baru tercatat sebagai rancangan. Kalender ujian/Ramadan sudah diputuskan untuk ditunda, sedangkan cakupan minimum offline (baca jurnal/presensi, buat jurnal/presensi, dan baca data lain sesuai izin) sudah dikonfirmasi; keduanya tidak ditanyakan ulang di daftar ini.

- [ ] **Bahas notifikasi dan ekspor setelah logika serta UI/UX jurnal mengajar dan perilaku MVP selesai.** Keduanya termasuk MVP; pemicunya untuk mulai dibahas adalah permintaan pengguna.
- [ ] **Tuntaskan pengamanan operasional profil/perilaku sensitif.** Sepakati kontrol akses dan audit, penanggung jawab pencadangan/pemulihan, kewenangan penghapusan, serta kebijakan retensi/penghapusan dan rujukan kebijakan madrasah yang berlaku. Pengguna memprioritaskan rilis fitur sensitif untuk BK tanpa menunggu durasi retensi; hal ini tidak menetapkan durasi atau aturan penghapusan. Lihat [rekomendasi prasyarat perlindungan data sensitif](./prasyarat-perlindungan-data-sensitif.md) sebagai panduan usulan, bukan keputusan yang telah disahkan.
- [ ] **Selesaikan rincian akses laporan dan pimpinan.** Pelapor dapat melihat laporan sendiri dan status penanganan; wali kelas dapat langsung membaca laporan negatif asli dan mengambil tanggung jawab tindak lanjut untuk murid kelas perwaliannya sebelum triase BK; arahan BK mengikuti jadwal mengajar aktif. Rekam konseling hanya dapat dibaca BK, tanpa akses darurat bagi peran lain; hak tulis BK lama dicabut segera setelah penugasan baru tersimpan dan rekam tanpa penanggung jawab masuk antrean BK dengan hak ubah ditahan sampai ada penugasan. Hanya pemilik aktif dapat menulis catatan tugas; mantan wali kelas tetap baca-saja setelah pengalihan. Prosedur operasional akses dan audit masih perlu diputuskan.
- [ ] **Tetapkan tata kelola audit akses.** Setiap baca rekam konseling, baca ringkasan BK yang dibagikan, dan penghapusan tindak lanjut wali kelas dengan alasan wajib dicatat; tetapkan data yang masuk log, retensi, pihak yang meninjau, perlindungan log, dan apakah unduh data sensitif juga diaudit.
- [ ] **Setujui alur kasus dan hak tindakan.** Guru dapat menuntaskan tindakan awal sebagai Ditangani di Tempat sambil laporan tetap dapat ditinjau BK; BK dapat menugaskan tindak lanjut ke wali kelas atau BK. Jika tindakan BK selesai tetapi pemantauan masih diperlukan, tugas pemantauan wali kelas terpisah dan tertaut; rekam BK tetap selesai. Status laporan, tugas, dan rekam konseling sudah diputuskan terpisah; label antarmuka tugas “Menunggu wali kelas/BK” → “Sedang ditindaklanjuti” → “Selesai” sudah dikonfirmasi. Tetapkan nilai/transisi masing-masing, pemetaan status yang lama, siapa yang boleh menutup/membuka kembali kasus, dan alasan/riwayat apa yang diwajibkan.
- [ ] **Tetapkan matriks hak akses profil per bidang dan per peran.** Khususnya data kesehatan/kebutuhan khusus, informasi dasar/kontak, perilaku positif, ringkasan insiden, ringkasan BK, kehadiran, serta data akademik. Hak guru mapel yang mengajar murid untuk membaca arahan tindakan BK sudah dikonfirmasi; cakupan data lain tetap perlu diputuskan. Dokumen pendukung membedakan izin perilaku positif dan negatif, tetapi belum menetapkan perlu tidaknya pemisahan akademik/nonakademik dan dampaknya pada izin. Tentukan pula batas data yang di-cache untuk baca offline agar hak akses tidak melebar.
- [ ] **Rancang catatan observasi dan insight guru di luar MVP.** Bahas rincian/batasan, alur dan klasifikasi catatan, cakupan akses serta pembagian, dan pola interaksi antarperan. Catatan ini bukan laporan insiden atau tindak lanjut formal; aturan pemisahannya dari jenis catatan lain belum ditetapkan.
- [ ] **Putuskan cakupan cek pemahaman/asesmen singkat dalam jurnal.** Tentukan apakah pencatatan retrieval atau diagnosis tingkat kelas diperlukan, apakah hasilnya cukup dirangkum pada refleksi jurnal, serta apakah nilai individual diperlukan dan masuk MVP. Jika nilai individual dibutuhkan, tentukan tujuan/bobot, cara menghindari input ganda daftar murid, hak akses, dan bentuk rekap; jangan menganggap kegiatan retrieval otomatis sebagai nilai formal.
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