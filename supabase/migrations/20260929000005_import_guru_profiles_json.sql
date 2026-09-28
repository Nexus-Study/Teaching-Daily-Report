-- Migration: Import Guru Profiles from JSON/CSV
-- Sprint 3 [TICK-12]

CREATE OR REPLACE FUNCTION public.import_guru_profiles_json(p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item JSONB;
  total_guru INTEGER := 0;
  parsed_roles public.user_role[];
BEGIN
  IF p_data IS NULL OR jsonb_typeof(p_data) <> 'array' THEN
    RAISE EXCEPTION 'p_data must be a JSON array';
  END IF;

  FOR item IN
    SELECT value
    FROM jsonb_array_elements(p_data) AS value
  LOOP
    SELECT COALESCE(
      ARRAY_AGG(role::public.user_role),
      ARRAY['guru_mapel'::public.user_role]
    )
    INTO parsed_roles
    FROM jsonb_array_elements_text(COALESCE(item->'roles', '[]'::jsonb)) AS role;

    INSERT INTO public.profiles (
      id,
      full_name,
      nip_nisn,
      roles
    )
    VALUES (
      (item->>'user_id')::uuid,
      item->>'full_name',
      NULLIF(item->>'nip_nisn', ''),
      COALESCE(parsed_roles, ARRAY['guru_mapel'::public.user_role])
    )
    ON CONFLICT (id)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      nip_nisn = EXCLUDED.nip_nisn,
      roles = EXCLUDED.roles;

    total_guru := total_guru + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'totalGuru', total_guru
  );
END;
$$;