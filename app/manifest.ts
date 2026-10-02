import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PWA Madrasah Terpadu',
    short_name: 'Madrasah App',
    start_url: '/portal/',
    scope: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0284c7',
    lang: 'id',
    icons: [
      {
        src: '/icon.png',
        sizes: '246x246',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192-maskable.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-512-maskable.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}