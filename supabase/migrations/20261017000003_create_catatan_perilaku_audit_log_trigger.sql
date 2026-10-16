CREATE TABLE public.catatan_perilaku_deleted_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id UUID NOT NULL,
  siswa_id UUID NOT NULL,
  reporter_id UUID,
  handler_id UUID,
  kategori TEXT,
  deskripsi TEXT,
  poin INT,
  status_penanganan TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_by UUID DEFAULT auth.uid(),
  raw_payload JSONB NOT NULL
);

ALTER TABLE public.catatan_perilaku_deleted_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.catatan_perilaku_deleted_logs FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.catatan_perilaku_deleted_logs TO service_role;

CREATE OR REPLACE FUNCTION public.log_catatan_perilaku_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  latest_handling public.penanganan_perilaku%ROWTYPE;
  handling_payload JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(to_jsonb(handling) ORDER BY handling.created_at DESC, handling.id DESC),
    '[]'::JSONB
  )
  INTO handling_payload
  FROM public.penanganan_perilaku AS handling
  WHERE handling.catatan_id = OLD.id;

  SELECT handling.*
  INTO latest_handling
  FROM public.penanganan_perilaku AS handling
  WHERE handling.catatan_id = OLD.id
  ORDER BY handling.created_at DESC, handling.id DESC
  LIMIT 1;

  INSERT INTO public.catatan_perilaku_deleted_logs (
    original_id,
    siswa_id,
    reporter_id,
    handler_id,
    kategori,
    deskripsi,
    poin,
    status_penanganan,
    created_at,
    updated_at,
    raw_payload
  )
  VALUES (
    OLD.id,
    OLD.siswa_id,
    OLD.reporter_id,
    latest_handling.handler_id,
    OLD.jenis::TEXT,
    OLD.deskripsi,
    OLD.poin,
    latest_handling.status::TEXT,
    OLD.created_at,
    latest_handling.updated_at,
    jsonb_build_object(
      'catatan_perilaku', to_jsonb(OLD),
      'penanganan_perilaku', handling_payload
    )
  );

  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.log_catatan_perilaku_deletion() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS tr_log_catatan_perilaku_deletion ON public.catatan_perilaku;
CREATE TRIGGER tr_log_catatan_perilaku_deletion
BEFORE DELETE ON public.catatan_perilaku
FOR EACH ROW
EXECUTE FUNCTION public.log_catatan_perilaku_deletion();
