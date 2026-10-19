# Kotak Pasir

## Tujuan

Folder ini adalah ruang kerja untuk mengeksplorasi gagasan, pertanyaan, masalah, dan hipotesis terkait pengembangan proyek bersama Copilot. Pembahasan boleh dimulai dengan masukan yang belum lengkap atau terstruktur, lalu diperjelas secara bertahap.

## Status dan batasan

Semua isi folder ini bersifat eksploratif, bukan kebutuhan produk, keputusan, spesifikasi, atau instruksi implementasi. Jangan menganggap suatu gagasan atau saran telah disetujui, dan jangan menjadikannya dasar perubahan aplikasi sebelum kebutuhan dan keputusan terkait dikonfirmasi.

Saat membahas isi folder ini, Copilot perlu membedakan fakta yang diketahui, asumsi, pertanyaan, dan usulan. Copilot boleh memberi saran, menjelaskan pilihan dan konsekuensinya, serta meminta klarifikasi; jangan mengarang persetujuan atau kebijakan. Jika kebutuhan, keamanan, atau perilaku yang diinginkan belum jelas, tanyakan sebelum menyarankan keputusan final atau membuat perubahan yang bergantung pada jawaban tersebut.

Tidak semua catatan perlu dipindahkan atau ditindaklanjuti. Jika suatu gagasan disetujui atau perlu dikerjakan, pindahkan atau rangkum ke sumber yang sesuai mengikuti [`../../source-of-truth/README.md`](../../source-of-truth/README.md). Gunakan GitHub Issue untuk pekerjaan yang perlu dilacak dan ADR untuk keputusan arsitektur atau teknis yang memenuhi kriteria proyek. Catat keputusan pada sumber resmi hanya setelah persetujuan eksplisit. Kotak pasir dapat menyimpan riwayat eksplorasi sebagai konteks, tetapi tetap bukan sumber keputusan.

## Cara menggunakan

- Buat satu file Markdown untuk setiap topik, dengan nama singkat yang menjelaskan topik. Awali nama dengan tanggal saat topik dibuat, misalnya `2026-10-19-isian-jurnal-saat-koneksi-terputus.md`.
- Catat kontribusi pengguna dan Copilot secara berurutan di file topik. Cantumkan tanggal dan rangkum inti diskusi, bukan seluruh percakapan.
- Jangan menimpa atau menghapus kontribusi sebelumnya. Tambahkan masukan atau tanggapan baru di bagian akhir agar riwayat dan konteks tetap terbaca.
- Setiap kali diskusi menghasilkan kesepakatan, mengubah pemahaman, atau memperjelas hal yang belum diputuskan, Copilot memperbarui bagian **Hasil sementara** pada file topik.
- Bedakan dengan jelas kesepakatan bersama, fakta, asumsi, rekomendasi Copilot, dan pertanyaan terbuka. Jangan menyebut saran Copilot sebagai kesepakatan tanpa persetujuan pengguna yang jelas. Jika persetujuan belum jelas, tanyakan atau tandai belum dikonfirmasi.
- Pengguna dapat menambahkan bagian **Catatan pengguna tentang hasil sementara** bila ringkasan tidak mencerminkan pemahamannya. Copilot menanggapi catatan itu secara eksplisit: mengonfirmasi dan memperbaiki ringkasan jika sepakat, atau menjelaskan perbedaan pandangan dan meminta klarifikasi. Jangan menghapus catatan pengguna; tambahkan tanggapan dan perbarui ringkasan setelah perbedaannya diselesaikan.
- Copilot boleh menguji gagasan secara kritis dengan mengungkap asumsi, membandingkan alternatif, menunjukkan risiko atau kekeliruan penalaran, serta menerapkan prinsip seperti Occam's razor dan praktik baik yang relevan. Jelaskan alasan dan konteksnya, bukan sekadar memberi label atau membantah. Tujuannya memperjelas masalah dan mendukung keputusan pengguna, bukan memenangkan argumen atau mendorong pilihan tertentu.
- Jika perkembangan diskusi tampak memenuhi kriteria untuk status lain, Copilot menyarankan status yang tepat, menjelaskan alasannya, dan meminta konfirmasi pengguna. Jangan mengubah status di file topik atau indeks sebelum pengguna mengonfirmasi secara eksplisit. Setelah dikonfirmasi, perbarui status pada file topik dan tabel indeks, serta catat perkembangan itu dalam riwayat topik.
- Perbarui tabel indeks di bawah saat topik dibuat atau statusnya berubah. Status pada file topik adalah rincian utama; indeks ini hanya ringkasan untuk menemukan topik.
- Topik yang selesai atau tidak dilanjutkan tetap disimpan. Cantumkan tautan sumber resmi jika hasilnya dipindahkan, atau alasan singkat jika ditutup.

### Status topik

- **Terbuka** — pembahasan masih berlangsung.
- **Menunggu klarifikasi** — ada pertanyaan yang perlu dijawab sebelum pembahasan dapat dilanjutkan.
- **Selesai — dipindahkan** — hasil yang disetujui sudah dicatat pada sumber resmi.
- **Ditutup — tidak dilanjutkan** — diputuskan untuk tidak melanjutkan.

Status topik hanya menunjukkan keadaan diskusi. Status itu tidak menggantikan persetujuan atau status pada sumber resmi.

## Indeks topik

| Topik | Status | Catatan |
| --- | --- | --- |
| [Contoh: isian jurnal saat koneksi terputus](./contoh-isian-jurnal-saat-koneksi-terputus.md) | Contoh — terbuka | Simulasi fiktif untuk memperagakan alur eksplorasi; bukan kebutuhan proyek yang disetujui. |

## Kerangka topik baru

Salin kerangka berikut ke file baru. Tambahkan bagian masukan lanjutan dan tanggapan Copilot berulang kali sesuai kebutuhan.

```markdown
# [Judul topik]

- **Status:** Terbuka
- **Dibuat:** YYYY-MM-DD

## Masukan — Pengguna (YYYY-MM-DD, hh:mm)

[Gagasan, pertanyaan, masalah, atau konteks awal.]

## Tanggapan — Copilot (YYYY-MM-DD, hh:mm)

[Respons, opsi atau rekomendasi, asumsi yang perlu dikonfirmasi, dan/atau pertanyaan klarifikasi.]

## Masukan lanjutan — Pengguna (YYYY-MM-DD, hh:mm)

[Komentar, koreksi, pilihan, atau informasi tambahan.]

## Tanggapan lanjutan — Copilot (YYYY-MM-DD, hh:mm)

[Tanggapan berikutnya.]

## Hasil sementara

[Pisahkan kesepakatan bersama, fakta, rekomendasi/asumsi yang belum dikonfirmasi, pertanyaan terbuka, dan langkah berikutnya.]

## Catatan pengguna tentang hasil sementara

[Opsional. Pengguna dapat menambahkan koreksi atau menjelaskan bagian yang tidak mewakili pemahamannya. Copilot menanggapi di bawah catatan ini tanpa menghapusnya.]

## Tanggapan Copilot atas catatan pengguna

[Konfirmasi dan perbaikan ringkasan, atau penjelasan perbedaan pandangan beserta pertanyaan klarifikasi.]

## Rujukan bersama khusus untuk diskusi ini
[Tuliskan rujukan yang relevan baik dari proyek maupun luar proyek arahkan dengan link aktif]


## Skill yang perlu Copilot Gunakan
[hanya bila diperlukan, Copilot dapat menyarankan skill yang sesuai]
```
