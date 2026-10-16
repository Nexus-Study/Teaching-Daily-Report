import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { portalMenus } from '@/app/portal/config/menu';
import { createClient } from '../../lib/supabase/server';
import type { Profile } from '../../types/database';

const menuIconContainerClasses: Record<string, string> = {
  '/portal/jurnal/': 'bg-blue-100 text-blue-700',
  '/portal/perilaku/input': 'bg-emerald-100 text-emerald-700',
  '/portal/laporan/': 'bg-amber-100 text-amber-700',
  '/portal/rekap-kehadiran/': 'bg-sky-100 text-sky-700',
  '/portal/admin/': 'bg-purple-100 text-purple-700',
  '/portal/profil/': 'bg-slate-100 text-slate-700',
};

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
    <main className="min-h-screen bg-background px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border-b border-border bg-card p-4 text-card-foreground shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {getInitials(profile.full_name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Portal Madrasah</p>
                <h1 className="mt-1 break-words text-lg font-bold tracking-tight sm:text-xl">{profile.full_name}</h1>
                <p className="mt-0.5 break-words text-xs text-muted-foreground">{profile.nip_nisn ?? 'NIP/NISN belum diisi'}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-block px-1 py-1 text-xs font-semibold text-muted-foreground">Mode Akses:</span>
                  {profile.roles.length > 0 ? (
                    profile.roles.map((role) => (
                      <span
                        key={role}
                        className="inline-block rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-800"
                      >
                        {role.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="inline-block rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      Belum ada peran
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form action={handleSignOut} className="mt-4 shrink-0 self-end sm:ml-auto sm:mt-0 sm:self-auto">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-700/25 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 transition active:scale-95 hover:bg-rose-100"
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Navigasi Cepat</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Menu sesuai role aktif</h2>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">{visibleMenus.length} menu tersedia</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleMenus.map((menu) => {
              const Icon = menu.icon;

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className="group rounded-2xl border border-border bg-card p-4 text-left text-card-foreground shadow-sm transition-all duration-150 active:scale-95 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${menuIconContainerClasses[menu.href]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="break-words text-sm font-semibold text-card-foreground">{menu.title}</h3>
                  <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{menu.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}