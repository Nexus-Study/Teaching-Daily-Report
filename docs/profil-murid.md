**Skop Profil MVP dan Pengelola Data**

* **Komponen Wajib di MVP:** Kebutuhan Khusus, Rekomendasi Penanganan BK, dan Prestasi. Kebutuhan khusus wajib ada demi keselamatan siswa (misal: alergi, kondisi medis, atau disabilitas), sedangkan prestasi dan rekomendasi penting untuk intervensi kelas.
* **Penundaan Tahfizh dan Detail Nilai:** Modul *Tahfizh* sebaiknya ditunda dari MVP inti BK agar pengembangan fokus pada fungsi konseling dasar. Untuk nilai dan tugas, MVP cukup menampilkan indikator agregat dalam bentuk *read-only* (seperti status ketuntasan akademik) tanpa perlu menarik seluruh detail per mata pelajaran jika integrasi API belum siap.
* **Pengelola Data Nilai & Rekomendasi:**
* **Nilai dan Tugas:** Dikelola oleh **Guru Mata Pelajaran** atau **Tim Kurikulum** melalui sistem akademik/LMS. BK dan wali kelas hanya bertindak sebagai konsumen data.
* **Rekomendasi:** Dikelola oleh **Guru BK** dengan masukan dari wali kelas.



**Hak Akses dan Istilah (UI vs Database)**

* **Klarifikasi Peran Ketiga:** Pihak ketiga yang dimaksud pada perbaikan hak ubah profil adalah **Wakil Kepala Sekolah Bidang Kesiswaan** (untuk penetapan kebijakan kesiswaan) atau **Admin Data Sekolah** (untuk data induk siswa).
* **Pemisahan Istilah UI dan Database:** Penyesuaian istilah "murid" pada antarmuka pengguna dapat dilakukan sepenuhnya melalui *localization layer* pada UI, sementara tabel atau kolom basis data tetap menggunakan nama `siswa`. Praktik *software engineering* ini memisahkan tata bahasa tampilan (*User-Facing Language*) dengan skema data internal (*Data Layer*), sehingga terhindar dari migrasi basis data berisiko tinggi dan perubahan *query* legacy yang tidak perlu.

**Best Practice Tambahan**

* **Konseling (Strength-First Visual Hierarchy):** Susun tata letak profil siswa dengan menampilkan poin prestasi, minat, dan aspek positif di area paling atas, di atas riwayat kasus atau disiplin. Hierarki visual ini mencegah timbulnya *halo effect* atau bias negatif dari guru saat membaca data siswa.
* **Arsitektur Sistem (Modular Feature Toggle):** Bangun modul spesifik seperti *Tahfizh* atau *Ekstrakurikuler* sebagai komponen terpisah (*decoupled module*). Pendekatan ini memungkinkan fitur diaktifkan atau dinonaktifkan sesuai kebutuhan tanpa merusak fungsi inti bimbingan konseling.

---
Hak akses baca Guru Mata Pelajaran pada profil siswa diterapkan dengan prinsip *Need-to-Know* dan *Contextual Access* (Attribute-Based Access Control). Guru mapel hanya dapat membaca data yang berdampak langsung pada strategi pengajaran di kelas, serta hanya untuk siswa yang terdaftar di kelas yang diampunya pada semester aktif.

---

**1. Data Profil yang Boleh Diakses Guru Mapel (Visible Scope)**

* **Identitas Visual & Panggilan:** Nama lengkap, nama panggilan, foto, dan minat/hobi untuk membangun interaksi personal di kelas.
* **Petunjuk Penanganan & Akomodasi Kelas (BK Recommendations):** Instruksi taktis dari BK terkait instruksi belajar (misal: *"Perlu ditempatkan di baris depan karena gangguan penglihatan"*, atau *"Responsif terhadap tugas berbasis visual"*).
* **Kebutuhan Khusus & Kesehatan Penting:** Informasi alergi makanan/obat, kondisi fisik darurat (misal: riwayat kejang atau asma), dan kebutuhan aksesibilitas demi keselamatan siswa di kelas.
* **Apresiasi & Rekam Karakter Positif:** Daftar *badge* kelebihan, potensi, dan riwayat apresiasi karakter siswa agar guru mapel dapat menerapkan penguatan positif (*positive reinforcement*).
* **Indikator Umum Ketuntasan Belajar:** Ringkasan agregat status akademik (misal: butuh pendampingan di materi kuantitatif) tanpa perlu menampilkan seluruh histori nilai mata pelajaran lain.

---

**2. Data Profil yang Dibatasi/Disembunyikan (Restricted Scope)**

* **Rekam Sesi Konseling & Isu Keluarga:** Catatan hasil wawancara BK, konflik keluarga, kondisi finansial detail, atau dinamika psikologis internal.
* **Histori Pelanggaran Disiplin Detail:** Riwayat insiden negatif masa lalu yang sedang atau telah diselesaikan BK, guna mencegah prasangka (*halo effect*) dari guru mapel.
* **Catatan Kasus Rahasia:** Seluruh dokumen yang ditandai dengan tingkat kerahasiaan *Terbatas* atau *Sangat Rahasia*.

---

**3. Implementasi UI/UX & Arsitektur Teknikal**

* **Contextual Auto-Filter (ABAC):** Backend memvalidasi relasi tabel `JadwalPelajaran` dengan `GuruID`. Jika guru tidak mengajar kelas siswa tersebut, akses profil otomatis ditolak (403 Forbidden).
* **Dedicated Data Transfer Object (DTO):** API mengirimkan skema data khusus `StudentProfileTeacherView` yang memang tidak memuat atribut rahasia, bukan sekadar menyembunyikan elemen di *frontend*.
* **Visual Callout Card di Top Profile:** Pada UI profil siswa versi guru, rekomendasi strategi penanganan kelas diletakkan di bagian paling atas dalam bentuk *Highlight Box* berwarna hijau/biru agar langsung terlihat saat penyusunan rencana pembelajaran.

--
Penyesuaian skop MVP dengan mengecualikan modul nilai dan tugas mempertegas fokus aplikasi pada dimensi pengasuhan, keselamatan, dan penguatan karakter siswa.

### 1. Fitur Dependensi Pengisi Data Profil

| Fitur / Menu Sumber | Pengelola Data | Data yang Diumpan ke Profil Siswa | Implikasi pada MVP |
| --- | --- | --- | --- |
| **Master Data Siswa** | Admin / Tata Usaha | Data diri, kontak darurat, kebutuhan khusus medis (alergi, fisik, aksesibilitas) | Import via file spreadsheet atau sync API data induk. |
| **Jurnal Mengajar Guru Mapel** | Guru Mata Pelajaran | Rekam kehadiran (Sakit, Izin, Alpa) per jam pelajaran & catatan observasi harian | Digunakan sebagai *read-only* agregat kehadiran semester berjalan. |
| **Form Log Perilaku** | Guru Mapel & Wali Kelas | Feed riwayat apresiasi positif dan timeline status laporan insiden | Terintegrasi langsung (Single entry point). |
| **Workspace Konseling BK** | Guru BK | Petunjuk penanganan di kelas, status pendampingan aktif, serta rekomendasi khusus | Terintegrasi langsung dalam aplikasi. |
| **Modul Prestasi & Ekskul** | Pembina Ekskul / Wali Kelas | Daftar pencapaian, sertifikat, keikutsertaan organisasi, dan minat bakat | Formulir pencatatan sederhana pada MVP. |

---

### 2. Layout Wireframe Profil Siswa

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [◄ Kembali]  PROFIL MURID: Muhammad Rizky (Kelas X-IPA 1)       [ Cetak ]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Foto]  Muhammad Rizky (NISN: 0081234567)               Status BK: Aktif    │
│         Wali Kelas: Supriadi                            Apresiasi: 45 Poin  │
│         ⚠️ Catatan Kesehatan: Alergi Kacang Tingkat Berat                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💡 PETUNJUK PENANGANAN DI KELAS (Oleh Guru BK - 12 Okt 2026)                │
│ "Posisikan duduk di baris depan. Hindari menegur di depan umum.             │
│  Berikan waktu ekstra untuk tugas individual berbasis tulisan."            │
├─────────────────────────────────────────────────────────────────────────────┤
│ [ Tab 1: Apresiasi Karakter ] [ Tab 2: Status Insiden ]                     │
│ [ Tab 3: Minat & Prestasi ]   [ Tab 4: Data Induk ]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ TAB ACTIVE: Apresiasi Karakter (Total: 24 Catatan Positif)                  │
│                                                                             │
│  🟢 [15 Okt 2026] - Kategori: Kepemimpinan                                  │
│     "Inisiatif memimpin diskusi kelompok saat guru berhalangan."            │
│     Pencatat: Siti Aminah (Guru Fisika)                                     │
│                                                                             │
│  🟢 [08 Okt 2026] - Kategori: Kejujuran                                     │
│     "Mengembalikan barang yang ditemukan di kantin ke ruang piket."         │
│     Pencatat: Hendra (Guru Olahraga)                                        │
└─────────────────────────────────────────────────────────────────────────────┘

```
│ TAMPILAN BERDASARKAN PERAN PENGGUNA (ROLE-BASED VIEW):                      │
│                                                                             │
│ • Guru Mapel : Tab 1 (Mapelnya), Tab 2, Tab 3 (Ringkasan Status)            │
│ • Wali Kelas : Tab 1 (Total Kelas), Tab 2, Tab 3 (Detail), Tab 4 (Instruksi)│
│ • Guru BK    : Semua Tab + Akses ke Rekam Konseling Rahasia                 │
│ • Waka/Kamad : Tab Agregat + Ringkasan Eksekutif + Tombol Disposisi/SP      │

---

### 3. Rincian UI/UX dan Komponen Antarmuka

* **Header Identitas & Alert Medis:**
* Menampilkan foto, nama lengkap, nama panggilan, NISN, dan wali kelas.
* **Visual Warning Banner:** Kotak peringatan berwarna kuning kontras jika murid memiliki kebutuhan khusus atau kondisi kesehatan darurat. Komponen ini langsung terlihat begitu halaman dibuka untuk mencegah kelalaian keselamatan.


* **Banner Petunjuk Penanganan di Kelas (BK Callout Box):**
* Ditempatkan tepat di bawah header dengan latar berwarna biru muda.
* Hanya menampilkan ringkasan instruksi tindakan instruksional yang relevan untuk proses pembelajaran di kelas tanpa menyertakan riwayat konseling rahasia.


* **Tab 1: Apresiasi Karakter (Default View Guru Mapel):**
* Menampilkan daftar pencatatan positif secara kronologis.
* Dilengkapi filter kategori (Kepemimpinan, Empati, Kejujuran, Inisiatif) untuk mempermudah penilaian sikap.


* **Tab 2: Status Insiden & Penanganan:**
* **Variasi Tampilan Guru Mapel:** Berupa timeline status penanganan yang disederhanakan (contoh: *Laporan 10 Sep 2026 - Status: Selesai Ditangani BK*) dengan teks tertutup gembok untuk catatan rahasia.
* **Variasi Tampilan Guru BK:** Menampilkan tombol pintas menuju *Workspace Konseling* lengkap dengan catatan psikologis dan riwayat sesi.


* **Tab 3: Minat, Bakat, & Prestasi:**
* Berisi daftar kejuaraan, sertifikat yang diunggah, keterlibatan ekstrakurikuler, dan preferensi gaya belajar murid.



---

### 4. Adaptasi Antarmuka Berdasarkan Peran Pengguna

* **Guru Mata Pelajaran:** Fokus pada instruksi penanganan kelas, pencatatan apresiasi baru, dan pemantauan kondisi kesehatan murid.
* **Wali Kelas:** Akses membaca seluruh tab, termasuk agregat perkembangan karakter murid dan riwayat tugas penanganan yang dilimpahkan oleh BK.
* **Guru BK:** Memiliki kontrol penuh untuk memperbarui petunjuk penanganan di kelas, mengelola status pendampingan, serta mengakses tautan rekam konseling rahasia.

---
Antarmuka bagi Wakil Kepala Madrasah (Waka Kesiswaan) dan Kepala Madrasah (Kamad) dirancang khusus dengan pendekatan **Executive Overview**. Tampilan ini berfokus pada pengawasan manajerial, evaluasi tren makro, serta pengambilan keputusan strategis/kebijakan tanpa melanggar prinsip kerahasiaan konseling.

---

**Komponen UI/UX Profil Murid (Perspektif Waka & Kamad)**

**1. Panel Ringkasan Eksekutif (Executive Summary Card)**

* **Agregat Profil:** Menampilkan ringkasan poin apresiasi karakter, daftar prestasi, serta grafik tren perilaku murid secara kontekstual.
* **Status Pendampingan BK:** Menampilkan status terkini jika murid sedang dalam penanganan aktif (misal: *Dalam Pendampingan Khusus - Tingkat 2*).
* **Ringkasan Kasus Manajerial:** Teks deskriptif formal yang disusun khusus oleh BK untuk pimpinan (misal: *"Telah dilakukan mediasi orang tua terkait tingkat kehadiran. Membutuhkan keputusan rapat dewan guru"*), bukan rekam percakapan konseling rahasia.

**2. Panel Keputusan & Disposisi (Policy & Action Panel)**

* **Tombol Persetujuan Tindakan Formal:** Digunakan saat kasus membutuhkan eskalasi tingkat madrasah, seperti penerbitan Surat Peringatan (SP), keputusan skorsing, rujukan ke pihak eksternal, atau pemberian penghargaan/beasiswa prestasi.
* **Kolom Disposisi Pimpinan:** *Textarea* bagi Kamad/Waka untuk memberikan instruksi resmi kepada Guru BK atau Wali Kelas.

**3. Kontrol Akses Darurat (Break-Glass UX Pattern)**

* **Tampilan Default:** Catatan sesi konseling yang bersifat internal/rahasia tetap terkunci (🔒) demi menjaga kode etik konseling.
* **Tombol Override:** Terdapat tombol khusus `[ ⚠️ Buka Akses Detail Darurat ]`.
* **Modal Verifikasi Keamanan:** Membuka akses ini mewajibkan Pimpinan mengisi **Alasan Legitim** (misal: *Penyidikan Hukum*, *Ancaman Keselamatan Fisik/Jiwa*). Akses ini akan langsung mencatat stempel waktu, nama pimpinan, dan alasan ke dalam *Audit Log System*.

**4. Tab Jejak Akuntabilitas (Audit Trail & Timeline)**

* Menampilkan riwayat alur kerja penanganan: waktu laporan dibuat, durasi proses triase BK, identitas konselor yang menangani, hingga resolusi akhir kasus, guna memastikan standar operasional prosedur (SOP) madrasah berjalan dengan baik.

---



**3. SubRincian UI/UX dan Komponen Antarmuka Berdasarkan Peran**

* **Perspektif Guru Mata Pelajaran:**
* **Widget Presensi Mapel:** Menampilkan riwayat kehadiran murid khusus di mata pelajaran yang ia ampu (ditarik dari *Jurnal Mengajar*).
* **Quick-Log Behavior:** Tombol aksi cepat untuk mencatat apresiasi positif atau laporan insiden langsung dari tampilan profil.
* **Highlight Rekomendasi:** Kotak petunjuk penanganan dari BK tampil paling atas sebagai panduan interaksi instruksional di kelas.


* **Perspektif Wali Kelas:**
* **Dashboard Presensi Total:** Agregat kehadiran murid di seluruh mata pelajaran beserta indikator peringatan jika Alpa melebihi batas toleransi.
* **Monitoring Limpahan Kasus:** Panel khusus untuk mencatat dan memperbarui status penanganan insiden yang dilimpahkan oleh BK ke wali kelas.
* **Riwayat Apresiasi & Karakter:** Tampilan menyeluruh poin positif murid untuk bahan evaluasi rapor atau komunikasi dengan orang tua.


* **Perspektif Guru BK:**
* **Korelasi Kehadiran & Perilaku:** Grafik yang menghubungkan tren ketidakhadiran (dari *Jurnal Mengajar*) dengan munculnya insiden perilaku.
* **Akses Rekam Konseling Rahasia:** Tautan aman menuju *Workspace Konseling BK* yang berisi catatan wawancara dan diagnosis internal.
* **Editor Rekomendasi Kelas:** Form untuk memperbarui instruksi penanganan murid yang akan tampil di layar guru mapel dan wali kelas.


* **Perspektif Waka Kesiswaan & Kepala Madrasah:**
* **Panel Disposisi & Kebijakan:** Tombol persetujuan untuk penerbitan Surat Peringatan (SP), keputusan skorsing, atau penghargaan tingkat madrasah.
* **Ringkasan Manajerial:** Teks laporan formal ringkas dari BK tanpa menyertakan riwayat percakapan konseling yang sensitif.
* **Mekanisme Break-Glass:** Tombol akses darurat untuk membuka rekam konseling rahasia yang dilengkapi form konfirmasi alasan dan pencatatan *audit log*.



---

**4. Adaptasi Antarmuka & Perbandingan Akses Profil Murid**

**Perbandingan Akses Profil Murid Berdasarkan Peran**

| Elemen Informasi Profil | Guru Mata Pelajaran | Wali Kelas | Guru BK | Waka Kesiswaan & Kamad |
| --- | --- | --- | --- | --- |
| **Data Induk & Kontak Darurat** | ✅ Lihat | ✅ Lihat | ✅ Lihat | ✅ Lihat |
| **Alert Kebutuhan Khusus / Medis** | ✅ Lihat | ✅ Lihat | ✅ Lihat | ✅ Lihat |
| **Rekam Kehadiran (Jurnal)** | 🟢 Mapel Sendiri | 🔵 Total Kelas | ✅ Akses Penuh | 📊 Agregat Grafik |
| **Apresiasi & Catatan Positif** | ✅ Lihat & Catat | ✅ Lihat & Catat | ✅ Lihat & Catat | ✅ Lihat |
| **Instruksi Penanganan Kelas** | ✅ Lihat & Terapkan | ✅ Lihat & Pantau | 🛠️ Kelola / Edit | ✅ Lihat |
| **Status Penanganan Insiden** | 🟢 Ringkasan Status | 🟢 Ringkasan & Tugas | ✅ Akses Penuh | 🟡 Ringkasan Eksekutif |
| **Aksi Disposisi / SP / Kebijakan** | ❌ Terblokir | ❌ Terblokir | 🟡 Pengajuan | ✅ **Akses Penuh** |
| **Detail Rekam Konseling BK** | ❌ Terblokir | ❌ Terblokir | ✅ **Akses Penuh** | ⚠️ *Break-Glass* Only |