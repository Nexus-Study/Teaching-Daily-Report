[GAP-EXPLORATION-01] 
Sebelum menyusun arsitektur komponen dan instruksi prompt eksekusi, terdapat beberapa kesenjangan konteks teknis yang perlu diklarifikasi:
Cakupan Layout (Scope): Apakah sidebar ini hanya diterapkan khusus pada halaman dashboard utama (/portal/page.tsx), atau akan dijadikan Parent Layout (/portal/layout.tsx) agar otomatis muncul di seluruh sub-halaman portal (seperti /portal/jurnal, /portal/perilaku, dll.)?Jawab: Jadikan parent layout 
Item Navigasi Sidebar: Apakah isi menu navigasi pada sidebar mengambil daftar portalMenus yang sudah difilter berdasarkan peran pengguna (visibleMenus), atau ada struktur menu/header terpisah? ya, ambil daftar portalMenus yang sudah difilter berdasarkan peran pengguna
Strategi Responsif Mobile: Ketika diakses dari perangkat mobile/tablet (layar kecil), apakah tampilan utama tetap menggunakan header sticky dan grid menu seperti yang ada pada berkas page.tsx saat ini, atau membutuhkan navigasi bawah (bottom navigation) / hamburger menu? jawab: jawab: tetap gunakan tampilan utama  
Perilaku Interaksi (State): Apakah sidebar desktop bersifat statis (lebar tetap/fixed), atau membutuhkan fitur collapse/expand (yang memerlukan pendaftaran 'use client' pada komponen sidebar tersebut)? jawab: gunaka fitur collapse/expand

[GAP-EXPLORATION-02] 
Berdasarkan analisis struktur direktori app/portal/ yang belum memiliki berkas layout.tsx khusus, berikut penyesuaian inventarisasi kesenjangan konteks teknis:   
Arsitektur Layout Nested (app/portal/layout.tsx): Di dalam direktori app/portal/ saat ini hanya terdapat page.tsx dan sub-folder fitur. Apakah implementasi sidebar desktop disepakati dibuatkan file baru app/portal/layout.tsx agar otomatis berlaku membungkus seluruh sub-halaman (admin, jurnal, laporan, perilaku, rekap-kehadiran)?   ya, buatkan file app/portal/layout.tsx
Restrukturisasi Komponen Profil & Logout: Pada app/portal/page.tsx, informasi profil pengguna dan tombol Logout saat ini berada di dalam header utama. Apakah untuk versi desktop, komponen profil dan tombol Logout ini akan dipindahkan ke dalam sidebar, atau header di halaman utama tetap dipertahankan?   tetap gunakan pertahankan di header utama.
Spesifikasi Breakpoint Tailwind: Berapa batas minimum ukuran layar untuk menampilkan sidebar desktop? gunakan lg
Indikator Rute Aktif (Active Route Highlight): Apakah item menu pada sidebar membutuhkan penanda visual aktif sesuai rute yang sedang diakses pengguna (menggunakan hook usePathname dari Next.js)? ya

---
iterasi:
kembali ke 
[GAP-EXPLORATION-01]:
Strategi Responsif Mobile: Ketika diakses dari perangkat mobile/tablet (layar kecil), apakah tampilan utama tetap menggunakan header sticky dan grid menu seperti yang ada pada berkas page.tsx saat ini, atau membutuhkan navigasi bawah (bottom navigation) / hamburger menu? 
ANALISIS: 
Pilihan awal untuk mempertahankan grid menu, karena dua pertimbangan. Role tertentu memiliki banyak peran (seperti pada image_220772.png). Penggunaan bottom navigation akan sepertinya tidak dapat menampilkan semua menu. image_220b58.png memperlihatkan UI salah satu menu aplikasi. Penggunaan hamburgermenu dikhawatirkan akan membuat icon hamburger menu menutupi bagian atas UI, khususnya di bila diletakkan di bagian kiri atas. 

[GAP-EXPLORATION-02]
Restrukturisasi Komponen Profil & Logout: Pada app/portal/page.tsx, informasi profil pengguna dan tombol Logout saat ini berada di dalam header utama. Apakah untuk versi desktop, komponen profil dan tombol Logout ini akan dipindahkan ke dalam sidebar, atau header di halaman utama tetap dipertahankan? Pilihan awal untuk mempertahankan  

/disc berikan alternatif solusi


---
