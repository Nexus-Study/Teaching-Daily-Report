'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, CircleUser, Filter, LoaderCircle, RefreshCw, Save, ShieldAlert, Users, ChevronDown } from 'lucide-react';

import type { CatatanPerilaku, Kelas, PenangananPerilaku, PenangananStatus, PerilakuType, Siswa } from '../../../types/database';
import { getKelasAndSiswaList, getRekapPerilaku, submitCatatanPerilaku, submitPenangananEskalasi } from './actions';

type KelasWithSiswa = Kelas & {
  siswa: Siswa[];
};

interface RekapItem extends CatatanPerilaku {
  siswa?: Siswa;
  penanganan_perilaku?: PenangananPerilaku[];
  latestHandling?: {
    tindak_lanjut?: string;
    status?: PenangananStatus;
  } | null;
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
  const date = new Date(dateString);
  
  const formatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jayapura',
  });

  const formatted = formatter.format(date);
  return `${formatted} WIT`;
}

export default function PerilakuPage() {
  const [kelasList, setKelasList] = useState<KelasWithSiswa[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [jenis, setJenis] = useState<PerilakuType>('pelanggaran');
  const [tambahTindakLanjut, setTambahTindakLanjut] = useState(true);
  const [rekapList, setRekapList] = useState<RekapItem[]>([]);
  const [modalItem, setModalItem] = useState<RekapItem | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  useEffect(() => {
    void refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setError(null);
      const [kelas, rekap] = await Promise.all([getKelasAndSiswaList(), getRekapPerilaku()]);
      setKelasList(kelas);
      setRekapList(rekap as RekapItem[]);

      if (!selectedKelasId && kelas.length > 0) {
        setSelectedKelasId(kelas[0].id);
      }
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Gagal memuat data perilaku.');
    }
  };

  const selectedKelas = useMemo(() => kelasList.find((kelas) => kelas.id === selectedKelasId), [kelasList, selectedKelasId]);

  const siswaList = selectedKelas?.siswa ?? [];

  const timelineGroups = useMemo(
    () =>
      rekapList.map((item) => ({
        ...item,
        latestHandling: item.penanganan_perilaku?.[0] ?? null,
      })),
    [rekapList],
  );

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setMessage(null);

    formData.set('jenis', jenis);
    formData.set('siswa_id', selectedSiswaId);

    startSubmitting(() => {
      void submitCatatanPerilaku(formData)
        .then(async () => {
          setMessage('Catatan perilaku berhasil disimpan.');
          await refreshData();
        })
        .catch((submitError: unknown) => {
          setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan catatan perilaku.');
        });
    });
  };

  const toggleExpanded = (cardId: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-800">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">Catatan Perilaku</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-card-foreground">Input perilaku & eskalasi penanganan</h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Sederhana di layar ponsel, tetap siap untuk alur kolaboratif BK, wali kelas, dan kesiswaan.</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-card-foreground">
                <span>Kelas</span>
                <select
                  value={selectedKelasId}
                  onChange={(event) => {
                    setSelectedKelasId(event.target.value);
                    setSelectedSiswaId('');
                  }}
                  className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <option value="">Pilih kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama_kelas} - {kelas.tingkat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-card-foreground">
                <span>Siswa</span>
                <select
                  name="siswa_id"
                  value={selectedSiswaId}
                  onChange={(event) => setSelectedSiswaId(event.target.value)}
                  className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <option value="">Pilih siswa</option>
                  {siswaList.map((siswa) => (
                    <option key={siswa.id} value={siswa.id}>
                      {siswa.full_name} - {siswa.nisn}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setJenis('positif')}
                className={`min-h-[44px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  jenis === 'positif' ? perilakuStyles.positif : 'border-border bg-background text-card-foreground'
                }`}
              >
                Positif
              </button>
              <button
                type="button"
                onClick={() => setJenis('pelanggaran')}
                className={`min-h-[44px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  jenis === 'pelanggaran' ? perilakuStyles.pelanggaran : 'border-border bg-background text-card-foreground'
                }`}
              >
                Pelanggaran
              </button>
            </div>

            <input type="hidden" name="jenis" value={jenis} readOnly />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-card-foreground">
                <span>Poin</span>
                <input
                  name="poin"
                  type="number"
                  defaultValue={0}
                  className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                />
              </label>

              <label className="grid gap-2 text-sm text-card-foreground">
                <span>Tanggal</span>
                <input
                  name="tanggal"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-card-foreground">
              <span>Deskripsi Kejadian</span>
              <textarea
                name="deskripsi"
                rows={3}
                required
                placeholder="Ringkas, jelas, dan faktual"
                className="min-h-[44px] rounded-2xl border border-border bg-background px-4 py-3 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              />
            </label>

            <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-border bg-background p-4 text-sm text-card-foreground">
              <input
                type="checkbox"
                checked={tambahTindakLanjut}
                onChange={(event) => setTambahTindakLanjut(event.target.checked)}
                className="h-4 w-4 rounded border-border bg-card text-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              />
              Tindakan langsung / eskalasi awal
            </label>

            {tambahTindakLanjut ? (
              <div className="rounded-3xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-rose-700" />
                  <h2 className="text-sm font-semibold text-card-foreground">Tindakan Awal</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-card-foreground">
                    <span>Tindak Lanjut</span>
                    <textarea
                      name="tindak_lanjut"
                      rows={3}
                      placeholder="Contoh: Diperingatkan dan dipanggil setelah jam pelajaran"
                      className="min-h-[44px] rounded-2xl border border-border bg-card px-4 py-3 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-card-foreground">
                    <span>Status Awal</span>
                    <select
                      name="status"
                      className="min-h-[44px] rounded-2xl border border-border bg-card px-4 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      <option value="ditangani_di_tempat">Ditangani di Tempat</option>
                      <option value="diteruskan">Diteruskan ke Wali Kelas/BK</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !selectedSiswaId}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-700 px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Catatan Perilaku
              </button>

              <button
                type="button"
                onClick={refreshData}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-card-foreground transition active:scale-[0.98] hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <RefreshCw className="h-4 w-4" />
                Muat Ulang
              </button>
            </div>

            {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
            {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-rose-700" />
            <h2 className="text-sm font-semibold text-card-foreground">Rekap & Timeline Eskalasi</h2>
          </div>

          <div className="space-y-3">
            {timelineGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada catatan perilaku.</p>
            ) : (
              timelineGroups.map((item) => {
                const latestHandling = item.latestHandling;
                const isExpanded = expandedCardIds[item.id] ?? false;
                const totalHandling = item.penanganan_perilaku?.length ?? 0;
                const hasMoreHistory = totalHandling > 1;

                return (
                  <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-card-foreground">{item.siswa?.full_name ?? 'Siswa tidak ditemukan'}</p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {item.tanggal} • Poin {item.poin}
                        </p>
                        <p className="mt-2 text-sm leading-5 text-foreground">
                          {item.deskripsi}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${perilakuStyles[item.jenis]}`}>
                          {item.jenis === 'positif' ? 'Positif' : 'Pelanggaran'}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[latestHandling?.status ?? 'ditangani_di_tempat']}`}>
                          {statusLabel[latestHandling?.status ?? 'ditangani_di_tempat']}
                        </span>
                      </div>
                    </div>

                    {latestHandling ? (
                      <div className="mt-3 rounded-2xl border border-border bg-card p-3">
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Timeline Eskalasi Terbaru</p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">{formatWIT(latestHandling.status === 'selesai' ? latestHandling.tanggal ?? new Date().toISOString() : new Date().toISOString())}</p>
                            <p className="mt-2 text-sm leading-5 text-card-foreground">{latestHandling.tindak_lanjut}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {latestHandling.status !== 'selesai' && (
                              <button
                                type="button"
                                onClick={() => setModalItem(item)}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-card-foreground transition active:scale-[0.98] hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                              >
                                <CircleUser className="h-4 w-4" />
                                Ubah Status
                              </button>
                            )}

                            {hasMoreHistory && (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(item.id)}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-card-foreground transition active:scale-[0.98] hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                Selengkapnya ({totalHandling - 1} riwayat)
                              </button>
                            )}

                            {latestHandling.status === 'selesai' && (
                              <span className="text-xs font-semibold text-emerald-700">Status terkunci (Selesai)</span>
                            )}
                          </div>
                        </div>

                        {isExpanded && hasMoreHistory && (
                          <div className="mt-4 space-y-3 border-t border-border pt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Riwayat Perubahan Status</p>
                            {item.penanganan_perilaku?.slice(1).map((handling, index) => (
                              <div key={`${item.id}-history-${index}`} className="rounded-2xl border border-border bg-background p-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-muted-foreground">{formatWIT(handling.updated_at ?? handling.tanggal)}</p>
                                    <p className="mt-1 text-sm text-card-foreground">{handling.tindak_lanjut}</p>
                                  </div>
                                  <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold whitespace-nowrap ${statusStyles[handling.status]}`}>
                                    {statusLabel[handling.status]}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-border bg-card p-3">
                        <p className="text-sm text-muted-foreground">Belum ada tindak lanjut.</p>
                        <button
                          type="button"
                          onClick={() => setModalItem(item)}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-card-foreground transition active:scale-[0.98] hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Tambah Penanganan
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>

      {modalItem ? (
        <PenangananModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSave={async (tindakLanjut, status) => {
            await submitPenangananEskalasi(modalItem.id, tindakLanjut, status);
            setModalItem(null);
            await refreshData();
          }}
        />
      ) : null}
    </main>
  );
}

function PenangananModal({
  item,
  onClose,
  onSave,
}: {
  item: RekapItem;
  onClose: () => void;
  onSave: (tindakLanjut: string, status: PenangananStatus) => Promise<void>;
}) {
  const [tindakLanjut, setTindakLanjut] = useState(item.latestHandling?.tindak_lanjut ?? '');
  const [status, setStatus] = useState<PenangananStatus>(item.latestHandling?.status ?? 'ditangani_di_tempat');
  const [isSubmitting, startSubmitting] = useTransition();

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 px-4 pb-4 pt-10 backdrop-blur-sm md:place-items-center md:p-6">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-700">Penanganan Eskalasi</p>
            <h3 className="mt-1 text-lg font-semibold text-card-foreground">{item.siswa?.full_name ?? 'Siswa'}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium text-card-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Tutup
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-card-foreground">
            <span>Tindak Lanjut</span>
            <textarea
              value={tindakLanjut}
              onChange={(event) => setTindakLanjut(event.target.value)}
              rows={4}
              className="min-h-[44px] rounded-2xl border border-border bg-background px-4 py-3 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            />
          </label>

          <label className="grid gap-2 text-sm text-card-foreground">
            <span>Status Eskalasi</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PenangananStatus)}
              className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <option value="ditangani_di_tempat">Ditangani di Tempat</option>
              <option value="diteruskan">Diteruskan</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
            </select>
          </label>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              startSubmitting(() => {
                void onSave(tindakLanjut, status);
              });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-rose-700 px-4 text-sm font-semibold text-white transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Penanganan
          </button>
        </div>
      </div>
    </div>
  );
}