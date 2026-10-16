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
        { label: 'Total Jurnal Terisi', value: '0' },
        { label: '% Kehadiran Siswa', value: '0%' },
        { label: 'Total Catatan Pelanggaran', value: '0' },
        { label: 'Status Eskalasi Aktif', value: '0' },
      ];
    }

    const kehadiran = report.presensi.percentages.hadir;
    const aktif = report.eskalasi.diteruskan + report.eskalasi.proses;

    return [
      { label: 'Total Jurnal Terisi', value: String(report.totalJurnal) },
      { label: '% Kehadiran Siswa', value: `${kehadiran}%` },
      { label: 'Total Catatan Pelanggaran', value: String(report.perilaku.totalCatatanPelanggaran) },
      { label: 'Status Eskalasi Aktif', value: String(aktif) },
    ];
  }, [report]);

  return (
    <main className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-muted p-3 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Rekap & Laporan</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">Dashboard laporan ringkas</h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Ringkas, cepat dibaca, dan cocok dipakai dari layar ponsel.</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <label className="grid min-w-0 gap-2 text-sm text-card-foreground sm:col-span-2 md:col-span-2">
              <span>Kelas</span>
              <select
                value={kelasId}
                onChange={(event) => setKelasId(event.target.value)}
                className="min-h-[44px] w-full min-w-0 rounded-2xl border border-border bg-card px-4 text-card-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <option value="">Semua kelas yang relevan</option>
                {kelasOptions.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas} - {kelas.tingkat}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid min-w-0 gap-2 text-sm text-card-foreground">
              <span>Mulai</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="min-h-[44px] w-full min-w-0 rounded-2xl border border-border bg-card px-4 text-card-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              />
            </label>

            <label className="grid min-w-0 gap-2 text-sm text-card-foreground">
              <span>Sampai</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="min-h-[44px] w-full min-w-0 rounded-2xl border border-border bg-card px-4 text-card-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={loadReport}
              disabled={isLoading}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Memuat...' : 'Terapkan Filter'}
            </button>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-card-foreground">{card.value}</p>
            </article>
          ))}
        </section>

        {error ? <p role="alert" className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">{error}</p> : null}

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Laporan Jurnal & Presensi</h2>
          </div>

          <div className="space-y-3">
            {!report || report.jurnalList.length === 0 ? (
              <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Belum ada jurnal pada filter terpilih.</p>
            ) : (
              report.jurnalList.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{item.mata_pelajaran}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.kelas_nama} • {item.tanggal} • Jam {item.jam_ke}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-card-foreground">
                      <span className="rounded-full border border-border bg-muted px-3 py-1">Hadir {item.hadir}</span>
                      <span className="rounded-full border border-border bg-muted px-3 py-1">Izin {item.izin}</span>
                      <span className="rounded-full border border-border bg-muted px-3 py-1">Sakit {item.sakit}</span>
                      <span className="rounded-full border border-border bg-muted px-3 py-1">Alpa {item.alpa}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Laporan Perilaku</h2>
            </div>

            <div className="space-y-3">
              {!report || report.perilakuList.length === 0 ? (
                <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Belum ada catatan perilaku pada filter terpilih.</p>
              ) : (
                report.perilakuList.slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{item.siswa_nama}</p>
                        <p className="text-xs text-muted-foreground">{item.tanggal} • Poin {item.poin}</p>
                      </div>
                      <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-card-foreground">
                        {item.jenis}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.deskripsi}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-card-foreground">
                        Eskalasi {eskalasiLabel[item.status_eskalasi as keyof typeof eskalasiLabel] ?? item.status_eskalasi}
                      </span>
                      {item.tindak_lanjut ? (
                        <span className="rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-card-foreground">
                          {item.tindak_lanjut}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Progress Eskalasi Tindakan</h2>
            </div>

            {!report ? (
              <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Memuat ringkasan eskalasi...</p>
            ) : (
              <div className="space-y-3">
                {(['ditangani_di_tempat', 'diteruskan', 'proses', 'selesai'] as const).map((status) => {
                  const value = report.eskalasi[status];
                  const width = Math.min(100, Math.max(8, value * 20 + 8));

                  return (
                    <div key={status} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-card-foreground">{eskalasiLabel[status]}</span>
                        <span className="text-sm font-semibold text-card-foreground">{value}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
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
          <div role="status" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Memuat laporan...
          </div>
        ) : null}
      </div>
    </main>
  );
}