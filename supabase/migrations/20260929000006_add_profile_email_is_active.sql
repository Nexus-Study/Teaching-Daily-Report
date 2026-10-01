-- Migration: Tambah kolom email & is_active pada profiles
-- Sprint 3 [TICK-13] - Kelola Guru (CRUD) di Dashboard Admin

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Email unik hanya untuk baris yang sudah terisi (hindari konflik NULL)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key
  ON public.profiles (email)
  WHERE email IS NOT NULL;

-- Backfill email dari auth.users untuk baris yang sudah ada
UPDATE public.profiles AS p
SET email = u.email
FROM auth.users AS u
WHERE p.id = u.id AND p.email IS NULL;

-- Perbarui trigger auto-create profile agar menyertakan email & is_active
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_roles public.user_role[];
BEGIN
  IF NEW.raw_user_meta_data->'roles' IS NOT NULL THEN
    SELECT ARRAY_AGG(elem::public.user_role)
    INTO default_roles
    FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') AS elem;
  ELSE
    default_roles := ARRAY['guru_mapel'::public.user_role];
  END IF;

  INSERT INTO public.profiles (id, full_name, email, roles, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    NEW.email,
    COALESCE(default_roles, ARRAY['guru_mapel'::public.user_role]),
    true
  );
  RETURN NEW;
END;
$$;
