# Source of Truth Pengembangan

Dokumen ini adalah indeks otoritas pengembangan Teaching-Daily-Report. Tujuannya bukan menggandakan kode atau seluruh dokumentasi, melainkan menjelaskan **sumber mana yang berwenang untuk jenis informasi tertentu** dan cara menelusuri perubahan.

## Urutan otoritas

Gunakan sumber sesuai pertanyaan:

| Jenis pertanyaan | Sumber yang berwenang |
| --- | --- |
| Apa kebutuhan atau keputusan produk yang disepakati? | Butir bertanda **DIKONFIRMASI** di [`../konteks-penggunaan.md`](../konteks-penggunaan.md) dan ADR **Accepted** di [`decisions/README.md`](decisions/README.md). Jika bertentangan atau ada kekosongan, minta klarifikasi; jangan menebak dari rancangan. |
| Apa yang dilakukan aplikasi saat ini? | Kode, tes, dan migrasi database/RLS yang berlaku. Dokumentasi arsitektur/struktur adalah ringkasan, bukan pengganti implementasi. |
| Apa yang masih berupa opsi atau usulan? | Butir **PERLU KLARIFIKASI**, dokumen berstatus proposal, dan referensi desain yang dicantumkan di bawah. Tidak mengikat sebagai keputusan final. |
| Apa pekerjaan yang sedang dikerjakan? | GitHub Issue terkait sebagai status kanonis; [`active-work.md`](active-work.md) sebagai konteks/rencana pelaksanaan agen untuk pekerjaan yang sedang aktif. |
| Bagaimana Copilot harus bekerja di repository ini? | [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md), yang menunjuk kembali ke indeks ini. |

Keputusan produk yang telah dikonfirmasi mengatur tujuan/perilaku yang diharapkan; implementasi dan migrasi menjelaskan keadaan sistem saat ini. Jika keduanya berbeda, catat gap dan minta keputusan apakah implementasi perlu diubah—jangan menyimpulkan bahwa kode lama mengubah keputusan produk.

## Status dokumentasi

- **DIKONFIRMASI / Accepted**: keputusan disetujui secara eksplisit; dapat menjadi dasar implementasi.
- **PERLU KLARIFIKASI / Proposed**: pertanyaan atau rancangan yang belum disetujui; jangan mengubahnya menjadi aturan.
- **DI LUAR MVP / Deferred**: sengaja tidak dikerjakan saat ini; bukan berarti kebutuhan dihapus selamanya.
- **Superseded / Legacy**: digantikan atau berisi status kerja historis; jangan digunakan sebagai status backlog aktif.
- **Reference / Derived**: panduan umum atau ringkasan turunan; verifikasi terhadap keputusan dan implementasi proyek.

Untuk dokumen yang belum memiliki label formal, klasifikasi di indeks ini berlaku sebagai batas penggunaannya sampai dokumen ditinjau dan diperbarui.

## Indeks sumber

### Kebutuhan dan keputusan produk

- [`../konteks-penggunaan.md`](../konteks-penggunaan.md) — register kanonis konteks produk, keputusan yang dikonfirmasi, pertanyaan terbuka, dan batas MVP. Hanya butir **DIKONFIRMASI** yang menjadi keputusan; daftar peran/rancangan dan to-do tetap non-final.

### Usulan produk dan referensi desain

- [`../konsep-penanganan-perilaku.md`](../konsep-penanganan-perilaku.md) — rancangan alur, UI/UX, dan keamanan perilaku; gunakan sebagai usulan kecuali konteks/ADR menyatakan sudah dikonfirmasi.
- [`../profil-murid.md`](../profil-murid.md) — usulan profil murid dan cakupan informasi; bukan keputusan hak akses atau MVP dengan sendirinya.
- [`../prasyarat-perlindungan-data-sensitif.md`](../prasyarat-perlindungan-data-sensitif.md) — rekomendasi perlindungan data untuk dibahas; bukan kebijakan madrasah final atau nasihat hukum.
- [`../proyek-ui-slop-evaluasi.md`](../proyek-ui-slop-evaluasi.md) — panduan/hasil evaluasi UI; bukan sumber kebutuhan produk.
- [`../daftar/daftar-website-rujukan.md`](../daftar/daftar-website-rujukan.md) dan [`../daftar/daftar-skill.md`](../daftar/daftar-skill.md) — referensi visual dan skill desain; bahan inspirasi/alat bantu, bukan spesifikasi produk atau keputusan desain yang mengikat.

### Fakta implementasi dan referensi teknis

- Kode aplikasi, migration dan RLS Supabase, serta tes yang ada adalah bukti utama perilaku saat ini. Verifikasi file dan migration aktif sebelum menyimpulkan aturan keamanan.
- [`../struktur_proyek.md`](../struktur_proyek.md) — ringkasan struktur repository turunan dari kode; dapat tertinggal dan perlu diperbarui saat struktur penting berubah.
- [`../aktif/konteks/sql_schema.md`](../aktif/konteks/sql_schema.md) — referensi skema; bandingkan dengan migration aktual sebelum mengandalkannya.

### Pekerjaan dan dokumen historis

- GitHub Issues adalah status kanonis backlog; PR harus menautkan Issue dan menyebut verifikasi yang dijalankan.
- [`template-github-issue.md`](template-github-issue.md) — panduan kanonis dan template Markdown untuk Issue; gunakan untuk pekerjaan yang perlu dilacak, baik Issue dibuat manual maupun dengan bantuan agen.
- [`active-work.md`](active-work.md) — konteks dan rencana implementasi aktif; bukan backlog kedua. Sinkronkan dengan Issue dan tutup/ganti saat pekerjaan selesai.
- [`panduan-kerja-solo-developer-dengan-agen.md`](panduan-kerja-solo-developer-dengan-agen.md) — panduan manusia untuk bekerja sebagai solo developer/vibe coder bersama agen AI, dari definisi task sampai verifikasi dan rilis.
- [`../active-progress.md`](../active-progress.md), [`../tracking-progress.md`](../tracking-progress.md), dan [`../aktif/refaktor-perilaku.md`](../aktif/refaktor-perilaku.md) — tracker/rencana lama yang bertumpang tindih atau berpotensi usang. Anggap **Legacy / non-canonical** sampai direkonsiliasi dengan Issues dan konteks terbaru.
- [`../arsip/review-draf-tiket-tracker-lama.md`](../arsip/review-draf-tiket-tracker-lama.md) — rekomendasi dan draf empat tiket terbuka dari tracker lama untuk ditinjau kemudian; **bahan review saja, bukan backlog, keputusan, atau Issue yang sudah dibuat**.
- [`../aktif/README.md`](../aktif/README.md) — keterangan folder aktif; bukan spesifikasi fitur.

### Brainstorming dan bahan referensi umum

- `../pertanyaan.md` secara eksplisit menyebut dirinya brainstorming dan meminta agar tidak dirujuk. Jangan gunakan sebagai sumber kebutuhan atau instruksi.
- [`../aktif/kotak-pasir/README.md`](../aktif/kotak-pasir/README.md) adalah indeks kotak pasir/eksperimen; dokumen topiknya bukan keputusan.
- Dokumen di [`../daftar/`](../daftar/) adalah daftar panduan/reference umum; verifikasi setiap rekomendasi terhadap stack, kebijakan, dan kebutuhan repository ini sebelum menerapkannya.
- [`../daftar/panduan_github_copilot_solo_developer.md`](../daftar/panduan_github_copilot_solo_developer.md) adalah panduan lama/reference, bukan prosedur kanonis. Gunakan [panduan kerja solo developer bersama agen AI](panduan-kerja-solo-developer-dengan-agen.md) untuk alur proyek saat ini.
- Dokumen sampel, gambar, dan tangkapan layar adalah artefak referensi visual, bukan sumber otoritas produk.
- [`../../README.md`](../../README.md) adalah onboarding manusia dan ringkasan produk; instruksi kerja agen tetap berada di `.github/copilot-instructions.md`.

## Cara mencatat keputusan

1. Klarifikasi perubahan kebutuhan melalui percakapan/Issue; jangan mempromosikan rancangan hanya karena tampak konsisten.
2. Perbarui butir terkait di `docs/konteks-penggunaan.md` menjadi **DIKONFIRMASI** hanya setelah persetujuan eksplisit; tandai keputusan lama sebagai superseded bila relevan.
3. Untuk keputusan yang berdampak pada arsitektur, keamanan, skema data, atau banyak fitur, buat ADR **Accepted** menggunakan pola di [`decisions/README.md`](decisions/README.md), lalu tautkan ke Issue dan PR.
4. Implementasikan perubahan dan tesnya. Jika hasil aktual berbeda dari spesifikasi, dokumentasikan gap dan jangan mengubah status keputusan secara diam-diam.
5. Perbarui indeks/arsitektur/panduan hanya jika perubahan membuatnya usang.

## Keterlacakan pekerjaan

Untuk setiap perubahan yang layak dilacak, gunakan rantai:

**Keputusan/requirement → GitHub Issue + acceptance criteria → PR yang menautkan Issue → tes/verifikasi → pembaruan dokumentasi jika aturan atau perilaku berubah.**

Issue perlu menjelaskan hasil yang diharapkan dan batasan yang relevan. PR perlu menyebut apa yang berubah, bagaimana diuji, dan sisa risiko/pekerjaan. Catat tes yang gagal atau tidak dijalankan secara transparan. Jangan membuat daftar task Markdown lain yang menduplikasi status Issue.

Rantai ini meningkatkan keterlacakan, tetapi tidak menjamin nol celah secara absolut. Review manusia tetap diperlukan untuk keputusan produk, privasi, keamanan, dan rilis.

## Pemeliharaan indeks

- Tambahkan atau ubah klasifikasi ketika sumber baru dibuat, status keputusan berubah, atau tracker dipensiunkan.
- Bila ada konflik, dahulukan klarifikasi pengguna untuk maksud produk, keputusan **Accepted** untuk konsekuensi arsitektur yang disetujui, dan kode/migration/tes untuk perilaku aktual.
- Tinjau tautan dan status dokumen pada akhir perubahan yang menyentuh dokumentasi.
