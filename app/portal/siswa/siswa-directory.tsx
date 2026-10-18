'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, UserRound, Users } from 'lucide-react';

type DirectoryClass = {
  id: string;
  nama_kelas: string;
  tingkat: number;
};

type DirectoryStudent = {
  id: string;
  full_name: string;
  nisn: string | null;
  kelas: DirectoryClass;
};

type SiswaDirectoryProps = {
  classes: DirectoryClass[];
  students: DirectoryStudent[];
  hasGlobalScope: boolean;
};

export default function SiswaDirectory({
  classes,
  students,
  hasGlobalScope,
}: SiswaDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const showClassFilter = hasGlobalScope || classes.length > 1;
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('id-ID');

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          student.full_name.toLocaleLowerCase('id-ID').includes(normalizedSearch) ||
          (student.nisn ?? '').toLocaleLowerCase('id-ID').includes(normalizedSearch);
        const matchesClass =
          selectedClassId.length === 0 || student.kelas.id === selectedClassId;

        return matchesSearch && matchesClass;
      }),
    [normalizedSearch, selectedClassId, students],
  );

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Direktori Siswa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cari siswa berdasarkan nama atau NISN, lalu buka Profil 360.
          </p>
        </header>

        <section
          aria-label="Pencarian dan filter siswa"
          className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2"
        >
          <label className="relative block">
            <span className="sr-only">Cari nama siswa atau NISN</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama siswa atau NISN"
              className="min-h-[44px] w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          {showClassFilter ? (
            <label className="block">
              <span className="sr-only">Filter kelas</span>
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className="min-h-[44px] w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Semua kelas</option>
                {classes.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama_kelas} · Tingkat {kelas.tingkat}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </section>

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Daftar Siswa</h2>
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {filteredStudents.length} siswa
          </p>
        </div>

        {filteredStudents.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filteredStudents.map((student) => (
              <li key={student.id}>
                <article className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-800">
                      <UserRound aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold">{student.full_name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        NISN {student.nisn ?? 'Tidak tersedia'}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users aria-hidden="true" className="h-4 w-4" />
                        {student.kelas.nama_kelas}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/portal/siswa/${student.id}/perilaku`}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Lihat Profil 360
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <section className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
            <Users aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">
              {students.length === 0 ? 'Belum ada siswa dalam cakupan Anda.' : 'Siswa tidak ditemukan.'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {students.length === 0
                ? 'Data siswa akan muncul setelah tersedia pada kelas yang dapat Anda akses.'
                : 'Coba ubah kata pencarian atau filter kelas.'}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
