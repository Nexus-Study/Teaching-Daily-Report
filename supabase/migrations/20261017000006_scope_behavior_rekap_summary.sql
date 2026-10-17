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
    WHERE
      public.has_any_role(
        auth.uid(),
        ARRAY['admin', 'guru_bk', 'waka_kesiswaan', 'kamad']::public.user_role[]
      )
      OR (
        public.has_any_role(auth.uid(), ARRAY['wali_kelas']::public.user_role[])
        AND public.is_wali_kelas_of_siswa(auth.uid(), catatan.siswa_id)
      )
      OR (
        public.has_any_role(
          auth.uid(),
          ARRAY['guru_mapel', 'guru_tahfidz']::public.user_role[]
        )
        AND catatan.reporter_id = auth.uid()
      )
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
