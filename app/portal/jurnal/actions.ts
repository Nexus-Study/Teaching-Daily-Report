'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '../../../lib/supabase/server';
import type { Database, HariName, JadwalGuru, JurnalMengajar, Kelas, MataPelajaran, PresensiStatus, Siswa } from '../../../types/database';

export type PresensiInput = {
  siswa_id: string;
  status: PresensiStatus;
  catatan?: string | null;
};

type PresensiPayload = PresensiInput;

type JurnalActionResult = { success: true } | { success: false; error: string };

const presensiStatuses: PresensiStatus[] = ['hadir', 'izin', 'sakit', 'alpa'];

export async function getKelasList(): Promise<Kelas[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('kelas').select('*').order('tingkat', { ascending: true }).order('nama_kelas', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getAllMasterData(): Promise<{ kelasList: Kelas[]; mapelList: MataPelajaran[] }> {
  const supabase = await createClient();
  const [kelasResult, mapelResult] = await Promise.all([
    supabase.from('kelas').select('*').order('tingkat', { ascending: true }).order('nama_kelas', { ascending: true }),
    supabase.from('mata_pelajaran').select('*').order('nama_mapel', { ascending: true }),
  ]);

  if (kelasResult.error) {
    throw new Error(kelasResult.error.message);
  }
  if (mapelResult.error) {
    throw new Error(mapelResult.error.message);
  }

  return { kelasList: kelasResult.data ?? [], mapelList: mapelResult.data ?? [] };
}

export async function getCurrentTeacherId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Pengguna tidak terautentikasi.');
  }

  return user.id;
}

export async function getSiswaByKelas(kelasId: string): Promise<Siswa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('siswa').select('*').eq('kelas_id', kelasId).order('full_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getTodaySchedules(hari: HariName): Promise<JadwalGuru[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const { data, error } = await supabase
    .from('jadwal_guru')
    .select('*, mata_pelajaran(*), kelas(*)')
    .eq('teacher_id', user.id)
    .eq('hari', hari)
    .order('jam_mulai', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function insertJadwalRutin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  data: { kelas_id: string; mapel_id: string; hari: HariName; jam_mulai: number; jam_selesai: number },
) {
  const jadwalRecord = { ...data, teacher_id: teacherId } satisfies Database['public']['Tables']['jadwal_guru']['Insert'];
  const { error } = await (supabase.from('jadwal_guru') as any).insert(jadwalRecord);

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveJadwalRutin(data: {
  kelas_id: string;
  mapel_id: string;
  hari: HariName;
  jam_mulai: number;
  jam_selesai: number;
}) {
  if (
    !data.kelas_id
    || !data.mapel_id
    || !Number.isInteger(data.jam_mulai)
    || !Number.isInteger(data.jam_selesai)
    || data.jam_mulai < 1
    || data.jam_mulai >= data.jam_selesai
  ) {
    throw new Error('Data jadwal rutin tidak valid.');
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  await insertJadwalRutin(supabase, user.id, data);
  revalidatePath('/portal/profil');
  revalidatePath('/portal/jurnal/');

  return { success: true };
}

export async function getJadwalGuruByTeacher(): Promise<JadwalGuru[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const { data, error } = await (supabase.from('jadwal_guru') as any)
    .select('*, mata_pelajaran (*), kelas (*)')
    .eq('teacher_id', user.id)
    .order('hari', { ascending: true })
    .order('jam_mulai', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as JadwalGuru[];
}

export async function submitJurnalAndPresensi(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const kelasId = String(formData.get('kelas_id') ?? '').trim();
  const mataPelajaran = String(formData.get('mata_pelajaran') ?? '').trim();
  const jamKe = String(formData.get('jam_ke') ?? '').trim();
  const materi = String(formData.get('materi') ?? '').trim();
  const catatan = String(formData.get('catatan') ?? '').trim() || null;
  const refleksi = String(formData.get('refleksi') ?? '').trim() || null;
  const tanggal = String(formData.get('tanggal') ?? '').trim() || null;
  const presensiRaw = String(formData.get('presensi_json') ?? '[]');
  const simpanJadwalRutin = String(formData.get('simpan_jadwal_rutin') ?? 'false') === 'true';

  if (!kelasId || !mataPelajaran || !jamKe || !materi) {
    throw new Error('Lengkapi kelas, mata pelajaran, jam ke, dan materi.');
  }

  if (simpanJadwalRutin) {
    const mapelId = String(formData.get('mapel_id') ?? '').trim();
    const hari = String(formData.get('hari') ?? '').trim();
    const jamMulai = Number(formData.get('jam_mulai'));
    const jamSelesai = Number(formData.get('jam_selesai'));
    const hariOptions: HariName[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    if (
      !mapelId
      || !hariOptions.includes(hari as HariName)
      || !Number.isInteger(jamMulai)
      || !Number.isInteger(jamSelesai)
      || jamMulai < 1
      || jamMulai >= jamSelesai
    ) {
      throw new Error('Lengkapi data jadwal rutin dengan benar.');
    }

    await insertJadwalRutin(supabase, user.id, {
      kelas_id: kelasId,
      mapel_id: mapelId,
      hari: hari as HariName,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
    });
    revalidatePath('/portal/profil');
    revalidatePath('/portal/jurnal/');
  }

  let presensiPayload: PresensiPayload[];

  try {
    presensiPayload = JSON.parse(presensiRaw) as PresensiPayload[];
  } catch {
    throw new Error('Data presensi tidak valid.');
  }

  const rpcArgs = {
    p_teacher_id: user.id,
    p_kelas_id: kelasId,
    p_mata_pelajaran: mataPelajaran,
    p_jam_ke: jamKe,
    p_materi: materi,
    p_catatan: catatan,
    p_presensi: presensiPayload,
    p_tanggal: tanggal,
  } satisfies Database['public']['Functions']['submit_jurnal_and_presensi']['Args'];
  const { data: jurnalId, error } = await (supabase.rpc as any)('submit_jurnal_and_presensi', rpcArgs);

  if (error) {
    throw new Error(
      simpanJadwalRutin
        ? `Jadwal rutin berhasil disimpan, tetapi jurnal dan presensi gagal disimpan: ${error.message}`
        : error.message,
    );
  }

  // RPC belum menerima refleksi, sehingga disimpan lewat update atas jurnal yang baru dibuat.
  if (refleksi && jurnalId) {
    const { error: refleksiError } = await (supabase.from('jurnal_mengajar') as any)
      .update({ refleksi } satisfies Database['public']['Tables']['jurnal_mengajar']['Update'])
      .eq('id', jurnalId)
      .eq('teacher_id', user.id);

    if (refleksiError) {
      revalidatePath('/portal/jurnal/');
      throw new Error(`Jurnal dan presensi berhasil disimpan, tetapi refleksi gagal disimpan: ${refleksiError.message}`);
    }
  }

  revalidatePath('/portal/jurnal/');

  return { success: true };
}

async function getOwnedJurnal(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  jurnalId: string,
): Promise<{ id: string; kelas_id: string } | { error: string }> {
  const { data, error } = await (supabase.from('jurnal_mengajar') as any)
    .select('id, kelas_id')
    .eq('id', jurnalId)
    .eq('teacher_id', teacherId)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: 'Jurnal tidak ditemukan atau bukan milik Anda.' };
  }

  return data as { id: string; kelas_id: string };
}

async function getPresensiRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jurnalId: string,
): Promise<{ rows: PresensiInput[] } | { error: string }> {
  const { data, error } = await (supabase.from('presensi_siswa') as any)
    .select('siswa_id, status, catatan')
    .eq('jurnal_id', jurnalId);

  if (error) {
    return { error: error.message };
  }

  return { rows: (data ?? []) as PresensiInput[] };
}

export async function getPresensiForJurnal(jurnalId: string): Promise<PresensiInput[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna tidak terautentikasi.');
  }

  const id = String(jurnalId ?? '').trim();
  if (!id) {
    throw new Error('ID jurnal tidak valid.');
  }

  const jurnal = await getOwnedJurnal(supabase, user.id, id);
  if ('error' in jurnal) {
    throw new Error(jurnal.error);
  }

  const result = await getPresensiRows(supabase, id);
  if ('error' in result) {
    throw new Error(result.error);
  }

  return result.rows;
}

function toPresensiRecords(jurnalId: string, rows: PresensiInput[]) {
  return rows.map((row) => ({
    jurnal_id: jurnalId,
    siswa_id: row.siswa_id,
    status: row.status,
    catatan: row.catatan?.trim() || null,
  })) satisfies Database['public']['Tables']['presensi_siswa']['Insert'][];
}

export async function updateJurnalAndPresensi(
  jurnalId: string,
  formData: FormData,
  presensiInputs: PresensiInput[],
): Promise<JurnalActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'Pengguna tidak terautentikasi' };
  }

  const id = String(jurnalId ?? '').trim();
  const materi = String(formData.get('materi') ?? '').trim();
  const jamKe = String(formData.get('jam_ke') ?? '').trim();

  if (!id) {
    return { success: false, error: 'ID jurnal tidak valid.' };
  }
  if (!materi || !jamKe) {
    return { success: false, error: 'Lengkapi materi dan jam ke.' };
  }

  const updates: Database['public']['Tables']['jurnal_mengajar']['Update'] = { materi, jam_ke: jamKe };

  if (formData.has('catatan')) {
    updates.catatan = String(formData.get('catatan') ?? '').trim() || null;
  }
  if (formData.has('refleksi')) {
    updates.refleksi = String(formData.get('refleksi') ?? '').trim() || null;
  }
  if (formData.has('tanggal')) {
    const tanggal = String(formData.get('tanggal') ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(`${tanggal}T00:00:00Z`))) {
      return { success: false, error: 'Format tanggal tidak valid.' };
    }
    updates.tanggal = tanggal;
  }

  if (!Array.isArray(presensiInputs)) {
    return { success: false, error: 'Data presensi tidak valid.' };
  }

  const seenSiswa = new Set<string>();
  for (const item of presensiInputs) {
    if (
      !item
      || typeof item.siswa_id !== 'string'
      || !item.siswa_id
      || !presensiStatuses.includes(item.status)
      || seenSiswa.has(item.siswa_id)
    ) {
      return { success: false, error: 'Data presensi tidak valid.' };
    }
    seenSiswa.add(item.siswa_id);
  }

  const jurnal = await getOwnedJurnal(supabase, user.id, id);
  if ('error' in jurnal) {
    return { success: false, error: jurnal.error };
  }

  // Menjaga invarian RPC submit: setiap siswa harus berasal dari kelas jurnal.
  if (seenSiswa.size > 0) {
    const { data: siswaRows, error: siswaError } = await supabase
      .from('siswa')
      .select('id')
      .eq('kelas_id', jurnal.kelas_id)
      .in('id', [...seenSiswa]);

    if (siswaError) {
      return { success: false, error: siswaError.message };
    }
    if ((siswaRows ?? []).length !== seenSiswa.size) {
      return { success: false, error: 'Data siswa tidak sesuai dengan kelas jurnal.' };
    }
  }

  const { error: updateError } = await (supabase.from('jurnal_mengajar') as any)
    .update(updates)
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const previous = await getPresensiRows(supabase, id);
  if ('error' in previous) {
    return { success: false, error: previous.error };
  }

  const { error: deleteError } = await (supabase.from('presensi_siswa') as any).delete().eq('jurnal_id', id);
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  if (presensiInputs.length > 0) {
    const { error: insertError } = await (supabase.from('presensi_siswa') as any).insert(
      toPresensiRecords(id, presensiInputs),
    );

    if (insertError) {
      // Pemulihan best-effort agar presensi lama tidak hilang jika penyisipan gagal.
      const { error: restoreError } = previous.rows.length > 0
        ? await (supabase.from('presensi_siswa') as any).insert(toPresensiRecords(id, previous.rows))
        : { error: null };

      return {
        success: false,
        error: restoreError
          ? `Presensi gagal diperbarui dan presensi lama tidak dapat dipulihkan: ${insertError.message}`
          : `Presensi gagal diperbarui, presensi lama dipertahankan: ${insertError.message}`,
      };
    }
  }

  revalidatePath('/portal/jurnal');

  return { success: true };
}

export async function deleteJurnal(jurnalId: string): Promise<JurnalActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'Pengguna tidak terautentikasi' };
  }

  const id = String(jurnalId ?? '').trim();
  if (!id) {
    return { success: false, error: 'ID jurnal tidak valid.' };
  }

  const jurnal = await getOwnedJurnal(supabase, user.id, id);
  if ('error' in jurnal) {
    return { success: false, error: jurnal.error };
  }

  const previous = await getPresensiRows(supabase, id);
  if ('error' in previous) {
    return { success: false, error: previous.error };
  }

  const { error: presensiError } = await (supabase.from('presensi_siswa') as any).delete().eq('jurnal_id', id);
  if (presensiError) {
    return { success: false, error: presensiError.message };
  }

  const { data: deleted, error: jurnalError } = await (supabase.from('jurnal_mengajar') as any)
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select('id');

  if (jurnalError || !deleted || deleted.length === 0) {
    // Pemulihan best-effort agar jurnal yang gagal dihapus tidak kehilangan presensinya.
    if (previous.rows.length > 0) {
      await (supabase.from('presensi_siswa') as any).insert(toPresensiRecords(id, previous.rows));
    }
    return { success: false, error: jurnalError?.message ?? 'Jurnal gagal dihapus.' };
  }

  revalidatePath('/portal/jurnal');

  return { success: true };
}

export async function getRekapJurnal(): Promise<JurnalMengajar[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('jurnal_mengajar')
    .select('*, presensi_siswa(status)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false })
    .overrideTypes<Array<JurnalMengajar & { presensi_siswa: Array<{ status: PresensiStatus }> }>, { merge: false }>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((jurnal) => {
    const attendance = Array.isArray(jurnal.presensi_siswa) ? jurnal.presensi_siswa : [];
    const { presensi_siswa: _presensiSiswa, ...journalFields } = jurnal;

    return {
      ...journalFields,
      jumlah_hadir: attendance.filter((row) => row.status === 'hadir').length,
      jumlah_absen: attendance.filter((row) => row.status !== 'hadir').length,
    };
  });
}