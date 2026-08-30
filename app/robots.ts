// app/robots.ts
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ijarauz.uz';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/*/listings', '/*/about'],
        disallow: [
          '/api/*',
          '/admin/*',
          '/*/chat/*',
          '/*/profile/*',
          '/*/reset-password/*',
          '/*/checkout/*',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
