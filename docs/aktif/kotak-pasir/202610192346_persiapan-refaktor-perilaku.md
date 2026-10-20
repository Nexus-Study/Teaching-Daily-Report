# Membandingkan konsep-penanganan-perilaku.md, konteks-penggunaan.md, dan app/portal/perilaku untuk refaktor kode dan perbaikan UI/UX/Logika Data

- **Status:** Terbuka
- **Dibuat:** 2026-10-19

## Ringkasan perkembangan diskusi pengguna dan Copilot (2026-10-20 00:13—2026-10-21 00:50 WIT)

- Diskusi membandingkan konsep, keputusan produk, dan implementasi untuk menyiapkan wireframe serta refaktor; belum ada perubahan aplikasi. Skenario yang dibahas memisahkan laporan, tinjauan BK, tugas tindak lanjut, arahan/ringkasan, dan rekam konseling. Wireframe A dipilih, tetapi wireframe rinci dan nilai status database belum ditetapkan.
- Batas akses utama telah dikonfirmasi: hanya BK dapat membaca rekam konseling, dan hanya penanggung jawab BK aktif yang dapat mengubahnya; tanpa penanggung jawab, rekam berada di antrean bersama dan baca-saja. Catatan tugas dapat dibaca pihak terkait sesuai peran, tetapi hanya pemilik aktif yang menulis. Arahan dan ringkasan BK dibagikan sesuai cakupan, terpisah dari rekam konseling.
- Audit menggunakan metadata tanpa menyalin konten sensitif. Admin teknis meninjau log ketika ada laporan atau anomali; akses khusus memerlukan persetujuan dan berakhir otomatis. Retensi belum ditetapkan. Sementara itu log tidak dihapus otomatis dan peristiwa wajib tidak dikurangi; gunakan metadata minimum, hindari duplikasi, dan pantau metrik agregat. Penolakan berulang dikelompokkan hanya untuk akun terautentikasi pada aktor dan catatan yang sama, minimal dua kali; rentang waktunya masih terbuka. Fitur sensitif BK diprioritaskan tanpa menunggu keputusan retensi.

## Hasil sementara

### Kesepakatan bersama

- Tujuan percakapan ini adalah membandingkan konsep, konteks yang sudah disepakati, dan aplikasi aktual untuk kemudian menentukan wireframe, UI/UX, menu, alur, perampingan kode, serta hubungan antarperan.
- Belum ada perubahan kode aplikasi. Keputusan produk yang dikonfirmasi dicatat di sumber kanonis; wireframe rinci dan rancangan refaktor belum dibuat.
- Pengelolaan log audit perlu menghindari beban yang tidak perlu pada database karena aplikasi menggunakan Supabase online free tier, terutama terkait biaya/kuota, kapasitas, dan kinerja baca/tulis. Prinsip ini belum menetapkan durasi retensi, batas beban, atau metode teknis.
- Peristiwa audit yang sudah diwajibkan tetap dicatat; penghematan dicari melalui metadata minimum yang diperlukan, menghindari duplikasi, dan evaluasi penyimpanan/akses setelah volume serta kebijakan retensi diketahui. Prinsip ini disetujui sebagai arah umum, bukan keputusan teknik atau durasi.
- Ringkasan BK berupa teks bebas terpisah dari rekam konseling; BK memilih rincian yang pantas dibagikan dan penerimanya sesuai cakupan peran, serta dapat mencabut akses untuk pembacaan berikutnya.
- Metadata audit mencatat pembagian, pembacaan, pencabutan ringkasan, dan unduh/ekspor sensitif sebagai peristiwa yang sesuai tanpa menyalin isi sensitif. Rincian audit tidak boleh mengorbankan kemudahan penggunaan di berbagai perangkat.
- Akses baca default ke log audit hanya untuk admin teknis. Akses khusus bagi peran lain bersifat sementara, otomatis berakhir, dibatasi cakupan yang disetujui, wajib memiliki alasan operasional, dan penggunaan ditinjau oleh pemberi persetujuan setelah berakhir jika ia bukan penerima. Peninjauan hanya membaca metadata.
- Log audit secara umum ditinjau admin teknis bila ada laporan/kekhawatiran tentang akses yang tidak semestinya atau anomali/peringatan akses/ekspor, termasuk dugaan upaya pihak tak terautentikasi atau non-penanggung jawab mengakses catatan sensitif. Peninjauan bukan berkala; prosedur operasionalnya belum diputuskan. Akses khusus bagi peran lain tetap mengikuti persetujuan dan cakupan yang disepakati.
- Untuk akun terautentikasi, penolakan akses sensitif dicatat hanya setelah aktor yang sama mencoba catatan yang sama minimal dua kali; percobaan tanpa autentikasi tidak dikelompokkan sebagai aktor yang sama. Rentang waktu tetap terbuka sampai estimasi volume tersedia.
- Kepala madrasah atau waka kesiswaan masing-masing dapat menyetujui akses khusus ke log secara mandiri. Persetujuan tidak memberi hak baca log dengan sendirinya; alur persetujuan tetap memerlukan alasan, penerima, cakupan, dan masa berlaku yang sudah ditetapkan.
- Penerima akses khusus boleh menjadi pemberi persetujuan; bila penyetuju adalah penerima, peninjauan pasca-akses tidak diperlukan.
- Pengguna dari peran apa pun boleh mengajukan akses khusus untuk kebutuhan operasional. Permintaan tetap harus disetujui dan dicatat sebelum akses diberikan.
- Hak guru mata pelajaran untuk membaca arahan BK ditentukan dari jadwal mengajar aktif yang tersimpan di aplikasi/database; perubahan jadwal langsung memperbarui akses.
- Jika jadwal aktif kosong atau terlambat diperbarui, akses arahan BK tidak diberikan sampai jadwal diperbaiki.
- Semua pengguna berperan BK memiliki kewenangan menetapkan diri sendiri atau BK lain sebagai penanggung jawab; hanya BK yang sedang ditugaskan dapat membuat atau mengubah rekam konseling.
- Saat penanggung jawab baru tersimpan, hak tulis BK sebelumnya dicabut segera; hak baca seluruh pengguna BK tetap berlaku.
- Jika belum ada penanggung jawab, rekam konseling tampil dalam antrean bersama BK dan tetap baca-saja sampai penanggung jawab BK ditetapkan.
- Perpindahan penanggung jawab rekam konseling cukup mencatat identitas pelaku, waktu, serta penanggung jawab lama dan baru; alasan operasional tidak wajib.
- Semua pengguna berperan BK dapat membaca riwayat perpindahan penanggung jawab rekam konseling.
- Rekam konseling lengkap hanya dapat dibaca pengguna berperan BK; tidak ada akses darurat bagi peran di luar BK.
- Catatan kerja pada tugas tindak lanjut dapat dibaca pemilik saat ini, pihak yang menugaskan, dan BK yang menangani kasus; wali kelas yang pernah memegang tugas tetap memiliki hak baca-saja setelah tugas dialihkan kembali ke BK. Hanya pemilik tugas saat ini yang dapat menambah atau mengubah catatan; wali kelas dapat menulis selama memegang penugasan.
- Laporan anomali dan dugaan akses tidak semestinya yang ditinjau admin teknis berhenti pada admin dan tidak diberitahukan kepada pihak lain.
- Fitur perilaku sensitif untuk BK diprioritaskan untuk rilis meskipun durasi retensi belum ditetapkan; ini tidak memperluas hak akses atau menetapkan aturan penghapusan.
- Selama masa retensi belum ditetapkan, log tidak dihapus otomatis dan peristiwa wajib tidak dikurangi; metadata diminimalkan, duplikasi dihindari, dan metrik agregat sumber daya dipantau. Pengarsipan, penghapusan, atau perubahan pencatatan memerlukan keputusan tersendiri.

### Fakta dan keputusan yang menjadi batas

- **Keputusan yang dikonfirmasi** di [konteks-penggunaan.md](../../konteks-penggunaan.md) mengikat; konsep lain tetap usulan sampai disetujui.
- Implementasi yang ditinjau memakai `catatan_perilaku` dan `penanganan_perilaku`, dengan halaman input/rekap. Form positif masih dapat memuat tindakan awal; kebutuhan audit/penghapusan belum sepenuhnya tercermin. Ini adalah gap implementasi, bukan perubahan keputusan.
- Guru dapat menyelesaikan tindakan awal laporan negatif tanpa menunggu BK; laporan juga boleh disimpan sebelum tindakan awal, dengan keadaan “Belum ada tindakan awal”, dan semua laporan tersimpan dapat ditinjau BK. BK dapat menambah tindak lanjut setelah tindakan awal dan setiap penugasan langsung ke BK membuka rekam konseling tersendiri.
- Hanya pelapor yang menambahkan tindakan awalnya sendiri ke riwayat laporan; tindakan wali kelas/BK dicatat melalui tugas masing-masing, bukan mengubah riwayat tindakan pelapor.
- Jika pelapor mencatat tindakan setelah laporan tersimpan sebagai “Belum ada tindakan awal”, status terkini mengikuti hasil tindakan itu dan status/catatan sebelumnya tetap ada di riwayat bertimestamp.
- Tinjauan BK memiliki status/penanda terpisah dari status tindakan awal laporan, tugas tindak lanjut, dan rekam konseling; statusnya “Belum ditinjau”/“Sudah ditinjau”, dengan petugas dan waktu dicatat. Hasil triase disimpan terpisah.
- Pelapor melihat status tinjauan untuk laporannya sendiri, tetapi tidak hasil triase atau catatan internal BK.
- Wali kelas melihat status tinjauan laporan murid di kelas perwaliannya, tetapi tidak hasil triase atau catatan internal BK selain arahan/ringkasan yang dibagikan.
- Waka/kamad hanya melihat status tinjauan bila BK memasukkannya secara eksplisit ke ringkasan yang dibagikan; tidak ada akses langsung tambahan.
- Guru mapel yang mengajar murid terkait tetapi bukan pelapor/wali kelas hanya melihat arahan BK yang dibagikan, tanpa akses langsung ke status tinjauan atau hasil triase.
- Admin aplikasi/teknis tidak mendapat akses ke isi laporan, hasil triase, atau rekam konseling untuk dukungan teknis; troubleshooting menggunakan metadata, data yang disamarkan, atau bantuan BK. Admin teknis tetap dapat membaca log audit metadata sesuai batas yang ditetapkan.
- Hanya admin teknis yang memiliki akses baca default ke log audit; pembacaan log oleh admin teknis juga dicatat. Akses khusus untuk peran lain dibatasi pada kasus/periode yang disetujui, wajib menyertakan alasan, penerima, pemberi persetujuan, cakupan, dan masa berlaku, serta berakhir otomatis. Setelah akses berakhir, pemberi persetujuan meninjau metadata pemakaian jika ia bukan penerima; tinjauan tidak membuka isi kasus.
- Log audit tidak dapat diedit/dihapus secara langsung; koreksi dicatat sebagai peristiwa baru, dan penghapusan karena retensi menggunakan proses terpisah yang berwenang serta tercatat.
- Setiap pembacaan status tinjauan BK diaudit dengan identitas pembaca dan waktu akses.
- Metadata audit mencakup pembaca, waktu, identitas laporan, dan jenis akses, tanpa menyalin isi laporan, hasil triase, atau catatan BK.
- Pembacaan isi laporan asli, hasil triase, dan status sementara yang dilindungi juga diaudit untuk peran yang berwenang, menggunakan metadata tanpa menyalin konten sensitif.
- Pembagian, pembacaan, dan pencabutan ringkasan dicatat dengan identitas pelaku, waktu, identitas laporan, jenis peristiwa, penerima, dan identitas/versi ringkasan; teks ringkasan tidak disalin ke log. Setiap unduh/ekspor data sensitif menjadi peristiwa audit tersendiri, terpisah dari pembacaan.
- Ringkasan BK berupa teks bebas terpisah dari rekam konseling; BK memilih rincian yang pantas untuk penerima, bukan menyalin rekam konseling, catatan mentah, atau analisis internal. Penerima dipilih individual; akses wali kelas tetap dalam cakupan kelas perwaliannya dan pencabutan menghentikan pembacaan berikutnya.
- Kenyamanan dan kemudahan penggunaan di semua perangkat merupakan prioritas; penyajian rincian audit tidak boleh membuat antarmuka kerja padat.
- Status menjadi “Sudah ditinjau” hanya setelah petugas BK secara eksplisit menyelesaikan/menyimpan tinjauan dan hasil triase; membuka laporan saja tidak mengubah status.
- Jika pelapor menambahkan tindakan awal setelah BK meninjau, status kembali “Belum ditinjau”; riwayat tinjauan sebelumnya tetap dipertahankan.
- Bila tindak lanjut diperlukan, status “Sudah ditinjau” baru dicapai setelah keputusan triase dan penugasan tugas yang sesuai berhasil dicatat.
- BK dapat mencatat hasil sementara “Perlu informasi tambahan” tanpa menyelesaikan tinjauan; statusnya tetap “Belum ditinjau” sampai keputusan akhir.
- Hasil sementara “Perlu informasi tambahan” tidak otomatis membuat tugas; tugas dibuat hanya untuk tindakan konkret dengan pemilik yang ditugaskan.
- Penyelesaian tugas pengumpulan informasi tidak otomatis menuntaskan tinjauan BK; tinjauan tetap “Belum ditinjau” sampai BK memeriksa informasi dan menyimpan hasil triase akhir serta penugasan tindak lanjut yang diperlukan.
- Tinjauan BK berada di antrean bersama; petugas BK yang berwenang dapat menyelesaikan yang belum diklaim. Jika diklaim/ditugaskan kepada petugas tertentu, hanya pemilik aktif yang menuntaskan sampai pengalihan tercatat; identitas dan waktu dicatat.
- Semua pengguna berperan BK dapat membaca hasil triase, status sementara, dan pemilik tinjauan; hanya pemilik aktif yang menyelesaikan tinjauan yang sudah diklaim.
- Klaim tinjauan hanya menetapkan pemilik aktif dan mencatatnya di riwayat; tidak mengubah status tinjauan atau membuat tugas tindak lanjut.
- Satu laporan boleh memiliki beberapa tugas tindak lanjut tertaut yang berjalan bersamaan untuk aksi/pemilik berbeda; setiap tugas memiliki status dan riwayat independen.
- Bila tinjauan memerlukan beberapa tugas, status “Sudah ditinjau” baru dicapai setelah semua tugas yang diputuskan berhasil dicatat.
- Tindakan awal guru yang selesai dicatat dalam riwayat laporan, bukan tugas tersendiri. Tugas hanya dibuat untuk tindakan lanjutan yang masih perlu dituntaskan; tidak ada tugas atau rekam konseling otomatis jika tidak ada tindak lanjut dan BK belum ditugaskan.
- Laporan, tugas tindak lanjut, status tinjauan, dan rekam konseling memiliki status terpisah. Label UI tugas yang disepakati ialah “Menunggu wali kelas/BK” → “Sedang ditindaklanjuti” → “Selesai”; wali kelas yang mengambil sendiri tugas langsung memulainya, tugas yang dibuat BK menunggu penerima memulai, dan pengambilalihan BK mempertahankan tahap berjalan. Nilai status database belum diputuskan.
- Catatan positif hanya menjadi entri profil. Satu menu “Catatan Perilaku” dipilih sebagai pintu input untuk Positif/Laporan Negatif, dengan alur dan data yang tetap terpisah.
- Wireframe A dipilih: satu menu utama Perilaku dan ruang kerja di dalam modul. Pengguna multi-peran melihat daftar pekerjaan yang dikelompokkan menurut jenis tugas/peran; halaman awal menyesuaikan pekerjaan utama dan aksi “Catat” tetap mudah dijangkau.
- Kenyamanan dan kemudahan penggunaan harus menjadi prioritas di semua perangkat; UI tidak boleh menjadi padat hanya untuk menampilkan metadata audit.
- Pelapor dapat melihat laporan sendiri dan statusnya. Wali kelas dapat segera membaca laporan negatif asli dan mengambil tanggung jawab tindak lanjut untuk murid di kelas perwaliannya sebelum triase BK; saat mengambil tugas, status UI langsung “Sedang ditindaklanjuti”. Arahan BK untuk guru mapel hanya tersedia bagi guru yang mengajar murid terkait. Akses ini tidak membuka rekam konseling.
- BK dapat memberi arahan dan ringkasan sesi yang terpisah dari rekam konseling. Ringkasan ditulis dalam area teks; BK memilih rincian yang dinilai pantas bagi penerima, bukan menyalin rekam konseling, catatan mentah, atau analisis internal. Wali kelas membaca informasi sesuai kelas perwaliannya dan dapat dipilih BK untuk menerima ringkasan khusus murid dalam cakupan itu; waka/kamad menjadi penerima ringkasan yang dipilih BK secara individual. BK dapat mencabut pembagian; akses untuk pembacaan berikutnya berhenti segera dan peristiwa pembagian/pencabutan diaudit.
- Arahan umum tanpa tindakan yang harus dituntaskan boleh berupa rekomendasi saja. Jika ada tindakan spesifik yang perlu dilaksanakan, gunakan tugas berpemilik dan berstatus; rekomendasi dapat menjadi panduannya.
- Jika BK mengambil alih tugas wali kelas yang berjalan, tugas yang sama berpindah ke BK dan riwayat wali dipertahankan. Petugas BK mana pun dapat mengambil alih dengan alasan singkat-operasional; waktu serta pemilik lama/baru dicatat. Status UI tetap “Sedang ditindaklanjuti”; hanya pemilik yang berubah. Jika pekerjaan BK selesai tetapi pemantauan masih dibutuhkan, buat tugas wali kelas baru yang tertaut, tanpa membuka kembali tugas/rekam BK.
- Pemilik aktif dapat menandai tugas “Selesai” setelah tindakan yang diminta tuntas; persetujuan BK bukan prasyarat. Bila muncul pekerjaan tambahan, tugas baru dapat ditautkan.
- Tugas yang sudah selesai hanya dibuka kembali bila penutupan keliru atau tindakan yang sama belum tuntas, dengan alasan dan riwayat; tindakan/pemantauan baru menggunakan tugas tertaut yang baru.
- Petugas BK yang berwenang dapat menetapkan tugas kepada dirinya sendiri atau petugas BK lain; tiap tugas memiliki satu pemilik aktif. Perpindahan biasa mencatat waktu dan pemilik lama/baru tanpa alasan tambahan bila tujuan tugas jelas; alasan singkat wajib untuk pengambilalihan oleh BK dan reopen.
- Status tugas dan rekam konseling BK independen. Penyelesaian tugas tidak otomatis menutup rekam; UI boleh menawarkan satu aksi gabungan yang secara eksplisit menuntaskan keduanya.
- Waktu kejadian/tindakan (bila relevan dan diketahui) dibedakan dari waktu pencatatan sistem; perubahan status dan pemilik memiliki cap waktu otomatis di riwayat.
- Rekam konseling tetap terbatas sesuai keputusan akses; daftar keputusan dan pertanyaan akses yang masih terbuka ada di sumber kanonis, bukan ditentukan oleh wireframe.

### Rekomendasi belum dikonfirmasi

- Rancang alur konkret dan wireframe sebelum menetapkan pemisahan komponen atau refaktor; lanjutkan bagian MVP yang tidak bergantung pada keputusan terbuka.
- Tangani gap positif-versus-triase serta audit/penghapusan sebagai kebutuhan inti, bukan sekadar pemolesan tampilan. Jangan menyimpulkan kesiapan akses data sensitif/produksi dari UI atau migrasi repository saja.

### Langkah berikutnya

- Lengkapi matriks baca/tulis/audit dari keputusan yang sudah dikonfirmasi; bahas hal terbuka, termasuk sumber penugasan konselor, prosedur akses khusus, retensi log, dan rentang waktu pengelompokan penolakan.
- Setelah aturan perilaku dan akses cukup jelas, turunkan menjadi wireframe ponsel untuk peran tunggal dan multi-peran.
- Baru sesudah aturan dan wireframe cukup jelas, petakan gap data/komponen dengan implementasi untuk menentukan refaktor yang diperlukan.
- Nilai status database, format/zona waktu dan koreksi waktu kejadian, serta transisi teknis tetap belum diputuskan. Retensi log belum memiliki rujukan kebijakan dan perlu menghindari beban biaya/kuota, kapasitas, serta kinerja pada Supabase online free tier; durasi serta cara mengukurnya belum ditentukan. Penolakan akses oleh aktor terautentikasi yang sama terhadap catatan yang sama dicatat minimal dua kali; percobaan tanpa autentikasi tidak dikelompokkan sebagai aktor yang sama, sedangkan rentang waktu dibiarkan terbuka sampai estimasi volume tersedia. Prosedur peninjauan dan akses khusus masih perlu dirinci.

## Catatan pengguna tentang hasil sementara

[Opsional. Pengguna dapat menambahkan koreksi atau menjelaskan bagian yang tidak mewakili pemahamannya. Copilot menanggapi di bawah catatan ini tanpa menghapusnya.]

## Tanggapan Copilot atas catatan pengguna

[Konfirmasi dan perbaikan ringkasan, atau penjelasan perbedaan pandangan beserta pertanyaan klarifikasi.]


## Rujukan bersama khusus untuk diskusi ini
docs\konsep-penanganan-perilaku.md (dokumen ini digunakan sebagai rujukan. gunakan sebagai dasar pembuatan desain UI/UX, logika/alur, dan wireframe. Konflik keputusan di diskusi ini dengan isi dokumen akan didiskusikan melalui inisiasi oleh Copilot)
docs\konteks-penggunaan.md (konteks pengguna, sumber kebenaran utama, konflik dengan dokumen lainnya tidak boleh mengubah konteks-penggunaan.md kecuali setelah disepakati bersama oleh pengguna dan copilot)
docs\prasyarat-perlindungan-data-sensitif.md (dasar untuk melindungi data anak-anak. Realitanya, penggunaan data anak-anak seketat sebagaimana di dalam dokumen, sesuai dengan konteks kerja pengguna tempat aplikasi akan dipakai. Penting bagi copilot untuk meminta konteks lengkap ketika akan membatasi data.)


## Skill yang perlu Copilot Gunakan
- anti-slop-design
- redesign-existing-projects
- design-taste-frontend

## Rencana diskusi terperinci

Kita lanjutkan satu tahap dan satu kelompok keputusan pada satu waktu. Pada tiap tahap, bedakan keputusan yang sudah dikonfirmasi dari pertanyaan yang masih terbuka; saya akan membandingkan opsi dan dampaknya, lalu meminta pilihan sebelum mencatat keputusan baru. Rencana ini mengatur urutan diskusi, bukan persetujuan atas rincian yang belum diputuskan.

1. [x] **Petakan skenario dan jenis rekaman.** Gambar alur ringkas untuk (a) guru menuntaskan tindakan awal di tempat, (b) wali kelas mengambil tindak lanjut sebelum triase, (c) BK mengambil alih tugas wali kelas, dan (d) BK menyelesaikan penanganan lalu membuat tugas pemantauan wali kelas yang tertaut. Tandai pada setiap langkah apakah yang berubah adalah laporan, tugas, rekam konseling, atau arahan saja. Hasil tahap ini: skenario dan hubungan antarrekaman, tanpa memilih nilai status teknis.
2. [x] **Tentukan siklus hidup dan pemilik tiap tugas.** Dari skenario tersebut, bahas siapa yang dapat membuat tugas, kapan status tugas mulai/selesai, bagaimana tugas berpindah pemilik, apa yang terjadi pada catatan kerja saat pemilik berpindah, dan kapan tugas baru tertaut diperlukan. Pengambilalihan oleh BK dan pembukaan kembali tugas selesai memerlukan alasan; perpindahan lain mencatat waktu serta pemilik lama/baru tanpa alasan tambahan bila tujuan tugas jelas. Hasil tahap ini: tabel transisi beserta aktor dan prasyaratnya.
3. [x] **Lengkapi matriks baca/tulis dan audit.** Tinjau peran pelapor, guru mapel, wali kelas, BK, waka/kamad, dan admin untuk setiap jenis informasi: laporan asli, status, tugas/catatan tindak lanjut, arahan, ringkasan sesi, dan rekam konseling. Mulai dari akses yang sudah dikonfirmasi dan fokuskan pertanyaan pada batas yang belum terjawab—termasuk sumber penugasan, isi serta pencabutan ringkasan yang dibagikan, log yang wajib dicatat, akses ke log, dan retensinya. Hasil tahap ini: matriks yang membedakan baca, tambah, ubah, hapus, dan audit; bukan asumsi bahwa RLS saat ini sudah menegakkannya. Tahap ini telah dibahas, tetapi beberapa rincian operasional dan retensi masih terbuka.
4. [x] **Turunkan alur menjadi wireframe ponsel.** Gunakan keputusan satu menu Perilaku, satu daftar tugas terkelompok untuk multi-peran, halaman awal sesuai pekerjaan, serta aksi “Catat” yang mudah dijangkau. Rancang layar dan keadaan utama per skenario: daftar kerja, detail laporan/tugas, perpindahan pemilik, rekomendasi tanpa tugas, tugas tertaut, status kosong, dan konfirmasi tindakan. Periksa apakah tiap peran dapat memahami tindakan berikutnya tanpa melihat informasi di luar haknya. Hasil tahap ini: wireframe teks atau sketsa konseptual untuk ditinjau; belum menjadi spesifikasi visual atau UI final.
5. [x] **Tinjau pemisahan menu dan hubungan ruang kerja.** Uji wireframe terhadap tujuan input, tinjauan laporan BK, tugas wali kelas, arahan, ringkasan yang dibagikan, dan rekap. Pastikan struktur internal tidak menambah menu tingkat atas yang bertentangan dengan pilihan Wireframe A; catat bila ada kebutuhan rute internal, tanpa memutuskan implementasi navigasi terlebih dahulu. Rekap rinci ditunda karena akses peran belum dikonfirmasi; penundaan tidak mengunci atau mencampurkan rekap dengan tugas dan harus tetap memungkinkan penambahan tampilan internal kelak.
6. [x] **Petakan keputusan ke data dan kode.** Bandingkan keputusan terkonfirmasi dan wireframe dengan tabel, Server Actions, RLS, audit, halaman, dan tes yang ada. Tandai bagian yang dapat dipertahankan, perlu dipisahkan, atau perlu dimigrasikan; tandai juga hal yang belum diputuskan/terverifikasi. Hasil tahap ini adalah batas refaktor sementara untuk ditinjau, bukan perubahan kode. Pemetaan repository telah dibahas; data historis dan konfigurasi Supabase aktif belum diverifikasi.
7. [x] **Tentukan gerbang verifikasi sebelum implementasi sensitif.** Rencanakan pengujian negatif server-side/RLS dan pemeriksaan audit pada lingkungan aman; bedakan bukti repository dengan konfigurasi deployment. Matriks tes telah dibahas dan diterima, tetapi lingkungan aman belum tersedia sehingga belum ada tes yang dijalankan. Jangan gunakan data murid nyata untuk uji destruktif.

**Arti penanda:** `[x]` berarti topik tersebut telah dibahas, bukan berarti semua rincian telah diputuskan, implementasi selesai, atau tes lulus. Tahap 3 telah dibahas tetapi beberapa prosedur masih terbuka. Tahap 6–7 telah dipetakan berdasarkan repository dan keputusan yang tersedia; pelaksanaan tetap tertahan oleh pertanyaan terbuka dan belum tersedianya lingkungan uji aman.

**Urutan lanjut:** role input perilaku telah dikonfirmasi sebagai Guru BK, wali kelas, guru mata pelajaran, dan guru tahfizh; pemilih murid hanya menampilkan nama dan kelas; BK dapat membagikan satu laporan lama kepada penerima individual dari role yang memang berwenang membacanya, dan akses wali kelas berakhir saat penugasannya berakhir atau dicabut lebih awal oleh BK. Status tinjauan hanya terbuka untuk laporan selama masa penugasan dan tidak ikut terbuka saat isi laporan lama dibagikan. Berikutnya, rancang mekanisme share/revoke dan siapkan lingkungan Supabase lokal/staging terisolasi dengan akun serta data sintetis sebelum tes dijalankan. Matriks izin untuk jenis data/aksi lainnya, tujuan arsip konten terhapus serta retensinya, hak akses rekap final, dan wireframe laporan langsung kepada BK tetap menjadi bahasan terpisah.



## Masukan — Pengguna (2026-10-21, 01:11 WIT)

Bila tahapan wireframe ponsel sudah bisa didiskusikan. sarankan tahapan-tahapan pembahasan, batasan-batasan, dan rujukan-rujukan yang perlu digunakan selama pembahasan wireframe. Uji kemungkinan diskusi perlu dilanjutkan di file lain.

## Tanggapan — Copilot (2026-10-21, 01:12 WIT)

Menurut saya, tahapan wireframe ponsel sudah dapat dimulai. Rincian tahap 3 yang belum diputuskan dapat tetap ditunda, dengan syarat wireframe memakai keputusan akses yang sudah dikonfirmasi, tidak mengarang alur audit/retensi, dan menandai titik yang masih membutuhkan keputusan. Ini melanjutkan tahap 4 pada rencana diskusi; bukan berarti rincian tahap 3 dianggap selesai.

### Usulan tahapan pembahasan wireframe

1. **Tetapkan cakupan dan batas.** Mulai dari Wireframe A: satu menu Perilaku, ruang kerja berisi pekerjaan yang dikelompokkan, halaman awal mengikuti pekerjaan utama, dan aksi “Catat” mudah dijangkau. Catat aktor serta skenario yang akan digambar; jangan menambah peran atau fitur MVP baru.
2. **Susun peta layar dan perpindahan.** Petakan daftar kerja, detail laporan/tugas, input, pengambilan atau pengalihan tugas, rekomendasi tanpa tugas, tugas tertaut, serta konfirmasi tindakan. Tunjukkan dari mana pengguna datang dan ke mana ia kembali.
3. **Gambar alur utama per skenario.** Bahas satu skenario pada satu waktu: laporan dengan tindakan awal, tugas wali kelas, pengambilalihan BK, dan tugas pemantauan baru yang tertaut. Gunakan sketsa teks berprioritas rendah dulu; jangan menetapkan rupa visual atau nilai status database.
4. **Periksa informasi dan aksi per peran.** Pada setiap layar, tandai informasi yang boleh dilihat, aksi yang boleh dilakukan, pemilik aktif, dan informasi yang sengaja tidak ditampilkan. Bila izin atau penerimanya belum jelas, tunjukkan keadaan tertutup/tidak tersedia dan catat pertanyaannya, bukan mengasumsikan akses.
5. **Lengkapi keadaan dan jalur alternatif.** Tinjau kosong, memuat, gagal, tidak berwenang, tugas dialihkan, data berubah, dan konfirmasi sebelum tindakan berdampak. Pastikan pesan dan jalur kembali membantu pengguna tanpa membocorkan data.
6. **Tinjau kenyamanan ponsel dan aksesibilitas.** Uji urutan baca dan aksi utama pada layar kecil, keterjangkauan kontrol sentuh, kejelasan label, fokus keyboard, serta kepadatan informasi. Jangan menampilkan metadata audit pada layar kerja kecuali kebutuhan dan tampilannya telah disepakati.
7. **Rekap dan minta konfirmasi.** Pisahkan keputusan yang telah disetujui, usulan wireframe, dan pertanyaan tertunda. Setelah pengguna meninjau, tandai tahap wireframe selesai hanya untuk bagian yang benar-benar dibahas; persetujuan visual rinci tetap terpisah jika belum diberikan.

### Batasan selama pembahasan

- Sumber keputusan yang mengikat tetap butir **DIKONFIRMASI** di `docs/konteks-penggunaan.md` dan ADR berstatus **Accepted**. Diskusi ini dan wireframe adalah bahan kerja, bukan keputusan baru.
- Wireframe konsep-penanganan-perilaku.md, rekomendasi prasyarat perlindungan data, dan referensi desain bukan persetujuan produk. Jika berbeda dengan keputusan yang dikonfirmasi, tandai konflik dan jangan menyalin alurnya begitu saja.
- Pertahankan batas yang sudah disepakati: isi rekam konseling hanya untuk BK; hanya pemilik BK aktif dapat mengubahnya; catatan tugas hanya dapat diubah pemilik aktif; pembagian ringkasan mengikuti penerima/cakupan yang telah disepakati dan pencabutan menghentikan pembacaan berikutnya.
- Jangan menetapkan retensi, penghapusan otomatis, jendela pengelompokan penolakan, akses khusus yang belum terinci, nilai status teknis, atau prosedur audit yang masih terbuka. Tidak perlu menggambar kontrol operasionalnya sebagai seolah-olah sudah tersedia.
- Jangan menganggap sketsa membuktikan keamanan implementasi. Sebelum data nyata digunakan, izin harus ditegakkan di server/database dan diverifikasi; detail teknis serta uji implementasi dibahas pada tahap 6–7.
- Gunakan konten contoh yang tidak berisi data murid nyata. Jangan menambahkan fitur, metrik, atau isi sensitif yang tidak diperlukan untuk menjelaskan alur.

### Rujukan yang perlu digunakan

- `docs/konteks-penggunaan.md` — sumber keputusan produk; dahulukan butir berstatus **DIKONFIRMASI**.
- Bagian **Hasil sementara** dan **Rencana diskusi terperinci** dalam dokumen ini — konteks keputusan diskusi, pertanyaan tertunda, skenario, dan batas tahap wireframe.
- `docs/konsep-penanganan-perilaku.md` — bahan untuk memahami konsep dan alur yang diusulkan; verifikasi setiap bagian terhadap keputusan terkonfirmasi sebelum digunakan.
- `docs/prasyarat-perlindungan-data-sensitif.md` — daftar pertimbangan perlindungan data, bukan kebijakan final; gunakan untuk mengenali risiko dan pertanyaan yang perlu ditahan.
- `.github/instructions/ui-design.instructions.md`, `docs/daftar/daftar-website-rujukan.md`, `docs/daftar/daftar-skill.md`, dan `docs/proyek-ui-slop-evaluasi.md` — gunakan ketika pembahasan beralih dari sketsa alur ke arah visual atau implementasi UI. Referensi/skill membantu evaluasi, tidak mengalahkan kebutuhan produk, aksesibilitas, atau privasi.
- Kode, tes, dan migrasi/RLS baru menjadi rujukan utama pada tahap pemetaan implementasi; jangan menyimpulkan dari wireframe bahwa perilaku aplikasi saat ini sudah sesuai.

### Apakah diskusi perlu dilanjutkan di file lain?

Belum perlu untuk memulai. Masukan, tanggapan, keputusan, dan pertanyaan terbuka masih dapat dicatat di dokumen diskusi ini agar konteks tetap utuh. Namun, sketsa beberapa layar yang rinci akan lebih mudah ditinjau dan dirawat sebagai artefak terpisah daripada memanjangkan log percakapan. Jika nanti kita sampai pada sketsa tersebut, usulan saya adalah membuat dokumen wireframe eksploratif di `docs/aktif/kotak-pasir/`, lalu menautkannya dari tahap 4 di sini. Dokumen itu tetap non-kanonis sampai keputusan yang relevan dikonfirmasi; tidak perlu membuatnya sekarang.

Urutan yang saya sarankan: sepakati cakupan skenario wireframe terlebih dahulu, lalu bahas peta layar dan alur satu per satu. Saya belum membuat sketsa maupun memindahkan diskusi ke berkas lain.

## Masukan lanjutan — Pengguna (YYYY-MM-DD, hh:mm)

Pengguna memilih memulai wireframe dengan fokus pada laporan negatif dan tindak lanjut. Pintu masuk tetap melalui menu Catatan Perilaku; alur catatan positif dibahas terpisah.

## Tanggapan lanjutan — Copilot (2026-10-21, 01:16 WIT)

Pilihan ini menetapkan cakupan diskusi wireframe pertama, bukan keputusan produk baru. Saya sarankan peta layar awal berikut, dengan layar/aksi yang tampil menyesuaikan peran dan hak akses:

1. **Ruang kerja Perilaku** — pekerjaan dikelompokkan sesuai jenis tugas/peran, dengan aksi “Catat” mudah dijangkau.
2. **Input laporan negatif** — dibuka melalui Catatan Perilaku; tindakan awal guru dapat disertakan atau dilengkapi sesuai alur yang sudah disepakati.
3. **Detail laporan dan tinjauan BK** — menampilkan laporan serta status/riwayat yang berhak dilihat aktor; hasil triase dan isi internal BK tidak ditampilkan kepada peran yang tidak berhak.
4. **Detail tugas tindak lanjut** — menampilkan pemilik aktif, status tugas, dan catatan kerja sesuai hak baca/tulis.
5. **Pengambilan atau perpindahan tugas** — mengonfirmasi tindakan dan, untuk pengambilalihan oleh BK, menyediakan alasan operasional singkat.
6. **Arahan tanpa tugas dan tugas tertaut** — arahan umum dapat selesai tanpa membuat tugas; bila tindakan konkret diperlukan, tampilkan tugas berpemilik. Tugas pemantauan wali kelas yang baru tetap terpisah dan tertaut.
7. **Keadaan pendukung** — kosong, memuat, gagal, tidak berwenang, tugas sudah berpindah, dan konfirmasi tindakan; tampilkan tanpa membocorkan data yang tidak berhak dilihat pengguna.

Pengguna menyatakan peta layar cukup untuk sementara; iterasi hanya diperlukan bila pengembangan selanjutnya memerlukan perubahan.

### Wireframe teks — skenario 1: guru menyimpan laporan negatif

Ini sketsa alur untuk ditinjau, bukan spesifikasi visual atau keputusan field formulir.

```text
[Ruang kerja Perilaku]
  Aksi utama: Catat
       ↓
[Pilih jenis catatan]
  Positif | Laporan negatif
       ↓ pilih Laporan negatif
[Form laporan negatif]
  Isi fakta kejadian sesuai field yang nanti disepakati
  Tindakan awal:
    - sudah dilakukan → catat tindakan awal pelapor
    - belum dilakukan/belum dicatat → boleh simpan laporan tanpa tindakan awal
  Aksi: Simpan laporan
       ↓
[Detail laporan]
  Laporan tersimpan
  Tindakan awal: tercatat atau "Belum ada tindakan awal"
  Tinjauan BK: status terpisah; laporan tetap dapat ditinjau BK
  Aksi lanjutan hanya ditampilkan sesuai peran dan hak akses
```

Jika tindakan awal belum dicatat, pelapor dapat menambahkannya kemudian. Tindakan yang ditambahkan memperbarui keadaan terkini tanpa menghapus riwayat sebelumnya. Mencatat tindakan awal oleh pelapor tidak menutup kemungkinan tinjauan atau tindak lanjut BK; membuka laporan juga tidak dengan sendirinya menyelesaikan tinjauan BK.

Detail yang sengaja belum ditetapkan pada sketsa ini: field wajib/opsional, urutan dan label kontrol, nilai teknis status, serta rincian prosedur audit. Hasil triase dan catatan internal BK tidak ditampilkan kepada pelapor.

Pengguna menyatakan alur skenario pertama sesuai, dengan ketentuan bahwa sketsa tidak menggambarkan UI aplikasi sesungguhnya. Untuk semua wireframe berikutnya, terapkan:

- **Tanpa redundansi:** jangan mengulang ide atau kata yang sama dalam satu layar/alur tanpa kebutuhan.
- **Konsistensi istilah:** gunakan istilah baku yang sama untuk fungsi atau objek yang sama; bedakan label hanya jika aksinya memang berbeda.
- **Label ringkas:** teks menu dan tombol menggunakan kata kerja aktif/imperatif yang lugas, maksimal 1–3 kata.

Semua sketsa di bawah adalah peta alur konseptual untuk membahas struktur dan akses, bukan desain visual, salinan UI yang ada, atau spesifikasi final. Label contoh hanya penanda sementara untuk menjelaskan aksi.

### Wireframe teks — skenario 2: wali kelas mengambil tindak lanjut

```text
[Ruang kerja Perilaku]
       ↓ buka laporan murid di kelas perwalian
[Detail laporan]
  Tampilkan laporan asli dan informasi tindak lanjut yang berhak dibaca
  Jangan tampilkan hasil triase atau catatan internal BK
  Aksi tersedia sebelum triase: [Ambil tindak lanjut]
       ↓ konfirmasi
[Tindak lanjut]
  Pemilik aktif: wali kelas yang mengambil
  Status UI: "Sedang ditindaklanjuti"
  Catatan kerja: dapat ditambah/diubah oleh pemilik aktif
```

Alur ini berangkat dari hak wali kelas untuk membaca laporan negatif asli murid kelas perwaliannya dan mengambil tanggung jawab tindak lanjut segera setelah laporan tersimpan, tanpa menunggu triase BK. Label **Ambil tindak lanjut** adalah contoh konseptual, bukan label UI final. Perpindahan setelahnya mengikuti riwayat pemilik dan status tugas yang sudah dikonfirmasi.

Pengguna menyatakan alur konseptual skenario wali kelas sudah tepat.

### Wireframe teks — skenario 3: BK mengambil alih tugas berjalan

```text
[Detail tugas]
  Pemilik aktif: wali kelas
  Status UI: "Sedang ditindaklanjuti"
  Catatan kerja yang sudah ada tetap terbaca
  Aksi BK berwenang: [Ambil alih]
       ↓
[Alasan operasional]
  Isi alasan singkat tanpa rincian konseling
  Aksi: [Konfirmasi]
       ↓ berhasil
[Detail tugas]
  Pemilik aktif: BK yang mengambil alih
  Status UI tetap: "Sedang ditindaklanjuti"
  Catatan sebelumnya dipertahankan
  Wali kelas sebelumnya: baca-saja
  Pemilik aktif: dapat melanjutkan catatan kerja
```

Sketsa ini menggambarkan perpindahan pemilik pada tugas yang sama, bukan pembuatan tugas baru. Riwayat tugas mempertahankan pemilik lama dan baru; alasan pengambilalihan BK bersifat singkat-operasional, bukan isi konseling. Label contoh tetap konseptual, tidak menyatakan UI aktual.

Pengguna menyatakan alur pengambilalihan oleh BK sudah sesuai. Pengguna juga menambahkan konteks bahwa perilaku negatif terkadang disampaikan langsung kepada BK, bukan dilaporkan melalui aplikasi. Wireframe untuk BK memasukkan laporan semacam itu merupakan bahasan terpisah; hal tersebut tidak mengubah alur pelaporan dan tindak lanjut yang telah disepakati. Kemampuan BK membuat laporan langsung belum diasumsikan sebagai keputusan.

### Wireframe teks — skenario 4: BK membuat tugas pemantauan tertaut

```text
[Penanganan BK]
  Tindak lanjut BK selesai
  Keputusan BK: perlu pemantauan wali kelas?
    - tidak perlu → [Selesaikan]
        ↓
      [Penanganan BK selesai]
      Tidak ada tugas tambahan
    - perlu → [Buat tugas]
        ↓
[Tugas pemantauan]
  Tetapkan wali kelas sebagai pemilik
  Tautkan ke penanganan terkait tanpa membuka rekam konseling
  Aksi: [Simpan]
       ↓
[Detail tugas]
  Penanganan BK: selesai
  Tugas pemantauan: terpisah, tertaut, dan menunggu wali kelas
  Wali kelas: melihat informasi tugas sesuai cakupan akses
  Rekam konseling: tidak ditampilkan kepada wali kelas
```

Pilihan tersebut memastikan bahwa tugas pemantauan hanya dibuat bila BK menilai tindak lanjut tambahan memang diperlukan. Jika dibuat, tugas pemantauan adalah tugas baru, bukan pembukaan kembali tugas atau rekam BK yang sudah selesai. Hubungan dengan penanganan BK tidak memberi wali kelas akses ke rekam konseling. Label contoh bersifat konseptual dan mengikuti batas 1–3 kata; sketsa ini bukan UI aktual.

Catatan untuk bahasan wireframe terpisah: perlu ditentukan apakah dan bagaimana BK mencatat laporan yang diterima langsung, siapa yang boleh membuatnya, serta bagaimana identitas pelapor dan tindak lanjutnya direpresentasikan. Bahasan itu tidak mengubah cakupan atau alur dalam empat skenario ini sampai pengguna mengonfirmasikannya.

Pengguna meminta agar kebutuhan tugas pemantauan tidak diasumsikan untuk setiap kasus. BK harus dapat memilih untuk tidak membuat tugas lanjutan atau membuat tugas pemantauan tertaut jika diperlukan.

Pengguna menyetujui revisi pilihan tersebut.

### Pemeriksaan keadaan pendukung

Berikut pemeriksaan konseptual lintas skenario, bukan rancangan UI final:

| Keadaan | Perilaku yang perlu terlihat dalam alur |
| --- | --- |
| Belum ada pekerjaan | Tampilkan keadaan kosong yang sesuai peran; jangan mengungkap bahwa ada pekerjaan di luar cakupan akses pengguna. |
| Memuat | Bedakan data yang masih dimuat dari daftar yang benar-benar kosong. |
| Gagal menyimpan/memuat | Nyatakan kegagalan dengan jelas; jangan tampilkan pesan sukses atau menghilangkan data yang belum tersimpan. Sediakan pemulihan yang wajar. |
| Akses tidak tersedia | Jangan tampilkan isi terlindungi; jelaskan bahwa informasi/aksi tidak tersedia bagi pengguna tanpa membocorkan keberadaan atau detail yang tidak berhak dilihat. |
| Pemilik/status berubah | Periksa ulang hak akses sebelum perubahan; cegah pemilik lama menulis setelah haknya dicabut dan jelaskan bila tindakan tidak lagi dapat dilanjutkan. |
| Perpindahan/tugas baru | Konfirmasikan dampak yang relevan sebelum perpindahan pemilik atau pembuatan tugas tertaut; jangan meminta konfirmasi berulang untuk tindakan tanpa dampak yang sama. |

Pada pemeriksaan akhir, pastikan semua contoh tetap konseptual, menggunakan istilah konsisten, menghindari pengulangan informasi, dan membatasi label kontrol contoh pada 1–3 kata kerja aktif. Wireframe laporan yang disampaikan langsung kepada BK tetap menjadi bahasan terpisah; pemilihan BK untuk membuat atau tidak membuat tugas pemantauan dalam skenario 4 tidak mengubah alur pelaporan.

Pengguna menyatakan keadaan pendukung yang dicantumkan sudah cukup untuk tinjauan akhir. Ini belum menjadi persetujuan atas keseluruhan wireframe dan belum menandai tahap 4 selesai.

**Hasil tinjauan akhir:** empat skenario, keadaan pendukung, batas akses, prinsip label, dan pertanyaan yang tetap ditunda dirangkum untuk dikonfirmasi sebelum berpindah tahap. Wireframe laporan langsung kepada BK tetap dicatat sebagai bahasan terpisah.

Pengguna menyetujui rangkuman: tahap wireframe 4 dinilai cukup dan diskusi dapat beralih ke tahap 5. Status `[x]` menandai tahap telah dibahas, bukan persetujuan atas desain visual final atau bukti kesiapan implementasi.

Pengguna menyetujui struktur tahap 5: satu menu utama Perilaku, ruang kerja sesuai peran, aksi Catat di dalam modul, serta detail laporan/tugas/rekam konseling tetap terpisah dan terhubung sesuai hak akses.

### Pemeriksaan hubungan fungsi di dalam ruang kerja

- **Catat:** berada di ruang kerja Perilaku dan membuka pilihan Positif/Laporan Negatif. Satu pintu masuk tidak menyatukan data atau alur kedua jenis catatan.
- **Tinjauan BK dan tugas wali kelas:** tampil sebagai pekerjaan dalam ruang kerja bersama yang dikelompokkan menurut jenis tugas/peran; detail laporan dan tugas tetap berbeda.
- **Arahan dan ringkasan:** tetap terpisah dari rekam konseling lengkap dan hanya muncul dalam cakupan yang telah dikonfirmasi untuk penerima.
- **Rekap perilaku:** kebutuhan rekap disebut dalam konteks produk, tetapi hak akses final tiap peran belum dikonfirmasi. Jangan menggambar isi atau menetapkan penerima rekap berdasarkan draf peran saja.

Pengguna memilih menunda rekap bila hal itu tidak menyulitkan pengembangan berikutnya; jika penundaan berisiko menyulitkan, hak akses final perlu dibahas lebih dahulu.

Rekap dapat ditunda dari wireframe tanpa menghambat pengembangan bila tidak digabungkan ke daftar tugas, struktur Perilaku tetap memungkinkan tampilan internal baru, serta hak akses/query rekap disepakati sebelum implementasi layar. Ini menunda rancangan UI, bukan menetapkan siapa yang boleh melihat rekap atau menghapus kebutuhan tersebut. Pengguna menerima penundaan dengan syarat itu.

## Diskusi tahap 6 — pemetaan keputusan ke data dan kode

### Masukan — Pengguna (2026-10-21, 02:00 WIT)

> Masuk ke tahap 6. lanjutkan memandu saya.

### Tanggapan awal — Copilot

Tahap 6 dimulai dengan memisahkan keputusan produk yang mengikat dari perilaku yang benar-benar ada di kode. Pemetaan dilakukan tanpa mengubah kode; gap yang ditemukan akan ditinjau sebelum menentukan batas refaktor.

### Masukan lanjutan — Pengguna

Pengguna memilih memulai dari kelompok **model data dan jenis rekaman**.

### Tanggapan lanjutan — Copilot

Pemetaan awal terhadap [konteks-penggunaan.md](../../konteks-penggunaan.md), Server Actions, form, dan migration menunjukkan:

| Kebutuhan terkonfirmasi | Bukti implementasi saat ini | Gap sementara |
| --- | --- | --- |
| Catatan positif hanya entri profil; laporan negatif, tinjauan BK, tugas, dan rekam konseling terpisah. | `catatan_perilaku` memiliki jenis `positif/pelanggaran`; form input yang sama juga menyediakan tindak lanjut dan status. | Form dan model saat ini dapat menggabungkan alur positif dan penanganan kasus. |
| Status laporan, tinjauan, tugas, dan rekam BK independen; satu laporan dapat memiliki beberapa tugas paralel. | Skema yang ditemukan memuat `catatan_perilaku` dan `penanganan_perilaku`; belum terlihat entitas tugas mandiri, status/riwayat tinjauan BK, atau rekam konseling yang terpisah. | Jenis rekaman dan siklus hidup yang dikonfirmasi belum terwakili sebagai entitas terpisah dalam skema yang ditinjau. |
| Alih pemilik mempertahankan tugas yang sama beserta riwayatnya. | RPC penanganan menambahkan baris berisi `catatan_id`, `handler_id`, teks tindak lanjut, tanggal, dan status; tidak tampak identitas tugas stabil untuk perpindahan pemilik. | Makna satu baris penanganan lama perlu dipastikan sebelum menyusun kompatibilitas atau migrasi data. |

Sumber kode dan skema yang ditinjau: [actions.ts](../../../app/portal/perilaku/actions.ts), [halaman input](../../../app/portal/perilaku/input/page.tsx), [migration skema inti](../../../supabase/migrations/20260929000001_core_academic_and_behavior.sql), dan [migration alur penanganan](../../../supabase/migrations/20261016000000_behavior_triage_versioned_edits.sql). Pemetaan ini belum menyimpulkan keadaan atau isi data produksi.

### Masukan lanjutan — Pengguna

Pengguna memilih opsi **“Belum tahu; perlu ditelusuri dari data/skema yang ada”** untuk makna satu baris `penanganan_perilaku`, dan meminta agar setiap masukan serta tanggapan dalam diskusi ini—baik inisialisasi maupun lanjutan—dicatat di dokumen sebagai masukan pengguna dan tanggapan Copilot.

### Tanggapan lanjutan — Copilot

Penelusuran migration dan fungsi yang ada memperlihatkan perilaku teknis berikut, tetapi tidak membuktikan maksud historis pencatatan atau makna setiap baris data yang sudah tersimpan:

- `submit_catatan_perilaku` membuat satu baris laporan; bila teks tindak lanjut diberikan, fungsi itu juga membuat satu baris `penanganan_perilaku` dengan pelapor sebagai `handler_id`.
- `submit_penanganan_eskalasi` membuat baris penanganan baru untuk laporan yang sama. Fungsi ini memeriksa status terbaru pada tingkat laporan, bukan pada identitas tugas yang terpisah.
- `reopen_kasus_perilaku` juga menambahkan baris penanganan baru; alasan pembukaan kembali dimasukkan ke teks tindak lanjut.
- Rekap mengambil penanganan terbaru untuk menampilkan status terkini dan menampilkan baris lain sebagai riwayat. Skema yang ditinjau tidak memiliki `task_id` atau tabel tugas independen.

Karena itu, implementasi saat ini memperlakukan baris-baris tersebut secara operasional sebagai rangkaian penanganan/status pada satu laporan; belum ada bukti di skema dan fungsi yang ditinjau bahwa setiap baris adalah tugas independen yang dapat berjalan paralel. Data yang sudah tersimpan belum diperiksa, sehingga jangan menyimpulkan semantik historis atau merencanakan transformasi baris produksi berdasarkan kode saja. Langkah berikutnya ialah menyelesaikan peta model data dari repository, lalu menandai pemeriksaan data aktual sebagai belum terverifikasi sampai tersedia sumber yang aman dan teranonimkan. Data murid nyata tidak digunakan dalam penelusuran ini.

Pada bagian-bagian berikutnya, setiap pertukaran dalam diskusi tahap 6 akan dicatat berurutan di dokumen ini dengan label **Masukan — Pengguna** dan **Tanggapan — Copilot**; catatan diskusi tetap non-kanonis dan tidak mengubah status keputusan produk.

### Tanggapan lanjutan — Copilot: batas bukti untuk data lama

Penelusuran repository menjawab bagaimana fungsi saat ini menulis dan menampilkan baris penanganan, tetapi belum menjawab apakah data yang sudah tersimpan dahulu dipakai dengan makna yang sama. Tidak ada pemeriksaan isi data produksi atau data murid nyata.

Untuk meneruskan kompatibilitas data, pilih sumber bukti yang aman:

1. Lanjutkan pemetaan dari repository saja dan tandai makna historis baris lama sebagai belum terverifikasi.
2. Tinjau contoh skema/rekaman yang sudah dianonimkan, tanpa nama, ID murid, atau teks laporan/tindak lanjut.
3. Saya pandu pemeriksaan metadata agregat pada lingkungan nonproduksi/yang disetujui; tidak membaca isi laporan atau identitas murid.

Sampai ada bukti aman tambahan, jangan membuat keputusan migrasi yang menganggap setiap baris lama sebagai satu tugas mandiri atau sebagai salinan audit.

### Masukan lanjutan — Pengguna

Pengguna memilih **lanjut dari repository saja**; makna data lama tetap ditandai belum terverifikasi.

### Tanggapan lanjutan — Copilot: ringkasan model data dari repository

Tipe aplikasi mendefinisikan `CatatanPerilaku` dan `PenangananPerilaku` dengan relasi penanganan ke `catatan_id`; tidak ada tipe entitas tugas tersendiri pada bagian skema yang ditinjau. Fungsi rekap memuat penanganan sebagai anak laporan, menghitung aktivitas terbaru untuk laporan, dan antarmuka mengelompokkan laporan menurut status penanganan terbaru. Ini menguatkan kesimpulan bahwa perilaku rekap sekarang berada pada tingkat laporan, bukan beberapa tugas independen.

Pemetaan sementara kelompok model data:

- **Dapat dipetakan:** laporan/catatan murid beserta penulis, tanggal, jenis, deskripsi, dan poin; baris penanganan beserta handler, teks tindakan, tanggal, status, dan cap waktu; rekap/profil yang membaca rekaman tersebut.
- **Gap struktur terhadap keputusan terkonfirmasi:** catatan positif masih berbagi jenis tabel dan form dengan laporan negatif; belum tampak rekaman tinjauan BK yang independen, entitas tugas dengan pemilik/status/riwayat masing-masing, maupun entitas rekam konseling formal yang terpisah.
- **Belum diputuskan atau diverifikasi:** pemetaan nilai enum database ke label/transisi produk, arti historis setiap baris yang telah tersimpan, kebutuhan transformasi data, dan skema tujuan. Pemetaan ini tidak menetapkan desain tabel baru.

Kelompok model data telah ditinjau berdasarkan repository saja. Kelompok ini belum berarti tahap 6 selesai; hak akses/RLS, status/riwayat, audit, halaman, tes, dan kompatibilitas data tetap perlu dipetakan. Langkah diskusi berikutnya yang disarankan adalah **hak akses server-side dan RLS**, karena batas konten sensitif harus dibandingkan di database/RPC, bukan disimpulkan dari UI.

### Masukan lanjutan — Pengguna

Pengguna memilih melanjutkan ke kelompok **hak akses server-side dan RLS**.

### Tanggapan lanjutan — Copilot: peta akses repository

Perbandingan berikut memakai keputusan terkonfirmasi di [konteks-penggunaan.md](../../konteks-penggunaan.md) dan policy/fungsi yang ada dalam repository. Ini adalah peta gap, bukan perubahan izin atau bukti konfigurasi Supabase yang sedang terpasang.

| Area | Keputusan terkonfirmasi | Bukti repository saat ini | Gap atau batas bukti |
| --- | --- | --- | --- |
| Isi laporan dan hasil triase | Pelapor melihat laporan sendiri dan statusnya, tetapi bukan hasil triase/catatan internal. Wali kelas melihat laporan asli murid perwaliannya; guru mapel yang bukan pelapor/wali tidak mendapat akses langsung ke laporan/triase. Kamad/waka hanya mendapat status jika dimasukkan ke ringkasan terpilih. Admin teknis tidak mendapat akses isi sensitif untuk troubleshooting. | Policy awal `Catatan Perilaku - Select Authorized` mengizinkan reporter, wali kelas, admin, kamad, waka kesiswaan, dan BK. Policy `Profile 360 Read Scope` menambah cakupan global admin, BK, waka kurikulum, waka kesiswaan, kamad, serta guru mapel yang mengajar kelas terkait. Fungsi profil server juga memuat laporan penuh untuk cakupan tersebut. | Policy tambahan tidak menghapus policy awal. Karena policy RLS permissive digabungkan, keduanya perlu dianalisis sebagai gabungan; peran manajemen dan guru mapel berpotensi membaca isi laporan/triase yang menurut keputusan tidak boleh mereka baca langsung. Perlu verifikasi terhadap policy aktif sebelum menyimpulkan keadaan deployment. |
| Teks tindak lanjut | Catatan tugas dapat dibaca/ditulis sesuai pemilik dan pihak terkait; informasi internal BK tidak terbuka kepada peran lain. | `penanganan_perilaku` menyimpan teks `tindak_lanjut`. Policy baca mencakup handler, reporter, wali kelas, admin, kamad, waka kesiswaan, BK; policy Profile 360 menambah waka kurikulum dan guru mapel sesuai jadwal. Fungsi profil/rekap memuat baris penanganan terkait. | Karena belum ada pemisahan rekam konseling, tugas, dan catatan kerja di skema, batas baca atas teks tersebut tidak dapat disamakan dengan matriks yang dikonfirmasi. Perlu menetapkan klasifikasi isi setiap jenis baris, tanpa mengasumsikan seluruh teks adalah konseling. |
| Pengguna aktif dan perubahan | Hanya pemilik tugas aktif yang dapat menambah/mengubah catatan kerja; perpindahan harus mencabut hak tulis pemilik lama. | Fungsi `update_perilaku_description` membatasi edit pada penulis asli atau admin. Tidak ada identitas tugas/pemilik aktif tersendiri untuk diuji; fungsi penanganan menambahkan baris baru. | Belum dapat menegakkan aturan pemilik aktif untuk tugas sebagai entitas tersendiri; izin edit saat ini berbasis penulis baris. |
| Daftar kelas/murid untuk input | Cakupan baca mengikuti peran dan penugasan; rincian cakupan input yang belum final tidak boleh ditebak. | `getKelasAndSiswaList` hanya memeriksa peran input, lalu meminta seluruh kelas dan murid. Policy inti memberi semua pengguna terautentikasi hak SELECT atas kelas dan murid. | Perlu mencocokkan cakupan daftar sasaran input dengan keputusan yang sudah dikonfirmasi; kebijakan umum ini sendiri tidak membatasi data berdasarkan kelas/peran. |
| Pengiriman laporan | Server Action memeriksa peran input yang tercantum sebelum memanggil RPC. | RPC `submit_catatan_perilaku` memeriksa bahwa `p_reporter_id = auth.uid()`, tetapi migration yang ditemukan tidak menunjukkan pemeriksaan peran bisnis atau `REVOKE/GRANT EXECUTE` eksplisit untuk fungsi ini. | Efektivitas izin RPC langsung belum dapat disimpulkan tanpa memverifikasi grant/default privilege di Supabase yang digunakan. Catat sebagai gap verifikasi server-side, bukan kesimpulan tentang deployment. |

Pencarian awal belum menemukan tes bernama `*.test.ts`/`*.spec.ts` untuk perilaku maupun folder `supabase/tests`; tidak ada tes akses yang dijalankan pada tahap pemetaan ini. Sumber utama yang dibandingkan: [konteks produk](../../konteks-penggunaan.md), [migration policy awal](../../../supabase/migrations/20260929000001_core_academic_and_behavior.sql), [migration RPC perilaku](../../../supabase/migrations/20261016000000_behavior_triage_versioned_edits.sql), [migration cakupan profil](../../../supabase/migrations/20261017000000_profile_360_read_scope.sql), [migration penghapusan](../../../supabase/migrations/20261017000002_delete_behavior_record_rbac.sql), dan [Server Actions perilaku](../../../app/portal/perilaku/actions.ts).

Temuan ini tidak mengubah kebijakan atau memberi izin untuk mengubah RLS. Sebelum implementasi, perlu dipisahkan gap kebijakan yang berlawanan dengan keputusan terkonfirmasi dari hal yang masih perlu diverifikasi pada konfigurasi Supabase. Saya menyarankan kelompok berikutnya membahas **audit, penghapusan, dan retensi**, lalu meninjau status/riwayat agar seluruh peta tahap 6 tersusun sebelum menyepakati batas refaktor.

### Masukan lanjutan — Pengguna

Pengguna memilih kelompok berikutnya: **audit, penghapusan, dan retensi**.

### Tanggapan lanjutan — Copilot: peta audit dari repository

Keputusan terkonfirmasi menetapkan audit berbasis metadata tanpa menyalin isi sensitif; audit wajib untuk pembacaan data sensitif, perubahan/penghapusan/akses, pembagian/pencabutan ringkasan, serta ekspor. Log tidak dihapus otomatis selama retensi belum diputuskan; pembatasan isi metadata, akses, dan penghapusan harus mengikuti sumber keputusan.

| Area | Bukti repository saat ini | Gap atau batas bukti |
| --- | --- | --- |
| Perubahan deskripsi | `perilaku_deskripsi_audit` menyimpan `old_text`, aktor, dan waktu ketika edit dilakukan setelah 15 menit; trigger menolak UPDATE/DELETE, sedangkan policy memberi role `admin` hak baca. | Teks lama tersalin ke tabel audit; batas 15 menit tidak tampak sebagai keputusan produk. Hak baca admin atas teks perlu dibandingkan dengan keputusan bahwa admin teknis tidak membaca isi sensitif. |
| Penghapusan laporan | Trigger sebelum DELETE menyalin deskripsi laporan dan seluruh baris penanganan ke `catatan_perilaku_deleted_logs`, termasuk `raw_payload` JSONB. Akses tabel dicabut dari PUBLIC/anon/authenticated dan diberikan ke `service_role`. | Tabel menyimpan isi sensitif, bukan hanya metadata. Belum jelas apakah ini dimaksudkan sebagai arsip pemulihan terpisah dari audit atau sebagai log audit; belum tampak retensi/penghapusan arsip atau perlindungan append-only pada tabel ini. |
| Pembacaan/berbagi/ekspor | Pencarian kode aplikasi dan migration menemukan tabel audit untuk edit deskripsi serta trigger untuk penghapusan. | Belum ditemukan pencatatan pembacaan laporan/triase/rekam BK, pembagian/pembacaan/pencabutan ringkasan, akses khusus, atau ekspor sebagaimana diwajibkan keputusan. Ini hanya kesimpulan dari repository yang ditinjau, bukan pemeriksaan konfigurasi Supabase aktif. |
| Retensi | Dokumen keputusan menyatakan retensi belum ditentukan, tidak menghapus log otomatis, dan tidak mengurangi peristiwa wajib. | Pencarian migration yang ditinjau tidak menunjukkan proses retensi/pembersihan. Arsip penghapusan yang berisi konten dapat terus menyimpan salinan setelah data utama dihapus. |

Sumber utama: [keputusan akses/audit](../../konteks-penggunaan.md), [migration audit deskripsi](../../../supabase/migrations/20261016000000_behavior_triage_versioned_edits.sql), [migration snapshot penghapusan](../../../supabase/migrations/20261017000003_create_catatan_perilaku_audit_log_trigger.sql), dan [Server Actions](../../../app/portal/perilaku/actions.ts). Tidak ada perubahan kode, tidak ada query terhadap data murid, dan tidak ada tes yang dijalankan.

Satu hal perlu diklarifikasi untuk mengklasifikasikan gap tanpa mengubah kebijakan: apakah `catatan_perilaku_deleted_logs` dimaksudkan sebagai (a) log audit yang harus berisi metadata saja, (b) arsip pemulihan terpisah yang menyalin data terhapus dan memerlukan keputusan akses/retensi tersendiri, atau (c) belum diketahui. Sampai dikonfirmasi, perlakukan ini sebagai gap/pertanyaan terbuka; jangan menganggap salinan isi sudah disetujui.

### Masukan lanjutan — Pengguna

Pengguna meminta klarifikasi tentang istilah “dimaksudkan”: apakah yang ditanyakan adalah fungsi tabel saat ini atau fungsi yang diharapkan.

### Tanggapan lanjutan — Copilot

Yang ditanyakan adalah **tujuan yang diharapkan** dari tabel menurut keputusan/kebutuhan produk, bukan fungsi teknisnya saat ini. Fungsi teknisnya sudah terlihat di migration: trigger sebelum penghapusan menyimpan snapshot laporan dan baris penanganan, termasuk teks, ke `catatan_perilaku_deleted_logs`; tabel dibatasi untuk `service_role`. Saya tidak mengasumsikan bahwa implementasi itu memang tujuan yang disetujui.

### Masukan lanjutan — Pengguna

Pengguna meminta rekomendasi tentang tujuan yang diharapkan untuk tabel tersebut.

### Tanggapan lanjutan — Copilot

Rekomendasi: **pertahankan keputusan audit yang sudah terkonfirmasi sebagai metadata saja**, dan klasifikasikan tujuan arsip konten `catatan_perilaku_deleted_logs` sebagai **belum diketahui/perlu keputusan tersendiri**. Alasannya:

- Konteks produk secara eksplisit menyatakan audit tidak menyalin isi sensitif, sementara tidak ada persetujuan eksplisit yang ditemukan untuk membuat arsip pemulihan berisi teks.
- Migration saat ini memang menyimpan salinan konten; hak `service_role` membatasi akses aplikasi biasa, tetapi tidak menjawab tujuan, masa simpan, atau proses penghapusan salinan tersebut.
- Menghapus atau mempertahankan isi arsip adalah perilaku data yang berdampak dan retensi belum diputuskan; jangan mengubah atau menganggap salah satunya telah disetujui berdasarkan rekomendasi ini.

Untuk peta tahap 6, catat ini sebagai **gap implementasi + pertanyaan terbuka**. Jika kebutuhan pemulihan data memang ada, bahas terpisah sebagai arsip non-audit dengan tujuan, penerima/akses, dan retensi yang disetujui. Jika tidak ada kebutuhan tersebut, audit metadata tetap satu-satunya keputusan yang mengikat untuk audit.

Copilot menanyakan apakah klasifikasi sementara tersebut dapat dicatat sambil melanjutkan ke pemetaan status/riwayat, atau apakah tujuan arsip perlu dibahas lebih lanjut terlebih dahulu.

### Masukan lanjutan — Pengguna

Pengguna menerima klasifikasi sebagai gap terbuka dan memilih melanjutkan ke pemetaan **status/riwayat**.

### Tanggapan lanjutan — Copilot: peta status dan riwayat dari repository

Keputusan produk memisahkan status tindakan awal laporan, status tinjauan BK, status tiap tugas, dan status rekam konseling; label UI tugas yang dikonfirmasi adalah “Menunggu wali kelas/BK” → “Sedang ditindaklanjuti” → “Selesai”. Nilai database dan beberapa transisi teknis tetap **PERLU KLARIFIKASI**.

| Area | Bukti repository saat ini | Gap terhadap keputusan terkonfirmasi |
| --- | --- | --- |
| Nilai status | Enum `penanganan_status` hanya berisi `ditangani_di_tempat`, `diteruskan`, `proses`, `selesai`. Form, rekap, RPC, dan ringkasan menggunakan nilai ini. | Nilai database lama bukan pemetaan final status tugas/review; tidak ada status/riwayat tersendiri untuk tinjauan BK atau rekam konseling. Jangan menetapkan pemetaan nilai baru pada tahap ini. |
| Tindakan awal laporan | RPC pembuatan laporan opsional membuat baris `penanganan_perilaku` untuk tindakan awal. | Keputusan menyebut tindakan awal sebagai riwayat laporan, bukan tugas; saat ini ditulis ke tabel penanganan yang juga dipakai untuk alur lain. |
| Status terkini | Rekap mengambil penanganan terbaru per laporan. Fungsi UI mengelompokkan `diteruskan` atau tanpa penanganan sebagai triase, `proses` sebagai berjalan, sedangkan nilai lain—termasuk `ditangani_di_tempat`—masuk kelompok selesai. Fungsi ringkasan SQL juga menghitung `ditangani_di_tempat` sebagai selesai. | “Ditangani di Tempat” menuntaskan tindakan awal guru, tetapi laporan tetap bisa menunggu tinjauan BK; menggabungkannya ke kelompok selesai dapat menyamarkan perbedaan tersebut. |
| Riwayat/parallelisme | RPC penanganan membuat baris baru dan memeriksa status terbaru pada seluruh `catatan_id`; jika status terbaru `selesai`, penanganan baru ditolak sampai reopen. Reopen juga berlangsung pada tingkat laporan dan menambahkan baris baru. | Keputusan mengizinkan beberapa tugas paralel dengan status independen; pemeriksaan dan reopen tingkat laporan tidak dapat membedakan satu tugas dari tugas lain. Riwayat tidak memiliki identitas tugas/pemilik aktif independen. |
| Cap waktu dan alasan | Baris penanganan memiliki `created_at`/`updated_at`; reopen menyimpan alasan di awalan teks tindak lanjut. | Belum ada tabel riwayat transisi yang jelas untuk pemilik/status tugas dan alasan terstruktur; penulisan alasan sebagai bagian teks membuatnya bercampur dengan isi catatan. Ini gap struktur, bukan keputusan format baru. |

Sumber yang ditinjau: [keputusan status perilaku](../../konteks-penggunaan.md), [enum skema inti](../../../supabase/migrations/20260929000001_core_academic_and_behavior.sql), [RPC penanganan dan reopen](../../../supabase/migrations/20261016000000_behavior_triage_versioned_edits.sql), [ringkasan rekap SQL](../../../supabase/migrations/20261017000006_scope_behavior_rekap_summary.sql), [Server Actions](../../../app/portal/perilaku/actions.ts), dan [UI rekap](../../../app/portal/perilaku/rekap/page.tsx).

Pemetaan ini belum memilih status database, belum menentukan migrasi nilai lama, dan belum mengubah kode. Langkah repository berikutnya adalah memetakan halaman yang ada dan tes/verifikasi yang tersedia; setelah itu seluruh gap tahap 6 dapat diringkas menjadi batas refaktor yang perlu ditinjau.

### Tanggapan lanjutan — Copilot: halaman dan verifikasi yang tersedia

Pemeriksaan permukaan UI menunjukkan:

- Menu portal memiliki entri **Catatan & Penanganan Perilaku** menuju input dan entri **Rekap Perilaku** terpisah untuk kamad. Ini berbeda dari keputusan Wireframe A berupa satu menu utama Perilaku dengan ruang kerja di dalam modul.
- Rute `/portal/perilaku` mengarahkan langsung ke input; tab modul membedakan **Input Catatan** dan **Rekap & Eskalasi**. Daftar berkas modul tidak menunjukkan rute/komponen khusus untuk ruang kerja tugas, antrean tinjauan BK, detail tugas terpisah, atau rekam konseling formal.
- Profil perilaku murid menampilkan timeline gabungan catatan dan penanganan. Ini adalah permukaan tambahan yang perlu mengikuti izin server-side, bukan bukti bahwa batas akses sudah ditegakkan.
- `package.json` menyediakan skrip `lint` dan `build`, tetapi tidak memiliki skrip tes. Pencarian pola `*.test.ts` dan `*.spec.ts` serta folder `supabase/tests` tidak menemukan tes terkait. Tes tidak dijalankan karena tidak ada perubahan kode.

### Sintesis sementara tahap 6 — belum dikonfirmasi sebagai rencana implementasi

Peta repository menghasilkan batas kerja sementara berikut, tanpa memilih skema tujuan atau mengubah kode:

1. Jadikan perbedaan akses yang berlawanan dengan keputusan terkonfirmasi sebagai prasyarat verifikasi; jangan mengandalkan menu/guard UI. Periksa migration yang benar-benar diterapkan sebelum menyimpulkan konfigurasi deployment.
2. Susun model dan kompatibilitas rekaman yang memisahkan catatan positif, laporan dan tindakan awal, tinjauan BK, tugas independen, serta rekam konseling sesuai keputusan produk. Makna historis setiap baris lama belum terverifikasi; jangan melakukan transformasi data sebelum ada bukti aman.
3. Tahan pemetaan nilai status database sampai aturan transisi teknis diklarifikasi; jangan menyamakan enum lama dengan label UI yang disepakati.
4. Perlakukan salinan konten audit/penghapusan sebagai gap terbuka. Audit metadata tetap mengikuti keputusan terkonfirmasi; tujuan arsip dan retensinya belum disetujui.
5. Setelah model dan akses jelas, petakan perubahan UI menuju satu menu Perilaku/ruang kerja dan detail terpisah. Tentukan tes negatif RLS/RPC, audit, dan kompatibilitas migrasi sebelum implementasi sensitif; repository saat ini belum menunjukkan rangkaian tes terkait.

Open item yang tetap memerlukan keputusan/verifikasi: nilai status/transisi teknis, akses rekap final, tujuan/retensi arsip konten terhapus, masa retensi audit, prosedur akses khusus dan peninjauan, cakupan input/list murid, makna historis data, serta keadaan migration/grant pada Supabase yang dipakai. Sintesis ini adalah bahan review tahap 6, bukan status backlog baru atau keputusan produk.

Copilot menanyakan apakah peta dan urutan sementara ini dapat diterima untuk menutup pemetaan tahap 6 dan beralih ke tahap 7 (gerbang verifikasi), atau perlu ditinjau ulang dahulu.

### Masukan lanjutan — Pengguna

Pengguna menerima peta sementara tahap 6 dan memilih melanjutkan ke **tahap 7 — gerbang verifikasi**.

### Tanggapan awal — Copilot: usulan gerbang verifikasi

Gerbang berikut adalah rencana yang perlu ditinjau, bukan bukti bahwa implementasi sudah aman atau keputusan teknis deployment:

1. **Siapkan lingkungan aman.** Gunakan Supabase lokal atau staging terisolasi dengan akun/peran dan rekaman sintetis. Jangan melakukan uji tulis/penghapusan destruktif pada produksi atau memakai data murid nyata.
2. **Uji izin dari sisi server/database.** Untuk setiap tabel, Server Action, dan RPC, uji akses yang diizinkan dan ditolak melalui endpoint/database langsung, bukan hanya dengan menyembunyikan tombol. Cakup pelapor, wali kelas, guru mapel, BK aktif/nonaktif, kamad/waka, dan admin teknis sesuai keputusan terkonfirmasi.
3. **Uji perubahan pemilik dan status.** Pastikan pemilik lama kehilangan hak tulis setelah perpindahan, pembaca tetap sesuai matriks, beberapa tugas pada satu laporan tidak saling mengubah status, dan pembukaan kembali tidak mengganti tugas yang berbeda.
4. **Uji audit secara terpisah.** Pastikan peristiwa wajib tercatat dengan aktor/waktu/objek/jenis akses/cakupan yang relevan, isi audit tidak memuat teks sensitif, pembacaan log dibatasi, dan log tidak dapat diedit/dihapus langsung. Jangan mengasumsikan perilaku retensi yang belum diputuskan.
5. **Uji migrasi pada basis data disposable.** Pakai data sintetis/anonim, validasi relasi, jumlah rekaman dan status secara agregat, uji penerapan berulang bila migration mengharuskannya, serta siapkan rollback/cadangan sebelum perubahan yang tidak dapat dibalik. Jangan memetakan data lama ke tugas baru sebelum semantik historisnya terverifikasi.
6. **Uji aplikasi sebagai lapisan tambahan.** Jalankan lint/build dan tes integrasi yang relevan; pastikan keadaan gagal tidak tampak berhasil. Uji UI tidak menggantikan pengujian RLS/RPC.
7. **Gerbang sebelum rilis.** Verifikasi secara read-only bahwa migration, RLS, grant fungsi, dan konfigurasi yang diuji benar-benar sama dengan deployment tujuan. Catat hasil, keterbatasan, dan bukti staging; jangan menyatakan konfigurasi produksi terverifikasi hanya dari repository.

Pemeriksaan minimum perlu membuktikan penolakan akses lintas peran/kelas, penolakan akses pelapor terhadap hasil triase, pembatasan rekam BK pada peran BK dan pemilik aktif untuk tulis, penolakan pemilik lama setelah perpindahan, serta audit metadata tanpa isi sensitif. Kasus untuk arsip penghapusan tetap ditahan sampai tujuan arsip dan retensi diputuskan. Sumber dasar: [keputusan produk](../../konteks-penggunaan.md), [aturan source-of-truth](../../source-of-truth/README.md), policy/migration/RPC yang dipetakan pada tahap 6, dan data sintetis di lingkungan aman.

Untuk menyesuaikan gerbang dengan kondisi proyek, Copilot menanyakan lingkungan mana yang tersedia tanpa memakai produksi: Supabase lokal, staging terisolasi, belum ada/tidak yakin, atau pilihan lain yang aman.

### Masukan lanjutan — Pengguna

Pengguna menyatakan belum ada atau belum yakin lingkungan uji aman yang tersedia.

### Tanggapan lanjutan — Copilot: kesiapan lingkungan uji

Pemeriksaan repository menemukan folder Supabase berisi migration tetapi tidak menemukan `supabase/config.toml` atau direktori skrip pengujian; Supabase CLI juga tidak tersedia pada lingkungan kerja yang diperiksa. `package.json` tidak menyediakan skrip tes. Karena itu, gerbang pengujian RLS/migrasi belum bisa dijalankan di repository ini sebagaimana adanya.

Rekomendasi tahap 7: catat **lingkungan uji terisolasi sebagai prasyarat sebelum implementasi sensitif**. Tetapkan dulu matriks skenario positif/negatif menggunakan keputusan yang sudah dikonfirmasi; sebelum eksekusi, siapkan Supabase lokal atau staging terisolasi, akun peran sintetis, dan data sintetis. Jangan memasang tooling atau mengubah konfigurasi proyek tanpa persetujuan/scope pekerjaan yang jelas. Copilot menanyakan apakah diskusi berikutnya sebaiknya menyusun matriks tes lebih dulu atau menyiapkan lingkungan lokal terlebih dahulu.

### Masukan lanjutan — Pengguna

Pengguna memilih **menyusun matriks tes terlebih dahulu**, dengan setup lingkungan tetap menjadi prasyarat sebelum pengujian dijalankan.

### Tanggapan lanjutan — Copilot: draf matriks tes tahap 7

Matriks ini menyatakan hasil yang harus dibuktikan berdasarkan keputusan produk; bukan klaim bahwa tes tersebut sudah ada atau lulus.

| Kelompok tes | Skenario positif/negatif yang perlu dibuktikan | Kesiapan dari pemetaan tahap 6 |
| --- | --- | --- |
| Autentikasi dan laporan | Pengguna tanpa autentikasi tidak dapat membaca/menulis. Pelapor membaca laporannya sendiri dan status yang diizinkan, bukan hasil triase/catatan internal. Wali kelas membaca laporan dan status tinjauan yang berada dalam cakupan masa penugasannya; satu laporan asli lama hanya terbuka melalui pembagian BK kepada penerima dari role yang berwenang, dan statusnya tetap tertutup. Guru mapel nonpelapor tidak membaca laporan/triase; kamad/waka tidak membaca langsung kecuali informasi yang dipilih BK dibagikan sesuai keputusan. | Kebutuhan terkonfirmasi, tetapi policy repository berpotensi terlalu luas. Tes belum dapat dijalankan sampai lingkungan dan policy target tersedia. |
| Catatan positif | Positif tersimpan sebagai entri profil tanpa alur kasus, tindak lanjut, atau status. Uji juga bahwa input negatif tidak tertukar menjadi positif. | Kebutuhan terkonfirmasi; form/entitas sekarang masih berbagi alur. |
| Tugas dan rekam BK | Pemilik aktif dapat menulis; pihak yang berhak hanya membaca; pemilik lama kehilangan hak tulis segera setelah pengalihan. Beberapa tugas tertaut pada laporan yang sama dapat memiliki status independen. Rekam konseling hanya dapat dibaca BK; hanya BK yang ditugaskan dapat mengubahnya; antrean tanpa pemilik bersifat baca-saja. | Kebutuhan terkonfirmasi, tetapi entitas tugas/rekam BK belum tampak pada skema repository. Eksekusi menunggu model implementasi. |
| Jalur server-side | Ulangi pengujian langsung pada RLS tabel dan RPC, bukan hanya halaman; akun dengan role salah, kelas salah, atau pemilik lama harus ditolak. Uji alur yang diizinkan sebagai kontrol positif. | RPC `submit_catatan_perilaku` belum menunjukkan guard role atau grant terbatas di migration; grant efektif deployment belum diverifikasi. |
| Status dan riwayat | Tindakan awal “Ditangani di Tempat” tidak menyelesaikan tinjauan BK. Tinjauan, setiap tugas, laporan, dan rekam BK berubah independen. Perpindahan pemilik mempertahankan catatan/riwayat; reopen hanya untuk tindakan sama yang belum tuntas/penutupan keliru dan memerlukan alasan; tugas baru tidak membuka kembali tugas lama. | Semantik produk terkonfirmasi, tetapi nilai enum dan beberapa transisi teknis belum diputuskan. Uji perilaku/relasi dahulu; jangan mengunci nilai database. |
| Audit dan akses log | Peristiwa baca sensitif, perubahan, penghapusan, pembagian/pencabutan, ekspor, serta akses khusus menghasilkan metadata yang diwajibkan tanpa teks sensitif. Uji pembaca log, append-only, satu penolakan vs pola berulang, dan peninjauan pasca-akses sesuai prosedur yang disetujui. | Cakupan metadata sebagian terkonfirmasi; prosedur/retensi dan jendela pengelompokan penolakan masih terbuka. Konten arsip `deleted_logs` belum diklasifikasikan dan tidak boleh menjadi expected behavior tes dahulu. |
| Migrasi/kompatibilitas | Pada database disposable dengan data sintetis, validasi relasi, agregat jumlah/status sebelum-sesudah, constraint, kegagalan yang aman, serta rencana rollback/cadangan. Jangan mengubah data produksi untuk menguji. | Makna data lama belum terverifikasi; uji transformasi ditahan sampai tersedia bukti aman dan keputusan mapping. |
| UI dan kegagalan | Uji tampilan kosong/memuat/gagal/tidak berwenang dan konsistensi satu menu Perilaku; pastikan UI tidak membocorkan data atau menampilkan sukses ketika server menolak. | UI saat ini belum mencerminkan Wireframe A; UI test tidak menggantikan tes izin database. |

**Gerbang urutan yang disarankan:** (1) finalkan identitas peran fixture dan lingkungan aman; (2) jalankan tes negatif/positif RLS dan RPC; (3) jalankan tes audit dan perubahan pemilik/status; (4) jalankan migration pada database disposable; (5) jalankan lint/build dan tes UI/integrasi; (6) sebelum rilis, cocokkan migration/grant/policy deployment dengan hasil staging secara read-only. Item berstatus terbuka harus tetap diblokir atau diuji hanya setelah keputusan terkait dibuat.

Pertanyaan Copilot berikutnya: kelompok mana yang perlu dirinci dulu menjadi kasus tes/acceptance criteria—hak akses, audit, status/pemilik, atau migrasi—dengan rekomendasi mulai dari **hak akses**.

### Masukan lanjutan — Pengguna

Pengguna memilih merinci kelompok tes **hak akses**.

### Tanggapan lanjutan — Copilot: matriks hak akses untuk pengujian

Kasus berikut adalah ekspektasi berdasarkan keputusan yang telah dikonfirmasi. Semua skenario dijalankan dengan akun dan rekaman sintetis melalui RLS/tabel, RPC, dan Server Actions yang relevan; menyembunyikan UI bukan hasil tes yang cukup.

| ID | Aktor/konteks sintetis | Tindakan yang diuji | Hasil yang diharapkan | Status kesiapan |
| --- | --- | --- | --- | --- |
| A01 | Tanpa autentikasi | Baca laporan, status, tugas, rekam BK; panggil RPC tulis/perubahan. | Tidak mendapat isi dan semua penulisan ditolak. | Ekspektasi terkonfirmasi; belum dapat dieksekusi. |
| A02 | Pelapor laporan negatif | Baca laporan miliknya; minta hasil triase/catatan internal dan laporan milik orang lain. | Laporan sendiri dan status yang diizinkan terbaca; hasil triase/catatan internal dan laporan lain tidak terbaca. | Ekspektasi terkonfirmasi; perlu proyeksi field agar teks tindak lanjut tidak ikut terbuka. |
| A03 | Guru mapel yang mengajar murid, tetapi bukan pelapor/wali | Baca laporan/triase/status langsung; baca arahan BK yang dibagikan; ulangi setelah jadwal aktif diubah/dihapus. | Tidak membaca laporan/triase/status langsung; hanya arahan yang dibagikan berdasarkan jadwal aktif terbaru. | Ekspektasi terkonfirmasi; policy Profile 360 saat ini berpotensi memberi akses catatan/penanganan. |
| A04 | Wali kelas aktif murid | Baca laporan asli dan status tinjauan yang dibuat selama masa penugasan; coba baca laporan lama tanpa pembagian, hasil triase/rekam BK, serta baca/tulis catatan tugas sesuai pemilik. | Laporan dan status dalam masa penugasan terbaca; laporan yang lebih lama dan isi BK tertutup tanpa pembagian yang sesuai; tulis hanya bila menjadi pemilik tugas aktif. | Ekspektasi terkonfirmasi; bagian tugas menunggu model tugas independen. |
| A05 | Wali kelas yang pernah menjadi pemilik lalu tugas dialihkan | Baca dan ubah catatan tugas setelah alih pemilik. | Catatan yang berhak dibaca tetap tersedia, tetapi tulis/ubah ditolak segera setelah hak pemilik berakhir. | Ekspektasi terkonfirmasi; belum dapat diuji pada skema tugas saat ini. |
| A06 | BK tanpa penugasan / BK pemilik aktif | Baca antrean dan rekam; coba ubah sebelum/ sesudah ditetapkan sebagai pemilik; ulangi setelah dialihkan. | BK dapat membaca sesuai cakupan; antrean tanpa pemilik baca-saja; hanya BK pemilik aktif dapat mengubah rekam konseling; pemilik lama langsung ditolak. | Ekspektasi terkonfirmasi; rekam konseling dan pemilik aktif belum terpisah pada skema saat ini. |
| A07 | Kamad dan waka | Baca laporan/triase langsung; baca ringkasan yang BK bagikan secara individual. | Akses langsung ditolak; hanya ringkasan yang dipilih dan status yang secara eksplisit dicantumkan dalam cakupan yang dapat dibaca. | Ekspektasi terkonfirmasi; policy repository memberi role ini jalur SELECT lebih luas. |
| A08 | Admin teknis | Baca isi laporan/triase/rekam BK; baca metadata audit sesuai kewenangan. | Isi sensitif ditolak; akses default hanya pada metadata audit sesuai aturan. | Ekspektasi terkonfirmasi; pemetaan identitas “admin teknis” ke role aplikasi harus diverifikasi di fixture/deployment. |
| A09 | Pihak yang menugaskan / BK penangan kasus / wali kelas sebelumnya | Baca catatan kerja tugas dengan status pemilik yang berubah. | Baca hanya sesuai relasi yang dikonfirmasi; tidak menjadi pemilik tulis hanya karena pernah menugaskan atau memiliki peran BK. | Ekspektasi terkonfirmasi; menunggu model pemilik/penugasan eksplisit. |
| A10 | Sesi terautentikasi dengan role/kelas berbeda | Panggil langsung tabel/RPC dan Server Actions, bukan hanya UI. | Hasil dan penolakan server/database sama dengan matriks; parameter ID milik pihak lain tidak memberi akses. | Gerbang teknis wajib; grant RPC dan policy deployment repository belum diverifikasi. |
| A11 | Wali kelas yang baru menerima penugasan; laporan dibuat sebelum masa tugas | Baca isi laporan dan status tinjauan tanpa pembagian BK. | Isi laporan dan status tinjauan ditolak; penugasan baru tidak membuka riwayat lama secara otomatis. | Ekspektasi terkonfirmasi; belum dapat dieksekusi. |
| A12 | BK membagikan satu laporan lama kepada wali kelas aktif yang berwenang | Baca laporan yang dipilih, laporan lama lain, status tinjauan, hasil triase, dan catatan internal; coba bagikan ke admin teknis yang tidak berwenang membaca laporan asli. | Hanya isi laporan yang dipilih dapat dibaca wali kelas; laporan lain, status tinjauan, triase, catatan internal, dan pembagian kepada role tak berwenang tetap ditolak. | Ekspektasi terkonfirmasi; mekanisme share belum tersedia/dirancang. |
| A13 | Akses laporan lama telah dibagikan; BK mencabut akses atau masa penugasan wali kelas berakhir | Ulangi baca melalui RLS, RPC, dan Server Actions setelah masing-masing peristiwa. | Akses ke laporan lama yang dibagikan langsung ditolak setelah pencabutan atau akhir penugasan; tidak ada cache/UI yang mempertahankan akses. | Ekspektasi terkonfirmasi; mekanisme pencabutan dan pencocokan penugasan belum diimplementasikan. |
| A14 | Role input perilaku diizinkan dan role yang tidak diizinkan | Cari/pilih murid di luar kelas; periksa field pada pemilih; panggil jalur tulis langsung sebagai role yang tidak berizin. | `guru_bk`, `wali_kelas`, `guru_mapel`, dan `guru_tahfidz` dapat memilih murid mana pun; pemilih hanya menampilkan nama/kelas. Role lain ditolak server-side. | Ekspektasi terkonfirmasi; daftar role dan field harus diuji pada UI serta server/RLS. |

**Jangan membuat expected result dulu** untuk: operasi arsip konten terhapus yang tujuan dan retensinya belum diputuskan; serta hasil tes berbasis `service_role` pada produksi. Aturan multi-peran per jenis data/aksi, daftar role input, cakupan semua murid, dan field pemilih sekarang sudah dikonfirmasi dan harus diuji sesuai matriks. Kasus A05–A06/A09 tetap menunggu model tugas, pemilik aktif, dan rekam BK.

Pemetaan tahap 6 menunjukkan calon ketidaksesuaian yang perlu menjadi tes regresi setelah perbaikan dirancang: pembacaan catatan oleh guru mapel/kamad/waka/admin melalui policy, pembacaan teks tindak lanjut oleh beberapa role, serta direct RPC yang harus menegakkan role. Belum ada tes yang dijalankan; environment aman belum tersedia. Copilot menanyakan apakah matriks ini sesuai untuk dijadikan draf acceptance criteria atau ada satu batas aktor/field yang perlu dikoreksi dahulu.

### Masukan lanjutan — Pengguna

Pengguna menyetujui matriks hak akses sebagai draf acceptance criteria dan memilih melanjutkan ke tes audit.

### Tanggapan lanjutan — Copilot: matriks tes audit

Kasus berikut mengikuti keputusan audit yang sudah dikonfirmasi. Prosedur yang masih **PERLU KLARIFIKASI** tetap ditandai dan tidak diubah menjadi expected result final.

| ID | Peristiwa/skenario sintetis | Hasil yang diharapkan | Status |
| --- | --- | --- | --- |
| AU01 | Pelapor/wali/BK yang berwenang membaca isi laporan atau status tinjauan yang dilindungi. | Audit memuat pembaca, waktu, identitas laporan, dan jenis akses; tidak memuat isi laporan/hasil triase/catatan BK. | Wajib; metadata pokok terkonfirmasi. |
| AU02 | BK membaca rekam konseling atau penerima yang berhak membaca ringkasan. | Pembacaan dicatat. Untuk ringkasan, metadata juga mencakup penerima dan identitas/versi ringkasan; teks tidak disalin. | Wajib; cakupan terkonfirmasi. |
| AU03 | BK membagikan atau mencabut ringkasan; penerima membaca setelah pembagian dan mencoba membaca kembali setelah pencabutan. | Pembagian, pembacaan, pencabutan dicatat dengan pelaku, waktu, laporan, penerima, jenis peristiwa, dan versi; akses baca berikutnya setelah pencabutan ditolak. | Wajib; tidak membatalkan informasi yang sudah dibaca. |
| AU04 | Pengguna mengunduh/mengekspor data sensitif. | Satu peristiwa ekspor terpisah dicatat, tidak digabung dengan pembacaan biasa, menggunakan metadata tanpa isi. | Wajib; perilaku pencatatan terkonfirmasi. |
| AU05 | Buat/edit/hapus/perubahan pemilik atau override akses sensitif. | Peristiwa yang relevan dicatat dengan metadata minimum aktor, waktu, objek, dan jenis perubahan; tidak menyimpan deskripsi atau teks tindakan sensitif. | Wajib; detail metadata spesifik mengikuti jenis peristiwa yang telah dikonfirmasi. |
| AU06 | Admin teknis membaca log audit; pengguna lain mencoba membaca tanpa persetujuan atau setelah akses berakhir. | Pembacaan oleh admin juga dicatat; pengguna tanpa hak ditolak. Akses khusus hanya berjalan untuk penerima, cakupan, dan masa berlaku yang disetujui; berakhir otomatis. | Aturan akses terkonfirmasi; implementasi/prosedur operasional perlu dibuat dan diuji. |
| AU07 | Permintaan akses khusus dibuat, disetujui kepala madrasah atau waka kesiswaan, digunakan, lalu berakhir. | Permintaan mencatat alasan, penerima, pemberi persetujuan, cakupan, dan masa berlaku; persetujuan sendiri tidak memberi hak baca. Bila penyetuju bukan penerima, setelah berakhir ia meninjau metadata pemakaian; bila orangnya sama, tinjauan itu tidak diperlukan. | Terkonfirmasi sebagai aturan; prosedur operasional masih terbuka. |
| AU08 | Satu penolakan akses, lalu penolakan berulang oleh aktor terautentikasi sama pada catatan sensitif yang sama; percobaan tanpa autentikasi. | Satu penolakan tidak dicatat sendiri. Pola terautentikasi baru dicatat setelah minimal dua penolakan; percobaan anonim tidak digabung sebagai aktor yang sama. | Ambang minimal terkonfirmasi; rentang waktu dan prosedur pengelompokan masih terbuka, jadi tes agregasi penuh ditunda. |
| AU09 | Pengguna mencoba UPDATE/DELETE langsung terhadap log; koreksi diperlukan. | Perubahan/penghapusan langsung ditolak; koreksi direkam sebagai peristiwa baru. Penghapusan karena retensi hanya melalui proses terpisah yang berwenang dan tercatat. | Terkonfirmasi; otorisasi/prosedur retensi belum dirancang. |
| AU10 | Pekerjaan otomatis berjalan sementara retensi belum diputuskan. | Tidak ada penghapusan otomatis dan peristiwa audit wajib tidak dikurangi; pemantauan sumber daya menggunakan metrik agregat, bukan meninjau isi log berkala. | Terkomfirmasi sebagai kondisi sementara; durasi/ambang/metode belum diputuskan. |
| AU11 | Hapus catatan yang mengaktifkan `catatan_perilaku_deleted_logs`. | Jangan menetapkan apakah snapshot konten diharapkan, harus dihapus, atau harus dipertahankan sebelum tujuan arsip dan retensinya diputuskan. | Diblokir sebagai acceptance test konten; klasifikasi saat ini adalah gap terbuka. |
| AU12 | BK membagikan, mencabut lebih awal, atau akses wali kelas berakhir otomatis karena penugasannya selesai. | Perubahan akses tercatat sebagai metadata audit tanpa menyalin isi laporan; setiap pembacaan ulang setelah pencabutan/akhir penugasan ditolak. | Kewajiban audit akses terkonfirmasi; detail mekanisme share/revoke belum dirancang. |

**Calon ketidaksesuaian repository:** audit edit menyimpan `old_text`; trigger penghapusan menyalin deskripsi dan seluruh teks penanganan ke `raw_payload`; pencatatan baca/berbagi/ekspor belum ditemukan pada migration/kode yang ditinjau. Tes metadata-only dan cakupan event karena itu belum dapat dinyatakan lulus. Hindari menjalankan tes atas data produksi; gunakan rekaman sintetis dan periksa bahwa isi sensitif tidak masuk ke log.

**Gerbang eksekusi:** matriks ini tetap rencana sampai lingkungan lokal/staging tersedia, prosedur akses khusus ditetapkan, jendela pengelompokan penolakan dibahas, dan tujuan arsip penghapusan diklarifikasi. Copilot menanyakan apakah matriks audit ini cukup akurat sebagai draf atau ada event/field yang perlu ditinjau dahulu.

### Masukan lanjutan — Pengguna

Pengguna menyatakan matriks audit cukup akurat dan memilih melanjutkan ke tes status/pemilik serta migrasi.

### Tanggapan lanjutan — Copilot: draf matriks status/pemilik dan migrasi

#### Status, kepemilikan, dan riwayat

| ID | Skenario sintetis | Hasil yang diharapkan |
| --- | --- | --- |
| ST01 | Laporan negatif disimpan tanpa tindakan awal. | Riwayat laporan menampilkan “Belum ada tindakan awal”; status tinjauan BK tetap “Belum ditinjau”; tidak dibuat tugas atau rekam BK otomatis. |
| ST02 | Pelapor menambahkan tindakan awal, lalu melengkapinya setelah laporan tersimpan. | Hanya tindakan pelapor masuk ke riwayat laporan; keadaan terkini mengikuti tindakan baru dan catatan/waktu terdahulu tetap ada. Tindakan awal tidak berubah menjadi tugas. |
| ST03 | BK membuka laporan tanpa menyimpan tinjauan, lalu menyimpan hasil triase. | Membuka saja tidak mengubah tinjauan. Status baru “Sudah ditinjau” setelah hasil triase final dan semua tugas yang diputuskan berhasil dicatat; tindakan awal/status laporan tetap terpisah. |
| ST04 | BK mencatat “Perlu informasi tambahan”, membuat tugas konkret untuk mengumpulkan informasi, lalu tugas selesai. | Hasil sementara tidak otomatis membuat tugas dan tetap “Belum ditinjau”; penyelesaian tugas pengumpulan informasi tidak menuntaskan tinjauan. BK meninjau lagi sebelum hasil final. |
| ST05 | BK memutuskan beberapa tindak lanjut untuk satu laporan. | Tiap tugas tertaut mempunyai pemilik, status, dan riwayat independen; perubahan/penyelesaian satu tugas tidak mengubah tugas lain. |
| ST06 | Wali kelas mengambil tugas sebelum triase, atau menerima tugas baru dari BK. | Pengambilan langsung memulai tugas sebagai “Sedang ditindaklanjuti”; tugas baru yang menunggu pemilik memakai “Menunggu wali kelas/BK” sampai pemilik mulai. |
| ST07 | BK mengambil alih tugas wali kelas yang sedang berjalan. | Identitas tugas tetap sama; catatan dan riwayat dipertahankan; status tetap berjalan; pemilik lama segera menjadi baca-saja; alasan BK singkat-operasional tercatat. |
| ST08 | Pemilik menyelesaikan tugas; BK memerlukan pemantauan tambahan. | Pemilik aktif dapat menyelesaikan tanpa persetujuan BK; pemantauan dibuat sebagai tugas baru tertaut, bukan membuka kembali tugas/rekam BK selesai. |
| ST09 | Tugas ditutup keliru atau tindakan yang sama belum selesai; lalu skenario berbeda dengan tindakan baru. | Reopen untuk kasus yang memenuhi syarat memerlukan alasan dan riwayat; pekerjaan baru dibuat sebagai tugas baru, bukan reopen. |
| ST10 | Tugas selesai sementara rekam konseling BK belum selesai, atau sebaliknya. | Status tugas dan rekam BK tetap independen; tidak ada penyelesaian otomatis silang. Aksi gabungan hanya lulus bila secara eksplisit mencatat keduanya selesai. |

#### Data dan migration

| ID | Skenario pada basis data disposable | Hasil yang diharapkan | Batas |
| --- | --- | --- | --- |
| MG01 | Jalankan migration terhadap skema fixture yang merepresentasikan struktur lama. | Migration berhasil atau gagal dengan jelas tanpa menghapus/menyusun ulang data secara diam-diam; kegagalan dapat dipulihkan sesuai rencana rollback. | Butuh konfigurasi Supabase lokal/staging yang belum tersedia. |
| MG02 | Buat fixture sintetis untuk catatan positif, laporan tanpa tindakan, tindakan awal, beberapa baris penanganan, status selesai/reopen. | Jumlah dan relasi sebelum/sesudah tercatat secara agregat; tiap rekaman hanya dipetakan setelah semantik legacy dan target disetujui. | Nilai status lama dan makna historis belum cukup untuk menetapkan mapping. |
| MG03 | Validasi sesudah migration. | Constraint/FK konsisten; tidak ada laporan yang kehilangan riwayat; tidak ada akses/isi sensitif yang muncul lewat relasi yang tidak berwenang. | Tidak memakai ID, nama, atau isi murid nyata. |
| MG04 | Terapkan migration ulang bila pola migration dirancang idempotent, atau uji jalur gagal dan rollback yang disepakati. | Hasil sesuai kontrak migration; tidak menggandakan data atau meninggalkan skema parsial. | Idempotensi/rollback harus ditentukan per migration, bukan diasumsikan universal. |
| MG05 | Bandingkan baseline dan hasil dengan status/record counts. | Validasi menggunakan agregat metadata saja; tidak menampilkan isi konten sensitif di log tes. | Jangan memeriksa data produksi untuk memenuhi gerbang ini. |

Nilai enum database dan mapping status legacy tetap terbuka; tes harus memeriksa perilaku/independensi status tanpa mengunci nilai teknis sebelum keputusan. Tes migrasi yang mentransformasi rekaman lama juga diblokir sampai semantik historis memperoleh bukti aman dan mapping disetujui. Draf ini belum diuji dan belum menyatakan migrasi atau perilaku yang sekarang telah memenuhi acceptance criteria.

Copilot menanyakan apakah draf status/pemilik dan migrasi ini cukup sebagai gerbang, atau ada skenario yang perlu dikoreksi sebelum merangkum tahap 7.

### Masukan lanjutan — Pengguna

Pengguna menyatakan draf status/pemilik dan migrasi cukup, lalu meminta rangkuman gerbang tahap 7.

### Tanggapan akhir — Copilot: status tahap 6–7

- **Tahap 6 dibahas dan diterima sebagai peta sementara.** Pemetaan membandingkan model data, akses/RLS, audit, status/riwayat, halaman, dan ketersediaan tes dengan keputusan produk. Tidak ada kode yang diubah dan tidak ada data murid nyata yang diperiksa.
- **Tahap 7 dibahas sebagai acceptance criteria, bukan eksekusi.** Matriks akses, audit, status/pemilik, dan migrasi telah disusun; matriks akses dan audit serta draf status/migrasi diterima. Tidak ada tes yang dijalankan.
- **Gerbang eksekusi masih terblokir:** belum tersedia Supabase lokal/staging yang disetujui; repository tidak memiliki `supabase/config.toml`, skrip/folder tes yang ditemukan, atau CLI Supabase pada lingkungan yang diperiksa.
- **Hal yang tetap terbuka:** konflik role multi-peran dan cakupan input murid; grant/policy yang benar-benar diterapkan di Supabase; nilai status teknis; semantik data lama; tujuan dan retensi arsip konten terhapus; rentang waktu pengelompokan penolakan; serta prosedur operasional akses khusus.

Langkah berikut yang direkomendasikan ialah mengklarifikasi batas role/cakupan data yang memengaruhi expected result tes akses; sesudah itu siapkan lingkungan uji sintetis sebelum merencanakan perubahan sensitif. Copilot menanyakan kelompok terbuka mana yang sebaiknya dibahas berikutnya.

### Masukan lanjutan — Pengguna

Pengguna memilih membahas **konflik role multi-peran dan cakupan input murid**.

### Tanggapan lanjutan — Copilot: pertanyaan kebijakan yang belum diputuskan

Konteks produk menandai kombinasi hak beberapa role dan matriks izin final sebagai **PERLU KLARIFIKASI**. Repository saat ini memberi role input yang diizinkan daftar seluruh kelas/murid, sedangkan policy SELECT kelas/murid memperbolehkan seluruh pengguna terautentikasi membaca tabel tersebut. Ini mendeskripsikan implementasi sekarang, bukan persetujuan cakupan produk.

Sebelum menetapkan expected result tes, Copilot meminta klarifikasi terpisah tetapi saling terkait: (1) bagaimana akses dua role aktif digabung bila batasnya berbeda; (2) apakah daftar sasaran input guru dibatasi pada penugasan aktif atau lebih luas. Copilot tidak menyimpulkan jawaban dari kode yang ada.

### Masukan lanjutan — Pengguna

Pengguna meminta simulasi dan konsekuensi tiap pilihan untuk penggabungan hak multi-role. Untuk cakupan input, pengguna memilih bahwa **setiap role yang memang diizinkan input dapat memilih murid mana pun**; pilihan ini belum menentukan role mana saja yang diizinkan input.

### Tanggapan lanjutan — Copilot: simulasi penggabungan hak

Contoh simulasi: seorang pengguna berperan sebagai guru BK sekaligus guru mapel. Ia mengajar murid yang memiliki rekam konseling BK, tetapi bukan BK penanggung jawab. Role BK mengizinkan membaca rekam konseling; role guru mapel tidak memberikan hak ke rekam konseling. Hasil bergantung pada aturan penggabungan:

| Pilihan | Hasil contoh | Manfaat | Risiko/konsekuensi |
| --- | --- | --- | --- |
| Gabungan aditif (union) | Pengguna mendapat hak baca karena role BK mengizinkan; role guru mapel tidak mencabut hak BK. | Sederhana bagi pengguna multi-peran; role tertentu tetap dapat menjalankan tugasnya. | Risiko: role yang luas dapat membuka akses sensitif tanpa konteks yang jelas; akses tulis tetap harus dibatasi hanya untuk BK penanggung jawab. |
| Paling ketat (intersection) | Pengguna ditolak membaca rekam konseling karena role guru mapel tidak mengizinkannya. | Mengurangi perluasan akses tak sengaja. | Dapat meniadakan hak baca BK yang sudah dikonfirmasi untuk seluruh pengguna BK dan menghambat pekerjaan yang sah. |
| Konteks role aktif | Saat memilih konteks BK, dapat membaca; saat konteks guru mapel, tidak dapat membaca. | Membuat konteks tindakan terlihat dan membatasi kebingungan lintas tugas. | Menambah langkah/gesekan; server tetap harus memverifikasi role dan cakupannya—pilihan di browser tidak boleh dipercaya sebagai otorisasi. |
| Aturan per jenis data/aksi | Untuk rekam konseling, role BK memberi hak baca; untuk arahan, jadwal mengajar menjadi sumber hak baca; hak tulis rekam BK tetap khusus pemilik aktif. | Paling sesuai untuk aturan produk yang berbeda-beda dan lebih aman untuk data sensitif. | Matriks dan tes lebih rinci; perlu disiplin pemeliharaan. Dapat digabung dengan konteks role aktif untuk UX. |

Kode saat ini cenderung memakai pola aditif pada pemeriksaan `has_any_role` dan array role, tetapi itu adalah fakta implementasi, bukan rekomendasi atau keputusan produk. Rekomendasi Copilot untuk domain perilaku sensitif ialah **aturan eksplisit per jenis data/aksi**, dengan prinsip hak minimum; jangan membuat satu role luas mengesampingkan batas objek lain. Pilihan final tetap milik pengguna.

Pilihan cakupan input tadi berarti: setelah pengguna termasuk role yang diizinkan input, pemilihan murid tidak dibatasi oleh kelas/jadwal. Itu tidak otomatis memberikan hak input kepada semua role. Daftar role mana yang memang boleh input tetap harus ditentukan terpisah sebelum acceptance test bisa menetapkan aktor positif/negatif.

Copilot menanyakan pilihan penggabungan hak dan apakah daftar role input harus mengikuti daftar kode saat ini atau ditentukan ulang.

### Masukan lanjutan — Pengguna

Pengguna memilih **aturan eksplisit per jenis data/aksi** untuk kombinasi role, dan memilih **daftar role input di kode saat ini sebagai baseline**.

### Tanggapan lanjutan — Copilot

Daftar baseline dalam `BEHAVIOR_INPUT_ROLES` saat ini adalah `admin`, `guru_bk`, `wali_kelas`, `waka_kesiswaan`, `guru_mapel`, dan `guru_tahfidz`. Digabung dengan pilihan cakupan sebelumnya, draft acceptance criteria input berarti: role yang termasuk dalam baseline dan memang berwenang input dapat memilih murid mana pun. Ini belum otomatis menetapkan bahwa daftar tersebut adalah izin produk final.

Pilihan aturan per jenis data/aksi akan menjadi dasar menyusun matriks otorisasi per objek, bukan izin union global. Karena dokumen konteks produk saat ini menandai matriks izin sebagai **PERLU KLARIFIKASI**, Copilot menanyakan apakah kedua pilihan ini harus dicatat sebagai keputusan produk **DIKONFIRMASI** di sumber kanonis, atau tetap sebagai baseline diskusi/tes sampai seluruh matriks role dan objek ditinjau.

### Masukan lanjutan — Pengguna

Pengguna mengonfirmasi pendekatan izin per jenis data/aksi serta cakupan bahwa setiap role yang berwenang input dapat memilih murid mana pun. Daftar role input di kode tetap hanya baseline untuk ditinjau, bukan daftar final yang dikonfirmasi.

### Tanggapan lanjutan — Copilot

Keputusan umum dan cakupan sasaran input akan dicatat sebagai **DIKONFIRMASI** dalam konteks produk; daftar role yang diizinkan input tetap **PERLU KLARIFIKASI** sampai ditinjau. Pembaruan kanonis akan dibatasi pada butir terkait, tanpa mengubah bagian lain pada dokumen yang sudah memiliki perubahan pengguna.

### Tanggapan lanjutan — Copilot

Kedua keputusan yang dikonfirmasi telah dicatat secara terbatas pada [konteks-penggunaan.md](../../konteks-penggunaan.md): hak multi-peran ditentukan per jenis data/aksi, dan setiap role yang memang berwenang input dapat memilih murid mana pun. Izin input tidak dengan sendirinya menetapkan hak baca lain; hak baca tetap mengikuti keputusan akses masing-masing. Daftar role input tetap **PERLU KLARIFIKASI** dan daftar dalam kode hanya baseline. Keputusan stabil ini dicatat dalam [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md) dan ditautkan ke Issue #1. Tidak ada perubahan kode aplikasi atau pelaksanaan tes. Langkah diskusi berikutnya adalah meninjau role mana yang benar-benar boleh input.

### Masukan lanjutan — Pengguna

Pengguna menetapkan role input perilaku sebagai Guru BK, wali kelas, guru mata pelajaran, dan guru tahfizh.

### Tanggapan lanjutan — Copilot

Daftar role input tersebut kini dicatat sebagai **DIKONFIRMASI** di [konteks-penggunaan.md](../../konteks-penggunaan.md) dan [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md). Role di luar daftar tidak diberi hak input perilaku; keputusan ini tidak menetapkan hak baca atau aksi lain. Issue #1 diperbarui agar mencerminkan daftar final tersebut. Matriks akses untuk data/aksi lainnya tetap terbuka. Tidak ada perubahan kode aplikasi atau tes yang dijalankan.

### Masukan lanjutan — Pengguna

Untuk pemilih murid saat input perilaku, pengguna memilih tampilan **nama dan kelas saja**.

### Tanggapan lanjutan — Copilot

Batas tampilan pemilih—nama dan kelas saja, tanpa informasi profil lain—telah ditambahkan ke [konteks-penggunaan.md](../../konteks-penggunaan.md), [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md), dan kriteria penerimaan Issue #1. Ini tidak mengubah hak baca profil atau rekam perilaku yang ditentukan secara terpisah. Matriks akses lainnya tetap terbuka; tidak ada perubahan kode aplikasi atau pelaksanaan tes.

### Masukan lanjutan — Pengguna

Pengguna memilih membahas hak baca laporan, status tinjauan, dan hasil triase.

### Tanggapan lanjutan — Copilot

Sebagian besar matriks tersebut telah dikonfirmasi: pelapor membaca laporan sendiri; wali kelas membaca laporan murid di kelas perwaliannya; BK meninjau seluruh laporan dan membaca hasil triase; guru mapel lain hanya membaca arahan yang dibagikan; waka/kamad hanya membaca ringkasan yang dipilih; admin teknis tidak membaca isi laporan atau triase. Celah yang ditanyakan adalah akses wali kelas baru terhadap laporan yang dibuat sebelum penugasannya.

### Masukan lanjutan — Pengguna

Pengguna memilih agar laporan sebelum masa penugasan wali kelas hanya dapat dibaca jika BK membagikannya secara eksplisit.

### Tanggapan lanjutan — Copilot

Aturan tersebut telah dicatat dalam [konteks-penggunaan.md](../../konteks-penggunaan.md) dan [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md), serta ditambahkan ke Issue #1. Mekanisme, cakupan penerima, dan masa berlaku pembagian laporan lama tetap terbuka; akses tersebut tidak boleh disamakan dengan pembagian ringkasan BK tanpa keputusan tambahan. Tidak ada perubahan kode aplikasi atau pelaksanaan tes.

### Masukan lanjutan — Pengguna

Pengguna memilih agar BK dapat menentukan penerima tertentu secara individual, lalu meminta penjelasan apakah “laporan” berarti laporan input perilaku atau keseluruhan penanganan. Setelah dijelaskan bahwa yang dimaksud adalah satu laporan insiden perilaku negatif asli—tidak termasuk tugas, hasil triase, ringkasan, atau rekam konseling—pengguna memilih bahwa penerima harus tetap berasal dari role yang sudah berwenang membaca laporan asli.

### Tanggapan lanjutan — Copilot

Copilot memastikan apakah wali kelas yang sedang bertugas dapat menerima satu laporan lama tertentu walaupun laporan itu dibuat sebelum masa penugasannya, tanpa memperoleh akses ke laporan lama lain atau hasil triase.

### Masukan lanjutan — Pengguna

Pengguna mengonfirmasi bahwa wali kelas saat ini dapat menerima akses ke laporan lama tertentu yang dibagikan BK, dengan batas satu laporan itu saja.

### Tanggapan lanjutan — Copilot

Aturan penerima individual, batas role penerima yang sudah berwenang membaca laporan asli, dan pengecualian satu laporan lama bagi wali kelas saat ini telah dicatat di [konteks-penggunaan.md](../../konteks-penggunaan.md), [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md), dan Issue #1. Pembagian tersebut tidak memberi hak atas laporan lama lain atau hasil triase/catatan internal. Mekanisme teknis dan masa berlaku pembagian masih terbuka; tidak ada perubahan kode atau pelaksanaan tes.

### Masukan lanjutan — Pengguna

Untuk masa berlaku pembagian BK atas laporan lama tertentu, pengguna memilih agar akses wali kelas berakhir otomatis ketika penugasannya untuk murid tersebut berakhir.

### Tanggapan lanjutan — Copilot

Masa berlaku tersebut telah dicatat di [konteks-penggunaan.md](../../konteks-penggunaan.md), [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md), dan kriteria penerimaan Issue #1. Keputusan ini membatasi akses pengecualian wali kelas; mekanisme teknis pembagian dan pencabutan masih perlu dirancang. Tidak ada perubahan kode atau pelaksanaan tes.

### Masukan lanjutan — Pengguna

Pengguna mengonfirmasi bahwa BK dapat mencabut akses ke laporan lama yang dibagikan sebelum masa penugasan wali kelas berakhir.

### Tanggapan lanjutan — Copilot

Hak pencabutan lebih awal oleh BK telah ditambahkan ke [konteks-penggunaan.md](../../konteks-penggunaan.md), [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md), dan Issue #1. Setelah dicabut, akses melalui pengecualian tersebut harus berhenti meskipun penugasan masih aktif. Detail teknis pembagian dan pencabutan tetap belum diputuskan; tidak ada perubahan kode atau pelaksanaan tes.

### Masukan lanjutan — Pengguna

Pengguna memilih menyusun gerbang tes server-side/RLS untuk pembagian laporan lama, pencabutan, dan akhir penugasan.

### Tanggapan lanjutan — Copilot

Saat meninjau matriks lama, ditemukan catatan yang masih menyebut role multi-peran dan cakupan sasaran input sebagai belum diputuskan; catatan itu kini dikoreksi. Skenario tambahan A11–A14 mencakup laporan lama, pembagian satu laporan, penolakan setelah pencabutan/akhir penugasan, dan daftar role/field pemilih input. Copilot meminta batas status tinjauan laporan lama sebelum menetapkan expected result.

### Masukan lanjutan — Pengguna

Pengguna menetapkan bahwa wali kelas hanya dapat melihat status tinjauan laporan yang dibuat selama masa penugasannya; pembagian isi laporan lama tidak membuka status tinjauan.

### Tanggapan lanjutan — Copilot

Batas ini dicatat pada [konteks-penggunaan.md](../../konteks-penggunaan.md), [ADR-0001](../../source-of-truth/decisions/0001-per-data-action-behavior-access.md), Issue #1, dan matriks akses A04/A11/A12. Tes audit AU12 juga mencakup metadata pembagian, pencabutan lebih awal, dan akhir penugasan tanpa menyalin isi laporan. Gerbang tes sudah dirinci, tetapi belum dijalankan karena lingkungan Supabase aman belum tersedia. Tidak ada perubahan kode aplikasi.

### Masukan lanjutan — Pengguna

Pengguna menerima A11–A14 dan AU12 sebagai draf acceptance criteria, belum sebagai tes yang dijalankan atau lulus.

### Tanggapan lanjutan — Copilot

Draf gerbang akses, audit pembagian/pencabutan, dan batas waktu penugasan diterima. Pelaksanaan tetap menunggu lingkungan Supabase lokal/staging terisolasi dengan akun serta data sintetis; tidak ada tes yang dijalankan dan tidak ada perubahan kode aplikasi.