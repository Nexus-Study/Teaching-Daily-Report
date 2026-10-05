-- Migration: Penambahan Kolom Refleksi & Kebijakan RLS Edit/Hapus Jurnal Mengajar

-- 1. Penambahan Kolom Refleksi pada Tabel jurnal_mengajar
ALTER TABLE public.jurnal_mengajar 
ADD COLUMN IF NOT EXISTS refleksi text;

-- 2. Memastikan Row Level Security (RLS) Aktif
ALTER TABLE public.jurnal_mengajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi_siswa ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan RLS UPDATE pada jurnal_mengajar (Terisolasi per Guru)
DROP POLICY IF EXISTS "Guru dapat memperbarui jurnal milik sendiri" ON public.jurnal_mengajar;
CREATE POLICY "Guru dapat memperbarui jurnal milik sendiri"
ON public.jurnal_mengajar
FOR UPDATE
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

-- 4. Kebijakan RLS DELETE pada jurnal_mengajar (Terisolasi per Guru)
DROP POLICY IF EXISTS "Guru dapat menghapus jurnal milik sendiri" ON public.jurnal_mengajar;
CREATE POLICY "Guru dapat menghapus jurnal milik sendiri"
ON public.jurnal_mengajar
FOR DELETE
USING (auth.uid() = teacher_id);

-- 5. Kebijakan RLS UPDATE pada presensi_siswa (Melalui Kepemilikan Jurnal Parent)
DROP POLICY IF EXISTS "Guru dapat memperbarui presensi jurnal milik sendiri" ON public.presensi_siswa;
CREATE POLICY "Guru dapat memperbarui presensi jurnal milik sendiri"
ON public.presensi_siswa
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.jurnal_mengajar
    WHERE public.jurnal_mengajar.id = public.presensi_siswa.jurnal_id
    AND public.jurnal_mengajar.teacher_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.jurnal_mengajar
    WHERE public.jurnal_mengajar.id = public.presensi_siswa.jurnal_id
    AND public.jurnal_mengajar.teacher_id = auth.uid()
  )
);

-- 6. Kebijakan RLS DELETE pada presensi_siswa (Melalui Kepemilikan Jurnal Parent)
DROP POLICY IF EXISTS "Guru dapat menghapus presensi jurnal milik sendiri" ON public.presensi_siswa;
CREATE POLICY "Guru dapat menghapus presensi jurnal milik sendiri"
ON public.presensi_siswa
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.jurnal_mengajar
    WHERE public.jurnal_mengajar.id = public.presensi_siswa.jurnal_id
    AND public.jurnal_mengajar.teacher_id = auth.uid()
  )
);