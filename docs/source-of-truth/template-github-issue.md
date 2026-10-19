# Panduan dan Template GitHub Issue

Dokumen ini adalah rujukan kanonis untuk membuat GitHub Issue di repository
Teaching-Daily-Report, baik secara manual maupun dengan bantuan Copilot/agen AI.
Template di sini adalah teks Markdown untuk disalin ke Issue; dokumen ini tidak
membuat atau mengirim Issue secara otomatis.

## Kapan membuat Issue

Buat Issue jika pekerjaan perlu dilacak, memiliki beberapa langkah, memengaruhi
perilaku aplikasi, perlu keputusan, atau perlu ditautkan ke pull request (PR).
Perubahan sangat kecil dan berisiko rendah—misalnya memperbaiki typo—tidak selalu
memerlukan Issue.

Satu Issue sebaiknya memiliki satu hasil utama yang dapat dijelaskan dan
diverifikasi. Pisahkan pekerjaan jika hasilnya dapat dikerjakan atau ditinjau
secara mandiri. Jangan membuat Issue duplikat; cari dulu melalui tab **Issues**
repository dan periksa Issue terbuka maupun yang sudah ditutup.

Di proyek ini:

- GitHub Issues adalah sumber status kanonis untuk pekerjaan yang perlu dilacak.
- Keputusan produk yang belum disetujui harus ditulis sebagai pertanyaan/keputusan
  terbuka, bukan sebagai instruksi implementasi yang sudah final.
- Issue yang menunggu keputusan harus menyebutkan bahwa implementasi belum boleh
  dimulai sampai keputusan terkait disetujui.
- Perubahan kecil yang tidak memerlukan Issue tidak perlu dicatat di tracker
  Markdown lain.

## Sebelum mengirim Issue

1. Pastikan repository dan halaman Issue yang dibuka benar.
2. Cari judul atau kata kunci terkait untuk menghindari duplikasi.
3. Tulis masalah atau hasil yang diinginkan, bukan langsung mendikte solusi teknis
   yang belum diperiksa.
4. Nyatakan batasan dan hal yang tidak termasuk pekerjaan.
5. Buat kriteria penerimaan yang dapat diperiksa. Hindari kriteria seperti
   “terlihat lebih baik” tanpa menyebutkan perubahan yang bisa diamati.
6. Periksa bahwa Issue tidak memuat rahasia, kredensial, atau data pribadi.

## Template umum

Salin bagian berikut ke deskripsi Issue. Hapus bagian opsional yang tidak relevan
dan isi bagian dalam tanda kurung siku.

```markdown
## Ringkasan
[Satu atau dua kalimat tentang hasil yang ingin dicapai.]

## Masalah atau konteks
[Apa yang sekarang gagal, membingungkan, berisiko, atau belum tersedia?
Sertakan siapa yang terdampak dan kapan masalah terjadi.]

## Hasil yang diharapkan
[Jelaskan perilaku/hasil dari sudut pandang pengguna. Jangan tetapkan detail
implementasi yang belum diputuskan.]

## Kriteria penerimaan
- [ ] [Kondisi yang dapat diamati dan diuji.]
- [ ] [Kondisi lain yang diperlukan.]

## Batasan
- Termasuk: [cakupan yang termasuk.]
- Tidak termasuk: [cakupan yang sengaja tidak dikerjakan.]
- Jangan mengubah: [perilaku/aturan yang harus dipertahankan, bila ada.]

## Verifikasi
- [Cara menguji hasil, misalnya tes otomatis atau langkah manual.]
- [Pemeriksaan yang relevan untuk memastikan tidak ada regresi.]

## Keputusan terbuka (opsional)
- [Pertanyaan yang harus dijawab sebelum implementasi.]

## Risiko dan data (opsional)
- Area terdampak: [akses/izin, data sensitif, database, offline, deployment, atau
  tidak ada yang diketahui.]
- Perlindungan yang diperlukan: [batas akses, audit, privasi, rollback, dll.]
```

## Sesuaikan menurut jenis pekerjaan

Gunakan template umum sebagai dasar. Tambahkan hanya bagian yang membantu
menjelaskan pekerjaan.

### Bug

Tambahkan bagian berikut bila melaporkan bug:

```markdown
## Langkah untuk mereproduksi
1. [Langkah pertama]
2. [Langkah berikutnya]

## Hasil saat ini
[Apa yang benar-benar terjadi? Sertakan pesan error yang sudah dibersihkan
dari token, alamat privat, atau data pengguna.]

## Hasil yang diharapkan
[Apa yang seharusnya terjadi?]

## Lingkungan (opsional)
- Perangkat/browser:
- Halaman atau fitur:
- Terakhir diketahui bekerja:
```

Tulis langkah sesederhana mungkin agar orang lain dapat mengulanginya. Jangan
menyertakan screenshot atau log berisi identitas/data pribadi.

### Fitur atau perubahan perilaku

Jelaskan pengguna dan alur yang membutuhkan perubahan. Sertakan contoh keadaan
sebelum/sesudah jika membantu. Tandai perilaku, peran, atau aturan produk yang
belum disetujui sebagai **keputusan terbuka**; jangan mengubah usulan menjadi
kriteria final tanpa persetujuan.

### Keputusan atau klarifikasi

Gunakan Issue untuk keputusan yang perlu dilacak, bukan untuk mengasumsikan
jawabannya:

```markdown
## Keputusan yang dibutuhkan
[Apa yang belum diputuskan?]

## Pilihan yang perlu dipertimbangkan
- [Pilihan A — dampak/konsekuensi]
- [Pilihan B — dampak/konsekuensi]

## Rekomendasi (opsional)
[Rekomendasi dan alasannya; tandai sebagai usulan, bukan keputusan.]

## Implementasi
Jangan mulai implementasi yang bergantung pada keputusan ini sampai keputusan
disetujui dan dicatat di sumber dokumentasi kanonis.
```

Issue jenis ini dapat ditutup setelah keputusan dicatat. Buat Issue implementasi
terpisah jika keputusan tersebut menghasilkan pekerjaan kode yang cukup besar
atau perlu dilacak tersendiri.

### Template diskusi untuk menyelesaikan `PERLU KLARIFIKASI`

Gunakan format berikut saat meminta keputusan dari pemilik keputusan, baik dalam
Issue maupun sebagai panduan diskusi. Pisahkan pertanyaan yang dapat dijawab
secara mandiri. Isi opsi hanya jika memang ada alternatif yang masuk akal; jangan
mengarahkan jawaban dengan menyajikan usulan sebagai keputusan.

```markdown
## Klarifikasi yang dibutuhkan
- Topik: [judul singkat]
- Rujukan: [bagian/baris di `docs/konteks-penggunaan.md` atau sumber terkait]
- Pemilik keputusan: [peran/orang yang berwenang mengonfirmasi]
- Alasan perlu diputuskan: [dampak jika belum ada keputusan]

## Yang sudah disepakati
- [Fakta atau keputusan berstatus DIKONFIRMASI yang membatasi pilihan]

## Yang belum diputuskan
- [Rumusan netral tentang kebutuhan/aturan yang masih PERLU KLARIFIKASI]
- Batas pembahasan: [hal yang termasuk dan tidak termasuk]

## Pilihan dan dampak
- A. [Pilihan] — [dampak/manfaat/konsekuensi]
- B. [Pilihan] — [dampak/manfaat/konsekuensi]
- Lainnya: [pilihan lain atau jawaban bebas, bila relevan]

## Rekomendasi (opsional, bukan keputusan)
- [Pilihan yang direkomendasikan dan alasannya; jangan menganggapnya disetujui]

## Jawaban pemilik keputusan
- Keputusan: [pilihan/aturan yang disetujui, ditunda, atau belum diputuskan]
- Cakupan atau pengecualian: [rincian yang perlu agar keputusan tidak ambigu]
- Dikonfirmasi oleh: [pemilik keputusan]
- Tanggal/konteks persetujuan: [tanggal atau tautan percakapan/Issue]

## Tindak lanjut setelah keputusan
- [ ] Perbarui butir terkait di `docs/konteks-penggunaan.md`; gunakan
      `DIKONFIRMASI` hanya untuk keputusan yang disetujui secara eksplisit.
- [ ] Tandai rancangan yang tergantikan sebagai usang/superseded bila relevan;
      jangan menghapus riwayat yang masih diperlukan.
- [ ] Buat atau perbarui ADR jika keputusan berdampak pada arsitektur, keamanan,
      skema data, integrasi, atau banyak fitur. Mulai dengan status Proposed;
      gunakan Accepted hanya setelah keputusan disetujui secara eksplisit.
- [ ] Buat Issue implementasi terpisah bila keputusan memerlukan pekerjaan
      implementasi yang perlu dilacak.
```

Jika pemilik keputusan belum menjawab atau jawabannya belum cukup spesifik,
biarkan status tetap **PERLU KLARIFIKASI** dan catat pertanyaan lanjutan. Jangan
memulai implementasi yang bergantung pada keputusan tersebut, dan jangan
mengubahnya menjadi **DIKONFIRMASI**, **DI LUAR MVP**, atau status final lain
berdasarkan rekomendasi agen atau asumsi. Jangan masukkan data pribadi murid/guru
ke Issue atau catatan klarifikasi publik.

## Judul, label, dan prioritas

- Buat judul spesifik, singkat, dan berorientasi hasil, misalnya
  `Tampilkan pesan saat penyimpanan jurnal gagal`.
- Awalan seperti `[Bug]` atau `[Fitur]` boleh dipakai jika membantu pencarian,
  tetapi bukan pengganti judul yang jelas.
- Gunakan label, assignee, milestone, dan prioritas hanya jika sesuai dengan
  konvensi yang sudah tersedia di repository. Jangan mengarang nama label atau
  menetapkan prioritas tinggi tanpa alasan.
- Hindari memasukkan beberapa pekerjaan yang tidak berkaitan ke satu Issue.

## Privasi dan keselamatan data

Repository ini bersifat publik. Perlakukan Issue sebagai informasi yang dapat
dilihat siapa saja, termasuk komentar dan lampirannya.

- Jangan menulis nama murid/guru, NISN, alamat, nomor telepon, kredensial,
  token, URL privat, atau informasi lain yang dapat mengenali seseorang.
- Gunakan data buatan dan contoh yang sudah dianonimkan.
- Untuk bug terkait data nyata, jelaskan pola masalah tanpa menyalin rekaman.
- Jangan mengunggah tangkapan layar/log sebelum memeriksa dan menyamarkan data.
- Jika sebuah isu memerlukan detail sensitif untuk investigasi, jangan
  memublikasikannya di Issue; minta arahan melalui saluran yang disetujui.

## Setelah Issue dibuat

1. Catat nomor dan tautan Issue sebagai rujukan pekerjaan.
2. Perbarui kriteria penerimaan jika keputusan atau cakupan berubah; jangan
   membiarkan deskripsi lama tetap tampak sebagai aturan yang berlaku.
3. Saat membuka PR, tautkan Issue yang benar. Gunakan `Closes #<nomor>` hanya
   jika penggabungan PR memang menyelesaikan seluruh pekerjaan Issue tersebut.
4. Tutup Issue ketika kriteria penerimaannya terpenuhi atau keputusan sudah
   dicatat. Jelaskan jika pekerjaan dibatalkan atau dipindahkan ke Issue lain.

## Meminta Copilot/agen membuat Issue

Anda dapat meminta agen menyusun draf atau membuat Issue, tetapi berikan tujuan
dan batasnya. Alur yang disarankan:

1. Minta agen memeriksa Issue yang sudah ada dan merangkum potensi duplikasi.
2. Minta draf judul dan deskripsi berdasarkan template ini.
3. Tinjau hasil, terutama kriteria penerimaan, keputusan terbuka, prioritas, dan
   risiko privasi.
4. Minta pengiriman/pembuatan Issue hanya setelah Anda menyetujui draf.

Jangan menganggap persetujuan atas analisis sebagai persetujuan untuk
mempublikasikan Issue. Agen harus menyatakan secara jelas apakah ia hanya
menyiapkan draf atau benar-benar membuat Issue.
