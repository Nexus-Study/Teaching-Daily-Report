'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { BarChart3, CalendarRange, ClipboardList, LoaderCircle, RefreshCw, TriangleAlert, Users } from 'lucide-react';

import type { LaporanRingkas, ReportKelasOption } from './actions';
import { getFiltersOptions, getLaporanRingkas } from './actions';

const eskalasiLabel: Record<'ditangani_di_tempat' | 'diteruskan' | 'proses' | 'selesai', string> = {
  ditangani_di_tempat: 'Ditangani di Tempat',
  diteruskan: 'Diteruskan',
  proses: 'Proses',
  selesai: 'Selesai',
};

export default function LaporanPage() {
  const [kelasOptions, setKelasOptions] = useState<ReportKelasOption[]>([]);
  const [kelasId, setKelasId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<LaporanRingkas | null>(null);
  const [isLoading, startLoading] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadInitial();
  }, []);

  const loadInitial = async () => {
    try {
      setError(null);
      const options = await getFiltersOptions();
      setKelasOptions(options);
      if (!kelasId && options.length > 0) {
        setKelasId(options[0].id);
      }
    } catch (initialError) {
      setError(initialError instanceof Error ? initialError.message : 'Gagal memuat opsi laporan.');
    }
  };

  const loadReport = async () => {
    try {
      setError(null);
      const data = await getLaporanRingkas(kelasId || undefined, startDate || undefined, endDate || undefined);
      setReport(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat laporan.');
    }
  };

  useEffect(() => {
    if (!kelasOptions.length) {
      return;
    }

    startLoading(() => {
      void loadReport();
    });
  }, [kelasId, startDate, endDate, kelasOptions.length]);

  const summaryCards = useMemo(() => {
    if (!report) {
      return [
        { label: 'Total Jurnal Terisi', value: '0', tone: 'cyan' },
        { label: '% Kehadiran Siswa', value: '0%', tone: 'emerald' },
        { label: 'Total Catatan Pelanggaran', value: '0', tone: 'rose' },
        { label: 'Status Eskalasi Aktif', value: '0', tone: 'amber' },
      ];
    }

    const kehadiran = report.presensi.percentages.hadir;
    const aktif = report.eskalasi.diteruskan + report.eskalasi.proses;

    return [
      { label: 'Total Jurnal Terisi', value: String(report.totalJurnal), tone: 'cyan' },
      { label: '% Kehadiran Siswa', value: `${kehadiran}%`, tone: 'emerald' },
      { label: 'Total Catatan Pelanggaran', value: String(report.perilaku.totalCatatanPelanggaran), tone: 'rose' },
      { label: 'Status Eskalasi Aktif', value: String(aktif), tone: 'amber' },
    ];
  }, [report]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-100">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Rekap & Laporan</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Dashboard laporan ringkas</h1>
              <p className="mt-1 text-sm leading-6 text-slate-300">Ringkas, cepat dibaca, dan cocok dipakai dari layar ponsel.</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm text-slate-200 md:col-span-1">
              <span>Kelas</span>
              <select
                value={kelasId}
                onChange={(event) => setKelasId(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
              >
                <option value="">Semua kelas yang relevan</option>
                {kelasOptions.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas} - {kelas.tingkat}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              <span>Mulai</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              <span>Sampai</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
              />
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={loadReport}
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Terapkan Filter
            </button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            </article>
          ))}
        </section>

        {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Laporan Jurnal & Presensi</h2>
          </div>

          <div className="space-y-3">
            {!report || report.jurnalList.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada jurnal pada filter terpilih.</p>
            ) : (
              report.jurnalList.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.mata_pelajaran}</p>
                      <p className="text-xs text-slate-400">
                        {item.kelas_nama} • {item.tanggal} • Jam {item.jam_ke}
                      </p>
                    </div>
                    <div className="flex gap-2 text-[11px] font-semibold text-slate-200">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1">Hadir {item.hadir}</span>
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1">Izin {item.izin}</span>
                      <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1">Sakit {item.sakit}</span>
                      <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1">Alpa {item.alpa}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-300" />
              <h2 className="text-sm font-semibold text-white">Laporan Perilaku</h2>
            </div>

            <div className="space-y-3">
              {!report || report.perilakuList.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada catatan perilaku pada filter terpilih.</p>
              ) : (
                report.perilakuList.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.siswa_nama}</p>
                        <p className="text-xs text-slate-400">{item.tanggal} • Poin {item.poin}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                        {item.jenis}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.deskripsi}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                        Eskalasi {eskalasiLabel[item.status_eskalasi as keyof typeof eskalasiLabel] ?? item.status_eskalasi}
                      </span>
                      {item.tindak_lanjut ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200">
                          {item.tindak_lanjut}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-300" />
              <h2 className="text-sm font-semibold text-white">Progress Eskalasi Tindakan</h2>
            </div>

            {!report ? (
              <p className="text-sm text-slate-400">Memuat ringkasan eskalasi...</p>
            ) : (
              <div className="space-y-3">
                {(['ditangani_di_tempat', 'diteruskan', 'proses', 'selesai'] as const).map((status) => {
                  const value = report.eskalasi[status];
                  const width = Math.min(100, Math.max(8, value * 20 + 8));

                  return (
                    <div key={status} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-200">{eskalasiLabel[status]}</span>
                        <span className="text-sm font-semibold text-white">{value}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            status === 'ditangani_di_tempat'
                              ? 'bg-emerald-400'
                              : status === 'diteruskan'
                                ? 'bg-amber-400'
                                : status === 'proses'
                                  ? 'bg-sky-400'
                                  : 'bg-emerald-300'
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Memuat laporan...
          </div>
        ) : null}
      </div>
    </main>
  );
}