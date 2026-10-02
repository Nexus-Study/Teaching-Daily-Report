saya ingin mengembangkan halaman profil seperti di app/portal/page.tsx. fitur akan dibuatkan folder sendiri di app/portal/profil
aplikasi saat ini di tahap deployment mvp. fitur profil digunakan oleh pengguna untuk
memodifikasi nama, email, password, mata pelajaran, kelas mengajar, jam mengajar, 

halaman profil terdiri dari dua tab:
profil | ubah email & password


tab profil terdiri dari:

Nama Lengkap dengan gelar
Role --> berupa multiple check, role akan dikirim ke supabase
----
Mata Pelajaran: dropdown dengan kolom input yang bisa diketik.
Kelas mengajar: muncul tulisan `+ kelas mengajar`. setelah itu muncul UI seperti di bawah:
{kelas} (dropdown) | {hari} | {jam_mulai} (dropdown) - {jam_selesai} (dropdown)

catatan: 
1. `jam_mulai` dan `jam_selesai` terdiri dari pilihan 1-8 (numerik)
2. sejumlah guru mengajar beberapa mata pelajaran, sehingga mungkin hubungan antara Mata pelajaran dan kelas mengajar ditampilkan dalam satu kartu. guru bisa menambahkan kartu mata pelajaran lain setelah selai mengisi satu mata pelajaran beserta kelas, hari, dan jam mengajarnya. setiap kartu mata pelajaran disediakan ikon pena agar pengguna tidak salah menekan sehingga mengubah data mereka. icon pena ini juga berlaku untuk isian lain.
3. pada bagian kelas mengajar, munculkan tombol selesai, dan data hanya tersimpan bila menekan tombol selesai di setiap isian kelas mengajar. 

Tab Profil terdiri dari:
Email: -- dengan opsi untuk mengubah email
password: dengan opsi untuk mengubah password. 
---
berdasarkan sql_schema.md saya berpikiran bahwa dibutuhkan tabel baru khusus memasukkan data jadwal mengajar guru. uji kemungkinan ini.

---
identifikasi gap pengetahuan atau konteks.


----
Tanggapan gemini
Aturan Perubahan Role:Apakah pengguna (guru) bebas mencentang dan mengubah roles mereka sendiri di halaman profil (misal: menambahkan wali_kelas atau guru_piket), atau ada batasan/role khusus yang hanya boleh diubah oleh Admin?
Pengguna bebas memasukkan sendiri peran mereka, kecuali kamad dan admin. kedua pilihan yang disebutkan ini tidak muncul di daftar role. 

Master Data Mata Pelajaran:Apakah data Mata Pelajaran murni berupa string bebas (creatable input), atau perlu diambil dari daftar master tertentu yang dikombinasikan dengan input kustom? berasal dari data master, fixed tidak perlu input custom. Pertimbangkan untuk membuat tabel sendiri dalam hubungan dengan quota gratis supabase atau hardcoded saja. bila membuat tabel baru di supabase, tabel bisa diisi dengan mata pelajaran dan jumlah jam per mata pelajaran, sehingga mempermudah pengisian di kelas mengajar, misalnya. guru tidak mungkin salah mengisi jam selesai. 

Mekanisme Ubah Email & Password:Apakah proses pengubahan email/password di tab kedua memerlukan verifikasi password lama terlebih dahulu, atau cukup menggunakan fungsi bawaan Supabase Auth (supabase.auth.updateUser) dengan konfirmasi email baru? verifikasi password lama terlebih dahulu, tidak perlu email verifikasi. 

Format Hari & Validasi Jam Mengajar:Apakah pilihan hari dibatasi pada hari kerja tertentu (misal: Senin – Sabtu)?Apakah sistem perlu memvalidasi aturan jam (misal: jam_mulai harus $\le$ jam_selesai, atau pencegahan jadwal bentrok di jam yang sama)? Hari, senin sampai sabtu. jam mulai harus dibawah jam selesai, dengan pencegahan bentrokan jadwal di jam dan hari yang sama di kelas yang sama. pertanyaan tentang master data mata pelajaran di atas, berkaitan dengan aspek ini. 

Penyimpanan Status Isian Kartu (Draft vs Permanen):Catatan Anda menyebutkan data hanya tersimpan bila menekan tombol "Selesai" di setiap isian kelas/kartu. Apakah penekanan tombol "Selesai" langsung melakukan eksekusi simpan ke basis data (via Server Action/Supabase Client), atau hanya mengunci form di UI lokal lalu ada 1 tombol "Simpan Semua" di bagian bawah halaman? langsung dikirimkan saja. 

/disc lanjutkan dulu diskusi kita agar saya bisa memastikan kejelasan rencana eksekusi.


----
-- 1. Buat Tabel public.mata_pelajaran
CREATE TABLE IF NOT EXISTS public.mata_pelajaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_mapel text NOT NULL UNIQUE,
  jumlah_jam integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Buat Tabel public.jadwal_guru
CREATE TABLE IF NOT EXISTS public.jadwal_guru (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mapel_id uuid NOT NULL REFERENCES public.mata_pelajaran(id) ON DELETE CASCADE,
  kelas_id uuid NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  hari text NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')),
  jam_mulai integer NOT NULL CHECK (jam_mulai >= 1 AND jam_mulai <= 8),
  jam_selesai integer NOT NULL CHECK (jam_selesai >= 1 AND jam_selesai <= 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT check_jam_order CHECK (jam_mulai < jam_selesai),
  CONSTRAINT unique_jadwal_kelas_hari_jam UNIQUE (kelas_id, hari, jam_mulai)
);

-- 3. Aktifkan RLS
ALTER TABLE public.mata_pelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jadwal_guru ENABLE ROW LEVEL SECURITY;

-- Policy mata_pelajaran
CREATE POLICY "Semua user terotentikasi dapat membaca mata_pelajaran" 
  ON public.mata_pelajaran FOR SELECT 
  TO authenticated 
  USING (true);

-- Policy jadwal_guru
CREATE POLICY "Semua user terotentikasi dapat membaca jadwal_guru" 
  ON public.jadwal_guru FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Guru dapat menambah jadwalnya sendiri" 
  ON public.jadwal_guru FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Guru dapat memperbarui jadwalnya sendiri" 
  ON public.jadwal_guru FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Guru dapat menghapus jadwalnya sendiri" 
  ON public.jadwal_guru FOR DELETE 
  TO authenticated 
  USING (auth.uid() = teacher_id);

-- 4. Seed Data Awal Mata Pelajaran
INSERT INTO public.mata_pelajaran (nama_mapel, jumlah_jam) VALUES
  ('Al-Qur''an Hadis',2)
  ('Akidah Akhlak',2)
  ('Fikih',2)
  ('SKI',2)
  ('Pendidikan Pancasila',)
  ('Bahasa Indonesia',)
  ('Bahasa Arab',3)
  ('Bahasa Inggris',3)
  ('Matematika',)
  ('IPA',)
  ('PJOK',)
  ('Informatika',)
  ('Seni dan Prakarya',)
  ('Mulok',)
  ('Tahfizh',)
  ('Kokurikuler',)
ON CONFLICT (nama_mapel) DO NOTHING;


---
 