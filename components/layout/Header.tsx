'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  Search, X, Heart, ChevronRight, LogIn, UserPlus, Menu, ArrowLeft, User, MessageSquare, Sparkles, Scale,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getSearchSuggestions } from '@/lib/data';

const LOCALES = [
  { code: 'ru', short: 'RU' },
  { code: 'uz', short: 'UZ' },
  { code: 'en', short: 'EN' },
] as const;

const BTN_CLASS =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ' +
  'border-stone-200 bg-white text-stone-600 transition-all duration-200 ' +
  'hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 ' +
  'dark:border-white/10 dark:bg-stone-900 dark:text-stone-300 ' +
  'dark:hover:border-white/20 dark:hover:bg-stone-800 dark:hover:text-white ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50';

function localeHref(pathname: string, code: string, search: string) {
  const rest = pathname.replace(/^\/(ru|uz|en)(?=\/|$)/, '') || '/';
  const path = `/${code}${rest === '/' ? '' : rest}`;
  return search ? `${path}?${search}` : path;
}

function LanguagePicker() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  const search = searchParams.toString();

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleToggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 150);
    }
    setOpen((v) => !v);
  };

  const handleSelectLocale = (code: string) => {
    setOpen(false);
    const targetUrl = localeHref(pathname, code, search);
    router.push(targetUrl, { scroll: false });
  };

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        className={BTN_CLASS + ' gap-1 !w-auto px-3 text-sm font-semibold ' + (open ? '!border-teal-500 !text-teal-600 dark:!text-teal-400' : '')}
      >
        {current.short}
      </button>
      <div
        className={
          'absolute right-0 z-50 w-28 overflow-hidden rounded-xl border border-stone-200/80 bg-white py-1 shadow-lg ' +
          'dark:border-white/10 dark:bg-stone-900 ' +
          'transition-all duration-200 ' +
          (openUpward ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right') + ' ' +
          (open ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0')
        }
      >
        {LOCALES.map(({ code, short }) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleSelectLocale(code)}
              className={
                'flex w-full items-center px-3 py-2 text-xs font-medium transition-colors text-left ' +
                (active
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
                  : 'text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-white/5')
              }
            >
              {short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Header({ locale: localeProp }: { locale?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() || localeProp || 'ru';
  const t = useTranslations('nav');
  const { data: settings } = useSiteSettings();

  const navLinks = [
    { href: '/catalog', key: 'catalog' as const },
    { href: '/add-listing', key: 'addListing' as const },
    { href: '/chat', key: 'chat' as const },
    { href: '/about', key: 'about' as const },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ReturnType<typeof getSearchSuggestions>>([]);
  const [mobileSuggestions, setMobileSuggestions] = useState<ReturnType<typeof getSearchSuggestions>>([]);
  const [scrolled, setScrolled] = useState(false);

  const favCount = useFavoritesStore((s) => s.ids.length);
  const compareCount = useCompareStore((s) => s.ids.length);
  const { user, isAuthenticated } = useAuthStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const to = (p: string) => (p === '/' ? `/${locale}` : `/${locale}${p}`);
  const isActive = (p: string) => pathname === to(p) || (p !== '/' && pathname.startsWith(to(p)));

  const handleQuery = (val: string) => {
    setQuery(val);
    setSuggestions(getSearchSuggestions(val));
  };

  const handleMobileQuery = (val: string) => {
    setQuery(val);
    setMobileSuggestions(getSearchSuggestions(val));
  };

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/${locale}/catalog?q=${encodeURIComponent(q.trim())}`);
  };

  const navTo = (href: string) => {
    setSearchOpen(false);
    setMobileOpen(false);
    setQuery('');
    router.push(`/${locale}${href}`);
  };

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(
    (r) => pathname === `/${locale}${r}` || pathname.startsWith(`/${locale}${r}/`)
  );

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 dark:border-white/10 dark:bg-[#1A1A1A]/95 h-20 flex items-center">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={to('/')}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-white/10 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 shadow-xs"
          >
            <ArrowLeft size={15} />
            <span>Вернуться домой</span>
          </Link>

          <Link
            href={to('/')}
            className="flex items-center gap-1.5 text-sm text-stone-400 hover:opacity-80 transition-opacity"
          >
            <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
            <span className="text-teal-400 font-semibold tracking-tight">ijara.uz</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={
          'sticky top-0 z-40 w-full border-b transition-all duration-300 h-20 flex items-center ' +
          (scrolled
            ? 'border-stone-200/80 bg-white/95 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-[#1A1A1A]/95'
            : 'border-transparent bg-white/90 dark:bg-[#1A1A1A]/90')
        }
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          {/* Left: Logo & Nav */}
          <div className="flex items-center gap-8">
            <Link
              href={to('/')}
              className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
            >
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName || "Ijarauz"}
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logotip.png';
                  }}
                />
              ) : (
                <img
                  src="/logotip.png"
                  alt="Ijarauz"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              )}
            </Link>

            <nav
              className={
                'hidden items-center gap-1.5 overflow-hidden transition-all duration-300 ease-out md:flex ' +
                (searchOpen ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-xl opacity-100')
              }
            >
              {Array.isArray(settings?.navLinks) && settings.navLinks.length > 0 ? (
                settings.navLinks.map((item: any, idx: number) => {
                  const label = typeof item.label === 'object' ? item.label[locale] || item.label.ru || item.label.uz || item.label.en : item.label;
                  const href = item.url || item.href || '/';
                  return (
                    <Link
                      key={idx}
                      href={href.startsWith('http') ? href : to(href)}
                      className={
                        'whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-250 ' +
                        (isActive(href)
                          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white')
                      }
                    >
                      {label}
                    </Link>
                  );
                })
              ) : (
                navLinks.map(({ href, key }) => (
                  <Link
                    key={href}
                    href={to(href)}
                    className={
                      'whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-250 ' +
                      (isActive(href)
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-white/5 dark:hover:text-white')
                    }
                  >
                    {t(key)}
                  </Link>
                ))
              )}
            </nav>
          </div>

          {/* Right Desktop items */}
          <div className="hidden items-center gap-2 md:flex">
            <div ref={searchRef} className="relative flex items-center">
              {searchOpen ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); doSearch(query); }}
                  className="relative flex items-center animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
                    <Search size={16} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="h-10 w-72 rounded-xl border border-stone-300 bg-stone-50 pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setQuery(''); setSuggestions([]); }}
                    className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X size={14} />
                  </button>
                  {suggestions.length > 0 && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-850 dark:bg-stone-900">
                      {suggestions.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => navTo(item.href)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors"
                        >
                          <span className="text-sm">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-stone-900 dark:text-stone-100">{item.text}</p>
                            <p className="truncate text-[11px] text-stone-500">{item.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button type="button" onClick={() => setSearchOpen(true)} aria-label={t('search')} className={BTN_CLASS}>
                  <Search size={17} />
                </button>
              )}
            </div>

            <Link href={to('/favorites')} aria-label={t('favorites')} className={`${BTN_CLASS} relative`}>
              <Heart size={17} />
              {favCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white shadow">
                  {favCount}
                </span>
              )}
            </Link>

            <Link href={to('/compare')} aria-label="Сравнение" title="Сравнение объектов" className={`${BTN_CLASS} relative`}>
              <Scale size={17} />
              {compareCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white shadow">
                  {compareCount}
                </span>
              )}
            </Link>

            <LanguagePicker />
            <ThemeToggle />

            <div className="mx-1.5 h-6 w-px bg-stone-200 dark:bg-white/10" />

            {isAuthenticated ? (
              <Link
                href={to('/profile')}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-50 px-3.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:bg-teal-950/50 dark:text-teal-300 dark:hover:bg-teal-900/50"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">{user?.name || 'Профиль'}</span>
              </Link>
            ) : (
              <>
                <Link
                  href={to('/login')}
                  className="border border-stone-200 dark:border-white/10 inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  {t('login')}
                </Link>
                <Link
                  href={to('/register')}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile & Tablet Right items */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Кнопка поиска: скрыта на телефонах, видна на планшетах (hidden sm:flex) */}
            <div ref={searchRef} className="relative flex items-center">
              {searchOpen ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); doSearch(query); }}
                  className="relative flex items-center animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
                    <Search size={16} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="h-10 w-52 sm:w-60 rounded-xl border border-stone-200 bg-white py-0 pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 shadow-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-white/10 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  >
                    <X size={15} />
                  </button>
                  {suggestions.length > 0 && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-52 sm:w-60 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-800 dark:bg-stone-900">
                      {suggestions.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => navTo(item.href)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-stone-50 dark:hover:bg-stone-850"
                        >
                          <span>{item.icon}</span>
                          <span className="truncate text-stone-800 dark:text-stone-200">{item.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label={t('search')}
                  className={`${BTN_CLASS} hidden sm:flex`}
                >
                  <Search size={17} />
                </button>
              )}
            </div>

            {/* Избранное */}
            <Link
              href={to('/favorites')}
              aria-label={t('favorites')}
              className={`${BTN_CLASS} relative`}
            >
              <Heart size={17} />
              {favCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Бургер */}
            <button
              type="button"
              aria-label={t('menu')}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className={BTN_CLASS}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer с премиальной плавной анимацией */}
      <div
        onClick={() => setMobileOpen(false)}
        className={
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ' +
          (mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')
        }
      />

      <div
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={
          'fixed left-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-400 dark:bg-[#1A1A1A] md:hidden ' +
          (mobileOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-stone-200 px-5 dark:border-white/10">
          <Link href={to('/')} onClick={() => setMobileOpen(false)} className="flex items-center text-xl font-black text-stone-900 dark:text-white">
            <span>ija</span><span className="text-teal-600 dark:text-teal-400">rauz</span>
          </Link>
          <button type="button" aria-label={t('close')} onClick={() => setMobileOpen(false)} className={BTN_CLASS}>
            <X size={18} />
          </button>
        </div>

        {/* Поиск внутри бургера ТОЛЬКО для мобильной версии (скрыт на планшетах через block sm:hidden) */}
        <div className="block sm:hidden border-b border-stone-200 p-4 dark:border-white/10">
          <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-stone-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleMobileQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-8 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-teal-500 focus:bg-white dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setMobileSuggestions([]); }}
                className="absolute right-3 text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}
          </form>
          {mobileSuggestions.length > 0 && (
            <div className="mt-1.5 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-md dark:border-stone-700 dark:bg-stone-800">
              {mobileSuggestions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => navTo(item.href)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-stone-50 dark:hover:bg-stone-750"
                >
                  <span>{item.icon}</span>
                  <span className="truncate text-stone-800 dark:text-stone-200">{item.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Навигационные ссылки */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {Array.isArray(settings?.navLinks) && settings.navLinks.length > 0 ? (
            settings.navLinks.map((item: any, idx: number) => {
              const label = typeof item.label === 'object' ? item.label[locale] || item.label.ru || item.label.uz || item.label.en : item.label;
              const href = item.url || item.href || '/';
              return (
                <Link
                  key={idx}
                  href={href.startsWith('http') ? href : to(href)}
                  onClick={() => setMobileOpen(false)}
                  className={
                    'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ' +
                    (isActive(href)
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-semibold'
                      : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/5')
                  }
                >
                  <span>{label}</span>
                  <ChevronRight size={15} className="text-stone-400 opacity-50" />
                </Link>
              );
            })
          ) : (
            navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={to(href)}
                onClick={() => setMobileOpen(false)}
                className={
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ' +
                  (isActive(href)
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/5')
                }
              >
                <span>{t(key)}</span>
                <ChevronRight size={15} className="text-stone-400 opacity-50" />
              </Link>
            ))
          )}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-stone-200 p-4 dark:border-white/10 bg-stone-50/60 dark:bg-[#1C1C1C]">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-stone-500">{t('langAndTheme')}</span>
            <div className="flex items-center gap-2">
              <LanguagePicker />
              <ThemeToggle />
            </div>
          </div>
          {isAuthenticated ? (
            <Link
              href={to('/profile')}
              onClick={() => setMobileOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white w-full"
            >
              <User size={16} />
              <span>{user?.name || 'Профиль'}</span>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={to('/login')}
                onClick={() => setMobileOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-750 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                <LogIn size={15} />
                {t('login')}
              </Link>
              <Link
                href={to('/register')}
                onClick={() => setMobileOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white"
              >
                <UserPlus size={15} />
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}