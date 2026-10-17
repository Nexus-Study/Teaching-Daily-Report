'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '../../../lib/supabase/server';
import type { CatatanPerilaku, Kelas, PenangananPerilaku, PenangananStatus, PerilakuType, Profile, Siswa, UserRole } from '../../../types/database';

type KelasWithSiswa = Kelas & {
  siswa: Siswa[];
};

export type BehaviorActor = Pick<Profile, 'id' | 'full_name' | 'roles'>;
export type BehaviorHandler = Pick<Profile, 'id' | 'full_name' | 'roles'>;

type CatatanContext = {
  reporterId: string;
  siswaId: string;
  waliKelasId: string | null;
};

const TRIAGE_ROLES: UserRole[] = ['admin', 'guru_bk', 'waka_kesiswaan'];
const PROFILE_GLOBAL_SCOPE_ROLES: UserRole[] = [
  'admin',
  'guru_bk',
  'waka_kurikulum',
  'waka_kesiswaan',
  'kamad',
];
const REKAP_GLOBAL_SCOPE_ROLES: UserRole[] = [
  'admin',
  'guru_bk',
  'waka_kesiswaan',
  'kamad',
];
const REKAP_REPORTER_SCOPE_ROLES: UserRole[] = ['guru_mapel', 'guru_tahfidz'];
const REKAP_ROLES: UserRole[] = [
  ...REKAP_GLOBAL_SCOPE_ROLES,
  'wali_kelas',
  ...REKAP_REPORTER_SCOPE_ROLES,
];
const BEHAVIOR_INPUT_ROLES: UserRole[] = [
  'admin',
  'guru_bk',
  'wali_kelas',
  'waka_kesiswaan',
  'guru_mapel',
  'guru_tahfidz',
];

export type ProfileAccessContext = {
  roles: UserRole[];
  canViewAllStudents: boolean;
  accessibleClassIds: string[];
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

async function getAuthenticatedActor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, roles')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { supabase, actor: profile as BehaviorActor };
}

async function getCatatanContext(catatanId: string): Promise<CatatanContext> {
  const supabase = await createClient();
  const { data: catatan, error: catatanError } = await supabase
    .from('catatan_perilaku')
    .select('id, reporter_id, siswa_id')
    .eq('id', catatanId)
    .single();
  const caseData = catatan as unknown as { reporter_id: string; siswa_id: string } | null;

  if (catatanError || !caseData) {
    throw new Error(catatanError?.message ?? 'Catatan perilaku tidak ditemukan.');
  }

  const { data: siswa, error: siswaError } = await supabase
    .from('siswa')
    .select('kelas_id')
    .eq('id', caseData.siswa_id)
    .single();
  const studentData = siswa as unknown as { kelas_id: string } | null;

  if (siswaError || !studentData) {
    throw new Error(siswaError?.message ?? 'Data siswa tidak ditemukan.');
  }

  const { data: kelas, error: kelasError } = await supabase
    .from('kelas')
    .select('wali_kelas_id')
    .eq('id', studentData.kelas_id)
    .single();
  const classData = kelas as unknown as { wali_kelas_id: string | null } | null;

  if (kelasError || !classData) {
    throw new Error(kelasError?.message ?? 'Data kelas siswa tidak ditemukan.');
  }

  return {
    reporterId: caseData.reporter_id,
    siswaId: caseData.siswa_id,
    waliKelasId: classData.wali_kelas_id,
  };
}

function isTriageActor(actor: BehaviorActor, context: CatatanContext): boolean {
  return TRIAGE_ROLES.some((role) => actor.roles.includes(role))
    || (actor.roles.includes('wali_kelas') && context.waliKelasId === actor.id);
}

function isReopenActor(actor: BehaviorActor, context: CatatanContext): boolean {
  return actor.roles.some((role) => role === 'admin' || role === 'guru_bk' || role === 'waka_kesiswaan')
    || (actor.roles.includes('wali_kelas') && context.waliKelasId === actor.id);
}

export type CatatanPerilakuWithRelations = CatatanPerilaku & {
  siswa?: Siswa;
  reporter?: Pick<Profile, 'id' | 'full_name'>;
  penanganan_perilaku?: (PenangananPerilaku & { handler?: BehaviorHandler })[];
  isWaliKelas?: boolean;
  latest_activity_at?: string;
};

export type RekapPerilakuSummaryStats = {
  perluTindakan: number;
  proses: number;
  selesai: number;
};

export type RekapPerilakuResult = {
  records: CatatanPerilakuWithRelations[];
  summaryStats: RekapPerilakuSummaryStats;
};

export type ProfilPerilakuSiswa = {
  siswa: Siswa;
  kelas: Pick<Kelas, 'id' | 'nama_kelas' | 'tingkat'>;
  rekap: {
    poinPositif: number;
    poinPelanggaran: number;
    jumlahCatatanPositif: number;
    jumlahCatatanPelanggaran: number;
  };
  timeline: CatatanPerilakuWithRelations[];
};

export async function getPerilakuActor(): Promise<BehaviorActor | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, roles')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BehaviorActor;
}

export async function getProfileAccessContext(): Promise<ProfileAccessContext> {
  const { supabase, actor } = await getAuthenticatedActor();
  const canViewAllStudents = actor.roles.some((role) => PROFILE_GLOBAL_SCOPE_ROLES.includes(role));

  if (canViewAllStudents) {
    return { roles: actor.roles, canViewAllStudents, accessibleClassIds: [] };
  }

  const [homeroomResult, teachingResult] = await Promise.all([
    actor.roles.includes('wali_kelas')
      ? supabase.from('kelas').select('id').eq('wali_kelas_id', actor.id)
      : Promise.resolve({ data: [] as { id: string }[], error: null }),
    actor.roles.includes('guru_mapel')
      ? supabase.from('jadwal_guru').select('kelas_id').eq('teacher_id', actor.id)
      : Promise.resolve({ data: [] as { kelas_id: string }[], error: null }),
  ]);

  if (homeroomResult.error) {
    throw new Error(homeroomResult.error.message);
  }

  if (teachingResult.error) {
    throw new Error(teachingResult.error.message);
  }

  return {
    roles: actor.roles,
    canViewAllStudents,
    accessibleClassIds: [
      ...new Set([
        ...(homeroomResult.data ?? []).map(({ id }) => id),
        ...(teachingResult.data ?? []).map(({ kelas_id }) => kelas_id),
      ]),
    ],
  };
}

export async function getKelasAndSiswaList(): Promise<KelasWithSiswa[]> {
  const { supabase, actor } = await getAuthenticatedActor();
  if (!actor.roles.some((role) => BEHAVIOR_INPUT_ROLES.includes(role))) {
    throw new Error('Akses input perilaku tidak diizinkan.');
  }

  const [kelasResult, siswaResult] = await Promise.all([
    supabase.from('kelas').select('id, nama_kelas, tingkat, wali_kelas_id, created_at').order('tingkat', { ascending: true }).order('nama_kelas', { ascending: true }),
    supabase.from('siswa').select('id, full_name, nisn, kelas_id, created_at').order('full_name', { ascending: true }),
  ]);

  if (kelasResult.error) {
    throw new Error(kelasResult.error.message);
  }

  if (siswaResult.error) {
    throw new Error(siswaResult.error.message);
  }

  const siswaList = (siswaResult.data ?? []) as Siswa[];

  const siswaByKelas = siswaList.reduce<Record<string, Siswa[]>>((accumulator, siswa) => {
    if (!accumulator[siswa.kelas_id]) {
      accumulator[siswa.kelas_id] = [];
    }

    accumulator[siswa.kelas_id].push(siswa);
    return accumulator;
  }, {});

  const kelasList = (kelasResult.data ?? []) as any[];

  return kelasList.map((kelas) => ({
    ...kelas,
    siswa: siswaByKelas[kelas.id] ?? [],
  }));
}

export async function submitCatatanPerilaku(formData: FormData) {
  const { supabase, actor } = await getAuthenticatedActor();
  if (!actor.roles.some((role) => BEHAVIOR_INPUT_ROLES.includes(role))) {
    throw new Error('Akses input perilaku tidak diizinkan.');
  }

  const siswaId = String(formData.get('siswa_id') ?? '').trim();
  const tanggal = String(formData.get('tanggal') ?? '').trim() || getWITDateString();
  const poin = Number(formData.get('poin') ?? 0);
  const jenis = String(formData.get('jenis') ?? 'pelanggaran') as PerilakuType;
  const deskripsi = String(formData.get('deskripsi') ?? '').trim();
  const tindakLanjut = String(formData.get('tindak_lanjut') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim() as PenangananStatus;

  if (!siswaId || !deskripsi) {
    throw new Error('Lengkapi siswa dan deskripsi kejadian.');
  }

  if (tindakLanjut && status && status !== 'ditangani_di_tempat' && status !== 'diteruskan') {
    throw new Error('Tindakan awal hanya dapat berstatus Ditangani di Tempat atau Diteruskan.');
  }

  const { error } = await (supabase.rpc as any)('submit_catatan_perilaku', {
    p_reporter_id: actor.id,
    p_siswa_id: siswaId,
    p_tanggal: tanggal || null,
    p_poin: poin,
    p_jenis: jenis,
    p_deskripsi: deskripsi,
    p_tindak_lanjut: tindakLanjut || null,
    p_status: tindakLanjut ? status || 'ditangani_di_tempat' : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/perilaku/');
  revalidatePath('/portal/perilaku/input');
  revalidatePath('/portal/perilaku/rekap');
  revalidatePath('/portal/siswa/[id]/perilaku', 'page');

  return { success: true };
}

export async function submitPenangananEskalasi(catatanId: string, tindakLanjut: string, status: PenangananStatus) {
  if (!['ditangani_di_tempat', 'diteruskan', 'proses', 'selesai'].includes(status)) {
    throw new Error('Status penanganan tidak valid.');
  }

  const { supabase, actor } = await getAuthenticatedActor();
  if (!actor.roles.some((role) => BEHAVIOR_INPUT_ROLES.includes(role))) {
    throw new Error('Akses penanganan perilaku tidak diizinkan.');
  }
  const context = await getCatatanContext(catatanId);
  const canManageTriage = isTriageActor(actor, context);

  if (!canManageTriage && (context.reporterId !== actor.id || status !== 'ditangani_di_tempat')) {
    throw new Error('Anda tidak berwenang mengubah status penanganan kasus ini.');
  }

  const cleanedFollowUp = tindakLanjut.trim();
  if (!cleanedFollowUp) {
    throw new Error('Tindak lanjut wajib diisi.');
  }

  const { error } = await (supabase.rpc as any)('submit_penanganan_eskalasi', {
    p_catatan_id: catatanId,
    p_tindak_lanjut: cleanedFollowUp,
    p_status: status,
    p_tanggal: getWITDateString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/perilaku/');
  revalidatePath('/portal/perilaku/rekap');
  revalidatePath(`/portal/siswa/${context.siswaId}/perilaku`);

  return { success: true };
}

export async function reopenKasusPerilaku(catatanId: string, alasan: string, targetStatus: PenangananStatus) {
  const cleanedReason = alasan.trim();
  if (!cleanedReason) {
    throw new Error('Alasan pembukaan kembali wajib diisi.');
  }

  if (targetStatus !== 'proses' && targetStatus !== 'diteruskan') {
    throw new Error('Status pembukaan kembali harus Proses atau Diteruskan.');
  }

  const { supabase, actor } = await getAuthenticatedActor();
  const context = await getCatatanContext(catatanId);
  if (!isReopenActor(actor, context)) {
    throw new Error('Anda tidak berwenang membuka kembali kasus ini.');
  }

  const { error } = await (supabase.rpc as any)('reopen_kasus_perilaku', {
    p_catatan_id: catatanId,
    p_alasan: cleanedReason,
    p_target_status: targetStatus,
    p_tanggal: getWITDateString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/perilaku/');
  revalidatePath('/portal/perilaku/rekap');
  revalidatePath(`/portal/siswa/${context.siswaId}/perilaku`);

  return { success: true };
}

export async function updateDeskripsiPerilaku(id: string, isCatatan: boolean, textBaru: string) {
  if (!id.trim() || !textBaru.trim()) {
    throw new Error('Deskripsi wajib diisi.');
  }

  const { supabase, actor } = await getAuthenticatedActor();
  if (!actor.roles.some((role) => BEHAVIOR_INPUT_ROLES.includes(role))) {
    throw new Error('Akses perubahan perilaku tidak diizinkan.');
  }

  const { error } = await (supabase.rpc as any)('update_perilaku_description', {
    p_id: id,
    p_is_catatan: isCatatan,
    p_text_baru: textBaru.trim(),
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/perilaku/');
  revalidatePath('/portal/perilaku/rekap');
  revalidatePath('/portal/siswa/[id]/perilaku', 'page');
  return { success: true };
}

export async function deleteCatatanPerilaku(catatanId: string): Promise<void> {
  if (!catatanId.trim()) {
    throw new Error('ID catatan perilaku tidak valid.');
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new Error(authError.message);
  }
  if (!user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();
  if (profileError) {
    throw new Error(profileError.message);
  }

  const roles = (profile as unknown as Pick<Profile, 'roles'>).roles;
  const isBk = roles.includes('guru_bk');
  const isAdmin = roles.includes('admin');
  if (!isBk && !isAdmin) {
    throw new Error('Otorisasi ditolak');
  }

  if (!isBk) {
    const { data: catatan, error: catatanError } = await supabase
      .from('catatan_perilaku')
      .select('reporter_id')
      .eq('id', catatanId)
      .maybeSingle();
    if (catatanError) {
      throw new Error(catatanError.message);
    }
    const record = catatan as unknown as Pick<CatatanPerilaku, 'reporter_id'> | null;
    if (!record || record.reporter_id !== user.id) {
      throw new Error('Otorisasi ditolak');
    }
  }

  const { error: deleteError } = await supabase
    .from('catatan_perilaku')
    .delete()
    .eq('id', catatanId)
    .select('id')
    .single();
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath('/portal/perilaku/rekap');
}

export async function getRekapPerilaku(
  limit = 10,
  cursor?: { activityAt: string; id: string },
): Promise<RekapPerilakuResult> {
  try {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RangeError('Batas rekap harus berupa bilangan bulat antara 1 dan 100.');
    }
    if (cursor && (Number.isNaN(Date.parse(cursor.activityAt)) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor.id))) {
      throw new Error('Cursor aktivitas rekap tidak valid.');
    }

    const { supabase, actor } = await getAuthenticatedActor();
    if (!actor.roles.some((role) => REKAP_ROLES.includes(role))) {
      throw new Error('Akses rekap perilaku tidak diizinkan.');
    }

    const selection = 'id, siswa_id, reporter_id, tanggal, poin, jenis, deskripsi, created_at, siswa: siswa_id (id, full_name, nisn, kelas_id, created_at), penanganan_perilaku (id, catatan_id, handler_id, tanggal, tindak_lanjut, status, created_at, updated_at)';
    const allData: unknown[] = [];
    if (actor.roles.some((role) => REKAP_GLOBAL_SCOPE_ROLES.includes(role))) {
      const { data, error } = await supabase
        .from('catatan_perilaku')
        .select(selection)
        .order('updated_at', {
          referencedTable: 'penanganan_perilaku',
          ascending: false,
          nullsFirst: false,
        })
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      allData.push(...(data ?? []));
    } else {
      if (actor.roles.includes('wali_kelas')) {
        const { data: classes, error: classError } = await supabase
          .from('kelas')
          .select('id')
          .eq('wali_kelas_id', actor.id);

        if (classError) {
          throw new Error(classError.message);
        }
        const classIds = (classes ?? []).map(({ id }) => id);

        if (classIds.length) {
          const { data, error } = await supabase
            .from('catatan_perilaku')
            .select(selection)
            .in('siswa.kelas_id', classIds)
            .order('updated_at', {
              referencedTable: 'penanganan_perilaku',
              ascending: false,
              nullsFirst: false,
            })
            .order('created_at', { ascending: false });

          if (error) {
            throw new Error(error.message);
          }
          allData.push(...(data ?? []));
        }
      }

      if (actor.roles.some((role) => REKAP_REPORTER_SCOPE_ROLES.includes(role))) {
        const { data, error } = await supabase
          .from('catatan_perilaku')
          .select(selection)
          .eq('reporter_id', actor.id)
          .order('updated_at', {
            referencedTable: 'penanganan_perilaku',
            ascending: false,
            nullsFirst: false,
          })
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }
        allData.push(...(data ?? []));
      }
    }

    const summaryResult = await supabase.rpc('get_catatan_perilaku_summary');
    const summaryResponse = summaryResult as unknown as {
      data: Array<{ perlu_tindakan: number; proses: number; selesai: number }> | null;
      error: { message: string } | null;
    };
    if (summaryResponse.error) {
      throw new Error(summaryResponse.error.message);
    }
    const summaryRow = summaryResponse.data?.[0];
    if (!summaryRow) {
      throw new Error('Gagal memuat ringkasan rekap perilaku.');
    }
    const summaryStats: RekapPerilakuSummaryStats = {
      perluTindakan: Number(summaryRow.perlu_tindakan),
      proses: Number(summaryRow.proses),
      selesai: Number(summaryRow.selesai),
    };

    const deduplicatedData = [...new Map(
      allData.map((item) => {
        const record = item as CatatanPerilakuWithRelations;
        return [record.id, record] as const;
      }),
    ).values()];
    const allRecords = deduplicatedData.map((item) => {
      const latestActivity = Math.max(
        Date.parse(item.created_at),
        ...(item.penanganan_perilaku ?? []).flatMap((handling) => [
          Date.parse(handling.created_at),
          Date.parse(handling.updated_at),
        ]),
      );
      return { ...item, latest_activity_at: new Date(latestActivity).toISOString() };
    });
    const orderedRecords = allRecords
      .sort((first, second) => (
        Date.parse(second.latest_activity_at ?? second.created_at)
        - Date.parse(first.latest_activity_at ?? first.created_at)
        || second.id.localeCompare(first.id)
      ));
    const result = orderedRecords
      .filter((item) => !cursor || (
        Date.parse(item.latest_activity_at ?? item.created_at) < Date.parse(cursor.activityAt)
        || (
          Date.parse(item.latest_activity_at ?? item.created_at) === Date.parse(cursor.activityAt)
          && item.id < cursor.id
        )
      ))
      .slice(0, limit);
    if (!result.length) {
      return { records: result, summaryStats };
    }

    const catatanIds = result.map((item) => item.id);
    let handlerRows: BehaviorHandler[] = [];
    if (catatanIds.length > 0) {
      const { data: rows, error: handlerError } = await (supabase.rpc as any)(
        'get_perilaku_handler_profiles',
        { p_catatan_ids: catatanIds },
      );

      if (handlerError) {
        throw new Error(handlerError.message);
      }

      handlerRows = (rows ?? []) as BehaviorHandler[];
    }
    const handlerById = new Map<string, BehaviorHandler>(
      handlerRows.map((handler) => [handler.id, handler]),
    );

    const siswaClassIds = [...new Set(result.map((item) => item.siswa?.kelas_id).filter((id): id is string => Boolean(id)))];
    const { data: classRows, error: classError } = siswaClassIds.length
      ? await supabase.from('kelas').select('id, wali_kelas_id').in('id', siswaClassIds)
      : { data: [], error: null };
    if (classError) {
      throw new Error(classError.message);
    }
    const homeroomRows = classRows as unknown as { id: string; wali_kelas_id: string | null }[] | null;
    const homeroomByClassId = new Map(
      (homeroomRows ?? []).map((row) => [row.id, row.wali_kelas_id]),
    );

    const records = result.map((item) => ({
      ...item,
      reporter: handlerById.get(item.reporter_id),
      isWaliKelas: item.siswa ? homeroomByClassId.get(item.siswa.kelas_id) === actor.id : false,
      penanganan_perilaku: (item.penanganan_perilaku ?? []).map((handling) => ({
        ...handling,
        handler: handlerById.get(handling.handler_id),
      })).sort((a, b) => {
        const activityA = Math.max(Date.parse(a.created_at), Date.parse(a.updated_at));
        const activityB = Math.max(Date.parse(b.created_at), Date.parse(b.updated_at));
        return activityB - activityA || Date.parse(b.created_at) - Date.parse(a.created_at);
      }),
    }));
    return { records, summaryStats };
  } catch (error) {
    console.error('Gagal memuat rekap perilaku.', error);
    throw error;
  }
}

export async function getProfilPerilakuSiswa(siswaId: string): Promise<ProfilPerilakuSiswa> {
  if (!siswaId.trim()) {
    throw new Error('ID siswa tidak valid.');
  }

  const { supabase, actor } = await getAuthenticatedActor();
  const { data: studentRow, error: studentError } = await supabase
    .from('siswa')
    .select('id, full_name, nisn, kelas_id, created_at')
    .eq('id', siswaId)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }
  const student = studentRow as unknown as Siswa | null;
  if (!student) {
    throw new Error('Siswa tidak ditemukan atau tidak dapat diakses.');
  }

  const { data: classRow, error: classError } = await supabase
    .from('kelas')
    .select('id, nama_kelas, tingkat, wali_kelas_id')
    .eq('id', student.kelas_id)
    .maybeSingle();

  if (classError) {
    throw new Error(classError.message);
  }
  const studentClass = classRow as unknown as Pick<Kelas, 'id' | 'nama_kelas' | 'tingkat' | 'wali_kelas_id'> | null;
  if (!studentClass) {
    throw new Error('Kelas siswa tidak ditemukan atau tidak dapat diakses.');
  }

  const canViewAllStudents = actor.roles.some((role) => PROFILE_GLOBAL_SCOPE_ROLES.includes(role));
  let canViewClass = actor.roles.includes('wali_kelas') && studentClass.wali_kelas_id === actor.id;

  if (!canViewAllStudents && !canViewClass && actor.roles.includes('guru_mapel')) {
    const { data: teachingClass, error: scheduleError } = await supabase
      .from('jadwal_guru')
      .select('kelas_id')
      .eq('teacher_id', actor.id)
      .eq('kelas_id', studentClass.id)
      .limit(1)
      .maybeSingle();

    if (scheduleError) {
      throw new Error(scheduleError.message);
    }
    canViewClass = Boolean(teachingClass);
  }

  if (!canViewAllStudents && !canViewClass) {
    throw new Error('Anda tidak memiliki akses untuk melihat profil perilaku siswa ini.');
  }

  const { data: records, error: recordsError } = await supabase
    .from('catatan_perilaku')
    .select('id, siswa_id, reporter_id, tanggal, poin, jenis, deskripsi, created_at, penanganan_perilaku (id, catatan_id, handler_id, tanggal, tindak_lanjut, status, created_at, updated_at)')
    .eq('siswa_id', student.id)
    .order('created_at', { ascending: false });

  if (recordsError) {
    throw new Error(recordsError.message);
  }

  const timeline = (records ?? []) as CatatanPerilakuWithRelations[];
  const catatanIds = timeline.map((record) => record.id);
  let handlerById = new Map<string, BehaviorHandler>();

  if (catatanIds.length > 0) {
    const { data: handlers, error: handlerError } = await (supabase.rpc as any)(
      'get_perilaku_handler_profiles',
      { p_catatan_ids: catatanIds },
    );

    if (handlerError) {
      throw new Error(handlerError.message);
    }
    handlerById = new Map<string, BehaviorHandler>(
      ((handlers ?? []) as BehaviorHandler[]).map((handler) => [handler.id, handler]),
    );
  }

  const enrichedTimeline = timeline.map((record) => ({
    ...record,
    penanganan_perilaku: (record.penanganan_perilaku ?? [])
      .map((handling) => ({
        ...handling,
        handler: handlerById.get(handling.handler_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  }));

  return {
    siswa: student,
    kelas: {
      id: studentClass.id,
      nama_kelas: studentClass.nama_kelas,
      tingkat: studentClass.tingkat,
    },
    rekap: {
      poinPositif: enrichedTimeline
        .filter((record) => record.jenis === 'positif')
        .reduce((total, record) => total + record.poin, 0),
      poinPelanggaran: enrichedTimeline
        .filter((record) => record.jenis === 'pelanggaran')
        .reduce((total, record) => total + Math.abs(record.poin), 0),
      jumlahCatatanPositif: enrichedTimeline.filter((record) => record.jenis === 'positif').length,
      jumlahCatatanPelanggaran: enrichedTimeline.filter((record) => record.jenis === 'pelanggaran').length,
    },
    timeline: enrichedTimeline,
  };
}