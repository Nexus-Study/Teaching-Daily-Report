# Audit Desain UI Saat Ini

## Ringkasan

**Kesimpulan: implementasi UI saat ini baru sebagian sesuai dengan [spesifikasi desain UI](./ui-design-spec.md); belum dapat dinyatakan memenuhi seluruh spesifikasi atau WCAG 2.1 AA.**

Fondasi UI sudah memiliki beberapa praktik yang baik: sebagian besar halaman memakai layout mobile-first, formulir umumnya memiliki label, dan banyak alur menampilkan status loading, error, atau empty state. Sistem Light/Dark dan dukungan zoom kini telah ditambahkan, tetapi penerapan token tema dan bahasa visual masih belum konsisten di seluruh halaman; beberapa kontrol juga masih lebih kecil dari target sentuh minimum dan pola keyboard/modal perlu diperbaiki.

Audit ini menggabungkan pemeriksaan source code dengan pengujian browser pada Login dan rute portal menggunakan sesi tes. Pengujian mencakup tema Light/Dark dan viewport mobile untuk halaman portal utama; temuan kontras dan error runtime tercatat di bawah.

## Cakupan Audit

Pemeriksaan mencakup fondasi global dan layar utama yang tersedia:

- Fondasi: [`app/layout.tsx`](../layout.tsx), [`app/globals.css`](../globals.css), [`tailwind.config.ts`](../../tailwind.config.ts), dan [`package.json`](../../package.json).
- Autentikasi dan navigasi: [`app/login/page.tsx`](../login/page.tsx), [`app/portal/page.tsx`](../portal/page.tsx), [`app/portal/components/mobile-nav.tsx`](../portal/components/mobile-nav.tsx), dan [`app/portal/components/sidebar.tsx`](../portal/components/sidebar.tsx).
- Fitur portal: [`app/portal/jurnal/page.tsx`](../portal/jurnal/page.tsx), [`app/portal/rekap-kehadiran/page.tsx`](../portal/rekap-kehadiran/page.tsx), [`app/portal/laporan/page.tsx`](../portal/laporan/page.tsx), [`app/portal/perilaku/page.tsx`](../portal/perilaku/page.tsx), dan [`app/portal/admin/page.tsx`](../portal/admin/page.tsx).
- Profil dan komponen terkait: [`app/portal/profil/page.tsx`](../portal/profil/page.tsx), [`app/portal/profil/components/profile-tabs.tsx`](../portal/profil/components/profile-tabs.tsx), [`app/portal/profil/components/profile-tab.tsx`](../portal/profil/components/profile-tab.tsx), [`app/portal/profil/components/security-tab.tsx`](../portal/profil/components/security-tab.tsx), [`app/portal/components/confirmation-modal.tsx`](../portal/components/confirmation-modal.tsx), dan [`app/portal/jurnal/PresensiSederhana.tsx`](../portal/jurnal/PresensiSederhana.tsx).

## Validasi Browser dan Kontras Otomatis

- Audit dilakukan pada production build terkini di port 3001 karena port 3000 sudah dipakai server lama. Rute portal utama diuji dengan sesi tes yang sah pada viewport mobile 390 × 844 CSS px dalam Light dan Dark; lebar layout terukur 376 px dan tidak ditemukan overflow horizontal. Kehadiran juga diperiksa pada desktop 1440 × 900 CSS px tanpa overflow.
- Rute/variasi yang diperiksa: Portal, Jurnal, Perilaku, Laporan, kedua tab Rekap Kehadiran, kedua tab Profil, serta fallback daftar siswa/guru di Admin. Aksi pemuatan data Admin ditolak karena akun tes tidak memiliki hak admin, sehingga tampilan Admin berisi fallback error/empty state dan bukan audit alur admin berizin. Screenshot browser meninjau layout representatif pada Home, Jurnal, Perilaku, Rekap Kehadiran, dan tema gelap.
- Pengukuran otomatis memakai warna teks dan latar hasil komputasi DOM, termasuk pseudo-element placeholder. Ambang yang dipakai 4.5:1 untuk teks normal dan 3:1 untuk teks besar. Temuan gagal yang terukur:

| Halaman/variasi | Tema | Pasangan teks/latar | Rasio | Ambang |
|---|---|---|---:|---:|
| Jurnal — tombol Simpan Jurnal & Presensi | Light/Dark | Putih / teal-600 (`#0d9488`) | **3.74:1** | 4.5:1 |
| Perilaku — tombol Simpan Catatan Perilaku | Light/Dark | Putih / rose-500 (`#f43f5e`) | **3.67:1** | 4.5:1 |
| Perilaku — placeholder textarea | Light | gray-400 (`#9ca3af`) / putih | **2.54:1** | 4.5:1 |
| Perilaku — label Timeline Eskalasi Terbaru | Light | slate-500 (`#64748b`) / slate-100 (`#f1f5f9`) | **4.34:1** | 4.5:1 |
| Laporan — label kartu dan empty state | Light | slate-500 (`#64748b`) / slate-100 (`#f1f5f9`) | **4.34:1** | 4.5:1 |
| Admin — label daftar dan placeholder pencarian | Light | slate-500 (`#64748b`) / slate-100 (`#f1f5f9`) | **4.34:1** | 4.5:1 |

- Sampel yang diperiksa di Home, Rekap Kehadiran (kedua tab), Profil (kedua tab), serta Laporan, Perilaku, dan Admin pada Dark tidak menunjukkan kegagalan rasio. Ini bukan sertifikasi untuk seluruh state: konten di atas latar gradien/transparansi kompleks dan state hover/disabled tidak seluruhnya terukur.
- Kicker Login Dark (2.66:1) dan placeholder Login Light (2.54:1) yang ditemukan pada audit sebelumnya telah diperbaiki dengan token `--primary-text` dan `--text-placeholder`; sampel Login kini lulus di kedua tema.
- Pada Jurnal, kontrol utama yang diukur berukuran setidaknya 44 px; checkbox preferensi jadwal masih memakai kotak native kecil dan perlu area sentuh label yang memadai. Ring fokus Login sebelumnya teruji, tetapi urutan fokus seluruh portal belum diperiksa.
- Browser mencatat React hydration error **#418** yang menyebut `HTML` pada beberapa navigasi portal. Pada Admin muncul React error **#441** dan permintaan pemuatan data mengembalikan HTTP 500; log server menjelaskan akses ditolak karena hanya admin yang berhak mengelola data master. Fallback/error handling Admin tetap perlu diperiksa dengan akun yang berizin; hasil kontras Admin di atas hanya berlaku untuk fallback yang tampil.

## Temuan per Aspek

### 1. Arsitektur, Tema, dan Design Tokens

**Status: sebagian sesuai.**

- [`app/globals.css`](../globals.css) menetapkan CSS variables Light/Dark untuk latar, surface, teks, batas, warna primer, fokus, dan error. [`app/providers.tsx`](../providers.tsx) memakai `next-themes` dengan Light sebagai default dan menyimpan pilihan tema.
- [`tailwind.config.ts`](../../tailwind.config.ts) menggunakan `darkMode: 'class'` dan menyediakan alias warna semantik. Komponen UI menggunakan pasangan kelas light/dark; migrasi token semantik masih dapat diteruskan untuk mengurangi warna literal yang berulang.
- Komponen halaman dan formulir utama kini menyesuaikan warna netral serta state ketika tema berubah. Aksen warna status tetap dibedakan menurut fungsi dan memiliki pasangan warna untuk kedua tema. Halaman login menggunakan CSS variables, bukan palette gelap inline yang terpisah.
- Tipografi sebagian besar memakai kelas Tailwind yang umum, tetapi ukuran kecil seperti `text-[11px]`, `text-[10px]`, dan `text-xs` cukup sering muncul pada label, status, dan kontrol. Penggunaan teks kecil perlu ditinjau agar informasi penting tetap nyaman dibaca dan lolos kontras.
- Breakpoint Tailwind seperti `sm`, `md`, `lg`, dan `xl`, kontainer dengan lebar maksimum, serta layout satu atau beberapa kolom sudah digunakan. Tabel rekap menggunakan gulir horizontal, yang lebih baik daripada memotong kolom, tetapi tetap perlu diuji dengan keyboard dan pada viewport sempit.
- Tidak ditemukan implementasi komponen Shadcn UI dalam dependensi atau struktur komponen saat ini. Komponen UI yang diperiksa berupa HTML/native controls dan komponen Tailwind buatan proyek. Ini bukan kegagalan terhadap spesifikasi yang menyebut Shadcn sebagai rekomendasi, tetapi perlu dipahami sebagai status implementasi saat ini.

### 2. Komponen dan UI States

**Status: sebagian sesuai.**

- Input dan select native digunakan secara luas. Label terlihat dan sering dibungkus langsung bersama kontrol, sehingga hubungan label-kontrol umumnya jelas.
- Banyak alur formulir menampilkan indikator pemuatan dan menonaktifkan tombol saat proses berlangsung. Halaman seperti jurnal, rekap kehadiran, admin, perilaku, dan profil juga menyediakan sejumlah empty state dan pesan error.
- Tidak ditemukan sistem Toast atau Skeleton Loader yang digunakan bersama. Sebagian besar status pemuatan memakai spinner dan teks. Ini dapat diterima sebagai pola saat ini, tetapi pesan status async perlu memiliki semantik aksesibel yang konsisten; Skeleton Loader dalam spesifikasi belum diterapkan.
- Penanganan error belum konsisten. Beberapa pesan diberi `role="alert"` atau live region, sementara error pada halaman lain hanya tampil sebagai paragraf/div biasa. Beberapa empty state juga hanya berupa kalimat singkat tanpa petunjuk langkah berikutnya.
- State hover, active, dan disabled tersedia pada banyak tombol, tetapi tidak seragam. Sejumlah input menggunakan `outline-none` dan hanya mengubah border saat fokus, alih-alih menampilkan ring fokus yang jelas sesuai spesifikasi.
- Kontrol interaktif kecil masih ditemukan, misalnya tombol navigasi/kolaps sidebar `h-9 w-9`, tombol tutup drawer `h-9 w-9`, dan beberapa tombol aksi pada halaman selain Jurnal. Ukuran ini di bawah target 44 × 44px. Toggle tema dan tombol menu mobile kini berukuran `h-11 w-11`; kontrol utama pada form presensi cepat Jurnal juga telah diperbesar.

### 3. Aksesibilitas dan Usabilitas

**Status: perlu penyesuaian.**

- [`app/layout.tsx`](../layout.tsx) tidak lagi membatasi `maximumScale` atau `userScalable`, sehingga zoom pengguna pada perangkat mobile diizinkan.
- Fokus keyboard belum konsisten di seluruh kontrol. Sidebar, tombol navigasi, dan beberapa kontrol jurnal/modal memiliki indikator fokus eksplisit; field atau tombol lain masih perlu diperiksa agar ring fokus terlihat jelas dalam kedua tema.
- Pola dialog custom sudah menyertakan atribut seperti `role="dialog"`, `aria-modal`, dan label judul pada beberapa tempat. Akan tetapi, implementasi yang diperiksa tidak menunjukkan pengelolaan fokus lengkap berupa fokus awal, focus trap, dan pengembalian fokus ke pemicu. Drawer navigasi mobile juga belum menunjukkan penanganan `Escape` yang setara. Perilaku tersebut perlu diuji dan dilengkapi.
- Tab profil telah memakai `tablist`, `tab`, `tabpanel`, dan `aria-selected`, tetapi navigasi tombol panah/roving focus belum tampak. Tab halaman admin belum memakai semantik tab ARIA yang sepadan. Audit dan lengkapi keyboard behavior untuk seluruh pola tab.
- Dukungan zoom telah diperbaiki. Pengukuran browser menemukan beberapa kegagalan kontras Light/Dark di halaman portal (lihat tabel di atas); gradien, kombinasi transparan kompleks, hover, dan disabled belum seluruhnya terukur.
- Animasi/transisi digunakan pada beberapa elemen; belum terlihat penanganan menyeluruh untuk `prefers-reduced-motion`.

## Matriks Audit UI

Status berikut menggabungkan penilaian source code dan browser pada cakupan yang dicatat di atas. `Pass` berarti praktik dasar lulus pada state yang diperiksa, bukan sertifikasi seluruh halaman atau seluruh state.

| Aspek | Parameter Uji | Status (Pass/Fail/Needs Adjustment) | Catatan Perbaikan |
|---|---|---|---|
| Visual Hierarchy | Judul dan bagian konten menggunakan hirarki yang dapat dipahami. | Needs Adjustment | Pola judul cukup jelas di kebanyakan halaman, tetapi ukuran teks kecil dan treatment header berbeda antarfitur; selaraskan dengan skala tipografi pada spesifikasi. |
| Visual Hierarchy | Warna, surface, dan komponen mengikuti tema yang konsisten lintas halaman. | Needs Adjustment | Tema Light/Dark dan pasangan warna telah diterapkan pada komponen utama, tetapi konsistensi visual seluruh rute belum dikonfirmasi di browser. |
| Consistency | Spacing dan breakpoint responsif digunakan secara terstruktur. | Pass | Utility spacing dan breakpoint Tailwind sudah digunakan di berbagai halaman; tetap uji tabel, dialog, dan grid pada perangkat kecil. |
| Consistency | Warna, tipografi, dan komponen standar dipusatkan dan digunakan ulang. | Needs Adjustment | Nilai warna tersebar dalam class dan style inline; belum ada token semantik atau pustaka komponen standar bersama. Shadcn UI belum diadopsi. |
| Feedback & States | Loading, error, disabled, dan empty state tersedia pada alur data penting. | Fail | Pola pesan/semantik belum konsisten; pada audit browser Admin menampilkan React error #441 dan request data HTTP 500, sedangkan navigasi beberapa rute mencatat React hydration error #418. |
| Feedback & States | State fokus keyboard dan status async dapat dikenali dengan jelas. | Needs Adjustment | Sejumlah input hanya mengubah border saat fokus; sebagian pesan error tidak memakai live region dan status loading belum konsisten memakai `aria-busy`. |
| Accessibility | Zoom, keyboard, semantik kontrol, serta perilaku dialog/tab memenuhi kebutuhan aksesibilitas. | Needs Adjustment | Zoom kini diizinkan dan ring fokus Login terlihat; dialog/tab custom masih perlu focus management dan keyboard behavior lengkap serta belum diuji di browser. |
| Accessibility | Kontras warna dan target sentuh memenuhi baseline WCAG 2.1 AA dan target 44 × 44px. | Fail | Ditemukan kegagalan 2.54:1–4.34:1 pada placeholder/tombol/teks sekunder Light, serta tombol utama 3.67:1–3.74:1 pada kedua tema. Perbesar area sentuh checkbox Jurnal. |
| Error Prevention | Formulir memberi label dan umpan balik validasi yang dapat dipahami. | Needs Adjustment | Label umumnya tersedia dan banyak field memakai validasi native, tetapi penyajian serta pengumuman error berbeda antarhalaman. Hubungkan error ke field terkait. |
| Error Prevention | Aksi destruktif memiliki konfirmasi, konsekuensi, dan opsi batal yang jelas. | Needs Adjustment | Beberapa aksi memakai modal konfirmasi dan menjelaskan konsekuensi. Lengkapi pengelolaan fokus modal dan pastikan error saat aksi gagal diumumkan. |
| Responsiveness | Layout beradaptasi untuk mobile, tablet, dan desktop tanpa kehilangan konten. | Needs Adjustment | Rute portal yang diuji pada lebar mobile 390 px serta Rekap Kehadiran desktop tidak mengalami overflow horizontal. Breakpoint lain, zoom 200%, dan konten panjang belum diuji menyeluruh. |
| Responsiveness | Target sentuh, zoom, serta pengaturan reduced motion tetap mendukung penggunaan mobile. | Needs Adjustment | Zoom pengguna diizinkan dan sebagian besar kontrol form Jurnal berukuran 44 px; checkbox preferensi jadwal masih kecil. Dukungan `prefers-reduced-motion` belum tampak. |

## Prioritas Tindak Lanjut

### P0 — Aksesibilitas penting

1. **Selesai:** hapus pembatasan zoom (`maximumScale` dan `userScalable: false`) pada metadata viewport di [`app/layout.tsx`](../layout.tsx); validasi browser lanjutan pada perangkat nyata tetap disarankan.
2. Pastikan semua kontrol keyboard memiliki indikator fokus yang terlihat dan kontras, terutama field yang sekarang hanya mengandalkan perubahan border.
3. Lengkapi dialog/drawer custom dengan fokus awal yang sesuai, focus trap saat modal aktif, penutupan keyboard yang konsisten, dan pengembalian fokus setelah ditutup.

### P1 — Konsistensi lintas fitur

1. Tetapkan dan gunakan token warna, tipografi, radius, dan spacing bersama. Selaraskan halaman jurnal dan login dengan tema portal atau dokumentasikan secara eksplisit jika tema berbeda memang disengaja.
2. Audit semua tombol ikon dan aksi kecil; naikkan area target interaksi menjadi sekurang-kurangnya 44 × 44px pada mobile tanpa harus memperbesar ikon visual.
3. Seragamkan semantik error/loading: gunakan pesan dekat field dengan `aria-describedby`/`aria-invalid`, `role="alert"` atau status live region yang sesuai, serta `aria-busy` untuk area yang sedang memuat.
4. Perbaiki keyboard behavior tab profil dan admin, termasuk fokus dan navigasi antar-tab.

### P2 — Validasi visual dan pemolesan

1. Perbaiki pasangan kontras yang gagal di atas, lalu ukur ulang; lanjutkan pengukuran ke warna transparan/gradien, pesan status, hover, disabled, dan state validasi.
2. Tinjau penggunaan teks 10–12px agar hanya dipakai untuk metadata non-esensial.
3. Tambahkan dukungan `prefers-reduced-motion` untuk transisi dan animasi yang tidak esensial.
4. Investigasi React error #418/#441 dan HTTP 500 pada Admin; setelah itu uji ulang data Admin, tabel rekap, modal, navigasi, serta formulir pada breakpoint `sm`, `md`, `lg`, dan `xl`, zoom 200%, keyboard, serta screen reader.

## Batasan Audit

Audit browser mencakup rute portal yang dapat dibuka akun tes pada build lokal, tetapi sebagian data Admin gagal dimuat (HTTP 500) dan menghasilkan error React. Pengukuran kontras mencakup teks yang tampil dan latarnya yang dapat dihitung pada state yang diperiksa, bukan semua state, breakpoint, atau seluruh piksel latar kompleks. Belum dilakukan pengujian screen reader, perangkat nyata, zoom 200%, maupun sertifikasi WCAG.
