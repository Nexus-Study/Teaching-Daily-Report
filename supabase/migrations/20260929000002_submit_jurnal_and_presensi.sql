-- Migration: Atomic Jurnal Mengajar + Presensi Insert
-- Sprint 2 [TICK-06]

CREATE OR REPLACE FUNCTION public.submit_jurnal_and_presensi(
  p_teacher_id UUID,
  p_kelas_id UUID,
  p_mata_pelajaran TEXT,
  p_jam_ke TEXT,
  p_materi TEXT,
  p_catatan TEXT DEFAULT NULL,
  p_presensi JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_jurnal_id UUID;
  presensi_item JSONB;
  siswa_uuid UUID;
  status_value public.presensi_status;
  catatan_value TEXT;
BEGIN
  IF p_teacher_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized teacher';
  END IF;

  IF p_presensi IS NULL OR jsonb_typeof(p_presensi) <> 'array' THEN
    RAISE EXCEPTION 'Presensi payload must be an array';
  END IF;

  INSERT INTO public.jurnal_mengajar (
    teacher_id,
    kelas_id,
    mata_pelajaran,
    jam_ke,
    materi,
    catatan
  )
  VALUES (
    p_teacher_id,
    p_kelas_id,
    p_mata_pelajaran,
    p_jam_ke,
    p_materi,
    p_catatan
  )
  RETURNING id INTO new_jurnal_id;

  FOR presensi_item IN
    SELECT *
    FROM jsonb_array_elements(p_presensi)
  LOOP
    siswa_uuid := (presensi_item->>'siswa_id')::uuid;
    status_value := COALESCE(NULLIF(presensi_item->>'status', '')::public.presensi_status, 'hadir');
    catatan_value := NULLIF(presensi_item->>'catatan', '');

    IF NOT EXISTS (
      SELECT 1
      FROM public.siswa
      WHERE id = siswa_uuid AND kelas_id = p_kelas_id
    ) THEN
      RAISE EXCEPTION 'Siswa % tidak sesuai dengan kelas %', siswa_uuid, p_kelas_id;
    END IF;

    INSERT INTO public.presensi_siswa (
      jurnal_id,
      siswa_id,
      status,
      catatan
    )
    VALUES (
      new_jurnal_id,
      siswa_uuid,
      status_value,
      catatan_value
    );
  END LOOP;

  RETURN new_jurnal_id;
END;
$$;