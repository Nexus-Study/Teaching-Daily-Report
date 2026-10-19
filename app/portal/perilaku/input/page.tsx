'use client';

import { useEffect, useMemo, useState, useTransition, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Filter, LoaderCircle, RefreshCw, Save, Search, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import type { Kelas, PerilakuType, Siswa } from '../../../../types/database';
import { getKelasAndSiswaList, getPerilakuActor, getProfileAccessContext, submitCatatanPerilaku, type BehaviorActor, type ProfileAccessContext } from '../actions';
import BehaviorTabs from '../components/behavior-tabs';

type KelasWithSiswa = Kelas & {
  siswa: Siswa[];
};

function getWITDateString(): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Jayapura',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Gagal menentukan tanggal WIT.');
  }

  return `${year}-${month}-${day}`;
}

export default function PerilakuInputPage() {
  const router = useRouter();
  const [kelasList, setKelasList] = useState<KelasWithSiswa[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [siswaQuery, setSiswaQuery] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [activeSiswaIndex, setActiveSiswaIndex] = useState(0);
  const [jenis, setJenis] = useState<PerilakuType>('pelanggaran');
  const [tambahTindakLanjut, setTambahTindakLanjut] = useState(true);
  const [tanggal, setTanggal] = useState('');
  const [actor, setActor] = useState<BehaviorActor | null>(null);
  const [profileAccess, setProfileAccess] = useState<ProfileAccessContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  useEffect(() => {
    setTanggal(getWITDateString());
    void refreshClasses();
    void Promise.all([getPerilakuActor(), getProfileAccessContext()])
      .then(([currentActor, currentProfileAccess]) => {
        setActor(currentActor);
        setProfileAccess(currentProfileAccess);
      })
      .catch((actorError: unknown) => {
        setError(actorError instanceof Error ? actorError.message : 'Gagal memuat identitas pengguna.');
      });
  }, []);

  const selectedKelas = useMemo(
    () => kelasList.find((kelas) => kelas.id === selectedKelasId),
    [kelasList, selectedKelasId],
  );
  const selectedSiswa = useMemo(
    () => selectedKelas?.siswa.find((siswa) => siswa.id === selectedSiswaId) ?? null,
    [selectedKelas, selectedSiswaId],
  );
  const canViewSelectedProfile = Boolean(
    selectedSiswa &&
    selectedKelas &&
    profileAccess &&
    (profileAccess.canViewAllStudents || profileAccess.accessibleClassIds.includes(selectedKelas.id)),
  );
  const siswaList = selectedKelas?.siswa ?? [];
  const filteredSiswa = useMemo(() => {
    const query = siswaQuery.trim().toLocaleLowerCase('id');
    if (!query) {
      return siswaList;
    }

    return siswaList.filter((siswa) =>
      `${siswa.full_name} ${siswa.nisn}`.toLocaleLowerCase('id').includes(query),
    );
  }, [siswaList, siswaQuery]);

  async function refreshClasses() {
    try {
      setError(null);
      const classes = await getKelasAndSiswaList();
      setKelasList(classes);
      setSelectedKelasId((current) => current || classes[0]?.id || '');
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Gagal memuat daftar siswa.';
      if (message === 'Akses input perilaku tidak diizinkan.') {
        router.replace('/portal');
        return;
      }
      setError(message);
    }
  }

  function selectSiswa(siswa: Siswa) {
    setSelectedSiswaId(siswa.id);
    setSiswaQuery(`${siswa.full_name} - ${siswa.nisn}`);
    setIsComboboxOpen(false);
  }

  function handleComboboxKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setIsComboboxOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isComboboxOpen) {
        setActiveSiswaIndex(0);
        setIsComboboxOpen(true);
        return;
      }
      setIsComboboxOpen(true);
      setActiveSiswaIndex((index) => (filteredSiswa.length ? (index + 1) % filteredSiswa.length : 0));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isComboboxOpen) {
        setActiveSiswaIndex(Math.max(filteredSiswa.length - 1, 0));
        setIsComboboxOpen(true);
        return;
      }
      setIsComboboxOpen(true);
      setActiveSiswaIndex((index) => (filteredSiswa.length ? (index - 1 + filteredSiswa.length) % filteredSiswa.length : 0));
      return;
    }

    if (event.key === 'Enter' && isComboboxOpen && filteredSiswa[activeSiswaIndex]) {
      event.preventDefault();
      selectSiswa(filteredSiswa[activeSiswaIndex]);
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set('siswa_id', selectedSiswaId);
    formData.set('jenis', jenis);

    startSubmitting(async () => {
      try {
        const result = await submitCatatanPerilaku(formData);
        if (!result.success) {
          setError(result.error);
          toast.error('Gagal menyimpan catatan perilaku.', { description: result.error });
          return;
        }

        toast.success('Catatan perilaku berhasil disimpan.', {
          description: result.warning,
        });
      } catch (submitError: unknown) {
        const rawMessage = submitError instanceof Error ? submitError.message : '';
        const message = rawMessage.startsWith('Minified React error #441')
          ? 'Terjadi gangguan pada server. Catatan belum tersimpan. Silakan coba lagi atau hubungi admin.'
          : rawMessage || 'Gagal menyimpan catatan perilaku.';
        setError(message);
        toast.error('Gagal menyimpan catatan perilaku.', { description: message });
      }
    });
  }

  const perilakuStyles: Record<PerilakuType, string> = {
    positif: 'border-emerald-200 bg-emerald-100 text-emerald-800',
    pelanggaran: 'border-rose-200 bg-rose-100 text-rose-800',
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <header className="border-b border-border pb-5 text-card-foreground">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-800"><ShieldAlert className="h-6 w-6" /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-rose-700">Catatan perilaku</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Input Catatan & Tindakan Awal</h1>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Catat kejadian dan tindak lanjut dengan cepat dari perangkat apa pun.</p>
            </div>
          </div>
          <div className="mt-4">
            <BehaviorTabs activeHref="/portal/perilaku/input" />
          </div>
        </header>

        <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Kelas</span>
                <select
                  value={selectedKelasId}
                  onChange={(event) => {
                    setSelectedKelasId(event.target.value);
                    setSelectedSiswaId('');
                    setSiswaQuery('');
                  }}
                  className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  <option value="">Pilih kelas</option>
                  {kelasList.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.nama_kelas} - {kelas.tingkat}</option>)}
                </select>
              </label>

              <div className="grid gap-2 text-sm">
                <label htmlFor="siswa-combobox">Siswa</label>
                <div className="relative">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                      id="siswa-combobox"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={isComboboxOpen}
                      aria-controls="siswa-options"
                      aria-activedescendant={isComboboxOpen && filteredSiswa[activeSiswaIndex] ? `siswa-option-${filteredSiswa[activeSiswaIndex].id}` : undefined}
                      autoComplete="off"
                      value={siswaQuery}
                      placeholder={selectedKelasId ? 'Cari nama atau NISN siswa' : 'Pilih kelas terlebih dahulu'}
                      disabled={!selectedKelasId}
                      onFocus={() => setIsComboboxOpen(true)}
                      onBlur={() => setIsComboboxOpen(false)}
                      onChange={(event) => {
                        setSelectedSiswaId('');
                        setSiswaQuery(event.target.value);
                        setActiveSiswaIndex(0);
                        setIsComboboxOpen(true);
                      }}
                      onKeyDown={handleComboboxKeyDown}
                      className="min-h-[44px] w-full rounded-2xl border border-border bg-background py-2 pl-11 pr-11 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60"
                    />
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  </div>
                  {isComboboxOpen && selectedKelasId ? (
                    <ul id="siswa-options" role="listbox" className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl">
                      {filteredSiswa.length ? filteredSiswa.map((siswa, index) => (
                        <li key={siswa.id} role="presentation">
                          <button
                            id={`siswa-option-${siswa.id}`}
                            type="button"
                            role="option"
                            aria-selected={selectedSiswaId === siswa.id}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActiveSiswaIndex(index)}
                            onClick={() => selectSiswa(siswa)}
                            className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                              activeSiswaIndex === index ? 'bg-muted' : ''
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-card-foreground">{siswa.full_name}</span>
                              <span className="block text-xs text-muted-foreground">NISN {siswa.nisn}</span>
                            </span>
                            {selectedSiswaId === siswa.id ? <Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" /> : null}
                          </button>
                        </li>
                      )) : (
                        <li className="px-3 py-4 text-center text-sm text-muted-foreground">Siswa tidak ditemukan.</li>
                      )}
                    </ul>
                  ) : null}
                </div>
                <input type="hidden" name="siswa_id" value={selectedSiswaId} />
                {selectedSiswa ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{selectedSiswa.full_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        NISN {selectedSiswa.nisn ?? 'Tidak tersedia'} · {selectedKelas?.nama_kelas}
                      </p>
                    </div>
                    {canViewSelectedProfile ? (
                      <Link
                        href={`/portal/siswa/${selectedSiswa.id}/perilaku`}
                        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      >
                        Lihat Profil 360
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setJenis('positif')} className={`min-h-[44px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${jenis === 'positif' ? perilakuStyles.positif : 'border-border bg-background'}`}>Positif</button>
              <button type="button" onClick={() => setJenis('pelanggaran')} className={`min-h-[44px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${jenis === 'pelanggaran' ? perilakuStyles.pelanggaran : 'border-border bg-background'}`}>Pelanggaran</button>
            </div>
            <input type="hidden" name="jenis" value={jenis} readOnly />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>Poin</span>
                <input name="poin" type="number" defaultValue={0} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>Tanggal</span>
                <input name="tanggal" type="date" value={tanggal} onChange={(event) => setTanggal(event.target.value)} className="min-h-[44px] rounded-2xl border border-border bg-background px-4 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              <span>Deskripsi Kejadian</span>
              <textarea name="deskripsi" rows={3} required placeholder="Ringkas, jelas, dan faktual" className="min-h-[44px] rounded-2xl border border-border bg-background px-4 py-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
            </label>

            <label className="flex min-h-[44px] items-center gap-3 rounded-2xl border border-border bg-background p-4 text-sm">
              <input type="checkbox" checked={tambahTindakLanjut} onChange={(event) => setTambahTindakLanjut(event.target.checked)} className="h-4 w-4 rounded border-border text-rose-600" />
              Tindakan langsung / eskalasi awal
            </label>

            {tambahTindakLanjut ? (
              <div className="rounded-3xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2"><Filter className="h-4 w-4 text-rose-700" /><h2 className="text-sm font-semibold">Tindakan Awal</h2></div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid content-start gap-2 text-sm">
                    <span>Ditangani Oleh</span>
                    <div className="flex min-h-[44px] items-center rounded-2xl border border-border bg-card px-4 text-foreground">
                      {actor ? `${actor.full_name} (${actor.roles.map((role) => role.replace(/_/g, ' ')).join(', ')})` : 'Memuat pengguna…'}
                    </div>
                  </div>
                  <label className="grid gap-2 text-sm">
                    <span>Tindak Lanjut</span>
                    <textarea name="tindak_lanjut" rows={3} placeholder="Contoh: Diperingatkan dan dipanggil setelah jam pelajaran" className="min-h-[44px] rounded-2xl border border-border bg-card px-4 py-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500" />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>Status Awal</span>
                    <select name="status" className="min-h-[44px] rounded-2xl border border-border bg-card px-4 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
                      <option value="ditangani_di_tempat">Ditangani di Tempat</option>
                      <option value="diteruskan">Diteruskan ke Wali Kelas/BK</option>
                    </select>
                  </label>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={isSubmitting || !selectedSiswaId} className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Catatan Perilaku
              </button>
              <button type="button" onClick={() => void refreshClasses()} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-semibold">
                <RefreshCw className="h-4 w-4" /> Muat Ulang
              </button>
            </div>
            {error ? <p role="alert" className="text-sm font-medium text-rose-700">{error}</p> : null}
          </form>
        </section>
      </div>
    </main>
  );
}
