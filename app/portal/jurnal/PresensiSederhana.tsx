'use client';

import { useMemo, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';

import ConfirmationModal from '../components/confirmation-modal';
import type { PresensiStatus, Siswa } from '../../../types/database';

export interface PresensiSederhanaProps {
  siswaList: Siswa[];
  presensiMap: Record<string, PresensiStatus>;
  onChange: (updatedMap: Record<string, PresensiStatus>) => void;
  isBusy?: boolean;
}

type StatusTidakHadir = Exclude<PresensiStatus, 'hadir'>;

const statusTidakHadir: StatusTidakHadir[] = ['sakit', 'izin', 'alpa'];
const statusLabels: Record<StatusTidakHadir, string> = {
  sakit: 'Sakit',
  izin: 'Izin',
  alpa: 'Alpa',
};
const statusStyles: Record<StatusTidakHadir, string> = {
  sakit: 'border-sky-200 bg-sky-50 text-sky-800',
  izin: 'border-amber-200 bg-amber-50 text-amber-800',
  alpa: 'border-rose-200 bg-rose-50 text-rose-800',
};

export default function PresensiSederhana({
  siswaList,
  presensiMap,
  onChange,
  isBusy = false,
}: PresensiSederhanaProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusTidakHadir>('sakit');
  const [pendingDeleteSiswa, setPendingDeleteSiswa] = useState<{ id: string; name: string } | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const selectableSiswa = useMemo(
    () => siswaList.filter((siswa) => (presensiMap[siswa.id] ?? 'hadir') === 'hadir'),
    [presensiMap, siswaList],
  );
  const filteredSiswa = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('id');
    return selectableSiswa.filter((siswa) => siswa.full_name.toLocaleLowerCase('id').includes(query));
  }, [searchTerm, selectableSiswa]);
  const selectedSiswaIsAvailable = selectableSiswa.some((siswa) => siswa.id === selectedSiswaId);
  const siswaTidakHadir = siswaList.filter((siswa) => {
    const status = presensiMap[siswa.id] ?? 'hadir';
    return status !== 'hadir';
  });

  const buildUpdatedMap = (
    siswaId: string,
    status: PresensiStatus,
  ): Record<string, PresensiStatus> => siswaList.reduce<Record<string, PresensiStatus>>((updatedMap, siswa) => {
    updatedMap[siswa.id] = siswa.id === siswaId ? status : presensiMap[siswa.id] ?? 'hadir';
    return updatedMap;
  }, {});

  const addAbsence = () => {
    if (!selectedSiswaIsAvailable) {
      setValidationMessage('Pilih siswa yang belum ditandai tidak hadir.');
      return;
    }

    setValidationMessage('');
    onChange(buildUpdatedMap(selectedSiswaId, selectedStatus));
    setSelectedSiswaId('');
  };

  const removeAbsence = (siswaId: string) => {
    onChange(buildUpdatedMap(siswaId, 'hadir'));
    setPendingDeleteSiswa(null);
  };

  return (
    <div className="w-full space-y-4 pb-6" aria-busy={isBusy}>
      {isBusy ? (
        <p role="status" aria-live="polite" className="sr-only">
          Menyimpan jurnal dan presensi.
        </p>
      ) : null}
      <div className="w-full p-0 sm:p-2">
        <div className="flex w-full min-w-0 flex-col gap-3">
          <div className="flex w-full min-w-0 flex-col gap-3 text-xs font-semibold text-card-foreground">
            <label htmlFor="siswa-search-input">Cari / Pilih Nama Siswa Tidak Hadir</label>
            <input
              id="siswa-search-input"
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSelectedSiswaId('');
                setValidationMessage('');
              }}
              placeholder="Ketik nama siswa..."
              autoComplete="off"
              className="h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            />
            <label htmlFor="siswa-absence-select" className="sr-only">Pilih siswa tidak hadir</label>
            <select
              id="siswa-absence-select"
              value={selectedSiswaIsAvailable ? selectedSiswaId : ''}
              onChange={(event) => {
                setSelectedSiswaId(event.target.value);
                setValidationMessage('');
              }}
              disabled={filteredSiswa.length === 0}
              aria-invalid={Boolean(validationMessage)}
              aria-describedby={`siswa-absence-help${validationMessage ? ' siswa-absence-error' : ''}`}
              className="h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm font-medium text-foreground transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <option value="">{filteredSiswa.length === 0 ? 'Tidak ada siswa yang cocok' : 'Pilih siswa'}</option>
              {filteredSiswa.map((siswa) => (
                <option key={siswa.id} value={siswa.id}>{siswa.full_name}</option>
              ))}
            </select>
            <span id="siswa-absence-help" className="sr-only">Pilih nama siswa yang belum ditandai tidak hadir.</span>
            {validationMessage ? (
              <span id="siswa-absence-error" role="alert" className="text-xs font-medium text-rose-700">
                {validationMessage}
              </span>
            ) : null}
          </div>

          <label className="flex w-full min-w-0 flex-col gap-1.5 text-xs font-semibold text-card-foreground">
            <span>Status Absen</span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as StatusTidakHadir)}
              aria-describedby="siswa-absence-status-help"
              className="h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm font-semibold text-foreground transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              {statusTidakHadir.map((status) => (
                <option key={status} value={status}>{status === 'alpa' ? 'Alpa / Tanpa Keterangan' : statusLabels[status]}</option>
              ))}
            </select>
            <span id="siswa-absence-status-help" className="sr-only">Status yang akan diberikan kepada siswa saat ditambahkan.</span>
          </label>

          <button
            type="button"
            onClick={addAbsence}
            aria-describedby={validationMessage ? 'siswa-absence-error' : undefined}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Tambah Ketidakhadiran
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Daftar Siswa Tidak Hadir ({siswaTidakHadir.length} Siswa)
        </p>
        {siswaTidakHadir.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs font-semibold text-emerald-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">✓</span>
            Semua siswa dicatat HADIR.
          </p>
        ) : (
          siswaTidakHadir.map((siswa) => {
            const status = (presensiMap[siswa.id] ?? 'hadir') as StatusTidakHadir;

            return (
              <article
                key={siswa.id}
                className="flex items-center justify-between gap-3 border-b border-border px-1 py-3 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <p className="truncate text-xs font-bold text-foreground">{siswa.full_name}</p>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>
                    {statusLabels[status]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDeleteSiswa({ id: siswa.id, name: siswa.full_name })}
                  aria-label={`Konfirmasi mengembalikan ${siswa.full_name} menjadi hadir`}
                  className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </article>
            );
          })
        )}
      </div>
      <ConfirmationModal
        isOpen={pendingDeleteSiswa !== null}
        variant="danger"
        title="Hapus dari Daftar Tidak Hadir"
        description={`Apakah Anda yakin ingin menghapus ${pendingDeleteSiswa?.name ?? 'siswa'} dari daftar tidak hadir dan mengembalikan statusnya menjadi Hadir?`}
        confirmLabel="Ya, Kembalikan Ke Hadir"
        onConfirm={() => {
          if (pendingDeleteSiswa) {
            removeAbsence(pendingDeleteSiswa.id);
          }
        }}
        onClose={() => setPendingDeleteSiswa(null)}
      />
    </div>
  );
}
