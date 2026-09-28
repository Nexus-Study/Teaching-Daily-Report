'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { createClient } from '../../../lib/supabase/server';
import { createClient as createServerClient } from '../../../lib/supabase/server';
import type { Database, UserRole } from '../../../types/database';

export type SiswaCSVRow = {
  full_name: string;
  nisn: string;
  nama_kelas: string;
  tingkat: number;
};

type ParsedSiswaCSVRow = {
  full_name: string;
  nisn: string;
  nama_kelas: string;
  tingkat: number;
};

export type GuruCSVRow = {
  email: string;
  full_name: string;
  nip_nisn: string | null;
  roles: UserRole[];
};

type ParsedGuruCSVRow = {
  email: string;
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
  const requiredColumns = ['full_name', 'nisn', 'nama_kelas', 'tingkat'];

  for (const column of requiredColumns) {
    if (!header.includes(column)) {
      throw new Error(`Header CSV harus memuat kolom: ${requiredColumns.join(', ')}`);
    }
  }

  const columnIndex = Object.fromEntries(header.map((column, index) => [column, index]));

  return rows.slice(1).map((line, lineIndex) => {
    const cells = parseCsvLine(line);

    const fullName = cells[columnIndex.full_name] ?? '';
    const nisn = cells[columnIndex.nisn] ?? '';
    const namaKelas = cells[columnIndex.nama_kelas] ?? '';
    const tingkatValue = cells[columnIndex.tingkat] ?? '';

    if (!fullName || !nisn || !namaKelas || !tingkatValue) {
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
  const requiredColumns = ['email', 'full_name', 'nip_nisn', 'roles'];

  for (const column of requiredColumns) {
    if (!header.includes(column)) {
      throw new Error(`Header CSV harus memuat kolom: ${requiredColumns.join(', ')}`);
    }
  }

  const columnIndex = Object.fromEntries(header.map((column, index) => [column, index]));

  const parsedRows = rows.slice(1).map((line, lineIndex) => {
    const cells = parseCsvLine(line);

    const email = (cells[columnIndex.email] ?? '').trim().toLowerCase();
    const fullName = (cells[columnIndex.full_name] ?? '').trim();
    const nipNisn = (cells[columnIndex.nip_nisn] ?? '').trim();
    const rolesValue = (cells[columnIndex.roles] ?? '').trim();

    if (!email || !fullName) {
      throw new Error(`Baris ${lineIndex + 2} harus memuat email dan full_name.`);
    }

    return {
      email,
      full_name: fullName,
      nip_nisn: nipNisn || null,
      roles: parseRoles(rolesValue),
    } satisfies ParsedGuruCSVRow;
  });

  const uniqueByEmail = new Map<string, ParsedGuruCSVRow>();

  for (const row of parsedRows) {
    uniqueByEmail.set(row.email, row);
  }

  return Array.from(uniqueByEmail.values());
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
    throw new Error('Akses ditolak. Hanya admin yang dapat melakukan provisioning guru.');
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

function generateFallbackPassword() {
  return `Temp-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}!`;
}

export async function importSiswaAndKelasAction(formData: FormData) {
  const file = formData.get('csv_file');

  if (!(file instanceof File)) {
    throw new Error('File CSV wajib diunggah.');
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('File yang diunggah harus berformat .csv.');
  }

  const csvText = await file.text();
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

export async function importGuruAction(formData: FormData, defaultPassword?: string) {
  await assertAdminAccess();

  const file = formData.get('csv_file') ?? formData.get('file');

  if (!(file instanceof File)) {
    throw new Error('File CSV guru wajib diunggah.');
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new Error('File yang diunggah harus berformat .csv.');
  }

  const csvText = await file.text();
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
    let user = await findUserByEmail(adminClient, row.email);

    if (!user) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: row.email,
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
      throw new Error(`Gagal mendapatkan user_id untuk email ${row.email}.`);
    }

    guruWithUserIds.push({
      user_id: user.id,
      email: row.email,
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