-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  nip_nisn text UNIQUE,
  roles ARRAY NOT NULL DEFAULT ARRAY['guru_mapel'::user_role],
  avatar_url text,
  phone_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.kelas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama_kelas text NOT NULL UNIQUE,
  tingkat integer NOT NULL,
  wali_kelas_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT kelas_pkey PRIMARY KEY (id),
  CONSTRAINT kelas_wali_kelas_id_fkey FOREIGN KEY (wali_kelas_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.siswa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  nisn text NOT NULL UNIQUE,
  kelas_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT siswa_pkey PRIMARY KEY (id),
  CONSTRAINT siswa_kelas_id_fkey FOREIGN KEY (kelas_id) REFERENCES public.kelas(id)
);
CREATE TABLE public.jurnal_mengajar (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  kelas_id uuid NOT NULL,
  mata_pelajaran text NOT NULL,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  jam_ke text NOT NULL,
  materi text NOT NULL,
  catatan text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT jurnal_mengajar_pkey PRIMARY KEY (id),
  CONSTRAINT jurnal_mengajar_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.profiles(id),
  CONSTRAINT jurnal_mengajar_kelas_id_fkey FOREIGN KEY (kelas_id) REFERENCES public.kelas(id)
);
CREATE TABLE public.presensi_siswa (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  jurnal_id uuid NOT NULL,
  siswa_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'hadir'::presensi_status,
  catatan text,
  CONSTRAINT presensi_siswa_pkey PRIMARY KEY (id),
  CONSTRAINT presensi_siswa_jurnal_id_fkey FOREIGN KEY (jurnal_id) REFERENCES public.jurnal_mengajar(id),
  CONSTRAINT presensi_siswa_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES public.siswa(id)
);
CREATE TABLE public.catatan_perilaku (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  siswa_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  poin integer NOT NULL DEFAULT 0,
  jenis USER-DEFINED NOT NULL DEFAULT 'pelanggaran'::perilaku_type,
  deskripsi text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT catatan_perilaku_pkey PRIMARY KEY (id),
  CONSTRAINT catatan_perilaku_siswa_id_fkey FOREIGN KEY (siswa_id) REFERENCES public.siswa(id),
  CONSTRAINT catatan_perilaku_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.penanganan_perilaku (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  catatan_id uuid NOT NULL,
  handler_id uuid NOT NULL,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  tindak_lanjut text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'ditangani_di_tempat'::penanganan_status,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT penanganan_perilaku_pkey PRIMARY KEY (id),
  CONSTRAINT penanganan_perilaku_catatan_id_fkey FOREIGN KEY (catatan_id) REFERENCES public.catatan_perilaku(id),
  CONSTRAINT penanganan_perilaku_handler_id_fkey FOREIGN KEY (handler_id) REFERENCES public.profiles(id)
);