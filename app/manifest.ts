// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ijarauz — Аренда жилья в Узбекистане',
    short_name: 'Ijarauz',
    description: 'Национальная платформа долгосрочной и посуточной аренды квартир, домов и комнат в Ташкенте и регионах Узбекистана.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#14b8a6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
