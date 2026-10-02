import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { Kelas, MataPelajaran, Profile } from '@/types/database';
import ProfileTabs from './components/profile-tabs';
import type { ProfileSchedule } from './components/profile-tab';

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (profileError || !profile) {
    redirect('/login');
  }

  const [mataPelajaranResult, kelasResult, jadwalResult] = await Promise.all([
    (supabase.from('mata_pelajaran') as any)
      .select('id, nama_mapel, jumlah_jam, created_at')
      .order('nama_mapel', { ascending: true }),
    (supabase.from('kelas') as any)
      .select('id, nama_kelas, tingkat, wali_kelas_id, created_at')
      .order('tingkat', { ascending: true })
      .order('nama_kelas', { ascending: true }),
    (supabase.from('jadwal_guru') as any)
      .select('id, teacher_id, mapel_id, kelas_id, hari, jam_mulai, jam_selesai, created_at, mata_pelajaran:mapel_id (id, nama_mapel, jumlah_jam), kelas:kelas_id (id, nama_kelas)')
      .eq('teacher_id', user.id)
      .order('hari', { ascending: true })
      .order('jam_mulai', { ascending: true }),
  ]);

  if (mataPelajaranResult.error) {
    throw new Error(mataPelajaranResult.error.message);
  }

  if (kelasResult.error) {
    throw new Error(kelasResult.error.message);
  }

  if (jadwalResult.error) {
    throw new Error(jadwalResult.error.message);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-10 pt-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="border-b border-white/10 pb-5">
          <p className="text-sm font-semibold text-cyan-300">Akun dan kegiatan mengajar</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Profil Saya</h1>
          <p className="mt-2 break-all text-sm text-slate-400">{user.email ?? profile.email ?? 'Email belum tersedia'}</p>
        </header>

        <ProfileTabs
          profile={profile}
          mataPelajaranList={(mataPelajaranResult.data ?? []) as MataPelajaran[]}
          kelasList={(kelasResult.data ?? []) as Kelas[]}
          jadwalList={(jadwalResult.data ?? []) as ProfileSchedule[]}
          currentEmail={user.email ?? profile.email ?? ''}
        />
      </div>
    </div>
  );
}