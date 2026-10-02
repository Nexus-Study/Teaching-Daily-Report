'use client';

import { useState, type FormEvent } from 'react';
import { Check, LoaderCircle, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

import { deleteJadwalGuru, saveJadwalGuru, updateProfileNameAndRoles } from '../actions';
import type { HariName, JadwalGuru, Kelas, MataPelajaran, Profile, UserRole } from '@/types/database';

export type ProfileSchedule = Pick<
  JadwalGuru,
  'id' | 'teacher_id' | 'mapel_id' | 'kelas_id' | 'hari' | 'jam_mulai' | 'jam_selesai' | 'created_at'
> & {
  mata_pelajaran: Pick<MataPelajaran, 'id' | 'nama_mapel' | 'jumlah_jam'> | null;
  kelas: Pick<Kelas, 'id' | 'nama_kelas'> | null;
};

type ProfileTabProps = {
  profile: Profile;
  mataPelajaranList: MataPelajaran[];
  kelasList: Kelas[];
  jadwalList: ProfileSchedule[];
};

type ScheduleRow = {
  key: string;
  id?: string;
  kelas_id: string;
  hari: HariName;
  jam_mulai: number;
  jam_selesai: number;
  editing: boolean;
};

type ScheduleCard = {
  key: string;
  mapel_id: string;
  editing: boolean;
  rows: ScheduleRow[];
};

type Notice = { tone: 'success' | 'error'; message: string };

const dayOptions: HariName[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const hourOptions = Array.from({ length: 8 }, (_, index) => index + 1);
const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'guru_mapel', label: 'Guru Mapel' },
  { value: 'wali_kelas', label: 'Wali Kelas' },
  // { value: 'guru_piket', label: 'Guru Piket' },
  { value: 'guru_bk', label: 'Guru BK' },
  // { value: 'pembina_ekskul', label: 'Pembina Ekskul' },
  { value: 'waka_kesiswaan', label: 'Waka Kesiswaan' },
  { value: 'waka_kurikulum', label: 'Waka Kurikulum' },
  { value: 'guru_tahfidz', label: 'Guru Tahfidz' },
];

const fieldClass = 'min-h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70';
const iconButtonClass = 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50';

function makeScheduleCards(jadwalList: ProfileSchedule[]): ScheduleCard[] {
  const cards = new Map<string, ScheduleCard>();

  for (const jadwal of jadwalList) {
    let card = cards.get(jadwal.mapel_id);
    if (!card) {
      card = { key: jadwal.mapel_id, mapel_id: jadwal.mapel_id, editing: false, rows: [] };
      cards.set(jadwal.mapel_id, card);
    }
    card.rows.push({
      key: jadwal.id,
      id: jadwal.id,
      kelas_id: jadwal.kelas_id,
      hari: jadwal.hari,
      jam_mulai: jadwal.jam_mulai,
      jam_selesai: jadwal.jam_selesai,
      editing: false,
    });
  }

  return Array.from(cards.values());
}

export default function ProfileTab({ profile, mataPelajaranList, kelasList, jadwalList }: ProfileTabProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(profile.roles);
  const [profileEditing, setProfileEditing] = useState(false);
  const [cards, setCards] = useState(() => makeScheduleCards(jadwalList));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRowKey, setSavingRowKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName.trim()) {
      setNotice({ tone: 'error', message: 'Nama tidak boleh kosong.' });
      return;
    }

    setSavingProfile(true);
    setNotice(null);
    try {
      const result = await updateProfileNameAndRoles(fullName.trim(), selectedRoles);
      setFullName(fullName.trim());
      setProfileEditing(false);
      setNotice({ tone: 'success', message: result.message });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Profil gagal diperbarui.' });
    } finally {
      setSavingProfile(false);
    }
  }

  function toggleRole(role: UserRole) {
    setSelectedRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
  }

  function updateCard(cardKey: string, patch: Partial<Pick<ScheduleCard, 'mapel_id' | 'editing'>>) {
    setCards((current) => current.map((card) => card.key === cardKey ? { ...card, ...patch } : card));
  }

  function updateRow(cardKey: string, rowKey: string, patch: Partial<Omit<ScheduleRow, 'key' | 'id'>>) {
    setCards((current) => current.map((card) => card.key === cardKey
      ? { ...card, rows: card.rows.map((row) => row.key === rowKey ? { ...row, ...patch } : row) }
      : card));
  }

  function addMapelCard() {
    setNotice(null);
    setCards((current) => [...current, { key: crypto.randomUUID(), mapel_id: '', editing: true, rows: [] }]);
  }

  function addClassRow(cardKey: string) {
    setNotice(null);
    setCards((current) => current.map((card) => card.key === cardKey
      ? {
          ...card,
          rows: [...card.rows, { key: crypto.randomUUID(), kelas_id: '', hari: 'Senin', jam_mulai: 1, jam_selesai: 2, editing: true }],
        }
      : card));
  }

  async function handleSaveRow(card: ScheduleCard, row: ScheduleRow) {
    if (!card.mapel_id || !row.kelas_id) {
      setNotice({ tone: 'error', message: 'Pilih mata pelajaran dan kelas terlebih dahulu.' });
      return;
    }

    setSavingRowKey(row.key);
    setNotice(null);
    try {
      const result = await saveJadwalGuru({
        id: row.id,
        mapel_id: card.mapel_id,
        kelas_id: row.kelas_id,
        hari: row.hari,
        jam_mulai: row.jam_mulai,
        jam_selesai: row.jam_selesai,
      });

      if (!result.success) {
        setNotice({ tone: 'error', message: result.message });
        return;
      }

      setCards((current) => current.map((item) => item.key === card.key
        ? { ...item, rows: item.rows.map((currentRow) => currentRow.key === row.key
            ? { ...currentRow, id: result.jadwalId, key: result.jadwalId, editing: false }
            : currentRow) }
        : item));
      setNotice({ tone: 'success', message: result.message });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Jadwal gagal disimpan.' });
    } finally {
      setSavingRowKey(null);
    }
  }

  async function handleDeleteRow(cardKey: string, row: ScheduleRow) {
    setDeletingKey(row.key);
    setNotice(null);
    try {
      if (row.id) {
        const result = await deleteJadwalGuru(row.id);
        if (!result.success) {
          setNotice({ tone: 'error', message: result.message });
          return;
        }
      }

      setCards((current) => current
        .map((card) => card.key === cardKey ? { ...card, rows: card.rows.filter((item) => item.key !== row.key) } : card)
        .filter((card) => card.rows.length > 0 || card.mapel_id === ''));
      setNotice({ tone: 'success', message: row.id ? 'Jadwal berhasil dihapus.' : 'Baris jadwal dihapus.' });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Jadwal gagal dihapus.' });
    } finally {
      setDeletingKey(null);
    }
  }

  async function handleDeleteCard(card: ScheduleCard) {
    if (card.rows.some((row) => row.id) && !window.confirm('Hapus kartu mapel beserta seluruh jadwal kelas di dalamnya?')) {
      return;
    }

    setDeletingKey(card.key);
    setNotice(null);
    try {
      for (const row of card.rows) {
        if (!row.id) continue;
        const result = await deleteJadwalGuru(row.id);
        if (!result.success) {
          setNotice({ tone: 'error', message: result.message });
          return;
        }
      }

      setCards((current) => current.filter((item) => item.key !== card.key));
      setNotice({ tone: 'success', message: 'Kartu mapel dan jadwalnya berhasil dihapus.' });
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Kartu mapel gagal dihapus.' });
    } finally {
      setDeletingKey(null);
    }
  }

  return (
    <div className="space-y-7">
      {notice && (
        <div role={notice.tone === 'error' ? 'alert' : 'status'} aria-live="polite" className={`rounded-md border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>
          {notice.message}
        </div>
      )}

      <section aria-labelledby="profile-details-heading" className="space-y-5 border-b border-white/10 pb-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="profile-details-heading" className="text-lg font-semibold text-white">Data Profil</h2>
            <p className="mt-1 text-sm text-slate-400">Nama dan peranan yang tercatat pada akun.</p>
          </div>
          {!profileEditing && (
            <button type="button" onClick={() => { setNotice(null); setProfileEditing(true); }} className={iconButtonClass} aria-label="Edit profil" title="Edit profil">
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <label className="block max-w-xl space-y-2">
            <span className="text-sm font-medium text-slate-200">Nama Gelar</span>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={!profileEditing || savingProfile} className={fieldClass} autoComplete="name" />
          </label>

          <fieldset disabled={!profileEditing || savingProfile} className="space-y-3">
            <legend className="text-sm font-medium text-slate-200">Peranan</legend>
            <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {roleOptions.map((role) => (
                <label key={role.value} className="flex min-h-11 items-center gap-3 text-sm text-slate-300">
                  <input type="checkbox" checked={selectedRoles.includes(role.value)} onChange={() => toggleRole(role.value)} className="h-4 w-4 accent-cyan-400" />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>

          {profileEditing && (
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={savingProfile} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60">
                {savingProfile ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Profil
              </button>
              <button type="button" disabled={savingProfile} onClick={() => { setFullName(profile.full_name); setSelectedRoles(profile.roles); setProfileEditing(false); setNotice(null); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/5">
                <X className="h-4 w-4" />
                Batal
              </button>
            </div>
          )}
        </form>
      </section>

      <section aria-labelledby="teaching-schedule-heading" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="teaching-schedule-heading" className="text-lg font-semibold text-white">Jadwal Mengajar</h2>
            <p className="mt-1 text-sm text-slate-400">Atur kelas, hari, dan rentang jam untuk setiap mata pelajaran.</p>
          </div>
          <button type="button" onClick={addMapelCard} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/20 sm:self-auto">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Kartu Mapel
          </button>
        </div>

        {cards.length === 0 && <p className="border-l-2 border-slate-600 py-2 pl-3 text-sm text-slate-400">Belum ada jadwal mengajar.</p>}

        <div className="space-y-4">
          {cards.map((card) => {
            const selectedSubject = mataPelajaranList.find((subject) => subject.id === card.mapel_id);

            return (
              <article key={card.key} className="rounded-md border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    {card.editing ? (
                      <label className="block max-w-xl space-y-2">
                        <span className="text-xs font-medium text-slate-400">Mata Pelajaran</span>
                        <select value={card.mapel_id} onChange={(event) => updateCard(card.key, { mapel_id: event.target.value })} className={fieldClass}>
                          <option value="">Pilih mata pelajaran</option>
                          {mataPelajaranList.map((subject) => <option key={subject.id} value={subject.id}>{subject.nama_mapel}</option>)}
                        </select>
                      </label>
                    ) : (
                      <>
                        <h3 className="break-words text-base font-semibold text-white">{selectedSubject?.nama_mapel ?? 'Mata pelajaran tidak ditemukan'}</h3>
                        {selectedSubject && <p className="mt-1 text-xs text-slate-400">{selectedSubject.jumlah_jam} jam pelajaran</p>}
                      </>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => updateCard(card.key, { editing: !card.editing })} className={iconButtonClass} aria-label={card.editing ? 'Selesai edit kartu mapel' : 'Edit kartu mapel'} title={card.editing ? 'Selesai edit kartu mapel' : 'Edit kartu mapel'}>
                      {card.editing ? <Check className="h-4 w-4" aria-hidden="true" /> : <Pencil className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    <button type="button" onClick={() => void handleDeleteCard(card)} disabled={deletingKey === card.key} className={`${iconButtonClass} text-rose-300 hover:text-rose-200`} aria-label="Hapus kartu mapel" title="Hapus kartu mapel">
                      {deletingKey === card.key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-white/10">
                  {card.rows.map((row) => (
                    <div key={row.key} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-2 lg:grid-cols-[minmax(10rem,1.2fr)_minmax(8rem,0.8fr)_minmax(6rem,0.6fr)_minmax(6rem,0.6fr)_auto] lg:items-end">
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-400">Hari</span>
                        <select value={row.hari} onChange={(event) => updateRow(card.key, row.key, { hari: event.target.value as HariName })} disabled={!row.editing || savingRowKey === row.key} className={fieldClass}>
                          {dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-400">Kelas</span>
                        <select value={row.kelas_id} onChange={(event) => updateRow(card.key, row.key, { kelas_id: event.target.value })} disabled={!row.editing || savingRowKey === row.key} className={fieldClass}>
                          <option value="">Pilih kelas</option>
                          {kelasList.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas}</option>)}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-400">Jam Mulai</span>
                        <select value={row.jam_mulai} onChange={(event) => updateRow(card.key, row.key, { jam_mulai: Number(event.target.value) })} disabled={!row.editing || savingRowKey === row.key} className={fieldClass}>
                          {hourOptions.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-xs font-medium text-slate-400">Jam Selesai</span>
                        <select value={row.jam_selesai} onChange={(event) => updateRow(card.key, row.key, { jam_selesai: Number(event.target.value) })} disabled={!row.editing || savingRowKey === row.key} className={fieldClass}>
                          {hourOptions.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
                        </select>
                      </label>
                      <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-1">
                        {row.editing ? (
                          <button type="button" onClick={() => void handleSaveRow(card, row)} disabled={savingRowKey === row.key} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cyan-400 px-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60 lg:flex-none">
                            {savingRowKey === row.key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Selesai
                          </button>
                        ) : (
                          <button type="button" onClick={() => { setNotice(null); updateRow(card.key, row.key, { editing: true }); }} className={iconButtonClass} aria-label="Edit baris jadwal" title="Edit baris jadwal">
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                        <button type="button" onClick={() => void handleDeleteRow(card.key, row)} disabled={deletingKey === row.key} className={`${iconButtonClass} text-rose-300 hover:text-rose-200`} aria-label="Hapus baris jadwal" title="Hapus baris jadwal">
                          {deletingKey === row.key ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => addClassRow(card.key)} className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Tambah kelas mengajar
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}