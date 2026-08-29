import React from 'react';
import {
  DynamicSectionRenderer,
  fetchDynamicPageSections,
  type PlatformStatsData,
} from '@/components/DynamicSectionRenderer';
import { externalBaseURL } from '@/lib/axios';

const API_URL = externalBaseURL;

async function getPopularListings() {
  try {
    const res = await fetch(`${API_URL}/listings?status=ACTIVE&sortBy=viewsCount&sortOrder=desc&limit=9`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

async function getPlatformStats(): Promise<PlatformStatsData> {
  try {
    const [listingsRes, usersRes, citiesRes, viewsRes] = await Promise.all([
      fetch(`${API_URL}/listings?status=ACTIVE&limit=1`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/admin/users?limit=1`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_URL}/analytics/listings-by-city`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${API_URL}/analytics/traffic?period=1`, { next: { revalidate: 60 } }).catch(() => null),
    ]);
    const listingsData = listingsRes.ok ? await listingsRes.json() : { total: 0 };
    const usersData = usersRes?.ok ? await usersRes.json() : { total: 0 };
    const citiesData = citiesRes?.ok ? await citiesRes.json() : [];
    const viewsData = viewsRes?.ok ? await viewsRes.json() : { totalViews: 0 };
    return {
      totalListings: listingsData.total || listingsData.items?.length || 0,
      activeUsers: usersData.total || usersData.items?.length || 0,
      cities: citiesData.length || 0,
      dailyViews: viewsData.totalViews || 0,
    };
  } catch {
    return { totalListings: 0, activeUsers: 0, cities: 0, dailyViews: 0 };
  }
}

// Дефолтный набор секций для главной, если в БД ещё нет ни одной секции для pageKey=home.
// Пустой content — DynamicSectionRenderer сам подставит SECTION_DEFAULTS.
const FALLBACK_HOME_SECTIONS = [
  { id: 'fallback-1', sectionType: 'HERO_SEARCH', order: 0, content: {} },
  { id: 'fallback-2', sectionType: 'BENEFITS', order: 1, content: {} },
  { id: 'fallback-3', sectionType: 'POPULAR_LISTINGS', order: 2, content: {} },
  { id: 'fallback-4', sectionType: 'CTA_BANNER', order: 3, content: {} },
  { id: 'fallback-5', sectionType: 'CATEGORIES', order: 4, content: {} },
  { id: 'fallback-6', sectionType: 'PLATFORM_STATS', order: 5, content: {} },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [sections, popularListings, platformStats] = await Promise.all([
    fetchDynamicPageSections('home', locale),
    getPopularListings(),
    getPlatformStats(),
  ]);

  const activeSections = sections.length > 0 ? sections : FALLBACK_HOME_SECTIONS;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <DynamicSectionRenderer
          sections={activeSections as any}
          locale={locale}
          popularApartments={popularListings}
          platformStats={platformStats}
        />
      </main>
    </div>
  );
}