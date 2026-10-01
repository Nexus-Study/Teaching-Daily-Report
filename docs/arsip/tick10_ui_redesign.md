# [TICK-10] REDESIGN UI DASHBOARD PORTAL & PERBAIKAN TAILWIND CSS

**Versi:** v1.0  
**Tujuan:** Memperbaiki integrasi Tailwind CSS dan membangun UI Dashboard Portal yang modern, mobile-first, dan interaktif pada rute `/portal/`.

---

### 1. Diagnosis & Perbaikan Styling Global

1. **Aturan Impor CSS Global (`app/layout.tsx`):**
   - Pastikan berkas `globals.css` diimpor di bagian paling atas `app/layout.tsx`:
     ```typescript
     import "@/app/globals.css";
     ```

2. **Konfigurasi Path Content Tailwind (`tailwind.config.ts` / `tailwind.config.js`):**
   - Pastikan array `content` mencakup seluruh berkas di folder `app` dan `components`:
     ```typescript
     content: [
       "./app/**/*.{js,ts,jsx,tsx,mdx}",
       "./components/**/*.{js,ts,jsx,tsx,mdx}",
     ]
     ```

3. **Directive Tailwind (`app/globals.css`):**
   - Pastikan directive Tailwind terdefinisi dengan benar (Tailwind v3 / v4):
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

---

### 2. Spesifikasi UI Mobile-First Dashboard (`app/portal/page.tsx`)

1. **Sticky Header & Profile Card:**
   - **Background:** Gradient lembut (`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900` atau `bg-slate-900 text-white`).
   - **User Info:** Avatar bundar dengan inisial nama (`w-12 h-12 rounded-full bg-indigo-600 text-white font-bold`).
   - **Text:** Nama Pengguna (font-bold text-lg), NIP/NISN (`text-xs text-slate-300`).
   - **Role Badges:** Tag pill terpisah per role (`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-400/30`).
   - **Action:** Tombol Logout berbentuk icon button / pill (`bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl px-3 py-1.5 text-xs`).

2. **Grid Menu Navigasi Berbasis Role:**
   - **Layout Grid:** 2 Kolom pada perangkat mobile, 3–4 Kolom pada tablet/desktop (`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4`).
   - **Card Design:**
     - Border halus (`border border-slate-200 dark:border-slate-800`).
     - Sudut membulat modern (`rounded-2xl`).
     - Background netral dengan bayangan lembut (`bg-white dark:bg-slate-900 shadow-sm hover:shadow-md`).
     - Efek sentuh mobile (`active:scale-95 transition-transform duration-150`).
   - **Icon Containers:**
     - Ikons berwarna kontras dengan latar belakang soft-tint:
       - Jurnal Harian: Icon `BookOpen` dengan bg `bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400`.
       - Catatan Perilaku: Icon `ShieldAlert` / `UserCheck` dengan bg `bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400`.
       - Rekap & Laporan: Icon `BarChart3` / `GraduationCap` dengan bg `bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400`.
       - Profil Saya: Icon `User` dengan bg `bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`.