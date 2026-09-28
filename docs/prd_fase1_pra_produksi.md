# DOKUMEN ARSITEKTUR & PRD FASE 1: PRA-PRODUKSI
**Nama Proyek:** PWA Madrasah Terpadu (Monolith Modular)  
**Versi:** v1.0  
**Status Mode:** DISKUSI  

---

### [DISC-01] VALIDASI PROBLEM-SOLUTION FIT

1. **Rumusan Masalah Utama:**
   Pencatatan jurnal harian mengajar dan pemantauan perilaku siswa di madrasah masih manual dan terfragmentasi, sehingga menyulitkan kordinasi lintas pendidik (Guru Mapel, BK, Wali Kelas, Kamad) serta memperlambat rekapitulasi data harian.

2. **Solusi Inti (Core Solution):**
   Aplikasi web PWA terpadu dengan navigasi berbasis peran (Role-Based Grid) yang memungkinkan guru mencatat jurnal harian dan penanganan perilaku siswa dalam waktu kurang dari 1 menit langsung dari smartphone.

3. **Prinsip Pemangkasan Fitur (Trimming Strategy):**
   Semua fungsi akademik lanjutan (input nilai akhir, e-rapor, modul setoran tahfidz, dan analisis statistik rumit) dipangkas dari Fase 1 agar pengembangan fokus penuh pada pilar pencatatan harian dan koordinasi perilaku.

---

### [REQ-01] PRD RINGKAS & PEMBATASAN SKOP

#### A. Fitur Utama (Core MVP - Maksimal 3 Fungsi)
1. **Dynamic Role-Based Portal Navigation (`/portal/`):**
   Grid UI mobile-first yang menampilkan menu khusus sesuai dengan peran yang aktif (9 roles) dalam 1 pwa entry-point.
2. **Modul Input & Rekap Jurnal Harian Guru:**
   Form input cepat untuk jurnal mengajar harian yang terintegrasi dengan presensi dasar siswa di kelas.
3. **Modul Catatan & Penanganan Perilaku Kolaboratif (BK & Wali Kelas):**
   Pencatatan poin perilaku (positif/negatif) dan alur eskalasi tindakan bersama antara Guru Mapel, Guru BK, Wali Kelas, dan Waka Kesiswaan.

#### B. Backlog / Nice-to-Have (Ditunda ke Fase Selanjutnya)
1. **[Fase 2]** Input/Rekap Nilai Akademik & E-Rapor.
2. **[Fase 2]** Modul Setoran Hafalan Guru Tahfidz.
3. **[Fase 2]** Integrasi Cloudflare R2 untuk penyimpanan berkas media (Fase 1 menggunakan Supabase Storage / Direct URL Drive).
4. **[Fase 3]** Notifikasi WhatsApp Gateway / Push Notification otomatis.
5. **[Fase 3]** Dashboard Analitik Lanjutan bagi Kepala Madrasah (Kamad).

---

### [ARCH-01] TEKNOLOGI STACK (BORING TECH & SPEED-ORIENTED)

1. **Frontend Framework:** Next.js (App Router, TypeScript) + Tailwind CSS.
2. **PWA Engine:** `@ducanh2912/next-pwa` (Support installable mobile app, caching offline dasar).
3. **Backend & Database:** Supabase (PostgreSQL, Supabase Auth SSO, Row Level Security / RLS).
4. **Hosting & Infrastructure:** Vercel (Frontend & Serverless Edge Functions).
5. **Storage Media:** Supabase Storage / External Direct Link (Google Drive).

---

### [ARCH-02] WIREFRAMING TEKS & USER JOURNEY

#### A. Hierarki Navigasi & Struktur Rute
```text
/ (Landing Page / Login SSO Supabase)
└── /portal/ (Dashboard Dynamic Grid UI - Mobile First)
    ├── /portal/jurnal/ (Core 1: Input & Rekap Jurnal Guru)
    ├── /portal/perilaku/ (Core 2: Catatan & Eskalasi Perilaku)
    └── /portal/profil/ (Pengaturan Akun & Shift Role jika Multi-Role)
```

#### B. User Journey Inti

1. **Alur Input Jurnal Harian (Guru Mapel):**
   1. User membuka PWA -> Masuk rute `/portal/`.
   2. Memilih icon grid "Jurnal Harian".
   3. Memilih Kelas & Jam Pelajaran -> Mengisi Materi & Presensi Siswa -> Klik "Simpan" (Durasi < 60 detik).
   4. Data tersimpan ke Supabase Database dengan RLS sesuai ID Guru.

2. **Alur Penanganan Perilaku (Guru / BK / Wali Kelas):**
   1. User membuka rute `/portal/perilaku/`.
   2. Cari nama Siswa -> Pilih Kategori Perilaku (Positif/Pelanggaran).
   3. Jika Pelanggaran Butuh Tindakan -> System memberikan flag alert ke Dashboard Guru BK & Wali Kelas terkait.
   4. Guru BK / Wali Kelas menambahkan catatan penanganan (Kolaboratif).