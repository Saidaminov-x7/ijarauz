'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';

import { EmptyState } from './EmptyState';
import { ApartmentCard } from './ApartmentCard';
import { AmenitiesFilter } from './AmenitiesFilter';
import { Button } from '@/components/ui/Button';
import { getApartments } from '@/lib/api';
import { Apartment } from '@/types';

interface CatalogFiltersProps {
  locale: string;
  query?: string;
  filters?: any;
}

export function CatalogFilters({ locale, query }: CatalogFiltersProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<{
    priceRange: string;
    rooms: string;
    area: string;
    regionId: string;
  }>({
    priceRange: searchParams.get('priceRange') || '',
    rooms: searchParams.get('rooms') || '',
    area: searchParams.get('area') || '',
    regionId: searchParams.get('region') || '',
  });

  useEffect(() => {
    const fetchApartments = async () => {
      setIsLoading(true);
      try {
        const data = await getApartments(locale, query || '', filters);
        setApartments(data);
      } catch (error) {
        console.error('Failed to fetch apartments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApartments();
  }, [locale, query, filters]);


  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    router.push(`/${locale}/catalog?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setFilters({
      priceRange: '',
      rooms: '',
      area: '',
      regionId: '',
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete('priceRange');
    params.delete('rooms');
    params.delete('area');
    params.delete('region');

    router.push(`/${locale}/catalog?${params.toString()}`);
  };

  if (isLoading) {
    return null; // Loading is handled by the loading.tsx file
  }

  if (apartments.length === 0 && query) {
    return <EmptyState query={query} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          <Filter size={16} />
          {t('filters')}
          {Object.values(filters).some(Boolean) && (
            <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-600 dark:bg-teal-900 dark:text-teal-400">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
        
        {Object.values(filters).some(Boolean) && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
          >
            <X size={16} className="mr-2" />
            {t('resetFilters')}
          </Button>
        )}
      </div>

      {filtersOpen && (
        <div className="mb-8 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
                {t('priceRange')}
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-white"
              >
                <option value="">{t('any')}</option>
                <option value="0-500">0 - 500 $</option>
                <option value="500-1000">500 - 1000 $</option>
                <option value="1000-1500">1000 - 1500 $</option>
                <option value="1500+">1500 $ +</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
                {t('rooms')}
              </label>
              <select
                value={filters.rooms}
                onChange={(e) => handleFilterChange('rooms', e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-white"
              >
                <option value="">{t('any')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
                Регион
              </label>
              <select
                value={filters.regionId}
                onChange={(e) => handleFilterChange('regionId', e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900 dark:text-white"
              >
                <option value="">{t('any')}</option>
                <option value="tashkent">Ташкент</option>
                <option value="samarkand">Самарканд</option>
                <option value="bukhara">Бухара</option>
                <option value="khiva">Хива</option>
                <option value="fergana">Фергана</option>
                <option value="namangan">Наманган</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
              Удобства
            </label>
            <AmenitiesFilter
              selected={searchParams.get('amenities')?.split(',').filter(Boolean) || []}
              onChange={(amenities) => {
                const params = new URLSearchParams(searchParams.toString());
                if (amenities.length > 0) {
                  params.set('amenities', amenities.join(','));
                } else {
                  params.delete('amenities');
                }
                router.push(`/${locale}/catalog?${params.toString()}`);
              }}
            />
          </div>
        </div>
      )}

      {apartments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {apartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-stone-500 dark:text-stone-400">
          {t('noApartments')}
        </div>
      )}
    </div>
  );
}