-- Migration: Atomic Catatan Perilaku + Penanganan Awal
-- Sprint 2 [TICK-07]

CREATE OR REPLACE FUNCTION public.submit_catatan_perilaku(
  p_reporter_id UUID,
  p_siswa_id UUID,
  p_tanggal DATE,
  p_poin INTEGER,
  p_jenis public.perilaku_type,
  p_deskripsi TEXT,
  p_tindak_lanjut TEXT DEFAULT NULL,
  p_status public.penanganan_status DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_catatan_id UUID;
  final_status public.penanganan_status;
BEGIN
  IF p_reporter_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized reporter';
  END IF;

  INSERT INTO public.catatan_perilaku (
    siswa_id,
    reporter_id,
    tanggal,
    poin,
    jenis,
    deskripsi
  )
  VALUES (
    p_siswa_id,
    p_reporter_id,
    COALESCE(p_tanggal, CURRENT_DATE),
    COALESCE(p_poin, 0),
    COALESCE(p_jenis, 'pelanggaran'::public.perilaku_type),
    p_deskripsi
  )
  RETURNING id INTO new_catatan_id;

  IF p_tindak_lanjut IS NOT NULL AND length(trim(p_tindak_lanjut)) > 0 THEN
    final_status := COALESCE(p_status, 'ditangani_di_tempat'::public.penanganan_status);

    INSERT INTO public.penanganan_perilaku (
      catatan_id,
      handler_id,
      tanggal,
      tindak_lanjut,
      status
    )
    VALUES (
      new_catatan_id,
      p_reporter_id,
      COALESCE(p_tanggal, CURRENT_DATE),
      p_tindak_lanjut,
      final_status
    );
  END IF;

  RETURN new_catatan_id;
END;
$$;

ALTER TABLE public.penanganan_perilaku
  ADD CONSTRAINT penanganan_perilaku_catatan_handler_tanggal_key UNIQUE (catatan_id, handler_id, tanggal);
