'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, ClipboardList, RefreshCw, TriangleAlert, Users } from 'lucide-react';

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
  const [reportKey, setReportKey] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState('');
  const requestId = useRef(0);
  const queryKey = JSON.stringify([kelasId, startDate, endDate]);
  const visibleReport = reportKey === queryKey ? report : null;
  const visibleError = errorKey === queryKey ? error : null;
  const isReportPending = isLoadingOptions || isLoadingReport ||
    (optionsLoaded && !optionsError && !visibleReport && !visibleError);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        setError(null);
        const options = await getFiltersOptions();
        if (!active) return;
        setKelasOptions(options);
        setKelasId(options[0]?.id ?? '');
      } catch (initialError) {
        if (active) {
          setOptionsError(initialError instanceof Error ? initialError.message : 'Gagal memuat opsi laporan.');
        }
      } finally {
        if (active) {
          setIsLoadingOptions(false);
          setOptionsLoaded(true);
        }
      }
    }

    void loadInitial();
    return () => {
      active = false;
    };
  }, []);

  const loadReport = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    const currentQueryKey = JSON.stringify([kelasId, startDate, endDate]);
    setIsLoadingReport(true);
    setError(null);
    setErrorKey(currentQueryKey);

    try {
      const data = await getLaporanRingkas(kelasId || undefined, startDate || undefined, endDate || undefined);
      if (currentRequestId === requestId.current) {
        setReport(data);
        setReportKey(currentQueryKey);
      }
    } catch (loadError) {
      if (currentRequestId === requestId.current) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat laporan.');
        setErrorKey(currentQueryKey);
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoadingReport(false);
      }
    }
  }, [kelasId, startDate, endDate]);

  useEffect(() => {
    if (!optionsLoaded || optionsError) return;
    void loadReport();
    return () => {
      requestId.current += 1;
    };
  }, [loadReport, optionsError, optionsLoaded]);

  const summaryCards = useMemo(() => {
    if (!visibleReport) return [];

    const kehadiran = visibleReport.presensi.percentages.hadir;
    const aktif = visibleReport.eskalasi.diteruskan + visibleReport.eskalasi.proses;

    return [
      { label: 'Total Jurnal Terisi', value: String(visibleReport.totalJurnal) },
      { label: '% Kehadiran Siswa', value: `${kehadiran}%` },
      { label: 'Total Catatan Pelanggaran', value: String(visibleReport.perilaku.totalCatatanPelanggaran) },
      { label: 'Status Eskalasi Aktif', value: String(aktif) },
    ];
  }, [visibleReport]);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-muted p-3 text-primary">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rekap &amp; Laporan</p>
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
                disabled={isLoadingOptions || kelasOptions.length === 0}
                aria-busy={isLoadingOptions}
                className="min-h-[44px] w-full min-w-0 rounded-2xl border border-border bg-card px-4 text-card-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <option value="">{isLoadingOptions ? 'Memuat kelas...' : 'Semua kelas yang relevan'}</option>
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
              disabled={isReportPending}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isReportPending ? 'animate-spin' : ''}`} />
              {isReportPending ? 'Memuat...' : 'Terapkan Filter'}
            </button>
          </div>
        </section>

        {visibleReport ? (
          <section aria-label="Ringkasan laporan" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article key={card.label} className="border-b border-border px-1 py-3 text-card-foreground">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-card-foreground">{card.value}</p>
              </article>
            ))}
          </section>
        ) : isReportPending ? (
          <div role="status" aria-live="polite" className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
            {isLoadingOptions ? 'Memuat pilihan filter...' : 'Memuat ringkasan laporan...'}
          </div>
        ) : null}

        {optionsError || visibleError ? (
          <p role="alert" className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-card-foreground">
            {optionsError ?? visibleError}
          </p>
        ) : null}

        <section aria-busy={isReportPending} className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Laporan Jurnal & Presensi</h2>
          </div>

          <div className="space-y-3">
            {isReportPending ? (
              <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Memuat jurnal...</p>
            ) : visibleReport?.jurnalList.length === 0 ? (
              <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Belum ada jurnal pada filter terpilih.</p>
            ) : visibleReport ? (
              visibleReport.jurnalList.map((item) => (
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
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article aria-busy={isReportPending} className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Laporan Perilaku</h2>
            </div>

            <div className="space-y-3">
              {isReportPending ? (
                <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Memuat catatan perilaku...</p>
              ) : visibleReport?.perilakuList.length === 0 ? (
                <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Belum ada catatan perilaku pada filter terpilih.</p>
              ) : visibleReport ? (
                visibleReport.perilakuList.slice(0, 8).map((item) => (
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
              ) : null}
            </div>
          </article>

          <article aria-busy={isReportPending} className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Progress Eskalasi Tindakan</h2>
            </div>

            {isReportPending ? (
              <p className="rounded-2xl bg-muted px-4 py-6 text-sm text-muted-foreground">Memuat ringkasan eskalasi...</p>
            ) : visibleReport ? (
              <div className="space-y-3">
                {(['ditangani_di_tempat', 'diteruskan', 'proses', 'selesai'] as const).map((status) => {
                  const value = visibleReport.eskalasi[status];
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
            ) : null}
          </article>
        </section>

      </div>
    </main>
  );
}