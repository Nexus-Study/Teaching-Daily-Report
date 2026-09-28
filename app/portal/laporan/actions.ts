'use server';

import { createClient } from '../../../lib/supabase/server';
import type { Kelas, JurnalMengajar, PresensiSiswa, CatatanPerilaku, PenangananPerilaku, UserRole } from '../../../types/database';

const managementRoles: UserRole[] = ['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan'];

export type ReportKelasOption = Pick<Kelas, 'id' | 'nama_kelas' | 'tingkat' | 'wali_kelas_id'>;

export type LaporanRingkas = {
  totalJurnal: number;
  presensi: {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
    total: number;
    percentages: Record<'hadir' | 'izin' | 'sakit' | 'alpa', number>;
  };
  perilaku: {
    poinPositif: number;
    poinPelanggaran: number;
    totalCatatanPelanggaran: number;
  };
  eskalasi: Record<'ditangani_di_tempat' | 'diteruskan' | 'proses' | 'selesai', number>;
  jurnalList: Array<{
    id: string;
    tanggal: string;
    mata_pelajaran: string;
    jam_ke: string;
    kelas_nama: string;
    totalPresensi: number;
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
  }>;
  perilakuList: Array<{
    id: string;
    tanggal: string;
    siswa_nama: string;
    poin: number;
    jenis: string;
    deskripsi: string;
    status_eskalasi: string;
    tindak_lanjut: string | null;
  }>;
};

type ReportContext = {
  userId: string;
  roles: UserRole[];
};

async function getReportContext(): Promise<ReportContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    userId: user.id,
    roles: profile?.roles ?? [],
  };
}

function isManagementRole(roles: UserRole[]) {
  return roles.some((role) => managementRoles.includes(role));
}

export async function getFiltersOptions(): Promise<ReportKelasOption[]> {
  const supabase = await createClient();
  const { userId, roles } = await getReportContext();

  const { data, error } = await supabase.from('kelas').select('id, nama_kelas, tingkat, wali_kelas_id').order('tingkat', { ascending: true }).order('nama_kelas', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const kelasList = data ?? [];

  if (isManagementRole(roles)) {
    return kelasList;
  }

  if (roles.includes('wali_kelas')) {
    return kelasList.filter((kelas) => kelas.wali_kelas_id === userId);
  }

  return kelasList.filter((kelas) => kelas.wali_kelas_id === userId);
}

export async function getLaporanRingkas(kelasId?: string, startDate?: string, endDate?: string): Promise<LaporanRingkas> {
  const supabase = await createClient();
  const { userId } = await getReportContext();

  const jurnalQuery = supabase
    .from('jurnal_mengajar')
    .select('id, teacher_id, kelas_id, mata_pelajaran, tanggal, jam_ke, materi, catatan, created_at, kelas:kelas_id (id, nama_kelas, tingkat, wali_kelas_id)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  const perilakuQuery = supabase
    .from('catatan_perilaku')
    .select('id, siswa_id, reporter_id, tanggal, poin, jenis, deskripsi, created_at, siswa:siswa_id (id, full_name, nisn, kelas_id, created_at), penanganan_perilaku (id, catatan_id, handler_id, tanggal, tindak_lanjut, status, updated_at)')
    .order('tanggal', { ascending: false })
    .order('created_at', { ascending: false });

  if (kelasId) {
    jurnalQuery.eq('kelas_id', kelasId);
  }

  if (startDate) {
    jurnalQuery.gte('tanggal', startDate);
    perilakuQuery.gte('tanggal', startDate);
  }

  if (endDate) {
    jurnalQuery.lte('tanggal', endDate);
    perilakuQuery.lte('tanggal', endDate);
  }

  const [{ data: jurnalData, error: jurnalError }, { data: perilakuData, error: perilakuError }, { data: presensiData, error: presensiError }] = await Promise.all([
    jurnalQuery,
    perilakuQuery,
    supabase
      .from('presensi_siswa')
      .select('id, jurnal_id, siswa_id, status, catatan, jurnal:jurnal_id (id, kelas_id, tanggal, mata_pelajaran, jam_ke, kelas:kelas_id (id, nama_kelas, tingkat, wali_kelas_id))')
      .order('id', { ascending: true }),
  ]);

  if (jurnalError) {
    throw new Error(jurnalError.message);
  }

  if (perilakuError) {
    throw new Error(perilakuError.message);
  }

  if (presensiError) {
    throw new Error(presensiError.message);
  }

  const jurnalList = (jurnalData ?? []) as Array<JurnalMengajar & { kelas?: { nama_kelas: string } }>;
  const perilakuList = (perilakuData ?? []) as Array<CatatanPerilaku & { siswa?: { full_name: string }; penanganan_perilaku?: PenangananPerilaku[] }>;
  const presensiList = (presensiData ?? []) as Array<PresensiSiswa & { jurnal?: { kelas_id: string; kelas?: { nama_kelas: string } } }>;

  const filteredJurnalIds = new Set(jurnalList.map((item) => item.id));
  const filteredPerilakuIds = new Set(perilakuList.map((item) => item.id));

  const presensiFiltered = presensiList.filter((item) => filteredJurnalIds.has(item.jurnal_id));

  const presentCounts = presensiFiltered.reduce(
    (accumulator, item) => {
      accumulator[item.status] += 1;
      accumulator.total += 1;
      return accumulator;
    },
    { hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0 },
  );

  const pelanggaran = perilakuList.filter((item) => item.jenis === 'pelanggaran');
  const poinPositif = perilakuList.filter((item) => item.jenis === 'positif').reduce((sum, item) => sum + (item.poin ?? 0), 0);
  const poinPelanggaran = pelanggaran.reduce((sum, item) => sum + Math.abs(item.poin ?? 0), 0);

  const eskalasi = perilakuList.reduce(
    (accumulator, item) => {
      const latest = item.penanganan_perilaku?.[0];
      const status = latest?.status ?? 'ditangani_di_tempat';
      accumulator[status] += 1;
      return accumulator;
    },
    { ditangani_di_tempat: 0, diteruskan: 0, proses: 0, selesai: 0 },
  );

  const jurnalSummary = jurnalList.map((jurnal) => {
    const presensiForJurnal = presensiFiltered.filter((item) => item.jurnal_id === jurnal.id);
    const counts = presensiForJurnal.reduce(
      (accumulator, item) => {
        accumulator[item.status] += 1;
        accumulator.total += 1;
        return accumulator;
      },
      { hadir: 0, izin: 0, sakit: 0, alpa: 0, total: 0 },
    );

    return {
      id: jurnal.id,
      tanggal: jurnal.tanggal,
      mata_pelajaran: jurnal.mata_pelajaran,
      jam_ke: jurnal.jam_ke,
      kelas_nama: jurnal.kelas?.nama_kelas ?? 'Kelas',
      totalPresensi: counts.total,
      hadir: counts.hadir,
      izin: counts.izin,
      sakit: counts.sakit,
      alpa: counts.alpa,
    };
  });

  const perilakuSummary = perilakuList.map((item) => {
    const latest = item.penanganan_perilaku?.[0];

    return {
      id: item.id,
      tanggal: item.tanggal,
      siswa_nama: item.siswa?.full_name ?? 'Siswa',
      poin: item.poin,
      jenis: item.jenis,
      deskripsi: item.deskripsi,
      status_eskalasi: latest?.status ?? 'ditangani_di_tempat',
      tindak_lanjut: latest?.tindak_lanjut ?? null,
    };
  });

  const totalPresensi = presentCounts.total || 1;

  return {
    totalJurnal: jurnalList.length,
    presensi: {
      hadir: presentCounts.hadir,
      izin: presentCounts.izin,
      sakit: presentCounts.sakit,
      alpa: presentCounts.alpa,
      total: presentCounts.total,
      percentages: {
        hadir: Number(((presentCounts.hadir / totalPresensi) * 100).toFixed(1)),
        izin: Number(((presentCounts.izin / totalPresensi) * 100).toFixed(1)),
        sakit: Number(((presentCounts.sakit / totalPresensi) * 100).toFixed(1)),
        alpa: Number(((presentCounts.alpa / totalPresensi) * 100).toFixed(1)),
      },
    },
    perilaku: {
      poinPositif,
      poinPelanggaran,
      totalCatatanPelanggaran: pelanggaran.length,
    },
    eskalasi,
    jurnalList: jurnalSummary,
    perilakuList: perilakuSummary,
  };
}