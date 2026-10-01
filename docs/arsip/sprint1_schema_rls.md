# [SQL-01] DDL SKEMA DATABASE & ROW LEVEL SECURITY (RLS) - SPRINT 1

**Versi:** v1.1

**Tujuan:** Inisialisasi Enum 9 Role, Tabel Profiles dengan Dukungan Multi-Role (Array Role), Helper Function RLS, dan Trigger Otomatis Auth.

### 1. Enum Role & Tabel Profiles (`[TICK-03]`)

```sql
-- 1. Buat Enum untuk 9 Role
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'kamad',
  'waka_kesiswaan',
  'waka_kurikulum',
  'guru_bk',
  'guru_mapel',
  'guru_tahfidz',
  'wali_kelas',
  'siswa'
);

-- 2. Buat Tabel Profiles dengan Support Multi-Role (1:1 dengan auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nip_nisn TEXT UNIQUE,
  roles public.user_role[] NOT NULL DEFAULT ARRAY['guru_mapel'::public.user_role],
  avatar_url TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS pada tabel profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Helper Functions PostgreSQL (`[TICK-04]`)

```sql
-- Helper 1: Mengambil daftar roles milik user aktif
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id UUID)
RETURNS public.user_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT roles FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

-- Helper 2: Mengecek apakah user memiliki setidaknya satu role yang dibutuhkan
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND required_role = ANY(roles)
  );
$$;

-- Helper 3: Mengecek apakah user memiliki salah satu dari daftar role yang diizinkan (Overlap)
CREATE OR REPLACE FUNCTION public.has_any_role(user_id UUID, allowed_roles public.user_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND roles && allowed_roles
  );
$$;
```

### 3. Kebijakan Row Level Security / RLS (`[TICK-04]`)

```sql
-- Policy 1: User dapat membaca profil mereka sendiri
CREATE POLICY "Profiles - Self Select"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admin & Pimpinan (Kamad, Waka) dapat melihat seluruh profil
CREATE POLICY "Profiles - Admin & Management Select All"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin', 'kamad', 'waka_kesiswaan', 'waka_kurikulum']::public.user_role[])
);

-- Policy 3: User dapat memperbarui profil mereka sendiri (Kecuali kolom roles)
CREATE POLICY "Profiles - Self Update"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  roles = public.get_user_roles(auth.uid()) -- Mencegah manipulasi perubahan roles mandiri
);

-- Policy 4: Hanya Admin yang dapat memperbarui roles atau profil pengguna lain
CREATE POLICY "Profiles - Admin Manage All"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 4. Trigger Auto-Create Profile Saat Registrasi Auth

```sql
-- Function pembuat profil otomatis saat auth.users dibuat
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_roles public.user_role[];
BEGIN
  -- Ekstrak array roles dari metadata, default ke ['guru_mapel'] jika kosong
  IF NEW.raw_user_meta_data->'roles' IS NOT NULL THEN
    SELECT ARRAY_AGG(elem::public.user_role)
    INTO default_roles
    FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') AS elem;
  ELSE
    default_roles := ARRAY['guru_mapel'::public.user_role];
  END IF;

  INSERT INTO public.profiles (id, full_name, roles)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE(default_roles, ARRAY['guru_mapel'::public.user_role])
  );
  RETURN NEW;
END;
$$;

-- Trigger pada tabel auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```