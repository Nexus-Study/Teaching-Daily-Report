# Struktur Proyek Teaching-Daily-Report

Dokumen ini mencatat struktur file proyek berdasarkan kondisi workspace saat ini. Direktori hasil instalasi dan build seperti `node_modules/`, `.next/`, `.vercel/`, dan `.git/` tidak dicantumkan karena isinya dikelola oleh tooling.

```text
Teaching-Daily-Report/
├── .env.example
├── .env.local
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── app/
│   ├── globals.css
│   ├── icon.png
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── portal/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── admin/
│       │   ├── actions.ts
│       │   └── page.tsx
│       ├── components/
│       │   ├── mobile-nav.tsx
│       │   ├── confirmation-modal.tsx
│       │   └── sidebar.tsx
│       ├── config/
│       │   └── menu.ts
│       ├── docs/
│       │   └── struktur_proyek.md
│       ├── jurnal/
│       │   ├── actions.ts
│       │   ├── PresensiSederhana.tsx
│       │   └── page.tsx
│       ├── laporan/
│       │   ├── actions.ts
│       │   └── page.tsx
            │       ├── perilaku/
            │       │   ├── actions.ts
            │       │   └── page.tsx
            │       ├── profil/
            │       │   ├── actions.ts
            │       │   ├── components/
            │       │   │   ├── profile-tab.tsx
            │       │   │   ├── profile-tabs.tsx
            │       │   │   └── security-tab.tsx
            │       │   └── page.tsx
            │       └── rekap-kehadiran/
            │           └── page.tsx
├── docs/
│   ├── aktif/
│   │   ├── README.md
│   │   ├── feature-01.md
│   │   ├── kotak_pasir.md
│   │   └── konteks/
│   │       ├── sql_schema.md
│   │       └── struktur_folder.png
│   ├── arsip/
│   │   ├── README.MD
│   │   ├── file_dukungan_crud_siswa.md
│   │   ├── fitur_kehadiran_siswa_mapel.md
│   │   ├── fix-01_menu_crud_data_guru.md
│   │   ├── panduan_eksekusi_crud_siswa_nisn_optional.md
│   │   ├── prd_fase1_pra_produksi.md
│   │   ├── prd_fase2_pra_produksi.md
│   │   ├── sprint1_schema_rls.md
│   │   ├── sprint2_schema_core1_core2.md
│   │   ├── tick10_ui_redesign.md
│   │   ├── toMerge-trd-simple-prd-add.md
│   │   └── fix/
│   │       └── fix-02_ubah_format_mapeljamke.md
│   └── daftar/
│       ├── konsep.md
│       ├── daftar-fix.md
│       └── daftar_feature.md
├── lib/
│   └── supabase/
│       ├── admin.ts
│       ├── client.ts
│       └── server.ts
├── public/
│   ├── icon-192.svg
│   ├── icon-192-maskable.svg
│   ├── icon-512.svg
│   ├── icon-512-maskable.svg
│   ├── sw.js
│   ├── template_guru.csv
│   ├── template_siswa.csv
│   └── workbox-7144475a.js
├── supabase/
│   └── migrations/
│       ├── 20260929000000_init_auth_profiles.sql
│       ├── 20260929000001_core_academic_and_behavior.sql
│       ├── 20260929000002_submit_jurnal_and_presensi.sql
│       ├── 20260929000003_submit_catatan_perilaku.sql
│       ├── 20260929000004_import_kelas_dan_siswa_json.sql
│       ├── 20260929000005_import_guru_profiles_json.sql
│       ├── 20260929000006_add_profile_email_is_active.sql
│       └── 20261003000000_update_submit_jurnal_and_presensi_tanggal.sql
└── types/
    └── database.ts
```

## Ringkasan Direktori

- `app/`: halaman, layout, stylesheet, dan konfigurasi metadata aplikasi Next.js.
- `app/login/`: halaman autentikasi.
- `app/portal/`: halaman dan layout area utama pengguna setelah masuk.
- `app/portal/admin/`: halaman serta server actions untuk administrasi.
- `app/portal/components/`: komponen navigasi portal untuk desktop dan perangkat mobile, serta modal konfirmasi.
- `app/portal/config/`: konfigurasi menu portal.
- `app/portal/jurnal/`: halaman, server actions, dan komponen presensi sederhana jurnal mengajar.
- `app/portal/laporan/`: halaman dan server actions laporan.
- `app/portal/perilaku/`: halaman dan server actions catatan perilaku.
- `app/portal/profil/`: halaman profil, pengaturan jadwal mengajar, dan kredensial keamanan.
- `app/portal/rekap-kehadiran/`: halaman rekap kehadiran.
- `app/portal/docs/`: dokumentasi yang berkaitan dengan area portal.
- `docs/aktif/`: dokumentasi aktif, spesifikasi fitur, dan konteks skema.
- `docs/arsip/`: dokumentasi historis dan arsip pekerjaan.
- `docs/daftar/`: daftar konsep, fitur, dan perbaikan.
- `lib/supabase/`: konfigurasi klien Supabase browser, server, dan admin service-role.
- `public/`: aset statis, ikon PWA, service worker, dan template impor CSV.
- `supabase/migrations/`: migrasi skema dan fungsi database Supabase.
- `types/`: deklarasi tipe TypeScript, termasuk tipe database.

## File Konfigurasi Utama

- `package.json` dan `package-lock.json`: metadata proyek, dependensi, dan perintah npm.
- `next.config.mjs`: konfigurasi Next.js.
- `tailwind.config.ts` dan `postcss.config.mjs`: konfigurasi styling.
- `tsconfig.json`: konfigurasi TypeScript.
- `proxy.ts`: logika proxy aplikasi.
- `.env.example` dan `.env.local`: berkas konfigurasi environment; `.env.local` berisi konfigurasi lokal dan tidak dicatat isinya di dokumentasi.
- `.vscode/settings.json`: pengaturan workspace VS Code.
- `README.md`: dokumentasi pengantar proyek.
- `next-env.d.ts` dan `tsconfig.tsbuildinfo`: berkas pendukung TypeScript yang dihasilkan tooling.