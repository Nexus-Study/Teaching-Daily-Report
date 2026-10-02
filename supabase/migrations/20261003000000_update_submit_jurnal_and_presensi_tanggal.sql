-- Migrasi: Menambahkan parameter p_tanggal pada RPC submit_jurnal_and_presensi

DROP FUNCTION IF EXISTS public.submit_jurnal_and_presensi(uuid, uuid, text, text, text, text, json);
DROP FUNCTION IF EXISTS public.submit_jurnal_and_presensi(uuid, uuid, text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.submit_jurnal_and_presensi(
  p_teacher_id uuid,
  p_kelas_id uuid,
  p_mata_pelajaran text,
  p_jam_ke text,
  p_materi text,
  p_catatan text DEFAULT NULL,
  p_presensi json DEFAULT '[]'::json,
  p_tanggal date DEFAULT CURRENT_DATE
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jurnal_id uuid;
  v_presensi_item json;
  v_siswa_id uuid;
  v_status public.presensi_status;
  v_catatan text;
BEGIN
  IF p_teacher_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized teacher';
  END IF;

  IF p_presensi IS NOT NULL AND json_typeof(p_presensi) <> 'array' THEN
    RAISE EXCEPTION 'Presensi payload must be an array';
  END IF;

  INSERT INTO public.jurnal_mengajar (
    teacher_id,
    kelas_id,
    mata_pelajaran,
    tanggal,
    jam_ke,
    materi,
    catatan
  )
  VALUES (
    p_teacher_id,
    p_kelas_id,
    p_mata_pelajaran,
    COALESCE(p_tanggal, CURRENT_DATE),
    p_jam_ke,
    p_materi,
    p_catatan
  )
  RETURNING id INTO v_jurnal_id;

  IF p_presensi IS NOT NULL AND json_array_length(p_presensi) > 0 THEN
    FOR v_presensi_item IN
      SELECT * FROM json_array_elements(p_presensi)
    LOOP
      v_siswa_id := (v_presensi_item->>'siswa_id')::uuid;
      v_status := COALESCE(
        NULLIF(v_presensi_item->>'status', '')::public.presensi_status,
        'hadir'
      );
      v_catatan := NULLIF(v_presensi_item->>'catatan', '');

      IF NOT EXISTS (
        SELECT 1
        FROM public.siswa
        WHERE id = v_siswa_id AND kelas_id = p_kelas_id
      ) THEN
        RAISE EXCEPTION 'Siswa % tidak sesuai dengan kelas %', v_siswa_id, p_kelas_id;
      END IF;

      INSERT INTO public.presensi_siswa (
        jurnal_id,
        siswa_id,
        status,
        catatan
      )
      VALUES (
        v_jurnal_id,
        v_siswa_id,
        v_status,
        v_catatan
      );
    END LOOP;
  END IF;

  RETURN v_jurnal_id::text;
END;
$$;
