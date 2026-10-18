Penggabungan prinsip bimbingan konseling dan arsitektur perangkat lunak yang ideal menuntut pemisahan yang jelas antara laporan kejadian awal dan rekam konseling, serta penerapan kontrol akses berbasis peran yang ketat.

**Konfirmasi dan Alur Status Kasus**

* **Triase Laporan vs Kasus Resmi:** Laporan dari guru tidak boleh langsung otomatis menjadi kasus resmi BK. Guru sebaiknya membuat dokumen laporan insiden terlebih dahulu. Guru BK kemudian melakukan verifikasi dan triase. Langkah ini mencegah penumpukan kasus yang tidak relevan, menjaga objektivitas, serta memastikan pelanggaran disiplin ringan tetap diselesaikan di tingkat guru mata pelajaran atau wali kelas.
* **Kesesuaian Alur Status:** Urutan status Baru → Ditugaskan → Diproses → Selesai sudah sangat sesuai. Opsi hasil penanganan "Ditangani di tempat" tepat digunakan sebagai resolusi cepat saat triase agar laporan dapat ditutup tanpa membuka proses konseling formal. Kebijakan yang mewajibkan pengisian alasan saat membuka kembali status kasus yang telah selesai sangat penting untuk integritas data dan jejak audit.

**Kontrol Akses dan Kerahasiaan Data**

* **Hak Akses Kasus Baru:** Akses awal sebelum klasifikasi kerahasiaan diatur hanya diberikan kepada pelapor dan guru BK. Membatasi akses otomatis bagi wali kelas, wakil kepala sekolah kesiswaan, dan kepala madrasah pada tahap awal bertujuan melindungi privasi siswa dari potensi stigma sebelum kebenaran laporan divalidasi.
* **Hak Akses Pimpinan:** Wakil kepala sekolah dan kepala madrasah tidak boleh memiliki akses bebas tanpa batas ke seluruh detail konseling yang dibatasi. Pimpinan sekolah hanya diberikan akses apabila terdapat rujukan resmi, laporan ringkas eksekutif, atau mekanisme pembukaan khusus darurat yang mencatat alasan serta identitas pembuka akses secara permanen.
* **Hak Akses Guru Pelapor:** Guru mata pelajaran yang melaporkan berhak mengetahui pembaruan status laporan dan petunjuk penanganan siswa di dalam kelas. Namun, guru pelapor tidak berhak melihat catatan wawancara, riwayat keluarga, atau analisis psikologis siswa yang ada dalam rekam konseling.

**Rekomendasi Arsitektur Tambahan**

* **Pemisahan Entitas Sistem:** Buat dua entitas terpisah pada basis data, yaitu Entitas Laporan Insiden untuk mencatat fakta kejadian dari pelapor dan Entitas Kasus Konseling untuk mencatat proses penanganan internal BK.
* **Tingkat Sensitivitas Kasus:** Sediakan atribut tingkat kerahasiaan pada setiap kasus, seperti Tingkat Umum, Terbatas, dan Sangat Rahasia.
* **Pencatatan Audit Akses:** Implementasikan log audit yang mencatat setiap aktivitas melihat, mengunduh, atau mengubah data kasus sensitif guna memastikan akuntabilitas seluruh pengguna sistem.
---
Berikut adalah rancangan **Alur Kerja (Workflow) dan Spesifikasi UI/UX Aplikasi** yang dirancang khusus untuk memisahkan *Laporan Insiden* dengan *Rekam Konseling BK*, mengimplementasikan triase, serta menegakkan kontrol akses (RBAC) yang presisi.

---

### 1. Peta Alur Kerja (Workflow Diagram)

```text
[Guru Pelapor]
    │
    ▼ (Input Laporan Insiden Faktual)
[Sistem: Entitas Laporan] ── (Status: BARU) ──► Notifications ke BK
                                                      │
                                                      ▼
                                           [Dashboard Triase BK]
                                                      │
               ┌──────────────────────────────────────┼──────────────────────────────────────┐
               ▼                                      ▼                                      ▼
    [Aksi: Ditangani di Tempat]             [Aksi: Rujukan Wali Kelas]              [Aksi: Buat Kasus BK]
               │                                      │                                      │
               ▼                                      ▼                                      ▼
(Status: SELESAI - Ditangani di Tempat)    (Status: DITUGASKAN - Wali Kelas)     (Status: DITUGASKAN - Konselor BK)
  - Notifikasi ke Pelapor                    - Akses dibuka untuk Wali Kelas         - Buat Entitas Kasus Konseling
  - Laporan ditutup tanpa Kasus BK            - BK memantau perkembangan              - Atur Tingkat Kerahasiaan
                                                                                             │
                                                                                             ▼
                                                                                   (Status: DIPROSES)
                                                                                     - Sesi Konseling
                                                                                     - Catatan RAHASIA (Hanya BK)
                                                                                     - Feedback Kelas (Untuk Guru)
                                                                                             │
                                                                                             ▼
                                                                                   (Status: SELESAI)
                                                                                     - Isi Resolusi Akhir
                                                                                     - Opsi REOPEN (Wajib Alasan)

```

---

### 2. Rincian UI/UX Per Antarmuka (Screen & Component Level)

#### **A. Halaman 1: Formulir Laporan Insiden (Perspektif Guru Pelapor)**

* **Tujuan:** Memudahkan guru mencatat pencapaian/karakter positif maupun laporan insiden negatif siswa dalam satu formulir adaptif.
* **Elemen UI/UX Utama:**
1. **Segmented Control / Toggle Jenis Perilaku (Komponen Utama):**
* Pilih Mode: `[ 🟢 Perilaku Positif / Apresiasi ]` | `[ 🔴 Perilaku Negatif / Insiden ]`
* *Behavior UX:* Mengubah judul formulir, daftar pilihan kategori, serta ketersediaan *field* input secara dinamis sesuai pilihan toggle.


2. **Field Input Umum (Selalu Tampil):**
* **Siswa Terlibat:** *Searchable Auto-complete* (Pilih nama/NISN siswa).
* **Waktu & Lokasi:** *Date-time picker* & *Dropdown* (Kelas, Kantin, Lapangan, Perpustakaan, dll).
* **Lampiran Bukti (Opsional):** *File Upload* (Foto kejadian, foto sertifikat, atau dokumen pendukung).


3. **Field Input Dinamis (Menyesuaikan Toggle):**
* **Jika Memilih `[ 🟢 Perilaku Positif / Apresiasi ]`:**
* **Kategori Apresiasi:** *Dropdown* (Kepemimpinan, Empati & Kepedulian, Kejujuran, Inisiatif Pembelajaran, Prestasi/Bakat).
* **Deskripsi Perilaku:** *Textarea* dengan placeholder: *"Tuliskan perilaku positif atau pencapaian spesifik yang ditunjukkan siswa."*
* **Info Badge System:** Visual info card ℹ️ *"Catatan ini akan langsung masuk ke Profil Siswa sebagai poin penguatan karakter."*


* **Jika Memilih `[ 🔴 Perilaku Negatif / Insiden ]`:**
* **Kategori Insiden:** *Dropdown* (Kedisiplinan, Akademik, Perundungan, Interaksi Sosial, Lainnya).
* **Deskripsi Kejadian (Faktual):** *Textarea* dengan placeholder: *"Tuliskan fakta yang dilihat/didengar langsung. Hindari opini psikologis."*
* **Tindakan Langsung yang Sudah Diambil (Opsional):** *Textarea* (misal: *"Sudah ditegur di kelas dan diminta meminta maaf"*).
* **Info Badge System:** Visual info card ⚠️ *"Laporan ini akan dikirim ke Dashboard Triase BK untuk diverifikasi terlebih dahulu."*

4. **Tombol Aksi & UX Feedback:**
* Tombol Utama: `[ Simpan Log Perilaku ]`
* *Toast Notification (Positif):* *"Apresiasi berhasil dicatat dan telah ditambahkan ke Profil Siswa."*
* *Toast Notification (Negatif):* *"Laporan insiden berhasil dikirim ke Tim BK. Status saat ini: BARU (Menunggu Triase)."*




---



```text
                                [Form Log Perilaku Siswa]
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     [Pilih: Perilaku Positif]                       [Pilih: Perilaku Negatif]
                    │                                               │
                    ▼ (Auto-Approved)                               ▼ (Membutuhkan Triase)
     [Profil & Portofolio Siswa]                          [Dashboard Triase BK]
   - Terbaca oleh Wali Kelas, BK,                       - Status: BARU
     Siswa, Orang Tua, & Waka/Kamad                     - Ditinjau oleh BK sebelum
                                                          menjadi Kasus BK / Wali Kelas

```

---

#### **B. Halaman 2: Dashboard Triase & Desk Laporan (Perspektif Guru BK)**

* **Tujuan:** Tempat Guru BK memvalidasi laporan masuk sebelum diubah menjadi kasus resmi.
* **Elemen UI/UX Utama:**
1. **Tabel Laporan Masuk:**
* Kolom: Tanggal | Nama Siswa | Pelapor | Kategori | Status (`BARU`) | Aksi Fast-Triage.


2. **Modal Dialog Triase (Muncul saat detail laporan dibuka BK):**
* Tampilan Fakta Laporan dari Guru.
* **Pilihan Aksi Triase (3 Tombol Utama):**
* **Option 1: `[Selesaikan di Tempat]**`
* *UX Input:* Pop-up catatan singkat BK (misal: *"Insiden ringan, sudah diselesaikan oleh guru pelapor. Tidak perlu konseling lanjutan"*).
* *Hasil:* Status laporan berubah jadi `SELESAI (Ditangani di Tempat)`.


* **Option 2: `[Alihkan ke Wali Kelas]**`
* *UX Input:* Dropdown pilih Wali Kelas + Catatan Instruksi.
* *Hasil:* Status berubah jadi `DITUGASKAN (Wali Kelas)`.


* **Option 3: `[Eskalasi Jadi Kasus BK]**`
* *UX Input Form:*
* Assign Konselor BK (Pilih Guru BK penanggung jawab).
* **Set Tingkat Kerahasiaan (Radio Button):**
* 🟢 **Umum** (Bisa diakses BK, Wali Kelas).
* 🟡 **Terbatas** (Hanya BK & Guru Pelapor [terbatas pada feedback]).
* 🔴 **Sangat Rahasia** (Hanya Konselor BK terkait).




* *Hasil:* Membuat *Record Kasus BK* baru, Status laporan berubah jadi `DITUGASKAN (BK)`.









---

#### **C. Halaman 3: Workspace Kasus Konseling BK (Perspektif Guru BK)**

* **Tujuan:** Modul khusus penanganan konseling yang sangat terisolasi dari akses umum.
* **Elemen UI/UX Utama (Sistem Tabular):**
1. **Badge Kerahasiaan Visual:** Indikator jelas di pojok kanan atas (`🔴 SANGAT RAHASIA - HANYA BK`).
2. **Tab 1: Laporan Awal (Read-only)**
* Berisi data laporan asli dari Guru Pelapor.


3. **Tab 2: Rekam Konseling (🔒 RAHASIA BK)**
* *Rich-Text Editor* untuk mencatat hasil wawancara, diagnosis awal, kondisi keluarga, dan dinamika psikologis.
* *Timeline Log Sesi:* Riwayat tanggal pertemuan (Sesi 1, Sesi 2, dst.).
* **Akses:** Hanya dapat dilihat oleh Konselor BK penanggung jawab & Koordinator BK.


4. **Tab 3: Petunjuk Penanganan di Kelas (Public for Teachers)**
* *Textarea Editor:* *"Rekomendasi untuk Guru Mata Pelajaran / Wali Kelas"*.
* Contoh isi: *"Mohon bantu dudukkan siswa di baris depan dan hindari menegurnya secara langsung di depan umum."*


5. **Kontrol Status Kasus:**
* Button `[Ubah Status: Diproses]` ➔ `[Ubah Status: Selesai]`
* **Modal Kunci Selesai:** Saat mengklik `[Selesaikan Kasus]`, BK wajib mengisi *Ringkasan Resolusi Akhir*.


6. **Mekanisme Reopen Kasus:**
* Jika kasus statusnya `SELESAI`, tombol `[Reopen / Buka Kembali Kasus]` aktif.
* *UX Requirement:* Mengklik tombol ini memunculkan **Modal Wajib**: *"Masukkan alasan pembukaan kembali kasus ini (Min. 20 karakter)"*. Log ini akan tersimpan permanen di *Audit Trail*.



---

#### **D. Halaman 4: Detail Laporan Saya (Perspektif Guru Pelapor / Guru Mapel)**

* **Tujuan:** Memberikan transparansi status laporan tanpa membocorkan kerahasiaan konseling.
* **Elemen UI/UX Utama:**
1. **Tracker Status Visual (Stepper Component):**
`[Baru]` ➔ `[Triase BK / Ditugaskan]` ➔ `[Diproses BK]` ➔ `[Selesai]`
2. **Section Ringkasan Laporan Saya:** Menampilkan apa yang mereka laporkan dulu.
3. **Section Feedback dari BK (Jika Ada):**
* Menampilkan isi dari *Tab 3 (Petunjuk Penanganan di Kelas)* yang diisi BK.


4. **UX Redacted Warning (Penjaga Privasi):**
* Di area bawah terdapat kotak info ter kunci:
* 🔒 *"Catatan internal konseling dan riwayat sesi bersifat rahasia dan hanya diakses oleh Konselor BK demi perlindungan privasi siswa."*


---

#### **E. Halaman 5: Dashboard Executive & Override Access (Perspektif Waka Kesiswaan & Kamad)**

* **Tujuan:** Pengawasan tingkat tinggi tanpa melanggar privasi, namun menyediakan pintu darurat (Break-Glass Mechanism) jika terjadi krisis hukum/keselamatan.
* **Elemen UI/UX Utama:**
1. **Anonymized Analytics Widget:**
* Trend chart jumlah laporan per bulan, statistik kategori kasus (Tanpa nama siswa).


2. **Daftar Ringkasan Eksekutif Kasus:**
* Menampilkan daftar kasus berat/sensitif dalam bentuk *Summary* high-level yang ditulis oleh BK.


3. **Mekanisme Emergency Override ("Break-Glass" UX Pattern):**
* Secara default, detail catatan konseling tertutup/terblokir untuk Waka/Kamad pada kasus berkategori `Terbatas` / `Sangat Rahasia`.
* Terdapat tombol: ⚠️ `[Minta / Buka Akses Detail Darurat]`.
* **Modal Konfirmasi Keamanan:**
> *"Perhatian: Membuka rekam konseling rahasia secara paksa hanya diperbolehkan untuk kondisi darurat (ancaman keselamatan/hukum). Tindakan ini akan mencatat nama Anda, waktu, dan alasan pembukaan ke dalam log audit yang dilaporkan ke sistem."*
> *Field Input:* **Alasan Legitim Buka Akses (Wajib diisi)**.







---

### 3. Matriks Hak Akses Antarmuka (UI Matrix Summary)

| Komponen / Fitur UI | Guru Pelapor | Wali Kelas | Guru BK | Waka / Kamad |
| --- | --- | --- | --- | --- |
| **Form Buat Laporan** | ✅ Ya | ✅ Ya | ✅ Ya | ✅ Ya |
| **Dashboard Triase** | ❌ Tidak | ❌ Tidak | ✅ Ya | ❌ Tidak |
| **Status Tracker Laporan** | ✅ (Milik Sendiri) | ✅ (Siswa Kelasnya) | ✅ Semua | ✅ Semua |
| **Rekam Konseling / Sesi BK** | ❌ Tersembunyi | ❌ Tersembunyi | ✅ Penuh | ⚠️ Override Only |
| **Rekomendasi Penanganan Kelas** | ✅ Lihat | ✅ Lihat | ✅ Edit / Isi | ✅ Lihat |
| **Modal Reopen & Reason** | ❌ Tidak | ❌ Tidak | ✅ Ya | ⚠️ Override Only |


### Perspektif Wali Kelas
Dalam ekosistem sekolah, **Wali Kelas** memiliki peran ganda yang unik: sebagai **pendamping utama siswa di kelas** sekaligus **mitra strategis Guru BK**. Wali kelas membutuhkan visibilitas terhadap perkembangan anak didiknya, namun tetap dibatasi dari catatan konseling yang bersifat rahasia/psikologis.

Berikut adalah rincian peran, alur kerja, dan spesifikasi antarmuka UI/UX khusus dari **Perspektif Wali Kelas**.

---

### 1. Peran & Alur Kerja Utama Wali Kelas

```text
                               ┌─────────────────────────────────────────┐
                               │     Dashboard Monitor Kelas (Wali)      │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
   [Kasus Dilimpahkan dari BK]                                          [Siswa Kelasnya Ditangani BK]
(Status: DITUGASKAN - Wali Kelas)                                            (Status: DIPROSES BK)
                 │                                                                     │
                 ▼                                                                     ▼
 ┌───────────────────────────────┐                                     ┌───────────────────────────────┐
 │ Input Tindakan & Pendampingan │                                     │ Lihat Petunjuk Penanganan BK  │
 └───────────────┬───────────────┘                                     │ (Catatan Konseling Terkunci)  │
                 │                                                     └───────────────────────────────┘
        ┌────────┴────────┐
        ▼                 ▼
 [Selesai di Wali]   [Minta Eskalasi ke BK]

```

1. **First Line of Action (Limpahan Triase BK):** BK dapat melimpahkan kasus ringan/kedisiplinan ke Wali Kelas untuk ditangani terlebih dahulu sebelum menjadi kasus resmi BK.
2. **Monitoring & Pendampingan Kelas:** Memantau status anak didiknya yang sedang dalam penanganan BK tanpa melanggar privasi konseling.
3. **Eksekutor Rekomendasi BK:** Menerapkan petunjuk penanganan pembelajaran/perilaku yang disarankan BK di lingkungan kelas.

---

### 2. Rincian UI/UX Antarmuka (Perspektif Wali Kelas)

#### **A. Halaman Dashboard Wali Kelas (Class Executive Overview)**

* **Tujuan:** Memberikan gambaran umum kondisi kedisiplinan dan kesejahteraan (*well-being*) siswa di kelas yang diampu.
* **Elemen UI/UX Utama:**
1. **Widget Statistik Kelas Saya:**
* Ringkasan: *Total Laporan Bulan Ini*, *Dalam Penanganan Wali*, *Dalam Penanganan BK*, *Selesai*.


2. **Daftar Siswa Kelas & Status Badges:**
* Tabel daftar siswa di kelas tersebut dengan indikator status visual:
* 🟢 **Normal** (Tidak ada catatan insiden aktif).
* 🟡 **Pemantauan Wali Kelas** (Ada insiden ringan yang sedang ditangani wali kelas).
* 🔵 **Dalam Penanganan BK** (Kasus aktif sedang ditangani konselor).




3. **Tab Tugas Pertemuan / Action Items:**
* Kartu notifikasi khusus: *"1 Kasus baru dilimpahkan oleh BK untuk ditindaklanjuti"* dengan *call-to-action* `[Buka & Tangani]`.





---

#### **B. Halaman Modul Penanganan Limpahan (Triage Delegation Worksite)**

* **Tujuan:** Tempat wali kelas mencatat tindakan pembinaan yang dilakukan ketika BK menyerahkan kasus tingkat awal ke wali kelas.
* **Elemen UI/UX Utama:**
1. **Header Informasi Insiden:**
* Berisi fakta insiden yang dilaporkan oleh guru mapel/pelapor awal.
* Catatan Tambahan/Instruksi dari BK (misal: *"Mohon wali kelas panggil siswa untuk klarifikasi kehadiran dan konfirmasi ke orang tua"*).


2. **Form Tindakan Wali Kelas:**
* **Tanggal Pendampingan/Panggilan:** *Datepicker*.
* **Bentuk Intervensi:** *Checklist* (Diskusi Personal, Panggilan Orang Tua/Wali, Konseling Kelas, Teguran Lisan).
* **Catatan Hasil Pembinaan:** *Textarea* (misal: *"Siswa berjanji tidak mengulangi dan orang tua sudah dihubungi via WhatsApp"*).
* **Lampiran Dokumen:** *Upload file* (Surat pernyataan siswa/foto berita acara jika ada).


3. **Tombol Keputusan/Aksi:**
* `[Selesaikan & Tutup Laporan]` ➔ Mengubah status menjadi `SELESAI (Ditangani Wali Kelas)`.
* `[Eskalasi Kembali ke BK]` ➔ Mengembalikan ke BK jika masalah ternyata lebih kompleks dari perkiraan awal (memunculkan modal wajib isi alasan eskalasi).





---

#### **C. Halaman Detail Kasus BK untuk Wali Kelas (Collaborative View)**

* **Tujuan:** Memungkinkan wali kelas menyelaraskan penanganan kelas dengan proses konseling BK tanpa mengakses rekam medis/psikologis rahasia.
* **Elemen UI/UX Utama:**
1. **Status Tracker:**
* Menampilkan perjalanan status: `Dilaporkan` ➔ `Triase BK` ➔ `Diproses BK` ➔ `Selesai`.


2. **Section "Petunjuk Penanganan di Kelas" (Read-Only dari BK):**
* Highlight box berwarna biru berisi rekomendasi konkret dari konselor BK.
* Contoh UI Text:
> **Rekomendasi dari Guru BK (Bpk. Ahmad):**
> *"Siswa sedang mengalami tekanan emosional. Mohon bantu berikan ruang saat pembelajaran kelompok dan hindari menunjuk siswa secara mendadak di depan kelas hingga 2 minggu ke depan."*




3. **Section Catatan Konseling Terkunci (Privacy Guard UX):**
* Tampilan *placeholder* dengan ikon gembok 🔒:
* *"Rekam Sesi Konseling & Catatan Psikologis Dibatasi (Hanya untuk Konselor BK)."*


* *Prinsip UX:* Memberikan kejelasan bahwa data memang dilindungi oleh kode etik, bukan karena sistem *error*.


4. **Form Input Perkembangan Harian Kelas (Feedback Loop):**
* Wali kelas dapat memberikan *update* catatan perilaku siswa di kelas ke BK:
* *Textarea:* *"Perkembangan Minggu Ini"* + Tombol `[Kirim Catatan ke BK]`.







---

### 3. Matriks Hak Akses Khusus Wali Kelas

| Data / Fitur dalam Aplikasi | Wali Kelas | Keterangan Akses |
| --- | --- | --- |
| **Laporan Insiden Siswa Kelasnya** | ✅ Akses Penuh | Dapat melihat semua laporan masuk untuk siswa di kelasnya *setelah* melewati triase BK. |
| **Laporan Insiden Siswa Kelas Lain** | ❌ Terblokir | Hanya bisa dilaporkan jika wali kelas bertindak sebagai *Guru Pelapor*. |
| **Aksi Triase Utama (Sistem)** | ❌ Terblokir | Hanya Guru BK yang menentukan triase awal. |
| **Tindak Lanjut Kasus Limpahan** | ✅ Input & Edit | Dapat mengisi form pembinaan untuk kasus yang ditugaskan BK kepadanya. |
| **Rekam Sesi Konseling Rahasia** | ❌ Terblokir | Tidak dapat melihat isi percakapan/diagnosis psikologis BK. |
| **Petunjuk Penanganan Kelas** | ✅ Lihat & Terapkan | Dapat membaca instruksi penanganan praktis yang disiapkan oleh BK. |
| **Statistik Ringkasan Kelas** | ✅ Akses Penuh | Dapat melihat agregat tren perilaku dan kedisiplinan kelasnya sendiri. |


### Detail Perilaku Positif
Integrasi perilaku positif dilakukan pada pintu input data (*single entry point*), tetapi dipisahkan pada arsitektur penyimpanan, alur kerja (*workflow*), dan tampilan akhir (*profiling*) untuk mendukung pendekatan *strength-based counseling*.

---

**1. Strategi Penggabungan vs Pemisahan**

* **Digaungkan pada Formulir Input (UI Level):**
Guru menggunakan satu formulir laporan umum (*Log Perilaku Siswa*). Di dalamnya terdapat sakelar/pilihan jenis laporan: `[Apresiasi / Positif]` atau `[Insiden / Negatif]`. Langkah ini menyederhanakan alur UX agar guru tidak perlu berpindah halaman.
* **Dipisahkan pada Alur Kerja & Penyimpanan (Backend & Logic Level):**
* **Perilaku Negatif:** Wajib melewati pintu **Triase BK**, memiliki status penanganan, dan berpotensi menghasilkan *Rekam Konseling Rahasia*.
* **Perilaku Positif:** Bersifat *Auto-Approved* (tidak perlu triase). Laporan langsung masuk ke **Entitas Profil Siswa / Portofolio Karakter**, menambah poin apresiasi, dan tidak memerlukan rekam konseling rahasia.



---

**2. Mekanisme CRUD (Perilaku Positif)**

* **Create (Buat Catatan):**
* **Aktor:** Guru Mapel, Wali Kelas, Guru BK, dan Tenaga Kependidikan.
* **UI Input:** Form *Fast-Log* berisi Pilihan Siswa, Kategori (misal: *Kepemimpinan, Empati, Kejujuran, Inisiatif, Prestasi*), Deskripsi Apresiasi, dan Opsi Lampiran (Foto/Sertifikat).


* **Read (Lihat Catatan):**
* Berbeda dengan kasus negatif yang menganut prinsip *Privacy-First*, laporan positif menganut prinsip *Visibility-First* (Penghargaan terbuka).
* Data ditampilkan pada Dashboard Profil Siswa, Laporan Karakter Wali Kelas, serta Ringkasan Akhir Semester untuk Orang Tua.


* **Update (Ubah Catatan):**
* Pembuat laporan hanya dapat mengubah isi deskripsi dalam rentang waktu terbatas (misal: max 1x24 jam) untuk memperbaiki kesalahan ketik.
* Setelah rentang waktu tersebut, data dikunci untuk menjaga integritas *audit trail*.


* **Delete (Hapus Catatan):**
* Menerapkan *Soft-Delete* yang hanya dapat dilakukan oleh Koordinator BK atau Admin Sistem, wajib menyertakan alasan pembatalan (misal: *salah pilih nama siswa*).



---

**3. Matriks Hak Akses (RBAC) Perilaku Positif vs Negatif**

| Peran Pengguna | Akses Perilaku Negatif | Akses Perilaku Positif |
| --- | --- | --- |
| **Guru Pelapor** | Melihat laporan sendiri + Feedback dari BK | Melihat seluruh apresiasi yang pernah ia berikan |
| **Wali Kelas** | Terbatas pada instruksi BK (Detail konseling terkunci) | **Akses Penuh** seluruh catatan positif siswa di kelasnya |
| **Guru BK** | **Akses Penuh** (Pengelola Triase & Rekam Konseling) | **Akses Penuh** (Digunakan untuk analisis *strength-based*) |
| **Waka / Kamad** | Ringkasan Eksekutif (*Break-Glass* untuk detail) | **Akses Penuh** (Dashboard Agregat Prestasi & Karakter) |
| **Siswa & Orang Tua** | Terbatas pada status umum penanganan | **Akses Lihat (Read-Only)** untuk apresiasi & badge karakter |