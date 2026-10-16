# Spesifikasi Desain UI

## 1. Ringkasan Arsitektur UI & Design Tokens

Dokumen ini menetapkan fondasi visual dan perilaku UI untuk aplikasi Next.js dengan Tailwind CSS. Tema terang menjadi default; tema gelap diaktifkan melalui class `dark` pada elemen root. Nilai dasar tema didefinisikan sebagai CSS variables di `app/globals.css`, sehingga komponen dapat memakai token semantik alih-alih mengunci warna per tema.

### 1.1. Skala Tipografi Tailwind CSS

Gunakan satu keluarga sans-serif untuk antarmuka. Prioritaskan font sistem agar render cepat dan konsisten tanpa permintaan font eksternal. Jika produk menetapkan font merek seperti Inter, muat melalui `next/font` dan tetapkan sebagai font sans utama.

| Penggunaan | Kelas Tailwind | Ukuran / line-height | Weight | Pedoman |
|---|---|---:|---:|---|
| Display halaman khusus | `text-4xl` | 36px / 40px | `font-bold` (700) | Gunakan seperlunya; jangan untuk judul halaman operasional rutin. |
| Judul halaman | `text-3xl` | 30px / 36px | `font-bold` (700) | Satu judul utama per halaman. |
| Judul bagian | `text-2xl` | 24px / 32px | `font-semibold` (600) | Pembagian konten utama. |
| Judul kartu / dialog | `text-lg` | 18px / 28px | `font-semibold` (600) | Judul komponen dan dialog. |
| Teks isi | `text-base` | 16px / 24px | `font-normal` (400) | Teks formulir, instruksi, dan konten utama. |
| Teks pendukung | `text-sm` | 14px / 20px | `font-normal` (400) | Deskripsi sekunder; jangan gunakan untuk informasi penting yang sulit dibaca. |
| Label dan metadata | `text-sm` | 14px / 20px | `font-medium` (500) | Label input, status, dan metadata ringkas. |
| Teks ringkas | `text-xs` | 12px / 16px | `font-medium` (500) | Hanya untuk metadata non-esensial; tetap memenuhi kontras AA. |

- Kelas keluarga font: `font-sans`; tetapkan fallback sans-serif yang sesuai di konfigurasi Tailwind atau CSS global.
- Gunakan `leading-5`, `leading-6`, `leading-7`, `leading-8`, atau `leading-10` sesuai skala di atas; hindari line-height terlalu rapat pada teks isi.
- Tautan dan kontrol tidak boleh dibedakan hanya melalui warna. Gunakan underline, ikon, label, atau bentuk tambahan bila relevan.
- Angka tabel dan rekap dapat memakai `tabular-nums` agar kolom angka tetap sejajar.

### 1.2. Palette Warna & Tokens

Token dasar berikut ditetapkan pada CSS variables global dan tersedia sebagai alias warna Tailwind semantik. Tema terang menjadi default; tema gelap menggunakan class `dark`. Komponen sebaiknya memakai alias/token atau pasangan warna `dark:` yang teruji agar toggle tema memengaruhi seluruh layar secara konsisten.

| Token | Light (default) | Dark | Penggunaan |
|---|---|---|---|
| `--bg-main` | `#f8fafc` | `#020617` | Latar utama aplikasi. |
| `--surface` | `#ffffff` | `#0f172a` | Kartu, panel, dan area konten. |
| `--text-main` | `#0f172a` | `#f8fafc` | Teks utama. |
| `--border-color` | `#e2e8f0` | `#334155` | Batas komponen dan pemisah; jangan jadikan satu-satunya penanda status. |
| `--surface-muted` | `#f1f5f9` | `#1e293b` | Popover, hover surface, dan kontrol yang terangkat. |
| `--text-muted` | `#475569` | `#94a3b8` | Teks pendukung; uji kontras pada surface aktual. |
| `--primary` | `#1d4ed8` | `#1d4ed8` | Aksi utama dan tombol primer. |
| `--primary-foreground` | `#ffffff` | `#ffffff` | Teks/ikon di atas `--primary`. |
| `secondary` | `#e2e8f0` | `#334155` | Aksi sekunder dan surface netral. |
| `secondary-foreground` | `#0f172a` | `#f1f5f9` | Teks di atas `secondary`. |
| `link` | `#1d4ed8` | `#93c5fd` | Tautan; tetap berikan penanda non-warna. |
| `success` | `#166534` | `#86efac` | Teks/ikon status berhasil; gunakan surface pasangan yang kontras. |
| `warning` | `#92400e` | `#fcd34d` | Teks/ikon peringatan; gunakan surface pasangan yang kontras. |
| `destructive` | `#b91c1c` | `#fca5a5` | Teks/ikon kesalahan atau tindakan destruktif; gunakan surface pasangan yang kontras. |
| `focus-ring` | `#2563eb` | `#60a5fa` | Ring fokus keyboard yang terlihat pada surface aktual. |

**Aturan kontras dan penerapan:**

- Kontras teks normal harus minimal **4.5:1** terhadap warna latar aktual. Teks besar (minimal 24px normal atau sekitar 18.66px bold) harus minimal **3:1**.
- Pasangan warna teks/surface untuk `success`, `warning`, dan `destructive` di atas dimaksudkan sebagai pasangan; jangan menempatkan teks status terang pada surface terang atau teks gelap pada surface gelap tanpa mengukur ulang.
- Batas, ikon, dan indikator fokus yang diperlukan untuk mengenali kontrol harus memiliki kontras minimal **3:1** terhadap warna di sekitarnya. Ring fokus tidak boleh terpotong oleh `overflow: hidden`.
- Jangan mengomunikasikan keberhasilan, peringatan, atau kesalahan dengan warna saja. Sertakan teks yang jelas dan/atau ikon berlabel.
- Ukur pasangan warna yang benar-benar dirender (termasuk opacity, overlay dialog, hover, dan disabled) dengan pemeriksa kontras WCAG sebelum rilis. Target AA berlaku untuk seluruh state, bukan hanya default.
- Uji kedua tema dan semua state; jangan membalik warna secara otomatis tanpa validasi.

### 1.3. Spacing & Grid System

- Gunakan skala utama kelipatan 4px. Kelas umum: `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px).
- Gunakan jarak 8px atau lebih untuk pemisahan elemen yang berbeda; 4px cocok untuk jarak rapat seperti ikon dengan label.
- Padding kartu standar `p-4` di layar kecil dan `p-6` pada layar yang lebih lebar. Jarak antarbagian halaman umumnya `space-y-6` hingga `space-y-8`.
- Tata letak halaman memakai kontainer terpusat dengan lebar maksimum yang sesuai kebutuhan data. Tabel lebar boleh memiliki area gulir horizontal yang jelas dan dapat dioperasikan dengan keyboard.
- Gunakan grid fleksibel, misalnya `grid-cols-1`, lalu naikkan jumlah kolom pada breakpoint saat konten benar-benar muat; jangan mengunci lebar elemen berdasarkan perangkat tertentu.

| Breakpoint | Lebar minimum Tailwind | Pedoman |
|---|---:|---|
| Default | 0px | Tata letak mobile-first; satu kolom, kontrol selebar kontainer. |
| `sm` | 640px | Susun tombol/field yang pendek berdampingan bila tidak mengurangi keterbacaan. |
| `md` | 768px | Gunakan panel dua kolom dan navigasi yang lebih luas bila sesuai. |
| `lg` | 1024px | Terapkan layout desktop utama dan batasi lebar bacaan. |
| `xl` | 1280px | Perluas dashboard atau tabel; pertahankan batas lebar konten dan ruang kosong. |

## 2. Standar Komponen & Kompatibilitas Shadcn UI

Shadcn UI adalah rekomendasi untuk mempercepat komponen standar, bukan dependensi yang saat ini tercatat dalam `package.json`. Bila diadopsi, gunakan komponen yang dihasilkan dan dimiliki proyek di `components/ui`, sesuaikan token, dan tinjau aksesibilitas serta versi dependensinya. Jangan mencampur dua implementasi untuk kontrol yang sama.

### 2.1. Komponen Dasar

| Komponen | Standar visual dan perilaku |
|---|---|
| **Button** | Sediakan varian `default`/primary, `secondary`, `outline`, `ghost`, dan `destructive` bila diperlukan. Tinggi kontrol minimum 44px di mobile; tampilkan state fokus yang jelas. Tombol submit memiliki state loading dan mencegah submit ganda. Gunakan elemen `<button>` untuk aksi, bukan `<div>` yang diberi handler. |
| **Input** | Tinggi minimum 44px di mobile; label terlihat dan terhubung dengan `htmlFor`/`id`. Placeholder hanya contoh, bukan pengganti label. Pesan error terkait melalui `aria-describedby`; gunakan `aria-invalid="true"` saat invalid. Pertahankan teks input dan tunjukkan batasan format sebelum submit. |
| **Select** | Untuk daftar pendek, gunakan select native agar keyboard dan pembaca layar mendapat perilaku bawaan. Untuk pencarian, daftar panjang, atau opsi kompleks, gunakan pola combobox/listbox yang aksesibel (Shadcn/Radix bila tersedia). Tampilkan pilihan saat ini, label, error, dan status pemuatan opsi. |
| **Dialog/Modal** | Beri judul dan deskripsi yang jelas; pindahkan fokus ke dalam dialog saat dibuka, perangkap fokus selama modal aktif, tutup dengan `Escape` bila aman, lalu kembalikan fokus ke pemicu. Tombol destruktif harus menjelaskan konsekuensi dan menyediakan cara batal. Jangan menjadikan modal sebagai wadah untuk alur yang dapat dilakukan inline. |
| **Card** | Gunakan untuk mengelompokkan informasi yang berkaitan, bukan sebagai tombol kecuali seluruh card memang satu target interaktif. Jika dapat diklik, sediakan semantik link/button dan state hover, aktif, fokus, serta nama aksesibel. |
| **Toast** | Beri pesan ringkas dan tindakan opsional; jangan memindahkan fokus. Gunakan `role="status"`/`aria-live="polite"` untuk info umum dan `role="alert"` secara hemat untuk pesan penting. Jangan menjadi satu-satunya tempat menyampaikan error formulir. Sediakan durasi yang cukup dan cara menutup, serta jangan otomatis menghilangkan pesan penting sebelum dapat dibaca. |
| **Skeleton Loader** | Bentuk placeholder harus menyerupai struktur konten yang dimuat, tidak menyerupai kontrol aktif. Tandai area pemuatan dengan `aria-busy="true"` dan teks status yang dapat diakses bila menunggu lama. Hindari animasi bila `prefers-reduced-motion` aktif. |

### 2.2. Pemetaan Shadcn UI vs Komponen Kustom Tailwind

| Kebutuhan | Pilihan yang disarankan | Kapan memilih alternatif |
|---|---|---|
| Button, Input, Label, Card, Badge, Separator | Shadcn UI bila pola dasarnya sesuai | Tailwind kustom untuk presentasi sangat sederhana atau pola produk yang berbeda; tetap gunakan elemen HTML semantik. |
| Select, Popover, Dropdown, Dialog, Toast | Shadcn UI berbasis Radix bila proyek sudah mengadopsi dependensi terkait | Native HTML untuk pilihan sederhana; implementasi khusus hanya jika kebutuhan interaksi tidak tercakup dan sudah diuji keyboard/screen reader. |
| Skeleton, Empty state, status inline | Tailwind kustom sering cukup | Shadcn bila komponen tersedia dan memberikan konsistensi; jangan menambah dependensi hanya untuk dekorasi sederhana. |
| Komponen domain (mis. ringkasan jurnal, rekap presensi) | Komponen kustom yang menyusun komponen dasar | Gunakan primitives Shadcn untuk kontrol di dalamnya, bukan membuat ulang perilaku dasar. |
| Pola interaksi baru | Utamakan primitive yang telah teruji dan dapat dikomposisi | Implementasi dari nol memerlukan pengujian semantik, keyboard, fokus, dan pembaca layar sebelum digunakan. |

Jika memasang Shadcn UI, cocokkan `components.json`, alias impor, CSS variables, dan konfigurasi Tailwind dengan struktur Next.js aktual. Review dependency diff terlebih dahulu; dokumentasi ini tidak mengasumsikan instalasi atau migrasi telah dilakukan.

### 2.3. Matriks UI States

Setiap komponen interaktif harus memiliki perilaku yang dirancang dan diuji untuk state yang berlaku di bawah. “Tidak berlaku” berarti state tersebut bukan state yang bermakna pada komponen itu, bukan state yang boleh dibiarkan tanpa keputusan. State error dan empty umumnya merupakan state konteks/area, bukan state visual universal semua kontrol.

| Komponen | Default | Hover | Active / Pressed | Focus visible | Disabled | Loading | Error | Empty state |
|---|---|---|---|---|---|---|---|---|
| **Button** | Kontras dan hierarki sesuai varian; label aksi spesifik. | Perubahan surface/border ringan; jangan mengubah ukuran. | Beri respons visual singkat tanpa menggeser layout. | Ring 2px kontras dan offset yang terlihat; hanya untuk fokus keyboard bila memakai `focus-visible`. | Tampilkan nonaktif secara jelas, cegah aksi, pertahankan keterbacaan; jangan mengandalkan opacity rendah. | Tampilkan indikator dan label seperti “Menyimpan…”; cegah klik ganda dan pertahankan konteks tindakan. | Bukan state intrinsik; tampilkan pesan di dekat aksi/form dan arahkan fokus ke error bila diperlukan. | Tidak berlaku untuk tombol; aksi “Tambah” pada area kosong harus tetap berlabel jelas. |
| **Input** | Border, label, nilai/placeholder, dan instruksi mudah dibedakan. | Border/surface merespons pointer tanpa mengaburkan fokus. | Kursor dan pemilihan teks tetap normal; jangan memberikan efek pressed yang mengganggu pengetikan. | Ring fokus jelas; tidak tertutup pesan atau container. | Nilai tetap terbaca; tidak dapat diedit dan ditandai secara semantik. | Untuk pencarian async, pertahankan nilai dan tunjukkan status pemrosesan terpisah. | Border/ikon plus pesan spesifik; `aria-invalid` dan `aria-describedby` terhubung. | Field kosong menampilkan placeholder opsional dan instruksi; placeholder tidak menggantikan label. |
| **Select** | Tampilkan nilai terpilih atau prompt eksplisit. | Perubahan border/surface kecil. | Pemicu dan opsi terpilih memiliki umpan balik yang konsisten. | Ring fokus; opsi dapat dinavigasi dengan keyboard dan fokus/seleksi terlihat. | Pemicu tidak dapat dibuka dan tetap terbaca. | Tampilkan “Memuat pilihan…” dan cegah pemilihan sebelum opsi siap. | Pesan kesalahan terkait; sediakan tindakan coba lagi bila sumber opsi gagal. | Tampilkan “Tidak ada pilihan”/“Tidak ditemukan” dan jelaskan langkah berikutnya; jangan tampilkan daftar kosong tanpa konteks. |
| **Dialog/Modal** | Saat terbuka, overlay, judul, deskripsi, aksi, dan urutan fokus jelas. | Tombol dan tautan di dalam dialog mengikuti state masing-masing. | Aksi memberi umpan balik tanpa menutup dialog sebelum hasil diketahui. | Fokus terperangkap dengan benar; indikator tetap terlihat; `Escape` mengikuti aturan keselamatan alur. | Aksi yang tidak tersedia dinonaktifkan dengan alasan yang dapat dipahami. | Selama submit, cegah submit ganda; pertahankan isi dan tampilkan progres. | Pesan error berada di dalam dialog; fokus dapat diarahkan ke ringkasan error. | Bila konten dialog adalah daftar, jelaskan daftar kosong dan tindakan untuk melanjutkan. |
| **Card** | Hirarki judul, isi, dan metadata jelas. | Hanya card yang memang dapat diklik mendapat affordance hover. | Klik/tekan memberi umpan balik dan memicu satu aksi yang diperkirakan. | Card interaktif dapat dicapai dengan keyboard dan memiliki ring fokus; card presentasional tidak masuk urutan tab. | Bila card-action tidak tersedia, komunikasikan status dengan semantik yang sesuai. | Muat placeholder dengan skeleton yang sesuai bentuk konten. | Error konten menampilkan pesan dan opsi pemulihan pada area card. | Tampilkan ilustrasi/ikon opsional, penjelasan, serta aksi relevan; hindari panel kosong tanpa konteks. |
| **Toast** | Pesan dan tingkat urgensi mudah dikenali; tidak menutupi kontrol penting. | Jika toast dapat diklik, hover tidak boleh menghilangkan pesan. | Tindakan pada toast menunjukkan respons; tutup manual berlabel aksesibel. | Semua aksi toast dapat difokuskan dan ring tampak. | Jika tindakan tidak tersedia, jangan render kontrol palsu/nonfungsional. | Dapat menampilkan progres hanya untuk proses yang memang berlanjut; gunakan status persisten untuk proses panjang. | Gunakan warna/ikon/teks error dan `role="alert"` hanya untuk error mendesak. | Tidak ada toast adalah keadaan normal; jangan render wadah kosong. |
| **Skeleton Loader** | Placeholder tidak menyerupai data nyata atau kontrol aktif. | Tidak berlaku. | Tidak berlaku. | Tidak menjadi target fokus; status pemuatan tersedia bagi teknologi bantu. | Tidak berlaku. | Animasi halus opsional, tetap hormati `prefers-reduced-motion`; sampaikan status tanpa membanjiri pembaca layar. | Jika pemuatan gagal, ganti skeleton dengan error dan opsi coba lagi; jangan berputar tanpa batas. | Jika hasil berhasil dimuat tetapi tidak ada data, ganti skeleton dengan empty state yang informatif. |

## 3. Panduan Aksesibilitas (WCAG 2.1 AA) & Usabilitas

### 3.1. Kontras Warna

- Pastikan teks normal memiliki rasio kontras minimal **4.5:1**, teks besar minimal **3:1**, dan komponen visual/indikator penting minimal **3:1** terhadap warna sekitarnya.
- Uji label, placeholder, pesan error, teks disabled, tautan, ikon informatif, border kontrol, dan state hover/fokus. Teks disabled yang dikecualikan WCAG dari persyaratan kontras tetap harus terbaca dan dikenali pengguna.
- Gunakan pasangan token semantik; jangan menggunakan opacity global untuk membuat teks sekunder atau disabled sebelum kontras hasil komposit diuji.
- Jangan menyampaikan status atau instruksi hanya melalui warna. Sertakan label, ikon dengan teks aksesibel, atau deskripsi.

### 3.2. Touch Target

- Target sentuh minimum **44 × 44px** pada perangkat mobile untuk aksi utama dan kontrol yang sering digunakan.
- Beri jarak yang cukup di antara target agar salah tekan tidak mudah terjadi. Ikon visual kecil dapat berada di dalam tombol dengan area interaksi 44px.
- Jangan mengurangi target sentuh hanya demi memuat lebih banyak aksi. Gunakan menu tindakan tambahan jika ruang terbatas.

### 3.3. Navigasi Keyboard & Fokus

- Seluruh fungsi harus dapat dijalankan menggunakan keyboard tanpa memerlukan pointer. Ikuti urutan DOM yang logis; hindari `tabindex` positif.
- Gunakan elemen semantik (`button`, `a`, `input`, `select`) sebelum menambahkan `tabindex`. `tabindex="0"` hanya untuk elemen khusus yang memang harus masuk urutan tab; `tabindex="-1"` untuk fokus programatis, seperti judul dialog atau ringkasan error.
- Terapkan ring fokus yang jelas, misalnya `focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2`, dengan offset sesuai surface dan kontras yang tervalidasi. Jangan menghapus outline tanpa pengganti yang setara.
- Pastikan tidak ada keyboard trap di luar perilaku modal yang disengaja. Dialog harus mengelola fokus masuk, fokus di dalam, penutupan, dan pengembalian fokus.
- Uji urutan `Tab`/`Shift+Tab`, aktivasi `Enter`/`Space`, navigasi panah pada widget kompleks, dan `Escape` untuk menutup popover/modal.
- Sediakan indikator fokus yang tetap terlihat pada tema gelap dan tidak bergantung pada hover.

### 3.4. Label, Pesan, Gerak, dan Pembaca Layar

- Hubungkan label dan kontrol dengan `htmlFor`/`id`; kelompokkan field terkait dengan `fieldset` dan `legend` bila sesuai.
- Berikan nama aksesibel pada tombol ikon-only, termasuk tombol tutup dan navigasi. Ikon dekoratif disembunyikan dari accessibility tree.
- Hubungkan bantuan/error ke input menggunakan `aria-describedby`; jangan mengumumkan pesan yang sama berkali-kali.
- Umumkan status pemuatan dan hasil async secara tepat menggunakan live region; jangan memindahkan fokus hanya untuk notifikasi biasa.
- Hormati `prefers-reduced-motion`; hindari kedipan, gerak berulang yang tidak esensial, dan animasi yang menghalangi pembacaan.
- Pastikan zoom browser hingga 200% dan reflow pada viewport sempit tidak menghilangkan konten maupun fungsi.

## 4. Lembar Ceklist Pengujian UI (UI Testing Audit Table)

Isi status berdasarkan pengujian halaman dan komponen aktual. Untuk baseline spesifikasi yang belum diaudit terhadap implementasi, status awal adalah **Needs Adjustment** sampai bukti pengujian tersedia.

| Aspek | Parameter Uji | Status (Pass/Fail/Needs Adjustment) | Catatan Perbaikan |
|---|---|---|---|
| Visual Hierarchy | Judul halaman, judul bagian, isi, dan metadata mengikuti skala tipografi dan hirarki yang konsisten. | Needs Adjustment | Validasi pada setiap halaman; tetapkan satu judul utama dan hindari lompatan level judul. |
| Visual Hierarchy | Aksi utama menonjol dibanding aksi sekunder tanpa mengandalkan warna saja. | Needs Adjustment | Periksa varian tombol, label aksi, dan urutan visual pada desktop serta mobile. |
| Consistency | Token warna, tipografi, spacing, radius, dan border digunakan konsisten antarkomponen. | Needs Adjustment | Pusatkan nilai berulang pada token/CSS variables; hilangkan variasi literal yang tidak disengaja. |
| Consistency | Button, input, select, dialog, toast, dan state komponen memakai pola interaksi yang sama. | Needs Adjustment | Gunakan primitive bersama; dokumentasikan pengecualian yang memang dibutuhkan produk. |
| Feedback & States | Komponen interaktif memiliki default, hover, active, focus, disabled, loading, error, dan empty state yang relevan. | Needs Adjustment | Uji matriks state pada ukuran layar dan metode input yang didukung. |
| Feedback & States | Aksi async memberikan feedback, mencegah submit ganda, serta pulih dengan pesan/error yang jelas. | Needs Adjustment | Tambahkan status proses dan tindakan pemulihan; hindari loading tanpa batas. |
| Accessibility | Teks memenuhi kontras AA, fokus terlihat, label terhubung, dan kontrol dapat dioperasikan dengan keyboard. | Needs Adjustment | Audit dengan alat kontras, keyboard manual, dan screen reader; catat pasangan warna yang gagal. |
| Accessibility | Target sentuh minimal 44 × 44px dan status tidak disampaikan hanya melalui warna. | Needs Adjustment | Perbesar area hit target ikon dan tambahkan label/ikon atau deskripsi status. |
| Error Prevention | Form menjelaskan format/batasan sebelum submit, mempertahankan nilai saat error, dan menautkan pesan ke field. | Needs Adjustment | Tambahkan validasi yang dapat dipahami dan `aria-describedby`/`aria-invalid`. |
| Error Prevention | Aksi destruktif memiliki konfirmasi yang proporsional, menyatakan konsekuensi, dan memungkinkan batal. | Needs Adjustment | Tinjau alur hapus dan pastikan fokus kembali ke pemicu setelah dialog ditutup. |
| Responsiveness | Layout diuji pada breakpoint sm 640px, md 768px, lg 1024px, dan xl 1280px tanpa overflow yang tidak disengaja. | Needs Adjustment | Periksa konten, tabel, dialog, navigasi, serta state panjang pada lebar sempit. |
| Responsiveness | UI tetap dapat digunakan pada sentuhan, keyboard, zoom 200%, dan pengaturan reduced motion. | Needs Adjustment | Uji pada perangkat/viewport representatif; sediakan gulir yang jelas untuk konten tabel lebar. |
