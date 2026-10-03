# Panduan Praktis & Best Practice: Memaksimalkan GitHub Copilot untuk Solo Developer

Dokumen ini dirancang sebagai panduan standar (*standard operating procedure*) bagi *solo developer* yang memanfaatkan GitHub Copilot di VS Code. Tujuan utamanya adalah menjaga kualitas kode, mencegah regresi, serta mempercepat proses rilis (*delivery*) aplikasi secara aman dan terstruktur.

---

## 1. Prinsip Utama: AI-Assisted Solo Development

Ketika bekerja sendirian bersama GitHub Copilot:
1. **Anda Adalah Pilot, Copilot Adalah Co-Pilot:** Copilot bertugas menghasilkan draf, melakukan otomatisasi tugas rutin, dan membantu analisis. Keputusan arsitektur, verifikasi kode, dan eksekusi akhir tetap berada di tangan Anda.
2. **Isolasi Adalah Kunci Kemandirian:** Selalu gunakan *branch* terpisah saat membiarkan AI menghasilkan atau mengubah banyak baris kode. Jangan pernah melakukan eksperimen AI langsung di *branch* utama (`main`).

---

## 2. Klasifikasi & Konvensi Penamaan Branch

Sebagai *solo developer*, Anda tidak memerlukan alur percabangan yang rumit, namun Anda membutuhkan **klasifikasi yang jelas** agar riwayat pengembangan tetap terorganisir.

### Standar Penamaan Branch

Gunakan format struktur folder dengan tanda garis miring (`/`) untuk mengelompokkan *branch* secara visual di VS Code dan GitHub UI:

| Kategori Branch | Format Penamaan | Tujuan & Skenario Penggunaan |
| :--- | :--- | :--- |
| **Main** | `main` | Branch produksi/stabil. Kode di sini harus selalu bebas dari eror dan siap dirilis. |
| **Feature** | `feature/nama-fitur` | Pengembangan fitur baru (misal: `feature/offline-sync`). |
| **Sub-Feature** | `feature/nama-fitur/modul` | Mengisolasi sub-modul dari fitur besar (misal: `feature/offline-sync/indexeddb`). |
| **Bugfix** | `bugfix/deskripsi-singkat` | Perbaikan *bug* non-kritis selama proses pengembangan harian. |
| **Hotfix** | `hotfix/deskripsi-singkat` | Perbaikan darurat langsung untuk kode di `main` yang sudah berjalan di produksi. |
| **Experiment** | `experiment/ide-fitur` | Uji coba teknologi/algoritma baru bersama Copilot yang belum tentu dipakai. |
| **Refactor** | `refactor/nama-komponen` | Restrukturisasi kode tanpa mengubah fungsionalitas aplikasi. |

---

## 3. Kapan Memutuskan Branching (Lifecycle Decision)

Membuat dan menutup *branch* pada waktu yang tepat adalah kunci agar repositori tidak menjadi sarang "file sampah" atau kode yang terbengkalai.

```
       [ Kapan Membuat Branch? ]
                  │
                  ▼
   Tentukan Kategori & Nama Branch
                  │
                  ▼
   [ Pengembangan + Copilot + Test ]
                  │
                  ▼
      [ Kapan Menghapus Branch? ] ──(Selesai & Di-merge)──> Delete Branch
```

### A. Kapan Harus Membuat Branch Baru?
* **Setiap ada Task/Fitur Baru:** Sekecil apa pun fitur tersebut, jika membutuhkan penulisan lebih dari 1-2 fungsi baru, buat *branch* `feature/`.
* **Saat Ingin Melakukan Eksperimen AI:** Ketika meminta Copilot atau Agent Mode membuat ulang arsitektur/modul besar yang Anda sendiri belum yakin hasilnya, buat *branch* `experiment/`.
* **Saat Terjadi Bug di Produksi:** Jika ada masalah pada versi rilis saat Anda sedang tengah-tengah koding fitur lain, *stash/commit* pekerjaan Anda, kembali ke `main`, lalu buat *branch* `hotfix/`.

### B. Kapan Harus Menggabungkan (Merge) ke `main`?
Sebuah *branch* dinyatakan siap di-merge ke `main` jika memenuhi kriteria **Definition of Done (DoD)** berikut:
1. Kode berhasil di-*build* tanpa eror/warning kritis.
2. Pengujian (*manual test* atau *unit test*) berhasil dilalui.
3. Kode telah di-review mandiri bersama Copilot Chat.
4. Dokumentasi terkait (seperti `README.md` atau `USER_GUIDE.md`) sudah di-update.

### C. Kapan Harus Menghapus Branch?
* **Langsung setelah Merge:** Setelah `git merge` ke `main` berhasil, segera hapus *branch* fitur lokal tersebut (`git branch -d nama-branch`).
* **Saat Eksperimen Gagal:** Jika *branch* `experiment/` menghasilkan kode yang buruk atau tidak terpakai, hapus *branch* tersebut tanpa di-merge (`git branch -D nama-branch`). Jangan biarkan *branch* mati menumpuk.

---

## 4. Langkah Kerja Terbaik (Workflow Step-by-Step) Solo Dev

Berikut adalah siklus kerja ideal harian dari awal pembuatan fitur hingga rilis:

### Langkah 1: Inisiasi Branch dari Main yang Bersih
Pastikan `main` Anda sinkron dan tidak ada perubahan menggantung.

```bash
git checkout main
git pull origin main
git checkout -b feature/pwa-offline-sync
```

### Langkah 2: Mengatur Konteks Proyek untuk Copilot
Sebelum meminta Copilot membuat kode, buat atau perbarui berkas `.github/copilot-instructions.md` di proyek Anda. Isinya adalah aturan main proyek, contoh:
```markdown
- Gunakan TypeScript dengan strict mode.
- Gunakan Tailwind CSS untuk styling.
- Gunakan standar penamaan camelCase untuk variabel dan PascalCase untuk komponen React.
```

### Langkah 3: Pengodingan Iteratif Bersama Copilot
1. Manfaatkan **Copilot Edits** atau **Agent Mode** (`@workspace`) untuk membuat draf awal.
2. Kerjakan dalam skala kecil: Minta Copilot membuat 1 fungsi/komponen dalam satu waktu, lalu uji langsung di *local environment*.

### Langkah 4: Atomic Commit dengan Pesan Otomatis
Lakukan *commit* setiap kali satu bagian kecil selesai.
1. Buka tab **Source Control** (`Ctrl+Shift+G`).
2. *Stage* file yang diubah (`+`).
3. Klik ikon **Sparkle (Bintang Copilot)** di atas kolom pesan *commit*. Copilot akan menganalisis `git diff` dan menulis pesan *commit* berstandar *Conventional Commits* (misal: `feat(pwa): add indexeddb helper functions`).

### Langkah 5: Self-Code Review & Refactoring
Sebelum merge, buka Copilot Chat dan jalankan *prompt review*:
> *"@workspace review perubahan di branch ini dibanding main. Apakah ada potensi bug, memory leak, atau ketidaksesuaian dengan gaya kode proyek?"*

### Langkah 6: Merge dan Cleanup
```bash
git checkout main
git merge feature/pwa-offline-sync
git branch -d feature/pwa-offline-sync
```

---

## 5. Penanganan Konflik Merge (Merge Conflict) bersama Copilot

Meskipun bekerja sendirian, konflik tetap dapat terjadi saat Anda mengubah berkas yang sama di dua *branch* berbeda (misal: pengerjaan *hotfix* paralel dengan *feature branch*).

### Langkah-Langkah Penyelesaian Konflik

```
[Terjadi Merge Conflict] ──> Buka File Berkonflik ──> Gunakan "Resolve in Merge Editor"
                                                                │
                                                                ▼
                                                Minta Copilot Analisis via Chat
                                                                │
                                                                ▼
                                                Pilih Kode & Selesaikan Commit
```

#### 1. Masuk ke Mode Resolusi Visual
Ketika `git merge` melaporkan konflik, jangan edit simbol `<<<<<<<` secara manual. Klik tombol **"Resolve in Merge Editor"** di pojok kanan bawah editor VS Code.

#### 2. Minta Copilot Menganalisis Perbedaan
Jika Anda ragu bagian mana yang harus dipertahankan, pilih/blok bagian kode yang berkonflik, lalu buka Copilot Chat (`Ctrl+Alt+I`) dan gunakan *prompt*:

> *"Saya sedang menyelesaikan merge conflict antara branch main (Current) dan feature branch (Incoming). Berikut adalah kedua potongan kodenya: [tempel kode atau pilih file]. Tolong jelaskan perbedaan fungsionalitasnya dan buatkan versi gabungan terbaik yang mempertahankan kedua fitur tanpa merusak logika."*

#### 3. Eksekusi Hasil Resolusi
1. Berdasarkan saran Copilot, centang opsi *Incoming*, *Current*, atau gunakan kode gabungan di panel **Result**.
2. Simpan file (`Ctrl+S`).
3. *Stage* file tersebut dan selesaikan *merge commit*:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflict on user controller"
   ```

---

## 6. Poin-Poin Krusial untuk Delivery Aplikasi Berkualitas High-Speed

Selain *branching* dan *merging*, berikut poin vital pendukung yang wajib diterapkan *solo developer* agar rilis aplikasi tetap stabil dan cepat:

### A. Test-Driven Development (TDD) Ringan bersama Copilot
Jangan pernah membuat fitur besar tanpa pengujian automatik. Copilot sangat unggul dalam menulis *unit test*.
1. Setelah membuat fungsi dasar, buka file tes (misal: `user.test.ts`).
2. Ketik di Copilot Chat:
   > *"Buatkan unit test menggunakan Vitest/Jest untuk fungsi `validateCSVInput` mencakup skenario sukses, input kosong, dan format invalid."*
3. Jalankan tes sebelum melakukan *merge* ke `main`.

### B. Otomatisasi Dokumentasi
Sebagai *solo developer*, Anda tidak memiliki *technical writer*. Manfaatkan Copilot untuk menjaga dokumentasi tetap hidup:
* Sebelum merilis versi baru, minta Copilot memperbarui `CHANGELOG.md` dan `USER_GUIDE.md`:
  > *"@workspace buatkan ringkasan perubahan (changelog) berdasarkan commit-commit terakhir di branch ini."*

### C. Penjagaan Mutu Kode (Linting & Formatting)
Konfigurasikan **ESLint** dan **Prettier** agar berjalan otomatis saat *save* atau *commit* (*pre-commit hook* via Husky). Jangan biarkan Copilot memberikan gaya penulisan kode yang tidak konsisten dengan proyek Anda.

### D. Keamanan Kredensial (Environment Variables)
Selalu ingatkan Copilot untuk tidak menaruh kata sandi, *API Key*, atau token secara *hardcode*.
* Buat file `.env.example`.
* Minta Copilot: *"Buatkan isi `.env.example` berdasarkan variabel environment yang digunakan dalam modul ini tanpa memasukkan nilai rahasianya."*

---

## Ringkasan Check List Harian Solo Developer

- [ ] Selalu berada di *branch* khusus (`feature/`, `bugfix/`) sebelum mulai mengetik.
- [ ] Buat *commit* kecil (*atomic*) secara berkala dengan tombol Sparkle Copilot.
- [ ] Jalankan *unit test* dan linter sebelum merge.
- [ ] Lakukan *Self-Review* dengan Copilot Chat sebelum kembali ke `main`.
- [ ] Hapus *branch* fitur segera setelah merge berhasil diselesaikan.