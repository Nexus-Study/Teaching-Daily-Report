DROP FUNCTION IF EXISTS public.submit_catatan_perilaku(
  UUID,
  UUID,
  public.perilaku_type,
  INTEGER,
  TEXT,
  DATE,
  TEXT,
  public.penanganan_status
);

NOTIFY pgrst, 'reload schema';
