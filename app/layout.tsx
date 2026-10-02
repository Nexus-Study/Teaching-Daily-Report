import '@/app/globals.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Portal Perkembangan Murid',
  description: 'Portal PWA Madrasah Terpadu untuk melacak perkembangan siswa.',
};

export const viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}