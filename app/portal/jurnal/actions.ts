'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '../../../lib/supabase/server';
import type { JurnalMengajar, Kelas, Siswa } from '../../../types/database';

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

export async function getSiswaByKelas(kelasId: string): Promise<Siswa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('siswa').select('*').eq('kelas_id', kelasId).order('full_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
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
  const presensiRaw = String(formData.get('presensi_json') ?? '[]');

  if (!kelasId || !mataPelajaran || !jamKe || !materi) {
    throw new Error('Lengkapi kelas, mata pelajaran, jam ke, dan materi.');
  }

  let presensiPayload: PresensiPayload[];

  try {
    presensiPayload = JSON.parse(presensiRaw) as PresensiPayload[];
  } catch {
    throw new Error('Data presensi tidak valid.');
  }

  const { error } = await supabase.rpc('submit_jurnal_and_presensi', {
    p_teacher_id: user.id,
    p_kelas_id: kelasId,
    p_mata_pelajaran: mataPelajaran,
    p_jam_ke: jamKe,
    p_materi: materi,
    p_catatan: catatan,
    p_presensi: presensiPayload,
  });

  if (error) {
    throw new Error(error.message);
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