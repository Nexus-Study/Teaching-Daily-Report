# Dokumentasi UI/UX PWA Madrasah Terpadu

> **Cakupan:** Dokumentasi kondisi antarmuka dan interaksi aplikasi saat ini, berdasarkan halaman portal yang tersedia. Bagian **Catatan peningkatan** adalah rekomendasi, bukan deskripsi fitur yang sudah diterapkan.

## 1. Tujuan

Dokumen ini menjadi acuan untuk memahami struktur layar, navigasi, pola interaksi, dan pertimbangan pengalaman pengguna pada PWA Madrasah Terpadu. Aplikasi digunakan oleh guru, staf, pimpinan, dan administrator dengan akses menu berdasarkan peran akun.

## 2. Struktur Informasi

### Area publik

- **Masuk** (`/login`): formulir email dan kata sandi.

### Area portal

- **Beranda portal** (`/portal`): identitas pengguna, peran, menu cepat, dan tombol logout.
- **Jurnal Harian** (`/portal/jurnal`): input kegiatan mengajar dan presensi, serta daftar rekap jurnal.
- **Catatan & Penanganan Perilaku** (`/portal/perilaku`): catatan positif/pelanggaran, tindak lanjut, dan timeline eskalasi.
- **Rekap & Laporan** (`/portal/laporan`): filter kelas/periode, kartu ringkasan, dan rincian data.
- **Rekap Kehadiran** (`/portal/rekap-kehadiran`): rekap mapel per siswa dan alert kehadiran sesuai peran.
- **Kelola Data Master** (`/portal/admin`): pengelolaan dan impor data siswa/guru untuk administrator.
- **Profil Saya** (`/portal/profil`): data profil, jadwal mengajar, dan pengaturan kredensial.

Menu ditampilkan berdasarkan konfigurasi peran akun. Pengguna multi-peran dapat melihat gabungan menu yang diizinkan oleh peran-perannya. Layout portal melindungi area setelah login; sesi yang tidak tersedia diarahkan ke halaman masuk.

## 3. Kerangka Layout dan Navigasi

### Desktop dan layar lebar

- Sidebar tetap berada di sisi kiri dan mengisi tinggi layar.
- Sidebar dapat diciutkan atau diperlebar melalui tombol ikon panah.
- Menu aktif dibedakan dengan latar indigo; menu lainnya memakai keadaan normal/hover.
- Tombol **Logout** berada di bagian bawah sidebar.

### Mobile dan layar kecil

- Navigasi utama menggunakan header ringkas dengan nama beranda atau judul modul aktif.
- Tombol menu membuka drawer dari sisi kanan beserta lapisan latar gelap.
- Drawer berisi menu sesuai peran dan tombol **Logout**; memilih menu menutup drawer.
- Konten portal berada di bawah header dan dirancang untuk lebar layar yang terbatas.

### Beranda portal

Beranda menampilkan identitas ringkas pengguna (inisial, nama, nomor identitas bila ada, dan peran), tombol logout, serta grid kartu navigasi. Kartu menggabungkan ikon, nama menu, dan deskripsi pendek. Grid berubah jumlah kolomnya sesuai lebar layar.

## 4. Bahasa Visual

- **Latar dan teks:** dominan navy/slate gelap dengan teks terang; komponen navigasi juga memiliki kelas warna terang untuk tema yang didukung.
- **Navigasi aktif:** indigo digunakan untuk menandai menu atau tab aktif.
- **Aksen modul:** jurnal dan laporan menggunakan aksen cyan, perilaku menggunakan rose, rekap kehadiran menggunakan indigo, dan admin memiliki aksen beragam pada menu.
- **Status data:** warna dipasangkan dengan label teks, misalnya Hadir, Izin, Sakit, Alpa; Positif/Pelanggaran; serta Ditangani, Diteruskan, Proses, Selesai.
- **Komponen:** tombol, input, select, textarea, tabel, tab, dialog, kartu data, dan ikon Lucide digunakan sesuai tindakan atau informasi yang diwakili.
- **Tipografi:** sans-serif dengan hierarki heading, label, isi, dan metadata. Sebagian halaman menetapkan gaya lokal sendiri sehingga kepadatan dan detail visual antarmodul belum sepenuhnya seragam.

Warna status tidak menjadi satu-satunya petunjuk: status juga ditampilkan sebagai teks. Hindari mengubah warna status tanpa mempertahankan label yang dapat dibaca.

## 5. Pola UX per Modul

### Masuk

- Formulir memuat email, kata sandi, tombol **Masuk**, dan pesan error saat autentikasi gagal.
- Tombol berubah menjadi status pemrosesan selama permintaan berlangsung.
- Pengguna dengan sesi aktif diarahkan ke portal.
- Belum ada tautan pemulihan kata sandi mandiri pada layar masuk.

### Jurnal Harian

- Formulir mengikuti urutan tanggal → mata pelajaran → kelas → jam → materi → presensi.
- Pilihan jadwal bergantung pada hari/tanggal dan jadwal mengajar pengguna.
- Pemilihan kelas memuat daftar siswa; status presensi awal adalah Hadir.
- Tombol simpan menyimpan jurnal dan presensi; pesan berhasil/gagal ditampilkan di dekat formulir.
- Rekap jurnal berada di bawah area input, sehingga pengguna dapat memeriksa catatan yang sudah tercatat.

### Catatan dan penanganan perilaku

- Formulir mengarahkan pengguna memilih kelas dan siswa sebelum mencatat jenis perilaku, poin, tanggal, serta uraian.
- Bagian tindak lanjut awal dapat ditampilkan atau disembunyikan melalui checkbox.
- Catatan tersimpan ditampilkan sebagai daftar/timeline dengan status dan tindakan yang tersedia.
- Dialog penanganan digunakan untuk mengubah tindak lanjut/status; riwayat tambahan dapat dibuka dari kartu catatan.
- Status Selesai tidak menyediakan tindakan ubah status pada tampilan tersebut.

### Rekap kehadiran

- Tampilan berbasis tab hanya menampilkan tab yang diizinkan oleh peran.
- Rekap mapel meminta kelas, mata pelajaran, rentang bulan, lalu tindakan **Tampilkan Rekap**.
- Alert menggunakan filter kelas/mapel dan rentang bulan; tabel menampilkan siswa yang memenuhi ambang alert.
- Tabel memiliki area gulir horizontal agar kolom tetap dapat dibaca pada layar sempit.

### Rekap dan laporan

- Filter kelas dan tanggal mengendalikan isi laporan.
- Kartu ringkasan diletakkan sebelum rincian jurnal/presensi, perilaku, dan progress eskalasi.
- Kondisi data kosong dan error memiliki pesan tersendiri.

### Profil

- Dua tab memisahkan **Profil & Jadwal Mengajar** dari **Ubah Email & Password**.
- Informasi profil berada dalam mode baca sebelum pengguna memilih edit.
- Jadwal dikelompokkan per mata pelajaran; pengguna dapat menambah, menyunting, dan menghapus baris jadwal.
- Pengubahan kredensial meminta kata sandi saat ini; email baru dan kata sandi baru bersifat opsional.

### Kelola Data Master

- Data siswa dan guru/staf dipisahkan dalam tab utama; pengelolaan satuan dan impor CSV berada dalam subtab.
- Daftar siswa menyediakan pencarian/filter, paginasi, dan tindakan tambah/edit/hapus.
- Impor menyediakan tautan template, pemilih file, tombol proses, dan umpan balik hasil.
- Konfirmasi atau pesan hasil perlu diperiksa sebelum mengulangi tindakan impor atau penghapusan.

## 6. Keadaan Antarmuka

Komponen sebaiknya mempertahankan pola berikut saat berinteraksi:

| Keadaan | Pola yang digunakan |
| --- | --- |
| Memuat | Ikon spinner dan/atau teks status; tombol terkait dapat dinonaktifkan. |
| Berhasil | Pesan konfirmasi dekat area tindakan atau pembaruan data pada daftar. |
| Gagal | Pesan error yang menjelaskan operasi yang gagal; pengguna dapat memperbaiki input atau memuat ulang. |
| Kosong | Pesan bahwa belum ada data atau belum ada hasil untuk filter. |
| Tidak tersedia | Kontrol dinonaktifkan sampai pilihan prasyarat tersedia, misalnya kelas sebelum mata pelajaran/jam. |
| Aktif/terpilih | Menu/tab/status dibedakan secara visual dan, pada beberapa komponen, lewat atribut aksesibilitas seperti `aria-current` atau `aria-selected`. |

## 7. Aksesibilitas dan Perangkat

- Gunakan elemen semantik seperti `main`, `nav`, `header`, `section`, tombol, label, dan tabel.
- Pertahankan label yang terlihat untuk field; ikon dekoratif tidak menggantikan nama tindakan.
- Navigasi menyediakan penanda menu aktif (`aria-current`); drawer mobile menyampaikan status buka/tutup dan label dialog.
- Tombol sidebar dan navigasi memiliki nama aksesibel; beberapa kontrol menyediakan indikator fokus keyboard.
- Target sentuh navigasi dibuat cukup tinggi untuk penggunaan ponsel.
- Tabel lebar menggunakan gulir horizontal, bukan mengecilkan semua kolom hingga sulit dibaca.
- Gunakan browser yang mendukung aplikasi modern dan koneksi internet untuk pemuatan data.

## 8. Catatan Peningkatan UX

Daftar ini adalah peluang evaluasi untuk iterasi berikutnya, bukan klaim kekurangan yang telah diuji dengan pengguna:

- Samakan pola heading, jarak, tombol, panel, dan pesan status di seluruh modul agar perpindahan halaman terasa konsisten.
- Tinjau navigasi drawer dengan keyboard dan pembaca layar, termasuk fokus awal, pengembalian fokus, serta penutupan dengan tombol Escape.
- Pastikan error validasi menunjukkan field terkait, bukan hanya menampilkan pesan umum.
- Berikan konfirmasi sebelum tindakan destruktif atau impor yang berpotensi mengganti/menambah banyak data.
- Uji keterbacaan, kontras warna, ukuran teks, dan target sentuh pada beberapa ukuran layar serta pencahayaan.
- Uji istilah status dan alur tiap peran bersama guru, wali kelas, BK, pimpinan, dan administrator.
- Tambahkan konten layar kosong yang menyarankan langkah berikutnya, terutama ketika jadwal atau data master belum tersedia.

## 9. Checklist Review UI/UX

- [ ] Menu yang tampil sesuai peran dan menu aktif mudah dikenali.
- [ ] Alur utama dapat diselesaikan pada ponsel tanpa kontrol tertutup atau saling bertumpuk.
- [ ] Setiap formulir memiliki label, validasi, status proses, dan umpan balik yang jelas.
- [ ] Status penting dapat dipahami tanpa mengandalkan warna saja.
- [ ] Dialog, drawer, tab, dan tabel dapat digunakan dengan keyboard.
- [ ] Tampilan diuji pada ponsel, tablet, dan desktop.
- [ ] Pesan error, kosong, berhasil, dan memuat ditinjau pada setiap modul.
- [ ] Istilah UI cocok dengan bahasa dan prosedur operasional madrasah.