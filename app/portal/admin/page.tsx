'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, FileDown, IdCard, LoaderCircle, Mail, Pencil, Plus, Search, School, ShieldPlus, Trash2, Users, X } from 'lucide-react';

import {
  createSiswaSingleAction,
  createGuruSingleAction,
  deleteSiswaAction,
  getKelasOptionsAction,
  getGuruProfilesAction,
  getSiswaPaginatedAction,
  importGuruAction,
  importSiswaAndKelasAction,
  softDeleteGuruAction,
  updateSiswaAction,
  updateGuruAction,
  type GuruProfileRow,
  type KelasOption,
  type SiswaWithKelas,
} from './actions';
import type { UserRole } from '../../../types/database';

type SiswaImportResult = {
  success?: boolean;
  totalKelas?: number;
  totalSiswa?: number;
  error?: string;
};

type GuruImportResult = {
  success?: boolean;
  totalGuru?: number;
  defaultPasswordUsed?: boolean;
  error?: string;
};

type ActiveTab = 'siswa' | 'guru';
type GuruSubTab = 'manage' | 'import';
type SiswaSubTab = 'manage' | 'import';

const guruRoles: UserRole[] = [
  'admin',
  'kamad',
  'waka_kesiswaan',
  'waka_kurikulum',
  'guru_bk',
  'guru_mapel',
  'guru_tahfidz',
  'wali_kelas',
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('siswa');
  const [siswaSubTab, setSiswaSubTab] = useState<SiswaSubTab>('manage');
  const [siswaRows, setSiswaRows] = useState<SiswaWithKelas[]>([]);
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);
  const [siswaSearchDraft, setSiswaSearchDraft] = useState('');
  const [kelasFilterDraft, setKelasFilterDraft] = useState('');
  const [siswaSearch, setSiswaSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');
  const [siswaPage, setSiswaPage] = useState(1);
  const [siswaTotalCount, setSiswaTotalCount] = useState(0);
  const [siswaTotalPages, setSiswaTotalPages] = useState(1);
  const [siswaLoading, setSiswaLoading] = useState(false);
  const [kelasLoading, setKelasLoading] = useState(false);
  const [siswaNotice, setSiswaNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [siswaFormOpen, setSiswaFormOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<SiswaWithKelas | null>(null);
  const [siswaFormError, setSiswaFormError] = useState<string | null>(null);
  const [siswaToDelete, setSiswaToDelete] = useState<SiswaWithKelas | null>(null);
  const [siswaDeleteError, setSiswaDeleteError] = useState<string | null>(null);
  const [siswaSaving, setSiswaSaving] = useState(false);
  const [siswaDeleting, setSiswaDeleting] = useState(false);
  const [guruSubTab, setGuruSubTab] = useState<GuruSubTab>('manage');
  const [guruProfiles, setGuruProfiles] = useState<GuruProfileRow[]>([]);
  const [guruSearch, setGuruSearch] = useState('');
  const [guruLoading, setGuruLoading] = useState(false);
  const [guruSaving, setGuruSaving] = useState(false);
  const [guruDeleting, setGuruDeleting] = useState(false);
  const [guruFormOpen, setGuruFormOpen] = useState(false);
  const [guruFormError, setGuruFormError] = useState<string | null>(null);
  const [editingGuru, setEditingGuru] = useState<GuruProfileRow | null>(null);
  const [guruToDelete, setGuruToDelete] = useState<GuruProfileRow | null>(null);
  const [guruDeleteError, setGuruDeleteError] = useState<string | null>(null);
  const [guruNotice, setGuruNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [siswaResult, setSiswaResult] = useState<SiswaImportResult | null>(null);
  const [guruResult, setGuruResult] = useState<GuruImportResult | null>(null);
  const [isSubmittingSiswa, startSiswaTransition] = useTransition();
  const [isSubmittingGuru, startGuruTransition] = useTransition();

  const refreshKelasOptions = useCallback(async () => {
    setKelasLoading(true);
    try {
      setKelasOptions(await getKelasOptionsAction());
    } catch (error) {
      setSiswaNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Gagal memuat pilihan kelas.' });
    } finally {
      setKelasLoading(false);
    }
  }, []);

  const refreshSiswaList = useCallback(async (pageToLoad = siswaPage) => {
    setSiswaLoading(true);
    try {
      const result = await getSiswaPaginatedAction({
        search: siswaSearch,
        kelasId: kelasFilter || undefined,
        page: pageToLoad,
        limit: 25,
      });
      setSiswaRows(result.data);
      setSiswaTotalCount(result.totalCount);
      setSiswaTotalPages(result.totalPages);
      setSiswaPage(result.page);
    } catch (error) {
      setSiswaNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Gagal memuat daftar siswa.' });
    } finally {
      setSiswaLoading(false);
    }
  }, [kelasFilter, siswaPage, siswaSearch]);

  useEffect(() => {
    if (activeTab === 'siswa' && siswaSubTab === 'manage') {
      void refreshKelasOptions();
    }
  }, [activeTab, refreshKelasOptions, siswaSubTab]);

  useEffect(() => {
    if (activeTab === 'siswa' && siswaSubTab === 'manage') {
      void refreshSiswaList();
    }
  }, [activeTab, refreshSiswaList, siswaSubTab]);

  const handleSiswaFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSiswaNotice(null);
    setSiswaSearch(siswaSearchDraft.trim());
    setKelasFilter(kelasFilterDraft);
    setSiswaPage(1);
  };

  const handleSiswaProfileSubmit = async (formData: FormData) => {
    setSiswaSaving(true);
    setSiswaFormError(null);
    try {
      if (editingSiswa) {
        await updateSiswaAction(formData);
      } else {
        await createSiswaSingleAction(formData);
      }
      setSiswaFormOpen(false);
      setSiswaNotice({ tone: 'success', message: editingSiswa ? 'Data siswa berhasil diperbarui.' : 'Siswa baru berhasil ditambahkan.' });
      await refreshSiswaList();
    } catch (error) {
      setSiswaFormError(error instanceof Error ? error.message : 'Gagal menyimpan data siswa.');
    } finally {
      setSiswaSaving(false);
    }
  };

  const handleSiswaDelete = async () => {
    if (!siswaToDelete) return;

    setSiswaDeleting(true);
    setSiswaDeleteError(null);
    try {
      await deleteSiswaAction(siswaToDelete.id);
      setSiswaNotice({ tone: 'success', message: `${siswaToDelete.full_name} berhasil dihapus.` });
      setSiswaToDelete(null);
      const pageToRefresh = siswaRows.length === 1 && siswaPage > 1 ? siswaPage - 1 : siswaPage;
      setSiswaPage(pageToRefresh);
      await refreshSiswaList(pageToRefresh);
    } catch (error) {
      setSiswaDeleteError(error instanceof Error ? error.message : 'Gagal menghapus data siswa.');
    } finally {
      setSiswaDeleting(false);
    }
  };

  const refreshGuruProfiles = useCallback(async () => {
    setGuruLoading(true);
    try {
      const profiles = await getGuruProfilesAction();
      setGuruProfiles(profiles.filter((profile) => profile.roles.some((role) => guruRoles.includes(role))));
    } catch (error) {
      setGuruNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Gagal memuat daftar guru.',
      });
    } finally {
      setGuruLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'guru' && guruSubTab === 'manage') {
      void refreshGuruProfiles();
    }
  }, [activeTab, guruSubTab, refreshGuruProfiles]);

  const filteredGuruProfiles = useMemo(() => {
    const query = guruSearch.trim().toLocaleLowerCase();
    if (!query) return guruProfiles;

    return guruProfiles.filter((profile) =>
      [profile.full_name, profile.email, profile.nip_nisn]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(query)),
    );
  }, [guruProfiles, guruSearch]);

  const handleGuruProfileSubmit = async (formData: FormData) => {
    setGuruSaving(true);
    setGuruFormError(null);
    try {
      if (editingGuru) {
        await updateGuruAction(formData);
      } else {
        await createGuruSingleAction(formData);
      }
      setGuruFormOpen(false);
      setGuruNotice({ tone: 'success', message: editingGuru ? 'Data guru berhasil diperbarui.' : 'Guru baru berhasil ditambahkan.' });
      await refreshGuruProfiles();
    } catch (error) {
      setGuruFormError(error instanceof Error ? error.message : 'Gagal menyimpan data guru.');
    } finally {
      setGuruSaving(false);
    }
  };

  const handleGuruDelete = async () => {
    if (!guruToDelete) return;

    setGuruDeleting(true);
    setGuruDeleteError(null);
    try {
      await softDeleteGuruAction(guruToDelete.id);
      setGuruNotice({ tone: 'success', message: `${guruToDelete.full_name} berhasil dinonaktifkan.` });
      setGuruToDelete(null);
      await refreshGuruProfiles();
    } catch (error) {
      setGuruDeleteError(error instanceof Error ? error.message : 'Gagal menghapus guru.');
    } finally {
      setGuruDeleting(false);
    }
  };

  const tabButtonClass = (tab: ActiveTab) =>
    `rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-95 ${
      activeTab === tab
        ? 'border border-cyan-400/20 bg-cyan-500 text-slate-950 shadow-sm'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
    }`;

  const siswaFeedback = useMemo(() => {
    if (!siswaResult) {
      return null;
    }

    if (siswaResult.error) {
      return <AlertBox tone="error" message={siswaResult.error} />;
    }

    if (siswaResult.success) {
      return <AlertBox tone="success" message={`Berhasil impor ${siswaResult.totalSiswa ?? 0} siswa dan ${siswaResult.totalKelas ?? 0} kelas.`} />;
    }

    return null;
  }, [siswaResult]);

  const guruFeedback = useMemo(() => {
    if (!guruResult) {
      return null;
    }

    if (guruResult.error) {
      return <AlertBox tone="error" message={guruResult.error} />;
    }

    if (guruResult.success) {
      return (
        <AlertBox
          tone="success"
          message={`Berhasil memprovisi ${guruResult.totalGuru ?? 0} akun guru.${guruResult.defaultPasswordUsed ? ' Password default digunakan.' : ''}`}
        />
      );
    }

    return null;
  }, [guruResult]);

  const handleSiswaSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSiswaResult(null);

    const formData = new FormData(event.currentTarget);

    startSiswaTransition(() => {
      void importSiswaAndKelasAction(formData)
        .then((result) => setSiswaResult(result))
        .catch((error: unknown) => {
          setSiswaResult({ error: error instanceof Error ? error.message : 'Gagal impor siswa.' });
        });
    });
  };

  const handleGuruSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuruResult(null);

    const formData = new FormData(event.currentTarget);
    const defaultPassword = String(formData.get('default_password') ?? 'Madrasah2026!').trim() || 'Madrasah2026!';

    startGuruTransition(() => {
      void importGuruAction(formData, defaultPassword)
        .then((result) => setGuruResult(result))
        .catch((error: unknown) => {
          setGuruResult({ error: error instanceof Error ? error.message : 'Gagal impor guru.' });
        });
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Dashboard Admin &amp; Kelola Data Master</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Dashboard Admin &amp; Kelola Data Master</h1>
            </div>

            <Link
              href="/portal/"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition active:scale-95 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Portal
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-3 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setActiveTab('siswa')} className={tabButtonClass('siswa')}>
              Kelola Siswa &amp; Kelas
            </button>
            <button type="button" onClick={() => setActiveTab('guru')} className={tabButtonClass('guru')}>
              Impor Guru &amp; Staf
            </button>
          </div>
        </section>

        {activeTab === 'siswa' ? (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-1.5">
              <button
                type="button"
                onClick={() => setSiswaSubTab('manage')}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${siswaSubTab === 'manage' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
              >
                Daftar &amp; Kelola Siswa
              </button>
              <button
                type="button"
                onClick={() => setSiswaSubTab('import')}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${siswaSubTab === 'import' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
              >
                Impor CSV Siswa
              </button>
            </div>

            {siswaNotice && <AlertBox tone={siswaNotice.tone} message={siswaNotice.message} />}

            {siswaSubTab === 'manage' ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Daftar Siswa</h2>
                    <p className="mt-1 text-sm text-slate-400">{siswaTotalCount} siswa terdata</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingSiswa(null); setSiswaFormError(null); setSiswaFormOpen(true); }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Siswa
                  </button>
                </div>

                <form onSubmit={handleSiswaFilterSubmit} className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.7fr)_auto] sm:items-end">
                  <label className="grid gap-1.5 text-sm text-slate-300">
                    Nama atau NISN
                    <span className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={siswaSearchDraft}
                        onChange={(event) => setSiswaSearchDraft(event.target.value)}
                        placeholder="Cari siswa"
                        className="h-11 w-full rounded-lg border border-white/10 bg-slate-900 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                      />
                    </span>
                  </label>
                  <label className="grid gap-1.5 text-sm text-slate-300">
                    Kelas
                    <select
                      value={kelasFilterDraft}
                      onChange={(event) => setKelasFilterDraft(event.target.value)}
                      disabled={kelasLoading}
                      className="h-11 w-full rounded-lg border border-white/10 bg-slate-900 px-3 text-sm text-white outline-none focus:border-cyan-400/50 disabled:opacity-60"
                    >
                      <option value="">Semua kelas</option>
                      {kelasOptions.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} · Tingkat {kelas.tingkat}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <Search className="h-4 w-4" /> Cari
                  </button>
                </form>

                {siswaLoading ? (
                  <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-slate-400">
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat data siswa...
                  </div>
                ) : siswaRows.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {siswaRows.map((siswa) => (
                      <article key={siswa.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold text-white">{siswa.full_name}</h3>
                            <div className="mt-2">
                              {siswa.nisn ? (
                                <span className="inline-flex rounded-md border border-slate-500/20 bg-slate-500/10 px-2 py-1 text-xs font-medium text-slate-200">
                                  NISN {siswa.nisn}
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md border border-orange-400/20 bg-orange-400/10 px-2 py-1 text-xs font-medium text-orange-200">
                                  Belum ada NISN
                                </span>
                              )}
                            </div>
                            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-slate-400">
                              <School className="h-4 w-4 shrink-0 text-cyan-300" />
                              {siswa.kelas?.nama_kelas ?? 'Kelas tidak tersedia'}
                              {siswa.kelas && <span className="text-slate-500">· Tingkat {siswa.kelas.tingkat}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-white/5 pt-3">
                          <button
                            type="button"
                            onClick={() => { setEditingSiswa(siswa); setSiswaFormError(null); setSiswaFormOpen(true); }}
                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" /> Edit NISN/Data
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSiswaDeleteError(null); setSiswaToDelete(siswa); }}
                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/5 px-3 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10"
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">
                    {siswaSearch || kelasFilter ? 'Tidak ada siswa yang cocok dengan filter.' : 'Belum ada data siswa.'}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-sm text-slate-400 sm:text-left">
                    Halaman {siswaPage} dari {siswaTotalPages} · Total {siswaTotalCount} siswa
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSiswaPage((page) => Math.max(1, page - 1))}
                      disabled={siswaLoading || siswaPage <= 1}
                      aria-label="Halaman sebelumnya"
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 px-3 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      <ChevronLeft className="h-4 w-4" /> Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => setSiswaPage((page) => Math.min(siswaTotalPages, page + 1))}
                      disabled={siswaLoading || siswaPage >= siswaTotalPages}
                      aria-label="Halaman berikutnya"
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 px-3 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      Berikutnya <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <InfoCard
                  icon={<School className="h-5 w-5" />}
                  title="Format CSV / Excel Siswa"
                  description="Gunakan header: full_name,nisn,nama_kelas,tingkat. Kolom nisn boleh dikosongkan. Setiap baris akan diproses menjadi data siswa dan kelas terkait."
                />

                <a
                  href="/template_siswa.csv"
                  download
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
                >
                  <FileDown className="h-4 w-4" />
                  Unduh template CSV / Excel sampel siswa
                </a>

                <form onSubmit={handleSiswaSubmit} className="space-y-4">
                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>File CSV / Excel Siswa</span>
                    <input
                      name="csv_file"
                      type="file"
                      accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingSiswa}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingSiswa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                    Proses Impor Siswa
                  </button>
                </form>

                {siswaFeedback}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-1.5">
              <button
                type="button"
                onClick={() => setGuruSubTab('manage')}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${guruSubTab === 'manage' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
              >
                Daftar &amp; Kelola Guru
              </button>
              <button
                type="button"
                onClick={() => setGuruSubTab('import')}
                className={`min-h-11 rounded-xl px-3 text-sm font-semibold transition ${guruSubTab === 'import' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-white/5'}`}
              >
                Impor CSV Guru
              </button>
            </div>

            {guruSubTab === 'manage' ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Daftar Guru &amp; Staf</h2>
                    <p className="mt-1 text-sm text-slate-400">{guruProfiles.length} akun aktif</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingGuru(null); setGuruFormError(null); setGuruFormOpen(true); }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Guru Baru
                  </button>
                </div>

                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={guruSearch}
                    onChange={(event) => setGuruSearch(event.target.value)}
                    placeholder="Cari nama, email, atau NIP/NISN"
                    aria-label="Cari guru"
                    className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
                  />
                </label>

                {guruNotice && <AlertBox tone={guruNotice.tone} message={guruNotice.message} />}

                {guruLoading ? (
                  <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-400">
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat data guru...
                  </div>
                ) : filteredGuruProfiles.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredGuruProfiles.map((profile) => (
                      <article key={profile.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold text-white">{profile.full_name}</h3>
                            <p className="mt-2 flex min-w-0 items-center gap-2 break-all text-sm text-slate-300">
                              <Mail className="h-4 w-4 shrink-0 text-cyan-300" /> {profile.email || 'Email belum tersedia'}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                              <IdCard className="h-4 w-4 shrink-0" /> {profile.nip_nisn || 'NIP/NISN belum tersedia'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {profile.roles.map((role) => (
                            <span key={role} className="rounded-md border border-cyan-400/15 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                              {role.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-white/5 pt-3">
                          <button
                            type="button"
                            onClick={() => { setEditingGuru(profile); setGuruFormError(null); setGuruFormOpen(true); }}
                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuruToDelete(profile)}
                            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/5 px-3 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10"
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-slate-400">
                    {guruSearch ? 'Tidak ada guru yang cocok dengan pencarian.' : 'Belum ada data guru aktif.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <InfoCard
                  icon={<ShieldPlus className="h-5 w-5" />}
                  title="Format CSV / Excel Guru"
                  description="Gunakan header: email,full_name,nip_nisn,roles. Kolom roles dapat dipisahkan dengan titik koma, misalnya guru_mapel;wali_kelas;waka_kesiswaan."
                />

                <a
                  href="/template_guru.csv"
                  download
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/20"
                >
                  <FileDown className="h-4 w-4" />
                  Unduh template CSV / Excel sampel guru
                </a>

                <form onSubmit={handleGuruSubmit} className="space-y-4">
                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Password Default Guru</span>
                    <input
                      name="default_password"
                      type="text"
                      defaultValue="Madrasah2026!"
                      className="h-12 rounded-xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>File CSV / Excel Guru</span>
                    <input
                      name="csv_file"
                      type="file"
                      accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingGuru}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingGuru ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
                    Proses Impor Guru
                  </button>
                </form>

                {guruFeedback}
              </div>
            )}
          </section>
        )}

        {siswaFormOpen && (
          <SiswaFormModal
            student={editingSiswa}
            classes={kelasOptions}
            classesLoading={kelasLoading}
            error={siswaFormError}
            isPending={siswaSaving}
            onClose={() => setSiswaFormOpen(false)}
            onSubmit={handleSiswaProfileSubmit}
          />
        )}

        {siswaToDelete && (
          <SiswaDeleteModal
            fullName={siswaToDelete.full_name}
            error={siswaDeleteError}
            isPending={siswaDeleting}
            onCancel={() => { setSiswaDeleteError(null); setSiswaToDelete(null); }}
            onConfirm={() => void handleSiswaDelete()}
          />
        )}

        {guruFormOpen && (
          <GuruFormModal
            profile={editingGuru}
            error={guruFormError}
            isPending={guruSaving}
            onClose={() => setGuruFormOpen(false)}
            onSubmit={handleGuruProfileSubmit}
          />
        )}

        {guruToDelete && (
          <ConfirmDeleteModal
            fullName={guruToDelete.full_name}
            error={guruDeleteError}
            isPending={guruDeleting}
            onCancel={() => { setGuruDeleteError(null); setGuruToDelete(null); }}
            onConfirm={() => void handleGuruDelete()}
          />
        )}
      </div>
    </main>
  );
}

function SiswaFormModal({
  student,
  classes,
  classesLoading,
  error,
  isPending,
  onClose,
  onSubmit,
}: {
  student: SiswaWithKelas | null;
  classes: KelasOption[];
  classesLoading: boolean;
  error: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(new FormData(event.currentTarget));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="siswa-form-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Manajemen Siswa</p>
            <h2 id="siswa-form-title" className="mt-1 text-xl font-semibold text-white">
              {student ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup form siswa"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {student && <input type="hidden" name="siswa_id" value={student.id} />}
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            Nama Lengkap
            <input
              name="full_name"
              required
              defaultValue={student?.full_name ?? ''}
              autoComplete="name"
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            NISN <span className="font-normal text-slate-400">(opsional)</span>
            <input
              name="nisn"
              inputMode="numeric"
              defaultValue={student?.nisn ?? ''}
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            Kelas
            <select
              name="kelas_id"
              required
              defaultValue={student?.kelas_id ?? ''}
              disabled={classesLoading || classes.length === 0}
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-400/60 disabled:opacity-60"
            >
              <option value="" disabled>{classesLoading ? 'Memuat kelas...' : 'Pilih kelas'}</option>
              {classes.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} · Tingkat {kelas.tingkat}</option>
              ))}
            </select>
            {!classesLoading && classes.length === 0 && <span className="text-xs text-orange-200">Belum ada pilihan kelas.</span>}
          </label>

          {error && <AlertBox tone="error" message={error} />}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || classesLoading || classes.length === 0}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SiswaDeleteModal({
  fullName,
  error,
  isPending,
  onCancel,
  onConfirm,
}: {
  fullName: string;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-siswa-title"
        className="w-full max-w-md rounded-t-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:rounded-2xl"
      >
        <h2 id="delete-siswa-title" className="text-lg font-semibold text-white">Hapus data siswa?</h2>
        <p className="mt-2 break-words text-sm leading-6 text-slate-300">
          Data <span className="font-semibold text-white">{fullName}</span> akan dihapus secara permanen.
        </p>
        {error && <div className="mt-4"><AlertBox tone="error" message={error} /></div>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
          >
            {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isPending ? 'Menghapus...' : 'Ya, hapus siswa'}
          </button>
        </div>
      </section>
    </div>
  );
}

function GuruFormModal({
  profile,
  error,
  isPending,
  onClose,
  onSubmit,
}: {
  profile: GuruProfileRow | null;
  error: string | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(new FormData(event.currentTarget));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="guru-form-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Manajemen Guru</p>
            <h2 id="guru-form-title" className="mt-1 text-xl font-semibold text-white">
              {profile ? 'Edit Data Guru' : 'Tambah Guru Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup form"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {profile && <input type="hidden" name="user_id" value={profile.id} />}
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            Nama Lengkap
            <input
              name="full_name"
              required
              defaultValue={profile?.full_name ?? ''}
              autoComplete="name"
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue={profile?.email ?? ''}
              autoComplete="email"
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            NIP/NISN
            <input
              name="nip_nisn"
              defaultValue={profile?.nip_nisn ?? ''}
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-200">
            Password {profile && <span className="font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
            <input
              name="password"
              type="password"
              required={!profile}
              minLength={6}
              autoComplete={profile ? 'new-password' : 'new-password'}
              placeholder={profile ? 'Tidak diubah' : 'Minimal 6 karakter'}
              className="h-11 rounded-lg border border-white/10 bg-slate-950 px-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60"
            />
          </label>

          {error && <AlertBox tone="error" message={error} />}

          <fieldset className="rounded-xl border border-white/10 p-3">
            <legend className="px-1 text-sm font-medium text-slate-200">Role</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {guruRoles.map((role) => (
                <label key={role} className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-slate-300 hover:bg-white/5">
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    defaultChecked={profile?.roles.includes(role) ?? role === 'guru_mapel'}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  <span>{role.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
            >
              {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ConfirmDeleteModal({
  fullName,
  error,
  isPending,
  onCancel,
  onConfirm,
}: {
  fullName: string;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-guru-title"
        className="w-full max-w-md rounded-t-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:rounded-2xl"
      >
        <h2 id="delete-guru-title" className="text-lg font-semibold text-white">Nonaktifkan akun guru?</h2>
        <p className="mt-2 break-words text-sm leading-6 text-slate-300">
          Akun <span className="font-semibold text-white">{fullName}</span> akan dihapus dari daftar aktif dan akses masuknya dibekukan.
        </p>
        {error && <div className="mt-4"><AlertBox tone="error" message={error} /></div>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-11 rounded-lg border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
          >
            {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isPending ? 'Menghapus...' : 'Ya, nonaktifkan'}
          </button>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="mb-3 inline-flex rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">{icon}</div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

function AlertBox({ tone, message }: { tone: 'success' | 'error'; message: string }) {
  const styles =
    tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
      : 'border-rose-500/20 bg-rose-500/10 text-rose-200';

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}