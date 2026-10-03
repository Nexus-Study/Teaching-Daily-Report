'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { BookMarked, ClipboardList, LoaderCircle, RefreshCw, Save, Users } from 'lucide-react';

import type { HariName, JadwalGuru, JurnalMengajar, Kelas, MataPelajaran, Siswa, PresensiStatus } from '../../../types/database';
import { getAllMasterData, getRekapJurnal, getSiswaByKelas, getTodaySchedules, submitJurnalAndPresensi } from './actions';

type PresensiRow = {
  siswa_id: string;
  status: PresensiStatus;
};

const hariIndonesia = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getTodayWIT() {
  const witOffsetMilliseconds = 9 * 60 * 60 * 1000;
  return new Date(Date.now() + witOffsetMilliseconds).toISOString().slice(0, 10);
}

function getHariWIT(dateStr: string): HariName | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const hari = hariIndonesia[dayIndex];
  return hari === 'Minggu' ? null : hari as HariName;
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
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [jadwalHari, setJadwalHari] = useState<JadwalGuru[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [rekapList, setRekapList] = useState<JurnalMengajar[]>([]);
  const [selectedTanggal, setSelectedTanggal] = useState(getTodayWIT);
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [jamMulaiValue, setJamMulaiValue] = useState('');
  const [jamSelesaiValue, setJamSelesaiValue] = useState('');
  const [jamKeValue, setJamKeValue] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [simpanJadwalRutin, setSimpanJadwalRutin] = useState(true);
  const [presensiMap, setPresensiMap] = useState<Record<string, PresensiStatus>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isLoadingData, startLoadingData] = useTransition();
  const selectedHari = getHariWIT(selectedTanggal);

  useEffect(() => {
    startLoadingData(async () => {
      try {
        const [masterData, rekap] = await Promise.all([getAllMasterData(), getRekapJurnal()]);
        setKelasList(masterData.kelasList);
        setMapelList(masterData.mapelList);
        setRekapList(rekap);
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data awal.');
      }
    });
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;
    setSelectedJadwalId('');
    setSelectedKelasId('');
    setSelectedMapelId('');
    setSelectedMapel('');
    setJamMulaiValue('');
    setJamSelesaiValue('');
    setJamKeValue('');

    if (!selectedHari) {
      setJadwalHari([]);
      setIsManualMode(true);
      setSimpanJadwalRutin(true);
      return () => {
        isCurrentRequest = false;
      };
    }

    startLoadingData(async () => {
      try {
        const schedules = await getTodaySchedules(selectedHari);
        if (!isCurrentRequest) {
          return;
        }
        setJadwalHari(schedules);
        const manualMode = schedules.length === 0;
        setIsManualMode(manualMode);
        setSimpanJadwalRutin(manualMode);
      } catch (loadError: unknown) {
        if (isCurrentRequest) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat jadwal hari ini.');
        }
      }
    });

    return () => {
      isCurrentRequest = false;
    };
  }, [selectedHari]);

  const handleScheduleSelect = (jadwalId: string) => {
    setSelectedJadwalId(jadwalId);
    const jadwal = jadwalHari.find((item) => item.id === jadwalId);
    if (!jadwal) {
      setSelectedKelasId('');
      setSelectedMapelId('');
      setSelectedMapel('');
      setJamMulaiValue('');
      setJamSelesaiValue('');
      setJamKeValue('');
      return;
    }

    setSelectedKelasId(jadwal.kelas_id);
    setSelectedMapelId(jadwal.mapel_id);
    setSelectedMapel(jadwal.mata_pelajaran?.nama_mapel ?? '');
    setJamMulaiValue(String(jadwal.jam_mulai));
    setJamSelesaiValue(String(jadwal.jam_selesai));
    setJamKeValue(`${jadwal.jam_mulai}-${jadwal.jam_selesai}`);
  };

  const handleJamChange = (jamMulai: string, jamSelesai: string) => {
    setJamMulaiValue(jamMulai);
    setJamSelesaiValue(jamSelesai);
    setJamKeValue(jamMulai && jamSelesai ? `${jamMulai}-${jamSelesai}` : '');
  };

  useEffect(() => {
    let isCurrentRequest = true;
    if (!selectedKelasId) {
      setSiswaList([]);
      setPresensiMap({});
      return () => {
        isCurrentRequest = false;
      };
    }

    startLoadingData(async () => {
      try {
        const students = await getSiswaByKelas(selectedKelasId);
        if (!isCurrentRequest) {
          return;
        }
        setSiswaList(students);
        setPresensiMap(
          students.reduce<Record<string, PresensiStatus>>((accumulator, siswa) => {
            accumulator[siswa.id] = 'hadir';
            return accumulator;
          }, {}),
        );
      } catch (loadError: unknown) {
        if (isCurrentRequest) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat daftar siswa.');
        }
      }
    });

    return () => {
      isCurrentRequest = false;
    };
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

    if (!selectedKelasId || !selectedMapelId || !selectedMapel || !jamKeValue) {
      setError('Pilih jadwal atau lengkapi kelas, mata pelajaran, dan jam mengajar.');
      return;
    }

    const payload: PresensiRow[] = siswaList.map((siswa) => ({
      siswa_id: siswa.id,
      status: presensiMap[siswa.id] ?? 'hadir',
    }));

    formData.set('kelas_id', selectedKelasId);
    formData.set('tanggal', selectedTanggal);
    formData.set('mata_pelajaran', selectedMapel);
    formData.set('jam_ke', jamKeValue);
    formData.set('mapel_id', selectedMapelId);
    formData.set('jam_mulai', jamMulaiValue);
    formData.set('jam_selesai', jamSelesaiValue);
    formData.set('hari', selectedHari ?? '');
    formData.set('simpan_jadwal_rutin', String(simpanJadwalRutin && Boolean(selectedHari)));
    formData.set('presensi_json', JSON.stringify(payload));

    startSubmitting(async () => {
      try {
        await submitJurnalAndPresensi(formData);
        setMessage('Jurnal dan presensi berhasil disimpan.');
        try {
          const [rekap, schedules] = await Promise.all([
            getRekapJurnal(),
            selectedHari ? getTodaySchedules(selectedHari) : Promise.resolve([]),
          ]);
          setRekapList(rekap);
          setJadwalHari(schedules);
        } catch (refreshError: unknown) {
          setError(
            refreshError instanceof Error
              ? `Jurnal berhasil disimpan, tetapi data terbaru gagal dimuat: ${refreshError.message}`
              : 'Jurnal berhasil disimpan, tetapi data terbaru gagal dimuat.',
          );
        }
      } catch (submitError: unknown) {
        setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan jurnal.');
      }
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
              <p className="mt-1 text-sm leading-6 text-slate-300">Pastikan Bapak/Ibu sudah melengkapi jadwal mengajar di menu profil</p>
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
                  onChange={(event) => setSelectedTanggal(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 md:col-span-2">
                <input
                  type="checkbox"
                  checked={isManualMode}
                  disabled={jadwalHari.length === 0}
                  onChange={(event) => {
                    const manualMode = event.target.checked;
                    setIsManualMode(manualMode);
                    setSimpanJadwalRutin(manualMode);
                    if (!manualMode) {
                      handleScheduleSelect('');
                    } else {
                      setSelectedJadwalId('');
                    }
                  }}
                  className="h-4 w-4 accent-cyan-400"
                />
                <span>
                  Mengajar Kelas Lain / Infal / Setting Jadwal Mandiri
                  {jadwalHari.length === 0 ? <span className="block text-xs text-slate-400">Mode manual aktif karena tidak ada jadwal pada {selectedHari ?? 'hari ini'}.</span> : null}
                </span>
              </label>

              {!isManualMode && jadwalHari.length > 0 ? (
                <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                  <span>Pilih Jadwal Hari Ini</span>
                  <select
                    value={selectedJadwalId}
                    onChange={(event) => handleScheduleSelect(event.target.value)}
                    required
                    className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                  >
                    <option value="">Pilih jadwal mengajar</option>
                    {jadwalHari.map((jadwal) => (
                      <option key={jadwal.id} value={jadwal.id}>
                        {jadwal.kelas?.nama_kelas ?? 'Kelas'} — {jadwal.mata_pelajaran?.nama_mapel ?? 'Mata pelajaran'} (Jam {jadwal.jam_mulai}-{jadwal.jam_selesai})
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {isManualMode ? (
                <>
                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Kelas</span>
                    <select
                      value={selectedKelasId}
                      onChange={(event) => setSelectedKelasId(event.target.value)}
                      required
                      className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                    >
                      <option value="">Pilih kelas</option>
                      {kelasList.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Mata Pelajaran</span>
                    <select
                      value={selectedMapelId}
                      onChange={(event) => {
                        const mapel = mapelList.find((item) => item.id === event.target.value);
                        setSelectedMapelId(event.target.value);
                        setSelectedMapel(mapel?.nama_mapel ?? '');
                      }}
                      required
                      className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                    >
                      <option value="">Pilih mata pelajaran</option>
                      {mapelList.map((mapel) => <option key={mapel.id} value={mapel.id}>{mapel.nama_mapel}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Jam Mulai</span>
                    <select
                      value={jamMulaiValue}
                      onChange={(event) => handleJamChange(event.target.value, '')}
                      required
                      className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40"
                    >
                      <option value="">Pilih jam mulai</option>
                      {Array.from({ length: 8 }, (_, index) => index + 1).map((jam) => <option key={jam} value={jam}>{jam}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm text-slate-200">
                    <span>Jam Selesai</span>
                    <select
                      value={jamSelesaiValue}
                      onChange={(event) => handleJamChange(jamMulaiValue, event.target.value)}
                      disabled={!jamMulaiValue}
                      required
                      className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih jam selesai</option>
                      {Array.from({ length: 8 }, (_, index) => index + 1)
                        .filter((jam) => jam > Number(jamMulaiValue))
                        .map((jam) => <option key={jam} value={jam}>{jam}</option>)}
                    </select>
                  </label>
                </>
              ) : (
                <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                  <span>Jam Ke</span>
                  <input
                    value={jamKeValue}
                    readOnly
                    required
                    placeholder="Pilih jadwal untuk mengisi jam"
                    className="h-12 rounded-2xl border border-white/10 bg-slate-900/80 px-4 text-slate-100 outline-none"
                  />
                </label>
              )}

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

            {isManualMode ? (
              <label className="flex items-start gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-slate-200">
                <input
                  name="simpan_jadwal_rutin"
                  type="checkbox"
                  value="true"
                  checked={simpanJadwalRutin}
                  disabled={!selectedHari}
                  onChange={(event) => setSimpanJadwalRutin(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-cyan-400"
                />
                <span>
                  Simpan pilihan ini sebagai Jadwal Rutin Saya di Profil
                  {!selectedHari ? <span className="block text-xs text-amber-200">Jadwal rutin hanya dapat disimpan untuk Senin-Sabtu.</span> : null}
                </span>
              </label>
            ) : null}

            <input type="hidden" name="kelas_id" value={selectedKelasId} />
            <input type="hidden" name="mata_pelajaran" value={selectedMapel} />
            <input type="hidden" name="mapel_id" value={selectedMapelId} />
            <input type="hidden" name="jam_ke" value={jamKeValue} />
            <input type="hidden" name="jam_mulai" value={jamMulaiValue} />
            <input type="hidden" name="jam_selesai" value={jamSelesaiValue} />
            <input type="hidden" name="hari" value={selectedHari ?? ''} />
            <input type="hidden" name="simpan_jadwal_rutin" value={String(simpanJadwalRutin && Boolean(selectedHari))} />
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
                onClick={() => {
                  setError(null);
                  startLoadingData(async () => {
                    try {
                      const [masterData, rekap, schedules] = await Promise.all([
                        getAllMasterData(),
                        getRekapJurnal(),
                        selectedHari ? getTodaySchedules(selectedHari) : Promise.resolve([]),
                      ]);
                      setKelasList(masterData.kelasList);
                      setMapelList(masterData.mapelList);
                      setRekapList(rekap);
                      setJadwalHari(schedules);
                    } catch (loadError: unknown) {
                      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat ulang data jurnal.');
                    }
                  });
                }}
                disabled={isLoadingData}
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