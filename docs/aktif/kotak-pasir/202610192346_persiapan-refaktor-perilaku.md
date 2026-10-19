# Membandingkan konsep-penanganan-perilaku.md, konteks-penggunaan.md, dan app/portal/perilaku untuk refaktor kode dan perbaikan UI/UX/Logika Data

- **Status:** Terbuka
- **Dibuat:** 2026-10-19

## Ringkasan perkembangan diskusi pengguna dan Copilot (00:13-00:40 WIT)

- Tujuan awalnya membandingkan konsep, keputusan produk, dan implementasi perilaku untuk menyiapkan keputusan wireframe, alur, navigasi, peran, dan refaktor. Diskusi mendahulukan jenis rekaman dan alur; tidak ada perubahan aplikasi.
- Pemeriksaan awal menemukan implementasi berpusat pada `catatan_perilaku` dan `penanganan_perilaku`, dengan halaman input/rekap. Model khusus untuk penugasan dan rekam konseling belum tampak; form positif masih menyediakan tindakan/status, sementara audit/penghapusan juga memiliki gap terhadap kebutuhan yang dikonfirmasi.
- Guru boleh menyelesaikan tindakan awal laporan negatif tanpa menunggu BK; semua laporan tersimpan tetap dapat ditinjau BK. BK dapat menambahkan tindak lanjut setelah tindakan awal, dan penugasan langsung ke BK membuka rekam konseling formal yang terpisah.
- Status laporan, tugas tindak lanjut, dan rekam konseling harus terpisah. Label UI tugas yang disetujui: "Menunggu wali kelas/BK" -> "Sedang ditindaklanjuti" -> "Selesai"; nilai database/transisinya belum diputuskan.
- Catatan positif hanya menjadi entri profil, tanpa tindak lanjut/status. Untuk input dipilih satu menu "Catatan Perilaku" dengan pilihan Positif/Laporan Negatif.
- Setelah membandingkan Wireframe A (satu menu Perilaku dengan ruang kerja di dalam modul) dan B (menu ruang kerja terpisah), pengguna memilih A. Pengguna multi-peran melihat satu daftar yang dikelompokkan menurut jenis tugas/peran; halaman awal menyesuaikan pekerjaan utama, dengan aksi "Catat" tetap mudah dijangkau.
- Pelapor dapat melihat laporan sendiri dan statusnya. Wali kelas dapat segera melihat laporan negatif asli untuk murid di kelas perwaliannya, selain arahan/ringkasan yang diizinkan; akses ini tidak termasuk rekam konseling. Arahan BK bagi guru mapel tetap terbatas pada guru yang mengajar murid terkait.
- BK dapat memberikan arahan dan ringkasan singkat yang terpisah dari rekam konseling. Waka/kamad hanya membaca ringkasan yang dipilih BK untuk dibagikan; pembacaan ringkasan tersebut wajib diaudit. Batas isi, pembagian, dan rincian audit masih terbuka.

## Hasil sementara

### Kesepakatan bersama

- Tujuan percakapan ini adalah membandingkan konsep, konteks yang sudah disepakati, dan aplikasi aktual untuk kemudian menentukan wireframe, UI/UX, menu, alur, perampingan kode, serta hubungan antarperan.
- Tidak ada perubahan aplikasi dalam diskusi ini. Keputusan produk yang telah dinyatakan eksplisit tentang alur dan cakupan pembaca sudah dicatat terbatas di sumber kanonis yang relevan.

### Fakta dan keputusan yang menjadi batas

- Keputusan perilaku yang berstatus **DIKONFIRMASI** di [konteks-penggunaan.md](../../konteks-penggunaan.md) mengikat; rincian konsep lain tetap usulan kecuali dikonfirmasi.
- Model aktual berpusat pada catatan perilaku dan tindak lanjut berstatus; UI saat ini mempunyai halaman input dan rekap, bukan workspace berbeda untuk setiap alur/peran.
- Form saat ini memungkinkan tindakan awal pada catatan positif; jalur hapus dan audit di migration juga belum sesuai dengan keputusan penghapusan tindak lanjut yang hanya menyimpan metadata.
- Status Baru/Ditugaskan dan rancangan akses sebelum/selepas triase belum diputuskan. Perilaku kode saat ini tidak menggantikan klarifikasi tersebut.
- Pengguna memilih alur dan jenis rekaman sebagai titik awal diskusi; pilihan ini mengatur urutan pembahasan, bukan persetujuan atas suatu alur produk.
- Pengguna menyatakan guru dapat menangani laporan negatif sendiri, semua laporan negatif tersimpan dapat ditinjau BK, dan BK dapat melakukan triase untuk menetapkan tindak lanjut bagi wali kelas atau BK.
- Pengguna memilih agar BK membuat arahan tindakan dan ringkasan singkat sesi yang terpisah dari catatan konseling lengkap. Wali kelas hanya melihat informasi untuk kelas perwaliannya; waka kesiswaan dan kamad juga disebut sebagai pembaca.
- Waka kesiswaan dan kamad hanya dapat melihat ringkasan yang dipilih BK untuk dibagikan; akses ini tidak mencakup catatan konseling lengkap.
- Setiap pembacaan ringkasan BK yang dibagikan wajib dicatat dalam audit. Batas isi, mekanisme BK memilih/mencabut pembagian, dan rincian audit masih perlu dirinci.
- Guru mata pelajaran yang mengajar murid terkait dapat membaca arahan tindakan BK; izin ini tidak otomatis mencakup ringkasan sesi atau catatan konseling lengkap.
- Jika guru menandai “Ditangani di Tempat”, tindakan awal guru dianggap selesai dan laporan tetap dapat ditinjau BK kemudian.
- BK dapat menambahkan penugasan/tindak lanjut kepada wali kelas atau BK setelah tindakan awal guru selesai; riwayat tindakan awal tetap dipertahankan.
- Setiap penugasan langsung kepada BK membuka rekam konseling formal terpisah; laporan insiden tidak otomatis menjadi rekam konseling.
- Status laporan awal, tugas tindak lanjut, dan rekam konseling terpisah; tindak lanjut tidak mengganti status awal laporan.
- Nilai dan transisi status untuk tiap jenis rekaman, termasuk pemetaan label yang sekarang dengan rancangan “Ditugaskan”, masih perlu diputuskan.
- Pengguna menginginkan bahasa status yang mudah dipahami guru nonkonselor dan menyetujui urutan label tugas “Menunggu wali kelas/BK” → “Sedang ditindaklanjuti” → “Selesai”. Nilai status database dan transisi teknis belum disepakati.
- Catatan positif hanya menjadi entri profil, tanpa tindak lanjut atau status.
- Pengguna memilih satu menu “Catatan Perilaku” dengan pilihan Positif/Laporan Negatif sebagai arah wireframe. Data dan proses keduanya tetap terpisah; belum ada perubahan kode.
- Pengguna memilih Wireframe A: satu menu utama Perilaku dengan ruang kerja di dalam modul yang menyesuaikan peran.
- Jika pengguna memiliki beberapa peran, daftar pekerjaan digabung dan dikelompokkan menurut jenis tugas/peran; pemilihan peran satu demi satu tidak diperlukan.
- Halaman awal menyesuaikan pekerjaan utama: input cepat untuk guru yang terutama mencatat, daftar kerja untuk BK/wali kelas, dan daftar terkelompok dengan aksi Catat bagi pengguna multi-peran.
- Guru pelapor dapat melihat laporan yang ia kirim dan status penanganannya; arahan BK hanya terlihat jika ia mengajar murid terkait. Ringkasan sesi dan rekam konseling tidak termasuk akses tersebut.
- Wali kelas dapat langsung melihat laporan negatif asli setelah dikirim untuk murid di kelas perwaliannya, selain arahan dan ringkasan BK; akses ini tidak mencakup rekam konseling.
- Wali kelas dapat mengambil tanggung jawab tindak lanjut untuk setiap laporan negatif murid di kelas perwaliannya sebelum triase BK; mekanisme penugasan langsung dan pengambilalihan oleh BK masih perlu dirinci.
- Jika tugas/rekam konseling BK selesai tetapi pemantauan masih diperlukan, pengguna memilih tugas pemantauan wali kelas terpisah dan tertaut; rekam BK tetap selesai. Arahan umum tanpa tindakan dapat berupa rekomendasi saja, sedangkan tindakan yang harus dituntaskan menjadi tugas berstatus.
- Rekomendasi umum tanpa tindakan/penyelesaian yang diharapkan dapat berupa arahan saja; tindakan spesifik yang perlu dituntaskan harus menjadi tugas berstatus, dan arahan BK dapat menjadi panduan pendukung.
- Jika BK mengambil alih tugas wali kelas yang berjalan, tugas yang sama berpindah ke BK dan riwayat wali dipertahankan; pemantauan wali sesudah tindakan BK memerlukan tugas baru yang tertaut.
- Petugas BK mana pun dapat mengambil alih tugas wali kelas dan menjadi pemilik BK yang ditugaskan; alasan singkat-operasional wajib dicatat, sedangkan alasan untuk perpindahan lain dan akses riwayat masih terbuka.
- Pengambilalihan BK wajib memiliki alasan singkat-operasional dan mencatat waktu serta pemilik lama/baru; alasan dan visibilitas jenis perpindahan lain masih perlu dirinci.

### Rekomendasi belum dikonfirmasi

- Lanjutkan MVP pada bagian yang tidak bergantung pada pertanyaan terbuka; mulai diskusi rancangan dari pemisahan jenis rekaman dan alur/status, kemudian izin per peran, lalu menu/wireframe.
- Perlakukan gap positif-versus-triase serta penghapusan/audit sebagai isu inti untuk diselesaikan sebelum refaktor terkait, bukan sekadar pemolesan UI.

### Langkah berikutnya

- Tetapkan nilai dan transisi status secara terpisah bagi laporan, tugas wali kelas, dan rekam konseling BK sambil mempertahankan riwayat tindakan awal.
- Rancang hubungan menu “Catatan Perilaku” dengan ruang kerja/rekap per peran tanpa memperluas akses yang belum diputuskan.
- Tentukan alasan dan akses riwayat untuk jenis penugasan/perpindahan lain; lanjutkan rincian akses peran lain dan pembagian ringkasan BK.

## Perkembangan setelah Hasil sementara (00:41-00:48 WIT)

- Pengguna menetapkan wali kelas boleh mengambil tanggung jawab tindak lanjut untuk setiap laporan negatif murid di kelas perwaliannya sebelum triase BK.
- Setelah membandingkan tugas yang sama dipindahkan, tugas baru tertaut, dan rekomendasi saja, pengguna memilih: bila pekerjaan BK selesai tetapi pemantauan masih perlu, tutup tugas/rekam BK dan buat tugas pemantauan wali kelas baru yang tertaut.
- Rekomendasi umum tanpa tindakan/penyelesaian yang diharapkan dapat berupa arahan saja. Tindakan khusus yang harus dilaksanakan menjadi tugas dengan pemilik dan status; arahan BK dapat menjadi panduannya.
- Jika BK mengambil alih tugas wali kelas yang masih berjalan, tugas yang sama berpindah ke BK dan riwayat wali dipertahankan; wali kelas menjadi baca-saja. Petugas BK mana pun boleh mengambil alih, dengan alasan singkat-operasional wajib dicatat. Jika pemantauan wali diperlukan lagi setelah pekerjaan BK selesai, buat tugas wali baru yang tertaut.
- Masih terbuka: alasan dan akses riwayat untuk perpindahan lain, rincian status/transisi, serta rincian akses dan audit yang belum diputuskan.

## Catatan pengguna tentang hasil sementara

[Opsional. Pengguna dapat menambahkan koreksi atau menjelaskan bagian yang tidak mewakili pemahamannya. Copilot menanggapi di bawah catatan ini tanpa menghapusnya.]

## Tanggapan Copilot atas catatan pengguna

[Konfirmasi dan perbaikan ringkasan, atau penjelasan perbedaan pandangan beserta pertanyaan klarifikasi.]