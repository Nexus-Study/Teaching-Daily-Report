[FEATURE-01] Penambahan riwayat jurnal
Deskripsi: Riwayat jurnal menampilkan daftar semua jurnal guru. 
Hak akses: Guru Mapel
Uraian:
Riwayat jurnal
1. Riwayat jurnal mengikuti struktur:
kelas: select dropdown; nilai default semua kelas
tanggal: select dropdown; nilai default semua tanggal
daftar jurnal: dalam bentuk row (jangan grid) dengan struktur per baris tanggal, materi, tautan yang mengarah ke detail jurnal. kode detail jurnal akan dibuat kemudian. 

---
Kelas {kelas}
Tanggal {tanggal}
------
Riwayat Jurnal {kelas}
Tanggal terbaru 1      Materi       [detail]
tanggal terbaru 2      Materi       [detail]


2. pada app/portal/jurnal ditambahkan button mengambang di bagian paling bawah layar (prioritas tampilan mobile), 
bila dikllik mengarah ke riwayat jurnal. button ini bertuliskan "riwayat jurnal"
prasyarat:
mengubah rekap jurnal harian pada app/portal/jurnal menjadi `Rekap jurnal harian {kelas}` dengan kelas khusus pada kelas yang dipilih di bagian atas.
kartu rekap jurnal hanya dibatasi pada jurnal di kelas itu saja dengan tampilan visible sebanyak 3 kartu saja. diikuti tulisan selengkapnya yang dapat diklik. tulisan selengkapnya ini bukan tampilan utama, jadi tidak boleh mencolok. ketika tulisan selengkapnya ditekan, user diarahkan ke riwayat jurnal dengan nilai default pada kolom kelas adalah kelas app/portal/jurnal saat itu. 

[FEATURE-02] DETAIL JURNAL

struktur UI 'detail jurnal':
---------------------------------------------------
Kelas: select dropdown; nilai defaul `semua kelas`
Tanggal: select dropdown; nilai default `semua tanggal`
---------------------------------------------------
MATERI:                                 [ikon pena]
judul materi:
uraian materi:
---------------------------------------------------
KEHADIRAN                               [ikon pena]
Sakit:
1. nama 1
2. nama 2

Izin: 
1. nama 1
2. nama 2

alpa: 
1. nama 1
2. nama 2
----------------------------------------------------
REFLEKSI                                 [ikon pena]
----------------------------------------------------

keterangan:
1. MATERI: untuk mengubah judul maupun uraian materi
2. KEHADIRAN: bila ada salah satu atau lebih dari sakit, izin, alpa bernilai 0, sembunyikan. ikon pena berfungsi untuk memodifikasi kehadiran. mungkin ada nama tertentu yang sebelum dianggap hadir ternyata alpa. atau menambahkan siswa yang sakit, izin, atau alpa
3. REFLEKSI: bila refleksi kosong, 

nice to have: isian refleksi dapat diunduh berupa teks panjang yang mencakup refleksi dari berbagai kelas dan tanggal. 

Menambahkan menu refleksi tersendiri.
Tampilan UI bisa seperti ini

kelas

------
29 Agustus 2026
teks 
-----
22 Agustus 2026 
Teks


prasyarat:
kartu jurnal dilengkapi dengan tulisan 'tambah refleksi'. begitu tulisan tambah refleksi diklik di akan ke kotak pengisian refleksi di detail jurnal yang sesuai berdasarkan kelas dan tanggal.

nice to have: detail jurnal memiliki kemampuan swipe, ke kanan ke jurnal berikutnya, dan sebaliknya.
pertanyaan:
lebih baik membuat halaman baru atau melakukan sistem switch. pertimbangan harus diutamakan pada kemudahan refaktor/maintenance/debugging
gap knowledge
buatkan backlog, sprint dan ticket.


tentukan prioritas pengerjaan berdasarkan perhitungan RICE