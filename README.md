PWA Madrasah Terpadu (Monolith Modular)

Sistem Informasi Manajemen Madrasah Terpadu berbasis Progressive Web App (PWA) dengan pendekatan Mobile-First Dynamic Grid Navigation untuk pencatatan harian guru, presensi, catatan perilaku kolaboratif, dan manajemen data master.

🚀 Stack Teknologi

Frontend Framework: Next.js (App Router, TypeScript)

Styling & UI: Tailwind CSS + Lucide Icons

PWA Engine: @ducanh2912/next-pwa

Backend & Database: Supabase (PostgreSQL, Supabase Auth SSO, Row Level Security / RLS)

Deployment Platform: Vercel

👥 Multi-Role Support (9 Role)

Sistem ini mendukung 9 tingkatan peran yang terikat pada skema profiles.roles (Array user_role[]):

Admin (Manajemen Pengguna & Bulk Import Data Master)

Kamad (Kepala Madrasah / Executive Review)

Waka Kesiswaan (Manajemen Perilaku & Penanganan Tier 4)

Waka Kurikulum (Pengawasan Akademik & Jurnal)

Guru BK (Penanganan Perilaku & Bimbingan Konseling)

Guru Mapel (Input Jurnal Mengajar & Presensi Ringkas)

Guru Tahfidz (Setoran Hafalan)

Wali Kelas (Pengawasan Kelas Bimbingan)

Siswa (Akses Informasi Personal)

🔑 Konfigurasi Environment Variables

Buat berkas .env.local di direktori utama proyek dengan variabel berikut:

NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key


🛠️ Langkah Instalasi Lokal

Clone Repositori:

git clone https://github.com/username/repository-name.git
cd repository-name


Install Dependensi:

npm install


Jalankan Environment Pengembang:

npm run dev


Buka http://localhost:3000 pada browser Anda.

Build Uji Produksi:

npm run build


📦 Prosedur Deployment Vercel

Push Kode ke GitHub:

git add .
git commit -m "[RELEASE-01] Initial Release with Complete Sprint 1-3"
git push origin main


Hubungkan Repositori ke Vercel:

Masuk ke Dashboard Vercel -> Add New Project.

Import repositori GitHub ini.

Isi Environment Variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY).

Klik Deploy.