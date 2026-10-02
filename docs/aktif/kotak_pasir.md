Memperbaiki app/portal/jurnal/
1. tambahkan pilihan tanggal di awal menu. format tanggal mengikuti waktu WIT Indonesia (gmt+9). nilai default adalah tanggal hari ini yang dapat diubah
2. bila tanggal di pilih, maka dropdown mata pelajaran, kelas, dan jam ke hanya akan terbatas pada jadwal_guru pada hari itu saja.
3. ubah tata letak UI: letakkan mata pelajaran di awal lalu diikuti kelas. pilihan dropdown mata pelajaran dan kelas hanya yang tersimpan di database jadwal_guru. pilihan dropdown kelas hanya bergantung pada pilihan mata pelajaran. contoh: Guru A mengajar dua mata pelajaran Bahasa Indonesia dan Kokurikuler. di Bahasa Indonesia di mengajar di kelas VII.5 dan VII.4. di Kokurikuler ia mengajar di kelas IX.4. bila ia memilih mata pelajaran kokurikuler, maka yang muncul hanya kelas IX.4. 
2. Bila mata pelajaran seorang guru hanya 1, maka langsung isikan kolom input dengan mata pelajaran itu. 
3. jam pelajaran juga berupa dropdown yang dapat diketik, dibatasi hanya jam pelajaran yang dia ampu. jam pelajaran di ambil dari gabungan antara kolom `jam_mulai` dan `jam_selesai` di jadwal_guru. misal, di jadwal_guru, Guru A mengajar di jam mulai 1 dan jam selesai 2, maka ketika ia ingin memilih jam pelajaran, maka muncul pilihan '1-2'

Struktur UI kartu atas, kartu tengah dan bawah masih sama:
Tanggal
mata pelajaran
kelas
jam ke

informasi pendukung:
database.ts
action.ts
page.tsx
sql_schema.md
struktur_proyek.md


