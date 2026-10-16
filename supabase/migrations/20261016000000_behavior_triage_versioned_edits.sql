ALTER TABLE public.penanganan_perilaku
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE public.penanganan_perilaku
SET created_at = updated_at
WHERE created_at IS NULL;

ALTER TABLE public.penanganan_perilaku
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.penanganan_perilaku
  DROP CONSTRAINT IF EXISTS penanganan_perilaku_catatan_handler_tanggal_key;

DROP POLICY IF EXISTS "Penanganan Perilaku - Insert Authorized" ON public.penanganan_perilaku;
DROP POLICY IF EXISTS "Penanganan Perilaku - Read & Manage Authorized" ON public.penanganan_perilaku;

CREATE POLICY "Penanganan Perilaku - Read Authorized"
ON public.penanganan_perilaku FOR SELECT TO authenticated
USING (
  auth.uid() = handler_id OR
  public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kesiswaan', 'guru_bk']::public.user_role[]) OR
  EXISTS (
    SELECT 1 FROM public.catatan_perilaku catatan
    WHERE catatan.id = penanganan_perilaku.catatan_id AND (
      catatan.reporter_id = auth.uid() OR
      public.is_wali_kelas_of_siswa(auth.uid(), catatan.siswa_id)
    )
  )
);

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

  IF p_status IS NOT NULL AND p_status NOT IN ('ditangani_di_tempat', 'diteruskan') THEN
    RAISE EXCEPTION 'Tindakan awal hanya dapat berstatus Ditangani di Tempat atau Diteruskan';
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
    COALESCE(p_tanggal, (NOW() AT TIME ZONE 'Asia/Jayapura')::DATE),
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
      COALESCE(p_tanggal, (NOW() AT TIME ZONE 'Asia/Jayapura')::DATE),
      p_tindak_lanjut,
      final_status
    );
  END IF;

  RETURN new_catatan_id;
END;
$$;

CREATE TABLE public.perilaku_deskripsi_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('catatan', 'penanganan')),
  entity_id UUID NOT NULL,
  old_text TEXT NOT NULL,
  edited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  edited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.perilaku_deskripsi_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perilaku Deskripsi Audit - Admin Select"
ON public.perilaku_deskripsi_audit FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.prevent_perilaku_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Perilaku description audit records are append-only';
END;
$$;

CREATE TRIGGER prevent_perilaku_deskripsi_audit_mutation
BEFORE UPDATE OR DELETE ON public.perilaku_deskripsi_audit
FOR EACH ROW EXECUTE FUNCTION public.prevent_perilaku_audit_mutation();

CREATE OR REPLACE FUNCTION public.get_perilaku_handler_profiles(p_catatan_ids UUID[])
RETURNS TABLE (id UUID, full_name TEXT, roles public.user_role[])
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT handler.id, handler.full_name, handler.roles
  FROM public.penanganan_perilaku handling
  JOIN public.catatan_perilaku catatan ON catatan.id = handling.catatan_id
  JOIN public.profiles handler ON handler.id = handling.handler_id
  WHERE auth.uid() IS NOT NULL
    AND catatan.id = ANY(COALESCE(p_catatan_ids, ARRAY[]::UUID[]))
    AND (
      catatan.reporter_id = auth.uid()
      OR public.is_wali_kelas_of_siswa(auth.uid(), catatan.siswa_id)
      OR public.has_any_role(
        auth.uid(),
        ARRAY['admin', 'kamad', 'waka_kesiswaan', 'guru_bk']::public.user_role[]
      )
    );
$$;

REVOKE ALL ON FUNCTION public.get_perilaku_handler_profiles(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_perilaku_handler_profiles(UUID[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_penanganan_eskalasi(
  p_catatan_id UUID,
  p_tindak_lanjut TEXT,
  p_status public.penanganan_status,
  p_tanggal DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  case_reporter_id UUID;
  case_wali_kelas_id UUID;
  is_triage_actor BOOLEAN;
  latest_status public.penanganan_status;
  new_handling_id UUID;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Pengguna belum terautentikasi';
  END IF;
  IF p_tindak_lanjut IS NULL OR length(trim(p_tindak_lanjut)) = 0 THEN
    RAISE EXCEPTION 'Tindak lanjut wajib diisi';
  END IF;
  IF p_status IS NULL THEN
    RAISE EXCEPTION 'Status penanganan wajib diisi';
  END IF;

  SELECT catatan.reporter_id, kelas.wali_kelas_id
  INTO case_reporter_id, case_wali_kelas_id
  FROM public.catatan_perilaku catatan
  JOIN public.siswa siswa ON siswa.id = catatan.siswa_id
  JOIN public.kelas kelas ON kelas.id = siswa.kelas_id
  WHERE catatan.id = p_catatan_id
  FOR UPDATE OF catatan;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Catatan perilaku tidak ditemukan';
  END IF;

  is_triage_actor :=
    COALESCE(public.has_any_role(actor_id, ARRAY['admin', 'guru_bk', 'waka_kesiswaan']::public.user_role[]), false)
    OR (
      COALESCE(public.has_role(actor_id, 'wali_kelas'), false)
      AND case_wali_kelas_id IS NOT NULL
      AND case_wali_kelas_id = actor_id
    );

  IF NOT is_triage_actor AND NOT (
    case_reporter_id = actor_id AND p_status = 'ditangani_di_tempat'
  ) THEN
    RAISE EXCEPTION 'Anda tidak berwenang mengubah status penanganan kasus ini';
  END IF;

  SELECT status INTO latest_status
  FROM public.penanganan_perilaku
  WHERE catatan_id = p_catatan_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF latest_status = 'selesai' THEN
    RAISE EXCEPTION 'Kasus berstatus selesai dan harus dibuka kembali terlebih dahulu';
  END IF;

  INSERT INTO public.penanganan_perilaku (catatan_id, handler_id, tanggal, tindak_lanjut, status, created_at)
  VALUES (p_catatan_id, actor_id, COALESCE(p_tanggal, (NOW() AT TIME ZONE 'Asia/Jayapura')::DATE), trim(p_tindak_lanjut), p_status, clock_timestamp())
  RETURNING id INTO new_handling_id;

  RETURN new_handling_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_penanganan_eskalasi(UUID, TEXT, public.penanganan_status, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_penanganan_eskalasi(UUID, TEXT, public.penanganan_status, DATE) TO authenticated;

CREATE OR REPLACE FUNCTION public.reopen_kasus_perilaku(
  p_catatan_id UUID,
  p_alasan TEXT,
  p_target_status public.penanganan_status,
  p_tanggal DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  case_wali_kelas_id UUID;
  latest_status public.penanganan_status;
  new_handling_id UUID;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Pengguna belum terautentikasi';
  END IF;
  IF p_alasan IS NULL OR length(trim(p_alasan)) = 0 THEN
    RAISE EXCEPTION 'Alasan pembukaan kembali wajib diisi';
  END IF;
  IF p_target_status IS NULL OR p_target_status NOT IN ('proses', 'diteruskan') THEN
    RAISE EXCEPTION 'Status pembukaan kembali harus Proses atau Diteruskan';
  END IF;

  SELECT kelas.wali_kelas_id
  INTO case_wali_kelas_id
  FROM public.catatan_perilaku catatan
  JOIN public.siswa siswa ON siswa.id = catatan.siswa_id
  JOIN public.kelas kelas ON kelas.id = siswa.kelas_id
  WHERE catatan.id = p_catatan_id
  FOR UPDATE OF catatan;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Catatan perilaku tidak ditemukan';
  END IF;

  IF NOT (
    COALESCE(public.has_any_role(actor_id, ARRAY['admin', 'guru_bk', 'waka_kesiswaan']::public.user_role[]), false)
    OR (
      COALESCE(public.has_role(actor_id, 'wali_kelas'), false)
      AND case_wali_kelas_id IS NOT NULL
      AND case_wali_kelas_id = actor_id
    )
  ) THEN
    RAISE EXCEPTION 'Anda tidak berwenang membuka kembali kasus ini';
  END IF;

  SELECT status INTO latest_status
  FROM public.penanganan_perilaku
  WHERE catatan_id = p_catatan_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF latest_status IS DISTINCT FROM 'selesai' THEN
    RAISE EXCEPTION 'Kasus hanya dapat dibuka kembali setelah berstatus selesai';
  END IF;

  INSERT INTO public.penanganan_perilaku (catatan_id, handler_id, tanggal, tindak_lanjut, status, created_at)
  VALUES (
    p_catatan_id,
    actor_id,
    COALESCE(p_tanggal, (NOW() AT TIME ZONE 'Asia/Jayapura')::DATE),
    'Dibuka kembali: ' || trim(p_alasan),
    p_target_status,
    clock_timestamp()
  )
  RETURNING id INTO new_handling_id;

  RETURN new_handling_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reopen_kasus_perilaku(UUID, TEXT, public.penanganan_status, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reopen_kasus_perilaku(UUID, TEXT, public.penanganan_status, DATE) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_perilaku_description(
  p_id UUID,
  p_is_catatan BOOLEAN,
  p_text_baru TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
  author_id UUID;
  created_time TIMESTAMPTZ;
  previous_text TEXT;
  entity_name TEXT := CASE WHEN p_is_catatan THEN 'catatan' ELSE 'penanganan' END;
BEGIN
  IF actor_id IS NULL THEN
    RAISE EXCEPTION 'Pengguna belum terautentikasi';
  END IF;

  IF p_text_baru IS NULL OR length(trim(p_text_baru)) = 0 THEN
    RAISE EXCEPTION 'Deskripsi wajib diisi';
  END IF;

  IF p_is_catatan THEN
    SELECT reporter_id, created_at, deskripsi
    INTO author_id, created_time, previous_text
    FROM public.catatan_perilaku
    WHERE id = p_id
    FOR UPDATE;
  ELSE
    SELECT handler_id, created_at, tindak_lanjut
    INTO author_id, created_time, previous_text
    FROM public.penanganan_perilaku
    WHERE id = p_id
    FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Catatan atau penanganan tidak ditemukan';
  END IF;

  IF author_id <> actor_id AND NOT public.has_role(actor_id, 'admin') THEN
    RAISE EXCEPTION 'Hanya penulis asli atau admin yang dapat mengedit deskripsi';
  END IF;

  IF created_time <= NOW() - INTERVAL '15 minutes' THEN
    INSERT INTO public.perilaku_deskripsi_audit (entity_type, entity_id, old_text, edited_by)
    VALUES (entity_name, p_id, previous_text, actor_id);
  END IF;

  IF p_is_catatan THEN
    UPDATE public.catatan_perilaku SET deskripsi = trim(p_text_baru) WHERE id = p_id;
  ELSE
    UPDATE public.penanganan_perilaku SET tindak_lanjut = trim(p_text_baru), updated_at = NOW() WHERE id = p_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.update_perilaku_description(UUID, BOOLEAN, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_perilaku_description(UUID, BOOLEAN, TEXT) TO authenticated;
