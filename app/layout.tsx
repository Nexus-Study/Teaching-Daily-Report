import '@/app/globals.css';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Portal Perkembangan Murid',
  description: 'Portal PWA Madrasah Terpadu untuk melacak perkembangan siswa.',
};

export const viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:not-sr-only focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
        >
          Lewati ke konten utama
        </a>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}