'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '../../../lib/supabase/server';
import type { CatatanPerilaku, Kelas, PenangananPerilaku, PenangananStatus, PerilakuType, Siswa } from '../../../types/database';

type KelasWithSiswa = Kelas & {
  siswa: Siswa[];
};

type PenangananRow = Pick<PenangananPerilaku, 'catatan_id' | 'handler_id' | 'tanggal' | 'tindak_lanjut' | 'status'>;

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

export type CatatanPerilakuWithRelations = CatatanPerilaku & {
  siswa?: Siswa;
  penanganan_perilaku?: PenangananPerilaku[];
};

export async function getKelasAndSiswaList(): Promise<KelasWithSiswa[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Pengguna belum terautentikasi.');
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

  const { error } = await (supabase.rpc as any)('submit_catatan_perilaku', {
    p_reporter_id: user.id,
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

  return { success: true };
}

export async function submitPenangananEskalasi(catatanId: string, tindakLanjut: string, status: PenangananStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const payload: PenangananRow = {
    catatan_id: catatanId,
    handler_id: user.id,
    tanggal: getWITDateString(),
    tindak_lanjut: tindakLanjut,
    status,
  };

  const { error } = await (supabase.from('penanganan_perilaku') as any).insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/perilaku/');

  return { success: true };
}

export async function getRekapPerilaku(): Promise<CatatanPerilakuWithRelations[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('catatan_perilaku')
    .select('id, siswa_id, reporter_id, tanggal, poin, jenis, deskripsi, created_at, siswa: siswa_id (id, full_name, nisn, kelas_id, created_at), penanganan_perilaku (id, catatan_id, handler_id, tanggal, tindak_lanjut, status, updated_at)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const result = (data ?? []) as CatatanPerilakuWithRelations[];

  return result.map((item) => ({
    ...item,
    penanganan_perilaku: item.penanganan_perilaku ? [...item.penanganan_perilaku].sort((a, b) => {
      const timeA = new Date(b.updated_at ?? b.tanggal).getTime();
      const timeB = new Date(a.updated_at ?? a.tanggal).getTime();
      return timeA - timeB;
    }) : [],
  }));
}