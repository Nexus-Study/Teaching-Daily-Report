b # Evaluasi Potensi UI Slop Proyek

**Tanggal evaluasi:** 18 Oktober 2026
**Metode:** inspeksi source code, TypeScript, production build, serta smoke test browser lokal pada halaman Login, skip-link, dan 404. Rute portal yang memerlukan sesi tidak diuji melalui browser.
**Kesimpulan:** perbaikan kode untuk state laporan, modalitas drawer/dialog Admin, landmark utama, judul Admin, feedback sign out, skip-link, dan halaman 404 sudah diterapkan. TypeScript dan production build lulus. Pengujian browser hanya mengonfirmasi halaman publik, skip-link dengan keyboard, dan fallback 404; interaksi rute terlindungi belum diuji. Pengulangan panel/eyebrow dan sebagian warna literal masih merupakan peluang penyempurnaan visual, bukan penghambat fungsi yang telah terverifikasi.

## Cakupan dan batasan

Inspeksi mencakup fondasi global dan Tailwind, login, portal utama, navigasi desktop/mobile, jurnal dan presensi, input serta rekap perilaku, laporan, rekap kehadiran, direktori dan Profil 360 siswa, profil dan keamanan akun, admin, serta komponen modal/feedback. Rute yang ditinjau melalui source: `/`, `/login`, `/portal`, `/portal/jurnal`, `/portal/perilaku`, `/portal/perilaku/input`, `/portal/perilaku/rekap`, `/portal/laporan`, `/portal/rekap-kehadiran`, `/portal/siswa`, `/portal/siswa/[id]/perilaku`, `/portal/profil`, dan `/portal/admin`.

Smoke test browser lokal berhasil memuat halaman Login, memindahkan fokus dengan `Tab` ke skip-link, dan mengaktifkan tautannya ke `#main-content`. Rute yang tidak tersedia menampilkan halaman 404 bermerek. Interaksi halaman portal, navigasi drawer, serta dialog Admin tidak diuji melalui browser karena memerlukan sesi masuk; tidak ada data formulir yang dikirim atau diubah. Halaman Admin tetap ditinjau dari source; konfigurasi menu membatasi aksesnya ke role `admin`.

Temuan rute terlindungi di bawah bersumber dari inspeksi statis, bukan pengujian interaksi langsung. Klaim pengukuran viewport dan durasi pemuatan dari evaluasi terdahulu tidak dipertahankan karena tidak dapat diverifikasi ulang pada sesi ini. Tidak dilakukan pengukuran kontras otomatis atau klaim konformansi WCAG.

## Temuan

| # | Severity | Lokasi / bukti | Temuan dan dampak | Status | Confidence |
|---|---|---|---|---|---|
| 1 | MEDIUM | [app/portal/laporan/page.tsx](../app/portal/laporan/page.tsx#L24), [app/portal/laporan/page.tsx](../app/portal/laporan/page.tsx#L58), [app/portal/laporan/page.tsx](../app/portal/laporan/page.tsx#L184) | Kartu metrik dan daftar sebelumnya dapat menampilkan nol atau empty sebelum respons laporan valid, dan respons lama berisiko menimpa filter baru. | **Diperbaiki di source:** hasil hanya ditampilkan untuk key filter yang cocok; status memuat/error dipisahkan dari data kosong dan permintaan lama diabaikan. Belum diuji dengan sesi portal browser. | 9/10 |
| 2 | MEDIUM | [app/portal/components/mobile-nav.tsx](../app/portal/components/mobile-nav.tsx#L64), [app/portal/components/mobile-nav.tsx](../app/portal/components/mobile-nav.tsx#L150) | Drawer sebelumnya tidak memodelkan modalitas fokus sepenuhnya. | **Diterapkan di source:** `<dialog>.showModal()` memberikan modalitas/focus trap native; fokus awal, Escape, pemulihan fokus, penutupan drawer, dan pencegahan penutupan saat logout berjalan ditangani. Belum diuji dalam sesi portal browser. | 9/10 |
| 3 | MEDIUM | [app/portal/layout.tsx](../app/portal/layout.tsx#L29), [app/portal/page.tsx](../app/portal/page.tsx#L49), [app/portal/laporan/page.tsx](../app/portal/laporan/page.tsx#L106) | Layout portal dan halaman anak sebelumnya menghasilkan landmark utama bersarang. | **Diperbaiki:** layout memakai wrapper non-landmark; halaman menyediakan `<main id="main-content">`. | 10/10 |
| 4 | MEDIUM | [app/portal/admin/page.tsx](../app/portal/admin/page.tsx#L54), [app/portal/admin/page.tsx](../app/portal/admin/page.tsx#L855), [app/portal/admin/page.tsx](../app/portal/admin/page.tsx#L961) | Empat dialog Admin sebelumnya tidak memiliki pengelolaan fokus yang sebanding dengan modal bersama. | **Diterapkan di source:** keempatnya memakai dialog native dengan fokus awal, Escape saat tidak sibuk, dan pemulihan fokus. Belum diuji dalam sesi portal browser. | 8/10 |
| 5 | LOW | [app/portal/page.tsx](../app/portal/page.tsx#L49), [app/portal/perilaku/input/page.tsx](../app/portal/perilaku/input/page.tsx#L171), [app/portal/laporan/page.tsx](../app/portal/laporan/page.tsx#L106) | Beberapa halaman masih mengulang header panel, radius besar, border/bayangan, tile ikon, dan eyebrow kecil. Pola konsisten itu berpotensi mengaburkan prioritas antar tugas, tetapi tidak membuktikan kegagalan usability. | **Masih menjadi peluang visual:** halaman Admin dan ringkasan laporan dirapikan secara terbatas; audit visual portal secara menyeluruh membutuhkan sesi browser terautentikasi dan bukan bagian dari smoke test ini. | 8/10 |
| 6 | LOW | [app/portal/components/mobile-nav.tsx](../app/portal/components/mobile-nav.tsx#L108), [app/portal/components/sidebar.tsx](../app/portal/components/sidebar.tsx#L47), [app/globals.css](../app/globals.css#L12), [app/providers.tsx](../app/providers.tsx#L1) | Sebagian warna literal masih digunakan; konfigurasi tema global tetap berorientasi light sementara provider `next-themes` tidak dipakai pada root. | **Sebagian ditangani:** shell navigasi memakai token semantik pada permukaan/fokus. Tema terang dipertahankan; provider/dependency dan warna status literal tidak dihapus tanpa tinjauan penggunaan/kontras lebih luas. | 7/10 |
| 7 | LOW | [app/portal/admin/page.tsx](../app/portal/admin/page.tsx#L385) | Eyebrow dan H1 Admin sebelumnya mengulang judul yang sama. | **Diperbaiki:** eyebrow sekarang “Administrasi” dan H1 “Kelola data master”. | 10/10 |
| 8 | LOW | [app/portal/components/sidebar.tsx](../app/portal/components/sidebar.tsx#L53), [app/portal/components/sidebar.tsx](../app/portal/components/sidebar.tsx#L89) | Kegagalan sign out desktop tidak memberi umpan balik dan status collapse tidak diumumkan. | **Diperbaiki di source:** pesan error tampil sebagai alert; tombol collapse menyatakan `aria-expanded` dan mengontrol navigasi. | 8/10 |
| 9 | LOW | [app/layout.tsx](../app/layout.tsx#L22), [app/not-found.tsx](../app/not-found.tsx#L5) | Tidak tersedia skip-link dan fallback 404 khusus. | **Diterapkan dan smoke-tested:** skip-link fokus/Enter berpindah ke `#main-content`; rute tak dikenal menampilkan 404 bermerek. | 7/10 |

## Pola checklist yang diperiksa

- Tidak ditemukan radial gradient ungu/indigo, penggunaan emoji sebagai ikon fungsi, URL placeholder gambar, atau angka vanity seperti `99.9% uptime` pada source UI yang ditinjau.
- Angka laporan berasal dari objek data laporan, bukan statistik pemasaran yang tampak dibuat-buat. Tampilan angka nol dan empty kini bergantung pada respons yang valid; pengujian alur data tetap memerlukan sesi portal.
- Filter laporan disusun di satu area tingkat halaman, bukan digandakan pada setiap kartu. Tabel rekap kehadiran menyediakan region yang dapat difokuskan serta petunjuk gulir horizontal pada layar kecil.
- Grid menu portal adalah navigasi berbasis role dengan dua hingga empat kolom responsif, bukan baris tiga kartu fitur pemasaran. Bentuk grid itu sendiri tidak dinilai sebagai pola slop.
- Ikon antarmuka menggunakan `lucide-react`. Ini pilihan yang koheren dan tidak dianggap bug; variasi ikon khusus/alternatif hanya peluang diferensiasi bila ada alasan brand yang jelas.
- Tidak ditemukan `prefers-reduced-motion` pada fondasi CSS meskipun ada spinner, transisi, dan pengguliran halus pada beberapa alur. Perilaku gerak tidak dapat diuji langsung; pertimbangkan dukungan reduced motion ketika mengubah animasi atau efek transisi.

## Hal yang sudah baik

- Fondasi global mendefinisikan token warna semantik dan fokus `:focus-visible`; sebagian besar form memakai label yang terhubung, target kontrol sekitar 44 px atau lebih, dan state disabled.
- Login memakai `autocomplete`, validasi dasar browser, tombol tampil/sembunyikan kata sandi, dan pesan error `role="alert"`.
- Navigasi role-aware menandai rute aktif dengan `aria-current`; navigasi mobile memakai nama dan label yang dapat dibaca, serta tombol pemicu drawer menyatakan `aria-expanded`.
- Direktori siswa menyediakan pencarian/filter dan jumlah hasil `aria-live`; tabel kehadiran memberi petunjuk gulir pada layar sempit.
- Komponen [confirmation-modal.tsx](../app/portal/components/confirmation-modal.tsx) sudah mengelola fokus awal, siklus Tab, Escape, dan pemulihan fokus—pola yang dapat digunakan kembali pada dialog lain.
- Form jurnal dan input perilaku menyertakan alur konfirmasi/validasi dan umpan balik proses; beberapa layar memiliki state loading, empty, dan error yang relevan.
- Produk memakai informasi operasional nyata seperti jumlah jurnal, presensi, dan status penanganan, bukan kartu vanity metrics.

## Prioritas tindak lanjut

1. Dengan sesi portal yang berwenang, uji drawer dan empat dialog Admin menggunakan Tab/Shift+Tab, Escape, pemulihan fokus, serta kondisi aksi sedang berjalan.
2. Lakukan inspeksi visual halaman portal di viewport mobile/desktop dan tinjau pengulangan panel, label kecil, serta warna literal secara selektif.
3. Tinjau konsistensi lint tooling: script `lint` saat ini menjalankan `next lint`, yang tidak dikenali sebagai perintah lint pada Next.js 16; pemanggilan ESLint langsung juga belum memiliki konfigurasi ESLint yang dapat digunakan.
4. Jika melanjutkan audit aksesibilitas, uji zoom 200%, reduced motion, screen reader, dan kontras terukur. Jangan menyatakan konformansi WCAG sebelum pengujian yang sesuai dilakukan.

## Validasi implementasi

- `npx tsc --noEmit` — lulus.
- `npm run build` — lulus; seluruh rute berhasil dibangun.
- Smoke test browser lokal — halaman Login dan 404 termuat; skip-link dapat difokuskan dengan `Tab` dan mengarahkan fokus ke `main#main-content`.
- `npm run lint` — tidak dapat dijalankan karena script memanggil `next lint`, yang Next.js 16 menafsirkan `lint` sebagai direktori proyek.
- ESLint langsung — belum dapat dijalankan karena repository tidak menyediakan `eslint.config.*`; tidak ada konfigurasi baru yang ditambahkan dalam pekerjaan ini.
- Interaksi portal dan perubahan data tidak diuji; tidak ada data formulir yang dikirim atau diubah.

## Referensi

- [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/) — kriteria aksesibilitas yang dapat diuji; laporan ini tidak mengklaim konformansi.
- [10 Usability Heuristics — Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/) — kerangka evaluasi heuristik, bukan pengganti riset pengguna.
- [Web Vitals — web.dev](https://web.dev/articles/vitals) — metrik performa yang hanya sepatutnya dilaporkan setelah pengukuran.
