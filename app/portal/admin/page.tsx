'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
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

function useAdminDialog(onClose: () => void, isPending: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const isPendingRef = useRef(isPending);
  onCloseRef.current = onClose;
  isPendingRef.current = isPending;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    dialog.querySelector<HTMLElement>(
      '[autofocus], input:not([type="hidden"]):not(:disabled), select:not(:disabled), button:not(:disabled)',
    )?.focus();

    function handleCancel(event: Event) {
      event.preventDefault();
      if (!isPendingRef.current) onCloseRef.current();
    }

    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      if (dialog.open) dialog.close();
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
      triggerRef.current = null;
    };
  }, []);

  return dialogRef;
}

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
    `min-h-11 min-w-11 rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 ${
      activeTab === tab
        ? 'border border-primary bg-primary text-primary-foreground shadow-sm'
        : 'border border-border bg-card text-card-foreground hover:bg-muted'
    }`;

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0 || tabs.length === 0) return;

    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

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
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Administrasi</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">Kelola data master</h1>
            </div>

            <Link
              href="/portal/"
              className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-card-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Portal
            </Link>
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card p-3 text-card-foreground shadow-sm">
          <div role="tablist" aria-label="Kelola data master" onKeyDown={handleTabKeyDown} className="grid grid-cols-2 gap-2">
            <button id="tab-siswa" type="button" role="tab" aria-selected={activeTab === 'siswa'} aria-controls={activeTab === 'siswa' ? 'panel-siswa' : undefined} tabIndex={activeTab === 'siswa' ? 0 : -1} onClick={() => setActiveTab('siswa')} className={tabButtonClass('siswa')}>
              Kelola Siswa &amp; Kelas
            </button>
            <button id="tab-guru" type="button" role="tab" aria-selected={activeTab === 'guru'} aria-controls={activeTab === 'guru' ? 'panel-guru' : undefined} tabIndex={activeTab === 'guru' ? 0 : -1} onClick={() => setActiveTab('guru')} className={tabButtonClass('guru')}>
              Impor Guru &amp; Staf
            </button>
          </div>
        </section>

        {activeTab === 'siswa' ? (
          <section id="panel-siswa" role="tabpanel" aria-labelledby="tab-siswa" tabIndex={0} className="space-y-4 rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div role="tablist" aria-label="Tampilan data siswa" onKeyDown={handleTabKeyDown} className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted p-1.5">
              <button
                type="button"
                id="tab-siswa-manage"
                role="tab"
                aria-selected={siswaSubTab === 'manage'}
                aria-controls={siswaSubTab === 'manage' ? 'panel-siswa-manage' : undefined}
                tabIndex={siswaSubTab === 'manage' ? 0 : -1}
                onClick={() => setSiswaSubTab('manage')}
                className={`min-h-11 min-w-11 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${siswaSubTab === 'manage' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                Daftar &amp; Kelola Siswa
              </button>
              <button
                type="button"
                id="tab-siswa-import"
                role="tab"
                aria-selected={siswaSubTab === 'import'}
                aria-controls={siswaSubTab === 'import' ? 'panel-siswa-import' : undefined}
                tabIndex={siswaSubTab === 'import' ? 0 : -1}
                onClick={() => setSiswaSubTab('import')}
                className={`min-h-11 min-w-11 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${siswaSubTab === 'import' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                Impor CSV Siswa
              </button>
            </div>

            {siswaNotice && <AlertBox tone={siswaNotice.tone} message={siswaNotice.message} />}

            {siswaSubTab === 'manage' ? (
              <div id="panel-siswa-manage" role="tabpanel" aria-labelledby="tab-siswa-manage" tabIndex={0} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">Daftar Siswa</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{siswaTotalCount} siswa terdata</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingSiswa(null); setSiswaFormError(null); setSiswaFormOpen(true); }}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Siswa
                  </button>
                </div>

                <form onSubmit={handleSiswaFilterSubmit} className="grid gap-3 rounded-2xl border border-border bg-muted p-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.7fr)_auto] sm:items-end">
                  <label className="grid gap-1.5 text-sm text-card-foreground">
                    Nama atau NISN
                    <span className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="search"
                        value={siswaSearchDraft}
                        onChange={(event) => setSiswaSearchDraft(event.target.value)}
                        placeholder="Cari siswa"
                        className="min-h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                      />
                    </span>
                  </label>
                  <label className="grid gap-1.5 text-sm text-card-foreground">
                    Kelas
                    <select
                      value={kelasFilterDraft}
                      onChange={(event) => setKelasFilterDraft(event.target.value)}
                      disabled={kelasLoading}
                      className="min-h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
                    >
                      <option value="">Semua kelas</option>
                      {kelasOptions.map((kelas) => (
                        <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} · Tingkat {kelas.tingkat}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <Search className="h-4 w-4" /> Cari
                  </button>
                </form>

                {siswaLoading ? (
                  <div role="status" className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat data siswa...
                  </div>
                ) : siswaRows.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {siswaRows.map((siswa) => (
                      <article key={siswa.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold text-card-foreground">{siswa.full_name}</h3>
                            <div className="mt-2">
                              {siswa.nisn ? (
                                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-card-foreground">
                                  NISN {siswa.nisn}
                                </span>
                              ) : (
                                <span className="inline-flex rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                  Belum ada NISN
                                </span>
                              )}
                            </div>
                            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                              <School className="h-4 w-4 shrink-0 text-primary" />
                              {siswa.kelas?.nama_kelas ?? 'Kelas tidak tersedia'}
                              {siswa.kelas && <span>· Tingkat {siswa.kelas.tingkat}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-border pt-3">
                          <button
                            type="button"
                            onClick={() => { setEditingSiswa(siswa); setSiswaFormError(null); setSiswaFormOpen(true); }}
                            className="inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-card-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                          >
                            <Pencil className="h-4 w-4" /> Edit NISN/Data
                          </button>
                          <button
                            type="button"
                            onClick={() => { setSiswaDeleteError(null); setSiswaToDelete(siswa); }}
                            className="inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-card-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted px-4 py-10 text-center text-sm text-muted-foreground">
                    {siswaSearch || kelasFilter ? 'Tidak ada siswa yang cocok dengan filter.' : 'Belum ada data siswa.'}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-center text-sm text-muted-foreground sm:text-left">
                    Halaman {siswaPage} dari {siswaTotalPages} · Total {siswaTotalCount} siswa
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSiswaPage((page) => Math.max(1, page - 1))}
                      disabled={siswaLoading || siswaPage <= 1}
                      aria-label="Halaman sebelumnya"
                      className="inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      <ChevronLeft className="h-4 w-4" /> Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() => setSiswaPage((page) => Math.min(siswaTotalPages, page + 1))}
                      disabled={siswaLoading || siswaPage >= siswaTotalPages}
                      aria-label="Halaman berikutnya"
                      className="inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                    >
                      Berikutnya <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div id="panel-siswa-import" role="tabpanel" aria-labelledby="tab-siswa-import" tabIndex={0} className="space-y-4">
                <InfoCard
                  icon={<School className="h-5 w-5" />}
                  title="Format CSV / Excel Siswa"
                  description="Gunakan header: full_name,nisn,nama_kelas,tingkat. Kolom nisn boleh dikosongkan. Setiap baris akan diproses menjadi data siswa dan kelas terkait."
                  descriptionId="siswa-csv-instructions"
                />

                <a
                  href="/template_siswa.csv"
                  download
                  className="inline-flex min-h-11 min-w-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-card-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <FileDown className="h-4 w-4" />
                  Unduh template CSV / Excel sampel siswa
                </a>

                <form onSubmit={handleSiswaSubmit} className="space-y-4">
                  <label className="grid gap-2 text-sm text-card-foreground">
                    <span>File CSV / Excel Siswa</span>
                    <input
                      name="csv_file"
                      type="file"
                      accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      aria-describedby="siswa-csv-instructions siswa-csv-help"
                      className="min-h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-card-foreground file:mr-4 file:min-h-11 file:min-w-11 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    />
                    <span id="siswa-csv-help" className="text-xs text-muted-foreground">Pilih file CSV atau Excel (.xls, .xlsx).</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingSiswa}
                    className="inline-flex min-h-11 min-w-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
          <section id="panel-guru" role="tabpanel" aria-labelledby="tab-guru" tabIndex={0} className="space-y-4 rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div role="tablist" aria-label="Tampilan data guru" onKeyDown={handleTabKeyDown} className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted p-1.5">
              <button
                type="button"
                id="tab-guru-manage"
                role="tab"
                aria-selected={guruSubTab === 'manage'}
                aria-controls={guruSubTab === 'manage' ? 'panel-guru-manage' : undefined}
                tabIndex={guruSubTab === 'manage' ? 0 : -1}
                onClick={() => setGuruSubTab('manage')}
                className={`min-h-11 min-w-11 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${guruSubTab === 'manage' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                Daftar &amp; Kelola Guru
              </button>
              <button
                type="button"
                id="tab-guru-import"
                role="tab"
                aria-selected={guruSubTab === 'import'}
                aria-controls={guruSubTab === 'import' ? 'panel-guru-import' : undefined}
                tabIndex={guruSubTab === 'import' ? 0 : -1}
                onClick={() => setGuruSubTab('import')}
                className={`min-h-11 min-w-11 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${guruSubTab === 'import' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card'}`}
              >
                Impor CSV Guru
              </button>
            </div>

            {guruSubTab === 'manage' ? (
              <div id="panel-guru-manage" role="tabpanel" aria-labelledby="tab-guru-manage" tabIndex={0} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">Daftar Guru &amp; Staf</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{guruProfiles.length} akun aktif</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingGuru(null); setGuruFormError(null); setGuruFormOpen(true); }}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Guru Baru
                  </button>
                </div>

                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={guruSearch}
                    onChange={(event) => setGuruSearch(event.target.value)}
                    placeholder="Cari nama, email, atau NIP/NISN"
                    aria-label="Cari guru"
                    className="min-h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  />
                </label>

                {guruNotice && <AlertBox tone={guruNotice.tone} message={guruNotice.message} />}

                {guruLoading ? (
                  <div role="status" className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
                    <LoaderCircle className="h-5 w-5 animate-spin" /> Memuat data guru...
                  </div>
                ) : filteredGuruProfiles.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {filteredGuruProfiles.map((profile) => (
                      <article key={profile.id} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold text-card-foreground">{profile.full_name}</h3>
                            <p className="mt-2 flex min-w-0 items-center gap-2 break-all text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 shrink-0 text-primary" /> {profile.email || 'Email belum tersedia'}
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <IdCard className="h-4 w-4 shrink-0" /> {profile.nip_nisn || 'NIP/NISN belum tersedia'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {profile.roles.map((role) => (
                            <span key={role} className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-card-foreground">
                              {role.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex gap-2 border-t border-border pt-3">
                          <button
                            type="button"
                            onClick={() => { setEditingGuru(profile); setGuruFormError(null); setGuruFormOpen(true); }}
                            className="inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-card-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuruToDelete(profile)}
                            className="inline-flex min-h-11 min-w-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-card-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted px-4 py-10 text-center text-sm text-muted-foreground">
                    {guruSearch ? 'Tidak ada guru yang cocok dengan pencarian.' : 'Belum ada data guru aktif.'}
                  </div>
                )}
              </div>
            ) : (
              <div id="panel-guru-import" role="tabpanel" aria-labelledby="tab-guru-import" tabIndex={0} className="space-y-4">
                <InfoCard
                  icon={<ShieldPlus className="h-5 w-5" />}
                  title="Format CSV / Excel Guru"
                  description="Gunakan header: email,full_name,nip_nisn,roles. Kolom roles dapat dipisahkan dengan titik koma, misalnya guru_mapel;wali_kelas;waka_kesiswaan."
                  descriptionId="guru-csv-instructions"
                />

                <a
                  href="/template_guru.csv"
                  download
                  className="inline-flex min-h-11 min-w-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm font-semibold text-card-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <FileDown className="h-4 w-4" />
                  Unduh template CSV / Excel sampel guru
                </a>

                <form onSubmit={handleGuruSubmit} className="space-y-4">
                  <label className="grid gap-2 text-sm text-card-foreground">
                    <span>Password Default Guru</span>
                    <input
                      name="default_password"
                      type="text"
                      defaultValue="Madrasah2026!"
                      className="min-h-11 w-full rounded-xl border border-border bg-card px-4 text-card-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-card-foreground">
                    <span>File CSV / Excel Guru</span>
                    <input
                      name="csv_file"
                      type="file"
                      accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      aria-describedby="guru-csv-instructions guru-csv-help"
                      className="min-h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-card-foreground file:mr-4 file:min-h-11 file:min-w-11 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    />
                    <span id="guru-csv-help" className="text-xs text-muted-foreground">Pilih file CSV atau Excel (.xls, .xlsx).</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingGuru}
                    className="inline-flex min-h-11 min-w-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
  const dialogRef = useAdminDialog(onClose, isPending);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(new FormData(event.currentTarget));
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="siswa-form-title"
      aria-modal="true"
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-end justify-center overflow-hidden border-0 bg-transparent p-0 backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:items-center sm:p-4"
    >
      <section
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manajemen Siswa</p>
            <h2 id="siswa-form-title" className="mt-1 text-xl font-semibold text-card-foreground">
              {student ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup form siswa"
            className="inline-flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {student && <input type="hidden" name="siswa_id" value={student.id} />}
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            Nama Lengkap
            <input
              name="full_name"
              required
              defaultValue={student?.full_name ?? ''}
              autoComplete="name"
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            NISN <span className="font-normal text-muted-foreground">(opsional)</span>
            <input
              name="nisn"
              inputMode="numeric"
              defaultValue={student?.nisn ?? ''}
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            Kelas
            <select
              name="kelas_id"
              required
              defaultValue={student?.kelas_id ?? ''}
              disabled={classesLoading || classes.length === 0}
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
            >
              <option value="" disabled>{classesLoading ? 'Memuat kelas...' : 'Pilih kelas'}</option>
              {classes.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} · Tingkat {kelas.tingkat}</option>
              ))}
            </select>
            {!classesLoading && classes.length === 0 && <span className="text-xs text-muted-foreground">Belum ada pilihan kelas.</span>}
          </label>

          {error && <AlertBox tone="error" message={error} />}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending || classesLoading || classes.length === 0}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
            >
              {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </section>
    </dialog>
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
  const dialogRef = useAdminDialog(onCancel, isPending);
  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="delete-siswa-title"
      aria-describedby="delete-siswa-description"
      aria-modal="true"
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-end justify-center overflow-hidden border-0 bg-transparent p-0 backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:items-center sm:p-4"
    >
      <section
        className="w-full max-w-md rounded-t-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:rounded-2xl"
      >
        <h2 id="delete-siswa-title" className="text-lg font-semibold text-card-foreground">Hapus data siswa?</h2>
        <p id="delete-siswa-description" className="mt-2 break-words text-sm leading-6 text-muted-foreground">
          Data <span className="font-semibold text-card-foreground">{fullName}</span> akan dihapus secara permanen.
        </p>
        {error && <div className="mt-4"><AlertBox tone="error" message={error} /></div>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
          >
            {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isPending ? 'Menghapus...' : 'Ya, hapus siswa'}
          </button>
        </div>
      </section>
    </dialog>
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
  const dialogRef = useAdminDialog(onClose, isPending);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit(new FormData(event.currentTarget));
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="guru-form-title"
      aria-modal="true"
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-end justify-center overflow-hidden border-0 bg-transparent p-0 backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:items-center sm:p-4"
    >
      <section
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manajemen Guru</p>
            <h2 id="guru-form-title" className="mt-1 text-xl font-semibold text-card-foreground">
              {profile ? 'Edit Data Guru' : 'Tambah Guru Baru'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Tutup form"
            className="inline-flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {profile && <input type="hidden" name="user_id" value={profile.id} />}
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            Nama Lengkap
            <input
              name="full_name"
              required
              defaultValue={profile?.full_name ?? ''}
              autoComplete="name"
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            Email
            <input
              name="email"
              type="email"
              required
              defaultValue={profile?.email ?? ''}
              autoComplete="email"
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            NIP/NISN
            <input
              name="nip_nisn"
              defaultValue={profile?.nip_nisn ?? ''}
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-card-foreground">
            Password {profile && <span className="font-normal text-muted-foreground">(kosongkan jika tidak diubah)</span>}
            <input
              name="password"
              type="password"
              required={!profile}
              minLength={6}
              autoComplete={profile ? 'new-password' : 'new-password'}
              placeholder={profile ? 'Tidak diubah' : 'Minimal 6 karakter'}
              className="min-h-11 rounded-lg border border-border bg-card px-3 text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            />
          </label>

          {error && <AlertBox tone="error" message={error} />}

          <fieldset className="rounded-xl border border-border p-3">
            <legend className="px-1 text-sm font-medium text-card-foreground">Role</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {guruRoles.map((role) => (
                <label key={role} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-card-foreground hover:bg-muted">
                  <input
                    type="checkbox"
                    name="roles"
                    value={role}
                    defaultChecked={profile?.roles.includes(role) ?? role === 'guru_mapel'}
                    className="h-4 w-4 accent-primary"
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
              className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
            >
              {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {isPending ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </section>
    </dialog>
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
  const dialogRef = useAdminDialog(onCancel, isPending);
  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      aria-labelledby="delete-guru-title"
      aria-describedby="delete-guru-description"
      aria-modal="true"
      className="fixed inset-0 m-0 flex h-full max-h-none w-full max-w-none items-end justify-center overflow-hidden border-0 bg-transparent p-0 backdrop:bg-foreground/40 backdrop:backdrop-blur-sm sm:items-center sm:p-4"
    >
      <section
        className="w-full max-w-md rounded-t-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:rounded-2xl"
      >
        <h2 id="delete-guru-title" className="text-lg font-semibold text-card-foreground">Nonaktifkan akun guru?</h2>
        <p id="delete-guru-description" className="mt-2 break-words text-sm leading-6 text-muted-foreground">
          Akun <span className="font-semibold text-card-foreground">{fullName}</span> akan dihapus dari daftar aktif dan akses masuknya dibekukan.
        </p>
        {error && <div className="mt-4"><AlertBox tone="error" message={error} /></div>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="min-h-11 rounded-lg border border-border px-4 text-sm font-semibold text-card-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
          >
            {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {isPending ? 'Menghapus...' : 'Ya, nonaktifkan'}
          </button>
        </div>
      </section>
    </dialog>
  );
}

function InfoCard({ icon, title, description, descriptionId }: { icon: React.ReactNode; title: string; description: string; descriptionId?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
      <div className="mb-3 inline-flex rounded-2xl bg-muted p-3 text-primary">{icon}</div>
      <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
      <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function AlertBox({ tone, message }: { tone: 'success' | 'error'; message: string }) {
  const styles = 'border-border bg-muted text-card-foreground';

  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}