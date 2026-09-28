import '@/app/globals.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'PWA Madrasah Terpadu',
  description: 'Portal PWA Madrasah Terpadu dengan autentikasi Supabase.',
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