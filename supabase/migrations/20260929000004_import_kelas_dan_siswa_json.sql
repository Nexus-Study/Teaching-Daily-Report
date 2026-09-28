-- Migration: Import Kelas dan Siswa dari JSON/CSV
-- Sprint 3 [TICK-11]

ALTER TABLE public.kelas
  ADD CONSTRAINT kelas_nama_kelas_tingkat_key UNIQUE (nama_kelas, tingkat);

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
    SELECT 1 FROM temp_import_rows
    WHERE full_name IS NULL OR nisn IS NULL OR nama_kelas IS NULL OR tingkat IS NULL
  ) THEN
    RAISE EXCEPTION 'CSV payload contains incomplete rows';
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
    ON CONFLICT (nama_kelas, tingkat)
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