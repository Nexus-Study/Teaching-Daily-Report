import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, Award, ShieldAlert, Star, TrendingDown, UserRound } from 'lucide-react';

import { getProfilPerilakuSiswa } from '@/app/portal/perilaku/actions';
import { createClient } from '@/lib/supabase/server';
import type { Kelas, Profile, Siswa, UserRole } from '@/types/database';

type SiswaPerilakuProfilePageProps = {
  params: Promise<{ id: string }>;
};

const globalScopeRoles: UserRole[] = [
  'admin',
  'guru_bk',
  'waka_kurikulum',
  'waka_kesiswaan',
  'kamad',
];

function formatWIT(dateString: string): string {
  return `${new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jayapura',
  }).format(new Date(dateString))} WIT`;
}

export default async function SiswaPerilakuProfilePage({
  params,
}: SiswaPerilakuProfilePageProps) {
  const { id: studentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, roles')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'id' | 'roles'>>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    redirect('/portal/perilaku/rekap?error=unauthorized');
  }

  const { data: student, error: studentError } = await supabase
    .from('siswa')
    .select('id, kelas_id')
    .eq('id', studentId)
    .maybeSingle()
    .overrideTypes<Pick<Siswa, 'id' | 'kelas_id'> | null, { merge: false }>();

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (!student) {
    redirect('/portal/perilaku/rekap?error=unauthorized');
  }

  const { data: studentClass, error: classError } = await supabase
    .from('kelas')
    .select('id, wali_kelas_id')
    .eq('id', student.kelas_id)
    .maybeSingle()
    .overrideTypes<Pick<Kelas, 'id' | 'wali_kelas_id'> | null, { merge: false }>();

  if (classError) {
    throw new Error(classError.message);
  }

  if (!studentClass) {
    redirect('/portal/perilaku/rekap?error=unauthorized');
  }

  const hasGlobalScope = profile.roles.some((role) => globalScopeRoles.includes(role));
  let canViewTarget = hasGlobalScope;

  if (!canViewTarget && profile.roles.includes('wali_kelas')) {
    canViewTarget = studentClass.wali_kelas_id === profile.id;
  }

  if (!canViewTarget && profile.roles.includes('guru_mapel')) {
    const { data: teachingClass, error: teachingClassError } = await supabase
      .from('jadwal_guru')
      .select('kelas_id')
      .eq('teacher_id', profile.id)
      .eq('kelas_id', studentClass.id)
      .limit(1)
      .maybeSingle();

    if (teachingClassError) {
      throw new Error(teachingClassError.message);
    }

    canViewTarget = Boolean(teachingClass);
  }

  if (!canViewTarget) {
    redirect('/portal/perilaku/rekap?error=unauthorized');
  }

  const profileData = await getProfilPerilakuSiswa(studentId);

  return (
    <main className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-5">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-6">
          <Link
            href="/portal/siswa"
            className="mb-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali ke Daftar Siswa
          </Link>

          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800 sm:h-14 sm:w-14">
              <UserRound aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-700 sm:tracking-[0.24em]">
                Profil 360 Perilaku Siswa
              </p>
              <h1 className="mt-1 break-words text-xl font-bold tracking-tight sm:text-2xl">
                {profileData.siswa.full_name}
              </h1>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                NISN {profileData.siswa.nisn ?? 'Tidak tersedia'}
              </p>
              <span className="mt-3 inline-flex min-h-[32px] items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">
                {profileData.kelas.nama_kelas} · Tingkat {profileData.kelas.tingkat}
              </span>
            </div>
          </div>
        </header>

        <section aria-label="Statistik poin perilaku" className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Star aria-hidden="true" className="h-4 w-4" />
              Total Poin Positif
            </div>
            <p className="mt-2 text-3xl font-bold">{profileData.rekap.poinPositif}</p>
            <p className="mt-1 text-xs text-emerald-800">
              {profileData.rekap.jumlahCatatanPositif} catatan positif
            </p>
          </article>
          <article className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-950 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingDown aria-hidden="true" className="h-4 w-4" />
              Total Poin Pelanggaran
            </div>
            <p className="mt-2 text-3xl font-bold">{profileData.rekap.poinPelanggaran}</p>
            <p className="mt-1 text-xs text-rose-800">
              {profileData.rekap.jumlahCatatanPelanggaran} catatan pelanggaran
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="h-4 w-4 text-rose-700" />
            <h2 className="text-base font-semibold">Timeline Catatan Perilaku</h2>
          </div>
          {profileData.timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <Award aria-hidden="true" className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada riwayat perilaku untuk siswa ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profileData.timeline.map((record) => (
                <article
                  key={record.id}
                  className="rounded-2xl border border-border bg-background p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {record.tanggal} · Poin {record.poin}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {record.jenis === 'positif' ? 'Catatan Positif' : 'Pelanggaran'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex min-h-[28px] w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
                        record.jenis === 'positif'
                          ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                          : 'border-rose-200 bg-rose-100 text-rose-800'
                      }`}
                    >
                      {record.jenis === 'positif' ? 'Positif' : 'Pelanggaran'}
                    </span>
                  </div>
                  <p className="mt-3 break-words text-sm leading-6">{record.deskripsi}</p>
                  {record.penanganan_perilaku?.length ? (
                    <ol className="mt-4 space-y-3 border-l-2 border-indigo-100 pl-4">
                      {record.penanganan_perilaku.map((handling) => (
                        <li key={handling.id} className="relative">
                          <span className="absolute -left-[calc(1rem+5px)] top-1 h-2 w-2 rounded-full bg-indigo-500" />
                          <p className="text-xs font-medium text-muted-foreground">
                            {formatWIT(handling.created_at)}
                          </p>
                          <p className="mt-1 break-words text-sm">{handling.tindak_lanjut}</p>
                          <p className="mt-1 text-xs font-semibold capitalize text-indigo-700">
                            {handling.status.replace(/_/g, ' ')}
                          </p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">Belum ada tindak lanjut.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
