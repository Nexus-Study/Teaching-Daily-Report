import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BarChart3, BookOpen, CalendarCheck, GraduationCap, LogOut, ShieldAlert, ShieldCheck, User } from 'lucide-react';

import { createClient } from '../../lib/supabase/server';
import type { Profile, UserRole } from '../../types/database';

type PortalMenu = {
  title: string;
  description: string;
  href: string;
  icon: typeof BookOpen;
  roles: UserRole[];
  iconClass: string;
  softTintClass: string;
};

const portalMenus: PortalMenu[] = [
  {
    title: 'Jurnal Harian',
    description: 'Input cepat jurnal mengajar dan rekap harian.',
    href: '/portal/jurnal/',
    icon: BookOpen,
    roles: ['admin', 'guru_mapel', 'guru_tahfidz', 'wali_kelas'],
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    softTintClass: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    title: 'Catatan & Penanganan Perilaku',
    description: 'Catat perilaku dan tindak lanjut kolaboratif.',
    href: '/portal/perilaku/',
    icon: ShieldAlert,
    roles: ['admin', 'guru_bk', 'wali_kelas', 'waka_kesiswaan', 'guru_mapel', 'guru_tahfidz'],
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    softTintClass: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    title: 'Rekap & Laporan',
    description: 'Laporan ringkas untuk pimpinan dan kurikulum.',
    href: '/portal/laporan/',
    icon: BarChart3,
    roles: ['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan'],
    iconClass: 'text-amber-600 dark:text-amber-400',
    softTintClass: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    title: 'Rekap Kehadiran',
    description: 'Rekap presensi mapel & alert ketidakhadiran siswa.',
    href: '/portal/rekap-kehadiran/',
    icon: CalendarCheck,
    roles: ['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan', 'guru_bk', 'guru_mapel', 'guru_tahfidz', 'wali_kelas'],
    iconClass: 'text-sky-600 dark:text-sky-400',
    softTintClass: 'bg-sky-50 dark:bg-sky-950/50',
  },
  {
    title: 'Kelola Data Master',
    description: 'Bulk import CSV siswa, kelas, & akun guru.',
    href: '/portal/admin/',
    icon: ShieldCheck,
    roles: ['admin'],
    iconClass: 'text-purple-600 dark:text-purple-400',
    softTintClass: 'bg-purple-50 dark:bg-purple-950/50',
  },
  {
    title: 'Profil Saya',
    description: 'Kelola data akun dan peran aktif.',
    href: '/portal/profil/',
    icon: User,
    roles: ['admin', 'kamad', 'waka_kesiswaan', 'waka_kurikulum', 'guru_bk', 'guru_mapel', 'guru_tahfidz', 'wali_kelas', 'siswa'],
    iconClass: 'text-slate-700 dark:text-slate-300',
    softTintClass: 'bg-slate-100 dark:bg-slate-800',
  },
];

function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'PM';
}

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, nip_nisn, roles, avatar_url, phone_number, created_at, updated_at')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) {
    redirect('/login');
  }

  const visibleMenus = portalMenus.filter((menu) => menu.roles.some((role) => profile.roles.includes(role)));

  async function handleSignOut() {
    'use server';

    const serverSupabase = await createClient();
    await serverSupabase.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-4">
        <header className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-30 rounded-3xl border border-slate-200/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 shadow-lg shadow-slate-950/30 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-950/30">
              {getInitials(profile.full_name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-200/80">Portal Madrasah</p>
              <h1 className="mt-1 truncate text-lg font-bold tracking-tight text-white sm:text-xl">{profile.full_name}</h1>
              <p className="mt-0.5 text-xs text-slate-300">{profile.nip_nisn ?? 'NIP/NISN belum diisi'}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-100"
                  >
                    {role.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            <form action={handleSignOut} className="shrink-0">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition active:scale-95 hover:bg-rose-500/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </div>
        </header>

        <section className="pt-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Navigasi Cepat</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Menu sesuai role aktif</h2>
            </div>
            <p className="text-xs text-slate-400">{visibleMenus.length} menu tersedia</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleMenus.map((menu) => {
              const Icon = menu.icon;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-150 active:scale-95 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className={`mb-4 inline-flex rounded-2xl p-3 ${menu.softTintClass}`}>
                    <Icon className={`h-6 w-6 ${menu.iconClass}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{menu.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{menu.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}