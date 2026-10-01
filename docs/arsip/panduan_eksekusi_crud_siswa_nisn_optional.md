# [EXEC-02] PANDUAN EKSEKUSI CRUD SISWA & NISN OPTIONAL

## [TIKET-1.1] SUPABASE SQL MIGRATION & RPC UPDATE

Eksekusi query berikut secara langsung di **Supabase SQL Editor**:

```sql
-- 1. Ubah kolom nisn pada public.siswa agar bisa bernilai NULL (opsional)
ALTER TABLE public.siswa ALTER COLUMN nisn DROP NOT NULL;

-- 2. Perbarui RPC Function import_kelas_dan_siswa_json untuk mendukung upsert berbasis NISN atau (full_name + kelas_id)
CREATE OR REPLACE FUNCTION public.import_kelas_dan_siswa_json(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item jsonb;
  v_kelas_id uuid;
  v_total_kelas integer := 0;
  v_total_siswa integer := 0;
  v_existing_siswa_id uuid;
  v_clean_nisn text;
BEGIN
  -- Looping data JSON
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_data)
  LOOP
    -- A. Dapatkan atau buat kelas berdasarkan nama_kelas dan tingkat
    SELECT id INTO v_kelas_id
    FROM public.kelas
    WHERE LOWER(nama_kelas) = LOWER(v_item->>'nama_kelas');

    IF v_kelas_id IS NULL THEN
      INSERT INTO public.kelas (nama_kelas, tingkat)
      VALUES (
        TRIM(v_item->>'nama_kelas'),
        (v_item->>'tingkat')::integer
      )
      RETURNING id INTO v_kelas_id;

      v_total_kelas := v_total_kelas + 1;
    END IF;

    -- B. Normalisasi NISN (kosongkan jika string kosong)
    v_clean_nisn := TRIM(v_item->>'nisn');
    IF v_clean_nisn = '' THEN
      v_clean_nisn := NULL;
    END IF;

    -- C. Cari siswa yang sudah ada
    v_existing_siswa_id := NULL;

    -- Opsi 1: Matching berdasarkan NISN jika NISN diisi
    IF v_clean_nisn IS NOT NULL THEN
      SELECT id INTO v_existing_siswa_id
      FROM public.siswa
      WHERE nisn = v_clean_nisn;
    END IF;

    -- Opsi 2: Fallback Matching berdasarkan full_name + kelas_id jika NISN kosong/tidak ketemu
    IF v_existing_siswa_id IS NULL THEN
      SELECT id INTO v_existing_siswa_id
      FROM public.siswa
      WHERE LOWER(TRIM(full_name)) = LOWER(TRIM(v_item->>'full_name'))
        AND kelas_id = v_kelas_id;
    END IF;

    -- D. Upsert Data Siswa
    IF v_existing_siswa_id IS NOT NULL THEN
      UPDATE public.siswa
      SET full_name = TRIM(v_item->>'full_name'),
          kelas_id = v_kelas_id,
          nisn = COALESCE(v_clean_nisn, nisn) -- Update NISN jika ada isian baru
      WHERE id = v_existing_siswa_id;
    ELSE
      INSERT INTO public.siswa (full_name, nisn, kelas_id)
      VALUES (
        TRIM(v_item->>'full_name'),
        v_clean_nisn,
        v_kelas_id
      );
      v_total_siswa := v_total_siswa + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'totalKelas', v_total_kelas,
    'totalSiswa', v_total_siswa
  );
END;
$$;
```

---

## [TIKET-2.1] SERVER ACTIONS (SISWA CRUD & PAGINATION)

* **Pilih Model di GitHub Copilot**: `Claude 3.5 Sonnet` ATAU `GPT-4o` (High-Logic)
* **File Target**: `@workspace app/portal/admin/actions.ts`
* **Instruksi**: Salin teks prompt di bawah dan tempelkan ke Chat GitHub Copilot di VS Code.

```text
@workspace app/portal/admin/actions.ts

Perbarui dan tambahkan Server Actions pada file app/portal/admin/actions.ts untuk penanganan data Siswa:

1. Perbarui `parseSiswaCSV(csvText: string)`:
   - Kolom `nisn` menjadi OPSIONAL. Jangan throw error jika `nisn` kosong.
   - Jika `nisn` kosong atau berisi whitespace saja, set nilainya menjadi `null`.

2. Buat `getKelasOptionsAction()`:
   - Ambil daftar seluruh kelas dari `public.kelas` (id, nama_kelas, tingkat) diurutkan berdasarkan `tingkat` asc dan `nama_kelas` asc.
   - Return list pilihan kelas.

3. Buat `getSiswaPaginatedAction(params: { search?: string; kelasId?: string; page?: number; limit?: number })`:
   - Ambil data dari `public.siswa` bergabung dengan `public.kelas(nama_kelas, tingkat)`.
   - Filter `search`: Jika diisi, filter `full_name` ilike `%search%` ATAU `nisn` ilike `%search%`.
   - Filter `kelasId`: Jika diisi, filter `kelas_id = kelasId`.
   - Lakukan server-side pagination dengan `page` (default 1) dan `limit` (default 25).
   - Return `{ data: SiswaWithKelas[], totalCount: number, page: number, totalPages: number }`.

4. Buat `createSiswaSingleAction(formData: FormData)`:
   - Ambil `full_name`, `nisn` (opsional, set null jika kosong), dan `kelas_id`.
   - Insert ke `public.siswa`.
   - Return `{ success: true }`.

5. Buat `updateSiswaAction(formData: FormData)`:
   - Ambil `siswa_id`, `full_name`, `nisn` (opsional, set null jika kosong), dan `kelas_id`.
   - Update data pada `public.siswa` di mana `id = siswa_id`.
   - Return `{ success: true }`.

6. Buat `deleteSiswaAction(siswaId: string)`:
   - Delete data dari `public.siswa` berdasarkan `id = siswaId`.
   - Return `{ success: true }`.

Gunakan type safety yang ketat dan tangani try-catch error secara konsisten.
```

---

## [TIKET-3.1] FRONTEND UI (KELOLA SISWA & FILTER GABUNGAN)

* **Pilih Model di GitHub Copilot**: `Claude 3.5 Haiku` ATAU `GPT-4o-mini` (Fast-Iteration)
* **File Target**: `@workspace app/portal/admin/page.tsx`
* **Instruksi**: Salin teks prompt di bawah dan tempelkan ke Chat GitHub Copilot di VS Code.

```text
@workspace app/portal/admin/page.tsx

Perbarui Tab Siswa pada file `app/portal/admin/page.tsx` untuk menyertakan UI Manajemen Data Siswa (CRUD) bersama modul Impor CSV Siswa:

1. Sub-Tab / Toggle Navigation:
   - Pada Tab Siswa, sediakan 2 Sub-tab: "Daftar & Kelola Siswa" dan "Impor CSV Siswa".

2. Fitur Filter & Search Kombinasi (Server-Side Triggered):
   - Input Search (Nama / NISN) dan Dropdown Select (Filter Kelas).
   - Pengguna dapat memfilter berdasarkan Nama saja, Kelas saja, atau Keduanya secara bersamaan.
   - Sediakan tombol "Cari" atau debounce otomatis untuk memanggil `getSiswaPaginatedAction`.

3. Tampilan Daftar Siswa & Paginasi:
   - Tampilkan daftar siswa dalam Card/Grid responsif (Mobile-First UI).
   - Tampilkan Nama, NISN (jika null, tampilkan badge "Belum ada NISN" warna orange/slate), dan Nama Kelas.
   - Sediakan tombol aksi: "Edit NISN/Data" dan "Hapus".
   - Tampilkan Kontrol Paginasi (Tombol Previous, Next, dan Info Halaman: Contoh "Halaman 1 dari 34 - Total 850 Siswa").

4. Modal Form (Tambah & Edit Siswa):
   - Modal Form reusable untuk Tambah dan Edit Siswa.
   - Input: Nama Lengkap, NISN (Bisa dikosongkan), dan Dropdown Pilih Kelas (muat via `getKelasOptionsAction`).
   - Hubungkan ke `createSiswaSingleAction` dan `updateSiswaAction` menggunakan React `useTransition`.

5. Konfirmasi Hapus:
   - Dialog konfirmasi sebelum memanggil `deleteSiswaAction`.
   - Refresh state daftar siswa setelah aksi Tambah, Edit, atau Hapus.

Pertahankan tema Dark UI konsisten (`bg-slate-950`, Tailwind CSS, Lucide Icons).
```