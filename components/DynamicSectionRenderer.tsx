import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Search,
  Building,
  Key,
  Users,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { ApartmentCard } from '@/app/[locale]/(main)/catalog/components/ApartmentCard';

export interface DynamicSectionData {
  id: string;
  sectionType: string;
  title?: string;
  order: number;
  isVisible?: boolean;
  isUnderMaintenance?: boolean;
  layoutRow?: number;
  width?: number;
  content: Record<string, any>;
}

export async function fetchDynamicPageSections(pageKey: string): Promise<DynamicSectionData[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-ed76.up.railway.app';
  try {
    const res = await fetch(`${apiUrl}/page-sections/public?pageKey=${encodeURIComponent(pageKey)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

interface DynamicSectionRendererProps {
  sections: DynamicSectionData[];
  locale: string;
  popularApartments?: any[];
}

export function DynamicSectionRenderer({ sections, locale, popularApartments = [] }: DynamicSectionRendererProps) {
  const activeSections = (sections || []).filter((s) => s.isVisible !== false && !s.isUnderMaintenance);

  if (!activeSections || activeSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16">
      {activeSections.map((section) => {
        const content = (section.content?.[locale] && typeof section.content[locale] === 'object'
          ? section.content[locale]
          : section.content) || {};

        // 1. HERO_SEARCH
        if (section.sectionType === 'HERO_SEARCH') {
          const title = content.title || section.title || 'Аренда жилья в Узбекистане';
          const subtitle = content.subtitle || 'Быстрый и удобный поиск квартир и комнат';
          const searchPlaceholder = content.searchPlaceholder || 'Район, метро, улица или город...';
          const quickFilters = content.quickFilters || [
            { label: 'Студии', href: `/${locale}/catalog?type_apartments=studio` },
            { label: '1-комнатные', href: `/${locale}/catalog?rooms=1` },
          ];

          return (
            <div key={section.id} className="my-10 flex flex-col items-center text-center">
              <h1 className="mb-6 max-w-3xl text-4xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="mb-8 max-w-2xl text-base text-stone-600 dark:text-stone-300 sm:text-lg">
                {subtitle}
              </p>
              <div className="w-full max-w-3xl">
                <SearchInput locale={locale} placeholder={searchPlaceholder} className="h-14 w-full text-base shadow-md" />
                {quickFilters.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs text-stone-400">Быстрый поиск:</span>
                    {quickFilters.map((qf: any, idx: number) => (
                      <Link
                        key={idx}
                        href={qf.href}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
                      >
                        {qf.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // 2. BENEFITS
        if (section.sectionType === 'BENEFITS') {
          const title = content.title || section.title || 'Почему выбирают нас';
          const items = Array.isArray(content.items) ? content.items : [];

          return (
            <div key={section.id} className="py-6">
              {title && (
                <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] shadow-sm"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                      <ShieldCheck size={24} />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-stone-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 3. POPULAR_LISTINGS
        if (section.sectionType === 'POPULAR_LISTINGS') {
          const title = content.title || section.title || 'Популярные объявления';
          const viewAllText = content.viewAllText || 'Смотреть все';

          return (
            <div key={section.id} className="py-6">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
                <Link
                  href={`/${locale}/catalog`}
                  className="flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                >
                  {viewAllText} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {popularApartments.slice(0, content.limit || 6).map((apt) => (
                  <ApartmentCard key={apt.id} apartment={apt} locale={locale} />
                ))}
              </div>
            </div>
          );
        }

        // 4. CTA_BANNER
        if (section.sectionType === 'CTA_BANNER') {
          const title = content.title || section.title || 'Сдайте жилье быстро и безопасно';
          const text = content.text || 'Разместите объявление бесплатно за пару минут';
          const buttonText = content.buttonText || 'Разместить объявление';
          const buttonLink = content.buttonLink || '/add-listing';

          return (
            <div
              key={section.id}
              className="relative overflow-hidden rounded-3xl bg-linear-to-r from-teal-700 via-teal-800 to-stone-900 p-8 sm:p-12 text-white shadow-xl"
            >
              <div className="relative z-10 max-w-2xl">
                <h2 className="mb-4 text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                  {title}
                </h2>
                <p className="mb-8 text-sm sm:text-base text-teal-100">
                  {text}
                </p>
                <Button size="lg" className="bg-white text-teal-900 hover:bg-stone-100 font-semibold" asChild>
                  <Link href={`/${locale}${buttonLink.startsWith('/') ? buttonLink : `/${buttonLink}`}`}>
                    {buttonText}
                  </Link>
                </Button>
              </div>
            </div>
          );
        }

        // 5. CATEGORIES
        if (section.sectionType === 'CATEGORIES') {
          const title = content.title || section.title || 'Популярные категории';
          const categories = Array.isArray(content.categories) ? content.categories : [];

          return (
            <div key={section.id} className="py-6">
              {title && (
                <h2 className="mb-8 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
              )}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map((cat: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/${locale}${cat.href?.startsWith('/') ? cat.href : `/${cat.href || 'catalog'}`}`}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border border-stone-200/80 bg-white hover:border-teal-500 hover:shadow-md transition-all dark:border-white/5 dark:bg-[#1E1E1E]"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                      <Building size={24} />
                    </div>
                    <span className="text-sm font-bold text-stone-900 dark:text-white text-center">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        // 6. TEXT_BLOCK / CUSTOM_HTML
        if (section.sectionType === 'TEXT_BLOCK' || section.sectionType === 'CUSTOM_HTML') {
          const title = content.title || section.title;
          const subtitle = content.subtitle;
          const text = content.text || content.content || '';

          return (
            <div key={section.id} className="py-6 max-w-4xl mx-auto">
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

        // 7. TEAM_MEMBERS
        if (section.sectionType === 'TEAM_MEMBERS') {
          const title = content.title || section.title || 'Наша команда';
          const members = Array.isArray(content.members) ? content.members : [];

          return (
            <div key={section.id} className="py-6">
              {title && (
                <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E]"
                  >
                    <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center mb-4 text-2xl font-bold">
                      {m.name ? m.name[0] : 'U'}
                    </div>
                    <h3 className="font-bold text-base text-stone-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">{m.role}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 8. FAQ_ACCORDION
        if (section.sectionType === 'FAQ_ACCORDION') {
          const title = content.title || section.title || 'Вопросы и ответы';
          const items = Array.isArray(content.items) ? content.items : [];

          return (
            <div key={section.id} className="py-6 max-w-3xl mx-auto">
              {title && (
                <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
              )}
              <div className="space-y-4">
                {items.map((item: any, idx: number) => (
                  <details
                    key={idx}
                    className="group rounded-2xl border border-stone-200/80 bg-white p-5 dark:border-white/5 dark:bg-[#1E1E1E] [&_summary::-webkit-details-marker]:hidden"
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

        // 9. CONTACT_INFO
        if (section.sectionType === 'CONTACT_INFO') {
          const title = content.title || section.title || 'Контакты';

          return (
            <div key={section.id} className="py-6 max-w-4xl mx-auto">
              {title && (
                <h2 className="mb-8 text-center text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                  {title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.email && (
                  <div className="p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] text-center">
                    <Mail className="mx-auto mb-3 text-teal-600 dark:text-teal-400" size={24} />
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1">Email</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{content.email}</p>
                  </div>
                )}
                {content.phone && (
                  <div className="p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] text-center">
                    <Phone className="mx-auto mb-3 text-teal-600 dark:text-teal-400" size={24} />
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1">Телефон</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{content.phone}</p>
                  </div>
                )}
                {content.address && (
                  <div className="p-6 rounded-2xl border border-stone-200/80 bg-white dark:border-white/5 dark:bg-[#1E1E1E] text-center">
                    <MapPin className="mx-auto mb-3 text-teal-600 dark:text-teal-400" size={24} />
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm mb-1">Адрес</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{content.address}</p>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
