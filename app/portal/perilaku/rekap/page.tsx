'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, ChevronDown, CircleUser, LoaderCircle, Save, ShieldAlert, Users } from 'lucide-react';

import type { CatatanPerilakuWithRelations } from '../actions';
import type { PenangananPerilaku, PenangananStatus, PerilakuType } from '../../../../types/database';
import { getRekapPerilaku, submitPenangananEskalasi } from '../actions';
import BehaviorTabs from '../components/behavior-tabs';

type RekapItem = CatatanPerilakuWithRelations & {
  latestHandling: PenangananPerilaku | null;
};

const perilakuStyles: Record<PerilakuType, string> = {
  positif: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  pelanggaran: 'border-rose-200 bg-rose-100 text-rose-800',
};

const statusStyles: Record<PenangananStatus, string> = {
  ditangani_di_tempat: 'border-slate-200 bg-slate-100 text-slate-800',
  diteruskan: 'border-amber-200 bg-amber-100 text-amber-800',
  proses: 'border-sky-200 bg-sky-100 text-sky-800',
  selesai: 'border-emerald-200 bg-emerald-100 text-emerald-800',
};

const statusLabel: Record<PenangananStatus, string> = {
  ditangani_di_tempat: 'Ditangani di Tempat',
  diteruskan: 'Diteruskan',
  proses: 'Proses',
  selesai: 'Selesai',
};

function formatWIT(dateString: string): string {
  const formatted = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jayapura',
  }).format(new Date(dateString));

  return `${formatted} WIT`;
}

export default function PerilakuRekapPage() {
  const [rekapList, setRekapList] = useState<CatatanPerilakuWithRelations[]>([]);
  const [modalItem, setModalItem] = useState<RekapItem | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void refreshData();
  }, []);

  async function refreshData() {
    try {
      setError(null);
      setRekapList(await getRekapPerilaku());
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Gagal memuat rekap perilaku.');
    } finally {
      setIsLoading(false);
    }
  }

  const timelineGroups: RekapItem[] = rekapList.map((item) => ({
    ...item,
    latestHandling: item.penanganan_perilaku?.[0] ?? null,
  }));

  async function saveHandling(item: RekapItem, tindakLanjut: string, status: PenangananStatus) {
    try {
      setError(null);
      await submitPenangananEskalasi(item.id, tindakLanjut, status);
      setModalItem(null);
      await refreshData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Gagal menyimpan penanganan.');
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-800"><ShieldAlert className="h-6 w-6" /></div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">Catatan Perilaku</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Rekap & Timeline Eskalasi</h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Tinjau riwayat catatan dan tindak lanjut penanganan.</p>
            </div>
          </div>
          <div className="mt-4">
            <BehaviorTabs activeHref="/portal/perilaku/rekap" />
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-rose-700" /><h2 className="text-sm font-semibold">Rekap Catatan Perilaku</h2></div>
          {error ? <p role="alert" className="mb-3 text-sm font-medium text-rose-700">{error}</p> : null}
          <div className="space-y-3">
            {isLoading ? <p className="text-sm text-muted-foreground">Memuat rekap perilaku…</p> : null}
            {!isLoading && timelineGroups.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada catatan perilaku.</p> : null}
            {timelineGroups.map((item) => {
              const latestHandling = item.latestHandling;
              const isExpanded = expandedCardIds[item.id] ?? false;
              const totalHandling = item.penanganan_perilaku?.length ?? 0;
              const hasMoreHistory = totalHandling > 1;

              return (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.siswa ? (
                        <Link href={`/portal/siswa/${item.siswa_id}/perilaku`} className="text-base font-semibold text-card-foreground underline-offset-4 hover:underline">
                          {item.siswa.full_name}
                        </Link>
                      ) : <p className="text-base font-semibold text-card-foreground">Siswa tidak ditemukan</p>}
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{item.tanggal} • Poin {item.poin}</p>
                      <p className="mt-2 text-sm leading-5 text-foreground">{item.deskripsi}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${perilakuStyles[item.jenis]}`}>{item.jenis === 'positif' ? 'Positif' : 'Pelanggaran'}</span>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[latestHandling?.status ?? 'ditangani_di_tempat']}`}>{statusLabel[latestHandling?.status ?? 'ditangani_di_tempat']}</span>
                    </div>
                  </div>

                  {latestHandling ? (
                    <div className="mt-3 rounded-2xl border border-border bg-card p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Timeline Eskalasi Terbaru</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{formatWIT(latestHandling.updated_at ?? latestHandling.tanggal)}</p>
                      <p className="mt-2 text-sm leading-5">{latestHandling.tindak_lanjut}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {latestHandling.status !== 'selesai' ? (
                          <button type="button" onClick={() => setModalItem(item)} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted">
                            <CircleUser className="h-4 w-4" /> Ubah Status
                          </button>
                        ) : <span className="self-center text-xs font-semibold text-emerald-700">Status terkunci (Selesai)</span>}
                        {hasMoreHistory ? (
                          <button
                            type="button"
                            onClick={() => setExpandedCardIds((current) => ({ ...current, [item.id]: !current[item.id] }))}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            Selengkapnya ({totalHandling - 1} riwayat)
                          </button>
                        ) : null}
                      </div>
                      {isExpanded && hasMoreHistory ? (
                        <div className="mt-4 space-y-3 border-t border-border pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Riwayat Perubahan Status</p>
                          {item.penanganan_perilaku?.slice(1).map((handling) => (
                            <div key={handling.id} className="rounded-2xl border border-border bg-background p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-muted-foreground">{formatWIT(handling.updated_at ?? handling.tanggal)}</p>
                                  <p className="mt-1 text-sm">{handling.tindak_lanjut}</p>
                                </div>
                                <span className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold ${statusStyles[handling.status]}`}>{statusLabel[handling.status]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-border bg-card p-3">
                      <p className="text-sm text-muted-foreground">Belum ada tindak lanjut.</p>
                      <button type="button" onClick={() => setModalItem(item)} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted">
                        <CheckCircle2 className="h-4 w-4" /> Tambah Penanganan
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {modalItem ? <PenangananModal item={modalItem} error={error} onClose={() => setModalItem(null)} onSave={(tindakLanjut, status) => saveHandling(modalItem, tindakLanjut, status)} /> : null}
    </main>
  );
}

function PenangananModal({
  item,
  error,
  onClose,
  onSave,
}: {
  item: RekapItem;
  error: string | null;
  onClose: () => void;
  onSave: (tindakLanjut: string, status: PenangananStatus) => Promise<void>;
}) {
  const [tindakLanjut, setTindakLanjut] = useState(item.latestHandling?.tindak_lanjut ?? '');
  const [status, setStatus] = useState<PenangananStatus>(item.latestHandling?.status ?? 'ditangani_di_tempat');
  const [isSubmitting, startSubmitting] = useTransition();

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 px-4 pb-4 pt-10 backdrop-blur-sm md:place-items-center md:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="handling-dialog-title" className="w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">Penanganan Eskalasi</p>
            <h2 id="handling-dialog-title" className="mt-1 text-lg font-semibold">{item.siswa?.full_name ?? 'Siswa'}</h2>
          </div>
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium">Tutup</button>
        </div>
        <div className="grid gap-4">
          {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          <label className="grid gap-2 text-sm">
            <span>Tindak Lanjut</span>
            <textarea value={tindakLanjut} onChange={(event) => setTindakLanjut(event.target.value)} rows={4} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Status Eskalasi</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as PenangananStatus)} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
              <option value="ditangani_di_tempat">Ditangani di Tempat</option>
              <option value="diteruskan">Diteruskan</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </label>
          <button
            type="button"
            disabled={isSubmitting || !tindakLanjut.trim()}
            onClick={() => startSubmitting(() => { void onSave(tindakLanjut, status); })}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-rose-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Penanganan
          </button>
        </div>
      </div>
    </div>
  );
}
