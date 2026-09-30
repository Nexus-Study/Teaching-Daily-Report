# DEVELOPMENT FITUR SELESAI
    waktu_selesai: 30/09/2026 15.50
    status: file tidak digunakan lagi. Silahkan dihapus.

# Fitur Baru: Rekapitulasi Kehadiran Siswa di Mata Pelajaran
## Deksripsi UI
1. Title: Rekap Kehadiran Siswa
2. Deskripsi: Akumulasi hadir, sakit, izin, alpa siswa di mata pelajaran.
3. Role: Admin, Kamad, Waka Kurikulum, Waka Kesiswaan, Wali Kelas, guru mapel, guru tahfidz, dan guru bk
3. Gambaran struktur UI:
    a. Title
    b. Deskripsi
    c. Kelas (default dropdown)
    d. Mata Pelajaran (default dropdown)
    e. Periode : {bulan_mulai} - {bulan_selesai}
    f. Tabel: ["full_name", "hadir", "sakit", "izin", "alpa"]

## Catatan
2. Pada Deskripsi UI: 3.c Kelas:
    - role: guru_mapel dan guru tahfidz, restriction: semua kelas yang diampu saja
    - role: wali kelas, restriction: kelas perwalian saja
    - semua role selain di atas, tanpa restriction

2. Deskripsi UI: 3.d Mata Pelajaran:
    - role: guru_mapel dan guru tahfidz, restriction: memunculkan mapelnya saja.
    - role: wali kelas, restriction: semua mapel di kelasnya saja.
    - semua role selain itu, tanpa restriction.

3. Tabel
    - role: guru mapel, guru tahfidz, dan wali kelas, tanpa restriction
    - selain ketiga role di atas, restriction: hanya tampilkan akumulasi sakit atau izin atau alpa >= 3


---
# 1_Iterasi_1: 30.09.2026 - 15.21
1. hapus akses untuk waka-waka, kamad, dan guru bk pada menu rekap kehadiran saat ini (mata pelajaran). batasi hanya untuk guru tahfidz, guru mapel, bk, dan admin.  Untuk role admin, tanpa restriksi.
2. waka-waka, kamad, guru bk dibuatkan tampilan tersendiri, bisa page tersendiri atau di page yang sama (app/portal/rekap-kehadiran), tapi muncul berdasarkan peran (kamu bantu pilihkan mana yang terbaik.)
    struktur tabel kira-kira: nama|kelas|mapel|hadir|sakit|izin|alpa
    data yang muncul tetap menggunakan rule sakit >= 3 atau izin >= 3 atau alpa >= 3
