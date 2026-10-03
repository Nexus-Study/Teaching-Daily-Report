'use client';

import { useMemo, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';

import type { PresensiStatus, Siswa } from '../../../types/database';

export interface PresensiSederhanaProps {
  siswaList: Siswa[];
  presensiMap: Record<string, PresensiStatus>;
  onChange: (updatedMap: Record<string, PresensiStatus>) => void;
}

type StatusTidakHadir = Exclude<PresensiStatus, 'hadir'>;

const statusTidakHadir: StatusTidakHadir[] = ['sakit', 'izin', 'alpa'];
const statusLabels: Record<StatusTidakHadir, string> = {
  sakit: 'Sakit',
  izin: 'Izin',
  alpa: 'Alpa',
};
const statusStyles: Record<StatusTidakHadir, string> = {
  sakit: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
  izin: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  alpa: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
};

export default function PresensiSederhana({
  siswaList,
  presensiMap,
  onChange,
}: PresensiSederhanaProps) {
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StatusTidakHadir>('sakit');
  const selectableSiswa = useMemo(
    () => siswaList.filter((siswa) => (presensiMap[siswa.id] ?? 'hadir') === 'hadir'),
    [presensiMap, siswaList],
  );
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
      return;
    }

    onChange(buildUpdatedMap(selectedSiswaId, selectedStatus));
    setSelectedSiswaId('');
  };

  const removeAbsence = (siswaId: string) => {
    onChange(buildUpdatedMap(siswaId, 'hadir'));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_10rem_auto]">
        <label className="grid gap-2 text-sm text-slate-200">
          <span>Pilih Siswa Tidak Hadir</span>
          <select
            value={selectedSiswaIsAvailable ? selectedSiswaId : ''}
            onChange={(event) => setSelectedSiswaId(event.target.value)}
            disabled={selectableSiswa.length === 0}
            className="h-11 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-slate-100 outline-none transition focus:border-cyan-400/40 disabled:opacity-50"
          >
            <option value="">Pilih siswa</option>
            {selectableSiswa.map((siswa) => (
              <option key={siswa.id} value={siswa.id}>{siswa.full_name}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm text-slate-200">
          <span>Status</span>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value as StatusTidakHadir)}
            className="h-11 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-slate-100 outline-none transition focus:border-cyan-400/40"
          >
            {statusTidakHadir.map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={addAbsence}
            disabled={!selectedSiswaIsAvailable}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Ketidakhadiran
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {siswaTidakHadir.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-slate-400">
            Belum ada siswa yang ditandai tidak hadir. Siswa lainnya otomatis berstatus hadir.
          </p>
        ) : (
          siswaTidakHadir.map((siswa) => {
            const status = (presensiMap[siswa.id] ?? 'hadir') as StatusTidakHadir;

            return (
              <article
                key={siswa.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <p className="truncate text-sm font-medium text-white">{siswa.full_name}</p>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[status]}`}>
                    {statusLabels[status]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAbsence(siswa.id)}
                  aria-label={`Kembalikan ${siswa.full_name} menjadi hadir`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
