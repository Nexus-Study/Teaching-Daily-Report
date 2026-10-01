

-- Memastikan nama kelas bersifat unik untuk mencegah duplikasi saat bulk import
ALTER TABLE public.kelas 
ADD CONSTRAINT unique_nama_kelas UNIQUE (nama_kelas);



CREATE OR REPLACE FUNCTION public.import_kelas_dan_siswa_json(
  p_data JSONB
)
RETURNS TABLE(
  total_kelas_processed INT,
  total_siswa_processed INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_kelas_id UUID;
  v_nama_kelas TEXT;
  v_tingkat INT;
  v_full_name TEXT;
  v_nisn TEXT;
  v_kelas_count INT := 0;
  v_siswa_count INT := 0;
BEGIN
  -- Pastikan pemanggil fungsi adalah Admin atau Waka Kurikulum
  IF NOT public.has_any_role(auth.uid(), ARRAY['admin', 'waka_kurikulum']::public.user_role[]) THEN
    RAISE EXCEPTION 'Akses ditolak. Hanya Admin dan Waka Kurikulum yang diizinkan melakukan impor data.';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_data)
  LOOP
    v_nama_kelas := TRIM(v_item->>'nama_kelas');
    v_tingkat := COALESCE((v_item->>'tingkat')::INT, 10);
    v_full_name := TRIM(v_item->>'full_name');
    v_nisn := TRIM(v_item->>'nisn');

    IF v_nama_kelas IS NOT NULL AND v_nama_kelas <> '' THEN
      -- Insert or Get Kelas ID
      INSERT INTO public.kelas (nama_kelas, tingkat)
      VALUES (v_nama_kelas, v_tingkat)
      ON CONFLICT (nama_kelas) 
      DO UPDATE SET tingkat = EXCLUDED.tingkat
      RETURNING id INTO v_kelas_id;

      v_kelas_count := v_kelas_count + 1;

      -- Insert or Upsert Siswa jika nama dan NISN valid
      IF v_full_name IS NOT NULL AND v_full_name <> '' AND v_nisn IS NOT NULL AND v_nisn <> '' THEN
        INSERT INTO public.siswa (full_name, nisn, kelas_id)
        VALUES (v_full_name, v_nisn, v_kelas_id)
        ON CONFLICT (nisn)
        DO UPDATE SET 
          full_name = EXCLUDED.full_name,
          kelas_id = EXCLUDED.kelas_id;

        v_siswa_count := v_siswa_count + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_kelas_count, v_siswa_count;
END;
$$;

-- Reload schema cache PostgREST Supabase
NOTIFY pgrst, 'reload schema';
