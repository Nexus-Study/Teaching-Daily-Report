import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ShieldAlert,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react';

import type { UserRole } from '@/types/database';

export type PortalMenu = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  iconClass: string;
  softTintClass: string;
};

export const portalMenus: PortalMenu[] = [
  {
    title: 'Jurnal Harian',
    description: 'Input cepat jurnal mengajar dan rekap harian.',
    href: '/portal/jurnal/',
    icon: BookOpen,
    roles: ['guru_mapel', 'guru_tahfidz'],
    iconClass: 'text-indigo-600 dark:text-indigo-400',
    softTintClass: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    title: 'Catatan & Penanganan Perilaku',
    description: 'Catat perilaku dan tindak lanjut kolaboratif.',
    href: '/portal/perilaku/',
    icon: ShieldAlert,
    roles: ['admin', 'guru_bk', 'wali_kelas', 'waka_kesiswaan', 'guru_mapel', 'guru_tahfidz'],
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    softTintClass: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    title: 'Rekap & Laporan',
    description: 'Laporan ringkas untuk pimpinan dan kurikulum.',
    href: '/portal/laporan/',
    icon: BarChart3,
    roles: ['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan'],
    iconClass: 'text-amber-600 dark:text-amber-400',
    softTintClass: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    title: 'Rekap Kehadiran',
    description: 'Rekap presensi mapel & alert ketidakhadiran siswa.',
    href: '/portal/rekap-kehadiran/',
    icon: CalendarCheck,
    roles: ['admin', 'kamad', 'waka_kurikulum', 'waka_kesiswaan', 'guru_bk', 'guru_mapel', 'guru_tahfidz', 'wali_kelas'],
    iconClass: 'text-sky-600 dark:text-sky-400',
    softTintClass: 'bg-sky-50 dark:bg-sky-950/50',
  },
  {
    title: 'Kelola Data Master',
    description: 'Bulk import CSV siswa, kelas, & akun guru.',
    href: '/portal/admin/',
    icon: ShieldCheck,
    roles: ['admin'],
    iconClass: 'text-purple-600 dark:text-purple-400',
    softTintClass: 'bg-purple-50 dark:bg-purple-950/50',
  },
  {
    title: 'Profil Saya',
    description: 'Kelola data akun dan peran aktif.',
    href: '/portal/profil/',
    icon: User,
    roles: ['admin', 'kamad', 'waka_kesiswaan', 'waka_kurikulum', 'guru_bk', 'guru_mapel', 'guru_tahfidz', 'wali_kelas', 'siswa'],
    iconClass: 'text-slate-700 dark:text-slate-300',
    softTintClass: 'bg-slate-100 dark:bg-slate-800',
  },
];