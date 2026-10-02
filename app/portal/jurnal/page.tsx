'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { BookMarked, ClipboardList, LoaderCircle, RefreshCw, Save, Users } from 'lucide-react';

import type { JadwalGuru, JurnalMengajar, Kelas, Siswa, PresensiStatus } from '../../../types/database';
import { getJadwalGuruByTeacher, getKelasList, getRekapJurnal, getSiswaByKelas, submitJurnalAndPresensi } from './actions';

type PresensiRow = {
  siswa_id: string;
  status: PresensiStatus;
};

const hariIndonesia = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getTodayWIT() {
  const witOffsetMilliseconds = 9 * 60 * 60 * 1000;
  return new Date(Date.now() + witOffsetMilliseconds).toISOString().slice(0, 10);
}

function getHariWIT(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return hariIndonesia[dayIndex];
}

const statusStyles: Record<PresensiStatus, string> = {
  hadir: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100',
  izin: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  sakit: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  alpa: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
};

const statusLabels: Record<PresensiStatus, string> = {
  hadir: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  alpa: 'Alpa',
};

export default function JurnalPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [jadwalGuru, setJadwalGuru] = useState<JadwalGuru[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [rekapList, setRekapList] = useState<JurnalMengajar[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState(getTodayWIT);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [jamKeValue, setJamKeValue] = useState('');
  const [presensiMap, setPresensiMap] = useState<Record<string, PresensiStatus>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isLoadingData, startLoadingData] = useTransition();

  useEffect(() => {
    startLoadingData(() => {
      void Promise.all([getKelasList(), getRekapJurnal(), getJadwalGuruByTeacher()])
        .then(([kelas, rekap, jadwal]) => {
          setKelasList(kelas);
          setRekapList(rekap);
          setJadwalGuru(jadwal);
        })
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data awal.');
        });
    });
  }, []);

  const selectedHari = getHariWIT(selectedTanggal);
  const jadwalHari = useMemo(
    () => jadwalGuru.filter((jadwal) => jadwal.hari === selectedHari),
    [jadwalGuru, selectedHari],
  );
  const mapelOptions = useMemo(
    () => Array.from(new Set(jadwalHari.map((jadwal) => jadwal.mata_pelajaran?.nama_mapel).filter((mapel): mapel is string => Boolean(mapel)))),
    [jadwalHari],
  );
  const kelasOptions = useMemo(() => {
    const classes = new Map<string, { id: string; nama_kelas: string }>();
    jadwalHari
      .filter((jadwal) => jadwal.mata_pelajaran?.nama_mapel === selectedMapel && jadwal.kelas)
      .forEach((jadwal) => classes.set(jadwal.kelas!.id, { id: jadwal.kelas!.id, nama_kelas: jadwal.kelas!.nama_kelas }));
    return Array.from(classes.values());
  }, [jadwalHari, selectedMapel]);
  const jamKeOptions = useMemo(
    () => Array.from(new Set(
      jadwalHari
        .filter((jadwal) => jadwal.mata_pelajaran?.nama_mapel === selectedMapel)
        .map((jadwal) => `${jadwal.jam_mulai}-${jadwal.jam_selesai}`),
    )).sort((left, right) => Number(left.split('-')[0]) - Number(right.split('-')[0])),
    [jadwalHari, selectedMapel],
  );

  useEffect(() => {
    if (mapelOptions.length === 1 && selectedMapel !== mapelOptions[0]) {
      setSelectedMapel(mapelOptions[0]);
    } else if (selectedMapel && !mapelOptions.includes(selectedMapel)) {
      setSelectedMapel('');
    }
  }, [mapelOptions, selectedMapel]);

  useEffect(() => {
    if (kelasOptions.length === 1 && selectedKelasId !== kelasOptions[0].id) {
      setSelectedKelasId(kelasOptions[0].id);
    } else if (selectedKelasId && !kelasOptions.some((kelas) => kelas.id === selectedKelasId)) {
      setSelectedKelasId('');
    }
  }, [kelasOptions, selectedKelasId]);

  useEffect(() => {
    if (jamKeOptions.length === 1 && jamKeValue !== jamKeOptions[0]) {
      setJamKeValue(jamKeOptions[0]);
    }
  }, [jamKeOptions, jamKeValue]);

  useEffect(() => {
    if (!selectedKelasId) {
      setSiswaList([]);
      setPresensiMap({});
      return;
    }

    startLoadingData(() => {
      void getSiswaByKelas(selectedKelasId)
        .then((students) => {
          setSiswaList(students);
          setPresensiMap(
            students.reduce<Record<string, PresensiStatus>>((accumulator, siswa) => {
              accumulator[siswa.id] = 'hadir';
              return accumulator;
            }, {}),
          );
        })
        .catch((loadError: unknown) => {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat daftar siswa.');
        });
    });
  }, [selectedKelasId]);

  const rekapWithClass = useMemo(
    () =>
      rekapList.map((jurnal) => ({
        ...jurnal,
        kelas_nama: kelasList.find((kelas) => kelas.id === jurnal.kelas_id)?.nama_kelas ?? 'Kelas tidak ditemukan',
      })),
    [kelasList, rekapList],
  );

  const handleStatusChange = (siswaId: string, status: PresensiStatus) => {
    setPresensiMap((current) => ({
      ...current,
      [siswaId]: status,
    }));
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    setMessage(null);

    const payload: PresensiRow[] = siswaList.map((siswa) => ({
      siswa_id: siswa.id,
      status: presensiMap[siswa.id] ?? 'hadir',
    }));

    formData.set('kelas_id', selectedKelasId);
    formData.set('tanggal', selectedTanggal);
    formData.set('mata_pelajaran', selectedMapel);
    formData.set('jam_ke', jamKeValue);
    formData.set('presensi_json', JSON.stringify(payload));

    startSubmitting(() => {
      void submitJurnalAndPresensi(formData)
        .then(async () => {
          setMessage('Jurnal dan presensi berhasil disimpan.');
          const rekap = await getRekapJurnal();
          setRekapList(rekap);
        })
        .catch((submitError: unknown) => {
          setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan jurnal.');
        });
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-100">
              <BookMarked className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Jurnal Mengajar</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Input jurnal & presensi</h1>
              <p className="mt-1 text-sm leading-6 text-slate-300">Target input kurang dari 60 detik dengan presensi ringkas per siswa.</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Tanggal</span>
                <input
                  name="tanggal"
                  type="date"
                  required
                  value={selectedTanggal}
                  onChange={(event) => {
                    setSelectedTanggal(event.target.value);
                    setSelectedMapel('');
                    setSelectedKelasId('');
                    setJamKeValue('');
                  }}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="grid gap-2 text-sm text-slate-200">
                <span>Mata Pelajaran</span>
                <select
                  name="mata_pelajaran"
                  required
                  value={selectedMapel}
                  onChange={(event) => {
                    setSelectedMapel(event.target.value);
                    setSelectedKelasId('');
                    setJamKeValue('');
                  }}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                >
                  <option value="">Pilih mata pelajaran</option>
                  {mapelOptions.map((mataPelajaran) => (
                    <option key={mataPelajaran} value={mataPelajaran}>{mataPelajaran}</option>
                  ))}
                </select>
                {mapelOptions.length === 0 && <span className="text-xs text-amber-200">Tidak ada jadwal mapel pada hari {selectedHari}.</span>}
              </label>

              <label className="grid gap-2 text-sm text-slate-200">
                <span>Kelas</span>
                <select
                  name="kelas_id"
                  required
                  disabled={!selectedMapel}
                  value={selectedKelasId}
                  onChange={(event) => setSelectedKelasId(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Pilih kelas</option>
                  {kelasOptions.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-slate-200">
                <span>Jam Ke</span>
                <input
                  name="jam_ke"
                  required
                  list="jam-ke-suggestions"
                  placeholder="Contoh: 1-2"
                  value={jamKeValue}
                  onChange={(event) => setJamKeValue(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
                <datalist id="jam-ke-suggestions">
                  {jamKeOptions.map((saran) => <option key={saran} value={saran} />)}
                </datalist>
              </label>

              <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                <span>Materi</span>
                <input
                  name="materi"
                  required
                  placeholder="Contoh: Bab thaharah"
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm text-slate-200">
              <span>Uraian Singkat Materi</span>
              <textarea
                name="catatan"
                rows={3}
                placeholder="Uraian singkat materi, catatan penting, atau hal-hal yang perlu dicatat."
                className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
              />
            </label>

            <input type="hidden" name="presensi_json" value="[]" readOnly />

            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-semibold text-white">Presensi Siswa</h2>
              </div>

              {!selectedKelasId ? (
                <p className="text-sm text-slate-400">Pilih kelas untuk memuat daftar siswa.</p>
              ) : siswaList.length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada siswa pada kelas ini.</p>
              ) : (
                <div className="space-y-3">
                  {siswaList.map((siswa) => {
                    const status = presensiMap[siswa.id] ?? 'hadir';

                    return (
                      <div key={siswa.id} className="rounded-2xl border border-white/8 bg-white/5 p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{siswa.full_name}</p>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>{statusLabels[status]}</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {(Object.keys(statusLabels) as PresensiStatus[]).map((itemStatus) => (
                            <button
                              key={itemStatus}
                              type="button"
                              onClick={() => handleStatusChange(siswa.id, itemStatus)}
                              className={`h-10 rounded-2xl border text-xs font-semibold transition active:scale-[0.98] ${
                                status === itemStatus
                                  ? statusStyles[itemStatus]
                                  : 'border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20 hover:bg-slate-900'
                              }`}
                            >
                              {statusLabels[itemStatus]}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingData}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Jurnal & Presensi
              </button>

              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  const [kelas, rekap, jadwal] = await Promise.all([getKelasList(), getRekapJurnal(), getJadwalGuruByTeacher()]);
                  setKelasList(kelas);
                  setRekapList(rekap);
                  setJadwalGuru(jadwal);
                }}
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
            <ClipboardList className="h-4 w-4 text-cyan-300" />
            <h2 className="text-sm font-semibold text-white">Rekap Jurnal Harian</h2>
          </div>

          <div className="space-y-3">
            {rekapWithClass.length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada jurnal yang tercatat.</p>
            ) : (
              rekapWithClass.map((jurnal) => (
                <article key={jurnal.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{jurnal.mata_pelajaran}</p>
                      <p className="text-xs text-slate-400">
                        {jurnal.kelas_nama} • Jam {jurnal.jam_ke} • {jurnal.tanggal}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
                      {jurnal.created_at}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{jurnal.materi}</p>
                  {jurnal.catatan ? <p className="mt-2 text-xs text-slate-400">Catatan: {jurnal.catatan}</p> : null}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}