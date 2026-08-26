'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { useTranslations } from 'next-intl';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SmartSearchProps {
  locale: string;
  className?: string;
  placeholder?: string;
  isMobile?: boolean;
}

export function SmartSearch({
  locale,
  className = '',
  placeholder = 'Поиск...',
  isMobile = false
}: SmartSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Search');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebounce(query, 500);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (debouncedQuery) {
      router.push(`/${locale}/catalog?${createQueryString('q', debouncedQuery)}`);
    } else if (searchParams.has('q')) {
      // If query is empty but there's a search param, remove it
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      router.push(`/${locale}/catalog?${params.toString()}`);
    }
  }, [debouncedQuery, locale, router, createQueryString, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/catalog?${createQueryString('q', query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/${locale}/catalog?${params.toString()}`);
  };


  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-stone-200 bg-white px-4 py-2 pl-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-stone-700 dark:bg-stone-800 dark:text-white ${isMobile ? 'pr-10' : ''}`}
      />
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          aria-label={t('clearSearch')}
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}