'use server';

import { revalidatePath } from 'next/cache';

import { createAdminClient } from '../../../lib/supabase/admin';
import { createClient } from '../../../lib/supabase/server';
import type { HariName, UserRole } from '../../../types/database';

type JadwalGuruPayload = {
  id?: string;
  mapel_id: string;
  kelas_id: string;
  hari: HariName;
  jam_mulai: number;
  jam_selesai: number;
};

type JadwalSaveResult =
  | { success: true; message: string; jadwalId: string }
  | { success: false; message: string };

function jadwalErrorMessage(error: { code?: string; message: string }) {
  if (error.code === '23505' || error.message.includes('unique_jadwal_kelas_hari_jam')) {
    return 'Jadwal bentrok dengan jam/kelas lain yang sudah terisi.';
  }

  return 'Jadwal gagal disimpan.';
}

export async function updateProfileNameAndRoles(fullName: string, roles: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
    .select('roles')
    .eq('id', user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const safeRoles = profile.roles.includes('admin')
    ? roles
    : roles.filter((role) => role !== 'admin' && role !== 'kamad');
  const { error } = await (supabase.from('profiles') as any)
    .update({ full_name: fullName, roles: safeRoles })
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/portal/profil');
  revalidatePath('/portal');

  return { success: true, message: 'Profil dan peranan berhasil diperbarui.' };
}

export async function saveJadwalGuru(payload: JadwalGuruPayload): Promise<JadwalSaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Pengguna belum terautentikasi.');
  }

  if (payload.jam_mulai >= payload.jam_selesai) {
    return { success: false, message: 'Jam mulai harus lebih awal dari jam selesai.' };
  }

  const { id, ...jadwal } = payload;
  let savedJadwalId: string;

  if (id) {
    const { data, error } = await (supabase.from('jadwal_guru') as any)
      .update(jadwal)
      .eq('id', id)
      .eq('teacher_id', user.id)
      .select('id')
      .maybeSingle();

    if (error) {
      return { success: false, message: jadwalErrorMessage(error) };
    }

    if (!data) {
      return { success: false, message: 'Jadwal tidak ditemukan atau Anda tidak memiliki akses.' };
    }
    savedJadwalId = data.id;
  } else {
    const { data, error } = await (supabase.from('jadwal_guru') as any)
      .insert({ ...jadwal, teacher_id: user.id })
      .select('id')
      .single();

    if (error) {
      return { success: false, message: jadwalErrorMessage(error) };
    }
    savedJadwalId = data.id;
  }

  revalidatePath('/portal/profil');

  return { success: true, message: 'Jadwal berhasil disimpan.', jadwalId: savedJadwalId };
}

export async function deleteJadwalGuru(jadwalId: string) {
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
    .delete()
    .eq('id', jadwalId)
    .eq('teacher_id', user.id)
    .select('id')
    .maybeSingle();

  if (error) {
    return { success: false, message: 'Jadwal gagal dihapus.' };
  }

  if (!data) {
    return { success: false, message: 'Jadwal tidak ditemukan atau Anda tidak memiliki akses.' };
  }

  revalidatePath('/portal/profil');

  return { success: true, message: 'Jadwal berhasil dihapus.' };
}

export async function updateSecurityCredentials(currentPassword: string, newEmail?: string, newPassword?: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: 'Sesi tidak ditemukan. Silakan login kembali.' };
  }

  if (!user.email) {
    return { success: false, message: 'Email akun tidak tersedia untuk verifikasi.' };
  }

  const currentEmail = user.email.trim();
  const isInternalEmail = currentEmail.toLowerCase().endsWith('.internal')
    || currentEmail.toLowerCase().includes('@mts.internal');

  if (!isInternalEmail) {
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (passwordError) {
      return { success: false, message: 'Password saat ini salah.' };
    }
  }

  const normalizedEmail = newEmail?.trim();
  const hasPasswordRequest = Boolean(newPassword);
  const hasEmailRequest = Boolean(normalizedEmail && normalizedEmail.toLowerCase() !== currentEmail.toLowerCase());

  if (!hasPasswordRequest && !hasEmailRequest) {
    return { success: false, message: 'Masukkan Email Baru atau Password Baru yang ingin diubah.' };
  }

  if (hasPasswordRequest && newPassword) {
    if (newPassword.length < 6) {
      return { success: false, message: 'Password Baru harus terdiri dari minimal 6 karakter.' };
    }
  }

  if (hasEmailRequest && normalizedEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, message: 'Format Email Baru tidak valid.' };
    }
  }

  const updateAttributes: { email?: string; password?: string; email_confirm?: boolean } = {};
  if (hasEmailRequest && normalizedEmail) {
    updateAttributes.email = normalizedEmail;
    updateAttributes.email_confirm = true;
  }
  if (hasPasswordRequest && newPassword) {
    updateAttributes.password = newPassword;
  }

  try {
    const adminSupabase = createAdminClient();
    const { error: adminError } = await adminSupabase.auth.admin.updateUserById(user.id, updateAttributes);

    if (adminError) {
      if (/already registered|already exists|duplicate/i.test(adminError.message)) {
        return { success: false, message: 'Email tersebut sudah digunakan oleh akun lain.' };
      }

      return { success: false, message: `Gagal memperbarui kredensial: ${adminError.message}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    if (/already registered|already exists|duplicate/i.test(message)) {
      return { success: false, message: 'Email tersebut sudah digunakan oleh akun lain.' };
    }

    return { success: false, message: `Gagal memperbarui kredensial: ${message}` };
  }

  revalidatePath('/portal/profil');
  revalidatePath('/portal');

  return { success: true, message: 'Kredensial keamanan (email / password) berhasil diperbarui!' };
}