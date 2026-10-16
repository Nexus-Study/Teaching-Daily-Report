'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldAlert, Star, TrendingDown, UserRound } from 'lucide-react';
import { useParams } from 'next/navigation';

import type { ProfilPerilakuSiswa } from '../../../perilaku/actions';
import { getProfilPerilakuSiswa } from '../../../perilaku/actions';

function formatWIT(dateString: string): string {
  return `${new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jayapura',
  }).format(new Date(dateString))} WIT`;
}

export default function SiswaPerilakuProfilePage() {
  const params = useParams<{ id: string }>();
  const studentId = params.id;
  const [profile, setProfile] = useState<ProfilPerilakuSiswa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        setError(null);
        setProfile(null);
        setIsLoading(true);
        const result = await getProfilPerilakuSiswa(studentId);
        if (isActive) {
          setProfile(result);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'Gagal memuat profil perilaku siswa.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [studentId]);

  return (
    <main className="min-h-screen bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Link href="/portal/perilaku/rekap" className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Rekap Perilaku
        </Link>

        {error ? <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p> : null}
        {isLoading ? <p className="text-sm text-muted-foreground">Memuat profil perilaku siswa…</p> : null}
        {!isLoading && !error && !profile ? (
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
            <UserRound className="mx-auto h-8 w-8 text-muted-foreground" />
            <h1 className="mt-3 text-xl font-semibold">Siswa tidak ditemukan</h1>
            <p className="mt-1 text-sm text-muted-foreground">Profil siswa ini tidak tersedia atau tidak dapat diakses.</p>
          </section>
        ) : null}

        {profile ? (
          <>
            <header className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-800"><UserRound className="h-6 w-6" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-700">Profil 360 Perilaku Siswa</p>
                  <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight">{profile.siswa.full_name}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">NISN {profile.siswa.nisn ?? 'Tidak tersedia'} • {profile.kelas.nama_kelas} - {profile.kelas.tingkat}</p>
                </div>
              </div>
            </header>

            <section aria-label="Statistik poin perilaku" className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                <div className="flex items-center gap-2 text-sm font-semibold"><Star className="h-4 w-4" /> Poin Positif</div>
                <p className="mt-2 text-3xl font-bold">{profile.rekap.poinPositif}</p>
                <p className="mt-1 text-xs text-emerald-800">{profile.rekap.jumlahCatatanPositif} catatan positif</p>
              </article>
              <article className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
                <div className="flex items-center gap-2 text-sm font-semibold"><TrendingDown className="h-4 w-4" /> Poin Pelanggaran</div>
                <p className="mt-2 text-3xl font-bold">{profile.rekap.poinPelanggaran}</p>
                <p className="mt-1 text-xs text-rose-800">{profile.rekap.jumlahCatatanPelanggaran} catatan pelanggaran</p>
              </article>
            </section>

            <section className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <div className="mb-4 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-rose-700" /><h2 className="text-base font-semibold">Riwayat Perilaku Lengkap</h2></div>
              {profile.timeline.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada riwayat perilaku untuk siswa ini.</p> : (
                <div className="space-y-3">
                  {profile.timeline.map((record) => (
                    <article key={record.id} className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">{record.tanggal} • Poin {record.poin}</p>
                          <p className="mt-1 text-sm font-semibold">{record.jenis === 'positif' ? 'Catatan Positif' : 'Pelanggaran'}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${record.jenis === 'positif' ? 'border-emerald-200 bg-emerald-100 text-emerald-800' : 'border-rose-200 bg-rose-100 text-rose-800'}`}>
                          {record.jenis === 'positif' ? 'Positif' : 'Pelanggaran'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6">{record.deskripsi}</p>
                      {record.penanganan_perilaku?.length ? (
                        <ol className="mt-4 space-y-3 border-l-2 border-indigo-100 pl-4">
                          {record.penanganan_perilaku.map((handling) => (
                            <li key={handling.id} className="relative">
                              <span className="absolute -left-[calc(1rem+5px)] top-1 h-2 w-2 rounded-full bg-indigo-500" />
                              <p className="text-xs font-medium text-muted-foreground">{formatWIT(handling.created_at)}</p>
                              <p className="mt-1 text-sm">{handling.tindak_lanjut}</p>
                              <p className="mt-1 text-xs font-semibold text-indigo-700">{handling.status.replace(/_/g, ' ')}</p>
                            </li>
                          ))}
                        </ol>
                      ) : <p className="mt-3 text-xs text-muted-foreground">Belum ada tindak lanjut.</p>}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
