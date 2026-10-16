CREATE OR REPLACE FUNCTION public.get_perilaku_handler_profiles(p_catatan_ids UUID[])
RETURNS TABLE (id UUID, full_name TEXT, roles public.user_role[])
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT profile.id, profile.full_name, profile.roles
  FROM public.catatan_perilaku catatan
  JOIN public.profiles profile
    ON profile.id = catatan.reporter_id
    OR EXISTS (
      SELECT 1
      FROM public.penanganan_perilaku handling
      WHERE handling.catatan_id = catatan.id
        AND handling.handler_id = profile.id
    )
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
