import createNextIntlPlugin from 'next-intl/plugin';

// Указываем путь к файлу конфигурации (если он лежит в корне как i18n.ts)
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ijara.uz',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.google.com https://www.gstatic.com https://cdn.jsdelivr.net https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://accounts.google.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.firebasestorage.app https://*.tile.openstreetmap.org https://tile.openstreetmap.org " + (process.env.NEXT_PUBLIC_API_URL || '') + " https://api.cloudflare.com; frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://challenges.cloudflare.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;" + (process.env.CSP_REPORT_URI ? " report-uri " + process.env.CSP_REPORT_URI + ";" : '')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Expect-CT',
            value: 'max-age=86400, enforce',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

// Обязательно оборачиваем конфигурацию в withNextIntl
export default withNextIntl(nextConfig);