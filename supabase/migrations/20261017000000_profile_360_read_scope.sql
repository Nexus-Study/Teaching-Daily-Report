-- Align Profile 360 timeline reads with its server-side role and class guard.
CREATE POLICY "Catatan Perilaku - Profile 360 Read Scope"
ON public.catatan_perilaku FOR SELECT TO authenticated
USING (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'guru_bk', 'waka_kurikulum', 'waka_kesiswaan', 'kamad']::public.user_role[]
  ) OR
  public.is_wali_kelas_of_siswa(auth.uid(), siswa_id) OR
  EXISTS (
    SELECT 1
    FROM public.siswa s
    JOIN public.jadwal_guru j ON j.kelas_id = s.kelas_id
    WHERE s.id = catatan_perilaku.siswa_id
      AND j.teacher_id = auth.uid()
      AND public.has_role(auth.uid(), 'guru_mapel')
  )
);

CREATE POLICY "Penanganan Perilaku - Profile 360 Read Scope"
ON public.penanganan_perilaku FOR SELECT TO authenticated
USING (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'guru_bk', 'waka_kurikulum', 'waka_kesiswaan', 'kamad']::public.user_role[]
  ) OR
  EXISTS (
    SELECT 1
    FROM public.catatan_perilaku cp
    WHERE cp.id = penanganan_perilaku.catatan_id
      AND (
        cp.reporter_id = auth.uid() OR
        public.is_wali_kelas_of_siswa(auth.uid(), cp.siswa_id) OR
        EXISTS (
          SELECT 1
          FROM public.siswa s
          JOIN public.jadwal_guru j ON j.kelas_id = s.kelas_id
          WHERE s.id = cp.siswa_id
            AND j.teacher_id = auth.uid()
            AND public.has_role(auth.uid(), 'guru_mapel')
        )
      )
  )
);
