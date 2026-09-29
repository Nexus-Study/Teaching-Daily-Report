'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { ArrowLeft, FileDown, LoaderCircle, School, ShieldPlus, Users } from 'lucide-react';

import { importGuruAction, importSiswaAndKelasAction } from './actions';

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('siswa');
  const [siswaResult, setSiswaResult] = useState<SiswaImportResult | null>(null);
  const [guruResult, setGuruResult] = useState<GuruImportResult | null>(null);
  const [isSubmittingSiswa, startSiswaTransition] = useTransition();
  const [isSubmittingGuru, startGuruTransition] = useTransition();

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
              Impor Siswa &amp; Kelas
            </button>
            <button type="button" onClick={() => setActiveTab('guru')} className={tabButtonClass('guru')}>
              Impor Guru &amp; Staf
            </button>
          </div>
        </section>

        {activeTab === 'siswa' ? (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <InfoCard
              icon={<School className="h-5 w-5" />}
              title="Format CSV / Excel Siswa"
              description="Gunakan header: full_name,nisn,nama_kelas,tingkat. Setiap baris akan diproses menjadi data siswa dan kelas terkait."
            />

            <a
              href="/template_siswa.csv"
              download
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition active:scale-95 hover:bg-indigo-500/20"
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
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmittingSiswa}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingSiswa ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Proses Impor Siswa
              </button>
            </form>

            {siswaFeedback}
          </section>
        ) : (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <InfoCard
              icon={<ShieldPlus className="h-5 w-5" />}
              title="Format CSV / Excel Guru"
              description="Gunakan header: email,full_name,nip_nisn,roles. Kolom roles dapat dipisahkan dengan titik koma, misalnya guru_mapel;wali_kelas;waka_kesiswaan."
            />

            <a
              href="/template_guru.csv"
              download
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-semibold text-indigo-200 transition active:scale-95 hover:bg-indigo-500/20"
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
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-200">
                <span>File CSV / Excel Guru</span>
                <input
                  name="csv_file"
                  type="file"
                  accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmittingGuru}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingGuru ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldPlus className="h-4 w-4" />}
                Proses Impor Guru
              </button>
            </form>

            {guruFeedback}
          </section>
        )}
      </div>
    </main>
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