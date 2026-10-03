'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '../../../lib/supabase/server';
import type { Database, HariName, JadwalGuru, JurnalMengajar, Kelas, MataPelajaran, Siswa } from '../../../types/database';

type PresensiPayload = {
  siswa_id: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
  catatan?: string;
};

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
  const { error } = await (supabase.rpc as any)('submit_jurnal_and_presensi', rpcArgs);

  if (error) {
    throw new Error(
      simpanJadwalRutin
        ? `Jadwal rutin berhasil disimpan, tetapi jurnal dan presensi gagal disimpan: ${error.message}`
        : error.message,
    );
  }

  revalidatePath('/portal/jurnal/');

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
    .select('*')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}