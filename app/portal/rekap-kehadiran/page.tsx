'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeftRight, CalendarRange, ClipboardList, LoaderCircle, Users } from 'lucide-react';

import { createClient } from '../../../lib/supabase/client';
import type { AlertKehadiranSiswa, Database, Kelas, Profile, RekapKehadiranSiswa, UserRole } from '../../../types/database';

type KelasOption = Pick<Kelas, 'id' | 'nama_kelas' | 'tingkat' | 'wali_kelas_id'>;
type JurnalOption = { kelas_id: string; mata_pelajaran: string };
type RekapKehadiranArgs = Database['public']['Functions']['get_rekap_kehadiran_siswa']['Args'];
type AlertKehadiranArgs = Database['public']['Functions']['get_alert_kehadiran_siswa']['Args'];
type RekapKehadiranClient = ReturnType<typeof createClient> & {
  rpc: {
    (
      functionName: 'get_rekap_kehadiran_siswa',
      parameters: RekapKehadiranArgs,
    ): PromiseLike<{ data: RekapKehadiranSiswa[] | null; error: { message: string } | null }>;
    (
      functionName: 'get_alert_kehadiran_siswa',
      parameters: AlertKehadiranArgs,
    ): PromiseLike<{ data: AlertKehadiranSiswa[] | null; error: { message: string } | null }>;
  };
};

const tabARoles: UserRole[] = ['guru_mapel', 'guru_tahfidz', 'wali_kelas', 'admin'];
const tabBRoles: UserRole[] = ['kamad', 'waka_kurikulum', 'waka_kesiswaan', 'guru_bk', 'admin'];
const teacherRoles: UserRole[] = ['guru_mapel', 'guru_tahfidz'];
const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getCountBadgeClass(count: number) {
  if (count >= 3) {
    return 'border-primary/30 bg-primary/10 text-primary';
  }

  return 'border-border bg-muted text-muted-foreground';
}

export default function RekapKehadiranPage() {
  const router = useRouter();
  const supabase = createClient() as RekapKehadiranClient;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const monthStart = currentMonth >= 7 ? 7 : 1;
  const monthEnd = currentMonth >= 7 ? 12 : 6;
  const currentYear = now.getFullYear();
  const semesterMonths = monthNames
    .map((name, index) => ({ name, value: index + 1 }))
    .filter(({ value }) => value >= monthStart && value <= monthEnd);

  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [teacherJournals, setTeacherJournals] = useState<JurnalOption[]>([]);
  const [userId, setUserId] = useState('');
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeView, setActiveView] = useState<'mapel' | 'alert'>('mapel');
  const [kelasId, setKelasId] = useState('');
  const [subject, setSubject] = useState('');
  const [alertKelasId, setAlertKelasId] = useState('');
  const [alertSubject, setAlertSubject] = useState('');
  const [alertSubjects, setAlertSubjects] = useState<string[]>([]);
  const [monthFrom, setMonthFrom] = useState(monthStart);
  const [monthTo, setMonthTo] = useState(currentMonth);
  const [rows, setRows] = useState<RekapKehadiranSiswa[]>([]);
  const [alertRows, setAlertRows] = useState<AlertKehadiranSiswa[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isInitializing, startInitializing] = useTransition();
  const [isLoading, startLoading] = useTransition();
  const [isLoadingAlerts, startLoadingAlerts] = useTransition();

  const isAdmin = roles.includes('admin');
  const hasTabAAccess = roles.some((role) => tabARoles.includes(role));
  const hasTabBAccess = roles.some((role) => tabBRoles.includes(role));
  const showTabBar = isAdmin || (hasTabAAccess && hasTabBAccess);
  const selectedClass = kelasOptions.find((kelas) => kelas.id === kelasId);
  const isHomeroomClass = selectedClass?.wali_kelas_id === userId;
  const tabAKelasOptions = isAdmin
    ? kelasOptions
    : kelasOptions.filter(
        (kelas) => kelas.wali_kelas_id === userId || teacherJournals.some((jurnal) => jurnal.kelas_id === kelas.id),
      );

  useEffect(() => {
    let active = true;

    startInitializing(() => {
      void (async () => {
        try {
          const { data: authData, error: authError } = await supabase.auth.getUser();
          if (authError || !authData.user) {
            router.replace('/login');
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, roles')
            .eq('id', authData.user.id)
            .single<Pick<Profile, 'id' | 'roles'>>();

          if (profileError || !profile) {
            throw new Error(profileError?.message ?? 'Profil pengguna tidak ditemukan.');
          }

          const allowedRoles = [...tabARoles, ...tabBRoles];
          if (!profile.roles.some((role) => allowedRoles.includes(role))) {
            router.replace('/portal');
            return;
          }

          const hasTabARole = profile.roles.some((role) => tabARoles.includes(role));
          const hasTabBRole = profile.roles.some((role) => tabBRoles.includes(role));
          const isAdminProfile = profile.roles.includes('admin');
          const journalQuery = supabase.from('jurnal_mengajar').select('kelas_id, mata_pelajaran');
          const journalRequest = hasTabARole
            ? isAdminProfile
              ? journalQuery.overrideTypes<JurnalOption[]>()
              : journalQuery.eq('teacher_id', authData.user.id).overrideTypes<JurnalOption[]>()
            : Promise.resolve({ data: [] as JurnalOption[], error: null });
          const [{ data: classRows, error: classError }, { data: journalRows, error: journalError }] = await Promise.all([
            supabase
              .from('kelas')
              .select('id, nama_kelas, tingkat, wali_kelas_id')
              .order('tingkat', { ascending: true })
              .order('nama_kelas', { ascending: true }),
            journalRequest,
          ]);

          if (classError) throw new Error(classError.message);
          if (journalError) throw new Error(journalError.message);

          const loadedClasses: KelasOption[] = classRows ?? [];
          const loadedJournals: JurnalOption[] = journalRows ?? [];
          if (!active) return;
          setUserId(profile.id);
          setRoles(profile.roles);
          setActiveView(hasTabARole ? 'mapel' : 'alert');
          setKelasOptions(loadedClasses);
          setTeacherJournals(loadedJournals);
          const tabAClasses = isAdminProfile
            ? loadedClasses
            : loadedClasses.filter(
                (kelas) => kelas.wali_kelas_id === authData.user.id || loadedJournals.some((jurnal) => jurnal.kelas_id === kelas.id),
              );
          setKelasId(tabAClasses[0]?.id ?? '');
        } catch (loadError: unknown) {
          if (active) setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data awal.');
        }
      })();
    });

    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    let active = true;

    if (!hasTabAAccess || !kelasId) {
      setSubjects([]);
      setSubject('');
      return () => {
        active = false;
      };
    }

    const loadSubjects = async () => {
      try {
        let availableSubjects: string[];

        if (isAdmin) {
          availableSubjects = teacherJournals.map((jurnal) => jurnal.mata_pelajaran);
        } else if (isHomeroomClass) {
          const { data, error: journalError } = await supabase
            .from('jurnal_mengajar')
            .select('mata_pelajaran')
            .eq('kelas_id', kelasId)
            .overrideTypes<{ mata_pelajaran: string }[]>();

          if (journalError) throw new Error(journalError.message);
          availableSubjects = (data ?? []).map((jurnal) => jurnal.mata_pelajaran);
        } else {
          availableSubjects = teacherJournals
            .filter((jurnal) => jurnal.kelas_id === kelasId)
            .map((jurnal) => jurnal.mata_pelajaran);
        }

        const uniqueSubjects = [...new Set(availableSubjects)].sort((left, right) => left.localeCompare(right, 'id'));
        if (!active) return;
        setSubjects(uniqueSubjects);
        setSubject(uniqueSubjects[0] ?? '');
      } catch (loadError: unknown) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Gagal memuat mata pelajaran.');
      }
    };

    void loadSubjects();
    return () => {
      active = false;
    };
  }, [hasTabAAccess, isAdmin, isHomeroomClass, kelasId, supabase, teacherJournals]);

  useEffect(() => {
    if (!hasTabBAccess) return;

    let active = true;
    startLoadingAlerts(() => {
      void (async () => {
        setAlertError(null);
        const { data, error: rpcError } = await supabase.rpc('get_alert_kehadiran_siswa', {
          p_kelas_id: alertKelasId || null,
          p_mata_pelajaran: alertSubject || null,
          p_bulan_mulai: monthFrom,
          p_bulan_selesai: monthTo,
          p_tahun: currentYear,
        });

        if (!active) return;
        if (rpcError) {
          setAlertError(rpcError.message);
          setAlertRows([]);
          return;
        }

        const filteredRows = (data ?? []).filter((row) => row.sakit >= 3 || row.izin >= 3 || row.alpa >= 3);
        setAlertRows(filteredRows);
        if (!alertKelasId && !alertSubject) {
          setAlertSubjects((current) => current.length > 0
            ? current
            : [...new Set(filteredRows.map((row) => row.mata_pelajaran))].sort((left, right) => left.localeCompare(right, 'id')));
        }
      })().catch((loadError: unknown) => {
        if (!active) return;
        setAlertError(loadError instanceof Error ? loadError.message : 'Gagal memuat alert kehadiran.');
        setAlertRows([]);
      });
    });

    return () => {
      active = false;
    };
  }, [alertKelasId, alertSubject, currentYear, hasTabBAccess, monthFrom, monthTo, supabase]);

  const loadReport = () => {
    if (!kelasId || !subject) return;

    setError(null);
    startLoading(() => {
      void (async () => {
        const { data, error: rpcError } = await supabase.rpc('get_rekap_kehadiran_siswa', {
            p_kelas_id: kelasId,
            p_mata_pelajaran: subject,
            p_bulan_mulai: monthFrom,
            p_bulan_selesai: monthTo,
            p_tahun: new Date().getFullYear(),
          });

        if (rpcError) {
          setError(rpcError.message);
          setRows([]);
          return;
        }

        const reportRows = data ?? [];
        setRows(
          reportRows,
        );
      })().catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat rekap kehadiran.');
        setRows([]);
      });
    });
  };

  const handleMonthFromChange = (value: number) => {
    setMonthFrom(value);
    if (value > monthTo) setMonthTo(value);
  };

  const handleMonthToChange = (value: number) => {
    setMonthTo(value);
    if (value < monthFrom) setMonthFrom(value);
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-muted p-3 text-primary">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Kehadiran Siswa</p>
              <h1 className="mt-1 text-2xl font-semibold text-card-foreground">Rekap Kehadiran Siswa</h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Akumulasi hadir, sakit, izin, dan alpa per mata pelajaran.</p>
            </div>
          </div>
        </header>

        {showTabBar ? (
          <div role="tablist" aria-label="Tampilan rekap kehadiran" className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted p-1">
            {hasTabAAccess ? (
              <button
                id="tab-mapel"
                type="button"
                role="tab"
                aria-selected={activeView === 'mapel'}
                onClick={() => setActiveView('mapel')}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${activeView === 'mapel' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                Rekap Mapel Saya
              </button>
            ) : null}
            {hasTabBAccess ? (
              <button
                id="tab-alert"
                type="button"
                role="tab"
                aria-selected={activeView === 'alert'}
                onClick={() => setActiveView('alert')}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${activeView === 'alert' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                Alert Kehadiran Siswa
              </button>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <div role="alert" className="flex items-start gap-2 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{error}</span>
          </div>
        ) : null}

        {isInitializing && roles.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-3xl border border-border bg-card px-4 py-12 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Memuat akses rekap...
          </div>
        ) : null}

        {activeView === 'mapel' && hasTabAAccess ? (
          <>
            <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Filter Rekap Mapel Saya</h2>
                <span className="ml-auto text-xs text-muted-foreground">Tahun {currentYear}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <label className="col-span-2 grid gap-2 text-sm text-card-foreground md:col-span-1">
                  <span>Kelas</span>
                  <select value={kelasId} onChange={(event) => setKelasId(event.target.value)} disabled={isInitializing || tabAKelasOptions.length === 0} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50">
                    <option value="">Pilih kelas</option>
                    {tabAKelasOptions.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} - {kelas.tingkat}</option>)}
                  </select>
                </label>

                <label className="col-span-2 grid gap-2 text-sm text-card-foreground md:col-span-2">
                  <span>Mata Pelajaran</span>
                  <select value={subject} onChange={(event) => setSubject(event.target.value)} disabled={!kelasId || subjects.length === 0} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50">
                    <option value="">{kelasId ? 'Pilih mata pelajaran' : 'Pilih kelas terlebih dahulu'}</option>
                    {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>

                <label className="grid gap-2 text-sm text-card-foreground">
                  <span>Bulan Mulai</span>
                  <select value={monthFrom} onChange={(event) => handleMonthFromChange(Number(event.target.value))} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    {semesterMonths.map((month) => <option key={month.value} value={month.value}>{month.name}</option>)}
                  </select>
                </label>

                <label className="grid gap-2 text-sm text-card-foreground">
                  <span>Bulan Selesai</span>
                  <select value={monthTo} onChange={(event) => handleMonthToChange(Number(event.target.value))} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    {semesterMonths.map((month) => <option key={month.value} value={month.value}>{month.name}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={loadReport} disabled={isInitializing || isLoading || !kelasId || !subject} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                  {isLoading || isInitializing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                  Tampilkan Rekap
                </button>
                <p className="text-xs text-muted-foreground">Periode {monthNames[monthFrom - 1]} - {monthNames[monthTo - 1]}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-4 py-4">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Rekap per Siswa</h2>
                <span className="ml-auto text-xs text-muted-foreground">{rows.length} siswa</span>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 bg-card px-4 py-12 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Memuat rekap...</div>
              ) : rows.length === 0 ? (
                <div className="bg-muted px-4 py-12 text-center text-sm text-muted-foreground">{kelasId && subject ? 'Tidak ada data kehadiran untuk filter ini.' : 'Pilih kelas dan mata pelajaran untuk melihat rekap.'}</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground sm:hidden">
                    <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Geser horizontal untuk melihat semua kolom</span>
                  </div>
                  <div role="region" aria-label="Tabel rekap kehadiran per siswa. Gulir horizontal untuk melihat semua kolom." tabIndex={0} className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                    <thead className="bg-muted text-xs font-semibold uppercase text-muted-foreground"><tr><th scope="col" className="px-4 py-3">Nama Siswa</th><th scope="col" className="px-4 py-3 text-center">Hadir</th><th scope="col" className="px-4 py-3 text-center">Sakit</th><th scope="col" className="px-4 py-3 text-center">Izin</th><th scope="col" className="px-4 py-3 text-center">Alpa</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row) => (
                        <tr key={row.siswa_id} className="transition hover:bg-muted/70">
                          <th scope="row" className="px-4 py-3 font-medium text-card-foreground">{row.full_name}</th>
                          <td className="px-4 py-3 text-center font-semibold text-primary">{row.hadir}</td>
                          <td className="px-4 py-3 text-center"><span className={`inline-flex min-w-9 justify-center rounded-lg border px-2.5 py-1 font-semibold ${getCountBadgeClass(row.sakit)}`}>{row.sakit}</span></td>
                          <td className="px-4 py-3 text-center"><span className={`inline-flex min-w-9 justify-center rounded-lg border px-2.5 py-1 font-semibold ${getCountBadgeClass(row.izin)}`}>{row.izin}</span></td>
                          <td className="px-4 py-3 text-center"><span className={`inline-flex min-w-9 justify-center rounded-lg border px-2.5 py-1 font-semibold ${getCountBadgeClass(row.alpa)}`}>{row.alpa}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
            </section>
          </>
        ) : null}

        {activeView === 'alert' && hasTabBAccess ? (
          <>
            <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Filter Alert Kehadiran</h2>
                <span className="ml-auto text-xs text-muted-foreground">Tahun {currentYear}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <label className="col-span-2 grid gap-2 text-sm text-card-foreground md:col-span-1">
                  <span>Kelas</span>
                  <select value={alertKelasId} onChange={(event) => setAlertKelasId(event.target.value)} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    <option value="">Semua Kelas</option>
                    {kelasOptions.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} - {kelas.tingkat}</option>)}
                  </select>
                </label>
                <label className="col-span-2 grid gap-2 text-sm text-card-foreground md:col-span-1">
                  <span>Mata Pelajaran</span>
                  <select value={alertSubject} onChange={(event) => setAlertSubject(event.target.value)} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    <option value="">Semua Mapel</option>
                    {alertSubjects.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-card-foreground">
                  <span>Bulan Mulai</span>
                  <select value={monthFrom} onChange={(event) => handleMonthFromChange(Number(event.target.value))} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    {semesterMonths.map((month) => <option key={month.value} value={month.value}>{month.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-card-foreground">
                  <span>Bulan Selesai</span>
                  <select value={monthTo} onChange={(event) => handleMonthToChange(Number(event.target.value))} className="h-12 min-w-0 rounded-xl border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
                    {semesterMonths.map((month) => <option key={month.value} value={month.value}>{month.name}</option>)}
                  </select>
                </label>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Periode {monthNames[monthFrom - 1]} - {monthNames[monthTo - 1]}</p>
            </section>

            {alertError ? <div role="alert" className="flex items-start gap-2 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{alertError}</span></div> : null}

            <section className="overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-2 border-b border-border px-4 py-4">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">Alert Kehadiran Siswa</h2>
                <span className="ml-auto text-xs text-muted-foreground">{alertRows.length} siswa</span>
              </div>
              {isLoadingAlerts ? (
                <div className="flex items-center justify-center gap-2 bg-card px-4 py-12 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> Memuat alert...</div>
              ) : alertRows.length === 0 ? (
                <div className="bg-muted px-4 py-12 text-center text-sm text-muted-foreground">Tidak ada alert kehadiran untuk periode ini.</div>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground sm:hidden">
                    <ArrowLeftRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Geser horizontal untuk melihat semua kolom</span>
                  </div>
                  <div role="region" aria-label="Tabel alert kehadiran siswa. Gulir horizontal untuk melihat semua kolom." tabIndex={0} className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
                    <thead className="bg-muted text-xs font-semibold uppercase text-muted-foreground"><tr><th scope="col" className="px-4 py-3">Nama Siswa</th><th scope="col" className="px-4 py-3">Kelas</th><th scope="col" className="px-4 py-3">Mata Pelajaran</th><th scope="col" className="px-4 py-3 text-center">Hadir</th><th scope="col" className="px-4 py-3 text-center">Sakit</th><th scope="col" className="px-4 py-3 text-center">Izin</th><th scope="col" className="px-4 py-3 text-center">Alpa</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {alertRows.map((row) => (
                        <tr key={`${row.siswa_id}-${row.kelas_nama}-${row.mata_pelajaran}`} className="transition hover:bg-muted/70">
                          <th scope="row" className="px-4 py-3 font-medium text-card-foreground">{row.full_name}</th>
                          <td className="px-4 py-3 text-muted-foreground">{row.kelas_nama}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.mata_pelajaran}</td>
                          <td className="px-4 py-3 text-center font-semibold text-primary">{row.hadir}</td>
                          <td className="px-4 py-3 text-center"><span className={`inline-flex min-w-9 justify-center rounded-lg border px-2.5 py-1 font-semibold ${getCountBadgeClass(row.sakit)}`}>{row.sakit}</span></td>
                          <td className="px-4 py-3 text-center"><span className={`inline-flex min-w-9 justify-center rounded-lg border px-2.5 py-1 font-semibold ${getCountBadgeClass(row.izin)}`}>{row.izin}</span></td>
                          <td className="px-4 py-3 text-center"><span className={`inline-flex min-w-9 justify-center rounded-lg border px-2.5 py-1 font-semibold ${getCountBadgeClass(row.alpa)}`}>{row.alpa}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}