/**
 * Type definitions untuk Supabase Database Schema
 * Sprint 1 [TICK-03 & TICK-04] - Multi-Role Auth & Profiles
 * Sprint 2 [TICK-06 & TICK-07] - Core Academic & Behavior Schema (Revised)
 * Kompatibel dengan client @supabase/supabase-js
 */

export type UserRole =
  | 'admin'
  | 'kamad'
  | 'waka_kesiswaan'
  | 'waka_kurikulum'
  | 'guru_bk'
  | 'guru_mapel'
  | 'guru_tahfidz'
  | 'wali_kelas'
  | 'guru_piket'
  | 'pembina_ekskul'
  | 'siswa';

export type PresensiStatus = 'hadir' | 'izin' | 'sakit' | 'alpa';

export type PerilakuType = 'positif' | 'pelanggaran';

export type PenangananStatus = 'ditangani_di_tempat' | 'diteruskan' | 'proses' | 'selesai';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  id: string;
  full_name: string;
  nip_nisn: string | null;
  email: string | null;
  is_active: boolean;
  roles: UserRole[];
  avatar_url: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export type Kelas = {
  id: string;
  nama_kelas: string;
  tingkat: number;
  wali_kelas_id: string | null;
  created_at: string;
}

export type HariName = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export type MataPelajaran = {
  id: string;
  nama_mapel: string;
  jumlah_jam: number;
  created_at: string;
};

export type JadwalGuru = {
  id: string;
  teacher_id: string;
  mapel_id: string;
  kelas_id: string;
  hari: HariName;
  jam_mulai: number;
  jam_selesai: number;
  created_at: string;
  mata_pelajaran?: MataPelajaran;
  kelas?: { id: string; nama_kelas: string };
};

export type Siswa = {
  id: string;
  full_name: string;
  nisn: string | null;
  kelas_id: string;
  created_at: string;
}

export type JurnalMengajar = {
  id: string;
  teacher_id: string;
  kelas_id: string;
  mata_pelajaran: string;
  tanggal: string;
  jam_ke: string;
  materi: string;
  catatan: string | null;
  created_at: string;
}

export type PresensiSiswa = {
  id: string;
  jurnal_id: string;
  siswa_id: string;
  status: PresensiStatus;
  catatan: string | null;
}

export type RekapKehadiranSiswa = {
  siswa_id: string;
  full_name: string;
  nisn: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
}

export type AlertKehadiranSiswa = {
  siswa_id: string;
  full_name: string;
  kelas_nama: string;
  mata_pelajaran: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
}

export type CatatanPerilaku = {
  id: string;
  siswa_id: string;
  reporter_id: string;
  tanggal: string;
  poin: number;
  jenis: PerilakuType;
  deskripsi: string;
  created_at: string;
}

export type PenangananPerilaku = {
  id: string;
  catatan_id: string;
  handler_id: string;
  tanggal: string;
  tindak_lanjut: string;
  status: PenangananStatus;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          nip_nisn?: string | null;
          email?: string | null;
          is_active?: boolean;
          roles?: UserRole[];
          avatar_url?: string | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          nip_nisn?: string | null;
          email?: string | null;
          is_active?: boolean;
          roles?: UserRole[];
          avatar_url?: string | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kelas: {
        Row: Kelas;
        Insert: {
          id?: string;
          nama_kelas: string;
          tingkat: number;
          wali_kelas_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama_kelas?: string;
          tingkat?: number;
          wali_kelas_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      mata_pelajaran: {
        Row: MataPelajaran;
        Insert: {
          id?: string;
          nama_mapel: string;
          jumlah_jam?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama_mapel?: string;
          jumlah_jam?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      jadwal_guru: {
        Row: JadwalGuru;
        Insert: {
          id?: string;
          teacher_id: string;
          mapel_id: string;
          kelas_id: string;
          hari: HariName;
          jam_mulai: number;
          jam_selesai: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          mapel_id?: string;
          kelas_id?: string;
          hari?: HariName;
          jam_mulai?: number;
          jam_selesai?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jadwal_guru_teacher_id_fkey';
            columns: ['teacher_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jadwal_guru_mapel_id_fkey';
            columns: ['mapel_id'];
            isOneToOne: false;
            referencedRelation: 'mata_pelajaran';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jadwal_guru_kelas_id_fkey';
            columns: ['kelas_id'];
            isOneToOne: false;
            referencedRelation: 'kelas';
            referencedColumns: ['id'];
          }
        ];
      };
      siswa: {
        Row: Siswa;
        Insert: {
          id?: string;
          full_name: string;
          nisn: string | null;
          kelas_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          nisn?: string | null;
          kelas_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'siswa_kelas_id_fkey';
            columns: ['kelas_id'];
            isOneToOne: false;
            referencedRelation: 'kelas';
            referencedColumns: ['id'];
          },
        ];
      };
      jurnal_mengajar: {
        Row: JurnalMengajar;
        Insert: {
          id?: string;
          teacher_id: string;
          kelas_id: string;
          mata_pelajaran: string;
          tanggal?: string;
          jam_ke: string;
          materi: string;
          catatan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          kelas_id?: string;
          mata_pelajaran?: string;
          tanggal?: string;
          jam_ke?: string;
          materi?: string;
          catatan?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      presensi_siswa: {
        Row: PresensiSiswa;
        Insert: {
          id?: string;
          jurnal_id: string;
          siswa_id: string;
          status?: PresensiStatus;
          catatan?: string | null;
        };
        Update: {
          id?: string;
          jurnal_id?: string;
          siswa_id?: string;
          status?: PresensiStatus;
          catatan?: string | null;
        };
        Relationships: [];
      };
      catatan_perilaku: {
        Row: CatatanPerilaku;
        Insert: {
          id?: string;
          siswa_id: string;
          reporter_id: string;
          tanggal?: string;
          poin?: number;
          jenis?: PerilakuType;
          deskripsi: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          siswa_id?: string;
          reporter_id?: string;
          tanggal?: string;
          poin?: number;
          jenis?: PerilakuType;
          deskripsi?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      penanganan_perilaku: {
        Row: PenangananPerilaku;
        Insert: {
          id?: string;
          catatan_id: string;
          handler_id: string;
          tanggal?: string;
          tindak_lanjut: string;
          status?: PenangananStatus;
          updated_at?: string;
        };
        Update: {
          id?: string;
          catatan_id?: string;
          handler_id?: string;
          tanggal?: string;
          tindak_lanjut?: string;
          status?: PenangananStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      get_user_roles: {
        Args: { user_id: string };
        Returns: UserRole[];
      };
      has_role: {
        Args: { user_id: string; required_role: UserRole };
        Returns: boolean;
      };
      has_any_role: {
        Args: { user_id: string; allowed_roles: UserRole[] };
        Returns: boolean;
      };
      is_wali_kelas_of_class: {
        Args: { user_id: string; target_kelas_id: string };
        Returns: boolean;
      };
      is_wali_kelas_of_siswa: {
        Args: { user_id: string; target_siswa_id: string };
        Returns: boolean;
      };
      submit_jurnal_and_presensi: {
        Args: {
          p_teacher_id: string;
          p_kelas_id: string;
          p_mata_pelajaran: string;
          p_jam_ke: string;
          p_materi: string;
          p_catatan?: string | null;
          p_presensi?: Json;
        };
        Returns: string;
      };
      submit_catatan_perilaku: {
        Args: {
          p_reporter_id: string;
          p_siswa_id: string;
          p_tanggal?: string | null;
          p_poin?: number | null;
          p_jenis?: PerilakuType;
          p_deskripsi: string;
          p_tindak_lanjut?: string | null;
          p_status?: PenangananStatus | null;
        };
        Returns: string;
      };
      import_kelas_dan_siswa_json: {
        Args: {
          p_data: Json;
        };
        Returns: Json;
      };
      import_guru_profiles_json: {
        Args: {
          p_data: Json;
        };
        Returns: Json;
      };
      get_rekap_kehadiran_siswa: {
        Args: {
          p_kelas_id: string;
          p_mata_pelajaran?: string | null;
          p_bulan_mulai?: number;
          p_bulan_selesai?: number;
          p_tahun?: number;
        };
        Returns: RekapKehadiranSiswa[];
      };
      get_alert_kehadiran_siswa: {
        Args: {
          p_kelas_id?: string | null;
          p_mata_pelajaran?: string | null;
          p_bulan_mulai?: number;
          p_bulan_selesai?: number;
          p_tahun?: number;
        };
        Returns: AlertKehadiranSiswa[];
      };
    };
    Enums: {
      user_role: UserRole;
      presensi_status: PresensiStatus;
      perilaku_type: PerilakuType;
      penanganan_status: PenangananStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
