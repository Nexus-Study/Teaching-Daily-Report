# [SQL-02] DDL SKEMA DATABASE & ROW LEVEL SECURITY (RLS) - SPRINT 2 (REVISED)

**Versi:** v1.1

**Tujuan:** Inisialisasi Tabel Entitas Akademik (Kelas, Siswa, Jurnal Mengajar, Presensi) dan Perilaku Siswa (Catatan Perilaku, Penanganan Berjenjang) beserta Kebijakan Access Control RLS Terintegrasi.

---

### 1. Enum Tipe Data

```sql
-- Status Kehadiran Siswa
CREATE TYPE public.presensi_status AS ENUM ('hadir', 'izin', 'sakit', 'alpa');

-- Kategori Perilaku
CREATE TYPE public.perilaku_type AS ENUM ('positif', 'pelanggaran');

-- Status Penanganan Perilaku (4 Tier Eskalasi)
CREATE TYPE public.penanganan_status AS ENUM ('ditangani_di_tempat', 'diteruskan', 'proses', 'selesai');
```

---

### 2. Tabel Akademik & Siswa (`[TICK-06]`)

```sql
-- Tabel Kelas / Rombel
CREATE TABLE IF NOT EXISTS public.kelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kelas TEXT NOT NULL,
  tingkat INTEGER NOT NULL,
  wali_kelas_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Siswa
CREATE TABLE IF NOT EXISTS public.siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nisn TEXT UNIQUE NOT NULL,
  kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Jurnal Mengajar Guru
CREATE TABLE IF NOT EXISTS public.jurnal_mengajar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kelas_id UUID NOT NULL REFERENCES public.kelas(id) ON DELETE CASCADE,
  mata_pelajaran TEXT NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  jam_ke TEXT NOT NULL,
  materi TEXT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Presensi Siswa per Jurnal
CREATE TABLE IF NOT EXISTS public.presensi_siswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurnal_id UUID NOT NULL REFERENCES public.jurnal_mengajar(id) ON DELETE CASCADE,
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  status public.presensi_status NOT NULL DEFAULT 'hadir',
  catatan TEXT,
  CONSTRAINT unique_presensi_per_jurnal UNIQUE (jurnal_id, siswa_id)
);
```

---

### 3. Tabel Perilaku & Penanganan Berjenjang (`[TICK-07]`)

```sql
-- Tabel Catatan Perilaku
CREATE TABLE IF NOT EXISTS public.catatan_perilaku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  siswa_id UUID NOT NULL REFERENCES public.siswa(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  poin INTEGER NOT NULL DEFAULT 0,
  jenis public.perilaku_type NOT NULL DEFAULT 'pelanggaran',
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Penanganan Perilaku (Penanganan Mandiri, BK, Wali Kelas, Kesiswaan)
CREATE TABLE IF NOT EXISTS public.penanganan_perilaku (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catatan_id UUID NOT NULL REFERENCES public.catatan_perilaku(id) ON DELETE CASCADE,
  handler_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  tindak_lanjut TEXT NOT NULL,
  status public.penanganan_status NOT NULL DEFAULT 'ditangani_di_tempat',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 4. Enable RLS pada Seluruh Tabel

```sql
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_mengajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_perilaku ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penanganan_perilaku ENABLE ROW LEVEL SECURITY;
```

---

### 5. Helper Function PostgreSQL untuk RLS Kelas & Wali Kelas

```sql
-- Helper untuk mengecek apakah user adalah wali kelas dari kelas tertentu
CREATE OR REPLACE FUNCTION public.is_wali_kelas_of_class(user_id UUID, target_kelas_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kelas
    WHERE id = target_kelas_id AND wali_kelas_id = user_id
  );
$$;

-- Helper untuk mengecek apakah user adalah wali kelas dari siswa tertentu
CREATE OR REPLACE FUNCTION public.is_wali_kelas_of_siswa(user_id UUID, target_siswa_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.siswa s
    JOIN public.kelas k ON s.kelas_id = k.id
    WHERE s.id = target_siswa_id AND k.wali_kelas_id = user_id
  );
$$;
```

---

### 6. Kebijakan Row Level Security (RLS)

#### A. Kebijakan RLS Tabel `kelas` & `siswa`

```sql
-- Seluruh user terautentikasi dapat membaca data kelas & siswa
CREATE POLICY "Kelas - Authenticated Select"
ON public.kelas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Siswa - Authenticated Select"
ON public.siswa FOR SELECT TO authenticated USING (true);

-- Hanya Admin / Kurikulum yang dapat mengelola data kelas & siswa
CREATE POLICY "Kelas - Admin Manage"
ON public.kelas FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'waka_kurikulum']::public.user_role[]));

CREATE POLICY "Siswa - Admin Manage"
ON public.siswa FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'waka_kurikulum']::public.user_role[]));
```

#### B. Kebijakan RLS Tabel `jurnal_mengajar` & `presensi_siswa`

```sql
-- Guru dapat membuat jurnal mengajar atas namanya sendiri
CREATE POLICY "Jurnal - Insert Self"
ON public.jurnal_mengajar FOR INSERT TO authenticated
WITH CHECK (auth.uid() = teacher_id);

-- Guru dapat mengedit/menghapus jurnal buatannya sendiri
CREATE POLICY "Jurnal - Update Delete Self"
ON public.jurnal_mengajar FOR UPDATE TO authenticated
USING (auth.uid() = teacher_id);

-- Pembatasan Akses Baca Jurnal:
-- 1. Pembuat jurnal (Guru ybs)
-- 2. Wali Kelas (Khusus jurnal di kelas bimbingannya)
-- 3. Manajemen (Admin, Kamad, Waka Kurikulum, Waka Kesiswaan)
CREATE POLICY "Jurnal - Read Authorized"
ON public.jurnal_mengajar FOR SELECT TO authenticated
USING (
  auth.uid() = teacher_id OR
  public.is_wali_kelas_of_class(auth.uid(), kelas_id) OR
  public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan']::public.user_role[])
);

-- Presensi Siswa: Mengikuti hak akses jurnal mengajar
CREATE POLICY "Presensi - Manage via Jurnal Teacher"
ON public.presensi_siswa FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jurnal_mengajar
    WHERE id = presensi_siswa.jurnal_id AND teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jurnal_mengajar
    WHERE id = presensi_siswa.jurnal_id AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Presensi - Read Authorized"
ON public.presensi_siswa FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jurnal_mengajar j
    WHERE j.id = presensi_siswa.jurnal_id AND (
      j.teacher_id = auth.uid() OR
      public.is_wali_kelas_of_class(auth.uid(), j.kelas_id) OR
      public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan']::public.user_role[])
    )
  )
);
```

#### C. Kebijakan RLS Tabel `catatan_perilaku` & `penanganan_perilaku`

```sql
-- Seluruh Guru dapat mencatat poin perilaku siswa
CREATE POLICY "Catatan Perilaku - Insert Guru"
ON public.catatan_perilaku FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Akses Baca Perilaku: Guru Pelapor, Wali Kelas Siswa, Guru BK, & Tim Manajemen
CREATE POLICY "Catatan Perilaku - Select Authorized"
ON public.catatan_perilaku FOR SELECT TO authenticated
USING (
  auth.uid() = reporter_id OR
  public.is_wali_kelas_of_siswa(auth.uid(), siswa_id) OR
  public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kesiswaan', 'guru_bk']::public.user_role[])
);

-- Penanganan Perilaku:
-- Guru Pelapor (dapat memasukkan penanganan mandiri), Wali Kelas, Guru BK, & Manajemen
CREATE POLICY "Penanganan Perilaku - Insert Authorized"
ON public.penanganan_perilaku FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = handler_id AND (
    EXISTS (
      SELECT 1 FROM public.catatan_perilaku cp
      WHERE cp.id = catatan_id AND (
        cp.reporter_id = auth.uid() OR
        public.is_wali_kelas_of_siswa(auth.uid(), cp.siswa_id)
      )
    ) OR
    public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kesiswaan', 'guru_bk']::public.user_role[])
  )
);

CREATE POLICY "Penanganan Perilaku - Read & Manage Authorized"
ON public.penanganan_perilaku FOR ALL TO authenticated
USING (
  auth.uid() = handler_id OR
  public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kesiswaan', 'guru_bk']::public.user_role[]) OR
  EXISTS (
    SELECT 1 FROM public.catatan_perilaku cp
    WHERE cp.id = penanganan_perilaku.catatan_id AND (
      cp.reporter_id = auth.uid() OR
      public.is_wali_kelas_of_siswa(auth.uid(), cp.siswa_id)
    )
  )
);
```