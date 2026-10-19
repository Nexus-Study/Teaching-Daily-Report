# Kelanjutan MVP perilaku dan batas penggunaan data riil

- **Status:** Terbuka
- **Dibuat:** 2026-10-19
- **Terakhir dirangkum:** 2026-10-19

## Ringkasan

Diskusi ini membahas cara memajukan MVP perilaku dengan segera, sambil
membedakan keputusan produk yang sudah dikonfirmasi dari pertanyaan keamanan
operasional yang belum selesai. Pengguna adalah satu-satunya pengambil
keputusan. Aplikasi sudah digunakan oleh Guru BK dan database yang digunakan
adalah produksi dengan data murid nyata. Tujuan awal yang disampaikan pengguna
adalah mendukung penanganan perilaku negatif oleh BK dan membuat pengisian
jurnal harian oleh guru mata pelajaran nyaman serta aman.

## Catatan dan keputusan pengguna

Semua masukan di bawah disampaikan pada **2026-10-19**. Bagian ini merangkum
catatan pengguna dari diskusi; rekomendasi Copilot tidak dianggap sebagai
keputusan pengguna.

- Waktu untuk menyiapkan data anonim terbatas. Pengguna mempertimbangkan pilot
  dengan sejumlah tester tepercaya dan data riil, serta meminta rekomendasi
  tentang cakupan tester.
- Database produksi sudah berisi jurnal, presensi, laporan perilaku, dan
  catatan konseling. Guru BK telah mulai menggunakan aplikasi.
- Kemampuan memasukkan catatan konseling baru harus tetap tersedia. Dokumen
  `docs/konsep-penanganan-perilaku.md` diminta menjadi dasar awal rancangan
  UI/UX dan pengamanan, bukan persetujuan otomatis atas seluruh isinya.
- Semua pengguna dengan peran Guru BK boleh membaca seluruh rekam konseling.
  Hanya Guru BK yang ditugaskan pada kasus boleh membuat atau mengubah rekam
  konseling kasus tersebut. Saat keputusan ini disampaikan, ada dua Guru BK;
  akses perlu ditinjau sebelum jumlah atau keanggotaan BK berubah.
- Pengguna memilih cakupan isi penuh/sensitif seperti yang diusulkan konsep,
  lalu memperjelas bahwa catatan MVP memakai rich-text bebas tanpa daftar
  field wajib. Format bebas ini tidak dengan sendirinya mewajibkan setiap
  jenis informasi sensitif untuk dikumpulkan.
- Analitik pencegahan dan pengembangan metode penanganan bukan fitur aplikasi
  MVP.
- Setiap pembacaan rekam konseling wajib dicatat dalam audit. Pengguna memilih
  melanjutkan diskusi melalui dokumen terlebih dahulu dan belum meminta
  perubahan aplikasi.
- Pemeriksaan akses yang telah dilakukan berupa login visual dan percobaan
  CRUD melalui UI. Pengguna mengonfirmasi bahwa pengujian tersebut
  mengandalkan asumsi bahwa RLS membatasi akses di server; akses negatif
  langsung melalui server/API belum dibuktikan.
- Wali kelas yang sedang ditugaskan dapat membuat dan mengubah entri tindak
  lanjut yang terpisah dari rekam konseling internal BK. Setelah kasus
  dikembalikan kepada BK, wali kelas hanya dapat membaca.
- Selama masih ditugaskan, wali kelas boleh menghapus tindak lanjut dengan
  alasan dan audit. Isi yang dihapus tidak disimpan sebagai salinan; metadata
  audit saja yang dipertahankan.
- Pengguna menyetujui pembaruan terbatas pada `docs/konteks-penggunaan.md`:
  keputusan yang telah dinyatakan eksplisit dicatat sebagai dikonfirmasi,
  sementara keamanan operasional dan pertanyaan lain tetap terbuka.

## Keputusan produk yang tercatat di sumber kanonis

Butir berikut sudah dipindahkan ke
[`docs/konteks-penggunaan.md`](../../konteks-penggunaan.md):

- Semua Guru BK dapat membaca seluruh rekam konseling; hanya BK yang
  ditugaskan pada kasus dapat membuat atau mengubah rekam kasus.
- Rekam konseling terpisah dari laporan insiden dan tindak lanjut wali kelas;
  format rekam konseling adalah rich-text bebas.
- Wali kelas yang ditugaskan dapat membuat/mengubah tindak lanjut terpisah,
  lalu hanya membaca setelah tugas dikembalikan ke BK.
- Setiap pembacaan rekam konseling dicatat. Penghapusan tindak lanjut wali
  kelas memerlukan alasan dan audit metadata, tanpa menyimpan salinan isi yang
  dihapus.
- Analitik pencegahan berada di luar MVP aplikasi.

Status kanonis berlaku untuk keputusan produk saja. Status tersebut bukan
bukti bahwa aplikasi, server, RLS, atau database produksi sudah menegakkan
aturan aksesnya.

## Hal yang masih terbuka

- Sumber data penugasan BK dan wali kelas, pihak yang mengelolanya, serta cara
  perubahan atau pencabutan penugasan memengaruhi izin.
- Akses pelapor dan wali kelas ke laporan insiden sebelum/selepas triase.
- Akses detail bagi waka kesiswaan, kamad, admin teknis, dan peran selain BK;
  termasuk apakah ada akses darurat.
- Alur/status kasus yang berlaku, termasuk perubahan atau pembukaan kembali
  kasus.
- Verifikasi RLS dan grants yang aktif di produksi, serta uji server/API bahwa
  baca, tulis, dan hapus yang tidak diizinkan benar-benar ditolak.
- Bukti bahwa setiap baca konseling diaudit, log tidak menyalin isi catatan,
  dan akses ke log dibatasi.
- Retensi log audit, pihak yang meninjaunya, serta apakah unduhan data sensitif
  harus diaudit secara terpisah.
- Tata kelola retensi, penghapusan, pencadangan, pemulihan, dan penanganan
  insiden untuk data sensitif.
- Batas dan prasyarat untuk menambah tester atau memperluas penggunaan data
  riil.

Pertanyaan yang tidak menghalangi irisan MVP dapat tetap `PERLU KLARIFIKASI`
dan dibahas terpisah. Jangan menafsirkan status terbuka sebagai izin untuk
memperluas akses.

## Rekomendasi Copilot — bukan keputusan pengguna

- Lanjutkan pekerjaan MVP yang tidak bergantung pada pertanyaan terbuka;
  pisahkan kebutuhan UI/UX dari implementasi izin dan bukti keamanannya.
- Sebelum memperluas pilot atau menyimpulkan penggunaan data riil aman,
  periksa kebijakan dan grants produksi secara read-only serta lakukan uji
  akses server/API yang seharusnya ditolak menggunakan akun dan data uji aman.
  Jangan menguji perubahan atau penghapusan pada rekaman murid sungguhan.
- Jangan menjadikan kepercayaan tester atau penyembunyian kontrol di UI
  sebagai satu-satunya perlindungan. Catat hasil pengujian tanpa nama,
  identitas murid, ID rekaman, token, atau isi konseling.
- Pastikan audit baca benar-benar berjalan dan tidak menyimpan isi rich-text;
  tetapkan pembatasan akses serta retensi log sebelum mengandalkannya.

Rekomendasi di atas bukan kesimpulan bahwa kebocoran telah terjadi, juga bukan
bukti bahwa deployment produksi aman. Migrasi repository memberi petunjuk
tentang konfigurasi, tetapi keadaan produksi harus diverifikasi langsung
dengan prosedur yang aman.

## Kelanjutan diskusi

Topik ini tetap **Terbuka**. Diskusi dapat dilanjutkan lagi di file yang sama
untuk memutuskan hal-hal yang belum selesai. Tambahkan masukan pengguna dan
tanggapan berikutnya secara berurutan, pertahankan tanggal, dan perbarui
ringkasan ini tanpa mengubah rekomendasi menjadi keputusan kecuali pengguna
mengonfirmasinya secara eksplisit.
