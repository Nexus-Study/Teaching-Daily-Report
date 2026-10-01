'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

import { createClient } from '../../../lib/supabase/server';
import { createClient as createServerClient } from '../../../lib/supabase/server';
import type { Database, UserRole } from '../../../types/database';

export type SiswaCSVRow = {
  full_name: string;
  nisn: string | null;
  nama_kelas: string;
  tingkat: number;
};

type ParsedSiswaCSVRow = {
  full_name: string;
  nisn: string | null;
  nama_kelas: string;
  tingkat: number;
};

export type GuruCSVRow = {
  email: string | null;
  full_name: string;
  nip_nisn: string | null;
  roles: UserRole[];
};

type ParsedGuruCSVRow = {
  email: string | null;
  full_name: string;
  nip_nisn: string | null;
  roles: UserRole[];
};

const allowedRoles: UserRole[] = [
  'admin',
  'kamad',
  'waka_kesiswaan',
  'waka_kurikulum',
  'guru_bk',
  'guru_mapel',
  'guru_tahfidz',
  'wali_kelas',
  'siswa',
];

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function sanitizeNipNisn(rawVal: string): string | null {
  const trimmed = rawVal.trim();

  if (!trimmed) {
    return null;
  }

  if (!trimmed.toLowerCase().includes('e+')) {
    return trimmed;
  }

  const numericValue = Number(trimmed);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  try {
    return BigInt(Math.round(numericValue)).toString();
  } catch {
    return null;
  }
}

async function parseFileToCsvText(file: File): Promise<string> {
  const extension = file.name.toLowerCase().split('.').pop();

  if (extension === 'csv') {
    return await file.text();
  }

  if (extension !== 'xlsx' && extension !== 'xls') {
    throw new Error('File harus berformat .csv, .xls, atau .xlsx.');
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('File Excel tidak memiliki sheet.');
  }

  return XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
}

function parseSiswaCSV(csvText: string): SiswaCSVRow[] {
  const rows = csvText
    .replace(/\uFEFF/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return [];
  }

  const header = parseCsvLine(rows[0]).map((column) => column.toLowerCase());
  const requiredColumns = ['full_name', 'nama_kelas', 'tingkat'];

  for (const column of requiredColumns) {
    if (!header.includes(column)) {
      throw new Error(`Header CSV harus memuat kolom: ${requiredColumns.join(', ')}`);
    }
  }

  const columnIndex = Object.fromEntries(header.map((column, index) => [column, index]));

  return rows.slice(1).map((line, lineIndex) => {
    const cells = parseCsvLine(line);

    const fullName = cells[columnIndex.full_name] ?? '';
    const nisnColumnIndex = columnIndex.nisn;
    const nisnValue = nisnColumnIndex === undefined ? '' : (cells[nisnColumnIndex] ?? '');
    const nisn = nisnValue.trim() || null;
    const namaKelas = cells[columnIndex.nama_kelas] ?? '';
    const tingkatValue = cells[columnIndex.tingkat] ?? '';

    if (!fullName || !namaKelas || !tingkatValue) {
      throw new Error(`Baris ${lineIndex + 2} tidak lengkap.`);
    }

    const tingkat = Number.parseInt(tingkatValue, 10);

    if (Number.isNaN(tingkat)) {
      throw new Error(`Nilai tingkat pada baris ${lineIndex + 2} harus berupa angka.`);
    }

    return {
      full_name: fullName,
      nisn,
      nama_kelas: namaKelas,
      tingkat,
    } satisfies ParsedSiswaCSVRow;
  });
}

function parseRoles(value: string): UserRole[] {
  const parsedRoles = value
    .split(';')
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean) as UserRole[];

  if (parsedRoles.length === 0) {
    return ['guru_mapel'];
  }

  for (const role of parsedRoles) {
    if (!allowedRoles.includes(role)) {
      throw new Error(`Role tidak valid: ${role}`);
    }
  }

  return Array.from(new Set(parsedRoles));
}

function parseRolesFromList(values: string[]): UserRole[] {
  const parsedRoles = values
    .map((role) => role.trim().toLowerCase())
    .filter(Boolean) as UserRole[];

  if (parsedRoles.length === 0) {
    throw new Error('Minimal pilih satu role.');
  }

  for (const role of parsedRoles) {
    if (!allowedRoles.includes(role)) {
      throw new Error(`Role tidak valid: ${role}`);
    }
  }

  return Array.from(new Set(parsedRoles));
}

function parseGuruCSV(csvText: string): GuruCSVRow[] {
  const rows = csvText
    .replace(/\uFEFF/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return [];
  }

  const header = parseCsvLine(rows[0]).map((column) => column.toLowerCase());
  const requiredColumns = ['full_name'];

  for (const column of requiredColumns) {
    if (!header.includes(column)) {
      throw new Error(`Header CSV harus memuat kolom: ${requiredColumns.join(', ')}`);
    }
  }

  const columnIndex = Object.fromEntries(header.map((column, index) => [column, index]));

  const parsedRows = rows.slice(1).map((line, lineIndex) => {
    const cells = parseCsvLine(line);

    const emailColumnIndex = columnIndex.email;
    const nipNisnColumnIndex = columnIndex.nip_nisn;
    const rolesColumnIndex = columnIndex.roles;
    const emailValue = emailColumnIndex === undefined ? '' : (cells[emailColumnIndex] ?? '');
    const fullName = (cells[columnIndex.full_name] ?? '').trim();
    const nipNisnValue = nipNisnColumnIndex === undefined ? '' : (cells[nipNisnColumnIndex] ?? '');
    const rolesValue = rolesColumnIndex === undefined ? '' : (cells[rolesColumnIndex] ?? '');
    const email = emailValue.trim().toLowerCase() || null;

    if (!fullName) {
      throw new Error(`Baris ${lineIndex + 2} harus memuat full_name.`);
    }

    return {
      email,
      full_name: fullName,
      nip_nisn: sanitizeNipNisn(nipNisnValue),
      roles: parseRoles(rolesValue.trim()),
    } satisfies ParsedGuruCSVRow;
  });

  const uniqueByIdentity = new Map<string, ParsedGuruCSVRow>();

  parsedRows.forEach((row, index) => {
    const identity = row.email
      ? `email:${row.email}`
      : row.nip_nisn
        ? `nip_nisn:${row.nip_nisn}`
        : `row:${index}`;
    uniqueByIdentity.set(identity, row);
  });

  return Array.from(uniqueByIdentity.values());
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Environment Supabase admin belum lengkap.');
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function assertAdminAccess() {
  const supabase = await createServerClient();
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

  const userRoles = (profile as { roles?: string[] } | null)?.roles || [];

  if (!userRoles.includes('admin')) {
    throw new Error('Akses ditolak. Hanya admin yang dapat mengelola data master.');
  }
}

async function findUserByEmail(adminClient: ReturnType<typeof createAdminClient>, email: string) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(error.message);
    }

    const foundUser = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

    if (foundUser) {
      return foundUser;
    }

    if (data.users.length < 1000) {
      break;
    }
  }

  return null;
}

async function findUserByNipNisn(adminClient: ReturnType<typeof createAdminClient>, nipNisn: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(error.message);
    }

    const foundUser = data.users.find(
      (candidate) => sanitizeNipNisn(String(candidate.user_metadata?.nip_nisn ?? '')) === nipNisn,
    );

    if (foundUser) {
      return foundUser;
    }

    if (data.users.length < 1000) {
      break;
    }
  }

  return null;
}

function createFallbackEmail(row: ParsedGuruCSVRow): string {
  if (row.email) {
    return row.email;
  }

  if (row.nip_nisn) {
    return `${row.nip_nisn}@mts.internal`;
  }

  const firstName = row.full_name.split(',')[0].trim().split(/\s+/)[0];
  const emailPrefix = firstName.toLowerCase().replace(/[^a-z]/g, '') || 'guru';
  const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 3);

  return `${emailPrefix}${randomSuffix}@mts.internal`;
}

function generateFallbackPassword() {
  return `Temp-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}!`;
}

export async function importSiswaAndKelasAction(formData: FormData) {
  const file = formData.get('csv_file');

  if (!(file instanceof File)) {
    throw new Error('File CSV wajib diunggah.');
  }

  if (!/\.(csv|xls|xlsx)$/i.test(file.name)) {
    throw new Error('File yang diunggah harus berformat .csv, .xls, atau .xlsx.');
  }

  const csvText = await parseFileToCsvText(file);
  const parsedData = parseSiswaCSV(csvText);

  if (parsedData.length === 0) {
    throw new Error('Data CSV kosong.');
  }

  const supabase = await createClient();
  const { data, error } = await (supabase.rpc as any)('import_kelas_dan_siswa_json', {
    p_data: parsedData,
  });

  if (error) {
    throw new Error(error.message);
  }

  const totalKelas = typeof data === 'object' && data !== null && 'totalKelas' in data ? Number((data as { totalKelas?: number }).totalKelas ?? 0) : 0;
  const totalSiswa = typeof data === 'object' && data !== null && 'totalSiswa' in data ? Number((data as { totalSiswa?: number }).totalSiswa ?? parsedData.length) : parsedData.length;

  return {
    success: true,
    totalKelas,
    totalSiswa,
  };
}

export type KelasOption = Pick<Database['public']['Tables']['kelas']['Row'], 'id' | 'nama_kelas' | 'tingkat'>;

export type SiswaWithKelas = Pick<Database['public']['Tables']['siswa']['Row'], 'id' | 'full_name' | 'nisn' | 'kelas_id' | 'created_at'> & {
  kelas: Pick<Database['public']['Tables']['kelas']['Row'], 'nama_kelas' | 'tingkat'> | null;
};

export async function getKelasOptionsAction(): Promise<KelasOption[]> {
  try {
    await assertAdminAccess();

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('kelas')
      .select('id, nama_kelas, tingkat')
      .order('tingkat', { ascending: true })
      .order('nama_kelas', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal memuat pilihan kelas.');
  }
}

export async function getSiswaPaginatedAction(params: {
  search?: string;
  kelasId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: SiswaWithKelas[]; totalCount: number; page: number; totalPages: number }> {
  try {
    await assertAdminAccess();

    const page = Math.max(1, Math.floor(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(params.limit ?? 25)));
    const offset = (page - 1) * limit;
    const adminClient = createAdminClient();
    let query = adminClient
      .from('siswa')
      .select('id, full_name, nisn, kelas_id, created_at, kelas(nama_kelas, tingkat)', { count: 'exact' });

    const search = params.search?.trim();
    if (search) {
      const safeSearch = search.replace(/[",()]/g, ' ').replace(/[%_\\]/g, '\\$&');
      query = query.or(`full_name.ilike.%${safeSearch}%,nisn.ilike.%${safeSearch}%`);
    }

    if (params.kelasId?.trim()) {
      query = query.eq('kelas_id', params.kelasId.trim());
    }

    const { data, error, count } = await query
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    const totalCount = count ?? 0;
    return {
      data: (data ?? []) as SiswaWithKelas[],
      totalCount,
      page,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal memuat daftar siswa.');
  }
}

export async function createSiswaSingleAction(formData: FormData) {
  try {
    await assertAdminAccess();

    const fullName = String(formData.get('full_name') ?? '').trim();
    const nisn = String(formData.get('nisn') ?? '').trim() || null;
    const kelasId = String(formData.get('kelas_id') ?? '').trim();

    if (!fullName || !kelasId) {
      throw new Error('Nama lengkap dan kelas wajib diisi.');
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.from('siswa').insert({ full_name: fullName, nisn, kelas_id: kelasId });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal menambahkan data siswa.');
  }
}

export async function updateSiswaAction(formData: FormData) {
  try {
    await assertAdminAccess();

    const siswaId = String(formData.get('siswa_id') ?? '').trim();
    const fullName = String(formData.get('full_name') ?? '').trim();
    const nisn = String(formData.get('nisn') ?? '').trim() || null;
    const kelasId = String(formData.get('kelas_id') ?? '').trim();

    if (!siswaId) {
      throw new Error('ID siswa tidak ditemukan.');
    }

    if (!fullName || !kelasId) {
      throw new Error('Nama lengkap dan kelas wajib diisi.');
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('siswa')
      .update({ full_name: fullName, nisn, kelas_id: kelasId })
      .eq('id', siswaId)
      .select('id')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Data siswa tidak ditemukan.');
    }

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal memperbarui data siswa.');
  }
}

export async function deleteSiswaAction(siswaId: string) {
  try {
    await assertAdminAccess();

    const id = siswaId.trim();
    if (!id) {
      throw new Error('ID siswa tidak ditemukan.');
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from('siswa').delete().eq('id', id).select('id').maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Data siswa tidak ditemukan.');
    }

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal menghapus data siswa.');
  }
}

export async function importGuruAction(formData: FormData, defaultPassword?: string) {
  await assertAdminAccess();

  const file = formData.get('csv_file') ?? formData.get('file');

  if (!(file instanceof File)) {
    throw new Error('File CSV guru wajib diunggah.');
  }

  if (!/\.(csv|xls|xlsx)$/i.test(file.name)) {
    throw new Error('File yang diunggah harus berformat .csv, .xls, atau .xlsx.');
  }

  const csvText = await parseFileToCsvText(file);
  const parsedData = parseGuruCSV(csvText);

  if (parsedData.length === 0) {
    throw new Error('Data CSV kosong.');
  }

  const adminClient = createAdminClient();
  const passwordToUse = defaultPassword?.trim() || generateFallbackPassword();
  const guruWithUserIds = [] as Array<{
    user_id: string;
    email: string;
    full_name: string;
    nip_nisn: string | null;
    roles: UserRole[];
  }>;

  for (const row of parsedData) {
    const targetEmail = createFallbackEmail(row);
    let user = row.email ? await findUserByEmail(adminClient, row.email) : null;

    if (!user && row.nip_nisn) {
      user = await findUserByNipNisn(adminClient, row.nip_nisn);
    }

    if (user && row.email && user.email?.toLowerCase() !== row.email) {
      const { data, error } = await adminClient.auth.admin.updateUserById(user.id, {
        email: row.email,
        email_confirm: true,
      });

      if (error) {
        throw new Error(error.message);
      }

      user = data.user;
    }

    if (!user) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: targetEmail,
        password: passwordToUse,
        email_confirm: true,
        user_metadata: {
          full_name: row.full_name,
          nip_nisn: row.nip_nisn,
          roles: row.roles,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      user = data.user;
    }

    if (!user?.id) {
      throw new Error(`Gagal mendapatkan user_id untuk email ${targetEmail}.`);
    }

    guruWithUserIds.push({
      user_id: user.id,
      email: targetEmail,
      full_name: row.full_name,
      nip_nisn: row.nip_nisn,
      roles: row.roles,
    });
  }

  const supabase = await createServerClient();
  const { error } = await (supabase.rpc as any)('import_guru_profiles_json', {
    p_data: guruWithUserIds,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    totalGuru: guruWithUserIds.length,
    defaultPasswordUsed: Boolean(defaultPassword?.trim()),
  };
}

export type GuruProfileRow = {
  id: string;
  full_name: string;
  nip_nisn: string | null;
  email: string | null;
  roles: UserRole[];
};

export async function getGuruProfilesAction(): Promise<GuruProfileRow[]> {
  try {
    await assertAdminAccess();

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, full_name, nip_nisn, email, roles')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as GuruProfileRow[];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal mengambil data guru. Silakan coba lagi.');
  }
}

export async function createGuruSingleAction(formData: FormData) {
  try {
    await assertAdminAccess();

    const fullName = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const nipNisnRaw = String(formData.get('nip_nisn') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const roles = parseRolesFromList(formData.getAll('roles').map(String));

    if (!fullName) {
      throw new Error('Nama lengkap wajib diisi.');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Email tidak valid.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password minimal 6 karakter.');
    }

    const nipNisn = nipNisnRaw ? sanitizeNipNisn(nipNisnRaw) : null;
    const adminClient = createAdminClient();

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        nip_nisn: nipNisn,
        roles,
      },
    });

    if (createError) {
      throw new Error(createError.message);
    }

    if (!createdUser.user?.id) {
      throw new Error('Gagal membuat akun guru baru.');
    }

    const { error: profileError } = await adminClient.from('profiles').upsert(
      {
        id: createdUser.user.id,
        full_name: fullName,
        nip_nisn: nipNisn,
        email,
        roles,
        is_active: true,
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      throw new Error(profileError.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal membuat akun guru. Silakan coba lagi.');
  }
}

export async function updateGuruAction(formData: FormData) {
  try {
    await assertAdminAccess();

    const userId = String(formData.get('user_id') ?? '').trim();
    const fullName = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const nipNisnRaw = String(formData.get('nip_nisn') ?? '').trim();
    const password = String(formData.get('password') ?? '').trim();
    const roles = parseRolesFromList(formData.getAll('roles').map(String));

    if (!userId) {
      throw new Error('ID pengguna tidak ditemukan.');
    }

    if (!fullName) {
      throw new Error('Nama lengkap wajib diisi.');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Email tidak valid.');
    }

    const nipNisn = nipNisnRaw ? sanitizeNipNisn(nipNisnRaw) : null;
    const adminClient = createAdminClient();

    const authUpdateData: { email: string; email_confirm: boolean; password?: string } = {
      email,
      email_confirm: true,
    };

    if (password) {
      if (password.length < 6) {
        throw new Error('Password minimal 6 karakter.');
      }

      authUpdateData.password = password;
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, authUpdateData);

    if (authError) {
      throw new Error(authError.message);
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName,
        nip_nisn: nipNisn,
        email,
        roles,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal memperbarui data guru. Silakan coba lagi.');
  }
}

export async function softDeleteGuruAction(userId: string) {
  try {
    await assertAdminAccess();

    const trimmedUserId = userId.trim();

    if (!trimmedUserId) {
      throw new Error('ID pengguna tidak ditemukan.');
    }

    const adminClient = createAdminClient();

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', trimmedUserId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    // Bekukan akses login selama ~100 tahun (setara nonaktif permanen)
    const { error: authError } = await adminClient.auth.admin.updateUserById(trimmedUserId, {
      ban_duration: '876000h',
    });

    if (authError) {
      throw new Error(authError.message);
    }

    return { success: true };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gagal menonaktifkan akun guru. Silakan coba lagi.');
  }
}