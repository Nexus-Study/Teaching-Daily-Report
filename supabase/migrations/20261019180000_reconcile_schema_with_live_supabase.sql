-- Reconcile table definitions with the live Supabase schema snapshot in
-- docs/aktif/konteks/sql_schema.md.
--
-- The snapshot lists table constraints, but does not inventory standalone
-- indexes. Keep indexes created by earlier migrations unless separately
-- verified against Supabase.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.kelas
    GROUP BY nama_kelas
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot align kelas uniqueness: duplicate nama_kelas values exist.'
      USING HINT = 'Resolve duplicate class names explicitly, then retry this migration.';
  END IF;
END;
$$;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id);

-- Match the snapshot's default NO ACTION behavior instead of cascading deletes.
ALTER TABLE public.kelas
  DROP CONSTRAINT IF EXISTS kelas_wali_kelas_id_fkey;
ALTER TABLE public.kelas
  ADD CONSTRAINT kelas_wali_kelas_id_fkey
  FOREIGN KEY (wali_kelas_id) REFERENCES public.profiles(id);

ALTER TABLE public.kelas
  DROP CONSTRAINT IF EXISTS kelas_nama_kelas_tingkat_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint AS constraint_info
    WHERE constraint_info.conrelid = 'public.kelas'::regclass
      AND constraint_info.contype = 'u'
      AND constraint_info.conkey = ARRAY[
        (
          SELECT column_info.attnum
          FROM pg_attribute AS column_info
          WHERE column_info.attrelid = 'public.kelas'::regclass
            AND column_info.attname = 'nama_kelas'
            AND NOT column_info.attisdropped
        )
      ]::smallint[]
  ) THEN
    ALTER TABLE public.kelas
      ADD CONSTRAINT kelas_nama_kelas_key UNIQUE (nama_kelas);
  END IF;
END;
$$;

ALTER TABLE public.siswa
  ALTER COLUMN nisn DROP NOT NULL,
  DROP CONSTRAINT IF EXISTS siswa_kelas_id_fkey;
ALTER TABLE public.siswa
  ADD CONSTRAINT siswa_kelas_id_fkey
  FOREIGN KEY (kelas_id) REFERENCES public.kelas(id);

ALTER TABLE public.jurnal_mengajar
  DROP CONSTRAINT IF EXISTS jurnal_mengajar_teacher_id_fkey,
  DROP CONSTRAINT IF EXISTS jurnal_mengajar_kelas_id_fkey;
ALTER TABLE public.jurnal_mengajar
  ADD CONSTRAINT jurnal_mengajar_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT jurnal_mengajar_kelas_id_fkey
    FOREIGN KEY (kelas_id) REFERENCES public.kelas(id);

ALTER TABLE public.presensi_siswa
  DROP CONSTRAINT IF EXISTS unique_presensi_per_jurnal,
  DROP CONSTRAINT IF EXISTS presensi_siswa_jurnal_id_fkey,
  DROP CONSTRAINT IF EXISTS presensi_siswa_siswa_id_fkey;
ALTER TABLE public.presensi_siswa
  ADD CONSTRAINT presensi_siswa_jurnal_id_fkey
    FOREIGN KEY (jurnal_id) REFERENCES public.jurnal_mengajar(id),
  ADD CONSTRAINT presensi_siswa_siswa_id_fkey
    FOREIGN KEY (siswa_id) REFERENCES public.siswa(id);

ALTER TABLE public.catatan_perilaku
  DROP CONSTRAINT IF EXISTS catatan_perilaku_siswa_id_fkey,
  DROP CONSTRAINT IF EXISTS catatan_perilaku_reporter_id_fkey;
ALTER TABLE public.catatan_perilaku
  ADD CONSTRAINT catatan_perilaku_siswa_id_fkey
    FOREIGN KEY (siswa_id) REFERENCES public.siswa(id),
  ADD CONSTRAINT catatan_perilaku_reporter_id_fkey
    FOREIGN KEY (reporter_id) REFERENCES public.profiles(id);

ALTER TABLE public.penanganan_perilaku
  DROP CONSTRAINT IF EXISTS penanganan_perilaku_catatan_id_fkey,
  DROP CONSTRAINT IF EXISTS penanganan_perilaku_handler_id_fkey;
ALTER TABLE public.penanganan_perilaku
  ADD CONSTRAINT penanganan_perilaku_catatan_id_fkey
    FOREIGN KEY (catatan_id) REFERENCES public.catatan_perilaku(id),
  ADD CONSTRAINT penanganan_perilaku_handler_id_fkey
    FOREIGN KEY (handler_id) REFERENCES public.profiles(id);

ALTER TABLE public.perilaku_deskripsi_audit
  DROP CONSTRAINT IF EXISTS perilaku_deskripsi_audit_edited_by_fkey;
ALTER TABLE public.perilaku_deskripsi_audit
  ADD CONSTRAINT perilaku_deskripsi_audit_edited_by_fkey
  FOREIGN KEY (edited_by) REFERENCES public.profiles(id);

CREATE OR REPLACE FUNCTION public.import_kelas_dan_siswa_json(p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  kelas_id UUID;
  total_kelas INTEGER := 0;
  total_siswa INTEGER := 0;
BEGIN
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'array' THEN
    RAISE EXCEPTION 'p_data must be a JSON array';
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS temp_import_rows (
    full_name TEXT,
    nisn TEXT,
    nama_kelas TEXT,
    tingkat INTEGER
  ) ON COMMIT DROP;

  TRUNCATE temp_import_rows;

  INSERT INTO temp_import_rows (full_name, nisn, nama_kelas, tingkat)
  SELECT
    NULLIF(trim(value->>'full_name'), ''),
    NULLIF(trim(value->>'nisn'), ''),
    NULLIF(trim(value->>'nama_kelas'), ''),
    (value->>'tingkat')::INTEGER
  FROM jsonb_array_elements(p_data) AS value;

  IF EXISTS (
    SELECT 1
    FROM temp_import_rows
    WHERE full_name IS NULL OR nisn IS NULL OR nama_kelas IS NULL OR tingkat IS NULL
  ) THEN
    RAISE EXCEPTION 'CSV payload contains incomplete rows';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM temp_import_rows
    GROUP BY nama_kelas
    HAVING COUNT(DISTINCT tingkat) > 1
  ) THEN
    RAISE EXCEPTION 'CSV payload contains multiple grade levels for the same class name';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM temp_import_rows AS imported
    JOIN public.kelas AS existing
      ON existing.nama_kelas = imported.nama_kelas
    WHERE existing.tingkat <> imported.tingkat
  ) THEN
    RAISE EXCEPTION 'Class name already exists with a different grade level';
  END IF;

  SELECT COUNT(DISTINCT (nama_kelas, tingkat))
  INTO total_kelas
  FROM temp_import_rows;

  FOR item IN
    SELECT to_jsonb(row_data)
    FROM temp_import_rows AS row_data
  LOOP
    INSERT INTO public.kelas (nama_kelas, tingkat)
    VALUES (
      item->>'nama_kelas',
      (item->>'tingkat')::INTEGER
    )
    ON CONFLICT (nama_kelas)
    DO UPDATE SET nama_kelas = EXCLUDED.nama_kelas
    RETURNING id INTO kelas_id;

    INSERT INTO public.siswa (full_name, nisn, kelas_id)
    VALUES (
      item->>'full_name',
      item->>'nisn',
      kelas_id
    )
    ON CONFLICT (nisn)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      kelas_id = EXCLUDED.kelas_id;

    total_siswa := total_siswa + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'totalKelas', total_kelas,
    'totalSiswa', total_siswa
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
