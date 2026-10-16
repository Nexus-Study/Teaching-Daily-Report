import { redirect } from 'next/navigation';

import SiswaDirectory from '@/app/portal/siswa/siswa-directory';
import { createClient } from '@/lib/supabase/server';
import type { Kelas, Profile, Siswa, UserRole } from '@/types/database';

type DirectoryClass = Pick<Kelas, 'id' | 'nama_kelas' | 'tingkat'>;
type DirectoryStudent = Pick<Siswa, 'id' | 'full_name' | 'nisn'> & {
  kelas: DirectoryClass;
};

const globalScopeRoles: UserRole[] = [
  'admin',
  'guru_bk',
  'waka_kurikulum',
  'waka_kesiswaan',
  'kamad',
];
const directoryRoles: UserRole[] = [
  ...globalScopeRoles,
  'wali_kelas',
  'guru_mapel',
];

export default async function SiswaDirectoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, roles')
    .eq('id', user.id)
    .single<Pick<Profile, 'id' | 'roles'>>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile || !profile.roles.some((role) => directoryRoles.includes(role))) {
    redirect('/portal');
  }

  const hasGlobalScope = profile.roles.some((role) => globalScopeRoles.includes(role));
  let classesQuery = supabase
    .from('kelas')
    .select('id, nama_kelas, tingkat')
    .order('tingkat', { ascending: true })
    .order('nama_kelas', { ascending: true });

  if (!hasGlobalScope) {
    const [homeroomResult, taughtResult] = await Promise.all([
      profile.roles.includes('wali_kelas')
        ? supabase.from('kelas').select('id').eq('wali_kelas_id', profile.id)
        : Promise.resolve({ data: [] as { id: string }[], error: null }),
      profile.roles.includes('guru_mapel')
        ? supabase
            .from('jurnal_mengajar')
            .select('kelas_id')
            .eq('teacher_id', profile.id)
        : Promise.resolve({ data: [] as { kelas_id: string }[], error: null }),
    ]);

    if (homeroomResult.error) {
      throw new Error(homeroomResult.error.message);
    }

    if (taughtResult.error) {
      throw new Error(taughtResult.error.message);
    }

    const scopedClassIds = [
      ...new Set([
        ...(homeroomResult.data ?? []).map(({ id }) => id),
        ...(taughtResult.data ?? []).map(({ kelas_id }) => kelas_id),
      ]),
    ];

    if (scopedClassIds.length === 0) {
      return <SiswaDirectory classes={[]} students={[]} hasGlobalScope={false} />;
    }

    classesQuery = classesQuery.in('id', scopedClassIds);
  }

  const { data: classRows, error: classesError } = await classesQuery;

  if (classesError) {
    throw new Error(classesError.message);
  }

  const classes: DirectoryClass[] = classRows ?? [];
  const classIds = classes.map(({ id }) => id);

  if (classIds.length === 0) {
    return (
      <SiswaDirectory
        classes={classes}
        students={[]}
        hasGlobalScope={hasGlobalScope}
      />
    );
  }

  const studentsQuery = supabase
    .from('siswa')
    .select('id, full_name, nisn, kelas_id')
    .in('kelas_id', classIds)
    .order('full_name', { ascending: true })
    .overrideTypes<Array<Pick<Siswa, 'id' | 'full_name' | 'nisn' | 'kelas_id'>>>();

  const { data: studentRows, error: studentsError } = await studentsQuery;

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  const classById = new Map(classes.map((kelas) => [kelas.id, kelas]));
  const students: DirectoryStudent[] = (studentRows ?? []).flatMap((student) => {
    const kelas = classById.get(student.kelas_id);
    return kelas ? [{ id: student.id, full_name: student.full_name, nisn: student.nisn, kelas }] : [];
  });

  return (
    <SiswaDirectory
      classes={classes}
      students={students}
      hasGlobalScope={hasGlobalScope}
    />
  );
}
