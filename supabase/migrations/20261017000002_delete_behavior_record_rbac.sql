CREATE POLICY "Catatan Perilaku - Delete Authorized"
ON public.catatan_perilaku
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'guru_bk')
  OR (
    public.has_role(auth.uid(), 'admin')
    AND reporter_id = auth.uid()
  )
);
