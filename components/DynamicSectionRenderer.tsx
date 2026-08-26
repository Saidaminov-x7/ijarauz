import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { ApartmentCard } from '@/app/[locale]/(main)/catalog/components/ApartmentCard';
import type {
  SectionType,
  HeroSearchContent,
  BenefitsContent,
  PopularListingsContent,
  CtaBannerContent,
  CategoriesContent,
  TextBlockContent,
  TeamMembersContent,
  FaqAccordionContent,
  ContactInfoContent,
  PlatformStatsContent,
} from '@/lib/sectionTypes';

export interface DynamicSectionData {
  id: string;
  sectionType: SectionType | string;
  title?: string;
  order: number;
  isVisible?: boolean;
  isUnderMaintenance?: boolean;
  layoutRow?: number;
  width?: number;
  content: Record<string, any>;
}

export interface PlatformStatsData {
  totalListings: number;
  activeUsers: number;
  cities: number;
  dailyViews: number;
}

export async function fetchDynamicPageSections(
  pageKey: string,
  locale: string = 'ru',
): Promise<DynamicSectionData[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
  try {
    const res = await fetch(
      `${apiUrl}/page-sections/public?pageKey=${encodeURIComponent(pageKey)}&locale=${locale}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// Безопасно достаёт lucide-иконку по имени строки, с фолбэком.
function DynamicIcon({ name, size = 24 }: { name?: string; size?: number }) {
  const Cmp = (name && (Icons as any)[name]) || Icons.Circle;
  return <Cmp size={size} />;
}

interface DynamicSectionRendererProps {
  sections: DynamicSectionData[];
  locale: string;
  popularApartments?: any[];
  platformStats?: PlatformStatsData;
}

export function DynamicSectionRenderer({
  sections,
  locale,
  popularApartments = [],
  platformStats,
}: DynamicSectionRendererProps) {
  const activeSections = (sections || [])
    .filter((s) => s.isVisible !== false && !s.isUnderMaintenance)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (activeSections.length === 0) return null;

  return (
    <div className="space-y-16">
      {activeSections.map((section) => {
        // Контент уже приходит развёрнутым под нужный locale с бэкенда (?locale=ru),
        // но на всякий случай поддерживаем и старый формат { ru: {...}, uz: {...} }.
        const content =
          (section.content?.[locale] && typeof section.content[locale] === 'object'
            ? section.content[locale]
            : section.content) || {};

        switch (section.sectionType as SectionType) {
          case 'HERO_SEARCH': {
            const c = content as HeroSearchContent;
            const title = c.title || section.title || 'Аренда жилья в Узбекистане';
            const subtitle = c.subtitle || 'Быстрый и удобный поиск квартир и комнат';
            const searchPlaceholder = c.searchPlaceholder || 'Район, метро, улица или город...';
            const quickFilters = c.quickFilters || [];
            return (
              <div key={section.id} className="my-10 flex flex-col items-center text-center">
                {c.badgeText && (
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    {c.badgeText}
                  </span>
                )}
                <h1 className="mb-6 max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-5xl md:text-6xl">
                  {title}
                </h1>
                <p className="mb-8 max-w-2xl text-base text-stone-600 dark:text-stone-300 sm:text-lg">
                  {subtitle}
                </p>
                {c.showSearch !== false && (
                  <div className="w-full max-w-3xl">
                    <SearchInput locale={locale} placeholder={searchPlaceholder} className="h-14 w-full text-base shadow-md" />
                    {quickFilters.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs text-stone-400">Быстрый поиск:</span>
                        {quickFilters.map((qf, idx) => (
                          <Link
                            key={idx}
                            href={qf.href.startsWith('/') ? `/${locale}${qf.href}` : `/${locale}/${qf.href}`}
                            className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10 whitespace-nowrap"
                          >
                            {qf.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          case 'BENEFITS': {
            const c = content as BenefitsContent;
            const title = c.title || section.title || 'Почему выбирают нас';
            const items = Array.isArray(c.items) ? c.items : [];
            return (
              <div key={section.id} className="py-6">
                {title && (
                  <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>
                )}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] shadow-sm"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                        <DynamicIcon name={item.icon} size={24} />
                      </div>
                      <h3 className="mb-2 text-base font-bold text-stone-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'POPULAR_LISTINGS': {
            const c = content as PopularListingsContent;
            const title = c.title || section.title || 'Популярные объявления';
            const viewAllText = c.viewAllText || 'Смотреть все';
            return (
              <div key={section.id} className="py-6">
                <div className="mb-8 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">{title}</h2>
                  <Link
                    href={`/${locale}/catalog`}
                    className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 whitespace-nowrap shrink-0"
                  >
                    {viewAllText} <Icons.ArrowRight size={16} />
                  </Link>
                </div>
                {popularApartments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-12 text-center text-stone-500 dark:text-stone-400">
                    <Icons.Home size={36} className="mx-auto mb-3 text-stone-400" />
                    <p className="font-medium">Здесь появятся первые опубликованные объявления</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {popularApartments.slice(0, c.limit || 6).map((apt) => (
                      <ApartmentCard key={apt.id} apartment={apt} locale={locale} />
                    ))}
                  </div>
                )}
              </div>
            );
          }

          case 'CTA_BANNER': {
            const c = content as CtaBannerContent;
            const title = c.title || section.title || 'Сдайте жильё быстро и безопасно';
            const text = c.text || 'Разместите объявление бесплатно за пару минут';
            const buttonText = c.buttonText || 'Разместить объявление';
            const buttonLink = c.buttonLink || '/add-listing';
            return (
              <div
                key={section.id}
                className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-700 via-teal-800 to-stone-900 p-8 sm:p-12 text-white shadow-xl"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="max-w-2xl text-center md:text-left">
                    <h2 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
                    <p className="mb-2 md:mb-0 text-sm sm:text-base text-teal-100">{text}</p>
                  </div>
                  <Button size="lg" className="bg-white text-teal-900 hover:bg-stone-100 font-semibold shrink-0" asChild>
                    <Link href={`/${locale}${buttonLink.startsWith('/') ? buttonLink : `/${buttonLink}`}`}>
                      {buttonText}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          }

          case 'CATEGORIES': {
            const c = content as CategoriesContent;
            const title = c.title || section.title || 'Популярные категории';
            const categories = Array.isArray(c.categories) ? c.categories : [];
            return (
              <div key={section.id} className="py-6">
                {title && (
                  <h2 className="mb-8 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl text-center">
                    {title}
                  </h2>
                )}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {categories.map((cat, idx) => (
                    <Link
                      key={idx}
                      href={`/${locale}${cat.href?.startsWith('/') ? cat.href : `/${cat.href || 'catalog'}`}`}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl border border-stone-200/80 bg-white hover:border-teal-500 hover:shadow-md transition-all dark:border-white/5 dark:bg-[#1E1E1E]"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                        <DynamicIcon name={cat.icon} size={22} />
                      </div>
                      <span className="text-xs font-bold text-stone-900 dark:text-white text-center truncate max-w-full">
                        {cat.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          case 'TEXT_BLOCK':
          case 'CUSTOM_HTML': {
            const c = content as TextBlockContent;
            const title = c.title || section.title;
            const align = c.align || 'left';
            return (
              <div key={section.id} className={`py-6 max-w-4xl mx-auto text-${align}`}>
                {title && (
                  <h2 className="mb-3 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">{title}</h2>
                )}
                {c.subtitle && <p className="mb-6 text-base text-stone-500 dark:text-stone-400">{c.subtitle}</p>}
                <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                  {c.text}
                </div>
              </div>
            );
          }

          case 'TEAM_MEMBERS': {
            const c = content as TeamMembersContent;
            const title = c.title || section.title || 'Наша команда';
            const members = Array.isArray(c.members) ? c.members : [];
            return (
              <div key={section.id} className="py-6">
                {title && (
                  <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E]"
                    >
                      {m.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photoUrl} alt={m.name} className="w-20 h-20 rounded-full object-cover mb-4" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4 text-2xl font-bold">
                          {m.name ? m.name[0] : 'U'}
                        </div>
                      )}
                      <h3 className="font-bold text-base text-stone-900 dark:text-white truncate max-w-full">{m.name}</h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 truncate max-w-full">{m.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'FAQ_ACCORDION': {
            const c = content as FaqAccordionContent;
            const title = c.title || section.title || 'Вопросы и ответы';
            const items = Array.isArray(c.items) ? c.items : [];
            return (
              <div key={section.id} className="py-6 max-w-3xl mx-auto">
                {title && (
                  <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>
                )}
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <details
                      key={idx}
                      className="group rounded-2xl border border-stone-200/80 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E1E] [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold text-stone-900 dark:text-white">
                        <span>{item.question}</span>
                        <span className="shrink-0 rounded-full bg-stone-100 p-1.5 text-stone-900 dark:bg-white/10 dark:text-white transition group-open:-rotate-180">
                          <Icons.ChevronDown size={16} />
                        </span>
                      </summary>
                      <p className="mt-4 leading-relaxed text-sm text-stone-600 dark:text-stone-300">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          }

          case 'CONTACT_INFO': {
            const c = content as ContactInfoContent;
            const title = c.title || section.title || 'Контакты';
            return (
              <div key={section.id} className="py-6 max-w-4xl mx-auto">
                {title && (
                  <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                    {title}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {c.email && (
                    <div className="p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] text-center">
                      <Icons.Mail className="mx-auto mb-3 text-teal-600 dark:text-teal-400" size={24} />
                      <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1">Email</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 break-all">{c.email}</p>
                    </div>
                  )}
                  {c.phone && (
                    <div className="p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] text-center">
                      <Icons.Phone className="mx-auto mb-3 text-teal-600 dark:text-teal-400" size={24} />
                      <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1">Телефон</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{c.phone}</p>
                    </div>
                  )}
                  {c.address && (
                    <div className="p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] text-center">
                      <Icons.MapPin className="mx-auto mb-3 text-teal-600 dark:text-teal-400" size={24} />
                      <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1">Адрес</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{c.address}</p>
                    </div>
                  )}
                </div>
                {(c.workingHours || c.socials?.telegram || c.socials?.instagram) && (
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                    {c.workingHours && (
                      <span className="flex items-center gap-1.5">
                        <Icons.Clock size={14} /> {c.workingHours}
                      </span>
                    )}
                    {c.socials?.telegram && (
                      <a href={c.socials.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-teal-600">
                        <DynamicIcon name="Send" size={14} /> Telegram
                      </a>
                    )}
                    {c.socials?.instagram && (
                      <a href={c.socials.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-teal-600">
                        <DynamicIcon name="Instagram" size={14} /> Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          }

          case 'PLATFORM_STATS': {
            const c = content as PlatformStatsContent;
            const title = c.title || section.title || 'Ijarauz в цифрах';
            const stats = platformStats || { totalListings: 0, activeUsers: 0, cities: 0, dailyViews: 0 };
            return (
              <div key={section.id} className="rounded-3xl bg-stone-100 p-8 shadow-sm dark:bg-stone-900 sm:p-12">
                <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                  {[
                    { value: stats.totalListings, label: 'Объявлений' },
                    { value: stats.activeUsers, label: 'Пользователей' },
                    { value: stats.cities, label: 'Городов' },
                    { value: stats.dailyViews, label: 'Просмотров в день' },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="mb-2 text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400">
                        {s.value.toLocaleString()}
                      </div>
                      <div className="text-sm text-stone-600 dark:text-stone-400">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
