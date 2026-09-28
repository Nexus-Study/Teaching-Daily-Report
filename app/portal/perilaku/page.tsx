'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, CircleUser, Filter, LoaderCircle, RefreshCw, Save, ShieldAlert, Users } from 'lucide-react';

import type { CatatanPerilaku, Kelas, PenangananPerilaku, PenangananStatus, PerilakuType, Siswa } from '../../../types/database';
import { getKelasAndSiswaList, getRekapPerilaku, submitCatatanPerilaku, submitPenangananEskalasi } from './actions';

type KelasWithSiswa = Kelas & {
  siswa: Siswa[];
};

type RekapItem = CatatanPerilaku & {
  siswa?: Siswa;
  penanganan_perilaku?: PenangananPerilaku[];
};

const perilakuStyles: Record<PerilakuType, string> = {
  positif: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
  pelanggaran: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
};

const statusStyles: Record<PenangananStatus, string> = {
  ditangani_di_tempat: 'border-slate-400/30 bg-slate-400/15 text-slate-100',
  diteruskan: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  proses: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  selesai: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
};

const statusLabel: Record<PenangananStatus, string> = {
  ditangani_di_tempat: 'Ditangani di Tempat',
  diteruskan: 'Diteruskan',
  proses: 'Proses',
  selesai: 'Selesai',
};

export default function PerilakuPage() {
  const [kelasList, setKelasList] = useState<KelasWithSiswa[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [jenis, setJenis] = useState<PerilakuType>('pelanggaran');
  const [tambahTindakLanjut, setTambahTindakLanjut] = useState(false);
  const [rekapList, setRekapList] = useState<RekapItem[]>([]);
  const [modalItem, setModalItem] = useState<RekapItem | null>(null);
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

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-rose-500/15 p-3 text-rose-100">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-300">Catatan Perilaku</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Input perilaku & eskalasi penanganan</h1>
              <p className="mt-1 text-sm leading-6 text-slate-300">Sederhana di layar ponsel, tetap siap untuk alur kolaboratif BK, wali kelas, dan kesiswaan.</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Kelas</span>
                <select
                  value={selectedKelasId}
                  onChange={(event) => {
                    setSelectedKelasId(event.target.value);
                    setSelectedSiswaId('');
                  }}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-rose-400/40"
                >
                  <option value="">Pilih kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama_kelas} - {kelas.tingkat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-slate-200">
                <span>Siswa</span>
                <select
                  name="siswa_id"
                  value={selectedSiswaId}
                  onChange={(event) => setSelectedSiswaId(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-rose-400/40"
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
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] ${
                  jenis === 'positif' ? perilakuStyles.positif : 'border-white/10 bg-slate-900/70 text-slate-300'
                }`}
              >
                Positif
              </button>
              <button
                type="button"
                onClick={() => setJenis('pelanggaran')}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition active:scale-[0.98] ${
                  jenis === 'pelanggaran' ? perilakuStyles.pelanggaran : 'border-white/10 bg-slate-900/70 text-slate-300'
                }`}
              >
                Pelanggaran
              </button>
            </div>

            <input type="hidden" name="jenis" value={jenis} readOnly />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Poin</span>
                <input
                  name="poin"
                  type="number"
                  defaultValue={0}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-rose-400/40"
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-200">
                <span>Tanggal</span>
                <input
                  name="tanggal"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-rose-400/40"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-slate-200">
              <span>Deskripsi Kejadian</span>
              <textarea
                name="deskripsi"
                rows={3}
                required
                placeholder="Ringkas, jelas, dan faktual"
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-rose-400/40"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={tambahTindakLanjut}
                onChange={(event) => setTambahTindakLanjut(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-rose-500"
              />
              Tindakan langsung / eskalasi awal
            </label>

            {tambahTindakLanjut ? (
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-rose-300" />
                  <h2 className="text-sm font-semibold text-white">Tindakan Awal</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Tindak Lanjut</span>
                    <textarea
                      name="tindak_lanjut"
                      rows={3}
                      placeholder="Contoh: Diperingatkan dan dipanggil setelah jam pelajaran"
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-rose-400/40"
                    />
                  </label>

                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Status Awal</span>
                    <select
                      name="status"
                      className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-rose-400/40"
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
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Catatan Perilaku
              </button>

              <button
                type="button"
                onClick={refreshData}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition active:scale-[0.98] hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Muat Ulang
              </button>
            </div>

            {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-rose-300" />
            <h2 className="text-sm font-semibold text-white">Rekap & Timeline Eskalasi</h2>
          </div>

          <div className="space-y-3">
            {timelineGroups.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada catatan perilaku.</p>
            ) : (
              timelineGroups.map((item) => {
                const latestHandling = item.latestHandling;

                return (
                  <article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.siswa?.full_name ?? 'Siswa tidak ditemukan'}</p>
                        <p className="text-xs text-slate-400">
                          {item.tanggal} • Poin {item.poin} • {item.deskripsi}
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
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Timeline Eskalasi</p>
                            <p className="mt-1 text-sm text-slate-200">{latestHandling.tindak_lanjut}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setModalItem(item)}
                            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-100 transition active:scale-[0.98] hover:bg-white/10"
                          >
                            <CircleUser className="h-4 w-4" />
                            Ubah Status
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-dashed border-white/10 bg-white/5 p-3">
                        <p className="text-sm text-slate-300">Belum ada tindak lanjut.</p>
                        <button
                          type="button"
                          onClick={() => setModalItem(item)}
                          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-slate-100 transition active:scale-[0.98] hover:bg-white/10"
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
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/70 px-4 pb-4 pt-10 backdrop-blur-sm md:place-items-center md:p-6">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.55)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-300">Penanganan Eskalasi</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{item.siswa?.full_name ?? 'Siswa'}</h3>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/10">
            Tutup
          </button>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Tindak Lanjut</span>
            <textarea
              value={tindakLanjut}
              onChange={(event) => setTindakLanjut(event.target.value)}
              rows={4}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-rose-400/40"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-200">
            <span>Status Eskalasi</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PenangananStatus)}
              className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-rose-400/40"
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Penanganan
          </button>
        </div>
      </div>
    </div>
  );
}