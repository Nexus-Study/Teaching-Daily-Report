# Catatan Review Draf Tiket dari Tracker Lama

> **Status: bahan review saja — belum disetujui, bukan backlog aktif, dan bukan
> keputusan produk.**
>
> Tidak ada GitHub Issue yang dibuat dari catatan ini. Dokumen ini menyimpan
> rekomendasi dan teks draf agar pemilik proyek dapat meninjaunya kemudian.
> Jika pekerjaan dilanjutkan, periksa kembali kode, dokumentasi, dan Issue
> repository sebelum menggunakan draf karena konteks dapat berubah.

## Asal dan tujuan

Catatan ini merangkum empat tiket yang masih terbuka dalam
[`../tracking-progress.md`](../tracking-progress.md):

- TIKET-09 — ekspor rekap perilaku;
- TIKET-10 — catatan bimbingan khusus BK;
- TIKET-11 — rekomendasi penanganan pada dashboard;
- TIKET-15 — identitas pelapor pada formulir perilaku.

Tracker lama bukan sumber status pekerjaan yang berlaku. Catatan ini hanya
menyimpan bahan diskusi dan tidak berarti pekerjaan telah dipilih untuk
dikerjakan. Gunakan [template GitHub Issue](../source-of-truth/template-github-issue.md)
jika nanti memutuskan untuk membuat Issue.

Repository bersifat publik. Jangan menambahkan data pribadi murid, guru,
kredensial, atau detail kasus nyata saat meninjau atau menyalin draf ke GitHub.

## Rekomendasi review

1. **TIKET-09 — Ekspor rekap perilaku:** pertahankan sebagai draf keputusan,
   bukan tugas implementasi. Tetapkan dahulu siapa yang boleh mengekspor, data
   apa yang boleh disertakan, format, filter, dan kebutuhan audit.
2. **TIKET-10 — Catatan bimbingan BK:** pertahankan sebagai draf keputusan
   berprioritas tinggi karena menyangkut data sensitif. Jangan mulai implementasi
   sebelum tujuan, hak akses, retensi, dan perlindungan data disepakati.
3. **TIKET-11 — Rekomendasi di dashboard:** tunda atau tinjau sebagai draf
   keputusan yang lebih ringkas. Kebutuhan, pemilik rekomendasi, serta cakupan
   aksesnya perlu diputuskan dan diselaraskan dengan aturan BK.
4. **TIKET-15 — Pemilihan pelapor:** jangan menganggap pemilihan pengguna lain
   sebagai fitur yang telah disetujui. Implementasi yang diperiksa mencatat
   pengguna login sebagai `reporter_id` dan RPC memvalidasi kecocokannya dengan
   `auth.uid()`. Jika pelaporan atas nama orang lain tidak dibutuhkan, kandidat
   tiket ini dapat dibatalkan. Jika dibutuhkan, aturan harus membedakan pengirim
   aktual dari pihak yang dilaporkan sebagai pelapor.

Urutan yang disarankan untuk diskusi: putuskan dahulu model kerahasiaan dan akses
untuk TIKET-10 sebelum menyepakati tampilan rekomendasi pada TIKET-11. TIKET-09
juga membutuhkan keputusan akses data sebelum implementasi. TIKET-15 memerlukan
konfirmasi kebutuhan produk sebelum ada perubahan kode.

## Draf TIKET-09 — Ekspor rekap perilaku

**Judul:** `[Perlu klarifikasi] Ekspor rekap perilaku untuk BK dan Kesiswaan`

```markdown
## Latar belakang
Tracker lama mencatat kebutuhan ekspor laporan rekap perilaku untuk Guru BK
dan Kesiswaan dalam format PDF/CSV. Cakupan ekspor, data yang boleh disertakan,
dan hak akses untuk setiap peran belum diputuskan.

## Tujuan
Menetapkan kebutuhan ekspor rekap perilaku sebelum fitur diimplementasikan.

## Keputusan yang perlu ditetapkan
- Peran mana yang boleh mengekspor?
- Data dan rentang tanggal apa yang boleh disertakan?
- Format mana yang dibutuhkan: CSV, PDF, atau keduanya?
- Apakah hasil ekspor mengikuti filter yang sedang diterapkan di layar?
- Informasi apa yang harus dikecualikan atau disamarkan?
- Apakah aktivitas ekspor perlu dicatat dalam audit log?

## Kriteria penerimaan
- [ ] Keputusan tentang peran, data, format, filter, dan audit dicatat.
- [ ] Data yang dapat diekspor tidak melebihi hak akses pengguna.
- [ ] Ekspor tidak membuka data sensitif yang tidak dapat dilihat pengguna di aplikasi.
- [ ] Setelah keputusan disetujui, kriteria hasil dan verifikasi implementasi diperbarui.

## Batasan
Jangan mulai implementasi ekspor sebelum cakupan data dan hak akses disetujui.
Jangan memasukkan data pribadi atau contoh nyata murid ke dalam Issue.
```

## Draf TIKET-10 — Catatan bimbingan khusus BK

**Judul:** `[Perlu keputusan] Ruang lingkup dan akses catatan bimbingan khusus BK`

```markdown
## Latar belakang
Tracker lama mengusulkan skema dan UI untuk catatan bimbingan khusus BK,
termasuk kemungkinan pengaturan visibilitas bagi wali kelas. Catatan seperti ini
dapat berisi data sensitif, sementara aturan akses dan kerahasiaan belum final.

## Tujuan
Menyepakati perilaku produk, batas data, dan aturan akses sebelum merancang
skema atau menyimpan catatan bimbingan khusus di aplikasi.

## Keputusan yang perlu ditetapkan
- Apa perbedaan catatan bimbingan khusus dengan catatan/laporan perilaku yang ada?
- Siapa yang boleh membuat, membaca, mengubah, dan menghapus catatan?
- Apakah wali kelas dapat diberi akses; jika ya, siapa yang dapat memberikannya?
- Apakah akses pimpinan atau admin berbeda dari akses BK?
- Informasi apa yang tidak boleh dimasukkan ke catatan?
- Apakah akses, perubahan, dan penghapusan harus dicatat dalam audit log?
- Bagaimana retensi dan penghapusan data ditangani?

## Kriteria penerimaan
- [ ] Definisi dan tujuan catatan bimbingan disepakati.
- [ ] Matriks izin baca/tambah/ubah/hapus disetujui.
- [ ] Aturan pemberian dan pencabutan akses serta audit ditetapkan.
- [ ] Kebutuhan yang disepakati dicatat di sumber dokumentasi kanonis.
- [ ] Implementasi baru tidak dimulai sebelum keputusan akses dan perlindungan data disetujui.

## Batasan
Jangan menggunakan data kasus nyata dalam Issue, tes, atau contoh.
Jangan menganggap akses admin otomatis berarti akses membaca catatan sensitif.
```

## Draf TIKET-11 — Rekomendasi penanganan di dashboard

**Judul:** `[Perlu klarifikasi] Rekomendasi penanganan murid pada dashboard`

```markdown
## Latar belakang
Tracker lama mengusulkan widget rekomendasi penanganan murid pada dashboard.
Dokumen konteks proyek menyebut rekomendasi BK sebagai rancangan, tetapi siapa
yang boleh membuat dan melihat rekomendasi serta cakupan informasinya belum final.

## Tujuan
Menetapkan kegunaan widget, sumber rekomendasi, dan pengguna yang berhak
melihatnya sebelum implementasi.

## Keputusan yang perlu ditetapkan
- Masalah apa yang hendak dibantu widget ini?
- Siapa yang membuat atau memperbarui rekomendasi?
- Peran mana yang boleh melihat rekomendasi, dan untuk murid dalam cakupan apa?
- Informasi apa yang boleh ditampilkan di dashboard, dan apa yang harus tetap
  berada di ruang BK?
- Bagaimana rekomendasi ditandai kedaluwarsa atau tidak berlaku lagi?

## Kriteria penerimaan
- [ ] Pengguna sasaran dan masalah yang diselesaikan disepakati.
- [ ] Pemilik data, aturan akses, dan cakupan murid ditetapkan.
- [ ] Konten yang boleh ditampilkan dan mekanisme pembaruan ditentukan.
- [ ] Kebutuhan yang disepakati dicatat di sumber dokumentasi kanonis.
- [ ] Widget tidak menampilkan catatan konseling atau informasi di luar izin pengguna.

## Batasan
Jangan menampilkan atau menyimpulkan informasi konseling sensitif pada dashboard.
Implementasi menunggu keputusan kebutuhan dan akses.
```

## Draf TIKET-15 — Identitas pelapor

**Judul:** `[Perlu klarifikasi] Identitas pelapor pada formulir catatan perilaku`

```markdown
## Latar belakang
Tracker lama mengusulkan combobox "Dilaporkan Oleh" pada formulir perilaku.
Namun, implementasi saat ini menyimpan reporter sebagai pengguna yang sedang
login; RPC database juga memeriksa bahwa reporter_id sama dengan auth.uid().

Karena itu, memilih pengguna lain sebagai pelapor dapat membuat atribusi
menyesatkan atau memungkinkan seseorang mengirim laporan atas nama orang lain.

## Tujuan
Memastikan bagaimana identitas pelapor ditampilkan dan apakah aplikasi memang
perlu mendukung pelaporan atas nama orang lain.

## Keputusan yang perlu ditetapkan
- Apakah pelapor selalu pengguna yang sedang login?
- Jika seseorang boleh mengirim laporan atas nama orang lain, siapa yang
  berwenang dan bagaimana identitas pengirim aktual tetap tercatat?
- Apakah formulir cukup menampilkan nama akun aktif sebagai pelapor tanpa pilihan?

## Kriteria penerimaan
- [ ] Aturan identitas pelapor disetujui sebelum perubahan formulir atau skema.
- [ ] Sistem tetap membedakan pengguna yang mengirim laporan dari pihak yang
  disebut sebagai pelapor, bila keduanya memang diperlukan.
- [ ] Perubahan tidak memungkinkan pengguna menyamarkan identitas pengirim.
- [ ] Pengujian memastikan laporan tidak dapat menyimpan atribusi yang tidak sah.

## Batasan
Jangan menambahkan combobox yang memungkinkan pemilihan pelapor lain sebelum
aturan kewenangan dan pencatatan identitas disepakati.
Jangan memasukkan data pribadi nyata ke dalam Issue.
```

## Jika review dilanjutkan nanti

- Tinjau rekomendasi dan draf di atas; terima, revisi, atau batalkan tiap tiket
  secara terpisah.
- Sebelum membuat Issue, cari duplikasi, periksa kembali keadaan implementasi,
  dan pastikan keputusan yang dibutuhkan telah diberi label jelas.
- Minta persetujuan eksplisit sebelum menerbitkan Issue. Persetujuan untuk
  menyimpan atau meninjau draf ini bukan persetujuan untuk memublikasikannya.
- Setelah Issue dibuat, GitHub Issue menjadi status pekerjaan kanonis. Jangan
  menyalin status tiket-tiket ini ke tracker Markdown sebagai backlog baru.
