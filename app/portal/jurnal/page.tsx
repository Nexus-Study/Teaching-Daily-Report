'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { BookMarked, CalendarDays, ClipboardList, Clock3, LoaderCircle, Pencil, RefreshCw, Save, Search, Trash2, Users, X } from 'lucide-react';

import ConfirmationModal from '../components/confirmation-modal';
import type { HariName, JadwalGuru, JurnalMengajar, Kelas, MataPelajaran, Siswa, PresensiStatus } from '../../../types/database';
import { deleteJurnal, getAllMasterData, getCurrentTeacherId, getPresensiForJurnal, getRekapJurnal, getSiswaByKelas, getTodaySchedules, submitJurnalAndPresensi, updateJurnalAndPresensi, type PresensiInput } from './actions';
import PresensiSederhana from './PresensiSederhana';

type PresensiRow = {
  siswa_id: string;
  status: PresensiStatus;
};

type PendingSubmission = {
  formData: FormData;
  description: string;
  presensiInputs: PresensiInput[];
  editingJurnalId: string | null;
};

const hariIndonesia = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function getTodayWIT() {
  const witOffsetMilliseconds = 9 * 60 * 60 * 1000;
  return new Date(Date.now() + witOffsetMilliseconds).toISOString().slice(0, 10);
}

function getHariWIT(dateStr: string): HariName | null {
  if (!dateStr) {
    return null;
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const dayIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const hari = hariIndonesia[dayIndex];
  return !hari || hari === 'Minggu' ? null : hari as HariName;
}

const statusStyles: Record<PresensiStatus, string> = {
  hadir: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  izin: 'border-amber-200 bg-amber-50 text-amber-800',
  sakit: 'border-sky-200 bg-sky-50 text-sky-800',
  alpa: 'border-rose-200 bg-rose-50 text-rose-800',
};

const statusLabels: Record<PresensiStatus, string> = {
  hadir: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  alpa: 'Alpa',
};

const journalDateFormatter = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function JurnalPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [jadwalHari, setJadwalHari] = useState<JadwalGuru[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [rekapList, setRekapList] = useState<JurnalMengajar[]>([]);
  const [viewDetailJurnal, setViewDetailJurnal] = useState<JurnalMengajar | null>(null);
  const [detailPresensiList, setDetailPresensiList] = useState<Array<{ id: string; full_name: string; status: PresensiStatus }>>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [currentTeacherId, setCurrentTeacherId] = useState('');
  const [editingJurnalId, setEditingJurnalId] = useState<string | null>(null);
  const isEditing = Boolean(editingJurnalId);
  const [selectedTanggal, setSelectedTanggal] = useState(getTodayWIT);
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedMapelId, setSelectedMapelId] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [materi, setMateri] = useState('');
  const [catatan, setCatatan] = useState('');
  const [refleksi, setRefleksi] = useState('');
  const [jamMulaiValue, setJamMulaiValue] = useState('');
  const [jamSelesaiValue, setJamSelesaiValue] = useState('');
  const [jamKeValue, setJamKeValue] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [simpanJadwalRutin, setSimpanJadwalRutin] = useState(true);
  const [presensiMap, setPresensiMap] = useState<Record<string, PresensiStatus>>({});
  const [modePresensi, setModePresensi] = useState<'detail' | 'sederhana'>('sederhana');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<PendingSubmission | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [pendingDeleteJurnalId, setPendingDeleteJurnalId] = useState<string | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [showAllRekap, setShowAllRekap] = useState(false);
  const [rekapSearch, setRekapSearch] = useState('');
  const [rekapPage, setRekapPage] = useState(1);
  const submissionInFlight = useRef(false);
  const deletionInFlight = useRef(false);
  const pendingEditPresensi = useRef<Record<string, PresensiStatus> | null>(null);
  const formSectionRef = useRef<HTMLElement>(null);
  const refleksiTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isLoadingData, startLoadingData] = useTransition();
  const selectedHari = getHariWIT(selectedTanggal);

  useEffect(() => {
    startLoadingData(async () => {
      try {
        const [masterData, rekap, teacherId] = await Promise.all([
          getAllMasterData(),
          getRekapJurnal(),
          getCurrentTeacherId(),
        ]);
        setKelasList(masterData.kelasList);
        setMapelList(masterData.mapelList);
        setRekapList(rekap);
        setCurrentTeacherId(teacherId);
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : 'Gagal memuat data awal.');
      }
    });
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;
    if (!editingJurnalId) {
      setSelectedJadwalId('');
      setSelectedKelasId('');
      setSelectedMapelId('');
      setSelectedMapel('');
      setJamMulaiValue('');
      setJamSelesaiValue('');
      setJamKeValue('');
    }

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
        if (!editingJurnalId) {
          setIsManualMode(manualMode);
          setSimpanJadwalRutin(manualMode);
        }
        if (!editingJurnalId && schedules[0]) {
          const firstSchedule = schedules[0];
          setSelectedJadwalId(firstSchedule.id);
          setSelectedKelasId(firstSchedule.kelas_id);
          setSelectedMapelId(firstSchedule.mapel_id);
          setSelectedMapel(firstSchedule.mata_pelajaran?.nama_mapel ?? '');
          setJamMulaiValue(String(firstSchedule.jam_mulai));
          setJamSelesaiValue(String(firstSchedule.jam_selesai));
          setJamKeValue(`${firstSchedule.jam_mulai}-${firstSchedule.jam_selesai}`);
        }
      } catch (loadError: unknown) {
        if (isCurrentRequest) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat jadwal hari ini.');
        }
      }
    });

    return () => {
      isCurrentRequest = false;
    };
  }, [editingJurnalId, selectedHari]);

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
        const restoredPresensi = pendingEditPresensi.current;
        setPresensiMap(students.reduce<Record<string, PresensiStatus>>((accumulator, siswa) => {
          accumulator[siswa.id] = restoredPresensi?.[siswa.id] ?? 'hadir';
          return accumulator;
        }, {}));
        pendingEditPresensi.current = null;
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

  const filteredRekap = useMemo(() => {
    const query = rekapSearch.trim().toLocaleLowerCase('id');
    return rekapWithClass.filter((jurnal) => {
      const matchesClass = showAllRekap || (selectedKelasId !== '' && jurnal.kelas_id === selectedKelasId);
      const matchesSearch =
        query === '' ||
        jurnal.materi.toLocaleLowerCase('id').includes(query) ||
        (jurnal.catatan ?? '').toLocaleLowerCase('id').includes(query);
      return matchesClass && matchesSearch;
    });
  }, [rekapSearch, rekapWithClass, selectedKelasId, showAllRekap]);
  const rekapPageSize = 3;
  const totalRekapPages = Math.max(1, Math.ceil(filteredRekap.length / rekapPageSize));
  const currentRekapPage = Math.min(rekapPage, totalRekapPages);
  const paginatedRekap = filteredRekap.slice(
    (currentRekapPage - 1) * rekapPageSize,
    currentRekapPage * rekapPageSize,
  );

  useEffect(() => {
    setRekapPage(1);
  }, [filteredRekap.length, rekapSearch, selectedKelasId, showAllRekap]);

  useEffect(() => {
    if (!viewDetailJurnal) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setViewDetailJurnal(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewDetailJurnal]);

  const handleStatusChange = (siswaId: string, status: PresensiStatus) => {
    setPresensiMap((current) => ({
      ...current,
      [siswaId]: status,
    }));
  };

  const resetEditMode = () => {
    setEditingJurnalId(null);
    setMateri('');
    setCatatan('');
    setRefleksi('');
    pendingEditPresensi.current = null;

    if (jadwalHari[0]) {
      setIsManualMode(false);
      setSimpanJadwalRutin(false);
      handleScheduleSelect(jadwalHari[0].id);
    } else {
      setIsManualMode(true);
      setSelectedJadwalId('');
      setSelectedKelasId('');
      setSelectedMapelId('');
      setSelectedMapel('');
      setJamMulaiValue('');
      setJamSelesaiValue('');
      setJamKeValue('');
    }
  };

  const handleEditJurnal = async (jurnal: JurnalMengajar, focusRefleksi = false) => {
    if (isLoadingEdit) {
      return;
    }

    setIsLoadingEdit(true);
    setError(null);
    setMessage(null);

    try {
      const [students, absences] = await Promise.all([
        getSiswaByKelas(jurnal.kelas_id),
        getPresensiForJurnal(jurnal.id),
      ]);
      const attendanceByStudent = absences.reduce<Record<string, PresensiStatus>>((attendance, entry) => {
        attendance[entry.siswa_id] = entry.status;
        return attendance;
      }, {});

      setEditingJurnalId(jurnal.id);
      setSelectedTanggal(jurnal.tanggal);
      setSelectedJadwalId('');
      setSelectedKelasId(jurnal.kelas_id);
      const mapel = mapelList.find((item) => item.nama_mapel === jurnal.mata_pelajaran);
      setSelectedMapelId(mapel?.id ?? '');
      setSelectedMapel(jurnal.mata_pelajaran);
      const [jamMulai, jamSelesai] = jurnal.jam_ke.split('-');
      setJamMulaiValue(jamMulai ?? '');
      setJamSelesaiValue(jamSelesai ?? '');
      setJamKeValue(jurnal.jam_ke);
      setIsManualMode(true);
      setSimpanJadwalRutin(false);
      setMateri(jurnal.materi);
      setCatatan(jurnal.catatan ?? '');
      setRefleksi(jurnal.refleksi ?? '');
      setSiswaList(students);

      const currentAttendance = students.reduce<Record<string, PresensiStatus>>((attendance, student) => {
        attendance[student.id] = attendanceByStudent[student.id] ?? 'hadir';
        return attendance;
      }, {});
      setPresensiMap(currentAttendance);

      if (selectedKelasId !== jurnal.kelas_id) {
        pendingEditPresensi.current = currentAttendance;
      } else {
        pendingEditPresensi.current = null;
      }
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (focusRefleksi) {
        window.requestAnimationFrame(() => refleksiTextareaRef.current?.focus());
      }
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat jurnal untuk diedit.');
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleViewDetail = async (jurnal: JurnalMengajar) => {
    setViewDetailJurnal(jurnal);
    setDetailPresensiList([]);
    setDetailError(null);
    setIsLoadingDetail(true);

    try {
      const [attendance, students] = await Promise.all([
        getPresensiForJurnal(jurnal.id),
        getSiswaByKelas(jurnal.kelas_id),
      ]);
      const statusByStudent = attendance.reduce<Record<string, PresensiStatus>>((statuses, entry) => {
        statuses[entry.siswa_id] = entry.status;
        return statuses;
      }, {});
      setDetailPresensiList(students.map((student) => ({
        id: student.id,
        full_name: student.full_name,
        status: statusByStudent[student.id] ?? 'hadir',
      })));
    } catch (detailError: unknown) {
      setDetailError(detailError instanceof Error ? detailError.message : 'Gagal memuat rincian presensi.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedKelasId || (!isEditing && !selectedMapelId) || !selectedMapel || !jamKeValue) {
      setError('Pilih jadwal atau lengkapi kelas, mata pelajaran, dan jam mengajar.');
      return;
    }

    const formData = new FormData(event.currentTarget);
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
    formData.set('refleksi', refleksi);

    const absentCount = payload.filter((row) => row.status !== 'hadir').length;
    const selectedKelas = kelasList.find((kelas) => kelas.id === selectedKelasId);
    const absenceDescription = absentCount === 0
      ? 'Tidak ada siswa yang ditandai tidak hadir.'
      : `${absentCount} siswa ditandai tidak hadir.`;
    setPendingSubmission({
      formData,
      presensiInputs: payload,
      description: `Kelas ${selectedKelas?.nama_kelas ?? 'yang dipilih'} • ${selectedMapel}. ${absenceDescription} Simpan jurnal dan presensi ini?`,
      editingJurnalId,
    });
    setIsConfirmationOpen(true);
  };

  const handleConfirmedSubmit = () => {
    if (!pendingSubmission || submissionInFlight.current) {
      return;
    }

    submissionInFlight.current = true;
    const { formData } = pendingSubmission;
    startSubmitting(async () => {
      try {
        if (pendingSubmission.editingJurnalId) {
          const journalId = pendingSubmission.editingJurnalId;
          const result = await updateJurnalAndPresensi(journalId, formData, pendingSubmission.presensiInputs);
          if (!result.success) {
            throw new Error(result.error);
          }
          setRekapList((current) => current.map((jurnal) => (
            jurnal.id === journalId
              ? {
                  ...jurnal,
                  materi: String(formData.get('materi') ?? ''),
                  catatan: String(formData.get('catatan') ?? '') || null,
                  refleksi: String(formData.get('refleksi') ?? '') || null,
                  tanggal: String(formData.get('tanggal') ?? jurnal.tanggal),
                  jam_ke: String(formData.get('jam_ke') ?? jurnal.jam_ke),
                }
              : jurnal
          )));
          setMessage('Jurnal berhasil diperbarui.');
          if (editingJurnalId === journalId) {
            resetEditMode();
          }
        } else {
          await submitJurnalAndPresensi(formData);
          setMessage('Jurnal dan presensi berhasil disimpan.');
        }
        setIsConfirmationOpen(false);
        setPendingSubmission(null);
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
        setIsConfirmationOpen(false);
        setPendingSubmission(null);
        setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan jurnal.');
      } finally {
        submissionInFlight.current = false;
      }
    });
  };

  const handleConfirmedDelete = () => {
    if (!pendingDeleteJurnalId || deletionInFlight.current) {
      return;
    }

    deletionInFlight.current = true;
    const jurnalId = pendingDeleteJurnalId;
    startDeleting(async () => {
      try {
        const result = await deleteJurnal(jurnalId);
        if (!result.success) {
          throw new Error(result.error);
        }
        setRekapList((current) => current.filter((jurnal) => jurnal.id !== jurnalId));
        setIsDeleteConfirmationOpen(false);
        setPendingDeleteJurnalId(null);
        if (editingJurnalId === jurnalId) {
          resetEditMode();
        }
        setMessage('Jurnal dan presensi berhasil dihapus.');
      } catch (deleteError: unknown) {
        setIsDeleteConfirmationOpen(false);
        setPendingDeleteJurnalId(null);
        setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus jurnal.');
      } finally {
        deletionInFlight.current = false;
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-slate-800">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 p-5 text-white shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-teal-50">
                <BookMarked className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-100">Jurnal Guru Mandiri</p>
                <h1 className="mt-1 text-xl font-bold leading-tight sm:text-2xl">Presensi &amp; Pengajaran Harian</h1>
                <p className="mt-1 max-w-xl text-sm text-teal-100">
                  Pilih jadwal mengajar di bawah. Riwayat jurnal akan mengikuti kelas yang dipilih.
                </p>
              </div>
            </div>
            <label className="grid shrink-0 gap-1.5 rounded-xl border border-white/20 bg-white/15 p-3 text-xs font-semibold text-teal-50 backdrop-blur sm:min-w-48">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Tanggal Input
              </span>
              <input
                name="tanggal"
                form="jurnal-form"
                type="date"
                required
                value={selectedTanggal}
                onChange={(event) => setSelectedTanggal(event.target.value)}
                className="h-9 rounded-lg border-0 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-teal-300"
              />
            </label>
          </div>
          {selectedTanggal && selectedTanggal < getTodayWIT() ? (
            <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/20 p-3 text-xs text-amber-50">
              <Clock3 className="h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
              <span>
                <strong>MODE JURNAL SUSULAN:</strong> Merekap jurnal lampau (
                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${selectedTanggal}T00:00:00Z`))}).
                Jadwal disesuaikan otomatis.
              </span>
            </p>
          ) : null}
        </header>

        <section ref={formSectionRef} className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form id="jurnal-form" onSubmit={handleFormSubmit} className="space-y-5">
            {isEditing ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">Edit Jurnal Mengajar</h2>
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-4 md:col-span-2" aria-labelledby="schedule-heading">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-teal-600" aria-hidden="true" />
                    <h2 id="schedule-heading" className="text-base font-bold text-slate-900">
                      1. Pilih Jadwal Mengajar{selectedHari ? ` (${selectedHari})` : ''}
                    </h2>
                  </div>
                  <button
                    type="button"
                    disabled={isEditing}
                    onClick={() => {
                      if (isManualMode) {
                        if (jadwalHari.length === 0) {
                          return;
                        }
                        setIsManualMode(false);
                        setSimpanJadwalRutin(false);
                        handleScheduleSelect(jadwalHari[0].id);
                      } else {
                        setIsManualMode(true);
                        setSimpanJadwalRutin(true);
                        setSelectedJadwalId('');
                      }
                    }}
                    aria-pressed={isManualMode}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isManualMode
                        ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    {isManualMode ? 'Tutup Mode Manual' : '+ Mode Manual / Infal'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {jadwalHari.map((jadwal) => {
                    const isSelected = selectedJadwalId === jadwal.id && !isManualMode;
                    const isFilled = rekapList.some(
                      (jurnal) =>
                        jurnal.tanggal === selectedTanggal &&
                        jurnal.kelas_id === jadwal.kelas_id &&
                        jurnal.mata_pelajaran === (jadwal.mata_pelajaran?.nama_mapel ?? '') &&
                        jurnal.jam_ke === `${jadwal.jam_mulai}-${jadwal.jam_selesai}`,
                    );

                    return (
                      <button
                        key={jadwal.id}
                        type="button"
                        disabled={isEditing}
                        aria-pressed={isSelected}
                        onClick={() => {
                          setIsManualMode(false);
                          setSimpanJadwalRutin(false);
                          handleScheduleSelect(jadwal.id);
                        }}
                        className={`flex min-h-28 flex-col justify-between rounded-xl border-2 p-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-teal-300'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="rounded bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
                            {jadwal.kelas?.nama_kelas ?? 'Kelas'}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isFilled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {isFilled ? 'Terisi' : 'Belum'}
                          </span>
                        </span>
                        <span className="mt-3 block">
                          <span className="block text-sm font-bold text-slate-900">{jadwal.mata_pelajaran?.nama_mapel ?? 'Mata pelajaran'}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">Jam {jadwal.jam_mulai}-{jadwal.jam_selesai}</span>
                        </span>
                      </button>
                    );
                  })}
                  {jadwalHari.length === 0 ? (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 sm:col-span-3">
                      Tidak ada jadwal mengajar{selectedHari ? ` pada hari ${selectedHari}` : ''}. Gunakan Mode Manual / Infal.
                    </p>
                  ) : null}
                </div>
              </section>

              {isManualMode && !isEditing ? (
                <>
                  <label className="grid gap-2 text-sm text-slate-700">
                    <span>Kelas</span>
                    <select
                      value={selectedKelasId}
                      onChange={(event) => setSelectedKelasId(event.target.value)}
                      required
                      disabled={isEditing}
                      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-600"
                    >
                      <option value="">Pilih kelas</option>
                      {kelasList.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>)}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm text-slate-700">
                    <span>Mata Pelajaran</span>
                    <select
                      value={selectedMapelId}
                      onChange={(event) => {
                        const mapel = mapelList.find((item) => item.id === event.target.value);
                        setSelectedMapelId(event.target.value);
                        setSelectedMapel(mapel?.nama_mapel ?? '');
                      }}
                      required
                      disabled={isEditing}
                      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-600"
                    >
                      <option value="">Pilih mata pelajaran</option>
                      {mapelList.map((mapel) => <option key={mapel.id} value={mapel.id}>{mapel.nama_mapel}</option>)}
                    </select>
                  </label>

                  {!isEditing ? <label className="grid gap-2 text-sm text-slate-700">
                    <span>Jam Mulai</span>
                    <select
                      value={jamMulaiValue}
                      onChange={(event) => handleJamChange(event.target.value, '')}
                      required
                      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    >
                      <option value="">Pilih jam mulai</option>
                      {Array.from({ length: 8 }, (_, index) => index + 1).map((jam) => <option key={jam} value={jam}>{jam}</option>)}
                    </select>
                  </label> : null}

                  {!isEditing ? <label className="grid gap-2 text-sm text-slate-700">
                    <span>Jam Selesai</span>
                    <select
                      value={jamSelesaiValue}
                      onChange={(event) => handleJamChange(jamMulaiValue, event.target.value)}
                      disabled={!jamMulaiValue}
                      required
                      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Pilih jam selesai</option>
                      {Array.from({ length: 8 }, (_, index) => index + 1)
                        .filter((jam) => jam > Number(jamMulaiValue))
                        .map((jam) => <option key={jam} value={jam}>{jam}</option>)}
                    </select>
                  </label> : null}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                      <p className="text-sm text-slate-700">
                        <span className="block text-xs font-semibold text-slate-500">Kelas</span>
                        <span className="mt-1 block font-medium">{kelasList.find((kelas) => kelas.id === selectedKelasId)?.nama_kelas ?? 'Kelas'}</span>
                      </p>
                      <p className="text-sm text-slate-700">
                        <span className="block text-xs font-semibold text-slate-500">Mata Pelajaran</span>
                        <span className="mt-1 block font-medium">{selectedMapel}</span>
                      </p>
                    </div>
                  ) : null}
                  <label className="grid gap-2 text-sm text-slate-700 md:col-span-2">
                    <span>Jam Ke</span>
                    <input
                      value={jamKeValue}
                      onChange={(event) => setJamKeValue(event.target.value)}
                      readOnly={!isEditing}
                      required
                      placeholder="Pilih jadwal untuk mengisi jam"
                      className="h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 outline-none read-only:cursor-default"
                    />
                  </label>
                </>
              )}

            </div>

            {isManualMode && !isEditing ? (
              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <input
                  name="simpan_jadwal_rutin"
                  type="checkbox"
                  value="true"
                  checked={simpanJadwalRutin}
                  disabled={!selectedHari}
                  onChange={(event) => setSimpanJadwalRutin(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-teal-600"
                />
                <span>
                  Simpan pilihan ini sebagai Jadwal Rutin Saya di Profil
                  {!selectedHari ? <span className="block text-xs text-amber-700">Jadwal rutin hanya dapat disimpan untuk Senin-Sabtu.</span> : null}
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
            <input type="hidden" name="presensi_json" value="[]" readOnly />

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    2. Presensi Cepat Siswa{selectedKelasId ? ` (${kelasList.find((kelas) => kelas.id === selectedKelasId)?.nama_kelas ?? 'Kelas'})` : ''}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">Seluruh siswa otomatis berstatus hadir. Tandai siswa yang absen saja.</p>
                </div>
              </div>

              <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1" role="tablist" aria-label="Mode presensi">
                <button
                  type="button"
                  role="tab"
                  aria-selected={modePresensi === 'sederhana'}
                  onClick={() => setModePresensi('sederhana')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    modePresensi === 'sederhana'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pengecualian (Cepat)
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={modePresensi === 'detail'}
                  onClick={() => setModePresensi('detail')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    modePresensi === 'detail'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daftar Lengkap
                </button>
              </div>

              {!selectedKelasId ? (
                <p className="text-sm text-slate-500">Pilih jadwal atau kelas manual untuk memuat daftar siswa.</p>
              ) : siswaList.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada siswa pada kelas ini.</p>
              ) : modePresensi === 'sederhana' ? (
                <PresensiSederhana
                  siswaList={siswaList}
                  presensiMap={presensiMap}
                  onChange={setPresensiMap}
                />
              ) : (
                <div className="space-y-3">
                  {siswaList.map((siswa) => {
                    const status = presensiMap[siswa.id] ?? 'hadir';

                    return (
                      <div key={siswa.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{siswa.full_name}</p>
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
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50'
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

            <section className="space-y-4" aria-labelledby="lesson-heading">
              <div className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-teal-600" aria-hidden="true" />
                <h2 id="lesson-heading" className="text-base font-bold text-slate-900">3. Pokok &amp; Uraian Singkat Materi</h2>
              </div>
              <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                <span>Pokok Bahasan / Topik Utama <span className="text-rose-600">*</span></span>
                <input
                  name="materi"
                  required
                  value={materi}
                  onChange={(event) => setMateri(event.target.value)}
                  placeholder="Contoh: Bab 2 Sistem Persamaan Linear"
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                <span>Uraian Singkat Kegiatan / Catatan Kelas (Opsional)</span>
                <textarea
                  name="catatan"
                  rows={3}
                  value={catatan}
                  onChange={(event) => setCatatan(event.target.value)}
                  placeholder="Tuliskan uraian singkat materi, kegiatan, atau catatan kelas."
                  className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-bold text-slate-700">
                <span>Refleksi Mengajar (Opsional)</span>
                <textarea
                  ref={refleksiTextareaRef}
                  name="refleksi"
                  rows={3}
                  value={refleksi}
                  onChange={(event) => setRefleksi(event.target.value)}
                  placeholder="Tuliskan refleksi, evaluasi pembelajaran, atau tindak lanjut."
                  className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </section>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isLoadingData || isLoadingEdit}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting
                  ? 'Memproses...'
                  : isEditing
                    ? 'Simpan Perubahan Jurnal'
                    : 'Simpan Jurnal & Presensi'}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetEditMode}
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal Edit
                </button>
              ) : null}

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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Muat Ulang
              </button>
            </div>

            {message ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
            {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p> : null}
          </form>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="rounded-xl border border-teal-100 bg-teal-50 p-2 text-teal-700">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Riwayat Jurnal Lampau</h2>
                  <span className="rounded-full border border-teal-200 bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {showAllRekap
                      ? 'Semua Kelas'
                      : selectedKelasId
                        ? `Khusus ${kelasList.find((kelas) => kelas.id === selectedKelasId)?.nama_kelas ?? 'Kelas Ini'}`
                        : 'Pilih Kelas'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Otomatis menyaring riwayat kelas terpilih untuk mempermudah evaluasi materi sebelumnya.
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-pressed={showAllRekap}
              onClick={() => setShowAllRekap((showAll) => !showAll)}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              {showAllRekap ? 'Khusus Kelas Ini' : 'Lihat Semua Kelas'}
            </button>
          </div>

          {!showAllRekap && selectedKelasId ? (
            <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 p-3 text-xs text-teal-900">
              <span className="font-bold text-teal-700" aria-hidden="true">✦</span>
              <span>
                <strong>Filter Kontekstual Aktif:</strong> Menampilkan riwayat pengajaran{' '}
                <strong>{kelasList.find((kelas) => kelas.id === selectedKelasId)?.nama_kelas ?? 'kelas terpilih'}</strong>.
              </span>
            </div>
          ) : null}

          <label className="relative block">
            <span className="sr-only">Cari materi atau uraian jurnal</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={rekapSearch}
              onChange={(event) => setRekapSearch(event.target.value)}
              placeholder="Cari materi atau uraian di kelas ini..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div className="space-y-3">
            {paginatedRekap.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                {rekapWithClass.length === 0
                  ? 'Belum ada jurnal yang tercatat.'
                  : !showAllRekap && !selectedKelasId
                    ? 'Pilih jadwal mengajar untuk menampilkan riwayat kelas, atau lihat semua kelas.'
                    : 'Tidak ada riwayat jurnal yang cocok dengan filter atau kata kunci.'}
              </p>
            ) : (
              paginatedRekap.map((jurnal) => (
                <article key={jurnal.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800">
                        {kelasList.find((kelas) => kelas.id === jurnal.kelas_id)?.nama_kelas ?? 'Kelas'}
                      </span>
                      <p className="text-xs text-slate-500">
                        {jurnal.mata_pelajaran} • Jam {jurnal.jam_ke}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <time dateTime={jurnal.tanggal} className="text-xs font-medium text-slate-500">
                        {journalDateFormatter.format(new Date(`${jurnal.tanggal}T00:00:00Z`))}
                      </time>
                      {jurnal.teacher_id === currentTeacherId ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void handleEditJurnal(jurnal)}
                            disabled={isLoadingData || isSubmitting || isDeleting || isLoadingEdit}
                            aria-label="Edit jurnal"
                            title="Edit jurnal"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoadingEdit ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Pencil className="h-4 w-4" aria-hidden="true" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setError(null);
                              setPendingDeleteJurnalId(jurnal.id);
                              setIsDeleteConfirmationOpen(true);
                            }}
                            disabled={isLoadingData || isSubmitting || isDeleting}
                            aria-label="Hapus jurnal"
                            title="Hapus jurnal"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900">{jurnal.materi}</h3>
                  {jurnal.catatan ? <p className="mt-1 text-xs leading-5 text-slate-600">Uraian: {jurnal.catatan}</p> : null}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                        ✓ {jurnal.jumlah_hadir ?? 0} Hadir
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700">
                        ✕ {jurnal.jumlah_absen ?? 0} Absen
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleViewDetail(jurnal)}
                        className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Lihat Detail
                      </button>
                      {jurnal.teacher_id === currentTeacherId ? (
                        <button
                          type="button"
                          onClick={() => void handleEditJurnal(jurnal, true)}
                          disabled={isLoadingData || isSubmitting || isDeleting || isLoadingEdit}
                          className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {jurnal.refleksi ? '✨ Edit Refleksi' : '+ Refleksi'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {jurnal.refleksi ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
                      <h4 className="text-xs font-bold tracking-wider text-amber-900">CATATAN REFLEKSI</h4>
                      <p className="mt-1.5 text-sm leading-6 text-amber-950">“{jurnal.refleksi}”</p>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs text-slate-600 sm:flex-row">
            <span>
              Menampilkan {filteredRekap.length === 0 ? '0-0' : `${(currentRekapPage - 1) * rekapPageSize + 1}-${Math.min(currentRekapPage * rekapPageSize, filteredRekap.length)}`} dari {filteredRekap.length} jurnal
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRekapPage((page) => Math.max(1, page - 1))}
                disabled={currentRekapPage <= 1}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Sebelumnya
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-800" aria-live="polite">
                Hal {currentRekapPage} dari {totalRekapPages}
              </span>
              <button
                type="button"
                onClick={() => setRekapPage((page) => Math.min(totalRekapPages, page + 1))}
                disabled={currentRekapPage >= totalRekapPages}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        </section>
      </div>
      {viewDetailJurnal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isLoadingDetail) {
              setViewDetailJurnal(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="presensi-detail-title"
            className="my-auto max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 id="presensi-detail-title" className="text-lg font-bold">Rincian Presensi Siswa</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {kelasList.find((kelas) => kelas.id === viewDetailJurnal.kelas_id)?.nama_kelas ?? 'Kelas'} • {viewDetailJurnal.mata_pelajaran} •{' '}
                  {journalDateFormatter.format(new Date(`${viewDetailJurnal.tanggal}T00:00:00Z`))}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup rincian presensi"
                onClick={() => setViewDetailJurnal(null)}
                disabled={isLoadingDetail}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5">
              {isLoadingDetail ? (
                <p className="flex items-center gap-2 py-4 text-sm text-slate-300" role="status">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Memuat rincian presensi...
                </p>
              ) : detailError ? (
                <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200" role="alert">
                  {detailError}
                </p>
              ) : detailPresensiList.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">Tidak ada data siswa pada kelas ini.</p>
              ) : (
                detailPresensiList.map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <span className="min-w-0 truncate text-sm font-medium">{student.full_name}</span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[student.status]}`}>
                      {statusLabels[student.status]}
                    </span>
                  </div>
                ))
              )}
            </div>
            <footer className="flex justify-end border-t border-white/10 p-4">
              <button
                type="button"
                onClick={() => setViewDetailJurnal(null)}
                disabled={isLoadingDetail}
                className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-600 disabled:opacity-50"
              >
                Tutup
              </button>
            </footer>
          </section>
        </div>
      ) : null}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        title={isEditing ? 'Konfirmasi Perubahan Jurnal' : 'Konfirmasi Simpan Jurnal'}
        description={pendingSubmission?.description ?? ''}
        confirmLabel={isEditing ? 'Simpan Perubahan' : 'Simpan Jurnal & Presensi'}
        isLoading={isSubmitting}
        onConfirm={handleConfirmedSubmit}
        onClose={() => {
          if (submissionInFlight.current) {
            return;
          }
          setIsConfirmationOpen(false);
          setPendingSubmission(null);
        }}
      />
      <ConfirmationModal
        isOpen={isDeleteConfirmationOpen}
        variant="danger"
        title="Hapus Jurnal Mengajar"
        description="Apakah Anda yakin ingin menghapus jurnal ini beserta seluruh data presensinya? Aksi ini tidak dapat dibatalkan."
        confirmLabel="Hapus Jurnal"
        isLoading={isDeleting}
        onConfirm={handleConfirmedDelete}
        onClose={() => {
          if (deletionInFlight.current) {
            return;
          }
          setIsDeleteConfirmationOpen(false);
          setPendingDeleteJurnalId(null);
        }}
      />
    </main>
  );
}