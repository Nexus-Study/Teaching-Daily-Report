CREATE OR REPLACE FUNCTION public.get_catatan_perilaku_summary()
RETURNS TABLE (
  perlu_tindakan BIGINT,
  proses BIGINT,
  selesai BIGINT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
  WITH latest_handling AS (
    SELECT DISTINCT ON (handling.catatan_id)
      handling.catatan_id,
      handling.status::TEXT AS status
    FROM public.penanganan_perilaku AS handling
    ORDER BY
      handling.catatan_id,
      GREATEST(handling.created_at, handling.updated_at) DESC,
      handling.created_at DESC,
      handling.id DESC
  ),
  visible_records AS (
    SELECT latest_handling.status
    FROM public.catatan_perilaku AS catatan
    LEFT JOIN latest_handling
      ON latest_handling.catatan_id = catatan.id
  )
  SELECT
    COUNT(*) FILTER (
      WHERE status IS NULL OR status IN ('perlu_tindakan', 'diteruskan')
    ) AS perlu_tindakan,
    COUNT(*) FILTER (WHERE status = 'proses') AS proses,
    COUNT(*) FILTER (WHERE status IN ('ditangani_di_tempat', 'selesai')) AS selesai
  FROM visible_records;
$$;

REVOKE ALL ON FUNCTION public.get_catatan_perilaku_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_catatan_perilaku_summary() TO authenticated;
