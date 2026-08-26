import React from 'react';
import { getTranslations } from 'next-intl/server';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import {
  Home,
  ShieldCheck,
  Map,
  MessagesSquare,
  Building2,
  Sparkles,
  Building,
  Key,
} from 'lucide-react';
import Link from 'next/link';

interface PageSectionData {
  id: string;
  sectionType: string;
  title?: string;
  order: number;
  isVisible?: boolean;
  isUnderMaintenance?: boolean;
  content: Record<string, any>;
}

// Загрузка публичных секций с API (мгновенное отображение изменений)
async function getPageSections(): Promise<PageSectionData[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
  try {
    const res = await fetch(`${apiUrl}/page-sections/public?pageKey=home`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Загрузка реальных объявлений из базы данных
async function getPopularListings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
  try {
    const res = await fetch(`${apiUrl}/listings?status=ACTIVE&sortBy=viewsCount&sortOrder=desc&limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');

  // Получаем секции из CMS конструктора
  const sections = await getPageSections();
  const [popularListings, newListings, platformStats] = await Promise.all([
    getPopularListings(),
    getNewListings(),
    getPlatformStats(),
  ]);

  // Фильтруем скрытые и находящиеся на обслуживании секции
  const activeSections = sections.length > 0
    ? sections.filter(section => section.isVisible !== false && !section.isUnderMaintenance)
    : [
        { id: '1', sectionType: 'HERO_SEARCH', order: 0, content: {} },
        { id: '2', sectionType: 'BENEFITS', order: 1, content: {} },
        { id: '3', sectionType: 'POPULAR_LISTINGS', order: 2, content: {} },
        { id: '4', sectionType: 'CTA_BANNER', order: 3, content: {} },
        { id: '5', sectionType: 'CATEGORIES', order: 4, content: {} },
      ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        {activeSections.map((section) => {
          // Мультиязычный контент: { ru, uz, en } или просто объект
          const content = (section.content?.[locale] && typeof section.content[locale] === 'object'
            ? section.content[locale]
            : section.content) as Record<string, any>;
          // ─── 1. HERO SEARCH SECTION ──────────────────────────────────────────
          if (section.sectionType === 'HERO_SEARCH') {
            const title = content.title || t('title');
            const subtitle = content.subtitle || t('subtitle');
            const showSearch = content.showSearch !== false;
            const searchPlaceholder = content.searchPlaceholder || t('searchPlaceholder');
            const quickFilters = content.quickFilters || [
              { label: 'Студии', href: `/${locale}/catalog?type_apartments=studio` },
              { label: '1-комнатные', href: `/${locale}/catalog?rooms=1` },
              { label: 'Дома и участки', href: `/${locale}/catalog?type=house` },
              { label: 'Возле метро', href: `/${locale}/catalog?near_metro=true` },
              { label: 'Без комиссии', href: `/${locale}/catalog?commission=false` },
            ];

            return (
              <div key={section.id} className="mb-20 mt-8 flex flex-col items-center text-center">
                <h1 className="mb-6 max-w-3xl text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white md:text-6xl">
                  {title}
                </h1>
                <p className="mb-10 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
                  {subtitle}
                </p>

                {showSearch && (
                  <div className="w-full max-w-3xl">
                    <SearchInput
                      locale={locale}
                      placeholder={searchPlaceholder}
                      className="h-14 w-full text-lg shadow-sm"
                    />

                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {quickFilters.map((item: any) => (
                        <Link
                          key={item.label}
                          href={item.href.startsWith('/') ? item.href : `/${locale}${item.href}`}
                          className="rounded-full bg-stone-200 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          // ─── 2. BENEFITS SECTION ─────────────────────────────────────────────
          if (section.sectionType === 'BENEFITS') {
            const items = Array.isArray(content.items) ? content.items : null;
            return (
              <div key={section.id} className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
                {items ? (
                  items.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center text-center rounded-2xl bg-white p-8 shadow-sm dark:bg-stone-900">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <ShieldCheck size={28} />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-white">{item.title}</h3>
                      <p className="text-stone-600 dark:text-stone-400">{item.text || item.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex flex-col items-center text-center rounded-2xl bg-white p-8 shadow-sm dark:bg-stone-900">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <ShieldCheck size={28} />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-white">{t('why1Title')}</h3>
                      <p className="text-stone-600 dark:text-stone-400">{t('why1Text')}</p>
                    </div>
                    <div className="flex flex-col items-center text-center rounded-2xl bg-white p-8 shadow-sm dark:bg-stone-900">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <Map size={28} />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-white">{t('why2Title')}</h3>
                      <p className="text-stone-600 dark:text-stone-400">{t('why2Text')}</p>
                    </div>
                    <div className="flex flex-col items-center text-center rounded-2xl bg-white p-8 shadow-sm dark:bg-stone-900">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        <MessagesSquare size={28} />
                      </div>
                      <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-white">{t('why3Title')}</h3>
                      <p className="text-stone-600 dark:text-stone-400">{t('why3Text')}</p>
                    </div>
                  </>
                )}
              </div>
            );
          }

          // ─── 3. POPULAR LISTINGS SECTION ──────────────────────────────────────
          if (section.sectionType === 'POPULAR_LISTINGS') {
            const sectionTitle = content.title || t('popularListings');
            const viewAllText = content.viewAllText || t('viewAll');

            return (
              <div key={section.id} className="mb-20">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-stone-900 dark:text-white">
                    {sectionTitle}
                  </h2>
                  <Link href={`/${locale}/catalog`} className="text-sm font-medium text-teal-600 hover:underline">
                    {viewAllText}
                  </Link>
                </div>

                {popularListings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
                    <Home size={36} className="mx-auto mb-3 text-stone-400" />
                    <p className="font-medium">Здесь появятся первые опубликованные объявления</p>
                    <Link href={`/${locale}/add-listing`} className="mt-4 inline-block text-sm text-teal-600 hover:underline font-semibold">
                      Разместить первое объявление →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {popularListings.map((listing: any) => (
                      <Link
                        key={listing.id}
                        href={`/${locale}/catalog/${listing.id}`}
                        className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md dark:bg-stone-900 flex flex-col"
                      >
                        <div className="h-56 bg-stone-200 dark:bg-stone-800 relative overflow-hidden">
                          {listing.images?.[0]?.url ? (
                            <img
                              src={listing.images[0]?.url?.startsWith('http') ? listing.images[0].url : `/api${listing.images[0]?.url}`}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Home size={40} />
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="mb-1 text-lg font-semibold text-stone-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                              {listing.title}
                            </h3>
                            <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                              {listing.city}{listing.district ? `, ${listing.district}` : ''}
                            </p>
                          </div>
                          <div>
                            <div className="mb-4 flex items-center gap-4 text-sm font-medium text-stone-600 dark:text-stone-400">
                              <span className="flex items-center gap-1.5">
                                <Home size={16} />
                                {listing.rooms} {t('rooms')}
                              </span>
                              <span>{listing.area} м²</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                              <span className="text-xl font-bold text-stone-900 dark:text-white">
                                {Number(listing.price).toLocaleString()} <span className="text-sm font-normal text-stone-500">сум / мес</span>
                              </span>
                              <Button variant="ghost" size="sm">
                                {t('details')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // ─── 4. CTA BANNER SECTION ───────────────────────────────────────────
          if (section.sectionType === 'CTA_BANNER') {
            const title = content.title || t('addListingTitle');
            const text = content.text || t('addListingText');
            const buttonText = content.buttonText || t('addListingButton');
            const buttonLink = content.buttonLink || `/${locale}/add-listing`;

            return (
              <div key={section.id} className="mb-20 rounded-3xl bg-teal-900 p-8 shadow-sm dark:bg-teal-950 sm:p-12">
                <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                      {title}
                    </h3>
                    <p className="text-teal-100 max-w-lg">
                      {text}
                    </p>
                  </div>
                  <Link href={buttonLink.startsWith('/') ? buttonLink : `/${locale}${buttonLink}`}>
                    <Button className="h-14 rounded-xl bg-teal-500 px-8 text-lg font-semibold text-white hover:bg-teal-400">
                      {buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          }

          // ─── 5. CATEGORIES SECTION ───────────────────────────────────────────
          if (section.sectionType === 'CATEGORIES') {
            const title = content.title || t('categoriesTitle');
            const categories = Array.isArray(content.categories) && content.categories.length > 0
              ? content.categories
              : [
                  { name: 'Посуточно', icon: Key, href: `/${locale}/catalog?rental_type=daily` },
                  { name: 'Новостройки', icon: Building2, href: `/${locale}/catalog?building_type=new` },
                  { name: 'Элитные', icon: Sparkles, href: `/${locale}/catalog?class=elite` },
                  { name: 'Для студентов', icon: Home, href: `/${locale}/catalog?for_whom=students` },
                  { name: 'Долгосрочно', icon: Building, href: `/${locale}/catalog?rental_type=long` },
                  { name: 'Студии', icon: Home, href: `/${locale}/catalog?type_apartments=studio` },
                ];

            return (
              <div key={section.id} className="mb-16">
                <h2 className="mb-8 text-3xl font-bold text-stone-900 dark:text-white">
                  {title}
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {categories.map((cat: any) => {
                    const name = typeof cat.name === 'object' ? cat.name[locale] || cat.name.ru || cat.name.uz || cat.name.en : (cat.name || cat.label);
                    const href = cat.href?.startsWith('/') ? cat.href : `/${locale}/${cat.href || 'catalog'}`;
                    const Icon = cat.icon || Building;
                    return (
                      <Link
                        key={name}
                        href={href}
                        className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white text-sm font-medium transition-colors hover:border-teal-600 hover:bg-teal-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-500 dark:hover:bg-teal-900/20"
                      >
                        {React.isValidElement(Icon) ? Icon : <Building size={24} className="text-stone-400 group-hover:text-teal-600" />}
                        <span className="text-stone-700 dark:text-stone-300 text-center text-xs sm:text-sm">{name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // ─── 6. NEW LISTINGS SECTION ─────────────────────────────────────────
          if (section.sectionType === 'NEW_LISTINGS') {
            const sectionTitle = content.title || t('newListings');
            const viewAllText = content.viewAllText || t('viewAll');
            
            return (
              <div key={section.id} className="mb-20">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-stone-900 dark:text-white">
                    {sectionTitle}
                  </h2>
                  <Link href={`/${locale}/catalog?sortBy=createdAt&sortOrder=desc`} className="text-sm font-medium text-teal-600 hover:underline">
                    {viewAllText}
                  </Link>
                </div>

                {newListings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
                    <Home size={36} className="mx-auto mb-3 text-stone-400" />
                    <p className="font-medium">Здесь появятся новые объявления</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {newListings.map((listing: any) => (
                      <Link
                        key={listing.id}
                        href={`/${locale}/catalog/${listing.id}`}
                        className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md dark:bg-stone-900 flex flex-col"
                      >
                        <div className="h-56 bg-stone-200 dark:bg-stone-800 relative overflow-hidden">
                          {listing.images?.[0]?.url ? (
                            <img
                              src={listing.images[0]?.url?.startsWith('http') ? listing.images[0].url : `/api${listing.images[0]?.url}`}
                              alt={listing.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Home size={40} />
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="mb-1 text-lg font-semibold text-stone-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                              {listing.title}
                            </h3>
                            <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                              {listing.city}{listing.district ? `, ${listing.district}` : ''}
                            </p>
                          </div>
                          <div>
                            <div className="mb-4 flex items-center gap-4 text-sm font-medium text-stone-600 dark:text-stone-400">
                              <span className="flex items-center gap-1.5">
                                <Home size={16} />
                                {listing.rooms} {t('rooms')}
                              </span>
                              <span>{listing.area} м²</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
                              <span className="text-xl font-bold text-stone-900 dark:text-white">
                                {Number(listing.price).toLocaleString()} <span className="text-sm font-normal text-stone-500">сум / мес</span>
                              </span>
                              <Button variant="ghost" size="sm">
                                {t('details')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // ─── 7. PLATFORM STATS SECTION ───────────────────────────────────────
          if (section.sectionType === 'PLATFORM_STATS') {
            const title = content.title || t('platformStats');
            return (
              <div key={section.id} className="mb-20 rounded-3xl bg-stone-100 p-8 shadow-sm dark:bg-stone-900 sm:p-12">
                <h2 className="mb-8 text-center text-3xl font-bold text-stone-900 dark:text-white">
                  {title}
                </h2>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-teal-600 dark:text-teal-400">
                      {platformStats.totalListings}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                      {t('totalListings')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-teal-600 dark:text-teal-400">
                      {platformStats.activeUsers}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                      {t('activeUsers')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-teal-600 dark:text-teal-400">
                      {platformStats.cities}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                      {t('cities')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-teal-600 dark:text-teal-400">
                      {platformStats.dailyViews}
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-400">
                      {t('dailyViews')}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // ─── 8. TEXT_BLOCK / CUSTOM_HTML ─────────────────────────────────────
          if (section.sectionType === 'TEXT_BLOCK' || section.sectionType === 'CUSTOM_HTML') {
            const title = content.title || section.title;
            const subtitle = content.subtitle;
            const text = content.text || content.content || '';

            return (
              <div key={section.id} className="mb-20 max-w-4xl mx-auto rounded-3xl bg-white dark:bg-stone-900 p-8 shadow-sm">
                {title && (
                  <h2 className="mb-3 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mb-6 text-base text-stone-500 dark:text-stone-400">
                    {subtitle}
                  </p>
                )}
                <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {text}
                </div>
              </div>
            );
          }

          // ─── 9. FAQ_ACCORDION ────────────────────────────────────────────────
          if (section.sectionType === 'FAQ_ACCORDION') {
            const title = content.title || section.title || 'Часто задаваемые вопросы';
            const items = Array.isArray(content.items) ? content.items : [];

            return (
              <div key={section.id} className="mb-20 max-w-3xl mx-auto">
                {title && (
                  <h2 className="mb-8 text-center text-3xl font-bold text-stone-900 dark:text-white">
                    {title}
                  </h2>
                )}
                <div className="space-y-4">
                  {items.map((item: any, idx: number) => (
                    <details
                      key={idx}
                      className="group rounded-2xl border border-stone-200/80 bg-white p-5 dark:border-white/5 dark:bg-stone-900 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-1.5 font-semibold text-stone-900 dark:text-white">
                        <span>{item.question}</span>
                        <span className="shrink-0 rounded-full bg-stone-100 p-1.5 text-stone-900 dark:bg-white/10 dark:text-white transition group-open:-rotate-180">
                          ↓
                        </span>
                      </summary>
                      <p className="mt-4 leading-relaxed text-sm text-stone-600 dark:text-stone-300">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </main>
    </div>
  );
}

// Загрузка новых объявлений
async function getNewListings() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
  try {
    const res = await fetch(`${apiUrl}/listings?status=ACTIVE&sortBy=createdAt&sortOrder=desc&limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data || [];
  } catch {
    return [];
  }
}

// Загрузка статистики платформы
async function getPlatformStats(): Promise<{ totalListings: number; activeUsers: number; cities: number; dailyViews: number }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
  try {
    const [listingsRes, usersRes, citiesRes, viewsRes] = await Promise.all([
      fetch(`${apiUrl}/listings?status=ACTIVE&limit=1`, { next: { revalidate: 300 } }),
      fetch(`${apiUrl}/admin/users?limit=1`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${apiUrl}/analytics/listings-by-city`, { next: { revalidate: 300 } }).catch(() => null),
      fetch(`${apiUrl}/analytics/traffic?period=1`, { next: { revalidate: 60 } }).catch(() => null),
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
    return {
      totalListings: 0,
      activeUsers: 0,
      cities: 0,
      dailyViews: 0,
    };
  }
}