# Ekosistem Dokumentasi Proyek untuk Solo Developer & GitHub Copilot

Sebagai *solo developer* yang menggunakan GitHub Copilot, dokumentasi berfungsi ganda: sebagai **kompas bagi Anda (manusia)** dan sebagai **konteks/instruksi bagi Copilot (AI)**. Tanpa konteks yang jelas, Copilot akan memberikan kode generik yang mungkin tidak sesuai dengan standar proyek Anda.

---

## BAGIAN 1: Dokumentasi untuk Copilot (AI-Facing Documentation)

Dokumen-dokumen ini ditaruh di dalam repositori agar Copilot (terutama via pemanggilan `@workspace` atau mode Agent) dapat membaca aturan dan struktur proyek Anda secara otomatis.

```
.github/
└── copilot-instructions.md   <-- [UTAMA] Instruksi global & aturan main Copilot
docs/
├── ARCHITECTURE.md            <-- Gambaran arsitektur & skema data
└── CONVENTIONS.md            <-- Aturan coding, library, & styling
```

---

### 1. `.github/copilot-instructions.md` (SANGAT KRUSIAL)

VS Code dan GitHub Copilot secara otomatis membaca file ini setiap kali Anda meminta bantuan di Chat atau Edits. File ini berisi aturan tidak tertulis proyek Anda.

#### Contoh Isi Berkas `.github/copilot-instructions.md`:

```markdown
# Aturan & Standar Proyek (Copilot Custom Instructions)

## Tech Stack Utama
- Framework: Next.js (App Router) / React
- Bahasa: TypeScript (Strict Mode Wajib)
- Styling: Tailwind CSS
- Database/Storage: IndexedDB (Client) + PostgreSQL (Server)

## Aturan Penulisan Kode
- Gunakan Functional Components dengan TypeScript interface untuk props.
- Semua fungsi async harus dibungkus dalam try-catch block dengan penanganan error yang jelas.
- Hindari penggunaan `any` dalam TypeScript; selalu definisikan tipe data/interface di folder `src/types/`.
- Gunakan Bahasa Indonesia untuk komentar kode dan pesan error ke pengguna akhir.
- Gunakan camelCase untuk variabel/fungsi, dan PascalCase untuk komponen/tipe data.

## Arsitektur & Keamanan
- Jangan pernah menuliskan API Key atau rahasia secara hardcode. Selalu gunakan `process.env.NEXT_PUBLIC_...`.
- Untuk fitur Offline-First, selalu utamakan pengecekan koneksi sebelum melakukan fetch ke server.
```

> **Cara Memperbarui Secara Berkesinambungan:** 
> Setiap kali Anda membuat keputusan teknologi baru (misal: "Sekarang kita pakai library `Zod` untuk validasi form"), langsung tambahkan 1 baris aturan baru di file ini. Copilot akan langsung mematuhinya pada perintah berikutnya.

---

### 2. `docs/ARCHITECTURE.md` (Arsitektur & Skema Data)

Copilot perlu memahami bagaimana modul-modul dalam aplikasi Anda saling berhubungan. File ini memberikan gambaran peta besar sistem.

#### Komponen Utama yang Wajib Ada:
* **Struktur Folder:** Jelaskan fungsi tiap folder di `src/` (misal: `src/services/`, `src/components/`, `src/hooks/`).
* **Skema Data / Database:** Definisi tabel, kolom, atau struktur IndexedDB.
* **Alur Data Utama:** Penjelasan singkat alur sinkronisasi data atau autentikasi.

> **Tips Prompt Copilot:**
> *"@workspace berdasarkan docs/ARCHITECTURE.md, buatkan fungsi API handler baru untuk modul data siswa."*

---

### 3. `docs/CONVENTIONS.md` (Standar UI & Komponen)

Jika aplikasi Anda memiliki desain atau pola *state management* khusus, simpan polanya di sini.

#### Isi Ringkas:
* Komponen UI yang dipakai (misal: Shadcn UI, Material UI, atau Kustom Tailwind).
* Pola *State Management* (misal: Zustand, Redux, atau React Context).
* Format respons API standar (`{ success: boolean, data: any, message: string }`).

---

## BAGIAN 2: Dokumentasi untuk Manusia (Human-Facing Documentation)

Sebagai *solo developer*, Anda tidak perlu menulis dokumen-dokumen ini secara manual dari nol. **Gunakan Copilot untuk mengagregasi kode dan menuliskan dokumen ini untuk Anda.**

```
./
├── README.md                 <-- Pintu masuk teknis proyek
├── USER_GUIDE.md             <-- Panduan penggunaan untuk pengguna akhir
├── CHANGELOG.md              <-- Catatan riwayat versi & rilis
└── .env.example              <-- Contoh konfigurasi environment
```

---

### 1. `README.md` (Dokumen Utama Proyek)
* **Target Pembaca:** Anda di masa depan, atau developer lain yang melihat repositori.
* **Isi Utama:** Deskripsi proyek, syarat prasyarat (*prerequisites*), cara instalasi lokal (`npm install`), cara menjalankan server dev (`npm run dev`), dan daftar environment variables.
* **Peran Copilot:** Minta Copilot membuatkan draf `README.md` berdasarkan `@workspace`.

---

### 2. `USER_GUIDE.md` (Panduan Pengguna Akhir)
* **Target Pembaca:** Pengguna aplikasi (guru, admin, siswa, atau klien).
* **Isi Utama:** Cara menggunakan fitur-fitur aplikasi tanpa bahasa teknis/coding. Langkah demi langkah dilengkapi penjelasan tombol/menu.
* **Peran Copilot:** Minta Copilot membaca file komponen UI/Form Anda lalu mengubahnya menjadi langkah-langkah penggunaan berbasis bahasa awam.

---

### 3. `CHANGELOG.md` (Catatan Perubahan)
* **Target Pembaca:** Anda & pengguna yang ingin tahu apa yang baru di versi tertentu.
* **Isi Utama:** Daftar fitur baru (*Added*), perbaikan bug (*Fixed*), dan perubahan sistem (*Changed*) per versi (v1.0.0, v1.1.0).
* **Peran Copilot:** Sebelum *merge* ke branch `main`, minta Copilot membaca daftar *commit* terbaru untuk memperbarui `CHANGELOG.md`.

---

### 4. `.env.example` (Templat Environment Variables)
* **Target Pembaca:** Siapa pun yang mengkloning proyek.
* **Isi Utama:** Daftar kunci variabel lingkungan tanpa nilai rahasianya.
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname
  NEXT_PUBLIC_API_URL=http://localhost:3000
  ```

---

## BAGIAN 3: Siklus Pembaruan Berkesinambungan (Workflow Matrix)

Agar dokumentasi tidak usang (*stale*), ikuti alur kerja pembaruan otomatis berikut setiap kali Anda mengembangkan fitur baru:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIKLUS PENGEMBANGAN                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
  1. Tambah/Ubah Aturan Teknis Baru? ──► Update `.github/copilot-instructions.md`
                                │
                                ▼
  2. Tambah Modul/Fitur Baru?       ──► Update `docs/ARCHITECTURE.md`
                                │
                                ▼
  3. Koding Fitur Bersama Copilot   ──► Buat Fitur & Test
                                │
                                ▼
  4. Persiapan Rilis Versi/Merge?   ──► Minta Copilot Generate:
                                        - Update `USER_GUIDE.md`
                                        - Update `CHANGELOG.md`
```

---

## Prompt Siap Pakai untuk Meminta Copilot Membantu Dokumentasi

Berikut adalah beberapa *prompt* praktis yang bisa Anda salin-tempel ke **Copilot Chat**:

### A. Membuat `.github/copilot-instructions.md` Awal:
> *"@workspace Analisis seluruh struktur file dan paket yang ada di proyek ini. Buatkan draf file `.github/copilot-instructions.md` yang merangkum tech stack, konvensi penamaan, dan aturan penulisan kode yang digunakan di repositori ini."*

### B. Membuat / Memperbarui USER_GUIDE.md:
> *"@workspace Baca file `src/pages/ImportData.tsx`. Buatkan panduan langkah demi langkah cara mengimpor data menggunakan CSV untuk dokumen `USER_GUIDE.md`. Gunakan bahasa Indonesia yang ramah bagi pengguna awam."*

### C. Membuat CHANGELOG.md Sebelum Release:
> *"@workspace Buatkan ringkasan perubahan (changelog) berdasarkan perubahan berkas terbaru di branch ini. Kelompokkan ke dalam kategori: Fitur Baru, Perbaikan Bug, dan Peningkatan Performa."*