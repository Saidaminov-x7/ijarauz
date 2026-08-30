"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, X, Home, BookOpen, Building2, Heart, User, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { SearchInput } from '@/components/ui/SearchInput';
import { useAuthStore } from '@/store/useAuthStore';

interface MobileMenuProps {
  locale: string;
}

interface MenuItem {
  href?: string;
  icon: React.ComponentType<{ size: number }>;
  label: string;
  children?: MenuItem[];
}

export function MobileMenu({ locale }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const t = useTranslations('mobileMenu');

  const menuItems: MenuItem[] = [
    { href: '/', icon: Home, label: t('home') },
    {
      icon: Building2,
      label: t('catalog'),
      children: [
        { href: '/catalog', icon: Building2, label: t('allListings') },
        { href: '/catalog?type=apartment', icon: Home, label: t('apartments') },
        { href: '/catalog?type=house', icon: Home, label: t('houses') },
      ]
    },
    { href: '/about', icon: BookOpen, label: t('about') },
  ];

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(`/${locale}${path}`);
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 z-50 rounded-full bg-white p-2 shadow-md dark:bg-stone-800 md:hidden"
        aria-label={t('openMenu')}
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md">
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl dark:bg-stone-900">
                <div className="flex items-center justify-between p-4">
                  <div className="text-xl font-bold text-stone-900 dark:text-white" style={{ width: '96px', height: '32px' }}>
                    ijara.uz
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
                    aria-label={t('closeMenu')}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <SearchInput locale={locale} placeholder={t('searchPlaceholder')} isMobile={true} />
                </div>

                <div className="flex-1 px-4 py-2">
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <div key={item.label}>
                        {item.children ? (
                          <div>
                            <button
                              onClick={() => toggleExpand(item.label)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                            >
                              <div className="flex items-center gap-3">
                                <item.icon size={18} />
                                {item.label}
                              </div>
                              <ChevronDown size={16} className={`transition-transform ${expandedItems[item.label] ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedItems[item.label] && (
                              <div className="ml-4 mt-1 space-y-1 border-l border-stone-200 pl-4 dark:border-stone-700">
                                {item.children.map((child) => (
                                  <button
                                    key={child.label}
                                    onClick={() => child.href && handleNavigation(child.href)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
                                  >
                                    <child.icon size={16} />
                                    {child.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => item.href && handleNavigation(item.href)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                          >
                            <item.icon size={18} />
                            {item.label}
                          </button>
                        )}
                      </div>
                    ))}
                  </nav>
                </div>

                <div className="border-t border-stone-200 p-4 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <LanguageSwitcher locale={locale} />
                    <ThemeToggle />
                  </div>

                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => handleNavigation('/favorites')}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                    >
                      <Heart size={18} />
                      {t('favorites')}
                    </button>

                    <button
                      onClick={() => handleNavigation('/profile')}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                    >
                      <User size={18} />
                      {t('profile')}
                    </button>
                  </div>

                  <div className="mt-6 space-y-3">
                    {useAuthStore.getState().isAuthenticated ? (
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                      >
                        <User size={18} />
                        {t('profile')}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleNavigation('/login')}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                        >
                          <LogIn size={18} />
                          {t('login')}
                        </button>

                        <button
                          onClick={() => handleNavigation('/register')}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                        >
                          <UserPlus size={18} />
                          {t('register')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}