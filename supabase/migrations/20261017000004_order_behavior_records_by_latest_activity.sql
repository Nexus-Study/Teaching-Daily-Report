CREATE INDEX IF NOT EXISTS penanganan_perilaku_catatan_activity_idx
ON public.penanganan_perilaku (catatan_id, created_at DESC, updated_at DESC);

CREATE OR REPLACE FUNCTION public.get_catatan_perilaku_activity_order(
  p_limit INTEGER,
  p_cursor_activity_at TIMESTAMPTZ DEFAULT NULL,
  p_cursor_id UUID DEFAULT NULL
)
RETURNS TABLE (catatan_id UUID, activity_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'Batas rekap harus berupa bilangan bulat antara 1 dan 100.';
  END IF;

  IF (p_cursor_activity_at IS NULL) <> (p_cursor_id IS NULL) THEN
    RAISE EXCEPTION 'Cursor aktivitas rekap tidak valid.';
  END IF;

  RETURN QUERY
  WITH activity_rows AS (
    SELECT
      catatan.id AS id,
      GREATEST(
        catatan.created_at,
        COALESCE(MAX(GREATEST(handling.created_at, handling.updated_at)), catatan.created_at)
      ) AS latest_activity_at
    FROM public.catatan_perilaku AS catatan
    LEFT JOIN public.penanganan_perilaku AS handling
      ON handling.catatan_id = catatan.id
    GROUP BY catatan.id, catatan.created_at
  )
  SELECT activity_rows.id, activity_rows.latest_activity_at
  FROM activity_rows
  WHERE p_cursor_activity_at IS NULL
    OR activity_rows.latest_activity_at < p_cursor_activity_at
    OR (
      activity_rows.latest_activity_at = p_cursor_activity_at
      AND activity_rows.id < p_cursor_id
    )
  ORDER BY activity_rows.latest_activity_at DESC, activity_rows.id DESC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.get_catatan_perilaku_activity_order(INTEGER, TIMESTAMPTZ, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_catatan_perilaku_activity_order(INTEGER, TIMESTAMPTZ, UUID) TO authenticated;
