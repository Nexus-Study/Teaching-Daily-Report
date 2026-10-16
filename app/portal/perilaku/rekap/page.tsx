'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, ChevronDown, CircleUser, LoaderCircle, Pencil, RotateCcw, Save, ShieldAlert, Users } from 'lucide-react';
import { toast } from 'sonner';

import type { BehaviorActor, BehaviorHandler, CatatanPerilakuWithRelations } from '../actions';
import type { PenangananPerilaku, PenangananStatus, PerilakuType } from '../../../../types/database';
import { getPerilakuActor, getProfileAccessContext, getRekapPerilaku, reopenKasusPerilaku, submitPenangananEskalasi, updateDeskripsiPerilaku, type ProfileAccessContext } from '../actions';
import BehaviorTabs from '../components/behavior-tabs';

type RekapItem = CatatanPerilakuWithRelations & {
  latestHandling: (PenangananPerilaku & { handler?: BehaviorHandler }) | null;
};

type DescriptionEditTarget = {
  id: string;
  isCatatan: boolean;
  text: string;
  title: string;
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
  const [actor, setActor] = useState<BehaviorActor | null>(null);
  const [profileAccess, setProfileAccess] = useState<ProfileAccessContext | null>(null);
  const [reopenItem, setReopenItem] = useState<RekapItem | null>(null);
  const [editTarget, setEditTarget] = useState<DescriptionEditTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    void refreshData();
  }, []);

  async function refreshData() {
    try {
      setError(null);
      const [records, currentActor, currentProfileAccess] = await Promise.all([
        getRekapPerilaku(10),
        getPerilakuActor(),
        getProfileAccessContext(),
      ]);
      setRekapList(records);
      setActor(currentActor);
      setProfileAccess(currentProfileAccess);
      setHasMore(records.length === 10);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Gagal memuat rekap perilaku.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMore() {
    const lastRecord = rekapList[rekapList.length - 1];
    if (!lastRecord || isLoadingMore || !hasMore) {
      return;
    }

    try {
      setError(null);
      setIsLoadingMore(true);
      const nextRecords = await getRekapPerilaku(10, lastRecord.created_at);
      setRekapList((current) => {
        const loadedIds = new Set(current.map((record) => record.id));
        return [...current, ...nextRecords.filter((record) => !loadedIds.has(record.id))];
      });
      setHasMore(nextRecords.length === 10);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat rekap berikutnya.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  const timelineGroups = rekapList;

  async function saveHandling(item: RekapItem, tindakLanjut: string, status: PenangananStatus) {
    try {
      setError(null);
      await submitPenangananEskalasi(item.id, tindakLanjut, status);
      setModalItem(null);
      toast.success('Status penanganan berhasil diperbarui.');
      await refreshData();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Gagal menyimpan penanganan.';
      setError(message);
      toast.error('Gagal memperbarui status penanganan.', { description: message });
    }
  }

  async function reopenCase(item: RekapItem, reason: string, targetStatus: PenangananStatus) {
    try {
      setError(null);
      await reopenKasusPerilaku(item.id, reason, targetStatus);
      setReopenItem(null);
      toast.success('Kasus berhasil dibuka kembali.');
      await refreshData();
    } catch (reopenError) {
      const message = reopenError instanceof Error ? reopenError.message : 'Gagal membuka kembali kasus.';
      setError(message);
      toast.error('Gagal membuka kembali kasus.', { description: message });
    }
  }

  async function saveDescription(text: string) {
    if (!editTarget) {
      return;
    }

    try {
      setError(null);
      await updateDeskripsiPerilaku(editTarget.id, editTarget.isCatatan, text);
      setEditTarget(null);
      toast.success('Deskripsi berhasil diperbarui.');
      await refreshData();
    } catch (editError) {
      const message = editError instanceof Error ? editError.message : 'Gagal mengedit deskripsi.';
      setError(message);
      toast.error('Gagal mengedit deskripsi.', { description: message });
    }
  }

  function canManageTriage(item: CatatanPerilakuWithRelations): boolean {
    return Boolean(actor && (
      actor.roles.some((role) => role === 'admin' || role === 'guru_bk' || role === 'waka_kesiswaan')
      || (actor.roles.includes('wali_kelas') && item.isWaliKelas)
    ));
  }

  function canEditCatatan(item: CatatanPerilakuWithRelations): boolean {
    return Boolean(actor && (actor.roles.includes('admin') || actor.id === item.reporter_id));
  }

  function canEditHandling(handling: PenangananPerilaku): boolean {
    return Boolean(actor && (actor.roles.includes('admin') || actor.id === handling.handler_id));
  }

  function canViewStudentProfile(item: CatatanPerilakuWithRelations): boolean {
    return Boolean(
      profileAccess &&
      item.siswa &&
      (profileAccess.canViewAllStudents || profileAccess.accessibleClassIds.includes(item.siswa.kelas_id)),
    );
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
              const handlings = item.penanganan_perilaku ?? [];
              const latestHandling = handlings.length > 0 ? handlings[0] : null;
              const historyHandlings = handlings.length > 1 ? handlings.slice(1) : [];
              const cardItem: RekapItem = { ...item, latestHandling };
              const isExpanded = expandedCardIds[item.id] ?? false;
              const hasMoreHistory = historyHandlings.length > 0;
              const canTriage = canManageTriage(item);
              const canAddInitialHandling = canTriage || actor?.id === item.reporter_id;

              return (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.siswa && canViewStudentProfile(item) ? (
                        <Link href={`/portal/siswa/${item.siswa_id}/perilaku`} className="text-base font-semibold text-card-foreground underline-offset-4 hover:underline">
                          {item.siswa.full_name}
                        </Link>
                      ) : item.siswa ? (
                        <p className="text-base font-semibold text-card-foreground">{item.siswa.full_name}</p>
                      ) : <p className="text-base font-semibold text-card-foreground">Siswa tidak ditemukan</p>}
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{item.tanggal} • Poin {item.poin}</p>
                      <p className="mt-2 text-sm leading-5 text-foreground">{item.deskripsi}</p>
                      {canEditCatatan(item) ? (
                        <button
                          type="button"
                          onClick={() => setEditTarget({ id: item.id, isCatatan: true, text: item.deskripsi, title: 'Edit Deskripsi Catatan' })}
                          className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit Deskripsi
                        </button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${perilakuStyles[item.jenis]}`}>{item.jenis === 'positif' ? 'Positif' : 'Pelanggaran'}</span>
                      {latestHandling ? (
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[latestHandling.status]}`}>{statusLabel[latestHandling.status]}</span>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">Belum ada tindak lanjut</span>
                      )}
                    </div>
                  </div>

                  {latestHandling ? (
                    <div className="mt-3 rounded-2xl border border-border bg-card p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Timeline Eskalasi Terbaru</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{formatWIT(latestHandling.created_at)}</p>
                      <p className="mt-1 inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
                        Ditangani oleh: {latestHandling.handler?.full_name ?? 'Pengguna'} ({latestHandling.handler?.roles.map((role) => role.replace(/_/g, ' ')).join(', ') ?? 'peran tidak tersedia'})
                      </p>
                      <p className="mt-2 text-sm leading-5">{latestHandling.tindak_lanjut}</p>
                      {canEditHandling(latestHandling) ? (
                        <button
                          type="button"
                          onClick={() => setEditTarget({ id: latestHandling.id, isCatatan: false, text: latestHandling.tindak_lanjut, title: 'Edit Deskripsi Penanganan' })}
                          className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          <Pencil className="h-4 w-4" /> Edit Deskripsi
                        </button>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {latestHandling.status !== 'selesai' && canTriage ? (
                          <button type="button" onClick={() => setModalItem(cardItem)} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted">
                            <CircleUser className="h-4 w-4" /> Ubah Status
                          </button>
                        ) : null}
                        {latestHandling.status === 'selesai' ? (
                          <>
                            <span className="self-center text-xs font-semibold text-emerald-700">Status terkunci (Selesai)</span>
                            {canTriage ? (
                              <button type="button" onClick={() => setReopenItem(cardItem)} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 text-xs font-semibold text-amber-900 hover:bg-amber-100">
                                <RotateCcw className="h-4 w-4" /> Buka Kembali Kasus
                              </button>
                            ) : null}
                          </>
                        ) : null}
                        {hasMoreHistory ? (
                          <button
                            type="button"
                            onClick={() => setExpandedCardIds((current) => ({ ...current, [item.id]: !current[item.id] }))}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            Selengkapnya ({historyHandlings.length} riwayat)
                          </button>
                        ) : null}
                      </div>
                      {isExpanded && hasMoreHistory ? (
                        <div className="mt-4 space-y-3 border-t border-border pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Riwayat Perubahan Status</p>
                          {historyHandlings.map((handling) => (
                            <div key={handling.id} className="rounded-2xl border border-border bg-background p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-muted-foreground">{formatWIT(handling.created_at)}</p>
                                  <p className="mt-1 text-sm">{handling.tindak_lanjut}</p>
                                  <p className="mt-1 text-xs text-indigo-700">Ditangani oleh: {handling.handler?.full_name ?? 'Pengguna'} ({handling.handler?.roles.map((role) => role.replace(/_/g, ' ')).join(', ') ?? 'peran tidak tersedia'})</p>
                                  {canEditHandling(handling) ? (
                                    <button type="button" onClick={() => setEditTarget({ id: handling.id, isCatatan: false, text: handling.tindak_lanjut, title: 'Edit Deskripsi Penanganan' })} className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">
                                      <Pencil className="h-4 w-4" /> Edit Deskripsi
                                    </button>
                                  ) : null}
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
                      {canAddInitialHandling ? <button type="button" onClick={() => setModalItem(cardItem)} className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold hover:bg-muted">
                        <CheckCircle2 className="h-4 w-4" /> Tambah Penanganan
                      </button> : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {hasMore ? (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
              className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold hover:bg-muted disabled:cursor-wait disabled:opacity-60"
            >
              {isLoadingMore ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {isLoadingMore ? 'Memuat…' : 'Muat Lebih Banyak'}
            </button>
          ) : null}
        </section>
      </div>

      {modalItem ? <PenangananModal item={modalItem} actor={actor} canManageTriage={canManageTriage(modalItem)} error={error} onClose={() => setModalItem(null)} onSave={(tindakLanjut, status) => saveHandling(modalItem, tindakLanjut, status)} /> : null}
      {reopenItem ? <ReopenDialog item={reopenItem} error={error} onClose={() => setReopenItem(null)} onSave={(reason, status) => reopenCase(reopenItem, reason, status)} /> : null}
      {editTarget ? <DescriptionEditDialog target={editTarget} error={error} onClose={() => setEditTarget(null)} onSave={saveDescription} /> : null}
    </main>
  );
}

function PenangananModal({
  item,
  actor,
  canManageTriage,
  error,
  onClose,
  onSave,
}: {
  item: RekapItem;
  actor: BehaviorActor | null;
  canManageTriage: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (tindakLanjut: string, status: PenangananStatus) => Promise<void>;
}) {
  const [tindakLanjut, setTindakLanjut] = useState(item.latestHandling?.tindak_lanjut ?? '');
  const [status, setStatus] = useState<PenangananStatus>(item.latestHandling?.status ?? 'ditangani_di_tempat');
  const [isSubmitting, startSubmitting] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-2 pt-2 backdrop-blur-sm md:items-center md:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="handling-dialog-title" className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-xl md:max-h-[calc(100dvh-3rem)] md:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">Penanganan Eskalasi</p>
            <h2 id="handling-dialog-title" className="mt-1 text-lg font-semibold">{item.siswa?.full_name ?? 'Siswa'}</h2>
          </div>
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium">Tutup</button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          <div className="grid gap-2 text-sm">
            <span>Ditangani Oleh</span>
            <div className="flex min-h-[44px] items-center rounded-2xl border border-border bg-background px-4">
              {actor ? `${actor.full_name} (${actor.roles.map((role) => role.replace(/_/g, ' ')).join(', ')})` : 'Pengguna tidak tersedia'}
            </div>
          </div>
          <label className="grid gap-2 text-sm">
            <span>Tindak Lanjut</span>
            <textarea value={tindakLanjut} onChange={(event) => setTindakLanjut(event.target.value)} rows={4} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Status Eskalasi</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as PenangananStatus)} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
              <option value="ditangani_di_tempat">Ditangani di Tempat</option>
              {canManageTriage ? <>
                <option value="diteruskan">Diteruskan</option>
                <option value="proses">Proses</option>
                <option value="selesai">Selesai</option>
              </> : null}
            </select>
          </label>
        </div>
        <div className="shrink-0 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={isSubmitting || !tindakLanjut.trim()}
            onClick={() => startSubmitting(async () => { await onSave(tindakLanjut, status); })}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-rose-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Penanganan
          </button>
        </div>
      </div>
    </div>
  );
}

function ReopenDialog({
  item,
  error,
  onClose,
  onSave,
}: {
  item: RekapItem;
  error: string | null;
  onClose: () => void;
  onSave: (reason: string, status: PenangananStatus) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<PenangananStatus>('proses');
  const [isSubmitting, startSubmitting] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-2 pt-2 backdrop-blur-sm md:items-center md:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="reopen-dialog-title" className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-xl md:max-h-[calc(100dvh-3rem)] md:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-800">Workflow Re-open</p>
            <h2 id="reopen-dialog-title" className="mt-1 text-lg font-semibold">Buka kembali kasus {item.siswa?.full_name ?? ''}</h2>
          </div>
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium">Tutup</button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          <label className="grid gap-2 text-sm">
            <span>Alasan Buka Kembali</span>
            <textarea required value={reason} onChange={(event) => setReason(event.target.value)} rows={4} placeholder="Jelaskan alasan kasus perlu dibuka kembali" className="min-h-28 rounded-2xl border border-border bg-background px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>Status Tujuan</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as PenangananStatus)} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
              <option value="proses">Proses</option>
              <option value="diteruskan">Diteruskan</option>
            </select>
          </label>
        </div>
        <div className="shrink-0 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={isSubmitting || !reason.trim()}
            onClick={() => startSubmitting(async () => { await onSave(reason, status); })}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-amber-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Buka Kembali Kasus
          </button>
        </div>
      </div>
    </div>
  );
}

function DescriptionEditDialog({
  target,
  error,
  onClose,
  onSave,
}: {
  target: DescriptionEditTarget;
  error: string | null;
  onClose: () => void;
  onSave: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState(target.text);
  const [isSubmitting, startSubmitting] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-2 pt-2 backdrop-blur-sm md:items-center md:p-6">
      <div role="dialog" aria-modal="true" aria-labelledby="description-dialog-title" className="flex max-h-[calc(100dvh-0.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card text-card-foreground shadow-xl md:max-h-[calc(100dvh-3rem)] md:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4">
          <h2 id="description-dialog-title" className="text-lg font-semibold">{target.title}</h2>
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium">Tutup</button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
          {error ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
          <label className="grid gap-2 text-sm">
            <span>Deskripsi Baru</span>
            <textarea required value={text} onChange={(event) => setText(event.target.value)} rows={5} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
          </label>
          <p className="text-xs text-muted-foreground">Perubahan setelah 15 menit akan menyimpan versi terdahulu di log audit.</p>
        </div>
        <div className="shrink-0 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            disabled={isSubmitting || !text.trim() || text.trim() === target.text.trim()}
            onClick={() => startSubmitting(async () => { await onSave(text); })}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-indigo-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan Deskripsi
          </button>
        </div>
      </div>
    </div>
  );
}
