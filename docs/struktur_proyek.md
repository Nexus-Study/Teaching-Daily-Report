# Struktur Proyek Teaching-Daily-Report

Dokumen ini merangkum struktur sumber proyek berdasarkan kondisi workspace saat ini. Direktori hasil instalasi/build (`node_modules/`, `.next/`, `.git/`), file environment lokal, dan artefak sementara tidak dicantumkan.

```text
Teaching-Daily-Report/
├── .env.example
├── .github/
│   └── copilot-instructions.md
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
│   ├── not-found.tsx
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
│           ├── page.tsx
│           ├── siswa-directory.tsx
│           └── [id]/
│               └── perilaku/
│                   └── page.tsx
├── docs/
│   ├── active-progress.md
│   ├── konsep-penanganan-perilaku.md
│   ├── konteks-penggunaan.md
│   ├── pertanyaan.md
│   ├── prasyarat-perlindungan-data-sensitif.md
│   ├── profil-murid.md
│   ├── proyek-ui-slop-evaluasi.md
│   ├── struktur_proyek.md
│   ├── tech_debt
│   ├── tracking-progress.md
│   ├── aktif/
│   │   ├── README.md
│   │   ├── kotak_pasir.md
│   │   ├── refaktor-perilaku.md
│   │   └── konteks/
│   │       ├── sql_schema.md
│   │       └── struktur_folder.png
│   ├── arsip/
│   │   └── review-draf-tiket-tracker-lama.md
│   ├── daftar/
│   │   ├── daftar-skill.md
│   │   ├── konsep.md
│   │   ├── panduan_ekosistem_dokumentasi_proyek_copilot.md
│   │   ├── user_manual.md
│   │   └── user_ui_ux.md
│   ├── legacy/
│   │   └── panduan_github_copilot_solo_developer.md
│   ├── sampel/
│   │   └── eksplorasi_tabel_mobile_card_vs_accordion.html
│   ├── source-of-truth/
│   │   ├── active-work.md
│   │   ├── panduan-kerja-solo-developer-dengan-agen.md
│   │   ├── README.md
│   │   ├── template-github-issue.md
│   │   └── decisions/
│   │       └── README.md
│   └── ss/
│       ├── file.jpe
│       └── file.jpg
├── lib/
│   └── supabase/
│       ├── admin.ts
│       ├── client.ts
│       └── server.ts
├── public/
│   ├── icon-192-maskable.svg
│   ├── icon-192.svg
│   ├── icon-512-maskable.svg
│   ├── icon-512.svg
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
│       ├── 20261016000000_behavior_triage_versioned_edits.sql
│       ├── 20261017000000_profile_360_read_scope.sql
│       ├── 20261017000001_include_reporters_in_behavior_profiles.sql
│       ├── 20261017000002_delete_behavior_record_rbac.sql
│       ├── 20261017000003_create_catatan_perilaku_audit_log_trigger.sql
│       ├── 20261017000004_order_behavior_records_by_latest_activity.sql
│       ├── 20261017000005_add_behavior_rekap_summary_stats.sql
│       ├── 20261017000006_scope_behavior_rekap_summary.sql
│       ├── 20261019000000_drop_ambiguous_submit_catatan_perilaku_overload.sql
│       └── 20261019180000_reconcile_schema_with_live_supabase.sql
└── types/
    └── database.ts
```

## Ringkasan Direktori dan Route

- `app/`: route Next.js App Router, layout, stylesheet global, metadata, dan provider.
- `app/login/`: halaman autentikasi.
- `app/portal/`: shell portal dan fitur setelah pengguna masuk.
- `app/portal/admin/`: halaman administrasi dan Server Actions pengelolaan data.
- `app/portal/jurnal/`: jurnal mengajar dan input presensi.
- `app/portal/laporan/`: halaman dan Server Actions laporan.
- `app/portal/perilaku/`: pencatatan, input, rekap, dan komponen navigasi perilaku.
- `app/portal/profil/`: profil pengguna, tab profil, dan pengaturan keamanan.
- `app/portal/rekap-kehadiran/`: rekap kehadiran.
- `app/portal/siswa/`: direktori murid dan route perilaku per murid (`[id]/perilaku/`).
- `app/portal/components/` dan `app/portal/config/`: komponen shell portal dan konfigurasi menu.
- `lib/supabase/`: pembuatan Supabase client browser, server, dan admin.
- `supabase/migrations/`: perubahan skema, fungsi database, trigger, dan kebijakan yang diberi timestamp.
- `types/`: tipe TypeScript, termasuk model database Supabase.
- `public/`: aset statis, ikon PWA, service worker, serta template impor CSV.
- `docs/`: kebutuhan/konteks produk, dokumentasi teknis, referensi, dan arsip. Status otoritas tiap dokumen dijelaskan di [source-of-truth/README.md](./source-of-truth/README.md).

## File Konfigurasi Utama

- `package.json` dan `package-lock.json`: skrip proyek, metadata, dan dependensi.
- `next.config.mjs`: konfigurasi Next.js dan plugin PWA.
- `tailwind.config.ts` dan `postcss.config.mjs`: konfigurasi styling.
- `tsconfig.json`: konfigurasi TypeScript.
- `proxy.ts`: logika proxy aplikasi.
- `.env.example`: nama variabel environment yang diperlukan; nilai rahasia lokal tidak didokumentasikan.
- `.github/copilot-instructions.md`: instruksi pengembangan untuk agen, termasuk rujukan ke source of truth.
- `README.md`: ringkasan dan petunjuk awal proyek.

## Catatan Skema dan Migration

- [konteks/sql_schema.md](./aktif/konteks/sql_schema.md) adalah snapshot skema yang disalin dari Supabase live. Pertahankan sebagai catatan keadaan aktual.
- Migration adalah urutan perubahan yang dapat membangun database; migration rekonsiliasi bertimestamp terbaru menyelaraskan definisi tabel/constraint yang terkonfirmasi dan memperbarui routine impor kelas yang bergantung pada constraint tersebut, tanpa menulis ulang sejarah migration.
- Snapshot tersebut tidak menginventarisasi semua objek database, termasuk standalone index, RLS, fungsi, dan trigger. Untuk objek itu, periksa migration yang bersangkutan dan verifikasi terhadap Supabase live sebelum menyimpulkan keadaan.
