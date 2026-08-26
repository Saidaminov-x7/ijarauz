// /workspace/ijarauz/app/[locale]/api/page-routes/route.ts
// API endpoint для предоставления списка всех маршрутов сайта админ-панели

import { NextResponse } from 'next/server';

// Список всех известных маршрутов сайта
// Этот список можно расширять по мере добавления новых страниц
const PAGE_ROUTES = [
  '/',
  '/catalog',
  '/favorites',
  '/profile',
  '/chat',
  '/add-listing',
  '/about',
  '/privacy',
  '/terms',
  '/maintenance',
];

export async function GET() {
  try {
    return NextResponse.json(PAGE_ROUTES);
  } catch (error) {
    console.error('Error fetching page routes:', error);
    return NextResponse.json({ error: 'Failed to fetch page routes' }, { status: 500 });
  }
}
