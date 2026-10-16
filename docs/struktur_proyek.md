# Struktur Proyek Teaching-Daily-Report

Dokumen ini merangkum struktur sumber proyek berdasarkan kondisi workspace saat ini. Direktori hasil instalasi dan build seperti `node_modules/`, `.next/`, dan `.git/`, serta berkas environment lokal tidak dicantumkan.

```text
Teaching-Daily-Report/
├── .env.example
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── proxy.ts
├── tailwind.config.ts
├── tsconfig.json
├── app/
│   ├── globals.css
│   ├── icon.png
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── page.tsx
│   ├── providers.tsx
│   ├── login/
│   │   └── page.tsx
│   └── portal/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── admin/
│       │   ├── actions.ts
│       │   └── page.tsx
│       ├── components/
│       │   ├── confirmation-modal.tsx
│       │   ├── mobile-nav.tsx
│       │   ├── sidebar.tsx
│       │   └── ui-feedback.tsx
│       ├── config/
│       │   └── menu.ts
│       ├── jurnal/
│       │   ├── PresensiSederhana.tsx
│       │   ├── actions.ts
│       │   └── page.tsx
│       ├── laporan/
│       │   ├── actions.ts
│       │   └── page.tsx
│       ├── perilaku/
│       │   ├── actions.ts
│       │   ├── page.tsx
│       │   ├── components/
│       │   │   └── behavior-tabs.tsx
│       │   ├── input/
│       │   │   └── page.tsx
│       │   └── rekap/
│       │       └── page.tsx
│       ├── profil/
│       │   ├── actions.ts
│       │   ├── page.tsx
│       │   └── components/
│       │       ├── profile-tab.tsx
│       │       ├── profile-tabs.tsx
│       │       └── security-tab.tsx
│       ├── rekap-kehadiran/
│       │   └── page.tsx
│       └── siswa/
│           └── [id]/
│               └── perilaku/
│                   └── page.tsx
├── docs/
│   ├── active-progress.md
│   ├── current_ui_design.md
│   ├── struktur_proyek.md
│   ├── tracking-progress.md
│   ├── tech_debt
│   ├── aktif/
│   │   ├── README.md
│   │   ├── kotak_pasir.md
│   │   ├── refaktor-perilaku.md
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
│   ├── daftar/
│   │   ├── konsep.md
│   │   ├── daftar-fix.md
│   │   ├── daftar_feature.md
│   │   ├── menu_profil_problem.md
│   │   ├── panduan_ekosistem_dokumentasi_proyek_copilot.md
│   │   ├── panduan_github_copilot_solo_developer.md
│   │   ├── ui-design-spec.md
│   │   ├── user_manual.md
│   │   └── user_ui_ux.md
│   └── sampel/
│       └── eksplorasi_tabel_mobile_card_vs_accordion.html
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
│       ├── 20261003000000_update_submit_jurnal_and_presensi_tanggal.sql
│       ├── 20261004122849_add_refleksi_and_crud_policies.sql
│       └── 20261016000000_behavior_triage_versioned_edits.sql
└── types/
    └── database.ts
```

## Ringkasan Direktori

- `app/`: App Router Next.js yang berisi route, layout, global stylesheet, serta metadata aplikasi.
- `app/login/`: halaman autentikasi.
- `app/portal/`: layout dan fitur portal setelah pengguna masuk.
- `app/portal/admin/`: halaman dan Server Actions administrasi.
- `app/portal/components/`: navigasi portal, modal konfirmasi, dan umpan balik UI.
- `app/portal/config/`: konfigurasi menu portal.
- `app/portal/jurnal/`: jurnal mengajar serta alur presensi siswa.
- `app/portal/laporan/`: halaman dan Server Actions laporan.
- `app/portal/perilaku/`: catatan perilaku, input, rekap/pagination, serta komponen navigasi perilaku.
- `app/portal/siswa/[id]/perilaku/`: profil dan timeline perilaku per siswa.
- `app/portal/profil/`: profil pengguna, jadwal mengajar, dan pengaturan keamanan.
- `app/portal/rekap-kehadiran/`: rekap kehadiran siswa.
- `docs/aktif/`, `docs/arsip/`, `docs/daftar/`, dan `docs/sampel/`: dokumentasi aktif, historis, referensi, dan contoh.
- `lib/supabase/`: pembuatan klien Supabase untuk browser, server, dan akses admin.
- `public/`: aset statis, ikon PWA, service worker, dan template impor CSV.
- `supabase/migrations/`: migrasi skema, kebijakan akses, dan fungsi database.
- `types/`: tipe TypeScript, termasuk model database Supabase.

## File Konfigurasi Utama

- `package.json` dan `package-lock.json`: metadata proyek, dependensi, dan lockfile. Dependensi UI mencakup Sonner untuk notifikasi toast.
- `next.config.mjs`: konfigurasi Next.js.
- `tailwind.config.ts` dan `postcss.config.mjs`: konfigurasi styling.
- `tsconfig.json`: konfigurasi TypeScript.
- `proxy.ts`: logika proxy aplikasi.
- `.env.example`: contoh nama variabel environment yang diperlukan. Berkas environment lokal tidak dicantumkan atau didokumentasikan nilainya.
- `.vscode/settings.json`: pengaturan workspace VS Code.
- `README.md`: dokumentasi pengantar proyek.
