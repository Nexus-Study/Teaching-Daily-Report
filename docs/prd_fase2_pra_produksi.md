# DOKUMEN ARSITEKTUR & PRD FASE 2: PRODUKSI & PENGEMBANGAN MVP

**Nama Proyek:** PWA Madrasah Terpadu (Monolith Modular)

**Versi:** v1.1

**Status Mode:** DISKUSI

### \[PLAN-01\] BREAKDOWN SPRINT & PAPAN KANBAN (1 MINGGU / SPRINT)

#### A. Timeline Sprint (4 Minggu MVP)

1. **Sprint 1 (Fondasi Sistem & Autentikasi):**
   Fokus pada penyiapan Supabase Auth SSO, skema database dasar, RLS 9 roles, dan proteksi rute `/portal/`.

2. **Sprint 2 (Portal Dynamic Grid & Core 1 - Jurnal Harian):**
   Fokus pada UI Mobile-First `/portal/`, form input jurnal mengajar harian (< 60 detik), dan rekapitulasi harian guru.

3. **Sprint 3 (Core 2 - Catatan & Penanganan Perilaku Kolaboratif):**
   Fokus pada pencatatan poin perilaku (pos/neg), sistem flag alert otomatis, dan modul eskalasi penanganan berjenjang (4 Tier: Guru Mapel, Wali Kelas, BK, Kesiswaan).

4. **Sprint 4 (PWA Optimization, Testing, & Deployment):**
   Fokus pada caching offline PWA (`@ducanh2912/next-pwa`), manifest mobile, UAT (User Acceptance Testing), dan final deployment.

#### B. Papan Kanban MVP (Status Terkini)

##### 1. \[To Do\]

1. `[TICK-07]` Implementasi Modul Perilaku Siswa & Eskalasi Penanganan Berjenjang (BK / Wali Kelas / Kesiswaan / Kamad).

##### 2. \[In Progress\]

1. *Seluruh tiket Sprint 1 dan Core 1 telah tuntas. Bersiap masuk ke `[TICK-07]`.*

##### 3. \[Testing\]

1. *Pengujian fungsi Jurnal Mengajar & Presensi Ringkas (`/portal/jurnal/`).*

##### 4. \[Done\]

1. `[DISC-01]` Validasi Problem-Solution Fit & Trimming Strategy.

2. `[REQ-01]` PRD Ringkas & Pembatasan Skop MVP.

3. `[ARCH-01]` Penentuan Stack Teknologi (Boring Tech & Speed-Oriented).

4. `[ARCH-02]` Wireframing Teks & User Journey Navigation.

5. `[TICK-01]` Setup Next.js App Router, Tailwind CSS, & `@ducanh2912/next-pwa`.

6. `[TICK-02]` Konfigurasi Supabase Client & Middleware Auth di Next.js.

7. `[TICK-03]` Eksekusi DDL SQL Skema `profiles` dan Enum `user_role` (9 Roles).

8. `[TICK-04]` Penyiapan RLS Helper Functions PostgreSQL (`auth.uid()`, `get_user_role()`).

9. `[TICK-05]` Pembuatan UI Layout `/portal/` dengan Dynamic Grid sesuai Role.

10. `[TICK-06]` Implementasi Form Input Jurnal Mengajar + Presensi Ringkas & Transaksi Atomic SQL.

### \[ARCH-03\] PRIORITAS KOMPONEN FONDASI

1. **Tahap A: Sistem Otentikasi & Manajemen Pengguna (Priority 1) - [SELESAI]**

   1. Autentikasi menggunakan Supabase Auth (SSO Email/Password).

   2. Tabel `profiles` yang terikat secara `1:1` dengan `auth.users`.

   3. Atribut `roles` menggunakan `ENUM[]` berisi 9 peran (`admin`, `kamad`, `waka_kesiswaan`, `waka_kurikulum`, `guru_bk`, `guru_mapel`, `guru_tahfidz`, `wali_kelas`, `siswa`).

   4. Next.js Middleware untuk pengalihan otomatis user belum terautentikasi ke `/login` dan pembatasan hak akses rute berdasarkan role.

2. **Tahap B: Struktur Database & Row Level Security / RLS (Priority 2) - [SELESAI]**

   1. Helper function PostgreSQL untuk membaca role pengguna aktif tanpa overhead query berulang.

   2. Skema entitas utama: `kelas`, `siswa`, `jurnal_mengajar`, `presensi_siswa`, `catatan_perilaku`, `penanganan_perilaku`.

   3. Penerapan RLS murni di PostgreSQL untuk menjamin isolasi data (misal: Guru hanya bisa edit jurnal miliknya; Wali Kelas membaca rekap jurnal kelas bimbingannya; BK & Wali Kelas mengelola penanganan perilaku berjenjang).

3. **Tahap C: Alur Bisnis Utama / Core Business Logic (Priority 3) - [DALAM PROSES]**

   1. Server Actions Next.js & Stored Procedure PostgreSQL untuk transaksi atomic input jurnal + presensi ringkas dalam 1 kali RPC call.

   2. Realtime / Flag Alert logic & alur eskalasi 4 tier untuk entri pelanggaran siswa (Guru -> Wali Kelas -> BK -> Kesiswaan/Kamad).

### \[DEV-01\] STRATEGI GIT & BRANCHING WORKFLOW

1. **Struktur Branching:**

   1. `main`: Branch produksi resmi. Kode di branch ini selalu stabil dan ter-deploy otomatis ke lingkungan Production.

   2. `staging`: Branch pra-rilis untuk pengujian integrasi antar-fitur.

   3. `feature/<nama-fitur>`: Branch eksplorasi/pengerjaan fitur spesifik per micro-ticket (contoh: `feature/auth-supabase`, `feature/jurnal-input`).

2. **Protokol Commit & Merge:**

   1. Format Commit Message: `[ID-TIKET] Deskripsi perubahan ringkas` (contoh: `[TICK-01] Initialize Next.js PWA project`).

   2. Merge dari `feature/*` ke `staging`/`main` wajib menggunakan Pull Request (PR) setelah lulus pengecekan tipe TypeScript dan build tanpa error.

### \[DEV-02\] KONFIGURASI DEPLOYMENT & CI/CD PIPELINE

1. **Alur Deployment Vercel (PaaS):**

   1. Push ke branch `main` mentriger Build & Deploy otomatis ke **Production Environment**.

   2. Push ke branch `staging` atau pembuatan Pull Request mentriger **Preview Deployment** untuk testing terisolasi.

2. **Skrip Otomatisasi CI/CD (GitHub Actions Workflow):**

   1. Pengecekan otomatis pada setiap PR mencakup: Type-Checking (`tsc --noEmit`), Linting (`eslint`), dan Dry Build (`npm run build`).

3. **Contoh Konfigurasi GitHub Actions (`.github/workflows/ci.yml`):**

```yaml
name: CI Quality Gate

on:
  pull_request:
    branches: [ main, staging ]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
```