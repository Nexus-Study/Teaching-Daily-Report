# Konteks Proyek: Catatan & Penanganan Perilaku

Dokumen ini merangkum implementasi yang ditemukan di repositori untuk membantu analisis refaktor pengalaman pengguna, terutama pada perangkat mobile. Fokusnya adalah fakta yang terlihat dari source dan migrasi saat ini; pain point adalah hipotesis teknis/UX untuk ditinjau lebih lanjut, bukan hasil usability test atau audit keamanan formal.

## 1. Ringkasan Arsitektur dan Tech Stack

| Area | Implementasi |
|---|---|
| Framework | Next.js App Router, React 19, TypeScript. Halaman portal menggabungkan Server Components untuk layout/autentikasi dengan Client Components untuk interaksi. |
| Backend | Next.js Server Actions di `app/portal/perilaku/actions.ts`; tidak ditemukan route handler khusus di `app/api/` untuk modul ini. |
| Database | Supabase PostgreSQL, dengan Supabase Auth dan Row Level Security (RLS). Data disimpan di tabel `catatan_perilaku` dan `penanganan_perilaku`; pembuatan catatan memakai fungsi PostgreSQL/RPC. |
| UI / styling | Tailwind CSS dan ikon Lucide React. Tidak ditemukan pustaka komponen UI eksternal seperti shadcn/ui yang dipakai oleh modul ini; kontrol formulir adalah elemen HTML native. |
| State management | State lokal React (`useState`, `useMemo`, `useEffect`) dan `useTransition`. Tidak ditemukan Redux, Zustand, atau state store global untuk modul perilaku. |
| PWA / deployment | Proyek dikonfigurasi sebagai PWA melalui `@ducanh2912/next-pwa`; README menyebut Vercel sebagai target deployment. |
| Integrasi GAS | Tidak ditemukan penggunaan Google Apps Script (`google.script`, `doGet`, `doPost`) atau endpoint GAS dalam source yang dipindai. |

### Model mental sistem

```text
Client page Perilaku
  ├─ Server Action: baca kelas + siswa
  ├─ Server Action: baca catatan + relasi siswa/penanganan
  ├─ Server Action -> Supabase RPC submit_catatan_perilaku
  │    └─ INSERT catatan, opsional INSERT penanganan awal (transaksi DB)
  └─ Server Action -> INSERT penanganan_perilaku (eskalasi berikutnya)

Supabase Auth + RLS mengatur identitas dan akses baris di database.
```

## 2. Struktur Berkas yang Relevan

### UI dan navigasi

- [`app/portal/perilaku/page.tsx`](../../app/portal/perilaku/page.tsx) — halaman client utama: form input, pemuatan daftar siswa/rekap, daftar timeline, ekspansi riwayat, pesan hasil, serta modal penanganan.
- [`app/portal/layout.tsx`](../../app/portal/layout.tsx) — memeriksa sesi autentikasi dan menampilkan shell portal.
- [`app/portal/components/mobile-nav.tsx`](../../app/portal/components/mobile-nav.tsx) — navigasi mobile; menu Perilaku ditampilkan menurut role yang dikonfigurasi.
- [`app/portal/components/sidebar.tsx`](../../app/portal/components/sidebar.tsx) — navigasi desktop berbasis role.
- [`app/portal/config/menu.ts`](../../app/portal/config/menu.ts) — label, URL, ikon, dan role menu Catatan & Penanganan Perilaku.
- [`app/portal/components/ui-feedback.tsx`](../../app/portal/components/ui-feedback.tsx) — komponen toast bersama yang tersedia, tetapi belum digunakan oleh halaman Perilaku.

### Server Actions, akses data, dan laporan

- [`app/portal/perilaku/actions.ts`](../../app/portal/perilaku/actions.ts) — empat operasi utama: baca kelas/siswa, submit catatan, submit penanganan lanjutan, dan baca rekap perilaku.
- [`app/portal/laporan/actions.ts`](../../app/portal/laporan/actions.ts) — membaca tabel perilaku dan penanganannya untuk membuat ringkasan laporan/eskalasi. Ini konsumen data terkait, bukan UI input perilaku.
- [`lib/supabase/server.ts`](../../lib/supabase/server.ts) — helper untuk membuat Supabase client server-side dengan konteks sesi.
- [`lib/supabase/client.ts`](../../lib/supabase/client.ts) — helper Supabase browser yang dipakai komponen navigasi portal; halaman Perilaku sendiri memanggil Server Actions.

### Database, tipe, dan dokumentasi perilaku

- [`supabase/migrations/20260929000001_core_academic_and_behavior.sql`](../../supabase/migrations/20260929000001_core_academic_and_behavior.sql) — enum, tabel, foreign key, RLS untuk kelas/siswa, catatan, dan penanganan; termasuk policy akses perilaku.
- [`supabase/migrations/20260929000003_submit_catatan_perilaku.sql`](../../supabase/migrations/20260929000003_submit_catatan_perilaku.sql) — fungsi `submit_catatan_perilaku` untuk menyimpan catatan dan tindak lanjut awal secara atomik serta constraint unik penanganan.
- [`types/database.ts`](../../types/database.ts) — tipe TypeScript `CatatanPerilaku`, `PenangananPerilaku`, enum perilaku/status, dan deklarasi fungsi RPC.
- [`docs/aktif/konteks/sql_schema.md`](konteks/sql_schema.md) — snapshot skema database yang terdokumentasi; cocokkan dengan migrasi untuk memastikan selalu mutakhir.
- [`docs/daftar/user_manual.md`](../daftar/user_manual.md) — alur penggunaan yang terdokumentasi untuk membuat catatan dan memperbarui penanganan.
- [`docs/arsip/sprint2_schema_core1_core2.md`](../arsip/sprint2_schema_core1_core2.md) — konteks desain awal skema dan RLS Sprint 2.
- [`docs/arsip/prd_fase2_pra_produksi.md`](../arsip/prd_fase2_pra_produksi.md) — konteks kebutuhan awal modul perilaku dan eskalasi.

### API endpoint dan GAS

- Tidak ditemukan Next.js API route/route handler (`app/api/...`) untuk fitur Catatan & Penanganan Perilaku.
- Operasi data dipanggil melalui Server Actions di `app/portal/perilaku/actions.ts`; submit catatan memanggil Supabase RPC `submit_catatan_perilaku`.
- Tidak ditemukan endpoint Google Apps Script atau integrasi GAS. Jika ada proyek GAS eksternal yang tidak berada di repositori ini, detail tersebut belum dapat diverifikasi.

## 3. Alur Kerja dan Implementasi Saat Ini

### 3.1 Memuat form dan data

1. Portal layout memeriksa sesi Supabase Auth; pengguna tanpa sesi diarahkan ke `/login`.
2. Setelah komponen Perilaku dimuat, `useEffect` memanggil `refreshData()`.
3. `refreshData()` menjalankan `getKelasAndSiswaList()` dan `getRekapPerilaku()` secara paralel.
4. Action kelas/siswa membaca seluruh kelas dan siswa yang dapat dibaca pengguna terautentikasi, lalu mengelompokkan siswa menurut `kelas_id`.
5. Action rekap mengambil catatan yang terlihat sesuai RLS, beserta relasi siswa dan semua baris penanganan, diurutkan tanggal terbaru dahulu.
6. Jika belum ada kelas terpilih, UI memilih kelas pertama dari hasil daftar. Daftar siswa pada pilihan siswa kemudian mengikuti kelas terpilih.

### 3.2 Input dan penyimpanan catatan

Form saat ini terdiri dari:

1. Pilih kelas, lalu pilih siswa dari kelas tersebut.
2. Pilih jenis perilaku: **Positif** atau **Pelanggaran**.
3. Isi poin (default `0`) dan tanggal (default menggunakan tanggal ISO UTC dari browser).
4. Tulis deskripsi kejadian; field deskripsi wajib di browser.
5. Secara default, opsi **Tindakan langsung / eskalasi awal** aktif. Jika aktif, form menampilkan tindak lanjut dan status awal.
6. Simpan Catatan Perilaku; tombol dinonaktifkan bila siswa belum dipilih atau proses submit sedang berjalan.

Server Action membaca identitas pengguna, memeriksa bahwa siswa dan deskripsi tersedia, lalu memanggil RPC `submit_catatan_perilaku`. Fungsi database memverifikasi bahwa `p_reporter_id` sama dengan `auth.uid()`, memasukkan baris catatan, lalu—bila teks tindak lanjut tidak kosong—memasukkan penanganan awal dalam operasi database yang sama. Sesudah berhasil, path `/portal/perilaku/` direvalidasi; client menampilkan pesan sukses dan memuat ulang data.

Validasi server action yang terlihat hanya memeriksa siswa dan deskripsi. Nilai poin, tanggal, jenis, status, panjang teks, dan hubungan pilihan kelas-siswa tidak divalidasi secara menyeluruh di action tersebut; tipe enum/database dan constraint tetap menjadi lapisan berikutnya.

### 3.3 Timeline dan penanganan lanjutan

- Rekap ditampilkan sebagai tumpukan kartu (bukan tabel), dengan nama siswa, tanggal, poin, deskripsi, badge jenis perilaku, dan status penanganan terbaru.
- Jika ada tindak lanjut, kartu menampilkan satu penanganan terbaru dan tombol **Ubah Status** selama status belum `selesai`.
- Riwayat lebih lama disembunyikan sampai pengguna menekan **Selengkapnya**. Jika tidak ada tindak lanjut, kartu menyediakan tombol **Tambah Penanganan**.
- Tombol penanganan membuka modal: pada layar kecil modal ditempatkan di bagian bawah; pada breakpoint `md` ke atas modal berada di tengah. Pengguna mengisi tindak lanjut dan status, lalu menyimpan.
- `submitPenangananEskalasi()` memasukkan baris baru ke tabel `penanganan_perilaku` dengan `handler_id` pengguna saat ini dan tanggal dari waktu UTC server/runtime. Setelah berhasil, modal ditutup dan rekap dimuat ulang.
- Status pilihan mencakup `ditangani_di_tempat`, `diteruskan`, `proses`, dan `selesai`. UI menandai status selesai sebagai terkunci dan tidak lagi menyediakan tombol ubah status.

### 3.4 Skema data, otorisasi, dan endpoint data

- `catatan_perilaku`: siswa, pelapor, tanggal, poin, jenis (`positif`/`pelanggaran`), deskripsi, waktu pembuatan.
- `penanganan_perilaku`: catatan, handler, tanggal, uraian tindak lanjut, status eskalasi, `updated_at`.
- `siswa` terhubung ke `kelas`; tabel catatan mengacu pada siswa dan profil pelapor; penanganan mengacu pada catatan dan profil handler.
- Fungsi RPC memastikan identitas pelapor sama dengan user Supabase yang aktif. Policy RLS membatasi pembacaan catatan ke pelapor, wali kelas siswa, dan beberapa role manajemen/BK; penanganan memiliki policy baca/kelola berdasarkan handler, relasi pelapor/wali kelas, dan role yang diizinkan.
- Daftar menu menyertakan `admin`, `guru_bk`, `wali_kelas`, `waka_kesiswaan`, `guru_mapel`, dan `guru_tahfidz`. Policy database dan daftar menu tidak sepenuhnya identik; role seperti `kamad` disebut pada policy baca, tetapi tidak tercantum pada menu Perilaku. Halaman dan action juga tidak memeriksa allowlist role secara eksplisit; action submit memeriksa autentikasi, sedangkan RPC memeriksa bahwa pelapor adalah user saat ini. Perlu dipastikan apakah cakupan ini disengaja dan ditetapkan melalui satu role matrix.
- Kebijakan kelas/siswa mengizinkan pembacaan untuk user terautentikasi. Dengan demikian, daftar siswa bukan dimuat dari daftar yang dibatasi di client menurut kelas bimbingan; pembatasan data perilaku sendiri tetap bergantung pada RLS tabel perilaku.

## 4. Pengalaman Mobile Saat Ini dan Potensi Bottleneck

### Yang sudah mendukung mobile

- Form satu kolom pada lebar kecil dan beralih ke beberapa kolom pada breakpoint `md`/`sm` tertentu.
- Kontrol form, tombol utama, aksi riwayat, dan tombol modal umumnya memiliki tinggi minimum 44 px dan ring fokus.
- Penggunaan kartu untuk timeline menghindari tabel lebar; riwayat lama dapat dilipat sehingga kartu awal tetap relatif ringkas.
- Modal penanganan berpindah ke posisi bawah pada layar kecil, pola yang terasa seperti bottom sheet.

### Risiko dan pain point yang layak diuji

| Area | Observasi kode | Dampak/pertanyaan UX |
|---|---|---|
| Pilihan kelas dan siswa | Native `<select>` kelas dan siswa; daftar siswa lengkap per kelas tanpa pencarian atau autocomplete. | Pada kelas besar, membuka/menelusuri pilihan siswa dengan satu tangan dapat memakan waktu. Uji kebutuhan pencarian, recent/favorite, dan aksesibilitas native picker sebelum mengganti kontrol. |
| Form panjang | Form input dan tindakan awal ditampilkan dalam satu alur vertikal. Tindakan awal aktif secara default sehingga dua field tambahan langsung terlihat. | Pengguna yang hanya ingin mencatat harus melewati banyak kontrol dan menggulir. Pertimbangkan progressive disclosure dan default tindakan awal berdasarkan kebutuhan pengguna. |
| Input jenis | Jenis dipilih menggunakan dua tombol biasa, tanpa `aria-pressed`/radio group yang menyatakan pilihan kepada teknologi bantu. | Status pilihan visual perlu diuji untuk keyboard dan screen reader; kontrol semantik radio dapat menjadi alternatif. |
| Pemuatan awal | Semua kelas/siswa dan rekap diambil bersamaan setelah render client. Belum ada state loading khusus untuk data awal; tombol Muat Ulang tidak menampilkan state loading tersendiri. | Pada koneksi mobile lambat, layar dapat tampak kosong/tidak responsif sementara fetch berjalan. Perlu indikator progres, retry yang jelas, dan evaluasi apakah semua data perlu dimuat sebelum form dapat dipakai. |
| Ukuran payload dan daftar | `getRekapPerilaku()` mengambil semua catatan yang terlihat tanpa filter tanggal, batas jumlah, atau pagination dan mengikutsertakan seluruh riwayat penanganan. Semua kartu dirender sekaligus. | Payload, waktu render, panjang scroll, dan penggunaan memori akan tumbuh seiring jumlah catatan. Ukur dengan data produksi representatif; pertimbangkan pagination/cursor, filter tanggal/status/kelas, atau virtualisasi bila diperlukan. |
| Filter dan pencarian rekap | Tidak terlihat kontrol pencarian/filter pada timeline. Ikon `Filter` di form hanya menjadi ikon heading tindakan awal, bukan filter daftar. | Sulit menemukan catatan tertentu ketika rekap sudah panjang; perlu validasi kebutuhan dan dimensi filter sebelum merancang ulang. |
| Refresh data | Pengguna perlu menekan Muat Ulang untuk refresh manual; submit dan simpan penanganan juga memuat ulang daftar secara penuh. | Reload seluruh dataset setelah perubahan dapat memperlama alur dibanding memperbarui kartu lokal atau mengambil perubahan terarah. |
| Modal/bottom sheet | Pada mobile modal ditempatkan di bawah, tetapi wrapper/konten belum tampak memiliki batas tinggi dan `overflow-y-auto`. Implementasi modal lokal belum menunjukkan `role="dialog"`, `aria-modal`, Escape, focus trap, atau pemulihan fokus. | Keyboard virtual dapat menutupi field; konten kecil layar mungkin memerlukan scroll yang tidak nyaman. Perlu uji viewport pendek/zoom dan aksesibilitas modal. |
| Kegagalan simpan modal | `onSave` memanggil action async dari callback tanpa penanganan error lokal pada modal; pesan error pada modal tidak tampak. | Kegagalan jaringan/constraint berisiko tidak memberi umpan balik yang jelas atau meninggalkan pengguna tanpa jalur retry yang eksplisit. |
| Semantik umpan balik | Pesan sukses/error pada halaman ditampilkan sebagai `<p>` biasa, tidak terlihat `role="status"` atau `role="alert"`; loading submit memakai spinner dan label tombol. | Pembaca layar mungkin tidak menerima pengumuman perubahan status yang konsisten. Toast bersama sudah ada tetapi belum digunakan di halaman ini. |
| Waktu/tanggal | Default form dan tanggal penanganan dibuat melalui `toISOString().slice(0, 10)`; tampilan waktu tertentu diformat dengan zona `Asia/Jayapura`. | Tanggal ISO berbasis UTC dapat berbeda dari tanggal lokal di sekitar pergantian hari. Timestamp terbaru pada kartu juga perlu diverifikasi terhadap waktu penanganan aktual, bukan waktu render. |
| Constraint penanganan | DB memiliki constraint unik `(catatan_id, handler_id, tanggal)`, sementara action menambahkan baris baru untuk setiap perubahan status dan tidak melakukan update/upsert. | Perubahan kedua oleh handler yang sama pada catatan yang sama dalam tanggal yang sama dapat ditolak constraint. Perjelas apakah riwayat perubahan dimaksudkan sebagai event baru atau memperbarui entri hari itu. |
| Akses role | Role menu, policy RLS, serta keanggotaan role di `user_role` perlu dicocokkan. Route page sendiri tidak menunjukkan pemeriksaan role eksplisit; akses data disaring di lapisan RLS. | Role yang tidak muncul di menu bisa punya hak DB atau akses langsung yang berbeda. Nexus Architect perlu menetapkan role matrix yang menjadi sumber kebenaran. |

Pain point di atas perlu diprioritaskan melalui wawancara/observasi guru dan pengukuran dataset/performa; jangan langsung dianggap sebagai keputusan desain yang sudah disepakati.

## 5. Berkas Prioritas untuk Nexus Architect

### Prioritas 1 — Alur UI dan perilaku

1. [`app/portal/perilaku/page.tsx`](../../app/portal/perilaku/page.tsx) — sumber utama untuk form, interaksi, timeline, loading/error, ekspansi, dan modal mobile.
2. [`app/portal/perilaku/actions.ts`](../../app/portal/perilaku/actions.ts) — kontrak data, validasi, query, dan pola submit/refresh.
3. [`supabase/migrations/20260929000001_core_academic_and_behavior.sql`](../../supabase/migrations/20260929000001_core_academic_and_behavior.sql) — model relasi, enum, dan RLS yang menentukan akses lintas role.
4. [`supabase/migrations/20260929000003_submit_catatan_perilaku.sql`](../../supabase/migrations/20260929000003_submit_catatan_perilaku.sql) — atomic write catatan + tindak lanjut awal dan constraint unik.

### Prioritas 2 — Kontrak dan konteks produk

5. [`types/database.ts`](../../types/database.ts) — tipe data dan kontrak RPC yang dipakai TypeScript.
6. [`app/portal/config/menu.ts`](../../app/portal/config/menu.ts) — pemetaan role yang melihat menu Perilaku.
7. [`app/portal/layout.tsx`](../../app/portal/layout.tsx), [`app/portal/components/mobile-nav.tsx`](../../app/portal/components/mobile-nav.tsx), dan [`app/portal/components/sidebar.tsx`](../../app/portal/components/sidebar.tsx) — shell portal, navigasi, dan perilaku menu mobile/desktop.
8. [`app/portal/laporan/actions.ts`](../../app/portal/laporan/actions.ts) — konsumen lain dari data catatan dan status eskalasi.
9. [`docs/daftar/user_manual.md`](../daftar/user_manual.md), [`docs/aktif/konteks/sql_schema.md`](konteks/sql_schema.md), dan [`docs/arsip/prd_fase2_pra_produksi.md`](../arsip/prd_fase2_pra_produksi.md) — kebutuhan pengguna, snapshot skema, dan sasaran desain historis.

### Pertanyaan arsitektur yang perlu diputuskan sebelum backlog

- Siapa aktor utama yang membuat catatan, dan apakah kelas/siswa harus dibatasi menurut role atau relasi kelas?
- Apakah tindak lanjut dimaksudkan sebagai event immutable untuk audit trail, atau sebagai status/record yang diperbarui?
- Apakah catatan harus dapat dicari/filter berdasarkan siswa, kelas, tanggal, jenis, atau status?
- Berapa volume catatan dan riwayat yang diharapkan; apakah pagination diperlukan sekarang?
- Apakah tindakan awal wajib untuk kategori tertentu, atau memang opsional? Bagaimana default yang paling cepat namun aman?
- Apa aturan tanggal/waktu resmi aplikasi (zona waktu sekolah) untuk tanggal kejadian, tanggal tindakan, dan tampilan timeline?
- Bagaimana modal mobile, pesan error, retry, dan navigasi keyboard/screen reader harus berperilaku?

## 6. Ringkasan untuk Perencanaan

Modul saat ini sudah menyediakan pencatatan perilaku positif/pelanggaran, penanganan awal opsional, timeline berjenjang, dan pembacaan berbasis RLS. Implementasi UX relatif sederhana dan responsif secara layout, tetapi alur pemuatan mengambil dataset penuh, belum tersedia pencarian/filter, dan modal/feedback memiliki celah yang perlu diuji khusus mobile. Prioritas sebelum membuat tiket adalah menyepakati role matrix, makna riwayat penanganan, kebutuhan filter/pagination, serta aturan tanggal. Belum ada endpoint GAS/API tersendiri atau state manager global yang perlu dimigrasikan.
