# Prasyarat Perlindungan Profil dan Perilaku Sensitif

Dokumen ini berisi rekomendasi praktik perlindungan data untuk profil murid, laporan perilaku, dan rekam konseling. Isinya adalah panduan untuk dibahas, bukan kebijakan madrasah yang sudah disahkan atau nasihat hukum. Keputusan akhir—terutama masa retensi dan kewenangan penghapusan—harus diselaraskan dengan kebijakan madrasah dan ketentuan Indonesia yang berlaku.

## Prinsip dan batas data

- Terapkan *privacy by design*: kumpulkan dan tampilkan hanya data yang diperlukan untuk tujuan pendidikan atau penanganan yang jelas.
- Perlakukan data anak, kesehatan/kebutuhan khusus, dan konseling sebagai data berisiko tinggi; jangan menampilkan data tersebut secara luas hanya karena berada di profil murid.
- Pisahkan laporan insiden faktual dari rekam konseling BK. Akses ke laporan tidak dengan sendirinya memberi akses ke catatan wawancara, riwayat keluarga, atau analisis konseling.
- Bedakan apresiasi positif, laporan insiden negatif, rekomendasi praktis untuk kelas, dan isi konseling. Tetapkan cakupan baca, tulis, ubah, hapus, ekspor, dan akses offline untuk setiap kategori.

## Kontrol akses

- Gunakan prinsip *deny by default* dan hak minimum (*least privilege*). Tentukan akses berdasarkan peran sekaligus konteks yang relevan, seperti kelas yang diajar, penugasan, status triase, dan penugasan kasus.
- Untuk laporan negatif yang belum ditriase, rekomendasi awal adalah membatasi akses ke pelapor dan BK. Setelah triase, akses diberikan kepada pihak yang ditugaskan dan hanya sejauh dibutuhkan untuk tindak lanjut.
- Simpan rekam konseling dalam cakupan akses yang lebih ketat daripada laporan insiden. Wali kelas dan guru pelapor dapat menerima petunjuk kelas atau status tindak lanjut yang diperlukan tanpa membuka catatan konseling.
- Hak admin teknis untuk mengelola sistem atau akun tidak otomatis memberikan hak membaca isi data sensitif.
- Jika tersedia akses darurat (*break-glass*), wajibkan alasan, identitas pengguna, waktu, cakupan data, dan pencatatan yang tidak dapat diubah oleh pengguna biasa. Batasi akses darurat dan lakukan tinjauan setelah penggunaan.
- Tinjau hak akses saat staf atau penugasan berubah dan secara berkala. Terapkan autentikasi kuat, khususnya untuk akun dengan hak istimewa.

## Audit dan pemantauan

Catat peristiwa penting yang berhubungan dengan data sensitif, sekurang-kurangnya:

- pembacaan atau pengunduhan data sensitif;
- pembuatan, perubahan, penghapusan, dan ekspor data;
- perubahan hak akses dan penugasan;
- penggunaan akses darurat.

Log mencatat siapa, kapan, tindakan apa, dan rekaman atau cakupan mana yang terdampak. Hindari menyalin isi konseling ke dalam log. Batasi akses ke log dan lindungi integritasnya agar perubahan dapat dideteksi. Tetapkan pemilik tinjauan log, cara melaporkan aktivitas mencurigakan, serta prosedur penanganan insiden.

## Enkripsi, pencadangan, dan pemulihan

- Lindungi data saat dikirim melalui jaringan dan saat tersimpan menggunakan mekanisme enkripsi yang dikelola dengan aman.
- Enkripsi cadangan, batasi akses dan kredensialnya, serta pisahkan akses cadangan dari akses aplikasi harian bila memungkinkan.
- Tetapkan siapa yang bertanggung jawab atas pencadangan, pemulihan, dan persetujuan akses cadangan.
- Dokumentasikan prosedur pemulihan dan uji pemulihan berkala. Frekuensi uji dan sasaran pemulihan harus ditetapkan madrasah berdasarkan risiko dan kemampuan operasional; keberhasilan pencadangan saja tidak membuktikan bahwa pemulihan dapat dilakukan.

## Retensi dan penghapusan

- Tetapkan jadwal retensi per kategori, misalnya laporan insiden, rekam konseling, apresiasi, data profil, dan log audit. Untuk setiap kategori, sebutkan tujuan, pemilik, masa simpan, dasar penyimpanan, dan tindakan setelah masa simpan berakhir.
- Jangan menetapkan satu masa simpan untuk semua data atau mengasumsikan bahwa data harus disimpan tanpa batas. Konfirmasikan kewajiban retensi dengan kebijakan madrasah dan aturan pendidikan/arsip yang relevan sebelum menetapkan jadwal.
- Penghapusan data sensitif harus dilakukan oleh pihak yang berwenang, dengan alasan dan jejak audit. Tentukan bagaimana penghapusan diterapkan pada salinan, lampiran, ekspor, dan cadangan sesuai kemampuan sistem dan kewajiban retensi.
- Tetapkan pengecualian dan proses penahanan data jika ada kewajiban arsip, pemeriksaan, atau sengketa yang berlaku. Penghapusan harus mengikuti proses pengecualian yang disetujui, bukan dilakukan otomatis tanpa pemeriksaan.

## Kriteria minimum sebelum rilis

Sebelum profil atau perilaku sensitif dibuka kepada pengguna:

- matriks izin per kategori data dan peran disepakati oleh pemilik kebijakan madrasah;
- uji izin membuktikan pengguna tidak dapat membaca, mengubah, menghapus, atau mengekspor data di luar cakupannya;
- akses darurat, perubahan izin, dan penghapusan tercatat dan dapat ditinjau;
- data sensitif dan cadangan memiliki perlindungan yang sesuai, dan prosedur pemulihan sudah diuji;
- kebijakan retensi, penghapusan, penanggung jawab, dan pengecualiannya ditetapkan;
- konten notifikasi, ekspor, dan penyimpanan offline tidak membocorkan data di luar izin;
- tersedia jalur pelaporan dan penanganan insiden privasi/keamanan.

Kriteria ini tidak menggantikan peninjauan kebijakan madrasah atau kewajiban hukum. Jika satu prasyarat yang berdampak langsung pada perlindungan belum dipenuhi, batasi atau tunda rilis data terkait sampai mitigasi disetujui.

## Rujukan

- [Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.go.id/id/uu-no-27-tahun-2022)
- [CISA K-12 Cybersecurity Foundations](https://www.cisa.gov/k-12-cybersecurity-foundations)
- [NIST SP 800-53 Rev. 5: Security and Privacy Controls for Information Systems and Organizations](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)

Rujukan di atas merupakan titik awal untuk peninjauan. Kewajiban khusus, jadwal retensi, dan penerapannya pada madrasah perlu dikonfirmasi terhadap aturan dan kebijakan setempat yang berlaku.
