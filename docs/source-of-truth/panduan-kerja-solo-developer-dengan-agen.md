# Panduan Kerja Solo Developer Bersama Agen AI

Panduan ini ditujukan kepada pemilik Teaching-Daily-Report yang membangun aplikasi sebagai *solo developer* atau *vibe coder* dengan bantuan Copilot/agen AI. Tujuannya bukan mengharuskan Anda menjadi ahli di semua bagian kode, tetapi memberi cara kerja yang membuat perubahan tetap dipahami, dapat diperiksa, dan dapat dipulihkan.

Panduan ini melengkapi [indeks Source of Truth](README.md) dan [instruksi Copilot repository](../../.github/copilot-instructions.md). Jika ada perbedaan, gunakan keputusan produk yang dikonfirmasi dan klarifikasi langsung dari Anda; jangan anggap saran di panduan ini sebagai persetujuan fitur atau kebijakan madrasah.

## 1. Peran Anda dan agen

**Anda adalah pemilik produk dan pengambil keputusan. Agen adalah rekan kerja teknis yang membantu memahami, merencanakan, menulis, dan memeriksa perubahan.**

Anda yang memutuskan:

- masalah mana yang penting dan siapa yang mengalaminya;
- perilaku produk, ruang lingkup MVP, peran pengguna, serta aturan akses;
- trade-off yang memengaruhi privasi, keamanan, data, atau operasi;
- apakah perubahan siap diterima dan dirilis.

Agen dapat membantu:

- mencari pola yang sudah ada dan menjelaskan alur kode;
- menyusun pilihan, dampak, dan pertanyaan klarifikasi;
- mengimplementasikan perubahan yang batasnya jelas;
- menulis atau memperbarui tes dan dokumentasi;
- membaca diff untuk menemukan masalah yang terlewat.

Agen bisa salah, melewatkan konteks, salah membaca migrasi atau cakupan akses, dan memberi keyakinan berlebihan. Hasil agen adalah **usulan sampai Anda memeriksa dan menerima hasilnya**. Review dari agen lain atau Copilot Code Review juga bukan pengganti verifikasi Anda.

## 2. Pilih jalur sesuai ukuran dan risiko

Tidak semua perubahan memerlukan proses yang sama.

| Jenis perubahan | Contoh | Cara kerja yang disarankan |
| --- | --- | --- |
| Kecil dan berisiko rendah | Salah ketik dokumentasi, perbaikan label yang tidak mengubah perilaku | Beri agen batas file yang jelas; lihat diff; lakukan pemeriksaan yang relevan. Issue/PR dapat dilewati jika perubahan benar-benar kecil dan mudah ditinjau. |
| Fitur atau bug yang terukur | Validasi form, perubahan alur halaman, perbaikan hasil pencarian | Buat atau gunakan GitHub Issue dengan kriteria penerimaan; kerjakan pada branch terpisah jika perubahan cukup luas; uji dan review diff sebelum PR/merge. |
| Berisiko tinggi atau keputusan belum jelas | RLS/izin, data murid sensitif, hapus data, migrasi, sinkronisasi offline, perubahan produksi | Berhenti sebelum implementasi bila kebijakan belum disepakati. Klarifikasi, dokumentasikan keputusan, rencanakan rollback dan pengujian negatif, lalu implementasikan bertahap dengan review lebih ketat. |

Gunakan GitHub Issue sebagai status kanonis pekerjaan yang perlu dilacak, dan PR sebagai catatan review/perubahan kode yang ditautkan ke Issue. Jangan membuat backlog Markdown kedua. Untuk perubahan kecil yang tidak memerlukan Issue, jangan mencatat pekerjaan itu sebagai Issue hanya demi formalitas.

Untuk format Issue yang konsisten—termasuk bug, fitur, keputusan terbuka, kriteria penerimaan, dan perlindungan data—gunakan [Panduan dan Template GitHub Issue](template-github-issue.md).

## 3. Sebelum memulai task

### 3.1 Pahami keadaan repository

Sebelum mengizinkan agen mengedit:

1. Pastikan workspace/repository yang aktif memang proyek yang ingin diubah.
2. Periksa branch dan perubahan lokal. Perubahan yang sudah ada bisa milik Anda atau pekerjaan sebelumnya; jangan timpa, hapus, format ulang massal, atau masukkan ke commit tanpa memeriksanya.
3. Baca [indeks Source of Truth](README.md), lalu dokumen/komponen yang relevan. Cari dulu pola implementasi yang sudah ada.
4. Pisahkan fakta dari dugaan:
   - keputusan produk yang dikonfirmasi;
   - kebutuhan yang belum dijawab;
   - fakta perilaku saat ini dari kode, tes, dan migration;
   - ide atau rekomendasi yang belum disetujui.
5. Jika ada konflik antara dokumen dan kode, catat perbedaannya. Jangan menganggap implementasi lama sebagai keputusan terbaru.

Pemeriksaan Git yang aman untuk memulai:

```powershell
git status --short
git branch --show-current
git diff --stat
git diff
```

Periksa juga file yang belum dilacak sebelum menyimpulkan bahwa workspace bersih. Jangan otomatis menjalankan `stash`, `reset`, `checkout`, atau perintah pemulihan lain untuk “membersihkan” workspace; tindakan itu dapat menyembunyikan atau menghilangkan kerja yang belum tersimpan.

### 3.2 Buat permintaan yang bisa diverifikasi

Untuk task yang layak dilacak, Issue sebaiknya memuat:

- **Masalah:** apa yang sekarang membingungkan, gagal, atau belum tersedia?
- **Pengguna dan konteks:** siapa yang melakukan apa, pada layar/perangkat/kondisi apa?
- **Hasil yang diharapkan:** apa yang harus terjadi setelah perubahan?
- **Batas:** apa yang tidak boleh berubah atau belum disetujui?
- **Kriteria penerimaan:** cara konkret menentukan hasil berhasil.
- **Risiko dan data:** apakah menyentuh akses, PII, data sensitif, schema, penghapusan, offline, atau produksi?
- **Verifikasi:** tes atau pemeriksaan manual apa yang membuktikan perilaku?

Contoh kriteria penerimaan yang berguna:

- “Guru pelapor yang tidak punya penugasan ke kelas murid tetap dapat mengirim laporan; pengguna tanpa sesi login ditolak oleh server.”
- “Jika penyimpanan gagal, pengguna melihat pesan gagal dan entri tidak ditampilkan sebagai berhasil disimpan.”

Hindari kriteria kabur seperti “buat UI lebih baik” tanpa menjelaskan pengguna, masalah, dan batas perubahan.

## 4. Klarifikasi sebelum kode

Minta klarifikasi Anda sebelum agen membuat keputusan yang mengubah:

- siapa boleh melihat, membuat, mengubah, menghapus, mengekspor, atau menangani data;
- alur triase, status kasus, kerahasiaan, atau pembukaan akses darurat;
- cakupan MVP, perilaku offline, retensi/penghapusan, atau notifikasi;
- model data atau migrasi yang berdampak pada rekaman yang sudah tersimpan;
- perilaku yang bertentangan dengan keputusan terkonfirmasi.

Untuk detail implementasi yang tidak mengubah keputusan produk—misalnya cara menyusun fungsi internal atau nama variabel—agen boleh mengikuti pola proyek dan menjelaskan pilihannya.

**Pola percakapan saat belum jelas:**

1. Minta agen menganalisis bukti dan menemukan pilihan yang masuk akal.
2. Minta dampak, risiko, dan rekomendasi untuk tiap pilihan.
3. Putuskan perilaku/izin sebagai pemilik produk.
4. Catat keputusan yang berlaku di `docs/konteks-penggunaan.md`; gunakan ADR untuk keputusan arsitektur penting.
5. Baru minta implementasi.

Jangan menandai pertanyaan sebagai selesai hanya karena dokumen rancangan sudah berisi jawaban yang terlihat masuk akal.

## 5. Menulis prompt untuk agen

Prompt yang baik memberi agen **tujuan, bukti, batas, dan cara menguji**. Minta satu hasil utama per prompt. Untuk tugas besar, minta analisis/rencana dahulu; setelah ruang lingkup jelas, baru minta implementasi.

### Template task implementasi

```text
Tujuan:
[Perilaku yang ingin dicapai, dari sudut pandang pengguna.]

Konteks/sumber:
[Issue, keputusan DIKONFIRMASI, file, atau error yang relevan.]

Batas:
- Ubah hanya [...]
- Jangan mengubah [...]
- Jangan mengasumsikan [...]

Kriteria penerimaan:
1. [...]
2. [...]

Verifikasi:
[Tes/command/pemeriksaan manual yang diharapkan.]

Sebelum mengedit:
Periksa implementasi terkait dan perubahan lokal yang sudah ada. Jika requirement bertentangan atau menyentuh keputusan yang belum dikonfirmasi, hentikan implementasi dan jelaskan pertanyaannya.

Sesudah selesai:
Ringkas file yang berubah, keputusan yang dibuat, verifikasi yang benar-benar dijalankan, dan risiko/hal yang belum teruji.
```

### Contoh prompt analisis

```text
Jangan ubah file dahulu. Telusuri alur [fitur] dari UI ke server action dan database/RLS.
Bandingkan dengan keputusan terkonfirmasi. Laporkan:
1. perilaku yang sudah berjalan,
2. perbedaan atau celah,
3. hal yang masih membutuhkan keputusan saya,
4. bagian aman yang bisa dikerjakan tanpa keputusan itu.
Sertakan path dan lokasi kode sebagai bukti.
```

### Contoh prompt debugging

```text
Reproduksi dan telusuri error ini: [error dan langkah reproduksi tanpa data sensitif].
Periksa alur lengkap sebelum menyarankan perbaikan. Jangan menutupi error dengan fallback sukses.
Perbaiki akar masalah dengan perubahan terbatas, tambahkan/regresi tes yang relevan, jalankan pemeriksaan yang tersedia, dan laporkan hasil sebenarnya.
```

### Contoh prompt review

```text
Review diff yang belum di-commit saja. Cari bug yang dapat dibuktikan, khususnya:
- perilaku di luar kriteria penerimaan,
- akses yang seharusnya ditolak tetapi terbuka,
- error yang tertelan atau sukses palsu,
- regresi data, migrasi, atau UI.
Jangan mengubah file. Untuk tiap temuan sebutkan bukti dan dampaknya; bila tidak ada temuan, sebutkan area yang tidak tercakup review.
```

## 6. Bekerja bertahap dengan agen

1. **Analisis sebelum edit.** Minta agen menemukan file, pola, dependensi, dan tes relevan sebelum menyentuh perubahan lintas file.
2. **Setujui batas.** Pastikan semua file/komponen yang akan diubah memang berkaitan dengan task.
3. **Kerjakan irisan kecil.** Selesaikan satu perilaku atau satu lapisan perubahan pada satu waktu; hindari meminta “rapikan seluruh aplikasi” sambil menambah fitur.
4. **Periksa hasil antara.** Setelah agen selesai satu bagian, lihat diff sebelum membiarkannya memperluas perubahan.
5. **Jaga checkpoint.** Gunakan commit/checkpoint/branch sesuai risiko dan kebiasaan Git Anda. Checkpoint editor tidak selalu membatalkan perintah terminal, deployment, atau perubahan pada layanan eksternal.
6. **Berikan umpan balik spesifik.** Jika hasil salah, sebutkan kriteria yang belum terpenuhi dan minta perbaikan sempit; jangan hanya meminta “coba lagi”.
7. **Hentikan saat scope berubah.** Jika agen menemukan keputusan baru, migrasi luas, operasi destruktif, atau kebutuhan kredensial/produksi, minta ia berhenti dan jelaskan dampaknya sebelum bertindak.

Gunakan izin manual saat mencoba kemampuan agentic atau tool baru. Baca permintaan izin per tindakan; jangan menyetujui akses luas atau perintah yang tidak dipahami hanya karena agen memintanya.

## 7. Git yang aman dan ringan

Branch bukan tujuan; ia alat untuk mengisolasi perubahan. Untuk fitur/bug berukuran sedang atau berisiko, gunakan branch khusus dari branch dasar yang sudah diverifikasi. Jangan mengasumsikan nama branch dasar selalu `main`.

Contoh alur setelah memastikan worktree aman:

```powershell
git status --short
git branch --show-current
# Periksa branch dasar aktual sebelum membuat branch baru.
git switch -c feature/<nomor-issue>-<nama-singkat>
```

Sebelum commit:

```powershell
git status --short
git diff --check
git diff --stat
git diff
```

- Stage file yang memang dimaksud secara eksplisit, bukan seluruh workspace secara otomatis.
- Jangan commit perubahan yang bukan bagian task atau yang Anda belum review.
- Jangan force-push, menghapus branch, mereset, atau mengubah riwayat tanpa alasan yang jelas dan persetujuan eksplisit.
- Untuk perubahan kecil yang langsung dikerjakan, tetap periksa status/diff dan pastikan hanya file yang dimaksud ikut disimpan.

## 8. Review manusia: Anda tetap memegang kendali

Jangan menerima perubahan hanya karena build berhasil atau agen mengatakan “selesai”. Baca diff yang sebenarnya, bukan hanya rangkumannya.

### Pertanyaan review umum

- Apakah semua perubahan langsung mendukung kriteria penerimaan?
- Apakah ada perubahan file yang tidak diminta, konfigurasi, dependency, atau format massal?
- Apakah UI, server action, database/RLS, dan state error tetap sepakat satu sama lain?
- Apakah validasi dilakukan di sisi server untuk input dan izin, bukan hanya menyembunyikan tombol di UI?
- Apakah error ditampilkan/dilaporkan dengan benar, bukan ditelan?
- Apakah perubahan bisa mengubah atau merusak data lama?
- Apakah ada teks dokumentasi yang mengubah usulan menjadi seolah keputusan?
- Apakah perilaku mobile, keyboard, label, kontras, loading, empty, dan failure state masuk akal?

### Pertanyaan tambahan untuk perubahan otorisasi/data

- Uji pengguna yang **boleh** dan pengguna yang **tidak boleh** melakukan tindakan itu (negative authorization).
- Periksa semua jalur akses langsung: Server Action/API, RPC, SQL grants, RLS, dan ekspor—bukan hanya halaman UI.
- Periksa role gabungan, akun tidak aktif, penugasan kelas, pemilik rekaman, dan perubahan scope, sesuai kebutuhan fitur yang dikonfirmasi.
- Pastikan log audit tidak membocorkan isi sensitif dan penghapusan/cadangan mengikuti kebijakan yang disetujui.
- Untuk migration, pahami efek terhadap data yang ada, urutan penerapan, kompatibilitas kode lama, dan jalan pemulihan.

Minta bantuan review AI sebagai pemeriksaan tambahan, bukan otorisasi final. Anda tetap perlu memahami perubahan cukup untuk menyetujui dampaknya.

## 9. Verifikasi yang proporsional

Pilih pemeriksaan sesuai perubahan dan jalankan setelah perubahan terakhir—tes yang dijalankan sebelum edit berikutnya tidak membuktikan edit terbaru.

1. **Dokumentasi saja:** periksa ejaan/tautan/diff; jalankan tes dokumentasi bila tersedia.
2. **UI sederhana:** jalankan lint/typecheck atau tes komponen yang tersedia; uji manual jalur utama, keyboard, ponsel, serta loading/error.
3. **Logika/data:** tambahkan atau jalankan tes unit/integrasi untuk hasil benar dan gagal; periksa batas input dan kasus tepi.
4. **Server action/RLS/migration:** uji otorisasi dari server/DB untuk beberapa peran dan akses yang harus ditolak; jangan menganggap simulasi UI cukup.
5. **Perubahan luas/rilis:** jalankan kumpulan pemeriksaan proyek, build produksi, dan pemeriksaan manual yang relevan.

Untuk repository ini, lihat script aktual di [`package.json`](../../package.json) sebelum mengandalkan perintah. Script yang ada dapat berubah atau tidak cocok lagi dengan versi tool saat ini. Jangan menyebut lint/test lulus jika command gagal dijalankan atau tidak tersedia. Catat:

- perintah yang dijalankan;
- hasilnya (lulus/gagal/tidak dapat dijalankan);
- tes manual yang dilakukan;
- area yang belum diverifikasi dan alasannya.

Verifikasi requirement secara langsung. Jika requirement meminta respons gagal untuk pengguna tidak berizin, uji respons gagal itu; jangan hanya membuktikan pengguna sah dapat masuk.

## 10. Data murid, keamanan, dan operasi

Teaching-Daily-Report menangani informasi tentang murid. Perlakukan nama, nomor identitas, kontak, kesehatan/kebutuhan khusus, kehadiran, insiden, dan konseling sebagai data yang perlu kehati-hatian.

- Jangan memasukkan data produksi, kredensial, token, file environment, atau isi kasus yang dapat dikenali ke prompt, Issue publik, log, screenshot, atau contoh tes.
- Gunakan data sintetis atau redaksi untuk debugging. Sebelum menempel log, periksa dan bersihkan informasi pribadi.
- Jangan membuka data sensitif lebih luas hanya demi mempermudah query, UI, analitik, cache, ekspor, atau debugging.
- Perubahan izin harus diuji pada lapisan server/database. Aturan UI bukan batas keamanan.
- Jalankan migrasi hanya terhadap environment yang dimaksud; jangan menghubungkan agen ke produksi untuk eksperimen.
- Jangan meminta agen melakukan deployment produksi, menghapus data, mengubah kebijakan akses, memutar kredensial, atau menjalankan tindakan berdampak eksternal tanpa persetujuan eksplisit Anda.
- Sebelum perubahan berisiko, pastikan ada rencana pemulihan yang nyata, bukan sekadar asumsi bahwa Git dapat memulihkan database.

Panduan ini bukan nasihat hukum atau pengganti kebijakan madrasah. Ikuti keputusan dan prasyarat privasi yang berlaku di [Source of Truth](README.md) serta [panduan perlindungan data sensitif](../prasyarat-perlindungan-data-sensitif.md).

## 11. GitHub Issue, branch, PR, dan rilis

### Issue

Gunakan Issue untuk pekerjaan yang punya beberapa langkah, kriteria penerimaan, ketidakpastian, risiko, atau perlu dilanjutkan kemudian. Gunakan label/status proyek seperlunya; GitHub tetap sumber status kanonis.

**Template Issue ringkas:**

```markdown
## Masalah

## Hasil yang diharapkan

## Di luar cakupan

## Kriteria penerimaan
- [ ]

## Risiko / keputusan yang diperlukan

## Verifikasi
```

### Branch dan commit

Untuk task menengah/besar, gunakan branch terpisah agar diff terisolasi dan mudah ditinggalkan bila eksperimen gagal. Gunakan nama yang menjelaskan tujuan, misalnya `fix/123-login-error` atau `feature/456-behavior-form`. Branch kecil untuk perubahan sangat sederhana opsional. Commit adalah checkpoint yang membantu; isinya harus sudah Anda tinjau.

### Pull request dan self-review

PR berguna walau Anda bekerja sendiri: ia menjadi ringkasan, checkpoint review, dan tautan antara Issue, kode, dan hasil verifikasi. Untuk perubahan sangat kecil, Anda dapat melewati PR jika alur repo mengizinkan; jangan melewati review diff dan pemeriksaan yang relevan.

**Checklist sebelum merge:**

- [ ] Tujuan dan kriteria Issue terpenuhi; tidak ada perubahan di luar scope.
- [ ] Diff sudah dibaca file demi file.
- [ ] Pemeriksaan yang relevan telah dijalankan dan hasilnya dicatat.
- [ ] Perubahan akses/data/migration telah diuji untuk jalur yang diizinkan dan ditolak.
- [ ] Dokumentasi/ADR diperbarui jika keputusan atau perilaku berubah.
- [ ] Risiko dan pekerjaan tertunda dinyatakan; Issue terkait ditutup hanya jika benar-benar selesai.

### Rilis/deployment

- Pastikan branch, commit, environment target, dan perubahan yang akan dirilis benar.
- Pastikan pemeriksaan yang diwajibkan lulus dan migration yang akan diterapkan dipahami.
- Jangan menempelkan nilai secret ke dokumentasi, prompt, atau log.
- Gunakan preview/staging bila tersedia dan uji alur utama serta akses sebelum produksi.
- Deployment produksi dan operasi data eksternal memerlukan keputusan eksplisit pemilik.
- Setelah rilis, verifikasi hasil pada sistem target dan siapkan langkah mitigasi jika hasil menyimpang.

Panduan ini tidak mengasumsikan semua proyek harus memakai branch protection, PR wajib, atau pipeline yang belum dikonfigurasi. Ikuti aturan repository dan tingkat risiko perubahan.

## 12. Dokumentasi dan keputusan

- Perbarui `docs/konteks-penggunaan.md` ketika keputusan atau klarifikasi produk baru dikonfirmasi. Jangan mengubah status atas dasar saran agen atau isi proposal.
- Buat ADR untuk keputusan stabil yang berpengaruh luas; gunakan template di [`decisions/README.md`](decisions/README.md).
- Perbarui [indeks Source of Truth](README.md) bila klasifikasi atau lokasi sumber berubah.
- Perbarui ringkasan struktur/panduan bila perubahan membuatnya tidak akurat; kode dan migration tetap bukti implementasi utama.
- Tandai proposal dan eksperimen sebagai proposal/eksperimen. Jangan menjadikan brainstorming atau dokumen historis sebagai backlog aktif.
- Jangan menggandakan status Issue ke checklist Markdown. Rencana kerja di [`active-work.md`](active-work.md) hanya memberi konteks kerja aktif dan harus ditutup atau diganti saat selesai.

## 13. Menutup sesi kerja

Sebelum berhenti, minta agen merangkum:

1. apa yang berubah dan file terkait;
2. apakah perilaku yang diminta sudah terpenuhi;
3. perintah/verifikasi yang benar-benar dijalankan beserta hasilnya;
4. hal yang belum diuji, risiko, dan keputusan yang masih diperlukan;
5. Issue/PR/branch yang terkait dan langkah berikutnya.

Lalu Anda sendiri:

- tinjau ulang `git status --short` dan diff;
- pastikan tidak ada file atau data sensitif yang ikut tersimpan;
- pastikan Issue belum ditutup jika masih ada acceptance criteria tersisa;
- rapikan `active-work.md` agar tidak memberi kesan pekerjaan selesai masih aktif;
- simpan ringkasan penting di Issue/PR atau source-of-truth yang tepat, bukan hanya mengandalkan riwayat chat.

## 14. Checklist cepat

### Sebelum meminta implementasi

- [ ] Saya bisa menjelaskan masalah dan siapa yang terdampak.
- [ ] Saya sudah memeriksa konteks/keputusan dan status kode saat ini.
- [ ] Kriteria berhasil dapat diuji.
- [ ] Batas perubahan dan hal yang tidak boleh diasumsikan tertulis.
- [ ] Isu izin, data, keamanan, dan keputusan terbuka sudah dijawab atau dikecualikan secara eksplisit.
- [ ] Perubahan lokal saya diketahui dan aman.

### Sebelum menerima hasil

- [ ] Saya membaca diff, bukan hanya ringkasan agen.
- [ ] Tidak ada perubahan di luar tujuan.
- [ ] Pemeriksaan yang relevan lulus atau keterbatasannya jelas.
- [ ] Error dan jalur akses yang seharusnya ditolak diuji.
- [ ] Tidak ada data pribadi/secret yang bocor.
- [ ] Dokumen dan Issue mencerminkan hasil yang sebenarnya.

## 15. Sumber resmi dan batasnya

- [Praktik terbaik GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices) — prompt spesifik, pemecahan tugas, pemahaman saran, review, dan verifikasi.
- [Praktik terbaik agen AI di VS Code](https://code.visualstudio.com/docs/agents/best-practices) — pemilihan tool, task terbatas, konteks, izin manual, pemeriksaan diff, dan batas checkpoint.
- [Menambahkan repository custom instructions untuk GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions) — instruksi repository dan konfigurasi terkait.

Sumber-sumber ini adalah pedoman umum platform. Alur di atas menyesuaikannya dengan satu pemilik proyek, stack repository ini, dan sensitivitas data murid; ia tidak menjamin bebas bug atau menggantikan pertimbangan manusia.
