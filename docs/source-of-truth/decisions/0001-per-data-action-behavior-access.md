# ADR-0001: Otorisasi Per Data dan Aksi untuk Perilaku

- Status: Accepted
- Tanggal: 2026-10-21
- Issue: [#1](https://github.com/Nexus-Study/Teaching-Daily-Report/issues/1)
- PR: Belum ada

## Konteks

Pengguna dapat memiliki beberapa peran, sementara jenis data perilaku memiliki batas akses yang berbeda. Aturan gabungan hak global berisiko memperluas akses ke data sensitif atau menghalangi pekerjaan yang sah. Keputusan produk juga menetapkan bahwa role yang memang berwenang menginput perilaku dapat memilih murid mana pun; cakupan sasaran input ini tidak sama dengan hak baca terhadap data murid.

Keputusan ini dikonfirmasi pengguna pada 2026-10-21 dalam diskusi tahap 6–7 refaktor perilaku. Pada diskusi yang sama, role yang diizinkan menginput perilaku ditetapkan sebagai `guru_bk`, `wali_kelas`, `guru_mapel`, dan `guru_tahfidz`; role lain tidak diberi hak input perilaku.

## Keputusan

- Hak pengguna multi-peran ditentukan secara eksplisit untuk setiap jenis data dan aksi; tidak ada aturan union atau intersection global yang otomatis mengesampingkan batas objek.
- Role yang diizinkan untuk input perilaku dapat memilih murid mana pun sebagai sasaran input.
- Pemilih sasaran menampilkan nama dan kelas murid saja; informasi profil lainnya tidak ditampilkan melalui pemilih tersebut.
- Wali kelas yang baru ditugaskan tidak otomatis dapat membaca laporan yang dibuat sebelum masa penugasannya. BK dapat membagikan satu laporan lama kepada penerima tertentu yang role-nya memang berwenang membaca laporan asli; wali kelas saat ini dapat menerima akses ke laporan lama yang dipilih saja. Akses melalui pengecualian ini berakhir otomatis saat penugasan wali kelas untuk murid tersebut berakhir, dan BK dapat mencabutnya lebih awal. Pembagian tidak memperluas hak ke role lain, laporan lama lainnya, atau hasil triase/catatan internal.
- Wali kelas hanya dapat melihat status tinjauan laporan yang dibuat selama masa penugasannya untuk murid di kelas perwaliannya. Pembagian isi laporan lama tidak memberikan akses ke status tinjauan laporan tersebut.
- Izin memilih sasaran dan menginput laporan tidak dengan sendirinya menetapkan hak baca lain. Hak baca profil, laporan, hasil triase, catatan tindak lanjut, atau rekam konseling tetap mengikuti keputusan akses masing-masing.
- Role yang diizinkan menginput perilaku adalah `guru_bk`, `wali_kelas`, `guru_mapel`, dan `guru_tahfidz`; role di luar daftar ini tidak memiliki hak input perilaku.
- Matriks izin untuk data dan aksi lainnya tetap terbuka sampai dikonfirmasi terpisah.

## Alternatif yang dipertimbangkan

- **Union global** — ditolak sebagai aturan umum karena satu role dapat memperluas akses ke data tanpa mempertimbangkan batas objek atau aksi.
- **Intersection global** — ditolak sebagai aturan umum karena dapat menghapus hak yang memang diperlukan untuk menjalankan tugas pada role tertentu.
- **Konteks role aktif sebagai mekanisme otorisasi** — tidak dipilih sebagai kebijakan otorisasi; konteks aktif dapat membantu UX, tetapi izin tetap harus ditentukan dan diverifikasi server-side per data/aksi.
- **Menampilkan identitas tambahan pada pemilih murid** — tidak dipilih; untuk keputusan saat ini, pemilih hanya menampilkan nama dan kelas.
- **Memberi akses otomatis ke seluruh laporan historis kepada wali kelas baru** — tidak dipilih; laporan sebelum masa penugasannya hanya dapat dibaca setelah BK membagikannya secara eksplisit.
- **Memberi BK wewenang membagikan laporan asli kepada penerima dari role yang tidak berwenang membacanya** — tidak dipilih; penerima harus berasal dari role yang memang berwenang membaca laporan asli.
- **Mempertahankan akses pengecualian setelah penugasan wali kelas berakhir** — tidak dipilih; akses ke laporan lama yang dibagikan berakhir otomatis saat penugasan tersebut berakhir.
- **Membatasi akses sampai penugasan berakhir tanpa pencabutan lebih awal** — tidak dipilih; BK boleh mencabut akses lebih awal.
- **Membuka status tinjauan saat isi laporan lama dibagikan** — tidak dipilih; status tetap berada dalam cakupan waktu penugasan wali kelas.
- **Membuka status tinjauan saat isi laporan lama dibagikan** — tidak dipilih; status tetap berada dalam cakupan waktu penugasan wali kelas.

## Konsekuensi

- Matriks izin per jenis data/aksi dan role perlu dirinci sebelum implementasi yang bergantung padanya.
- Pemeriksaan server-side, RPC, dan RLS harus menegakkan batas yang sama; UI tidak menjadi sumber otorisasi.
- Daftar role input produk yang telah dikonfirmasi dapat berbeda dari daftar baseline yang saat ini ada di kode.
- Pemilih lintas kelas harus membatasi informasi yang ditampilkan ke nama dan kelas; kebutuhan disambiguasi tambahan perlu keputusan terpisah bila muncul.
- Penerima pembagian ditentukan secara individual dan tetap harus berasal dari role yang berwenang membaca laporan asli; akses pengecualian wali kelas berakhir bersama penugasannya atau lebih awal jika dicabut BK. Mekanisme teknis pembagian dan pencabutan tetap perlu dirancang.
- Izin baca isi laporan lama dan status tinjauannya harus diuji terpisah; pembagian isi tidak membuka status lama.
- Tes akses positif/negatif dan verifikasi konfigurasi harus memakai lingkungan Supabase terisolasi serta data sintetis, bukan data murid nyata.

## Referensi

- [Konteks penggunaan](../../konteks-penggunaan.md), bagian 3.1 dan 4.3.
- [Diskusi persiapan refaktor perilaku](../../aktif/kotak-pasir/202610192346_persiapan-refaktor-perilaku.md), diskusi tahap 6–7.
- [Issue #1](https://github.com/Nexus-Study/Teaching-Daily-Report/issues/1).
